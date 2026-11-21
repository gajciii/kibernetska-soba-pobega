import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { AnswerResponse, Bootstrap, Finale, SessionView, StageContent, StageResponse, StageSummary } from '../shared/types';
import ConverterWorkbench from './ConverterWorkbench';
import CaesarWorkbench from './CaesarWorkbench';
import BinaryWorkbench from './BinaryWorkbench';
import FinaleView from './FinaleView';
import { Mailbox, TrafficViewer } from './InvestigationViewers';
import { MetadataDesk } from './EvidenceDesks';
import { BrowserDesk } from './BrowserDesk';
import { PasswordPatterns, ProfileDesk } from './ProfileDesk';
import Landing from './Landing';
import AmbientBackground from './AmbientBackground';
import LeaderboardView from './LeaderboardView';

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
const applications: Record<StageContent['kind'], { name: string; icon: IconName }> = { caesar: { name: 'Šifrirnik', icon: 'key' }, encoding: { name: 'Pretvornik', icon: 'terminal' }, phishing: { name: 'Pošta', icon: 'mail' }, password: { name: 'Javni profil', icon: 'shield' }, metadata: { name: 'Datoteke', icon: 'folder' }, logs: { name: 'Omrežni promet', icon: 'terminal' }, domains: { name: 'Brskalnik', icon: 'globe' }, binary: { name: 'Bitna konzola', icon: 'terminal' } };
const base = import.meta.env.BASE_URL;
type PageView = 'intro' | 'stage' | 'finale' | 'leaderboard';
const isLeaderboardPath = () => window.location.pathname.replace(/\/$/u, '') === `${base}lestvica`.replace(/\/$/u, '');
function elapsed(session: SessionView | null, now: number) {
  if (!session) return '00:00';
  const seconds = Math.max(0, Math.floor(((session.completedAt ? Date.parse(session.completedAt) : now) - Date.parse(session.startedAt)) / 1000));
  const hours = Math.floor(seconds / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
async function request<T>(path: string, csrf: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}api${path}`, {
      credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      ...(body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error('Povezava s strežnikom je prekinjena. Vnos je ohranjen. Preveri povezavo in poskusi znova.');
  }
  const data = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !data) throw new Error(data?.error ?? 'Strežnik trenutno ni dosegljiv. Poskusi znova.');
  return data;
}

export default function App() {
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [view, setView] = useState<PageView>(() => isLeaderboardPath() ? 'leaderboard' : 'intro');
  const gameView = useRef<Exclude<PageView, 'leaderboard'>>('intro');
  const [stageData, setStageData] = useState<StageResponse | null>(null);
  const [finale, setFinale] = useState<Finale | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [resetOpen, setResetOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const session = boot?.session ?? null;
  const csrf = boot?.csrfToken ?? '';
  const bootstrap = useCallback(async () => {
    setBusy(true); setError('');
    try { setBoot(await request<Bootstrap>('/session', '')); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void bootstrap(); }, [bootstrap]);
  useEffect(() => {
    const onPopState = () => { setView(isLeaderboardPath() ? 'leaderboard' : gameView.current); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { headingRef.current?.focus(); }, [view, stageData?.stage.id]);
  function changeView(next: PageView) {
    const path = next === 'leaderboard' ? `${base}lestvica` : base;
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    if (next !== 'leaderboard') gameView.current = next;
    setView(next);
    window.scrollTo({ top: 0, left: 0 });
  }
  function updateSession(next: SessionView) { setBoot(previous => previous ? { ...previous, session: next } : previous); }
  async function openStage(id: number) {
    setBusy(true); setError('');
    try { setStageData(await request<StageResponse>(`/stages/${id}`, csrf)); changeView('stage'); }
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
      else { setStageData(await request<StageResponse>(`/stages/${next.session?.currentStage ?? 1}`, next.csrfToken)); changeView('stage'); }
    } catch (e) { setError((e as Error).message); }
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
    if (gameView.current === 'stage' && stageData) changeView('stage');
    else if (gameView.current === 'finale' && session?.completedAt) {
      if (finale) changeView('finale');
      else void openFinale();
    }
    else changeView('intro');
  };
  return <div className={`app-shell ${view === 'intro' ? 'is-landing' : view === 'finale' ? 'is-finale' : view === 'leaderboard' ? 'is-leaderboard' : 'is-workspace'}`}>
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
    {error && <div className="global-error" role="alert"><span>{error}</span>{!boot ? <button onClick={() => void bootstrap()} disabled={busy}>Poskusi znova</button> : <button aria-label="Zapri obvestilo" onClick={() => setError('')}><Icon name="close"/></button>}</div>}
    {!boot ? <main id="main" className="loading-screen"><span className="loading-symbol"><Icon name="shield" size={36}/></span><h1>{busy ? 'Pripravljamo preiskovalno mapo …' : 'Povezava ni uspela'}</h1></main> : view === 'intro' ?
      <Landing session={session} busy={busy} onStart={start} onContinue={continueInvestigation} onReset={() => setResetOpen(true)} headingRef={headingRef}/>
      : view === 'leaderboard' ? <LeaderboardView headingRef={headingRef} onBack={leaveLeaderboard}/>
      : view === 'stage' && stageData ? <Stage key={stageData.stage.id} data={stageData} csrf={csrf} busy={busy} setBusy={setBusy} onSession={updateSession} onData={setStageData} onNext={() => stageData.stage.id === 8 ? void openFinale() : void openStage(stageData.stage.id + 1)} onFinale={openFinale} headingRef={headingRef}
        navigation={<Sidebar stages={boot.stages} session={session!} active={stageData.stage.id} busy={busy} onSelect={openStage} onFinale={openFinale} onReset={() => setResetOpen(true)}/>}/>
      : <main id="main" className="finale-page" aria-busy={busy}>
        {session && finale && <FinaleView finale={finale} session={session} stages={boot.stages} time={elapsed(session, now)} headingRef={headingRef} onReset={() => setResetOpen(true)} onLeaderboard={() => changeView('leaderboard')}/>}
        </main>}
    <footer className="footer"><span><strong>FERI</strong><span className="footer-divider">/</span> Kibernetska soba pobega</span><span className="footer-credit"><span>Avtorica: Gaja Gujt</span><a href={`${base}license.txt`} target="_blank" rel="noopener noreferrer">Licenca MIT</a></span></footer>
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

function Stage({ data, csrf, busy, setBusy, onSession, onData, onNext, onFinale, headingRef, navigation }: {
  data: StageResponse; navigation: ReactNode; csrf: string; busy: boolean; setBusy: (busy: boolean) => void; onSession: (s: SessionView) => void; onData: (s: StageResponse) => void; onNext: () => void; onFinale: () => Promise<void>; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const stage = data.stage;
  const [answer, setAnswer] = useState('');
  const [browserSource, setBrowserSource] = useState(stage.choices?.[0]?.id ?? '');
  const [domainDrafts, setDomainDrafts] = useState<Record<string, string>>({});
  const domainAnswer = domainDrafts[browserSource] ?? '';
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
      const result = await request<AnswerResponse>(`/stages/${stage.id}/answer`, csrf, { answer: stage.kind === 'phishing' ? { message: answer, reasons } : stage.kind === 'domains' ? { sourceId: browserSource, domain: domainAnswer } : passwordVerified ? { recommendations } : answer });
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
      {stage.kind === 'encoding' && stage.evidence && <div className="source-evidence story-evidence"><span>DOKAZ · obvestilo.dat</span><code>{stage.evidence}</code></div>}
      {stage.kind !== 'encoding' && <section className="task-instruction" aria-labelledby="instruction-heading"><h2 id="instruction-heading">NAVODILO</h2><p>{stage.question}</p></section>}
      <a className="mobile-answer-link" href="#answer-panel">Vnesi odgovor</a>
      <section className="desktop-window" aria-label={`${app.name} — delovno okno`}>
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
          <label htmlFor="stage-answer">{isChoice ? 'Izbrani odgovor' : stage.kind === 'domains' ? 'Tuja domena' : stage.kind === 'password' ? 'Predvidljivo geslo' : stage.kind === 'metadata' ? 'Čas posnetka' : stage.kind === 'logs' ? 'Uporabniški račun' : 'Odgovor'}</label>
          {stage.kind === 'domains' && <p className="answer-source" id="domain-answer-source">Izbrana povezava {(stage.choices?.findIndex(choice => choice.id === browserSource) ?? 0) + 1} od {stage.choices?.length ?? 0}</p>}
          <input id="stage-answer" className="answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} inputMode={stage.kind === 'domains' ? 'url' : 'text'} aria-describedby={stage.kind === 'domains' ? 'domain-answer-source' : undefined} maxLength={300} value={isChoice ? selectedLabel ?? '' : stage.kind === 'domains' ? domainAnswer : answer} onChange={e => stage.kind === 'domains' ? setDomainDrafts(previous => ({ ...previous, [browserSource]: e.target.value })) : setAnswer(e.target.value)} readOnly={isChoice || passwordVerified} placeholder={data.solved ? 'Odgovor potrjen' : passwordVerified ? 'Geslo prepoznano' : stage.kind === 'domains' ? 'domena.example' : stage.kind === 'password' ? 'Vnesi sestavljeno geslo' : isChoice ? 'Izberi v delovnem oknu' : stage.kind === 'metadata' ? 'HH:MM' : stage.kind === 'logs' ? 'npr. ucenec01' : 'Vnesi kodo'} disabled={data.solved || busy}/>
          {stage.kind === 'phishing' && <fieldset className="reasons"><legend>Vsaj dva opozorilna znaka</legend>{stage.reasons?.map(reason => <label className="reason" key={reason.id}><input type="checkbox" checked={reasons.includes(reason.id)} onChange={e => setReasons(previous => e.target.checked ? [...previous, reason.id] : previous.filter(id => id !== reason.id))} disabled={data.solved || busy}/><span>{reason.label}</span></label>)}</fieldset>}
          {passwordVerified && !data.solved && <>
            <p className="password-confirmation" role="status"><Icon name="check" size={16}/>Geslo prepoznano.</p>
            <fieldset className="reasons password-recommendations" ref={recommendationsRef} tabIndex={-1}>
              <legend>Priporočila za varnejši račun</legend>
              <p>Označi dobre prakse.</p>
              {stage.recommendations?.map(recommendation => <label className="reason" key={recommendation.id}><input type="checkbox" value={recommendation.id} checked={recommendations.includes(recommendation.id)} onChange={event => setRecommendations(previous => event.target.checked ? [...previous, recommendation.id] : previous.filter(id => id !== recommendation.id))} disabled={busy}/><span>{recommendation.label}</span></label>)}
            </fieldset>
          </>}
          {!data.solved && <button className="primary check-button" disabled={busy || (passwordVerified ? !recommendations.length : !(stage.kind === 'domains' ? domainAnswer : answer).trim())}>{busy ? 'Preverjanje …' : passwordVerified ? 'Potrdi priporočila' : stage.kind === 'domains' ? 'Preveri domeno' : stage.kind === 'password' ? 'Preveri geslo' : 'Preveri odgovor'}</button>}
        </form>
        {feedback && !feedback.success && <div className="feedback error" role="alert">{feedback.text}</div>}
        <div className="answer-status" role="status">{data.solved ? 'Izziv opravljen' : ''}</div>
        {data.solved && <div className="solved-result"><button className="primary check-button" onClick={onNext} disabled={busy}>{stage.id === 8 ? 'Poglej rezultat' : 'Nadaljuj'}</button><details className="answer-explanation"><summary>Razlaga rešitve</summary><p><Explanation text={data.explanation ?? ''}/></p></details></div>}
      </section>
      <details className="hints-panel"><summary>Namigi <span>{data.hints.length} / 2</span></summary><div className="hints-content">{[1, 2].map(index => {
        const revealed = data.hints.find(h => h.index === index);
        return revealed ? <div className="hint" key={index}><strong>Namig {index}</strong><p>{revealed.text}</p></div> : <button className="hint-button" key={index} onClick={() => void revealHint(index)} disabled={busy || (index === 2 && !data.hints.some(h => h.index === 1))}>Razkrij namig {index}</button>;
      })}{hintError && <p className="error-text" role="alert">{hintError}</p>}</div></details>
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
  return <dialog className="reset-dialog" ref={ref} onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="reset-title" aria-describedby="reset-description"><span className="dialog-icon"><Icon name="reset" size={28}/></span><h2 id="reset-title">Želiš začeti novo preiskavo?</h2><p id="reset-description">Začneš nov poskus od prve naloge. Doseženi rezultat ostane na lestvici.</p><div className="dialog-actions"><button className="secondary" onClick={onCancel} disabled={busy} autoFocus>Ohrani preiskavo</button><button className="danger" onClick={() => void onReset()} disabled={busy}>{busy ? 'Ponastavljanje …' : 'Začni nov poskus'}</button></div></dialog>;
}
