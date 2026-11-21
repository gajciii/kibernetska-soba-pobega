export interface AppConfig {
  databaseUrl: string; origin: string; port: number; host: string;
  production: boolean; secureCookie: boolean; trustProxy: number; ttlDays: number;
}
export function readConfig(env = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const origin = new URL(env.APP_ORIGIN || 'http://localhost:5173');
  if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('APP_ORIGIN mora vsebovati samo izvor (protokol, domeno in po potrebi vrata).');
  if (!['http:', 'https:'].includes(origin.protocol) || (production && origin.protocol !== 'https:')) throw new Error('Produkcijski APP_ORIGIN mora uporabljati HTTPS.');
  const secureCookie = env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : production;
  if (production && !secureCookie) throw new Error('Produkcija zahteva COOKIE_SECURE=true.');
  if (!env.DATABASE_URL) throw new Error('Nastavite DATABASE_URL za povezavo s PostgreSQL. Glejte .env.example.');
  try {
    const database = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(database.protocol) || !database.hostname || database.pathname.length < 2) throw new Error();
  } catch { throw new Error('DATABASE_URL mora biti veljaven naslov baze PostgreSQL.'); }
  const port = Number(env.PORT || 3000);
  const ttlDays = Number(env.SESSION_TTL_DAYS || 180);
  const trustProxy = Number(env.TRUST_PROXY || 0);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 730 || ![0, 1].includes(trustProxy)) throw new Error('Neveljavni PORT, SESSION_TTL_DAYS ali TRUST_PROXY.');
  return { databaseUrl: env.DATABASE_URL, origin: origin.origin, port, host: env.HOST || '127.0.0.1', production, secureCookie, trustProxy, ttlDays };
}
