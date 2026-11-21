import express from 'express';
import helmet from 'helmet';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import type pg from 'pg';
import type { AppConfig } from './config.js';
import { changeSession, type SessionRow } from './db.js';
import { stageSummaries, getStage, getHint, getExplanation, validateAnswer, getFeedback, finale } from './content.js';
import type { SessionView } from '../shared/types.js';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const started = (row: SessionRow): SessionView => { if (!row.progress) throw new HttpError(409, 'Najprej začnite preiskavo.'); return row.progress; };
function allowed(row: SessionRow, id: number) {
  const session = started(row);
  if (!getStage(id)) throw new HttpError(404, 'Ta stopnja ne obstaja.');
  if (id > session.currentStage) throw new HttpError(403, 'Stopnja je zaklenjena. Najprej rešite prejšnjo nalogo.');
  return session;
}
const hintsFor = (session: SessionView, id: number) => (session.hints[id] || []).map(index => ({ index, text: getHint(id, index)! }));

export function createApp(pool: pg.Pool, config: AppConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], fontSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"], formAction: ["'self'"], ...(config.production ? {} : { upgradeInsecureRequests: null }) } }, crossOriginEmbedderPolicy: false, strictTransportSecurity: config.production ? undefined : false }));
  app.use(express.json({ limit: '16kb', strict: true }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', async (_req, res) => { await pool.query('SELECT 1'); res.json({ status: 'ok' }); });
  const cookieName = config.secureCookie ? '__Host-operacija404' : 'operacija404';
  const setCookie = (res: express.Response, token: string) => res.cookie(cookieName, token, { httpOnly: true, secure: config.secureCookie, sameSite: 'strict', path: '/', maxAge: config.ttlDays * 86400000 });
  async function createSession(res: express.Response) {
    const token = randomBytes(32).toString('hex');
    const hash = hashToken(token);
    const csrf = randomBytes(32).toString('hex');
    const result = await pool.query<SessionRow>('INSERT INTO game_sessions (token_hash,csrf,expires_at) VALUES ($1,$2,$3) RETURNING *', [hash, csrf, new Date(Date.now() + config.ttlDays * 86400000)]);
    setCookie(res, token);
    return result.rows[0];
  }
  app.use('/api', async (req, res, next) => {
    const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    let row: SessionRow | undefined;
    if (token && /^[a-f0-9]{64}$/.test(token)) row = (await pool.query<SessionRow>('SELECT * FROM game_sessions WHERE token_hash=$1 AND expires_at > now()', [hashToken(token)])).rows[0];
    if (!row && req.method === 'GET' && req.path === '/session') row = await createSession(res);
    if (!row) throw new HttpError(401, 'Seja je potekla. Osvežite stran in začnite preiskavo.');
    res.locals.row = row;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const token = req.get('X-CSRF-Token') || '';
      const origin = req.get('Origin');
      const originAllowed = !origin || origin === config.origin;
      const provided = Buffer.from(token);
      const expected = Buffer.from(row.csrf);
      if (!originAllowed || req.get('Sec-Fetch-Site') === 'cross-site' || provided.length !== expected.length || !timingSafeEqual(provided, expected)) throw new HttpError(403, 'Zahteve ni mogoče potrditi. Osvežite stran in poskusite znova.');
      if (!req.is('application/json')) throw new HttpError(415, 'Zahteva mora vsebovati JSON.');
    }
    next();
  });
  const bootstrap = (row: SessionRow) => ({ csrfToken: row.csrf, session: row.progress, stages: stageSummaries });
  app.get('/api/session', (_req, res) => res.json(bootstrap(res.locals.row)));
  app.post('/api/session', async (req, res) => {
    const name: unknown = req.body?.teamName ?? '';
    if (typeof name !== 'string' || name.trim().length > 60) throw new HttpError(400, 'Ime ekipe naj bo dolgo največ 60 znakov.');
    const result = await changeSession(pool, res.locals.row.token_hash, row => {
      row.progress ??= { teamName: name.trim(), startedAt: new Date().toISOString(), completedAt: null, solved: [], attempts: {}, hints: {}, currentStage: 1, hintCount: 0 };
      return bootstrap(row);
    });
    res.json(result);
  });
  app.get('/api/stages/:id', (req, res) => {
    const id = Number(req.params.id);
    const session = allowed(res.locals.row, id);
    const solved = session.solved.includes(id);
    res.json({ stage: getStage(id), solved, hints: hintsFor(session, id), ...(solved ? { explanation: getExplanation(id) } : {}) });
  });
  app.post('/api/stages/:id/answer', async (req, res) => {
    const id = Number(req.params.id);
    const result = await changeSession(pool, res.locals.row.token_hash, row => {
      const session = allowed(row, id);
      if (session.solved.includes(id)) return { correct: true, message: 'Ta stopnja je že rešena.', explanation: getExplanation(id), session };
      session.attempts[id] = (session.attempts[id] || 0) + 1;
      const correct = validateAnswer(id, req.body?.answer);
      if (correct) {
        session.solved.push(id);
        session.currentStage = Math.min(id + 1, 8);
        if (id === 8) session.completedAt = new Date().toISOString();
      }
      return { correct, message: correct ? 'Dokaz potrjen. Stopnja je rešena.' : getFeedback(id), ...(correct ? { explanation: getExplanation(id) } : {}), session };
    });
    res.json(result);
  });
  app.post('/api/stages/:id/hints', async (req, res) => {
    const id = Number(req.params.id);
    const index: unknown = req.body?.index;
    if (index !== 1 && index !== 2) throw new HttpError(400, 'Izberite prvi ali drugi namig.');
    const result = await changeSession(pool, res.locals.row.token_hash, row => {
      const session = allowed(row, id);
      const seen = session.hints[id] ||= [];
      if (index === 2 && !seen.includes(1)) throw new HttpError(409, 'Najprej odprite prvi namig.');
      if (!seen.includes(index)) { seen.push(index); session.hintCount += 1; }
      return { hints: hintsFor(session, id), session };
    });
    res.json(result);
  });
  app.get('/api/finale', (_req, res) => {
    const session = started(res.locals.row);
    if (!session.completedAt || session.solved.length !== 8) throw new HttpError(403, 'Končna mapa je še zaklenjena. Rešite vseh osem stopenj.');
    res.json({ finale, session });
  });
  app.post('/api/reset', async (_req, res) => {
    const fresh = await createSession(res);
    await pool.query('DELETE FROM game_sessions WHERE token_hash=$1', [res.locals.row.token_hash]);
    res.json(bootstrap(fresh));
  });
  app.use('/api', (_req, _res) => { throw new HttpError(404, 'Ta zahteva ne obstaja.'); });
  app.use(express.static(resolve('dist/client'), { index: 'index.html', dotfiles: 'deny', etag: true }));
  app.use((_req, res) => res.status(404).type('text').send('Stran ne obstaja. Vrnite se na začetek preiskave.'));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof HttpError) { res.status(error.status).json({ error: error.message }); return; }
    if (error instanceof SyntaxError) { res.status(400).json({ error: 'Vsebina zahteve ni veljaven JSON.' }); return; }
    if ((error as { type?: string })?.type === 'entity.too.large') { res.status(413).json({ error: 'Vnos je predolg.' }); return; }
    console.error('Zahteva ni uspela:', error instanceof Error ? error.name : 'Neznana napaka');
    res.status(503).json({ error: 'Strežnik trenutno ni dosegljiv. Vnos obdržite in poskusite znova.' });
  });
  return app;
}
