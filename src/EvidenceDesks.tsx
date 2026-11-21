import { useState } from 'react';
import type { Choice, EvidenceArtifact, StageContent } from '../shared/types';
import './evidence-desks.css';

type AnswerProps = { answer: string; onAnswer: (answer: string) => void; disabled: boolean };

export function ProfileDesk({ stage, answer, onAnswer, disabled }: { stage: StageContent } & AnswerProps) {
  const [pinned, setPinned] = useState<number[]>([]);
  const posts = stage.profile?.posts ?? [];
  return <div className="profile-desk">
    <header className="desk-heading"><div><h3>{stage.profile?.name}</h3><p>{stage.profile?.username}</p></div><span className="desk-counter">{posts.length} objav</span></header>
    <div className="profile-workspace"><div className="public-posts">{posts.map((post, index) => <article key={post} className={pinned.includes(index) ? 'pinned-post' : ''}><div className="post-meta"><span>Objava {String(index + 1).padStart(2, '0')}</span><button type="button" aria-pressed={pinned.includes(index)} aria-label={`${pinned.includes(index) ? 'Odstrani' : 'Shrani'} sled iz objave ${index + 1}`} onClick={() => setPinned(previous => previous.includes(index) ? previous.filter(item => item !== index) : [...previous, index])}>{pinned.includes(index) ? 'Shranjeno' : 'Shrani sled'}</button></div><p>{post}</p></article>)}</div>
      <aside className="profile-notebook" aria-label="Beležnica javnih sledi"><h4>Beležnica</h4>{pinned.length ? <ul>{pinned.map(index => <li key={index}>{posts[index]}</li>)}</ul> : <p className="empty-desk">Ni shranjenih sledi.</p>}<small>Samo za ta ogled.</small></aside>
    </div>
    <fieldset className="password-candidates"><legend>Kandidati za geslo</legend>{stage.choices?.map(choice => <label key={choice.id} className={answer === choice.id ? 'selected' : ''}><input type="radio" name="password-choice" checked={answer === choice.id} onChange={() => onAnswer(choice.id)} disabled={disabled}/><span><small>Možnost {choice.id}</small><code>{choice.label}</code></span></label>)}</fieldset>
  </div>;
}

export function MetadataDesk({ artifacts }: { artifacts: EvidenceArtifact[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [properties, setProperties] = useState(false);
  const selected = artifacts.find(item => item.id === selectedId);
  return <div className="file-desk"><header className="desk-heading"><code>/dokazi/priloge/</code><span className="desk-counter">{artifacts.length} datoteke</span></header>
    <div className="file-workspace"><nav className="artifact-list" aria-label="Dokazne datoteke">{artifacts.map(artifact => <button key={artifact.id} aria-pressed={selectedId === artifact.id} onClick={() => { setSelectedId(artifact.id); setProperties(false); }}><span className="artifact-extension" aria-hidden="true">{artifact.name.split('.').pop()}</span><span><strong>{artifact.name}</strong><small>{artifact.size}</small></span></button>)}</nav>
      <div className="artifact-inspector" aria-live="polite">{selected ? <>
        <div className="artifact-toolbar"><h4>{selected.name}</h4><button className="text-button" onClick={() => setProperties(previous => !previous)} aria-expanded={properties} aria-controls="metadata">{properties ? 'Poglej predogled' : 'Poglej metapodatke'}</button></div>
        {properties ? <div id="metadata" className="artifact-properties"><dl>{selected.metadata.split('\n').map((line, index) => { const colon = line.indexOf(':'); return <div key={index}><dt>{line.slice(0, colon)}</dt><dd><code>{line.slice(colon + 1).trim()}</code></dd></div>; })}</dl></div> : <>{selected.kind === 'photo' ? <figure className="artifact-photo"><img src={`${import.meta.env.BASE_URL}${selected.id === 'hodnik' ? 'hodnik' : 'ucilnica'}.svg`} alt={selected.id === 'hodnik' ? 'Učna ilustracija praznega šolskega hodnika' : 'Učna ilustracija prazne računalniške učilnice'}/><figcaption>{selected.description}</figcaption></figure> : <div className="artifact-document"><h4>{selected.name}</h4><p>{selected.description}</p></div>}</>}
      </> : <div className="empty-desk artifact-empty"><p>Izberita datoteko.</p></div>}</div>
    </div>
  </div>;
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
