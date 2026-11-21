import { createHash, randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../server/app.js';
import { openDatabase } from '../server/db.js';
import type { AppConfig } from '../server/config.js';
import type { LeaderboardResponse, SessionView } from '../shared/types.js';

const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://operacija404@127.0.0.1:55432/operacija404_test';
const schema = `test_${randomBytes(8).toString('hex')}`;
const config: AppConfig = { databaseUrl, origin: 'http://localhost:5173', port: 3000, host: '127.0.0.1', production: false, secureCookie: false, trustProxy: 0, ttlDays: 180 };
let pool: pg.Pool;
let app: ReturnType<typeof createApp>;
let clock: number;
type Team = { agent: ReturnType<typeof request.agent>; csrf: string; cookie: string };
const answers: unknown[] = ['MOST', 'SOVA', { message: 'B', reasons: ['domain', 'link'] }, { recommendations: ['long', 'unique', 'manager', 'mfa'] }, '10:42', 'ucenec17', { sourceId: 'C', domain: 'arhiv-nacrtov.example' }, 'ISKRA'];

async function anonymous(): Promise<Team> {
  const agent = request.agent(app);
  const response = await agent.get('/api/session').expect(200);
  return { agent, csrf: response.body.csrfToken, cookie: (response.headers['set-cookie'] as unknown as string[])[0].split(';')[0] };
}
const post = (team: Team, path: string, body: object) => team.agent.post(path).set('Origin', config.origin).set('X-CSRF-Token', team.csrf).send(body);
async function start(name: string) {
  const team = await anonymous();
  await post(team, '/api/session', { teamName: name }).expect(200);
  return team;
}
async function solveThrough(team: Team, end: number) {
  for (let id = 1; id <= end; id++) {
    if (id === 4) await post(team, '/api/stages/4/answer', { answer: 'luna2009' }).expect(200);
    const response = await post(team, `/api/stages/${id}/answer`, { answer: answers[id - 1] }).expect(200);
    expect(response.body.correct).toBe(true);
  }
}
async function leaderboard(team?: Team): Promise<LeaderboardResponse> {
  const response = await (team ? team.agent : request(app)).get('/api/leaderboard').expect(200);
  return response.body;
}

beforeAll(async () => { pool = await openDatabase(databaseUrl, schema); app = createApp(pool, config); });
beforeEach(async () => {
  // Obe tabeli sta v edinstveni testni shemi, ne v deljeni aplikacijski shemi.
  await pool.query('TRUNCATE game_sessions,leaderboard_runs');
  clock = Date.now();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(clock);
});
afterEach(() => { vi.useRealTimers(); });
afterAll(async () => {
  if (pool) {
    try { await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); }
    finally { await pool.end(); }
  }
});

