import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { AnswerResponse, Bootstrap, Finale, LogRow, SessionView, StageContent, StageResponse, StageSummary } from '../shared/types';
import { binaryToText, caesarDecrypt, decodeBase64 } from '../shared/converters';
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
    <div className="stage-layout">
      <div className="evidence-column">
        <section className="panel evidence-panel" aria-labelledby="evidence-title"><div className="panel-top"><h2 id="evidence-title"><Icon name="folder"/>Dokazno gradivo</h2><span className="file-id">DOKAZ {String(stage.id).padStart(2, '0')}</span></div>
          <div className="panel-body"><Evidence stage={stage} answer={answer} setAnswer={setAnswer} solved={data.solved}/></div>
        </section>
        {['caesar', 'base64', 'binary'].includes(stage.kind) && <Converter stage={stage}/>}
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

function Evidence({ stage, answer, setAnswer, solved }: { stage: StageContent; answer: string; setAnswer: (s: string) => void; solved: boolean }) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  return <>
    {stage.note && <p className="evidence-note">{stage.note}</p>}
    {stage.evidence && <div className="code-evidence"><span className="eyebrow">{stage.kind === 'caesar' ? 'ZAŠIFRIRANO SPOROČILO' : stage.kind === 'base64' ? 'NAJDENI ZAPIS' : 'BINARNO SPOROČILO'}</span><code>{stage.evidence}</code><span className="code-decoration" aria-hidden="true">[ ZAVAROVAN DOKAZ ]</span></div>}
    {stage.kind === 'phishing' && <fieldset className="mailbox"><legend className="sr-only">Izberi sumljivo sporočilo</legend><div className="mailbox-label"><Icon name="mail"/>Šolski e-poštni predal <span>3 sporočila</span></div>{stage.mails?.map(mail => <label className={`mail-card ${answer === mail.id ? 'selected' : ''}`} key={mail.id}><div className="mail-heading"><input type="radio" name="mail" value={mail.id} checked={answer === mail.id} onChange={() => setAnswer(mail.id)} disabled={solved}/><strong>Sporočilo {mail.id}</strong></div><span className="mail-sender">{mail.sender}</span><h3>{mail.subject}</h3><p>{mail.body}</p>{mail.linkUrl && <div className="simulated-link"><span>{mail.linkLabel}</span><small>Dejanski naslov povezave · neaktivno</small><code>{mail.linkUrl}</code></div>}</label>)}</fieldset>}
    {stage.kind === 'password' && <><div className="profile"><div className="profile-heading"><div className="avatar" aria-hidden="true">N</div><div><h3>{stage.profile?.name}</h3><span>{stage.profile?.username}</span></div><span className="profile-badge">UČNI PROFIL</span></div><div className="profile-posts">{stage.profile?.posts.map((post, index) => <div className="profile-post" key={post}><div className={`post-illustration ${index === 1 ? 'pet' : ''}`} aria-hidden="true">{index === 0 ? <svg viewBox="0 0 180 110"><circle cx="125" cy="30" r="15" fill="#f8dc99"/><path d="M20 90 65 30l40 60" fill="#6d77bd"/><path d="m80 90 35-46 45 46" fill="#90c5c1"/><path d="M52 48 65 30l13 20-12-5Z" fill="#e1eaf5"/></svg> : <svg viewBox="0 0 180 110"><ellipse cx="90" cy="96" rx="45" ry="7" fill="#1e3048"/><path d="M65 41Q38 14 42 65l21 6m52-30q27-27 23 24l-21 6" fill="#b58066"/><path d="M60 40q30-20 60 0v35q-30 35-60 0Z" fill="#e7b998"/><circle cx="76" cy="57" r="4" fill="#162b40"/><circle cx="104" cy="57" r="4" fill="#162b40"/><path d="m83 70 7 7 7-7Z" fill="#162b40"/><path d="M90 77v8m0 0-8-3m8 3 8-3" stroke="#162b40" fill="none" strokeWidth="2"/></svg>}</div><p>{post}</p></div>)}</div></div><Choices choices={stage.choices ?? []} answer={answer} setAnswer={setAnswer} disabled={solved}/></>}
    {stage.kind === 'metadata' && <><figure className="photo-evidence"><img src={`${base}hodnik.svg`} alt="Ilustracija praznega šolskega hodnika"/><figcaption>hodnik.jpg · lokalna ilustracija · simulacija metapodatkov</figcaption></figure><button className="secondary" onClick={() => setMetadataOpen(!metadataOpen)} aria-expanded={metadataOpen} aria-controls="metadata"><Icon name="image"/>{metadataOpen ? 'Skrij metapodatke' : 'Poglej metapodatke'}</button>{metadataOpen && <div id="metadata" className="metadata"><span className="eyebrow">SIMULIRAN IZPIS METAPODATKOV</span><pre>{stage.metadata}</pre></div>}</>}
    {stage.kind === 'logs' && <Logs rows={stage.logs ?? []}/>}
    {stage.kind === 'domains' && <Choices choices={stage.choices ?? []} answer={answer} setAnswer={setAnswer} disabled={solved} domains/>}
  </>;
}

