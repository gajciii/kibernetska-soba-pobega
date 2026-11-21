import { readConfig } from './config.js';
import { openDatabase } from './db.js';
import { createApp } from './app.js';

const config = readConfig();
const pool = await openDatabase(config.databaseUrl);
const server = createApp(pool, config).listen(config.port, config.host, () => {
  console.log(`Operacija 404: http://${config.host}:${config.port}`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  server.close(() => { void pool.end().then(() => process.exit(0)); });
  setTimeout(() => process.exit(1), 10000).unref();
});
