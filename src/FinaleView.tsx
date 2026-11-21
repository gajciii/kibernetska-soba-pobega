import type { RefObject } from 'react';
import type { SessionView, StageSummary } from '../shared/types';
import './finale.css';

type FinaleViewProps = {
  session: SessionView;
  stages: StageSummary[];
  time: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
  onReview?: () => void;
  onLeaderboard?: () => void;
};

const skillNames: Record<number, string> = {
  1: 'Cezarjeva šifra',
  2: 'Kodiranja',
  3: 'Phishing',
  4: 'Gesla',
  5: 'Metapodatki',
  6: 'Omrežni promet',
  7: 'Domene',
  8: 'Binarni zapis',
};

export default function FinaleView({ session, stages, time, headingRef, onReset, onLeaderboard }: FinaleViewProps) {
  const hintLabel = session.hintCount === 1 ? 'uporabljen namig' : session.hintCount === 2 ? 'uporabljena namiga' : session.hintCount === 3 || session.hintCount === 4 ? 'uporabljeni namigi' : 'uporabljenih namigov';
  return <section className="finale completion-hero" data-testid="finale" aria-labelledby="completion-title">
    <div className="completion-title-wrap ambient-heading" data-ambient-heading>
      <h1 className="completion-title" id="completion-title" ref={headingRef} tabIndex={-1}>Preiskava zaključena.</h1>
      <div className="completion-title ambient-heading-light" aria-hidden="true">Preiskava zaključena.</div>
    </div>
    {session.teamName.trim() && <p className="completion-team">{session.teamName}</p>}
    <div className="finale-stats">
      <div><strong>{session.solved.length} / {stages.length}</strong><span>rešenih izzivov</span></div>
      <div><strong>{time}</strong><span>čas preiskave</span></div>
      <div><strong>{session.hintCount}</strong><span>{hintLabel}</span></div>
    </div>
    <div className="finale-skills-scroll" role="region" aria-label="Osvojene veščine, vodoravno pomičen pregled" tabIndex={0}>
      <ol className="finale-skills-track">{stages.map(stage => <li key={stage.id}><span className="finale-skill-name">{skillNames[stage.id] ?? stage.topic}</span><span className="finale-skill-dot" aria-hidden="true"/></li>)}</ol>
    </div>
    <div className="completion-actions">
      <a className="completion-leaderboard" href={`${import.meta.env.BASE_URL}lestvica`} onClick={event => { if (onLeaderboard && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onLeaderboard(); } }}>Lestvica</a>
      <button type="button" className="completion-reset" onClick={onReset}>Nova preiskava</button>
    </div>
  </section>;
}