function Choices({ choices, answer, setAnswer, disabled, domains = false }: { choices: { id: string; label: string }[]; answer: string; setAnswer: (s: string) => void; disabled: boolean; domains?: boolean }) {
  return <fieldset className={`choices ${domains ? 'domain-choices' : ''}`}><legend>{domains ? 'Preglejta naslovne vrstice' : 'Katero geslo je najbolj predvidljivo?'}</legend>{choices.map(choice => <label className={`choice ${answer === choice.id ? 'selected' : ''}`} key={choice.id}><span className="choice-top"><input type="radio" name="choice" value={choice.id} checked={answer === choice.id} onChange={() => setAnswer(choice.id)} disabled={disabled}/><strong>Možnost {choice.id}</strong>{domains && <span className="browser-dots" aria-hidden="true"><i/><i/><i/></span>}</span><code className={domains ? 'address' : 'password'}>{domains && <Icon name="lock" size={16}/>}<span>{choice.label}</span></code></label>)}</fieldset>;
}

function Logs({ rows }: { rows: LogRow[] }) {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<LogRow | null>(null);
  const filtered = rows.filter(row => Object.values(row).join(' ').toLocaleLowerCase('sl').includes(query.toLocaleLowerCase('sl').trim()));
  return <div className="logs"><h3>Simuliran strežniški dnevnik</h3><p className="muted">20. 11. 2026 · lokalni časi</p><label htmlFor="log-search">Išči po vseh poljih dnevnika</label><input id="log-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Npr. dogodek, račun ali datoteka"/><p className="table-help">Za podrobnosti izberita čas dogodka. Na ozkem zaslonu tabelo pomaknita vstran.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Dnevnik, vodoravno pomična tabela"><table><thead><tr><th scope="col">Čas</th><th scope="col">IP</th><th scope="col">Uporabniški račun</th><th scope="col">Dogodek</th><th scope="col">Datoteka</th><th scope="col">Rezultat</th></tr></thead><tbody>{filtered.map(row => <tr key={row.time} className={selected?.time === row.time ? 'selected-row' : ''}><td><button className="log-row-button" onClick={() => setSelected(row)} aria-pressed={selected?.time === row.time} aria-label={`Podrobnosti dogodka ob ${row.time}`}>{row.time}</button></td><td>{row.ip}</td><td>{row.account}</td><td>{row.event}</td><td>{row.file}</td><td><span className={`log-status ${row.result === 'DENIED' ? 'denied' : ''}`}>{row.result}</span></td></tr>)}</tbody></table></div><p className="muted filter-count" role="status">Prikazano: {filtered.length} od {rows.length} dogodkov</p>{selected && <div className="log-detail"><h4>Podrobnosti dogodka ob {selected.time}</h4><dl>{Object.entries({ 'IP': selected.ip, 'Račun': selected.account, 'Dogodek': selected.event, 'Datoteka': selected.file, 'Rezultat': selected.result }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd><code>{value}</code></dd></div>)}</dl></div>}<dl className="legend"><div><dt>DOWNLOAD</dt><dd>prenos datoteke</dd></div><div><dt>VIEW</dt><dd>ogled datoteke</dd></div><div><dt>SUCCESS</dt><dd>uspešno dejanje</dd></div><div><dt>DENIED</dt><dd>zavrnjen dostop</dd></div><div><dt>LOGIN / LOGOUT</dt><dd>prijava / odjava</dd></div></dl></div>;
}

function Converter({ stage }: { stage: StageContent }) {
  const [input, setInput] = useState(stage.evidence ?? ''); const [shift, setShift] = useState(0); const [output, setOutput] = useState(''); const [error, setError] = useState('');
  const title = stage.kind === 'caesar' ? 'Cezarjev dešifrirnik' : stage.kind === 'base64' ? 'Dekodirnik Base64' : 'Binarni pretvornik';
  const button = stage.kind === 'caesar' ? 'Dešifriraj' : stage.kind === 'base64' ? 'Dekodiraj Base64' : 'Pretvori v besedilo';
  function convert(e: FormEvent) {
    e.preventDefault(); setError(''); setOutput('');
    try { setOutput(stage.kind === 'caesar' ? caesarDecrypt(input, shift) : stage.kind === 'base64' ? decodeBase64(input) : binaryToText(input)); }
    catch (e) { setError((e as Error).message); }
  }
  return <section className="panel converter"><div className="panel-top"><h2><Icon name="terminal"/>{title}</h2><span className="tool-label">PRIPOMOČEK</span></div><div className="panel-body"><form onSubmit={convert}><label htmlFor="converter-input">{stage.kind === 'binary' ? 'Osembitne skupine, ločene s presledki ali novimi vrsticami' : 'Besedilo za pretvorbo'}</label><textarea id="converter-input" value={input} onChange={e => setInput(e.target.value)} rows={stage.kind === 'binary' ? 3 : 2} maxLength={10000} spellCheck={false}/>{stage.kind === 'caesar' && <div className="shift-control"><label htmlFor="shift">Premik nazaj po abecedi A–Z <strong>{shift}</strong></label><input id="shift" type="range" min="0" max="25" value={shift} onChange={e => setShift(Number(e.target.value))}/><div className="range-labels"><span>0 · brez premika</span><span>25</span></div></div>}<button className="secondary" type="submit">{button}</button></form>{error && <p className="converter-error" role="alert">{error}</p>}{output && <div className="converter-result" role="status"><span className="eyebrow">REZULTAT PRETVORBE</span><output>{output}</output><small>Preberita sporočilo in vnesita iskano kodo.</small></div>}{stage.kind === 'binary' && <details className="ascii"><summary>Referenčna tabela ASCII · črke A–Z</summary><div className="ascii-grid">{Array.from({ length: 26 }, (_, index) => <div key={index}><strong>{String.fromCharCode(65 + index)}</strong><code>{(65 + index).toString(2).padStart(8, '0')}</code></div>)}</div></details>}</div></section>;
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
