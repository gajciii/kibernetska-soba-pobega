import { createHash, randomBytes } from 'node:crypto';
import type pg from 'pg';
import request, { type Response } from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.js';
import { openDatabase } from '../server/db.js';
import type { AppConfig } from '../server/config.js';

const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://operacija404@127.0.0.1:55432/operacija404_test';
const schema = `test_${randomBytes(8).toString('hex')}`;
const config: AppConfig = { databaseUrl, origin: 'http://localhost:5173', port: 3000, host: '127.0.0.1', production: false, secureCookie: false, trustProxy: 0, ttlDays: 180 };
type App = ReturnType<typeof createApp>;
type Browser = { cookie: string; csrf: string };
let pool: pg.Pool;
let secondPool: pg.Pool;
let apps: App[];
let clock: number;
const cookie = (response: Response) => (response.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
const browserFrom = (response: Response): Browser => ({ cookie: cookie(response), csrf: response.body.csrfToken });
const hash = (browser: Browser) => createHash('sha256').update(browser.cookie.split('=')[1]).digest('hex');
const post = (browser: Browser, path: string, body: object, app = apps[0]) => request(app).post(path).set('Cookie', browser.cookie).set('Origin', config.origin).set('X-CSRF-Token', browser.csrf).send(body);
const start = (browser: Browser, app = apps[0]) => post(browser, '/api/session', { teamName: 'Preiskovalci' }, app);
async function anonymous(app = apps[0]) { return browserFrom(await request(app).get('/api/session').expect(200)); }
async function counts() {
  return (await pool.query('SELECT (SELECT count(*)::int FROM game_sessions) AS sessions,(SELECT count(*)::int FROM leaderboard_runs) AS runs')).rows[0];
}
function retry(response: Response, seconds: number) {
  expect(response.status).toBe(429);
  expect(response.headers['retry-after']).toBe(String(seconds));
  expect(response.body).toEqual({ error: expect.any(String), retryAfterSeconds: seconds });
  expect(response.headers['set-cookie']).toBeUndefined();
}

beforeAll(async () => {
  pool = await openDatabase(databaseUrl, schema);
  secondPool = await openDatabase(databaseUrl, schema);
  apps = [createApp(pool, config, () => clock), createApp(secondPool, config, () => clock)];
});
beforeEach(async () => {
  clock = Date.now();
  await pool.query('TRUNCATE game_sessions,leaderboard_runs,request_limits');
});
afterAll(async () => {
  if (secondPool) await secondPool.end();
  if (pool) {
    try { await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); }
    finally { await pool.end(); }
  }
});

