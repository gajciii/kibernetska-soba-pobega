import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { LeaderboardEntry, LeaderboardResponse } from '../shared/types';
import './leaderboard.css';

const base = import.meta.env.BASE_URL;
function duration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(total / 60) % 60).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function ScoreRow({ entry }: { entry: LeaderboardEntry }) {
  return <li className={`board-entry${entry.rank <= 3 ? ` board-rank-${entry.rank}` : ''}${entry.isCurrent ? ' is-current' : ''}`} data-entry-id={entry.id}>
    <span className="board-rank" aria-label={`Mesto ${entry.rank}`}>{String(entry.rank).padStart(2, '0')}</span>
    <div className="board-team"><h2>{entry.teamName}</h2><span className="board-team-state">Zaključeno{entry.isCurrent && <strong>Tvoja skupina</strong>}</span></div>
    <dl className="board-metrics"><div><dt>Rešeno</dt><dd>{entry.solvedCount}<span> / 8</span></dd></div><div><dt>Namigi</dt><dd>{entry.hintCount}</dd></div><div><dt>Čas</dt><dd>{duration(entry.elapsedSeconds)}</dd></div></dl>
  </li>;
}

export default function LeaderboardView({ headingRef, onBack }: { headingRef: RefObject<HTMLHeadingElement | null>; onBack: () => void }) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let controller: AbortController | undefined;
    async function refresh() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      controller = new AbortController();
      setRefreshing(true);
      try {
        const response = await fetch(`${base}api/leaderboard`, { credentials: 'same-origin', signal: controller.signal });
        if (!response.ok) throw new Error('Lestvice trenutno ni mogoče osvežiti.');
        const next = await response.json() as LeaderboardResponse;
        if (active) { setData(next); setError(''); }
      } catch (failure) {
        if (active && !(failure instanceof DOMException && failure.name === 'AbortError')) setError('Lestvice trenutno ni mogoče osvežiti. Poskusi znova.');
      } finally {
        inFlight = false;
        if (active) setRefreshing(false);
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [revision]);

  const currentOutsideList = data?.currentEntry && !data.entries.some(entry => entry.id === data.currentEntry?.id) ? data.currentEntry : null;
  return <main className="leaderboard-page" id="main">
    <header className="board-heading"><span className="board-eyebrow">OPERACIJA 404</span><div className="board-title-wrap ambient-heading" data-ambient-heading><h1 className="board-title" ref={headingRef} tabIndex={-1}>Lestvica skupin.</h1><div className="board-title ambient-heading-light" aria-hidden="true">Lestvica skupin.</div></div><p>Samo zaključene preiskave. Manj namigov, nato krajši čas.</p></header>
    <div className="board-toolbar"><span className={`board-live${error ? ' is-offline' : ''}`}><span aria-hidden="true"/>{error ? 'Povezava prekinjena' : 'Osveževanje vsakih 5 s'}</span><button className="board-refresh" type="button" disabled={refreshing} onClick={() => setRevision(value => value + 1)}>{refreshing ? 'Osveževanje …' : 'Osveži lestvico'}</button></div>
    {error && <p className="board-error" role="alert">{error}{data && ' Zadnji podatki ostajajo prikazani.'}</p>}
    {!data ? <p className="board-empty" role="status">{error ? 'Lestvica še ni naložena.' : 'Nalaganje lestvice …'}</p> : data.entries.length === 0 ? <p className="board-empty">Lestvica je še prazna.</p> : <>
      {currentOutsideList && <section className="board-own-score" aria-label="Rezultat tvoje skupine"><h2>Tvoja skupina</h2><ol className="board-list"><ScoreRow entry={currentOutsideList}/></ol></section>}
      <div className="board-columns" aria-hidden="true"><span>Mesto</span><span>Skupina</span><div><span>Rešeno</span><span>Namigi</span><span>Čas</span></div></div>
      <ol className="board-list" aria-label="Razvrstitev skupin">{data.entries.map(entry => <ScoreRow entry={entry} key={entry.id}/>)}</ol>
      <div className="board-footnote"><span>{data.total > data.entries.length ? `Najboljših ${data.entries.length} od ${data.total} skupin` : `${data.total} ${data.total === 1 ? 'skupina' : data.total === 2 ? 'skupini' : data.total === 3 || data.total === 4 ? 'skupine' : 'skupin'}`}</span><span>Zadnja osvežitev {new Date(data.updatedAt).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
    </>}
    <div className="board-actions"><button type="button" className="secondary" onClick={onBack}>Nazaj k preiskavi</button></div>
  </main>;
}
