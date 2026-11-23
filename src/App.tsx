import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { AnswerResponse, Bootstrap, Finale, SessionView, StageContent, StageResponse, StageSummary } from '../shared/types';
import { HEARTBEAT_MS, playDeadline, playElapsed, type PlayClock } from '../shared/play-clock';
import ConverterWorkbench from './ConverterWorkbench';
import CaesarWorkbench from './CaesarWorkbench';
import BinaryWorkbench from './BinaryWorkbench';
import FinaleView from './FinaleView';
import { Mailbox, TrafficViewer } from './InvestigationViewers';
import { MetadataDesk } from './EvidenceDesks';
import Disclosure from './Disclosure';
import { BrowserDesk, UrlGuide } from './BrowserDesk';
import { PasswordPatterns, ProfileDesk } from './ProfileDesk';
import Landing from './Landing';
import AmbientBackground from './AmbientBackground';
import LeaderboardView from './LeaderboardView';
import NotFound from './NotFound';
import CopyButton from './CopyButton';

type IconName = 'lock' | 'check' | 'clock' | 'folder' | 'key' | 'mail' | 'shield' | 'image' | 'terminal' | 'globe' | 'bulb' | 'reset' | 'close';
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>,
    key: <><circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/></>,
    terminal: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3m7 0h4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    bulb: <><path d="M9 18v-2a6 6 0 1 1 6 0v2m-6 0h6m-5 3h4"/></>,
    reset: <><path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Explanation({ text }: { text: string }) {
  return <>{text.split(/(\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\b)/gi).map((part, index) => index % 2 === 1 ? <strong className="explanation-domain" key={index}>{part}</strong> : part)}</>;
}
function TheoryText({ text, highlights }: { text: string; highlights: string[] }) {
  const pattern = new RegExp(`(${highlights.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return <>{text.split(pattern).map((part, index) => {
    const highlight = highlights.indexOf(part);
    return highlight >= 0 ? <strong className="theory-emphasis" data-tone={highlight % 4} key={index}>{part}</strong> : part;
  })}</>;
}
const applications: Record<StageContent['kind'], { name: string; icon: IconName }> = { caesar: { name: 'Šifrirnik', icon: 'key' }, encoding: { name: 'Pretvornik', icon: 'terminal' }, phishing: { name: 'Pošta', icon: 'mail' }, password: { name: 'Javni profil', icon: 'shield' }, metadata: { name: 'Datoteke', icon: 'folder' }, logs: { name: 'Omrežni promet', icon: 'terminal' }, domains: { name: 'Brskalnik', icon: 'globe' }, binary: { name: 'Bitna konzola', icon: 'terminal' } };
const base = import.meta.env.BASE_URL;
type PageView = 'intro' | 'stage' | 'finale' | 'leaderboard' | 'not-found';
function pathView(): 'intro' | 'leaderboard' | 'not-found' {
  const path = window.location.pathname.replace(/\/$/u, '');
  if (path === base.replace(/\/$/u, '')) return 'intro';
  if (path === `${base}lestvica`.replace(/\/$/u, '')) return 'leaderboard';
  return 'not-found';
}
class RequestError extends Error {
  constructor(message: string, readonly status: number, readonly retryAfterSeconds?: number) {
    super(message);
  }
}
function elapsed(session: SessionView | null, now: number) {
  if (!session) return '00:00';
  const seconds = Math.floor(playElapsed(session, now) / 1000);
  const hours = Math.floor(seconds / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
async function request<T>(path: string, csrf: string, body?: unknown, keepalive = false): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}api${path}`, {
      credentials: 'same-origin',
      keepalive,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      ...(body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error('Povezava s strežnikom je prekinjena. Vnos je ohranjen. Preveri povezavo in poskusi znova.');
  }
  const data = await response.json().catch(() => null) as (T & { error?: string; retryAfterSeconds?: number }) | null;
  if (!response.ok || !data) {
    const retryAfterSeconds = Number(data?.retryAfterSeconds ?? response.headers.get('Retry-After'));
    throw new RequestError(data?.error ?? 'Strežnik trenutno ni dosegljiv. Poskusi znova.', response.status, Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds : undefined);
  }
  return data;
}

function requestStage(id: number, csrf: string) {
  return request<StageResponse>(`/stages/${id}`, csrf);
}

export default function App() {
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [view, setView] = useState<PageView>(pathView);
  const gameView = useRef<'intro' | 'stage' | 'finale'>('intro');
  const [stageData, setStageData] = useState<StageResponse | null>(null);
  const [finale, setFinale] = useState<Finale | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [resetOpen, setResetOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const session = boot?.session ?? null;
  const csrf = boot?.csrfToken ?? '';
  const sessionExpired = !!session && !session.completedAt && now >= playDeadline(session);
  const timing = view === 'stage' && !!session?.teamName && !session.completedAt && !sessionExpired;
  useEffect(() => {
    if (!timing) return;
    const tab = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    let pagePresent = true;
    let stopped = false;
    let activeSent = false;
    let revision = 0;
    async function send(active: boolean) {
      if (!active && !activeSent) return;
      activeSent = active;
      const version = ++revision;
      try {
        const result = await request<{ playClock?: PlayClock }>('/presence', csrf, { tab, active }, !active);
        if (stopped || version !== revision) return;
        setBoot(previous => {
          const current = previous?.session;
          const clock = result.playClock;
          if (!previous || !current || current.completedAt || !clock || previous.csrfToken !== csrf ||
              clock.measuredAt < (current.playClock?.measuredAt ?? 0)) return previous;
          return { ...previous, session: { ...current, playClock: clock } };
        });
      } catch {
        // Naslednji signal obnovi povezavo, če se zahteva izgubi.
      }
    }
    const report = () => void send(pagePresent && !document.hidden);
    const hide = () => { pagePresent = false; report(); };
    const show = () => { pagePresent = true; report(); };
    report();
    const timer = window.setInterval(() => {
      if (pagePresent && !document.hidden) report();
    }, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', report);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
    return () => {
      stopped = true;
      void send(false);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', report);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', show);
    };
  }, [timing, csrf]);
  useEffect(() => {
    if (sessionExpired && view === 'stage') {
      gameView.current = 'intro';
      setResetOpen(false);
      setView('intro');
      window.scrollTo(0, 0);
    }
  }, [sessionExpired, view]);
  const bootstrap = useCallback(async () => {
    setBusy(true); setError('');
    try { setBoot(await request<Bootstrap>('/session', '')); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, []);
  const needsBootstrap = view !== 'not-found' && !boot;
  useEffect(() => { if (needsBootstrap) void bootstrap(); }, [bootstrap, needsBootstrap]);
  useEffect(() => {
    const onPopState = () => { const route = pathView(); setView(route === 'intro' ? gameView.current : route); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { headingRef.current?.focus(); }, [view, stageData?.stage.id, needsBootstrap]);
  function changeView(next: Exclude<PageView, 'not-found'>) {
    const path = next === 'leaderboard' ? `${base}lestvica` : base;
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    if (next !== 'leaderboard') gameView.current = next;
    setView(next);
    window.scrollTo({ top: 0, left: 0 });
  }
  function updateSession(next: SessionView) {
    setBoot(previous => {
      if (!previous) return previous;
      const clock = previous.session?.playClock;
      const keepClock = !next.completedAt && clock && clock.measuredAt > (next.playClock?.measuredAt ?? 0);
      return { ...previous, session: keepClock ? { ...next, playClock: clock } : next };
    });
  }
  async function openStage(id: number) {
    setBusy(true); setError('');
    try { setStageData(await requestStage(id, csrf)); changeView('stage'); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function openFinale() {
    setBusy(true); setError('');
    try {
      const result = await request<{ finale: Finale; session: SessionView }>('/finale', csrf);
      setFinale(result.finale); updateSession(result.session); changeView('finale');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function start(teamName: string) {
    setBusy(true); setError('');
    try {
      const next = await request<Bootstrap>('/session', csrf, { teamName });
      setBoot(next);
      if (next.session?.completedAt) await openFinale();
      else { setStageData(await requestStage(next.session?.currentStage ?? 1, next.csrfToken)); changeView('stage'); }
    } catch (e) {
      if (!session && e instanceof RequestError && e.status === 429 && e.retryAfterSeconds) {
        const receivedAt = Date.now();
        const retryAfterSeconds = e.retryAfterSeconds;
        setNow(receivedAt);
        setBoot(previous => previous ? { ...previous, nextStartAt: new Date(receivedAt + retryAfterSeconds * 1000).toISOString() } : previous);
      } else setError((e as Error).message);
    }
    finally { setBusy(false); }
  }
  async function reset() {
    setBusy(true); setError('');
    try {
      setBoot(await request<Bootstrap>('/reset', csrf, {})); setStageData(null); setFinale(null); changeView('intro'); setResetOpen(false);
    } catch (e) { setError((e as Error).message); setResetOpen(false); }
    finally { setBusy(false); }
  }
  const continueInvestigation = () => !session?.teamName.trim() ? changeView('intro') : session.completedAt ? void openFinale() : void openStage(session.currentStage);
  const leaveLeaderboard = () => {
    if (gameView.current === 'stage' && stageData && !sessionExpired) changeView('stage');
    else if (gameView.current === 'finale' && session?.completedAt) {
      if (finale) changeView('finale');
      else void openFinale();
    }
    else changeView('intro');
  };
  return <div className={`app-shell ${view === 'intro' || view === 'not-found' ? 'is-landing' : view === 'finale' ? 'is-finale' : view === 'leaderboard' ? 'is-leaderboard' : 'is-workspace'}`}>
    <AmbientBackground/>
    <a className="skip-link" href="#main">Preskoči na vsebino</a>
    <header className="topbar">
      <button className="brand" onClick={() => changeView('intro')} aria-label="Operacija 404, začetni zaslon">
        <span className="brand-mark" aria-hidden="true">[404]</span>
        <span><strong>OPERACIJA <span>404</span></strong><small>KIBERNETSKA SOBA POBEGA</small></span>
      </button>
      <div className="header-controls"><a className="header-leaderboard" href={`${base}lestvica`} aria-current={view === 'leaderboard' ? 'page' : undefined} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); changeView('leaderboard'); } }}>Lestvica</a>{view === 'stage' && <div className="header-stats">
        <span className="header-progress"><span className="muted">Rešene stopnje</span><strong>{session?.solved.length ?? 0}<span className="muted"> / 8</span></strong></span>
        <span className="timer" aria-label={`Čas preiskave ${elapsed(session, now)}`}><Icon name="clock"/><span>{elapsed(session, now)}</span></span>
        <span className="workshop-badge">UČNA SIMULACIJA</span>
      </div>}</div>
    </header>
    {error && view !== 'not-found' && <div className="global-error" role="alert"><span>{error}</span>{!boot ? <button onClick={() => void bootstrap()} disabled={busy}>Poskusi znova</button> : <button aria-label="Zapri obvestilo" onClick={() => setError('')}><Icon name="close"/></button>}</div>}
    {view === 'not-found' ? <NotFound headingRef={headingRef} onHome={() => changeView('intro')}/> : !boot ? <main id="main" className="loading-screen"><span className="loading-symbol"><Icon name="shield" size={36}/></span><h1>{busy ? 'Pripravljamo preiskovalno mapo …' : 'Povezava ni uspela'}</h1></main> : view === 'intro' ?
      <Landing session={session} expired={sessionExpired} nextStartAt={boot.nextStartAt} now={now} busy={busy} onStart={start} onContinue={continueInvestigation} onReset={sessionExpired ? () => void reset() : () => setResetOpen(true)} headingRef={headingRef}/>
      : view === 'leaderboard' ? <LeaderboardView headingRef={headingRef} onBack={leaveLeaderboard}/>
      : view === 'stage' && stageData ? <Stage key={stageData.stage.id} data={stageData} elapsedMs={session ? playElapsed(session, now) : 0} completed={!!session?.completedAt} csrf={csrf} busy={busy} setBusy={setBusy} onSession={updateSession} onData={setStageData} onNext={() => stageData.stage.id === 8 ? void openFinale() : void openStage(stageData.stage.id + 1)} onFinale={openFinale} headingRef={headingRef}
        navigation={<Sidebar stages={boot.stages} session={session!} active={stageData.stage.id} busy={busy} onSelect={openStage} onFinale={openFinale} onReset={() => setResetOpen(true)}/>}/>
      : <main id="main" className="finale-page" aria-busy={busy}>
        {session && finale && <FinaleView finale={finale} session={session} stages={boot.stages} time={elapsed(session, now)} headingRef={headingRef} onReset={() => setResetOpen(true)} onLeaderboard={() => changeView('leaderboard')}/>}
        </main>}
    <footer className="footer"><strong>FERI</strong><a href={`${base}license.txt`} target="_blank" rel="noopener noreferrer">Licenca MIT</a></footer>
    {resetOpen && <ResetDialog busy={busy} onCancel={() => setResetOpen(false)} onReset={reset}/>}
  </div>;
}

function Sidebar({ stages, session, active, busy, onSelect, onFinale, onReset }: {
  stages: StageSummary[]; session: SessionView; active?: number; busy: boolean; onSelect: (id: number) => Promise<void>; onFinale: () => Promise<void>; onReset: () => void;
}) {
  return <section className="progress-panel" aria-label="Napredek preiskave">
    <div className="progress-label"><span>Napredek preiskave</span><strong>{session.solved.length} / 8</strong></div>
    <progress max="8" value={session.solved.length} aria-label="Število rešenih stopenj"/>
    <nav aria-label="Stopnje preiskave"><ol className="stages-list">{stages.map(stage => {
      const solved = session.solved.includes(stage.id); const locked = stage.id > session.currentStage;
      return <li key={stage.id}><button disabled={locked || busy} aria-current={active === stage.id ? 'step' : undefined} className={`stage-nav ${solved ? 'solved' : ''} ${active === stage.id ? 'active' : ''}`} onClick={() => void onSelect(stage.id)}>
        <span className="step-dot" aria-hidden="true"/>
        <span className="step-number">{String(stage.id).padStart(2, '0')}</span>
        <span className="stage-nav-copy"><strong>{stage.title}</strong><small className="sr-only">{solved ? 'Rešeno' : locked ? 'Zaklenjeno' : 'Trenutna stopnja'}</small></span>
      </button></li>;
    })}</ol></nav>
    {session.completedAt && <button className="secondary finale-nav" onClick={() => void onFinale()} disabled={busy}><Icon name="check"/>Rezultat preiskave</button>}
    <div className="sidebar-bottom"><div className="team-chip"><Icon name="shield"/><span>{session.teamName || 'Preiskovalna ekipa'}</span></div><button className="text-button reset-button" disabled={busy} onClick={onReset}><Icon name="reset" size={16}/>Ponastavi preiskavo</button></div>
  </section>;
}

function Stage({ data, elapsedMs, completed, csrf, busy, setBusy, onSession, onData, onNext, onFinale, headingRef, navigation }: {
  data: StageResponse; elapsedMs: number; completed: boolean; navigation: ReactNode; csrf: string; busy: boolean; setBusy: (busy: boolean) => void; onSession: (s: SessionView) => void; onData: (s: StageResponse) => void; onNext: () => void; onFinale: () => Promise<void>; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const stage = data.stage;
  const [answer, setAnswer] = useState('');
  const [browserSource, setBrowserSource] = useState(stage.choices?.[0]?.id ?? '');
  const [domainAnswers, setDomainAnswers] = useState<[string, string]>(['', '']);
  const [reasons, setReasons] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const recommendationsRef = useRef<HTMLFieldSetElement>(null);
  const passwordVerified = stage.kind === 'password' && (data.passwordVerified || data.solved);
  useEffect(() => {
    if (passwordVerified && !data.solved) recommendationsRef.current?.focus();
  }, [passwordVerified, data.solved]);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [hintError, setHintError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setFeedback(null);
    try {
      const result = await request<AnswerResponse>(`/stages/${stage.id}/answer`, csrf, { answer: stage.kind === 'phishing' ? { message: answer, reasons } : stage.kind === 'domains' ? { domains: domainAnswers } : passwordVerified ? { recommendations } : answer });
      onSession(result.session); setFeedback({ text: result.message, success: result.correct || (!passwordVerified && !!result.passwordVerified) });
      if (result.passwordVerified) onData({ ...data, passwordVerified: true });
      if (result.correct) {
        onData({ ...data, solved: true, explanation: result.explanation });
        if (stage.id === 8) await onFinale();
      }
    } catch (e) { setFeedback({ text: (e as Error).message, success: false }); }
    finally { setBusy(false); }
  }
  async function revealHint(index: number) {
    setBusy(true); setHintError('');
    try {
      const result = await request<{ hints: { index: number; text: string }[]; session: SessionView }>(`/stages/${stage.id}/hints`, csrf, { index });
      onData({ ...data, hints: result.hints }); onSession(result.session);
    } catch (e) { setHintError((e as Error).message); }
    finally { setBusy(false); }
  }
  const isChoice = stage.kind === 'phishing';
  const app = applications[stage.kind];
  const selectedLabel = answer ? `${stage.kind === 'phishing' ? 'Sporočilo' : 'Naslov'} ${answer}` : '';
  return <div className="workspace" data-stage={stage.kind}>
    <main id="main" className="investigation-main" aria-busy={busy}>
      <div className="stage-heading">
        <div className="stage-breadcrumb"><span>IZZIV {String(stage.id).padStart(2, '0')} / 08</span><span>{stage.topic}</span>{data.solved && <span className="solved-badge"><Icon name="check" size={14}/>Rešeno</span>}</div>
        <h1 ref={headingRef} tabIndex={-1}>{stage.title}</h1>
      </div>
      <p className={`stage-intro ${stage.kind}-story`}>{stage.intro}</p>
      {stage.kind === 'domains' && <UrlGuide/>}
      {stage.theory && <Disclosure className="theory-guide" title={stage.theory.title}><div className="theory-guide-content"><p><TheoryText text={stage.theory.text} highlights={stage.theory.highlights}/></p></div></Disclosure>}
      {stage.kind === 'encoding' && stage.evidence && <div className="source-evidence story-evidence"><div className="story-evidence-heading"><span>DOKAZ · obvestilo.dat</span><CopyButton text={stage.evidence} label="Kopiraj dokaz"/></div><code>{stage.evidence}</code></div>}
      <section className="task-instruction" aria-labelledby="instruction-heading"><h2 id="instruction-heading">NAVODILO</h2><p>{stage.question}</p></section>
      <a className="mobile-answer-link" href="#answer-panel">Vnesi odgovor</a>
      <section className="desktop-window" aria-label={`${app.name}: delovno okno`}>
        <header className="window-toolbar"><div className="window-app"><Icon name={app.icon} size={17}/><strong>{app.name}</strong></div><span className="window-file">PRIMER 404 / {String(stage.id).padStart(2, '0')}</span><span className="window-controls" aria-hidden="true"><i/><i/><i/></span></header>
        <div className="window-body">
          {stage.kind !== 'encoding' && stage.kind !== 'binary' && stage.evidence && <div className="source-evidence"><span>DOKAZ</span><code>{stage.evidence}</code></div>}
          {stage.kind === 'caesar' && <CaesarWorkbench/>}
          {stage.kind === 'encoding' && <ConverterWorkbench stage={stage}/>}
          {stage.kind === 'binary' && <BinaryWorkbench evidence={stage.evidence ?? ''}/>}
          {stage.kind === 'phishing' && <Mailbox mails={stage.mails ?? []} answer={answer} onAnswer={setAnswer} disabled={data.solved || busy}/>}
          {stage.kind === 'password' && stage.profile && <ProfileDesk profile={stage.profile}/>}
          {stage.kind === 'metadata' && <MetadataDesk artifacts={stage.artifacts ?? []}/>}
          {stage.kind === 'logs' && <TrafficViewer packets={stage.packets ?? []} logs={stage.logs ?? []}/>}
          {stage.kind === 'domains' && <BrowserDesk choices={stage.choices ?? []} selectedId={browserSource} onSelect={id => { setBrowserSource(id); setFeedback(null); }} disabled={busy}/>}
        </div>
        {(stage.kind === 'logs' || stage.kind === 'phishing') && <div className="window-status">{stage.kind === 'logs' ? '32 paketov / lokalna zbirka' : '7 sporočil / neaktivne povezave'}</div>}
      </section>
      {stage.kind === 'password' && <PasswordPatterns/>}
    </main>
    <aside className="sidebar" aria-label="Odgovor in napredek">
      <section className="answer-panel" id="answer-panel" aria-labelledby="answer-heading" tabIndex={-1}>
        <div className="answer-panel-heading"><h2 id="answer-heading">ODGOVOR</h2><span>{String(stage.id).padStart(2, '0')} / 08</span></div>
        <form onSubmit={submit}>
          {stage.kind === 'domains' ? <div className="domain-answers">
            {domainAnswers.map((value, index) => <div key={index}>
              <label htmlFor={`domain-answer-${index}`}>{index === 0 ? 'Prva tuja domena' : 'Druga tuja domena'}</label>
              <input id={`domain-answer-${index}`} className="answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} inputMode="url" maxLength={253} value={value} onChange={event => setDomainAnswers(previous => index === 0 ? [event.target.value, previous[1]] : [previous[0], event.target.value])} placeholder={data.solved ? 'Odgovor potrjen' : 'Vnesi tujo domeno'} disabled={data.solved || busy}/>
            </div>)}
          </div> : <>
            <label htmlFor="stage-answer">{isChoice ? 'Izbrani odgovor' : stage.kind === 'password' ? 'Predvidljivo geslo' : stage.kind === 'metadata' ? 'Čas posnetka' : stage.kind === 'logs' ? 'Uporabniški račun' : 'Odgovor'}</label>
            <input id="stage-answer" className="answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={300} value={isChoice ? selectedLabel ?? '' : answer} onChange={e => setAnswer(e.target.value)} readOnly={isChoice || passwordVerified} placeholder={data.solved ? 'Odgovor potrjen' : passwordVerified ? 'Geslo prepoznano' : stage.kind === 'password' ? 'Vnesi sestavljeno geslo' : isChoice ? 'Izberi v delovnem oknu' : stage.kind === 'metadata' ? 'HH:MM' : stage.kind === 'logs' ? 'npr. ucenec01' : 'Vnesi kodo'} disabled={data.solved || busy}/>
          </>}
          {stage.kind === 'phishing' && <fieldset className="reasons"><legend>Vsaj dva opozorilna znaka</legend>{stage.reasons?.map(reason => <label className="reason" key={reason.id}><input type="checkbox" checked={reasons.includes(reason.id)} onChange={e => setReasons(previous => e.target.checked ? [...previous, reason.id] : previous.filter(id => id !== reason.id))} disabled={data.solved || busy}/><span>{reason.label}</span></label>)}</fieldset>}
          {passwordVerified && !data.solved && <>
            <p className="password-confirmation" role="status"><Icon name="check" size={16}/>Geslo prepoznano.</p>
            <fieldset className="reasons password-recommendations" ref={recommendationsRef} tabIndex={-1}>
              <legend>Priporočila za bolj varen račun</legend>
              <p>Označi dobre prakse.</p>
              {stage.recommendations?.map(recommendation => <label className="reason" key={recommendation.id}><input type="checkbox" value={recommendation.id} checked={recommendations.includes(recommendation.id)} onChange={event => setRecommendations(previous => event.target.checked ? [...previous, recommendation.id] : previous.filter(id => id !== recommendation.id))} disabled={busy}/><span>{recommendation.label}</span></label>)}
            </fieldset>
          </>}
          {!data.solved && <button className="primary check-button" disabled={busy || (passwordVerified ? !recommendations.length : stage.kind === 'domains' ? domainAnswers.some(value => !value.trim()) : !answer.trim())}>{busy ? 'Preverjanje …' : passwordVerified ? 'Potrdi priporočila' : stage.kind === 'domains' ? 'Preveri domeni' : stage.kind === 'password' ? 'Preveri geslo' : 'Preveri odgovor'}</button>}
        </form>
        {feedback && !feedback.success && <div className="feedback error" role="alert">{feedback.text}</div>}
        <div className="answer-status" role="status">{data.solved ? 'Izziv opravljen' : ''}</div>
        {data.solved && <div className="solved-result"><button className="primary check-button" onClick={onNext} disabled={busy}>{stage.id === 8 ? 'Poglej rezultat' : 'Nadaljuj'}</button><Disclosure className="answer-explanation" title="Razlaga rešitve"><p><Explanation text={data.explanation ?? ''}/></p></Disclosure></div>}
      </section>
      <Disclosure className="hints-panel" title={<>Namigi <span>{data.hints.length} / 2</span></>}><div className="hints-content">{[1, 2].map(index => {
        const revealed = data.hints.find(h => h.index === index);
        if (revealed) return <div className="hint" key={index}><strong>Namig {index}</strong><p>{revealed.text}</p></div>;
        const seconds = Math.max(0, Math.ceil((data.hintUnlockAtPlayMs[index - 1] - elapsedMs) / 1000));
        const wait = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        const needsFirst = index === 2 && !data.hints.some(h => h.index === 1);
        const label = seconds > 0
          ? completed ? `Namig ${index} je ostal zaklenjen` : `Namig ${index} čez ${wait}`
          : needsFirst ? 'Najprej razkrij namig 1' : `Razkrij namig ${index}`;
        return <button className="hint-button" key={index} onClick={() => void revealHint(index)} disabled={busy || seconds > 0 || needsFirst}>{label}</button>;
      })}{hintError && <p className="error-text" role="alert">{hintError}</p>}</div></Disclosure>
      {navigation}
    </aside>
  </div>;
}


function ResetDialog({ busy, onCancel, onReset }: { busy: boolean; onCancel: () => void; onReset: () => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  // Odpiralni element shranimo pred autoFocus v oknu; ob odstranitvi dialoga
  // se nanj vrnemo tudi v brskalnikih, ki fokusa ne obnovijo samodejno.
  const [opener] = useState(() => document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, [opener]);
  return <dialog className="reset-dialog" ref={ref} onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="reset-title" aria-describedby="reset-description"><span className="dialog-icon"><Icon name="reset" size={28}/></span><h2 id="reset-title">Želiš začeti novo preiskavo?</h2><p id="reset-description">Trenutni poskus se konča in njegov čas se ustavi. Na lestvici ostanejo zaključeni rezultati. Novo preiskavo začneš od prve naloge.</p><div className="dialog-actions"><button className="secondary" onClick={onCancel} disabled={busy} autoFocus>Ohrani preiskavo</button><button className="danger" onClick={() => void onReset()} disabled={busy}>{busy ? 'Ponastavljanje …' : 'Začni nov poskus'}</button></div></dialog>;
}
