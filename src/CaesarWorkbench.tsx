import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './caesar-workbench.css';

const alphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const wrap = (value: number) => ((value % 26) + 26) % 26;

function describeShift(shift: number): string {
  const count = Math.abs(shift);
  const unit = count === 1 ? 'mesto' : count === 2 ? 'mesti' : count === 3 || count === 4 ? 'mesta' : 'mest';
  return `${count} ${unit}${shift === 0 ? '' : shift > 0 ? ' nazaj' : ' naprej'}`;
}

/** Ročna preslikava abecede; pripomoček ne sprejema in ne razvozla celotnih sporočil. */
export default function CaesarWorkbench() {
  const id = useId();
  const [shift, setShift] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [focused, setFocused] = useState(0);
  const [motion, setMotion] = useState<'back' | 'forward' | 'none'>('none');
  const [revision, setRevision] = useState(0);
  const letterButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollArea = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = scrollArea.current;
    if (!element) return;
    const update = () => setOverflows(element.scrollWidth > element.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function move(direction: 1 | -1) {
    setMotion(direction === 1 ? 'back' : 'forward');
    setShift(previous => {
      const next = previous + direction;
      return Math.abs(next) === 26 ? 0 : next;
    });
    setRevision(previous => previous + 1);
  }

  function reset() {
    setMotion('none');
    setShift(0);
    setRevision(previous => previous + 1);
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let destination: number;
    switch (event.key) {
      case 'ArrowLeft': destination = wrap(index - 1); break;
      case 'ArrowRight': destination = wrap(index + 1); break;
      case 'Home': destination = 0; break;
      case 'End': destination = 25; break;
      default: return;
    }
    event.preventDefault();
    const target = letterButtons.current[destination];
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
  }

  const selectedResult = selected === null ? null : alphabet[wrap(selected - shift)];

  return <section className="cw-workbench" data-testid="caesar-workbench" aria-label="Ročni pripomoček za premikanje abecede">
    <div className="cw-introduction"><h2>Premakni abecedo</h2><p>Izberita črko zgoraj in preberita njeno preslikavo spodaj.</p></div>
    <div className="cw-shift-controls" aria-label="Nastavitev premika">
      <button type="button" className="cw-move-button" onClick={() => move(1)} aria-label="Premakni črke za eno mesto nazaj"><span>Nazaj</span><small>−1 po abecedi</small></button>
      <div className="cw-shift-position"><span>Trenutni premik</span><strong data-testid="caesar-shift" aria-live="polite" aria-atomic="true">{describeShift(shift)}</strong></div>
      <button type="button" className="cw-move-button" onClick={() => move(-1)} aria-label="Premakni črke za eno mesto naprej"><span>Naprej</span><small>+1 po abecedi</small></button>
    </div>
    <div className="cw-alphabet-scroll" ref={scrollArea} role="region" aria-label="Abecedni vrstici, vodoravno pomična tabela" tabIndex={0}>
      <table className="cw-alphabet-table" aria-label="Preslikava abecede A–Z">
        <caption className="sr-only">Izberi šifrirano črko zgoraj in preberi njeno preslikavo v spodnji vrstici.</caption>
        <colgroup><col className="cw-label-column"/><col span={26} className="cw-letter-column"/></colgroup>
        <tbody>
          <tr><th scope="row" className="cw-row-label">Šifrirana<br/>abeceda</th>{alphabet.map((letter, index) => <th scope="col" id={`${id}-letter-${letter}`} key={letter} className="cw-source-cell"><button type="button" className="cw-letter-button" ref={element => { letterButtons.current[index] = element; }} tabIndex={focused === index ? 0 : -1} aria-label={`Izberi črko ${letter}`} aria-pressed={selected === index} onFocus={() => setFocused(index)} onKeyDown={event => moveFocus(event, index)} onClick={() => { setSelected(index); setFocused(index); }}>{letter}</button></th>)}</tr>
          <tr><th scope="row" id={`${id}-output-label`} className="cw-row-label">Po<br/>premiku</th>{alphabet.map((letter, index) => <td key={letter} className="cw-output-cell" data-selected={selected === index} headers={`${id}-output-label ${id}-letter-${letter}`}><span key={`${revision}-${index}`} className={`cw-moving-letter cw-motion-${motion}`}>{alphabet[wrap(index - shift)]}</span></td>)}</tr>
        </tbody>
      </table>
    </div>
    {overflows && <p className="cw-scroll-note">Vrstici pomaknita vodoravno.</p>}
    <div className="cw-result-row">
      <div className="cw-single-mapping" role="status" aria-live="polite" aria-atomic="true"><span>{selected === null ? 'Preslikava ene črke' : 'Izbrana črka po premiku'}</span><strong data-testid="caesar-mapping">{selected === null ? 'Izberita črko zgoraj.' : `${alphabet[selected]} → ${selectedResult}`}</strong></div>
      <button type="button" className="cw-reset-button" onClick={reset} disabled={shift === 0}>Ponastavi premik</button>
    </div>
  </section>;
}
