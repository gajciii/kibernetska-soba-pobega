import pg from 'pg';
import { randomUUID } from 'node:crypto';
import type { LeaderboardEntry, LeaderboardResponse, SessionView } from '../shared/types.js';

export interface SessionRow { token_hash: string; csrf: string; progress: SessionView | null; expires_at: Date; run_id: string | null }

export function normalizeTeamName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const name = value.trim();
  return name.length > 0 && name.length <= 60 && /[\p{L}\p{N}\p{P}\p{S}]/u.test(name) && !/\p{Cc}/u.test(name) ? name : undefined;
}

async function syncLeaderboard(client: pg.PoolClient, row: SessionRow) {
  const progress = row.progress;
  const name = normalizeTeamName(progress?.teamName);
  if (!progress || !name) return;
  row.run_id ??= randomUUID();
  progress.leaderboardId = row.run_id;
  await client.query(`INSERT INTO leaderboard_runs (id,team_name,started_at,completed_at,solved_count,hint_count)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO UPDATE SET team_name=EXCLUDED.team_name,
      started_at=EXCLUDED.started_at, completed_at=EXCLUDED.completed_at,
      solved_count=EXCLUDED.solved_count, hint_count=EXCLUDED.hint_count, updated_at=now()
    WHERE leaderboard_runs.completed_at IS NULL`,
  [row.run_id, name, progress.startedAt, progress.completedAt, progress.solved.length, progress.hintCount]);
}

export async function openDatabase(connectionString: string, schema?: string) {
  if (schema && !/^test_[a-f0-9]+$/.test(schema)) throw new Error('Neveljavna testna shema.');
  const pool = new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 5000, ...(schema ? { options: `-c search_path=${schema}` } : {}) });
  pool.on('error', () => console.error('Povezava z bazo je bila prekinjena.'));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(4042026)');
    if (schema) await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query('CREATE TABLE IF NOT EXISTS schema_version (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const versions = await client.query<{ version: number }>('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1');
    const version = versions.rows[0]?.version ?? 0;
    if (version > 2) throw new Error('Baza zahteva novejšo različico aplikacije.');
    if (version < 1) {
      await client.query(`CREATE TABLE game_sessions (
        token_hash char(64) PRIMARY KEY, csrf char(64) NOT NULL,
        progress jsonb, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
      )`);
      await client.query('CREATE INDEX game_sessions_expiry ON game_sessions(expires_at)');
      await client.query('INSERT INTO schema_version(version) VALUES (1)');
    }
    if (version < 2) {
      await client.query(`CREATE TABLE leaderboard_runs (
        id uuid PRIMARY KEY, team_name text NOT NULL,
        started_at timestamptz NOT NULL, completed_at timestamptz,
        solved_count smallint NOT NULL CHECK (solved_count BETWEEN 0 AND 8),
        hint_count integer NOT NULL CHECK (hint_count >= 0),
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      )`);
      await client.query('CREATE INDEX leaderboard_runs_score ON leaderboard_runs(solved_count DESC,hint_count,started_at)');
      // Seja kaže na javni rezultat; brisanje ali iztek seje ne izbriše rezultata.
      await client.query('ALTER TABLE game_sessions ADD COLUMN run_id uuid UNIQUE REFERENCES leaderboard_runs(id)');
      const sessions = await client.query<SessionRow>('SELECT * FROM game_sessions WHERE progress IS NOT NULL');
      for (const row of sessions.rows) {
        await syncLeaderboard(client, row);
        if (row.run_id) await client.query('UPDATE game_sessions SET progress=$1,run_id=$2 WHERE token_hash=$3', [JSON.stringify(row.progress), row.run_id, row.token_hash]);
      }
      await client.query('INSERT INTO schema_version(version) VALUES (2)');
    }
    await client.query('DELETE FROM game_sessions WHERE expires_at < now()');
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); client.release(); await pool.end(); throw error; }
  client.release();
  return pool;
}

export async function changeSession<T>(pool: pg.Pool, hash: string, change: (row: SessionRow) => T): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<SessionRow>('SELECT * FROM game_sessions WHERE token_hash=$1 AND expires_at > now() FOR UPDATE', [hash]);
    const row = result.rows[0];
    if (!row) throw new Error('Seja ni več na voljo. Osveži stran.');
    const response = change(row);
    await syncLeaderboard(client, row);
    await client.query('UPDATE game_sessions SET progress=$1,run_id=$2 WHERE token_hash=$3', [row.progress ? JSON.stringify(row.progress) : null, row.run_id, hash]);
    await client.query('COMMIT');
    return response;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

interface RankedRun {
  id: string; team_name: string; solved_count: number; hint_count: number;
  elapsed_seconds: number; completed: boolean; is_current: boolean;
  rank: number; position: number; total: number;
}

export async function readLeaderboard(pool: pg.Pool, tokenHash?: string): Promise<LeaderboardResponse> {
  const updatedAt = new Date().toISOString();
  const result = await pool.query<RankedRun>(`WITH scores AS (
      SELECT id,team_name,solved_count,hint_count,started_at,completed_at IS NOT NULL AS completed,
        GREATEST(0,FLOOR(EXTRACT(EPOCH FROM (COALESCE(completed_at,$1::timestamptz)-started_at))))::integer AS elapsed_seconds,
        COALESCE(id=(SELECT run_id FROM game_sessions WHERE token_hash=$2 AND expires_at>$1::timestamptz),false) AS is_current
      FROM leaderboard_runs
    ), ranked AS (
      SELECT *, RANK() OVER (ORDER BY solved_count DESC,hint_count,elapsed_seconds)::integer AS rank,
        ROW_NUMBER() OVER (ORDER BY solved_count DESC,hint_count,elapsed_seconds,started_at,id)::integer AS position,
        COUNT(*) OVER ()::integer AS total
      FROM scores
    ) SELECT * FROM ranked WHERE position<=100 OR is_current ORDER BY position`, [updatedAt, tokenHash ?? null]);
  const entry = (row: RankedRun): LeaderboardEntry => ({
    id: row.id, rank: row.rank, teamName: row.team_name, solvedCount: row.solved_count,
    hintCount: row.hint_count, elapsedSeconds: row.elapsed_seconds, completed: row.completed, isCurrent: row.is_current,
  });
  return {
    entries: result.rows.filter(row => row.position <= 100).map(entry),
    currentEntry: result.rows.find(row => row.is_current) ? entry(result.rows.find(row => row.is_current)!) : null,
    total: result.rows[0]?.total ?? 0,
    updatedAt,
  };
}
