import pg from 'pg';
import type { SessionView } from '../shared/types.js';

export interface SessionRow { token_hash: string; csrf: string; progress: SessionView | null; expires_at: Date }
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
    if (versions.rows[0] && versions.rows[0].version > 1) throw new Error('Baza zahteva novejšo različico aplikacije.');
    if (!versions.rows.length) {
      await client.query(`CREATE TABLE game_sessions (
        token_hash char(64) PRIMARY KEY, csrf char(64) NOT NULL,
        progress jsonb, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
      )`);
      await client.query('CREATE INDEX game_sessions_expiry ON game_sessions(expires_at)');
      await client.query('INSERT INTO schema_version(version) VALUES (1)');
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
    if (!row) throw new Error('Seja ni več na voljo. Osvežite stran.');
    const response = change(row);
    await client.query('UPDATE game_sessions SET progress=$1 WHERE token_hash=$2', [row.progress ? JSON.stringify(row.progress) : null, hash]);
    await client.query('COMMIT');
    return response;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