describe('trajne omejitve novih sej in iger', () => {
  it('sto hkratnih začetkov iste seje ustvari eno igro in porabi eno mesto v omejitvi', async () => {
    const browser = await anonymous();
    const responses = await Promise.all(Array.from({ length: 100 }, (_, index) => start(browser, apps[index % 2])));
    expect(responses.every(response => response.status === 200)).toBe(true);
    expect(new Set(responses.map(response => response.body.session.leaderboardId)).size).toBe(1);
    expect(new Set(responses.map(response => response.body.session.startedAt))).toEqual(new Set([new Date(clock).toISOString()]));
    expect(responses.every(response => response.body.nextStartAt === new Date(clock + 60_000).toISOString())).toBe(true);
    expect(await counts()).toEqual({ sessions: 1, runs: 1 });
    expect((await pool.query("SELECT cardinality(accepted_at_ms) AS n FROM request_limits WHERE action='start'")).rows[0].n).toBe(1);
    const answer = await post(browser, '/api/stages/1/answer', { answer: 'MOST' }).expect(200);
    expect(answer.body.correct).toBe(true);
    const repeated = await start(browser).expect(200);
    expect(repeated.body.session.solved).toEqual([1]);
    expect(repeated.body.session.attempts).toEqual({ 1: 1 });
  });

  it('sočasni reset ustvari eno nadomestno sejo, prenese rok in ga ohrani po ponovnem zagonu', async () => {
    const browser = await anonymous();
    const started = await start(browser).expect(200);
    const responses = await Promise.all(Array.from({ length: 100 }, (_, index) => post(browser, '/api/reset', {}, apps[index % 2])));
    const success = responses.filter(response => response.status === 200);
    expect(success).toHaveLength(1);
    expect(responses.filter(response => response.status !== 200).every(response => [401, 409].includes(response.status) && response.headers['set-cookie'] === undefined)).toBe(true);
    expect(await counts()).toEqual({ sessions: 1, runs: 1 });
    expect((await pool.query('SELECT token_hash FROM game_sessions WHERE token_hash=$1', [hash(browser)])).rowCount).toBe(0);
    expect(success[0].body.session).toBeNull();
    expect(success[0].body.nextStartAt).toBe(started.body.nextStartAt);
    const fresh = browserFrom(success[0]);
    expect(fresh.cookie).not.toBe(browser.cookie);
    const repeated = await Promise.all(Array.from({ length: 20 }, (_, index) => post(fresh, '/api/reset', {}, apps[index % 2])));
    expect(repeated.every(response => response.status === 200 && response.headers['set-cookie'] === undefined && response.body.csrfToken === fresh.csrf && response.body.nextStartAt === started.body.nextStartAt)).toBe(true);
    expect(await counts()).toEqual({ sessions: 1, runs: 1 });
    await secondPool.end();
    secondPool = await openDatabase(databaseUrl, schema);
    apps[1] = createApp(secondPool, config, () => clock);
    const resumed = await request(apps[1]).get('/api/session').set('Cookie', fresh.cookie).expect(200);
    expect(resumed.body.nextStartAt).toBe(started.body.nextStartAt);
    retry(await start(fresh, apps[1]), 60);
    clock += 59_999;
    retry(await start(fresh), 1);
    expect(await counts()).toEqual({ sessions: 1, runs: 1 });
    clock += 1;
    const next = await start(fresh, apps[1]).expect(200);
    expect(next.body.session.leaderboardId).not.toBe(started.body.session.leaderboardId);
    expect(next.body.nextStartAt).toBe(new Date(clock + 60_000).toISOString());
    expect(await counts()).toEqual({ sessions: 1, runs: 2 });
  });

  it('sto anonimnih zahtev prek dveh aplikacij sprejme največ šestdeset, ne zaupa poljubnemu X-Forwarded-For', async () => {
    const responses = await Promise.all(Array.from({ length: 100 }, (_, index) => request(apps[index % 2]).get('/api/session').set('X-Forwarded-For', `192.0.2.${index + 1}`)));
    expect(responses.filter(response => response.status === 200)).toHaveLength(60);
    const denied = responses.filter(response => response.status === 429);
    expect(denied).toHaveLength(40);
    denied.forEach(response => retry(response, 60));
    expect(await counts()).toEqual({ sessions: 60, runs: 0 });
    const limits = (await pool.query('SELECT * FROM request_limits')).rows;
    expect(limits).toHaveLength(1);
    expect(limits[0].ip_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(JSON.stringify(limits)).not.toMatch(/192\.0\.2|127\.0\.0\.1|::1/u);
    const browsers = responses.filter(response => response.status === 200).map(browserFrom);
    const starts = await Promise.all(browsers.map((browser, index) => start(browser, apps[index % 2])));
    expect(starts.every(response => response.status === 200)).toBe(true);
    expect(await counts()).toEqual({ sessions: 60, runs: 60 });
    await request(apps[1]).get('/api/session').set('Cookie', browsers[0].cookie).expect(200);
    await start(browsers[0]).expect(200);
    await request(apps[0]).get('/api/leaderboard').expect(200);
    await request(apps[0]).get('/api/health').expect(200);
    clock += 59_999;
    retry(await request(apps[1]).get('/api/session'), 1);
    clock += 1;
    await anonymous(apps[1]);
  });

  it('omeji nove igre tudi za sto prej ustvarjenih piškotkov, brez omejitve obstoječega napredka', async () => {
    const browsers = await Promise.all(Array.from({ length: 60 }, (_, index) => anonymous(apps[index % 2])));
    clock += 60_000;
    browsers.push(...await Promise.all(Array.from({ length: 40 }, (_, index) => anonymous(apps[index % 2]))));
    const responses = await Promise.all(browsers.map((browser, index) => start(browser, apps[index % 2])));
    expect(responses.filter(response => response.status === 200)).toHaveLength(60);
    expect(responses.filter(response => response.status === 429)).toHaveLength(40);
    responses.filter(response => response.status === 429).forEach(response => retry(response, 60));
    expect(await counts()).toEqual({ sessions: 100, runs: 60 });
    const active = browsers[responses.findIndex(response => response.status === 200)];
    const waiting = browsers[responses.findIndex(response => response.status === 429)];
    await start(active).expect(200);
    const hint = await post(active, '/api/stages/1/hints', { index: 1 }).expect(200);
    expect(hint.body.session.hintCount).toBe(1);
    expect((await post(active, '/api/stages/1/answer', { answer: 'MOST' }).expect(200)).body.correct).toBe(true);
    const pending = await request(apps[0]).get('/api/session').set('Cookie', waiting.cookie).expect(200);
    expect(pending.body.session).toBeNull();
    expect(pending.body.nextStartAt).toBeNull();
    clock += 60_000;
    await start(waiting, apps[1]).expect(200);
    expect(await counts()).toEqual({ sessions: 100, runs: 61 });
  });

  it('uporablja drseče šestdesetsekundno okno namesto koledarske minute', async () => {
    await Promise.all(Array.from({ length: 30 }, () => anonymous()));
    clock += 30_000;
    await Promise.all(Array.from({ length: 30 }, () => anonymous(apps[1])));
    retry(await request(apps[0]).get('/api/session'), 30);
    clock += 30_000;
    const responses = await Promise.all(Array.from({ length: 40 }, (_, index) => request(apps[index % 2]).get('/api/session')));
    expect(responses.filter(response => response.status === 200)).toHaveLength(30);
    expect(responses.filter(response => response.status === 429)).toHaveLength(10);
    responses.filter(response => response.status === 429).forEach(response => retry(response, 30));
  });

  it('upošteva izrecno konfiguriran zaupanja vreden proxy in hrani le hash naslova', async () => {
    const proxyApp = createApp(pool, { ...config, trustProxy: 1 }, () => clock);
    for (const ip of ['192.0.2.10', '192.0.2.11']) await request(proxyApp).get('/api/session').set('X-Forwarded-For', ip).expect(200);
    const hashes = (await pool.query('SELECT ip_hash FROM request_limits ORDER BY ip_hash')).rows.map(row => row.ip_hash);
    expect(hashes).toEqual(['192.0.2.10', '192.0.2.11'].map(ip => createHash('sha256').update(`ip:${ip}`).digest('hex')).sort());
  });

  it('dopolni ime stare igre brez novega začetka tudi med izčrpano omejitvijo', async () => {
    const browser = await anonymous();
    const response = await start(browser).expect(200);
    await post(browser, '/api/stages/1/answer', { answer: 'MOST' }).expect(200);
    await pool.query("UPDATE game_sessions SET progress=jsonb_set(progress,'{teamName}','\"\"') WHERE token_hash=$1", [hash(browser)]);
    await pool.query("UPDATE request_limits SET accepted_at_ms=$1 WHERE action='start'", [Array(60).fill(clock)]);
    const named = await post(browser, '/api/session', { teamName: 'Dopolnjeno ime' }).expect(200);
    expect(named.body.session).toMatchObject({ teamName: 'Dopolnjeno ime', solved: [1], attempts: { 1: 1 }, startedAt: response.body.session.startedAt, leaderboardId: response.body.session.leaderboardId });
    expect(named.body.nextStartAt).toBe(response.body.nextStartAt);
    expect(await counts()).toEqual({ sessions: 1, runs: 1 });
  });

  it('migrira v2 enkrat ob sočasnih zagonih in ohrani sejo, rezultat ter čas začetka', async () => {
    const browser = await anonymous();
    const started = await start(browser).expect(200);
    await post(browser, '/api/stages/1/answer', { answer: 'MOST' }).expect(200);
    const before = (await pool.query('SELECT progress,run_id,csrf,expires_at FROM game_sessions WHERE token_hash=$1', [hash(browser)])).rows[0];
    const score = (await pool.query('SELECT * FROM leaderboard_runs')).rows[0];
    // Samo izolirana testna shema predstavlja bazo pred novo migracijo.
    await pool.query('DROP TABLE request_limits');
    await pool.query('ALTER TABLE game_sessions DROP COLUMN next_start_at');
    await pool.query('DELETE FROM schema_version WHERE version=3');
    const reopened = await Promise.all([openDatabase(databaseUrl, schema), openDatabase(databaseUrl, schema)]);
    try {
      expect((await reopened[0].query('SELECT version FROM schema_version ORDER BY version')).rows.map(row => row.version)).toEqual([1, 2, 3]);
      expect((await reopened[1].query('SELECT progress,run_id,csrf,expires_at FROM game_sessions WHERE token_hash=$1', [hash(browser)])).rows[0]).toEqual(before);
      expect((await reopened[1].query('SELECT * FROM leaderboard_runs')).rows[0]).toEqual(score);
      const migratedApp = createApp(reopened[0], config, () => clock);
      const boot = await request(migratedApp).get('/api/session').set('Cookie', browser.cookie).expect(200);
      expect(boot.body.nextStartAt).toBe(new Date(Date.parse(started.body.session.startedAt) + 60_000).toISOString());
      const resumed = await start(browser, migratedApp).expect(200);
      expect(resumed.body.session.solved).toEqual([1]);
      expect((await reopened[0].query('SELECT count(*)::int AS n FROM request_limits')).rows[0].n).toBe(0);
    } finally { await Promise.all(reopened.map(connection => connection.end())); }
  });
});
