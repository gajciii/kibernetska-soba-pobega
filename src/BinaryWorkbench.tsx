import { useId, useState } from 'react';
import './binary-workbench.css';

const placeValues = [128, 64, 32, 16, 8, 4, 2, 1];
const asciiLetters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export default function BinaryWorkbench({ evidence }: { evidence: string }) {
  const id = useId();
  const groups = evidence.trim().split(/\s+/u).filter(Boolean);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [selectedBit, setSelectedBit] = useState<number | null>(null);
  const group = groups[selectedGroup];

  if (!group) return null;

  function chooseGroup(index: number) {
    setSelectedGroup(index);
    setSelectedBit(null);
  }

  return <section className="binary-workbench" data-testid="binary-workbench" aria-label="Ročna bitna konzola">
    <header className="binary-heading"><h2>Zadnje sporočilo</h2><span>DOKAZ · {groups.length} × 8 bitov</span></header>
    <ol className="binary-steps">
      <li>Pri enici prištej vrednost mesta. Ničla prispeva 0.</li>
      <li>Decimalni seštevek poišči v tabeli ASCII.</li>
      <li>Črke ohrani v vrstnem redu skupin in celotno kodo oddaj v polju Odgovor.</li>
    </ol>

    <section className="binary-example" aria-labelledby={`${id}-example-heading`}>
      <h3 id={`${id}-example-heading`}>Primer:</h3>
      <p><code>01000001</code><span> je </span><code>64 + 1 = 65</code><span> in predstavlja črko </span><code>A</code></p>
      <span>Prištej le vrednosti mest z enico. Vsaka ničla prispeva 0.</span>
    </section>

    <div className="binary-groups" role="group" aria-label="Skupine binarnega zapisa">{groups.map((bits, index) => <button type="button" key={index} aria-label={`Izberi skupino ${index + 1}`} aria-pressed={selectedGroup === index} aria-describedby={`${id}-bits-${index}`} onClick={() => chooseGroup(index)}>
      <span className="binary-group-label">Skupina {index + 1}</span><code id={`${id}-bits-${index}`}>{bits}</code>
    </button>)}</div>

    <section className="binary-inspector" aria-labelledby={`${id}-selected-heading`}>
      <div className="binary-inspector-heading"><h3 id={`${id}-selected-heading`}>Skupina {selectedGroup + 1}</h3><span>Vrednosti bitnih mest</span></div>
      <div className="binary-place-scroll" role="region" aria-label="Osem bitnih mest, vodoravno pomično" tabIndex={0}>
        <div className="binary-places" role="group" aria-label="Bitna mesta izbrane skupine">{placeValues.map((value, index) => <button type="button" className="binary-place" key={value} data-bit={group[index]} data-selected={selectedBit === index} aria-label={`Bit ${index + 1}: ${group[index]}, vrednost mesta ${value}`} aria-pressed={selectedBit === index} onClick={() => setSelectedBit(index)} onFocus={() => setSelectedBit(index)}>
          <span className="binary-place-value">{value}</span><span className="binary-signal" aria-hidden="true"/><strong>{group[index]}</strong>
        </button>)}</div>
      </div>
      <p className="binary-scroll-note">Bitna mesta lahko pomakneš vodoravno.</p>
      <p className="binary-bit-explanation" data-testid="binary-bit-explanation" role="status" aria-live="polite" aria-atomic="true">{selectedBit === null ? 'Izberi bit za razlago njegovega mesta.' : group[selectedBit] === '1' ? `1: prištej ${placeValues[selectedBit]}.` : '0: te vrednosti ne prištej.'}</p>
    </section>

    <details className="binary-ascii"><summary>Tabela ASCII · decimalno → črka</summary><p className="binary-ascii-note">Poišči seštevek, ob njem preberi črko.</p><dl className="binary-ascii-grid" aria-label="Decimalne vrednosti ASCII za črke A do Z">{asciiLetters.map((letter, index) => <div key={letter}><dt>{65 + index}</dt><dd>{letter}</dd></div>)}</dl></details>
  </section>;
}
