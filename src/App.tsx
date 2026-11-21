import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { AnswerResponse, Bootstrap, Finale, SessionView, StageContent, StageResponse, StageSummary } from '../shared/types';
import ConverterWorkbench from './ConverterWorkbench';
import { Mailbox, TrafficViewer } from './InvestigationViewers';
import { BrowserDesk, InvestigationNotes, MetadataDesk, ProfileDesk } from './EvidenceDesks';
import SpotlightTitle from './SpotlightTitle';

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
const stageIcons: IconName[] = ['key', 'terminal', 'mail', 'shield', 'image', 'terminal', 'globe', 'lock'];
const base = import.meta.env.BASE_URL;
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
    throw new Error('Povezava s strežnikom je prekinjena. Vnos je ohranjen. Preverita povezavo in poskusita znova.');
  }
  const data = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !data) throw new Error(data?.error ?? 'Strežnik trenutno ni dosegljiv. Poskusita znova.');
  return data;
}

export default function App() {
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [view, setView] = useState<'intro' | 'stage' | 'finale'>('intro');
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
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { headingRef.current?.focus(); }, [view, stageData?.stage.id]);
  function updateSession(next: SessionView) { setBoot(previous => previous ? { ...previous, session: next } : previous); }
  async function openStage(id: number) {
    setBusy(true); setError('');
    try { setStageData(await request<StageResponse>(`/stages/${id}`, csrf)); setView('stage'); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function openFinale() {
    setBusy(true); setError('');
    try {
      const result = await request<{ finale: Finale; session: SessionView }>('/finale', csrf);
      setFinale(result.finale); updateSession(result.session); setView('finale');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function start(teamName: string) {
    setBusy(true); setError('');
    try {
      const next = await request<Bootstrap>('/session', csrf, { teamName });
      setBoot(next);
      setStageData(await request<StageResponse>('/stages/1', next.csrfToken)); setView('stage');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function reset() {
    setBusy(true); setError('');
    try {
      setBoot(await request<Bootstrap>('/reset', csrf, {})); setStageData(null); setFinale(null); setView('intro'); setResetOpen(false);
    } catch (e) { setError((e as Error).message); setResetOpen(false); }
    finally { setBusy(false); }
  }
  const continueInvestigation = () => session?.completedAt ? void openFinale() : void openStage(session?.currentStage ?? 1);
  return <>
    <a className="skip-link" href="#main">Preskoči na vsebino</a>
    <header className="topbar">
      <button className="brand" onClick={() => setView('intro')} aria-label="Operacija 404, začetni zaslon">
        <span className="brand-mark" aria-hidden="true">[404]</span>
        <span><strong>OPERACIJA <span>404</span></strong><small>KIBERNETSKA SOBA POBEGA</small></span>
      </button>
      <div className="header-stats">
        <span className="header-progress"><span className="muted">Rešene stopnje</span><strong>{session?.solved.length ?? 0}<span className="muted"> / 8</span></strong></span>
        <span className="timer" aria-label={`Čas preiskave ${elapsed(session, now)}`}><Icon name="clock"/><span>{elapsed(session, now)}</span></span>
        <span className="workshop-badge">UČNA SIMULACIJA</span>
      </div>
    </header>
    {error && <div className="global-error" role="alert"><span>{error}</span>{!boot ? <button onClick={() => void bootstrap()} disabled={busy}>Poskusi znova</button> : <button aria-label="Zapri obvestilo" onClick={() => setError('')}><Icon name="close"/></button>}</div>}
    {!boot ? <main id="main" className="loading-screen"><span className="loading-symbol"><Icon name="shield" size={36}/></span><h1>{busy ? 'Pripravljamo preiskovalno mapo …' : 'Povezava ni uspela'}</h1></main> : view === 'intro' ?
      <Intro session={session} busy={busy} onStart={start} onContinue={continueInvestigation} onReset={() => setResetOpen(true)} headingRef={headingRef}/>
      : <div className="workspace">
        <main id="main" className="investigation-main" aria-busy={busy}>
          {view === 'stage' && stageData && <Stage key={stageData.stage.id} data={stageData} session={session!} csrf={csrf} busy={busy} setBusy={setBusy} onSession={updateSession} onData={setStageData} onNext={() => stageData.stage.id === 8 ? void openFinale() : void openStage(stageData.stage.id + 1)} onFinale={openFinale} headingRef={headingRef}/>}
          {view === 'finale' && finale && session && <FinaleView finale={finale} session={session} stages={boot.stages} time={elapsed(session, now)} headingRef={headingRef} onReview={() => void openStage(1)} onReset={() => setResetOpen(true)}/>}
        </main>
        <Sidebar stages={boot.stages} session={session!} active={view === 'stage' ? stageData?.stage.id : undefined} busy={busy} onSelect={openStage} onFinale={openFinale} onReset={() => setResetOpen(true)}/>
      </div>}
    <footer className="footer"><span><strong>FERI</strong><span className="footer-divider">/</span> Kibernetska soba pobega</span><span>Šola Most · izmišljena učna simulacija</span></footer>
    {resetOpen && <ResetDialog busy={busy} onCancel={() => setResetOpen(false)} onReset={reset}/>}
  </>;
}

function Intro({ session, busy, onStart, onContinue, onReset, headingRef }: {
  session: SessionView | null; busy: boolean; onStart: (name: string) => Promise<void>; onContinue: () => void; onReset: () => void; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [name, setName] = useState('');
  return <main id="main" className="intro">
    <div className="intro-index"><span>DELAVNICA DIGITALNE FORENZIKE</span><span>ŠOLA MOST / PRIMER 404</span></div>
    <div className="intro-heading">
      <p className="eyebrow">// dostop do preiskovalne mape</p>
      <h1 ref={headingRef} tabIndex={-1}>Operacija<br/><span>404.</span></h1>
    </div>
    <div className="intro-summary">
      <h2>Kdo je vdrl v šolski sistem?</h2>
      <p className="intro-lead">Nekdo je pustil sledi.<br/>Vidva jih bosta povezala.</p>
      <p className="intro-story">Na izmišljeni šoli Most so odkrili sumljivo prijavno stran in nenavaden prenos zaupne datoteke. Varnostna ekipa je zavarovala nekaj digitalnih sledi, končna preiskovalna mapa pa je še zaklenjena. Kot par digitalnih preiskovalcev morata razvozlati sporočila, pregledati dokaze in ugotoviti, kateri uporabniški račun je bil uporabljen za prenos. Osem rešenih ugank vaju pripelje do zaključnega poročila.</p>
    </div>
    <div className="intro-console">
      <div className="console-caption"><span>preiskovalna_mapa</span><span>[ samo za branje ]</span></div>
      <div className="console-lines" aria-label="Povzetek preiskovalne mape">
        <p><span className="line-number" aria-hidden="true">01</span><code>primer: <span>"šola Most"</span></code></p>
        <p><span className="line-number" aria-hidden="true">02</span><code>dokazi: <span>8</span></code></p>
        <p><span className="line-number" aria-hidden="true">03</span><code>status: <span>"zavarovano"</span></code></p>
        <p><span className="line-number" aria-hidden="true">04</span><code>poročilo: <span>"zaklenjeno"</span></code></p>
      </div>
    </div>
    {session ? <div className="start-form resume-card">
      <p>Preiskovalna mapa je shranjena{session.teamName ? ` · ${session.teamName}` : ''}.</p>
      <button className="primary large" disabled={busy} onClick={onContinue}>{busy ? 'Odpiranje …' : session.completedAt ? 'Odpri zaključeno preiskavo' : 'Nadaljuj preiskavo'}</button>
      <button className="text-button" onClick={onReset} disabled={busy}>Začni novo preiskavo</button>
    </div> : <form className="start-form" onSubmit={(e) => { e.preventDefault(); void onStart(name); }}>
      <label htmlFor="team-name">Ime ekipe <span className="muted">(neobvezno)</span></label>
      <div className="start-controls"><input id="team-name" value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Vajino preiskovalno ime" autoComplete="off"/><button className="primary large" disabled={busy}>{busy ? 'Odpiranje …' : 'Začni preiskavo'}</button></div>
      <small>Brez registracije. Napredek se shrani v tem brskalniku.</small>
    </form>}
    <div className="intro-facts"><span>01 / delo v paru</span><span>02 / osem ugank</span><span>03 / 45–60 minut, brez odštevanja</span></div>
    <div className="simulation-note"><p>Izmišljena izobraževalna simulacija. Vse dokaze in pripomočke najdeta tukaj. Ne potrebujeta drugih strani, programov ali pravih prijavnih podatkov.</p></div>
  </main>;
}

function Sidebar({ stages, session, active, busy, onSelect, onFinale, onReset }: {
  stages: StageSummary[]; session: SessionView; active?: number; busy: boolean; onSelect: (id: number) => Promise<void>; onFinale: () => Promise<void>; onReset: () => void;
}) {
  return <aside className="sidebar">
    <div className="sidebar-heading"><span className="eyebrow">PREISKOVALNA MAPA</span><span className="case-label">PRIMER 404</span></div>
    <div className="progress-label"><span>Napredek preiskave</span><strong>{session.solved.length} / 8</strong></div>
    <progress max="8" value={session.solved.length} aria-label="Število rešenih stopenj"/>
    <nav aria-label="Stopnje preiskave"><ol className="stages-list">{stages.map(stage => {
      const solved = session.solved.includes(stage.id); const locked = stage.id > session.currentStage;
      return <li key={stage.id}><button disabled={locked || busy} aria-current={active === stage.id ? 'step' : undefined} className={`stage-nav ${solved ? 'solved' : ''} ${active === stage.id ? 'active' : ''}`} onClick={() => void onSelect(stage.id)}>
        <span className="step-dot" aria-hidden="true"/>
        <span className="step-number">{String(stage.id).padStart(2, '0')}</span>
        <span className="stage-nav-copy"><strong>{stage.title}</strong><small>{solved ? 'Rešeno' : locked ? 'Zaklenjeno' : 'Trenutna stopnja'}</small></span>
      </button></li>;
    })}</ol></nav>
    {session.completedAt && <button className="secondary finale-nav" onClick={() => void onFinale()} disabled={busy}><Icon name="folder"/>Zaključno poročilo</button>}
    <div className="sidebar-bottom"><div className="team-chip"><Icon name="shield"/><span>{session.teamName || 'Preiskovalna ekipa'}<small>Napredek se samodejno shranjuje.</small></span></div><button className="text-button reset-button" disabled={busy} onClick={onReset}><Icon name="reset" size={16}/>Ponastavi preiskavo</button></div>
  </aside>;
}

function Stage({ data, session, csrf, busy, setBusy, onSession, onData, onNext, onFinale, headingRef }: {
  data: StageResponse; session: SessionView; csrf: string; busy: boolean; setBusy: (busy: boolean) => void; onSession: (s: SessionView) => void; onData: (s: StageResponse) => void; onNext: () => void; onFinale: () => Promise<void>; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const stage = data.stage;
  const [answer, setAnswer] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [hintError, setHintError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setFeedback(null);
    try {
      const result = await request<AnswerResponse>(`/stages/${stage.id}/answer`, csrf, { answer: stage.kind === 'phishing' ? { message: answer, reasons } : answer });
      onSession(result.session); setFeedback({ text: result.message, success: result.correct });
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
  const isChoice = ['phishing', 'password', 'domains'].includes(stage.kind);
  return <>
    <div className="stage-breadcrumb"><span>OPERACIJA 404</span><span>/</span><span>Stopnja {stage.id} od 8</span>{data.solved && <span className="solved-badge"><Icon name="check" size={14}/>Rešeno</span>}</div>
    <div className="stage-title-row"><span className="stage-icon"><Icon name={stageIcons[stage.id - 1]} size={28}/></span><div><span className="eyebrow">{stage.topic}</span><SpotlightTitle key={stage.id} title={stage.title} headingRef={headingRef}/></div></div>
    <p className="stage-intro">{stage.intro}</p>
    <div className={`stage-layout ${['phishing', 'password', 'metadata', 'logs', 'domains'].includes(stage.kind) ? 'stage-layout--workspace' : ''}`}>
      <div className="evidence-column">
        <section className="panel evidence-panel" aria-labelledby="evidence-title"><div className="panel-top"><h2 id="evidence-title"><Icon name="folder"/>Dokazno gradivo</h2><span className="file-id">DOKAZ {String(stage.id).padStart(2, '0')}</span></div>
          <div className="panel-body"><Evidence stage={stage} answer={answer} setAnswer={setAnswer} disabled={data.solved || busy}/></div>
        </section>
        {['caesar', 'base64', 'binary'].includes(stage.kind) && <ConverterWorkbench stage={stage}/>}
        {stage.investigations && <InvestigationNotes notes={stage.investigations}/>}
        {data.solved && stage.kind === 'domains' && <DomainBreakdown stage={stage}/>}
      </div>
      <div className="action-column">
        <section className="panel answer-panel"><div className="panel-top"><h2><Icon name="key"/>Vajina ugotovitev</h2></div><div className="panel-body">
          <p className="question">{stage.question}</p>
          <form onSubmit={submit}>
            {stage.kind === 'phishing' && <fieldset className="reasons"><legend>Označita vsaj dva opozorilna znaka</legend>{stage.reasons?.map(reason => <label className="reason" key={reason.id}><input type="checkbox" checked={reasons.includes(reason.id)} onChange={e => setReasons(previous => e.target.checked ? [...previous, reason.id] : previous.filter(id => id !== reason.id))} disabled={data.solved || busy}/><span>{reason.label}</span></label>)}</fieldset>}
            {!isChoice && <><label htmlFor="stage-answer">{stage.kind === 'metadata' ? 'Ura in minute' : stage.kind === 'logs' ? 'Uporabniški račun' : 'Odgovor'}</label><input id="stage-answer" className="answer-input" autoComplete="off" spellCheck={false} maxLength={300} value={answer} onChange={e => setAnswer(e.target.value)} placeholder={stage.kind === 'metadata' ? 'HH:MM' : 'Vnesita ugotovitev'} disabled={data.solved || busy}/></>}
            {isChoice && !data.solved && <p className="selection-help">{answer ? `Izbrana možnost: ${answer}` : stage.kind === 'phishing' ? 'Najprej izberita sporočilo v dokaznem gradivu.' : 'Izberita eno možnost v dokaznem gradivu.'}</p>}
            {!data.solved && <button className="primary check-button" disabled={busy || !answer.trim()}>{busy ? 'Preverjanje …' : 'Preveri odgovor'}</button>}
          </form>
          {feedback && <div className={`feedback ${feedback.success ? 'success' : 'error'}`} role={feedback.success ? 'status' : 'alert'}>{feedback.success && <Icon name="check"/>}<span>{feedback.text}</span></div>}
          {data.solved && <div className="solved-result"><span className="result-label"><Icon name="check"/>Dokaz je razvozlan</span><p><Explanation text={data.explanation ?? ''}/></p><button className="primary check-button" onClick={onNext} disabled={busy}>{stage.id === 8 ? 'Odpri zaključno poročilo' : 'Nadaljuj'}</button></div>}
        </div></section>
        <section className="panel hints-panel"><div className="panel-top"><h2><Icon name="bulb"/>Potrebujeta namig?</h2><span className="hint-count">{data.hints.length} / 2</span></div><div className="panel-body"><p className="muted hint-intro">Vzemita si čas. Če se zatakne, razkrijta naslednjo sled.</p>{[1, 2].map(index => {
          const revealed = data.hints.find(h => h.index === index);
          return revealed ? <div className="hint" key={index}><strong>Namig {index}</strong><p>{revealed.text}</p></div> : <button className="hint-button" key={index} onClick={() => void revealHint(index)} disabled={busy || (index === 2 && !data.hints.some(h => h.index === 1))}><Icon name="bulb" size={17}/>Razkrij namig {index}</button>;
        })}{hintError && <p className="error-text" role="alert">{hintError}</p>}</div></section>
        <p className="save-note"><Icon name="shield" size={16}/> {session.attempts[String(stage.id)] ?? 0} poskusov · napredek je shranjen</p>
      </div>
    </div>
  </>;
}

function Evidence({ stage, answer, setAnswer, disabled }: { stage: StageContent; answer: string; setAnswer: (s: string) => void; disabled: boolean }) {
  const isWorkspace = ['phishing', 'password', 'metadata', 'logs', 'domains'].includes(stage.kind);
  return <>
    {stage.note && !isWorkspace && <p className="evidence-note">{stage.note}</p>}
    {stage.kind === 'phishing' && <p className="evidence-note">Potrjena šolska domena: <code>sola.example</code>. Primerjajta dejanske naslove z njo.</p>}
    {stage.evidence && <div className="code-evidence"><span className="eyebrow">{stage.kind === 'caesar' ? 'ZAŠIFRIRANO SPOROČILO' : stage.kind === 'base64' ? 'NAJDENI ZAPIS' : 'BINARNO SPOROČILO'}</span><code>{stage.evidence}</code><span className="code-decoration" aria-hidden="true">[ ZAVAROVAN DOKAZ ]</span></div>}
    {stage.kind === 'phishing' && <Mailbox mails={stage.mails ?? []} answer={answer} onAnswer={setAnswer} disabled={disabled}/>}
    {stage.kind === 'password' && <ProfileDesk stage={stage} answer={answer} onAnswer={setAnswer} disabled={disabled}/>}
    {stage.kind === 'metadata' && <MetadataDesk artifacts={stage.artifacts ?? []}/>}
    {stage.kind === 'logs' && <TrafficViewer packets={stage.packets ?? []} logs={stage.logs ?? []}/>}
    {stage.kind === 'domains' && <BrowserDesk choices={stage.choices ?? []} answer={answer} onAnswer={setAnswer} disabled={disabled}/>}
    {stage.note && isWorkspace && <details className="evidence-context"><summary>O izvoru dokazov in simulaciji</summary><p>{stage.note}</p></details>}
  </>;
}

function DomainBreakdown({ stage }: { stage: StageContent }) {
  return <section className="panel breakdown"><div className="panel-top"><h2><Icon name="globe"/>Kako preberemo te naslove</h2></div><div className="panel-body"><p>Protokolu sledi gostitelj, nato pot. Primerjajta celoten zapis gostitelja s potrjeno šolsko domeno.</p>{stage.choices?.map(choice => {
    try { const url = new URL(choice.label); return <div className="url-breakdown" key={choice.id}><strong>Možnost {choice.id}</strong><dl><div><dt>Protokol</dt><dd><code>{url.protocol}//</code></dd></div><div className="hostname"><dt>Gostitelj</dt><dd><code>{url.hostname}</code></dd></div><div><dt>Pot</dt><dd><code>{url.pathname}</code></dd></div></dl></div>; } catch { return null; }
  })}</div></section>;
}

function FinaleView({ finale, session, stages, time, headingRef, onReview, onReset }: { finale: Finale; session: SessionView; stages: StageSummary[]; time: string; headingRef: React.RefObject<HTMLHeadingElement | null>; onReview: () => void; onReset: () => void }) {
  return <div className="finale"><div className="finale-hero"><span className="finale-seal"><Icon name="shield" size={44}/></span><span className="eyebrow">PREISKOVALNA MAPA JE ODKLENJENA</span><h1 ref={headingRef} tabIndex={-1}>{finale.title}</h1><p>Povezala sta digitalne sledi. Zdaj vesta, kaj dokazi povedo — in kje so njihove meje.</p><div className="finale-stats"><div><strong>8 / 8</strong><span>rešenih stopenj</span></div><div><strong>{time}</strong><span>čas preiskave</span></div><div><strong>{session.hintCount}</strong><span>uporabljenih namigov</span></div></div></div><section className="panel report"><div className="panel-top"><h2><Icon name="folder"/>Zaključno poročilo</h2><span className="file-id">PRIMER 404</span></div><div className="panel-body"><ul className="findings">{finale.findings.map(finding => <li key={finding}><Icon name="check"/><span>{finding}</span></li>)}</ul><div className="limitation"><Icon name="shield"/><p>{finale.limitation}</p></div></div></section><section className="panel learning"><div className="panel-top"><h2>Osem korakov. Nove veščine.</h2></div><div className="panel-body"><div className="completed-stages">{stages.map(stage => <div key={stage.id}><span className="completed-icon"><Icon name="check" size={17}/></span><span><strong>{stage.topic}</strong><small>Stopnja {stage.id} · opravljeno</small></span></div>)}</div><p className="learning-summary">{finale.topics.join(' · ')}</p><p>Binarni zapis je način predstavitve podatkov. Ta primer ni šifriranje.</p></div></section><section className="discussion"><span className="eyebrow">ZA POGOVOR PO PREISKAVI</span>{finale.discussion.map((question, index) => <p key={question}><span>0{index + 1}</span>{question}</p>)}</section><div className="finale-actions"><button className="primary" onClick={onReview}>Ponovno preglej dokaze</button><button className="secondary" onClick={onReset}>Nova preiskava</button></div></div>;
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
  return <dialog className="reset-dialog" ref={ref} onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="reset-title" aria-describedby="reset-description"><span className="dialog-icon"><Icon name="reset" size={28}/></span><h2 id="reset-title">Začneta novo preiskavo?</h2><p id="reset-description">Napredek in namigi vajine trenutne ekipe bodo izbrisani. Druga ekipa obdrži svoj napredek.</p><div className="dialog-actions"><button className="secondary" onClick={onCancel} disabled={busy} autoFocus>Ohrani preiskavo</button><button className="danger" onClick={() => void onReset()} disabled={busy}>{busy ? 'Ponastavljanje …' : 'Izbriši in začni znova'}</button></div></dialog>;
}
