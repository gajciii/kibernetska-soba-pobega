import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Razvojni .env ne sme povzročiti Reactovega razvojnega paketa v produkciji.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build();
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.server.json'], { stdio: 'inherit' });
// Rešitve in strežniške datoteke ne sodijo v javni paket.
function files(folder) { return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(folder, entry.name)) : [join(folder, entry.name)]); }
const publicFiles = files('dist/client');
const forbidden = ['KODA JE PIRAMIDA', 'PREDAL', 'ucenec17', '10:42:17', 'BRUCOVANJE', 'correctAnswer', 'validateAnswer', 'isCorrect', 'react.development.js', 'react-dom-client.development.js'];
for (const file of publicFiles) {
  if (/\.map$|VODNIK|server\/|\.env/u.test(file)) throw new Error(`Zasebna datoteka v javnem buildu: ${file}`);
  const content = readFileSync(file, 'utf8');
  for (const value of forbidden) if (content.includes(value)) throw new Error(`Nepričakovan ključ rešitev v ${file}: ${value}`);
}
console.log(`Javni build preverjen (${publicFiles.length} datotek): brez strežniškega ključa rešitev, vodiča in source map.`);
