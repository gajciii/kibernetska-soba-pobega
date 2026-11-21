import { execFileSync } from 'node:child_process';

// Razvojni .env ne sme povzročiti Reactovega razvojnega paketa v produkciji.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build();
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.server.json'], { stdio: 'inherit' });
await import('./check-client.mjs');