describe('trajna skupna lestvica', () => {
  it('je javna, ne ustvari seje in objavi samo varen prikaz rezultatov', async () => {
    const empty = await request(app).get('/api/leaderboard').expect(200);
    expect(empty.body).toEqual({ entries: [], currentEntry: null, total: 0, updatedAt: new Date(clock).toISOString() });
    expect(empty.headers['cache-control']).toBe('no-store');
    expect(empty.headers['set-cookie']).toBeUndefined();
    expect((await pool.query('SELECT count(*)::integer AS n FROM game_sessions')).rows[0].n).toBe(0);
    const team = await anonymous();
    const startResponse = await post(team, '/api/session', {
      teamName: '  <b>Skupina</b>  ', solved: [1, 2, 3, 4, 5, 6, 7, 8], hintCount: -10,
      startedAt: '2000-01-01T00:00:00Z', completedAt: new Date(clock).toISOString(), leaderboardId: randomUUID(),
    }).expect(200);
    const board = await leaderboard(team);
    expect(board.total).toBe(1);
    expect(board.currentEntry).toEqual({ id: startResponse.body.session.leaderboardId, rank: 1, teamName: '<b>Skupina</b>', solvedCount: 0, hintCount: 0, elapsedSeconds: 0, completed: false, isCurrent: true });
    expect(board.currentEntry!.id).toMatch(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u);
    expect(Object.keys(board.entries[0]).sort()).toEqual(['completed', 'elapsedSeconds', 'hintCount', 'id', 'isCurrent', 'rank', 'solvedCount', 'teamName'].sort());
    const publicBoard = await request(app).get('/api/leaderboard').set('Cookie', 'operacija404=neveljavno').expect(200);
    expect(publicBoard.body.currentEntry).toBeNull();
    expect(publicBoard.body.entries[0].isCurrent).toBe(false);
    for (const secret of [team.csrf, team.cookie.split('=')[1], createHash('sha256').update(team.cookie.split('=')[1]).digest('hex'), 'token_hash', 'csrf', 'answers', 'SOVA', 'ISKRA']) {
      expect(JSON.stringify(publicBoard.body)).not.toContain(secret);
    }
  });

  it('razvrsti po napredku, namigih in času ter deli mesto pri enakih metrikah', async () => {
    const hinted = await start('Dve z namigom');
    await post(hinted, '/api/stages/1/hints', { index: 1 }).expect(200);
    await solveThrough(hinted, 2);
    vi.setSystemTime(clock + 100_000);
    const lower = await start('Ena brez namiga');
    await solveThrough(lower, 1);
    vi.setSystemTime(clock + 200_000);
    const slower = await start('Dve počasneje');
    await solveThrough(slower, 2);
    vi.setSystemTime(clock + 300_000);
    const fast = await start('Dve hitreje');
    const tied = await start('Dve enako hitro');
    await solveThrough(fast, 2);
    await solveThrough(tied, 2);
    vi.setSystemTime(clock + 400_000);
    const board = await leaderboard(fast);
    expect(board.entries.map(entry => entry.rank)).toEqual([1, 1, 3, 4, 5]);
    expect(board.entries.slice(0, 2).map(entry => entry.teamName).sort()).toEqual(['Dve enako hitro', 'Dve hitreje']);
    expect(board.entries.slice(0, 2).map(entry => entry.id)).toEqual(board.entries.slice(0, 2).map(entry => entry.id).sort());
    expect(board.entries.slice(2).map(entry => entry.teamName)).toEqual(['Dve počasneje', 'Dve z namigom', 'Ena brez namiga']);
    expect(board.entries.map(entry => entry.elapsedSeconds)).toEqual([100, 100, 200, 400, 300]);
    expect(board.currentEntry!.teamName).toBe('Dve hitreje');
    expect((await leaderboard()).entries.every(entry => !entry.isCurrent)).toBe(true);
  });

  it('zamrzne dokončan rezultat, učno razkrivanje namigov po rešitvi pa ga ne poslabša', async () => {
    const team = await start('Zaključena skupina');
    await post(team, '/api/stages/1/hints', { index: 1 }).expect(200);
    await solveThrough(team, 1);
    const learned = await post(team, '/api/stages/1/hints', { index: 2 }).expect(200);
    expect(learned.body.hints).toHaveLength(2);
    expect(learned.body.session.hintCount).toBe(1);
    expect((await leaderboard(team)).currentEntry!.hintCount).toBe(1);
    vi.setSystemTime(clock + 65_000);
    await solveThrough(team, 8);
    const completed = (await leaderboard(team)).currentEntry!;
    expect(completed).toMatchObject({ solvedCount: 8, hintCount: 1, elapsedSeconds: 65, completed: true });
    vi.setSystemTime(clock + 3_600_000);
    await post(team, '/api/stages/8/hints', { index: 1 }).expect(200);
    const duplicates = await Promise.all([
      post(team, '/api/stages/8/answer', { answer: 'ISKRA' }),
      post(team, '/api/stages/8/answer', { answer: 'iskra' }),
    ]);
    expect(duplicates.every(response => response.status === 200 && response.body.correct)).toBe(true);
    expect((await leaderboard(team)).currentEntry).toEqual(completed);
    expect((await pool.query('SELECT count(*)::integer AS n FROM leaderboard_runs')).rows[0].n).toBe(1);
  });

  it('ohrani stare rezultate po resetu in izteku seje ter za nov začetek ustvari drug UUID', async () => {
    const team = await start('Prvi poskus');
    await solveThrough(team, 1);
    const other = await start('Druga skupina');
    await solveThrough(other, 2);
    const old = (await leaderboard(team)).currentEntry!;
    const reset = await post(team, '/api/reset', {}).expect(200);
    team.csrf = reset.body.csrfToken;
    team.cookie = (reset.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
    expect((await leaderboard(team)).currentEntry).toBeNull();
    expect((await leaderboard()).total).toBe(2);
    const fresh = await post(team, '/api/session', { teamName: 'Nov poskus' }).expect(200);
    expect(fresh.body.session.leaderboardId).not.toBe(old.id);
    expect((await leaderboard()).total).toBe(3);
    expect((await leaderboard()).entries.find(entry => entry.id === old.id)?.solvedCount).toBe(1);
    const otherHash = createHash('sha256').update(other.cookie.split('=')[1]).digest('hex');
    await pool.query("UPDATE game_sessions SET expires_at=now()-interval '1 second' WHERE token_hash=$1", [otherHash]);
    await pool.end();
    pool = await openDatabase(databaseUrl, schema);
    app = createApp(pool, config);
    const afterRestart = await request(app).get('/api/leaderboard').set('Cookie', other.cookie).expect(200);
    expect(afterRestart.body.currentEntry).toBeNull();
    expect(afterRestart.body.total).toBe(3);
    expect(afterRestart.body.entries.find((entry: { teamName: string }) => entry.teamName === 'Druga skupina').solvedCount).toBe(2);
    expect((await pool.query('SELECT count(*)::integer AS n FROM game_sessions WHERE token_hash=$1', [otherHash])).rows[0].n).toBe(0);
  });

  it('stari prazni seji omogoči obvezno poimenovanje brez izgube napredka', async () => {
    const team = await anonymous();
    const progress: SessionView = { teamName: '', startedAt: new Date(clock - 90_000).toISOString(), completedAt: null, solved: [1, 2], attempts: { 1: 2, 2: 1 }, hints: { 1: [1] }, currentStage: 3, hintCount: 1 };
    const tokenHash = createHash('sha256').update(team.cookie.split('=')[1]).digest('hex');
    await pool.query('UPDATE game_sessions SET progress=$1 WHERE token_hash=$2', [JSON.stringify(progress), tokenHash]);
    await team.agent.get('/api/stages/3').expect(409);
    await team.agent.get('/api/finale').expect(409);
    await post(team, '/api/stages/3/answer', { answer: answers[2] }).expect(409);
    await post(team, '/api/stages/3/hints', { index: 1 }).expect(409);
    expect((await leaderboard()).total).toBe(0);
    const named = await post(team, '/api/session', { teamName: '  Stara skupina  ' }).expect(200);
    expect(named.body.session).toMatchObject({ ...progress, teamName: 'Stara skupina' });
    expect(named.body.session.leaderboardId).toBeTruthy();
    expect((await leaderboard(team)).currentEntry).toMatchObject({ teamName: 'Stara skupina', solvedCount: 2, hintCount: 1, elapsedSeconds: 90 });
    await team.agent.get('/api/stages/3').expect(200);
    await post(team, '/api/session', { teamName: 'Drugo ime' }).expect(200);
    expect((await leaderboard(team)).currentEntry!.teamName).toBe('Stara skupina');
  });

  it('omeji javni seznam na sto in vrne lastno uvrstitev tudi zunaj njega', async () => {
    const ids = Array.from({ length: 101 }, () => randomUUID());
    await pool.query(`INSERT INTO leaderboard_runs(id,team_name,started_at,solved_count,hint_count)
      SELECT id,name,$3::timestamptz,1,0 FROM unnest($1::uuid[],$2::text[]) AS data(id,name)`,
    [ids, ids.map((_, index) => `Predhodna skupina ${index + 1}`), new Date(clock).toISOString()]);
    const team = await start('Trenutna skupina');
    const board = await leaderboard(team);
    expect(board.total).toBe(102);
    expect(board.entries).toHaveLength(100);
    expect(board.entries.every(entry => entry.solvedCount === 1 && !entry.isCurrent)).toBe(true);
    expect(board.currentEntry).toMatchObject({ teamName: 'Trenutna skupina', rank: 102, solvedCount: 0, isCurrent: true });
    expect(board.entries.some(entry => entry.id === board.currentEntry!.id)).toBe(false);
  });

  it('migrira v1 brez izgube sej in backfill naredi samo enkrat, tudi za rezultat potekle seje', async () => {
    const legacySchema = `test_${randomBytes(8).toString('hex')}`;
    const raw = new pg.Pool({ connectionString: databaseUrl, options: `-c search_path=${legacySchema}` });
    const named: SessionView = { teamName: 'Stara imenovana skupina', startedAt: new Date(clock - 200_000).toISOString(), completedAt: null, solved: [1, 2], attempts: { 1: 1, 2: 1 }, hints: {}, currentStage: 3, hintCount: 0 };
    const blank = { ...named, teamName: '' };
    const completed = { ...named, teamName: 'Stara zaključena skupina', solved: [1, 2, 3, 4, 5, 6, 7, 8], currentStage: 8, completedAt: new Date(clock - 100_000).toISOString() };
    const hashes = ['1', '2', '3'].map(value => value.repeat(64));
    let migrated: pg.Pool | undefined;
    try {
      await raw.query(`CREATE SCHEMA "${legacySchema}"`);
      await raw.query('CREATE TABLE schema_version(version integer PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
      await raw.query('INSERT INTO schema_version(version) VALUES (1)');
      await raw.query('CREATE TABLE game_sessions(token_hash char(64) PRIMARY KEY,csrf char(64) NOT NULL,progress jsonb,created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL)');
      for (const [index, progress] of [named, blank, completed].entries()) {
        await raw.query("INSERT INTO game_sessions(token_hash,csrf,progress,expires_at) VALUES($1,$2,$3,now()+$4::interval)", [hashes[index], 'c'.repeat(64), JSON.stringify(progress), index === 2 ? '-1 day' : '1 day']);
      }
      await raw.end();
      migrated = await openDatabase(databaseUrl, legacySchema);
      const versions = await migrated.query('SELECT version FROM schema_version ORDER BY version');
      expect(versions.rows.map(row => row.version)).toEqual([1, 2]);
      const sessions = await migrated.query('SELECT * FROM game_sessions ORDER BY token_hash');
      expect(sessions.rows).toHaveLength(2);
      expect(sessions.rows[0].progress).toMatchObject(named);
      expect(sessions.rows[0].progress.leaderboardId).toBe(sessions.rows[0].run_id);
      expect(sessions.rows[1].progress).toEqual(blank);
      expect(sessions.rows[1].run_id).toBeNull();
      const oldId = sessions.rows[0].run_id;
      const runs = await migrated.query('SELECT * FROM leaderboard_runs ORDER BY completed_at NULLS LAST');
      expect(runs.rows).toHaveLength(2);
      expect(runs.rows[0]).toMatchObject({ team_name: completed.teamName, solved_count: 8, hint_count: 0 });
      await migrated.end();
      migrated = await openDatabase(databaseUrl, legacySchema);
      expect((await migrated.query('SELECT count(*)::integer AS n FROM leaderboard_runs')).rows[0].n).toBe(2);
      expect((await migrated.query('SELECT run_id FROM game_sessions WHERE token_hash=$1', [hashes[0]])).rows[0].run_id).toBe(oldId);
    } finally {
      if (!raw.ended) await raw.end();
      if (migrated) await migrated.end();
      await pool.query(`DROP SCHEMA IF EXISTS "${legacySchema}" CASCADE`);
    }
  });
});
