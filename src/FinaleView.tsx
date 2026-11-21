import { useState } from 'react';
import type { RefObject } from 'react';
import type { Finale, SessionView, StageSummary } from '../shared/types';
import './finale.css';

function Check() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>;
}

function OpenArchive() {
  return <svg className="case-archive" viewBox="0 0 260 220" fill="none" aria-hidden="true">
    <path className="case-orbit" d="M25 110a105 85 0 1 0 210 0 105 85 0 1 0-210 0"/>
    <path className="case-circuit" d="M22 110h34m148 0h34M130 12v29m0 138v29M47 47l23 23m120 80 23 23M47 173l23-23m120-80 23-23"/>
    {[0, 1, 2, 3, 4, 5, 6, 7].map(index => <circle className="case-node" key={index} cx={130 + 105 * Math.cos(index * Math.PI / 4)} cy={110 + 85 * Math.sin(index * Math.PI / 4)} r="4" style={{ animationDelay: `${index * 60}ms` }}/>) }
    <path className="case-folder-back" d="M64 72q0-10 10-10h39l14 14h56q10 0 10 10v64H64Z"/>
    <path className="case-folder-front" d="M58 96h145l-15 67H73Z"/>
    <path className="case-unlock" d="M119 116v-13a14 14 0 0 1 25-9m-30 22h32v29h-32Zm16 11v7"/>
  </svg>;
}

export default function FinaleView({ finale, session, stages, time, headingRef, onReview, onReset }: {
  finale: Finale; session: SessionView; stages: StageSummary[]; time: string;
  headingRef: RefObject<HTMLHeadingElement | null>; onReview: () => void; onReset: () => void;
}) {
  const [messageRead, setMessageRead] = useState(false);
  const hintLabel = session.hintCount === 1 ? 'uporabljen namig' : session.hintCount === 2 ? 'uporabljena namiga' : session.hintCount === 3 || session.hintCount === 4 ? 'uporabljeni namigi' : 'uporabljenih namigov';
  return <div className="finale case-finale">
    <section className="case-hero" aria-labelledby="case-title">
      <div className="case-hero-copy">
        <p className="case-access"><Check/>DOSTOP ODOBREN <span>PRIMER 404</span></p>
        <h1 id="case-title" ref={headingRef} tabIndex={-1}>{finale.title}</h1>
        <p className="case-lead">{finale.lead}</p>
      </div>
      <OpenArchive/>
      <div className="finale-stats">
        <div><strong>8 / 8</strong><span>rešenih stopenj</span></div>
        <div><strong>{time}</strong><span>čas preiskave</span></div>
        <div><strong>{session.hintCount}</strong><span>{hintLabel}</span></div>
      </div>
    </section>

    <details className="case-message" onToggle={event => { if (event.currentTarget.open) setMessageRead(true); }}>
      <summary>
        <span className="case-message-symbol" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg></span>
        <span className="case-message-heading"><span className="case-message-sender">{finale.dispatch.sender}</span><strong>Odpri sporočilo skrbnika</strong></span>
        <span className={`case-message-state${messageRead ? ' is-read' : ''}`}>{messageRead ? 'Prebrano' : 'Novo'}</span>
        <span className="case-chevron" aria-hidden="true"/>
      </summary>
      <div className="case-message-body">
        <h2>{finale.dispatch.subject}</h2>
        {finale.dispatch.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <div className="case-receipt"><Check/>Poročilo prevzeto</div>
      </div>
    </details>

    <section className="case-reconstruction" aria-labelledby="case-timeline-heading">
      <div className="case-section-heading"><span className="eyebrow">REKONSTRUKCIJA</span><h2 id="case-timeline-heading">Sledi dobijo svoj čas.</h2><p>Časovnica poveže zbrane zapise. Sama še ne dokazuje, da je en dogodek povzročil drugega.</p></div>
      <ol className="case-timeline">{finale.timeline.map((entry, index) => <li key={`${entry.time}-${entry.title}`}>
        <span className="case-timeline-time">{entry.time}</span>
        <span className={`case-timeline-point${index === finale.timeline.length - 1 ? ' is-last' : ''}`} aria-hidden="true"/>
        <div><h3>{entry.title}</h3><p>{entry.detail}</p></div>
      </li>)}</ol>
      <aside className="case-boundary" aria-labelledby="case-boundary-title"><span className="eyebrow">MEJA DOKAZOV</span><h2 id="case-boundary-title">Račun še ni oseba.</h2><p>{finale.limitation}</p></aside>
    </section>

    <details className="case-report"><summary>Zaključno poročilo<span className="case-chevron" aria-hidden="true"/></summary><ul className="findings">{finale.findings.map(finding => <li key={finding}><Check/><span>{finding}</span></li>)}</ul></details>
    <details className="case-learning"><summary>Osem korakov. Nove veščine.<span className="case-chevron" aria-hidden="true"/></summary><div className="completed-stages">{stages.map((stage, index) => <div key={stage.id}><span className="completed-icon"><Check/></span><span><strong>{finale.topics[index] ?? stage.topic}</strong><small>Stopnja {stage.id} · opravljeno</small></span></div>)}</div><div className="case-discussion"><h2>Še misel za konec</h2>{finale.discussion.map(question => <p key={question}>{question}</p>)}</div></details>

    <div className="case-ending"><span className="case-ending-line" aria-hidden="true"/><p>{finale.closing}</p><span className="case-signoff">OPERACIJA 404 <span>/</span> ZAKLJUČENO</span></div>
    <div className="finale-actions"><button className="primary" onClick={onReview}>Ponovno preglej dokaze</button><button className="secondary" onClick={onReset}>Nova preiskava</button></div>
  </div>;
}
