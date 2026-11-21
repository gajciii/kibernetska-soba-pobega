import { randomBytes, createHash } from 'node:crypto';
import type pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.js';
import { openDatabase } from '../server/db.js';
import type { AppConfig } from '../server/config.js';
import type { Bootstrap, SessionView } from '../shared/types.js';

// Vsak zagon uporablja svojo shemo v namenski testni bazi. Ne brišemo baze
// ali tabel drugih zagonov; podatki se zapisujejo v dejanski PostgreSQL.
const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://operacija404@127.0.0.1:55432/operacija404_test';
const schema = `test_${randomBytes(8).toString('hex')}`;
const config: AppConfig = {
  databaseUrl,
  origin: 'http://localhost:5173',
  port: 3000,
  host: '127.0.0.1',
  production: false,
  secureCookie: false,
  trustProxy: 0,
  ttlDays: 180,
};

let pool: pg.Pool;
let app: ReturnType<typeof createApp>;
type Team = { agent: ReturnType<typeof request.agent>; csrf: string; cookie: string };
let team: Team;

async function newTeam(): Promise<Team> {
  const agent = request.agent(app);
  const response = await agent.get('/api/session').expect(200);
  const bootstrap = response.body as Bootstrap;
  const cookies = response.headers['set-cookie'] as unknown as string[];
  expect(bootstrap.session).toBeNull();
  return { agent, csrf: bootstrap.csrfToken, cookie: cookies[0].split(';')[0] };
}

function post(client: Team, path: string, body: object) {
  return client.agent.post(path)
    .set('Origin', config.origin)
    .set('X-CSRF-Token', client.csrf)
    .send(body);
}

async function start(client = team, teamName = 'Testna skupina'): Promise<SessionView> {
  const response = await post(client, '/api/session', { teamName }).expect(200);
  return (response.body as Bootstrap).session!;
}

const correctAnswers: unknown[] = [
  'MOST', 'SOVA', { message: 'B', reasons: ['domain', 'link'] },
  { recommendations: ['long', 'unique', 'manager', 'mfa'] }, '10:42', 'ucenec17',
  { sourceId: 'C', domain: 'arhiv-nacrtov.example' }, 'ISKRA',
];

async function solveThrough(end: number, client = team) {
  for (let id = 1; id <= end; id++) {
    if (id === 4) {
      const password = await post(client, '/api/stages/4/answer', { answer: 'luna2009' }).expect(200);
      expect(password.body.passwordVerified).toBe(true);
    }
    const response = await post(client, `/api/stages/${id}/answer`, { answer: correctAnswers[id - 1] }).expect(200);
    expect(response.body.correct).toBe(true);
  }
}

beforeAll(async () => {
  pool = await openDatabase(databaseUrl, schema);
  app = createApp(pool, config);
}, 30000);

beforeEach(async () => { team = await newTeam(); });

afterAll(async () => {
  if (pool) {
    try { await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); }
    finally { await pool.end(); }
  }
});

