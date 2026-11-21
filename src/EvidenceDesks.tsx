import { useEffect, useRef, useState } from 'react';
import type { Choice, EvidenceArtifact } from '../shared/types';
import './evidence-desks.css';

type AnswerProps = { answer: string; onAnswer: (answer: string) => void; disabled: boolean };

export function MetadataDesk({ artifacts }: { artifacts: EvidenceArtifact[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [properties, setProperties] = useState(false);
  const [query, setQuery] = useState('');
  const deskRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = artifacts.filter(item => item.name.toLocaleLowerCase('sl').includes(query.trim().toLocaleLowerCase('sl')));
  const selected = artifacts.find(item => item.id === selectedId);
  const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

  useEffect(() => {
    if (selectedId && deskRef.current && deskRef.current.clientWidth <= 700) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [selectedId]);

  function changeQuery(value: string) {
    setQuery(value);
    if (selected && !selected.name.toLocaleLowerCase('sl').includes(value.trim().toLocaleLowerCase('sl'))) {
      setSelectedId(null);
      setProperties(false);
    }
  }

  return <div className="file-desk" ref={deskRef}>
    <header className="file-toolbar">
      <div className="file-breadcrumb" aria-label="Mapa Dokazi, Fotografije"><FileIcon name="folder"/><span>Dokazi</span><span className="file-breadcrumb-divider" aria-hidden="true">/</span><strong>Fotografije</strong></div>
      <div className="file-search"><FileIcon name="search"/><input ref={searchRef} type="search" aria-label="Poišči datoteko" placeholder="Poišči datoteko" value={query} onChange={event => changeQuery(event.target.value)}/>{query && <button type="button" aria-label="Počisti iskanje" onClick={() => { changeQuery(''); searchRef.current?.focus(); }}><FileIcon name="close"/></button>}</div>
    </header>
    <div className="file-workspace">
      <div className="file-folder">
        <nav className="artifact-list" aria-label="Dokazne datoteke">{filtered.map(artifact => <button type="button" key={artifact.id} aria-label={`Odpri datoteko ${artifact.name}`} aria-pressed={selectedId === artifact.id} onClick={() => { setSelectedId(artifact.id); setProperties(false); }}><span className="artifact-thumbnail"><img src={assetUrl(artifact.preview)} alt="" loading="lazy"/></span><strong>{artifact.name}</strong><small>{artifact.size}</small></button>)}</nav>
        {!filtered.length && <div className="artifact-search-empty"><FileIcon name="search"/><p>Ni datotek s tem imenom.</p></div>}
      </div>
      <section className="artifact-inspector" aria-label="Pregled izbrane datoteke">{selected ? <>
        <div className="artifact-toolbar"><div><span>Izbrana datoteka</span><h4 ref={headingRef} tabIndex={-1}>{selected.name}</h4><small>{selected.size}</small></div><button type="button" onClick={() => setProperties(previous => !previous)} aria-expanded={properties} aria-controls="artifact-view">{properties ? 'Poglej predogled' : 'Poglej metapodatke'}</button></div>
        <div id="artifact-view">{properties ? <div id="metadata" className="artifact-properties"><h5>Lastnosti datoteke</h5><dl>{selected.metadata.split('\n').filter(line => line.includes(':')).map((line, index) => { const colon = line.indexOf(':'); return <div key={index}><dt>{line.slice(0, colon).trim()}</dt><dd>{line.slice(colon + 1).trim()}</dd></div>; })}</dl></div> : <figure className="artifact-photo"><img src={assetUrl(selected.preview)} alt={selected.alt}/><figcaption>{selected.description}</figcaption></figure>}</div>
      </> : <div className="artifact-empty"><FileIcon name="image"/><h4>Predogled datoteke</h4><p>Izberita fotografijo iz mape.</p></div>}</section>
    </div>
    <footer className="file-status"><span role="status">{query.trim() ? `${filtered.length} od ${artifacts.length} datotek` : `${artifacts.length} datotek`}</span><span>{selected ? `Izbrano: ${selected.name}` : 'Ni izbrane datoteke'}</span></footer>
  </div>;
}

function FileIcon({ name }: { name: 'folder' | 'search' | 'close' | 'image' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'folder' ? <path d="M3 7V5h6l2 2h10v12H3V7Z"/> : name === 'search' ? <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></> : name === 'close' ? <path d="m6 6 12 12M18 6 6 18"/> : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/></>}
  </svg>;
}

export function BrowserDesk({ choices, answer, onAnswer, disabled }: { choices: Choice[] } & AnswerProps) {
  const [active, setActive] = useState(choices[0]?.id ?? '');
  const [inspect, setInspect] = useState(false);
  const choice = choices.find(item => item.id === active);
  if (!choice) return null;
  const url = new URL(choice.label);
  return <div className="browser-desk"><div className="browser-domain">Potrjena domena šole: <code>most.si</code></div>
    <nav className="browser-tabs" aria-label="Zavarovani spletni naslovi">{choices.map(item => <button key={item.id} aria-pressed={active === item.id} onClick={() => { setActive(item.id); setInspect(false); }}><span>Naslov {item.id}</span><small>Šolski portal</small></button>)}</nav>
    <div className="browser-address"><span className="connection-mark" aria-hidden="true">https</span><code>{choice.label}</code><button aria-expanded={inspect} aria-controls="url-inspector" onClick={() => setInspect(previous => !previous)}>{inspect ? 'Zapri podatke' : 'Razčleni naslov'}</button></div>
    {inspect && <div id="url-inspector" className="url-inspector"><dl><div><dt>Protokol</dt><dd><code>{url.protocol}//</code></dd></div><div><dt>Celoten gostitelj</dt><dd><code>{url.hostname}</code></dd></div><div><dt>Pot</dt><dd><code>{url.pathname}</code></dd></div></dl><p>HTTPS šifrira povezavo; ne potrjuje upravljavca strani.</p></div>}
    <div className="captured-page"><div className="captured-page-brand">MOST <span>/ učilnica</span></div><div className="captured-login"><h4>Dobrodošli nazaj.</h4><div aria-hidden="true" className="captured-fields"><span>Uporabniško ime</span><span>Geslo ········</span><span className="captured-login-button">Prijava</span></div><small>Učni predogled · vnos onemogočen</small></div></div>
    <div className="browser-decision"><button className="secondary" aria-pressed={answer === active} disabled={disabled} onClick={() => onAnswer(active)}>{answer === active ? `Naslov ${active} je označen` : `Označi naslov ${active} kot ponarejen`}</button>{answer && <p className="selected-evidence" role="status">Za odgovor sta označila naslov {answer}.</p>}</div>
  </div>;
}
