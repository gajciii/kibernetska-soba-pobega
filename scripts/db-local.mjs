import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

// Samo razvojna baza, vezana na loopback. Nikoli ne uporablja DATABASE_URL.
const folders = [process.env.PG_BIN, '/opt/homebrew/opt/postgresql@18/bin', '/opt/homebrew/opt/postgresql@17/bin', '/opt/homebrew/opt/postgresql@16/bin', '/opt/homebrew/opt/postgresql@14/bin', '/usr/lib/postgresql/18/bin', '/usr/lib/postgresql/17/bin', '/usr/lib/postgresql/16/bin', '/usr/lib/postgresql/15/bin', '/usr/local/bin'].filter(Boolean);
const bin = folders.find(folder => existsSync(join(folder, 'initdb')));
if (!bin) throw new Error('Namestite PostgreSQL ali nastavite PG_BIN na mapo z initdb in pg_ctl.');
const data = resolve('.local/postgres');
const socket = resolve('.local/pgsocket');
const run = (name, args, options = {}) => execFileSync(join(bin, name), args, { stdio: 'inherit', ...options });
if (process.argv[2] === 'stop') {
  if (existsSync(join(data, 'postmaster.pid'))) run('pg_ctl', ['-D', data, 'stop', '-m', 'fast']);
} else {
  mkdirSync(socket, { recursive: true, mode: 0o700 });
  if (!existsSync(join(data, 'PG_VERSION'))) run('initdb', ['-D', data, '-U', 'operacija404', '--auth-local=trust', '--auth-host=trust', '--encoding=UTF8', '--locale=C']);
  if (spawnSync(join(bin, 'pg_ctl'), ['-D', data, 'status'], { stdio: 'ignore' }).status !== 0) {
    // Unix socket uses /tmp to avoid the platform's 104-byte socket path limit.
    run('pg_ctl', ['-D', data, '-l', resolve('.local/postgres.log'), '-o', '-h 127.0.0.1 -p 55432 -k /tmp', 'start', '-w']);
  }
  // Refuse a foreign service at the reserved port instead of modifying it.
  const actual = run('psql', ['-h', '127.0.0.1', '-p', '55432', '-U', 'operacija404', '-d', 'postgres', '-Atc', 'SHOW data_directory'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
  if (resolve(actual) !== data || !readFileSync(join(data, 'PG_VERSION'), 'utf8').trim()) throw new Error('Vrata 55432 uporablja druga baza.');
  for (const name of ['operacija404', 'operacija404_test']) {
    const found = run('psql', ['-h', '127.0.0.1', '-p', '55432', '-U', 'operacija404', '-d', 'postgres', '-Atc', `SELECT 1 FROM pg_database WHERE datname='${name}'`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
    if (!found) run('createdb', ['-h', '127.0.0.1', '-p', '55432', '-U', 'operacija404', name]);
  }
  console.log('Razvojni PostgreSQL: postgres://operacija404@127.0.0.1:55432/operacija404');
}