describe('anonimne seje in zaščita API-ja', () => {
  it('ima health endpoint brez seje in strežniški piškotek z varnimi atributi', async () => {
    const health = await request(app).get('/api/health').expect(200);
    expect(health.body).toEqual({ status: 'ok' });
    expect(health.headers['set-cookie']).toBeUndefined();
    const bootstrap = await request(app).get('/api/session').expect(200);
    const cookies = bootstrap.headers['set-cookie'] as unknown as string[];
    expect(cookies[0]).toMatch(/^operacija404=[a-f0-9]{64};/u);
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('SameSite=Strict');
    expect(cookies[0]).toContain('Path=/');
    expect(cookies[0]).toContain('Expires=');
    expect(bootstrap.headers['cache-control']).toBe('no-store');
    expect(bootstrap.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('začne z imenom in ne razkrije rešitev ali zaklenjenega gradiva', async () => {
    const bootstrap = await team.agent.get('/api/session').expect(200);
    expect(bootstrap.body.session).toBeNull();
    expect(bootstrap.body.stages).toHaveLength(8);
    for (const stage of bootstrap.body.stages) expect(Object.keys(stage).sort()).toEqual(['id', 'title', 'topic']);
    const initial = JSON.stringify(bootstrap.body);
    for (const secret of ['KODA JE MOST', 'SOVA', 'ucenec17', '10:42', 'ISKRA', 'correctAnswer', 'isCorrect']) {
      expect(initial).not.toContain(secret);
    }
    const session = await start();
    expect(session.teamName).toBe('Testna skupina');
    expect(session.solved).toEqual([]);
    expect(session.completedAt).toBeNull();
    expect(session.currentStage).toBe(1);
    expect(Number.isNaN(Date.parse(session.startedAt))).toBe(false);
    const stage = await team.agent.get('/api/stages/1').expect(200);
    expect(stage.body.hints).toEqual([]);
    expect(stage.body.explanation).toBeUndefined();
    expect(stage.body.stage.evidence).toBe('NRGD MH PRVW');
    expect(stage.body.stage.correctAnswer).toBeUndefined();
    expect(stage.body.stage.hints).toBeUndefined();
    expect(stage.body.stage.explanation).toBeUndefined();
  });

  it('odkloni dostop brez veljavne seje in brez začetka igre', async () => {
    await request(app).get('/api/stages/1').expect(401);
    await request(app).get('/api/stages/1').set('Cookie', 'operacija404=neveljavno').expect(401);
    await team.agent.get('/api/stages/1').expect(409);
    await team.agent.get('/api/finale').expect(409);
    await post(team, '/api/stages/1/answer', { answer: 'MOST' }).expect(409);
    await post(team, '/api/stages/1/hints', { index: 1 }).expect(409);
  });

  it('prepreči branje, odgovor in namig za zaklenjene stopnje ter prezgodnji finale', async () => {
    await start();
    for (const id of [2, 4, 8]) {
      await team.agent.get(`/api/stages/${id}`).expect(403);
      await post(team, `/api/stages/${id}/answer`, { answer: correctAnswers[id - 1] }).expect(403);
      await post(team, `/api/stages/${id}/hints`, { index: 1 }).expect(403);
    }
    await team.agent.get('/api/finale').expect(403);
    for (const id of ['0', '9', '-1', '1.5', 'ni-stevilo']) {
      await team.agent.get(`/api/stages/${id}`).expect(404);
      await post(team, `/api/stages/${id}/answer`, { answer: 'MOST' }).expect(404);
    }
    const response = await team.agent.get('/api/session');
    expect(response.body.session.attempts).toEqual({});
    expect(response.body.session.hintCount).toBe(0);
  });

  it('zahteva CSRF žeton, isti izvor in JSON za spremembe', async () => {
    await team.agent.post('/api/session').send({}).expect(403);
    await team.agent.post('/api/session').set('X-CSRF-Token', '0'.repeat(64)).send({}).expect(403);
    await team.agent.post('/api/session').set('X-CSRF-Token', 'é'.repeat(64)).send({}).expect(403);
    await team.agent.post('/api/session').set('X-CSRF-Token', team.csrf).set('Origin', 'https://napadalec.example').send({}).expect(403);
    await team.agent.post('/api/session').set('X-CSRF-Token', team.csrf).set('Sec-Fetch-Site', 'cross-site').send({}).expect(403);
    await team.agent.post('/api/session').set('X-CSRF-Token', team.csrf).type('form').send({ teamName: 'Par' }).expect(415);
    await team.agent.post('/api/session').set('X-CSRF-Token', team.csrf).type('json').send('{').expect(400);
    const current = await team.agent.get('/api/session');
    expect(current.body.session).toBeNull();
    await start();
    await team.agent.post('/api/reset').send({}).expect(403);
  });

  it('ne streže izvajalkinega vodiča, strežniške kode ali konfiguracije', async () => {
    for (const path of ['/VODNIK_IZVAJALKE.md', '/server/content.ts', '/.env', '/package.json']) {
      const response = await request(app).get(path).expect(404);
      expect(response.text).not.toContain('ISKRA');
      expect(response.text).not.toContain('DATABASE_URL');
    }
  });

  it('preveri ime ekipe, omeji velikost zahteve in varno hrani uporabniško besedilo', async () => {
    for (const teamName of [undefined, null, '', '   ', '\u200b\u200d', '\n\t', 'ime\u0000', 123, {}, [], 'x'.repeat(61)]) {
      await post(team, '/api/session', { teamName }).expect(400);
    }
    await post(team, '/api/session', { teamName: 'x'.repeat(20000) }).expect(413);
    const name = "<b>Preiskovalca</b>'; DROP TABLE game_sessions; --";
    const session = await start(team, `  ${name}  `);
    expect(session.teamName).toBe(name);
    const restarted = await start(team, 'Drugo ime');
    expect(restarted).toEqual(session);
    const result = await pool.query('SELECT count(*)::integer AS count FROM game_sessions');
    expect(result.rows[0].count).toBeGreaterThan(0);
  });

  it('hrani zgoščeno vrednost žetona in zavrne poteklo sejo', async () => {
    const rawToken = team.cookie.split('=')[1];
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const row = await pool.query('SELECT token_hash FROM game_sessions WHERE token_hash=$1', [tokenHash]);
    expect(row.rows).toHaveLength(1);
    expect(row.rows[0].token_hash).not.toBe(rawToken);
    await pool.query('UPDATE game_sessions SET expires_at=now() - interval \'1 second\' WHERE token_hash=$1', [tokenHash]);
    await post(team, '/api/session', {}).expect(401);
    const fresh = await team.agent.get('/api/session').expect(200);
    expect(fresh.body.session).toBeNull();
    expect(fresh.body.csrfToken).not.toBe(team.csrf);
  });
});

describe('potek igre, namigi in shranjevanje', () => {
  it('opravi vseh osem stopenj, zavrne napačne odgovore ter odklene končno poročilo', async () => {
    const beginning = await start(team, 'Raziskovalca');
    for (let id = 1; id <= 8; id++) {
      const evidence = await team.agent.get(`/api/stages/${id}`).expect(200);
      expect(evidence.body.solved).toBe(false);
      expect(evidence.body.explanation).toBeUndefined();
      const wrong = await post(team, `/api/stages/${id}/answer`, { answer: 'napačno' }).expect(200);
      expect(wrong.body.correct).toBe(false);
      expect(wrong.body.message).toBeTruthy();
      expect(wrong.body.explanation).toBeUndefined();
      expect(wrong.body.session.currentStage).toBe(id);
      if (id === 4) {
        const password = await post(team, '/api/stages/4/answer', { answer: 'Luna2009' }).expect(200);
        expect(password.body.correct).toBe(false);
        expect(password.body.passwordVerified).toBe(true);
        expect(password.body.session.currentStage).toBe(4);
      }
      const solved = await post(team, `/api/stages/${id}/answer`, { answer: correctAnswers[id - 1] }).expect(200);
      expect(solved.body.correct).toBe(true);
      expect(solved.body.explanation).toBeTruthy();
      expect(solved.body.session.solved).toEqual(Array.from({ length: id }, (_, index) => index + 1));
      expect(solved.body.session.attempts[id]).toBe(id === 4 ? 3 : 2);
      expect(solved.body.session.currentStage).toBe(Math.min(id + 1, 8));
      const revisit = await team.agent.get(`/api/stages/${id}`).expect(200);
      expect(revisit.body.solved).toBe(true);
      expect(revisit.body.explanation).toBe(solved.body.explanation);
      if (id < 8) await team.agent.get('/api/finale').expect(403);
    }
    const finished = await team.agent.get('/api/finale').expect(200);
    expect(finished.body.finale.title).toBe('Odkril si projekt ISKRA.');
    expect(finished.body.finale.topics).toHaveLength(8);
    expect(finished.body.session.solved).toHaveLength(8);
    expect(finished.body.session.startedAt).toBe(beginning.startedAt);
    expect(Date.parse(finished.body.session.completedAt)).toBeGreaterThanOrEqual(Date.parse(beginning.startedAt));
    const completedAt = finished.body.session.completedAt;
    await post(team, '/api/stages/8/answer', { answer: 'iskra' }).expect(200);
    const afterDuplicate = await team.agent.get('/api/finale');
    expect(afterDuplicate.body.session.completedAt).toBe(completedAt);
    expect(afterDuplicate.body.session.attempts['8']).toBe(2);
  });

  it('zahteva dva pravilna phishing razloga brez napačnega in razlikuje dogodke ter čase', async () => {
    await start();
    await solveThrough(2);
    const phishingFailures = [
      { message: 'B', reasons: [] },
      { message: 'B', reasons: ['domain'] },
      { message: 'B', reasons: ['domain', 'domain'] },
      { message: 'B', reasons: ['domain', 'link', 'greeting'] },
      { message: 'B', reasons: ['domain', 'link', 'https'] },
      { message: 'A', reasons: ['domain', 'link'] },
    ];
    for (const answer of phishingFailures) {
      const result = await post(team, '/api/stages/3/answer', { answer }).expect(200);
      expect(result.body.correct).toBe(false);
    }
    await post(team, '/api/stages/3/answer', { answer: correctAnswers[2] }).expect(200);
    await post(team, '/api/stages/4/answer', { answer: 'luna2009' }).expect(200);
    await post(team, '/api/stages/4/answer', { answer: correctAnswers[3] }).expect(200);
    const modified = await post(team, '/api/stages/5/answer', { answer: '11:15' }).expect(200);
    expect(modified.body.correct).toBe(false);
    const original = await post(team, '/api/stages/5/answer', { answer: '10:42:17' }).expect(200);
    expect(original.body.correct).toBe(true);
    for (const answer of ['ucenec12', 'ucenec08', 'ucenec05']) {
      const result = await post(team, '/api/stages/6/answer', { answer }).expect(200);
      expect(result.body.correct).toBe(false);
    }
    const transfer = await post(team, '/api/stages/6/answer', { answer: ' UCENEC17 ' }).expect(200);
    expect(transfer.body.correct).toBe(true);
  });

  it('odklene osmo stopnjo šele po izbiri ponarejene povezave in njene tuje domene', async () => {
    await start();
    await solveThrough(6);
    const failures: unknown[] = [
      ...['A', 'B', 'F'].map(sourceId => ({ sourceId, domain: 'arhiv-nacrtov.example' })),
      { sourceId: 'C', domain: 'most-si.example' },
      { sourceId: 'D', domain: 'prijava.example' },
      { sourceId: 'E', domain: 'arhiv-nacrtov.example' },
      { sourceId: 'C', domain: 'https://arhiv-nacrtov.example' },
      { sourceId: 'E', domain: 'prijava.example/most.si/prijava' },
      { sourceId: 'C', url: 'https://most.si/prijava' },
      'C',
    ];
    for (const answer of failures) {
      const rejected = await post(team, '/api/stages/7/answer', { answer }).expect(200);
      expect(rejected.body.correct).toBe(false);
      expect(rejected.body.explanation).toBeUndefined();
      expect(rejected.body.session.solved).toEqual([1, 2, 3, 4, 5, 6]);
      expect(rejected.body.session.currentStage).toBe(7);
      await team.agent.get('/api/stages/8').expect(403);
    }
    await post(team, '/api/stages/8/answer', { answer: 'ISKRA' }).expect(403);
    const unsolved = await team.agent.get('/api/stages/7').expect(200);
    expect(unsolved.body.solved).toBe(false);
    expect(unsolved.body.explanation).toBeUndefined();

    const identified = await post(team, '/api/stages/7/answer', {
      answer: { sourceId: 'D', domain: '  MOST-SI.EXAMPLE  ' },
    }).expect(200);
    expect(identified.body.correct).toBe(true);
    expect(identified.body.explanation).toBeTruthy();
    expect(identified.body.session.solved).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(identified.body.session.currentStage).toBe(8);
    expect(identified.body.session.attempts[7]).toBe(failures.length + 1);
    expect(identified.body.session.completedAt).toBeNull();
    await team.agent.get('/api/stages/8').expect(200);
    const reload = await team.agent.get('/api/stages/7').expect(200);
    expect(reload.body.solved).toBe(true);
    expect(reload.body.explanation).toBe(identified.body.explanation);
    const persisted = await team.agent.get('/api/session').expect(200);
    expect(persisted.body.session).toEqual(identified.body.session);
  });

  it('ohrani sedmo stopnjo, rešeno s starim odgovorom, brez ponovnega preverjanja ali štetja poskusa', async () => {
    await start();
    await solveThrough(6);
    const before = await team.agent.get('/api/session').expect(200);
    const legacy: SessionView = {
      ...before.body.session,
      solved: [1, 2, 3, 4, 5, 6, 7],
      currentStage: 8,
      attempts: { ...before.body.session.attempts, 7: 1 },
    };
    const tokenHash = createHash('sha256').update(team.cookie.split('=')[1]).digest('hex');
    // Stara različica je shranila le napredek, brez objekta popravljenega URL-ja.
    await pool.query('UPDATE game_sessions SET progress=$1 WHERE token_hash=$2', [JSON.stringify(legacy), tokenHash]);
    const stage = await team.agent.get('/api/stages/7').expect(200);
    expect(stage.body.solved).toBe(true);
    expect(stage.body.explanation).toBeTruthy();
    for (const answer of ['C', { sourceId: 'C', url: 'https://most.si/prijava' }, correctAnswers[6]]) {
      const repeated = await post(team, '/api/stages/7/answer', { answer }).expect(200);
      expect(repeated.body.correct).toBe(true);
      expect(repeated.body.explanation).toBe(stage.body.explanation);
      expect(repeated.body.session).toEqual(legacy);
    }
    await team.agent.get('/api/stages/8').expect(200);
  });

  it('pred priporočili zahteva ročno geslo in do zaključka obeh delov ne odklene pete naloge', async () => {
    await start();
    await solveThrough(3);
    const initial = await team.agent.get('/api/stages/4').expect(200);
    expect(initial.body.passwordVerified).toBe(false);
    expect(initial.body.stage.choices).toBeUndefined();
    expect(initial.body.stage.recommendations).toHaveLength(6);
    expect(JSON.stringify(initial.body)).not.toMatch(/luna2009|2009luna|correctAnswer|isCorrect/iu);

    for (const answer of [correctAnswers[3], 'A', 'luna2008']) {
      const rejected = await post(team, '/api/stages/4/answer', { answer }).expect(200);
      expect(rejected.body.correct).toBe(false);
      expect(rejected.body.passwordVerified).toBe(false);
      expect(rejected.body.session.profilePasswordVerified).toBeUndefined();
      expect(rejected.body.session.solved).toEqual([1, 2, 3]);
      expect(rejected.body.session.currentStage).toBe(4);
      expect(rejected.body.explanation).toBeUndefined();
    }

    const password = await post(team, '/api/stages/4/answer', { answer: 'luna2009' }).expect(200);
    expect(password.body.correct).toBe(false);
    expect(password.body.passwordVerified).toBe(true);
    expect(password.body.session.profilePasswordVerified).toBe(true);
    expect(password.body.session.attempts[4]).toBe(4);
    expect(password.body.session.currentStage).toBe(4);
    expect(password.body.session.solved).toEqual([1, 2, 3]);
    expect(password.body.explanation).toBeUndefined();
    await team.agent.get('/api/stages/5').expect(403);
    await post(team, '/api/stages/5/answer', { answer: '10:42' }).expect(403);
    const reload = await team.agent.get('/api/stages/4').expect(200);
    expect(reload.body.passwordVerified).toBe(true);
    expect(reload.body.solved).toBe(false);
    expect(reload.body.explanation).toBeUndefined();

    for (const answer of [
      'luna2009',
      { recommendations: ['long', 'unique', 'manager'] },
      { recommendations: ['long', 'unique', 'manager', 'reuse'] },
      { recommendations: ['long', 'unique', 'manager', 'manager'] },
      { recommendations: ['long', 'unique', 'manager', 'unknown'] },
    ]) {
      const rejected = await post(team, '/api/stages/4/answer', { answer }).expect(200);
      expect(rejected.body.correct).toBe(false);
      expect(rejected.body.passwordVerified).toBe(true);
      expect(rejected.body.session.solved).toEqual([1, 2, 3]);
      expect(rejected.body.session.currentStage).toBe(4);
      expect(rejected.body.explanation).toBeUndefined();
    }

    const advice = await post(team, '/api/stages/4/answer', { answer: correctAnswers[3] }).expect(200);
    expect(advice.body.correct).toBe(true);
    expect(advice.body.passwordVerified).toBe(true);
    expect(advice.body.session.solved).toEqual([1, 2, 3, 4]);
    expect(advice.body.session.currentStage).toBe(5);
    expect(advice.body.session.attempts[4]).toBe(10);
    expect(advice.body.explanation).toBeTruthy();
    await team.agent.get('/api/stages/5').expect(200);
    const repeated = await post(team, '/api/stages/4/answer', { answer: correctAnswers[3] }).expect(200);
    expect(repeated.body.session).toEqual(advice.body.session);
  });

  it.each([' LuNa2009 ', ' 2009LUNA '])('sprejme ročno geslo %s brez samodejne rešitve celotne naloge', async (answer) => {
    await start();
    await solveThrough(3);
    const result = await post(team, '/api/stages/4/answer', { answer }).expect(200);
    expect(result.body.correct).toBe(false);
    expect(result.body.passwordVerified).toBe(true);
    expect(result.body.session.profilePasswordVerified).toBe(true);
    expect(result.body.session.currentStage).toBe(4);
    expect(result.body.session.solved).toEqual([1, 2, 3]);
    expect(result.body.session.attempts[4]).toBe(1);
  });

  it('ohrani že rešeno četrto stopnjo iz stare seje brez nove oznake prvega dela', async () => {
    await start();
    await solveThrough(4);
    const tokenHash = createHash('sha256').update(team.cookie.split('=')[1]).digest('hex');
    await pool.query("UPDATE game_sessions SET progress=progress - 'profilePasswordVerified' WHERE token_hash=$1", [tokenHash]);
    const stage = await team.agent.get('/api/stages/4').expect(200);
    expect(stage.body.solved).toBe(true);
    expect(stage.body.passwordVerified).toBe(true);
    expect(stage.body.explanation).toBeTruthy();
    const repeated = await post(team, '/api/stages/4/answer', { answer: 'A' }).expect(200);
    expect(repeated.body.correct).toBe(true);
    expect(repeated.body.passwordVerified).toBe(true);
    expect(repeated.body.session.attempts[4]).toBe(2);
    expect(repeated.body.session.currentStage).toBe(5);
  });

  it('odkriva dva postopna namiga in šteje vsak namig samo enkrat, tudi po osvežitvi', async () => {
    await start();
    await post(team, '/api/stages/1/hints', { index: 2 }).expect(409);
    for (const index of [0, 3, '1', null]) await post(team, '/api/stages/1/hints', { index }).expect(400);
    const first = await post(team, '/api/stages/1/hints', { index: 1 }).expect(200);
    expect(first.body.hints).toHaveLength(1);
    expect(first.body.hints[0].index).toBe(1);
    expect(first.body.hints[0].text).toBeTruthy();
    expect(first.body.session.hintCount).toBe(1);
    await post(team, '/api/stages/1/hints', { index: 1 }).expect(200);
    const second = await post(team, '/api/stages/1/hints', { index: 2 }).expect(200);
    expect(second.body.session.hintCount).toBe(2);
    const duplicate = await post(team, '/api/stages/1/hints', { index: 2 }).expect(200);
    expect(duplicate.body.session.hintCount).toBe(2);
    const reload = await team.agent.get('/api/stages/1').expect(200);
    expect(reload.body.hints).toEqual(second.body.hints);
    const session = await team.agent.get('/api/session').expect(200);
    expect(session.body.session.hints).toEqual({ 1: [1, 2] });
    expect(session.body.session.hintCount).toBe(2);
  });

  it('serijsko shrani sočasne odgovore in namige brez podvojenega napredka', async () => {
    await start();
    const answers = await Promise.all([
      post(team, '/api/stages/1/answer', { answer: 'MOST' }),
      post(team, '/api/stages/1/answer', { answer: 'KODA JE MOST' }),
    ]);
    for (const answer of answers) {
      expect(answer.status).toBe(200);
      expect(answer.body.correct).toBe(true);
      expect(answer.body.session.solved).toEqual([1]);
    }
    const hints = await Promise.all([
      post(team, '/api/stages/2/hints', { index: 1 }),
      post(team, '/api/stages/2/hints', { index: 1 }),
    ]);
    for (const hint of hints) expect(hint.status).toBe(200);
    const session = await team.agent.get('/api/session');
    expect(session.body.session.attempts).toEqual({ 1: 1 });
    expect(session.body.session.solved).toEqual([1]);
    expect(session.body.session.hintCount).toBe(1);
    expect(session.body.session.hints).toEqual({ 2: [1] });
  });

  it('ohrani ekipe ločene in ponastavi samo trenutno ekipo ter zamenja njen žeton', async () => {
    const other = await newTeam();
    expect(other.cookie).not.toBe(team.cookie);
    expect(other.csrf).not.toBe(team.csrf);
    await start(team, 'Prva ekipa');
    await start(other, 'Druga ekipa');
    await solveThrough(3, team);
    const password = await post(team, '/api/stages/4/answer', { answer: '2009luna' }).expect(200);
    expect(password.body.session.profilePasswordVerified).toBe(true);
    await solveThrough(1, other);
    await post(other, '/api/stages/2/hints', { index: 1 }).expect(200);
    const otherBefore = await other.agent.get('/api/session');
    const reset = await post(team, '/api/reset', {}).expect(200);
    expect(reset.body.session).toBeNull();
    expect(reset.body.csrfToken).not.toBe(team.csrf);
    const cookies = reset.headers['set-cookie'] as unknown as string[];
    expect(cookies[0].split(';')[0]).not.toBe(team.cookie);
    await request(app).get('/api/stages/1').set('Cookie', team.cookie).expect(401);
    const otherAfter = await other.agent.get('/api/session');
    expect(otherAfter.body).toEqual(otherBefore.body);
    team.csrf = reset.body.csrfToken;
    const fresh = await start(team);
    expect(fresh.solved).toEqual([]);
    expect(fresh.attempts).toEqual({});
    expect(fresh.hintCount).toBe(0);
    expect(fresh.profilePasswordVerified).toBeUndefined();
  });

  it('ohrani napredek, poskuse, namige in sejo po zaprtju povezav ter ponovnem zagonu aplikacije', async () => {
    await start(team, 'Vztrajna ekipa');
    await post(team, '/api/stages/1/hints', { index: 1 }).expect(200);
    await post(team, '/api/stages/1/answer', { answer: 'napačno' }).expect(200);
    await solveThrough(3);
    await post(team, '/api/stages/4/answer', { answer: '2009Luna' }).expect(200);
    await post(team, '/api/stages/4/hints', { index: 1 }).expect(200);
    const before = await team.agent.get('/api/session').expect(200);
    const cookie = team.cookie;
    await pool.end();
    pool = await openDatabase(databaseUrl, schema);
    app = createApp(pool, config);
    const after = await request(app).get('/api/session').set('Cookie', cookie).expect(200);
    expect(after.body).toEqual(before.body);
    expect(after.body.session.attempts).toEqual({ 1: 2, 2: 1, 3: 1, 4: 1 });
    expect(after.body.session.hintCount).toBe(2);
    expect(after.body.session.profilePasswordVerified).toBe(true);
    expect(after.body.session.currentStage).toBe(4);
    const stage = await request(app).get('/api/stages/4').set('Cookie', cookie).expect(200);
    expect(stage.body.hints).toHaveLength(1);
    expect(stage.body.passwordVerified).toBe(true);
    expect(stage.body.solved).toBe(false);
    const continuation = await request(app).post('/api/stages/4/answer')
      .set('Cookie', cookie).set('Origin', config.origin).set('X-CSRF-Token', team.csrf)
      .send({ answer: correctAnswers[3] }).expect(200);
    expect(continuation.body.correct).toBe(true);
    expect(continuation.body.session.currentStage).toBe(5);
  });
});
