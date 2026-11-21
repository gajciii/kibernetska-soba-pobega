import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
function files(folder) { return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(folder, entry.name)) : [join(folder, entry.name)]); }
const publicFiles = files('dist/client');
const forbidden = ['KODA JE MOST', 'SOVA', 'ucenec17', '10:42:17', 'KLJUC', 'correctAnswer', 'validateAnswer', 'isCorrect', 'react.development.js', 'react-dom-client.development.js'];
for (const file of publicFiles) {
  if (/\.map$|VODNIK|server\/|\.env/u.test(file)) throw new Error(`Zasebna datoteka v javnem buildu: ${file}`);
  const content = readFileSync(file, 'utf8');
  for (const value of forbidden) if (content.includes(value)) throw new Error(`Nepričakovan ključ rešitev v ${file}: ${value}`);
}
console.log(`Javni build preverjen (${publicFiles.length} datotek): brez strežniškega ključa rešitev, vodiča in source map.`);
