import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { Choice } from '../shared/types';
import './browser-desk.css';

type BrowserDeskProps = {
  choices: Choice[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
};

const urlParts = [
  { code: 'https://', title: 'HTTPS', description: 'Povezava je šifrirana. To samo po sebi še ne pomeni, da strani lahko zaupaš.' },
  { code: 'piramida.si', title: 'Domena', description: 'Ime spletnega mesta. Primerjaj ga s potrjeno šolsko domeno, črko za črko.' },
  { code: '/prijava', title: 'Pot', description: 'Poševnica začne pot do strani na tem spletnem mestu. Tukaj vodi do prijave.' },
  { code: '?jezik=sl', title: 'Parameter', description: 'Vprašaj začne dodatne podatke. Znak = poveže ime in vrednost: jezik=sl tukaj izbere slovenščino.' },
];

export function UrlGuide() {
  const [open, setOpen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<{ line: string; head: string }[]>([]);

  useLayoutEffect(() => {
    const diagram = diagramRef.current;
    if (!open || !diagram) return;
    const targets = Array.from(diagram.querySelectorAll('.url-guide-address > span'));
    const sources = Array.from(diagram.querySelectorAll('.url-guide-parts dt > code'));
    let frame = 0;
    function measure() {
      if (!diagram) return;
      const bounds = diagram.getBoundingClientRect();
      setConnectors(targets.map((target, index) => {
        const to = target.getBoundingClientRect();
        const from = sources[index].getBoundingClientRect();
        const x1 = from.left + from.width / 2 - bounds.left;
        const y1 = from.top - bounds.top - 8;
        const x2 = to.left + to.width / 2 - bounds.left;
        const y2 = to.bottom - bounds.top + 5;
        const middle = (y1 + y2) / 2;
        return {
          line: `M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${y2}`,
          head: `M ${x2 - 4} ${y2 + 6} L ${x2} ${y2} L ${x2 + 4} ${y2 + 6}`,
        };
      }));
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    [diagram, ...targets, ...sources].forEach(element => observer.observe(element));
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [open]);

  return <details className="url-guide" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Kaj pomenijo deli spletnega naslova?</summary>
    <div className="url-guide-content">
      <p className="url-guide-caption">Primer pravilnega šolskega naslova</p>
      <div className="url-guide-diagram" ref={diagramRef}>
        <code className="url-guide-address">{urlParts.map((part, index) => <span className={`url-part-${index}`} key={part.title}>{part.code}</span>)}</code>
        <svg className="url-guide-connectors" aria-hidden="true" focusable="false">{connectors.map((connector, index) => <g className={`url-part-${index}`} key={index}><path d={connector.line}/><path d={connector.head}/></g>)}</svg>
        <dl className="url-guide-parts">{urlParts.map((part, index) => <div className={`url-part-${index}`} key={part.title}>
          <dt><span className="url-guide-arrow" aria-hidden="true">→</span><code>{part.code}</code><strong>{part.title}</strong></dt>
          <dd>{part.description}</dd>
        </div>)}</dl>
      </div>
      <div className="url-guide-subdomain">
        <h4>Kaj je poddomena?</h4>
        <code className="url-guide-subdomain-example"><span>ucilnica</span>.<strong>piramida.si</strong></code>
        <p><code>ucilnica</code> je poddomena, <code>piramida.si</code> pa osnovna domena šole. Poddomena je dodatni del pred osnovno domeno, ločen s piko. Z njo lahko ločimo posamezne dele spletnega mesta, na primer spletno učilnico.</p>
      </div>
      <p className="url-guide-note">Več parametrov loči znak <code>&amp;</code>, na primer <code>?jezik=sl&amp;tema=temna</code>. Pot in parametri ne spremenijo domene.</p>
    </div>
  </details>;
}

type IconName = 'back' | 'forward' | 'history' | 'search' | 'settings' | 'grid' | 'book' | 'bell' | 'calendar';

function BrowserIcon({ name }: { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'back' ? <path d="m12 5-7 7 7 7M5 12h14"/> : name === 'forward' ? <path d="m12 5 7 7-7 7M5 12h14"/> : name === 'history' ? <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/><path d="M12 7v5l3 2"/></> : name === 'search' ? <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></> : name === 'settings' ? <><path d="M4 7h7m4 0h5M4 17h2m4 0h10"/><circle cx="13" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></> : name === 'grid' ? <><path d="M4 4h3v3H4zm6.5 0h3v3h-3zM17 4h3v3h-3zM4 10.5h3v3H4zm6.5 0h3v3h-3zm6.5 0h3v3h-3zM4 17h3v3H4zm6.5 0h3v3h-3zm6.5 0h3v3h-3z" strokeWidth="1"/></> : name === 'book' ? <><path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1V4Z"/></> : name === 'bell' ? <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20h4"/></> : <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18M8 15h3m3 3h3"/></>}
  </svg>;
}

export function BrowserDesk({ choices, selectedId, onSelect, disabled }: BrowserDeskProps) {
  const id = useId();
  const historyRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, choices.findIndex(choice => choice.id === selectedId));
  const selected = choices[selectedIndex];
  const [viewedIds, setViewedIds] = useState(() => new Set(selected ? [selected.id] : []));

  useEffect(() => {
    if (addressRef.current) addressRef.current.scrollLeft = 0;
  }, [selectedId]);

  useEffect(() => {
    function dismissOutside(event: PointerEvent) {
      if (historyRef.current?.open && event.target instanceof Node && !historyRef.current.contains(event.target)) historyRef.current.open = false;
    }
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, []);

  if (!selected) return null;

  function select(choice: Choice, fromHistory = false) {
    if (disabled) return;
    setViewedIds(previous => new Set([...previous, choice.id]));
    onSelect(choice.id);
    if (historyRef.current) historyRef.current.open = false;
    if (fromHistory) summaryRef.current?.focus();
  }

  return <section className="link-browser" aria-label="Pregledovalnik zbranih povezav" onKeyDown={event => {
    if (event.key === 'Escape' && historyRef.current?.open) {
      event.preventDefault();
      historyRef.current.open = false;
      summaryRef.current?.focus();
    }
  }}>
    <div className="link-browser-tabbar">
      <div className="link-browser-tab"><span className="link-browser-favicon" aria-hidden="true">P</span><span>Šola Piramida</span><span className="link-browser-tab-close" aria-hidden="true">×</span></div>
    </div>
    <div className="link-browser-toolbar">
      <div className="link-browser-navigation">
        <button type="button" aria-label="Prejšnja povezava" title="Prejšnja povezava" disabled={disabled || selectedIndex === 0} onClick={() => select(choices[selectedIndex - 1])}><BrowserIcon name="back"/></button>
        <button type="button" aria-label="Naslednja povezava" title="Naslednja povezava" disabled={disabled || selectedIndex === choices.length - 1} onClick={() => select(choices[selectedIndex + 1])}><BrowserIcon name="forward"/></button>
      </div>
      <div className="link-browser-address"><BrowserIcon name="settings"/><div className="link-browser-address-scroll" ref={addressRef} role="region" aria-label="Trenutni spletni naslov" tabIndex={0}><code>{selected.label}</code></div></div>
      <details className="link-browser-history" ref={historyRef}>
        <summary ref={summaryRef}><BrowserIcon name="history"/><span>Zgodovina</span></summary>
        <div className="link-browser-history-panel">
          <ol>{choices.map((choice, index) => {
            const active = choice.id === selected.id;
            const status = active ? 'Prikazano' : viewedIds.has(choice.id) ? 'Pregledano' : 'Še ni pregledano';
            return <li key={choice.id}><button type="button" aria-label={`Odpri povezavo ${index + 1}`} aria-describedby={`${id}-url-${index} ${id}-state-${index}`} aria-pressed={active} disabled={disabled} onClick={() => select(choice, true)}>
              <span className="link-browser-history-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="link-browser-history-copy"><code id={`${id}-url-${index}`}>{choice.label}</code><small id={`${id}-state-${index}`}>{status}</small></span>
            </button></li>;
          })}</ol>
        </div>
      </details>
    </div>
    <CapturedSchoolPage/>
    <div className="link-browser-status" role="status">Povezava {selectedIndex + 1} od {choices.length}</div>
  </section>;
}

function CapturedSchoolPage() {
  return <div className="link-browser-page" aria-label="Zajeta stran šole Piramida">
    <div className="link-browser-page-top"><span>Učilnica</span><span>Obvestila</span><BrowserIcon name="grid"/></div>
    <div className="link-browser-page-main">
      <h3 className="link-browser-wordmark">PIRAMIDA<span aria-hidden="true">.</span></h3>
      <p>Šola Piramida</p>
      <div className="link-browser-search-capture"><BrowserIcon name="search"/><span>Poišči po šoli</span></div>
      <ul className="link-browser-shortcuts"><li><span><BrowserIcon name="book"/></span>Učilnica</li><li><span><BrowserIcon name="bell"/></span>Obvestila</li><li><span><BrowserIcon name="calendar"/></span>Urnik</li></ul>
    </div>
  </div>;
}
