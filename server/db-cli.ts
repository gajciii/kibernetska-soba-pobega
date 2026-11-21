import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { openDatabase } from './db.js';

const connection = process.env.DATABASE_URL;
if (!connection) throw new Error('Nastavite DATABASE_URL.');
if (process.argv[2] === 'init') {
  const pool = await openDatabase(connection);
  await pool.end();
  console.log('Baza PostgreSQL je pripravljena.');
} else if (process.argv[2] === 'backup') {
  const target = process.argv[3];
  if (!target || !isAbsolute(target) || existsSync(target)) throw new Error('Podajte novo absolutno pot za varnostno kopijo .dump; obstoječih datotek ne prepisujemo.');
  process.umask(0o077);
  let url: URL;
  try { url = new URL(connection); } catch { throw new Error('DATABASE_URL ni veljaven naslov PostgreSQL.'); }
  const env: NodeJS.ProcessEnv = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGDATABASE: decodeURIComponent(url.pathname.slice(1)), ...(url.username ? { PGUSER: decodeURIComponent(url.username) } : {}), ...(url.password ? { PGPASSWORD: decodeURIComponent(url.password) } : {}) };
  for (const [key, value] of url.searchParams) {
    const mapping: Record<string, string> = { sslmode: 'PGSSLMODE', sslrootcert: 'PGSSLROOTCERT', sslcert: 'PGSSLCERT', sslkey: 'PGSSLKEY' };
    if (mapping[key]) env[mapping[key]] = value;
  }
  const result = spawnSync(process.env.PG_DUMP_BIN || 'pg_dump', ['--format=custom', '--no-owner', '--file', target], { env, stdio: ['ignore', 'inherit', 'pipe'] });
  if (result.error || result.status !== 0) throw new Error('Varnostna kopija ni uspela. Preverite pg_dump, različico, povezavo in dovoljenja.');
  chmodSync(target, 0o600);
  console.log(`Varnostna kopija: ${target}`);
} else throw new Error('Uporabite init ali backup /absolutna/pot/kopija.dump.');
