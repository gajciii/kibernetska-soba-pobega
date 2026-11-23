import { useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';
import type { SessionView } from '../shared/types';
import './landing.css';

type LandingProps = {
  session: SessionView | null;
  expired: boolean;
  nextStartAt: string | null;
  now: number;
  busy: boolean;
  onStart: (name: string) => Promise<void>;
  onContinue: () => void;
  onReset: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

function TitleLines() {
  return <span className="landing-title-main">Operacija <span>404.</span></span>;
}

export default function Landing({ session, expired, nextStartAt, now, busy, onStart, onContinue, onReset, headingRef }: LandingProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const namedSession = !!session?.teamName.trim();
  const startDeadline = nextStartAt ? Date.parse(nextStartAt) : 0;
  const remainingSeconds = !session && Number.isFinite(startDeadline) ? Math.max(0, Math.ceil((startDeadline - now) / 1000)) : 0;
  const cooldownActive = remainingSeconds > 0;
  const remainingTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  function submitName(event: FormEvent) {
    event.preventDefault();
    if (busy || cooldownActive) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 60) {
      setNameError(trimmed ? 'Ime skupine naj ima največ 60 znakov.' : 'Vnesi ime skupine.');
      nameRef.current?.focus();
      return;
    }
    setName(trimmed);
    setNameError('');
    void onStart(trimmed);
  }

  return <main id="main" className="landing landing-home" data-testid="landing">
    <div className="landing-content">
      <p className="landing-eyebrow">KIBERNETSKA SOBA POBEGA</p>
      <div className="landing-title-wrap ambient-heading" data-ambient-heading>
        <h1 className="landing-title" ref={headingRef} tabIndex={-1}><TitleLines/></h1>
        <div className="landing-title ambient-heading-light" aria-hidden="true"><TitleLines/></div>
      </div>
      <p className="landing-story">V arhivu šole Piramida so zaznali sumljiv prenos datoteke nacrt.pdf. Poveži digitalne sledi in odkrij, kateri skrivni šolski projekt je ogrožen.</p>
      {expired ? <div className="landing-resume">
        <p>Seja je po dveh urah potekla.</p>
        <button type="button" className="landing-start-button" disabled={busy} onClick={onReset}>Začni novo preiskavo</button>
      </div> : session && namedSession ? <div className="landing-resume">
        <p><strong>{session.teamName}</strong> · Shranjena preiskava</p>
        <button type="button" className="landing-start-button" disabled={busy} onClick={onContinue}>{busy ? 'Odpiranje …' : session.completedAt ? 'Odpri zaključeno preiskavo' : 'Nadaljuj preiskavo'}</button>
        <button type="button" className="landing-reset-button" disabled={busy} onClick={onReset}>Začni novo preiskavo</button>
      </div> : <form className="landing-start-form" onSubmit={submitName} noValidate>
        <label htmlFor="landing-team-name">Ime skupine</label>
        <div className="landing-start-controls"><input id="landing-team-name" ref={nameRef} type="text" value={name} onChange={event => { setName(event.target.value); if (nameError) setNameError(''); }} maxLength={60} required aria-invalid={!!nameError} aria-describedby={`landing-name-note${nameError ? ' landing-name-error' : ''}`} placeholder="npr. Modri signal" autoComplete="off" disabled={busy}/><button className="landing-start-button" disabled={busy || cooldownActive} aria-describedby={cooldownActive ? 'landing-start-cooldown' : undefined}>{busy ? 'Odpiranje …' : session ? 'Shrani ime in nadaljuj' : 'Začni preiskavo'}</button></div>
        {nameError && <p className="landing-name-error" id="landing-name-error" role="alert">{nameError}</p>}
        {cooldownActive && <p className="landing-cooldown" id="landing-start-cooldown" data-testid="start-cooldown" role="timer" aria-live="off">Novo preiskavo lahko začneš čez <span>{remainingTime}</span>.</p>}
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{!session && nextStartAt ? cooldownActive ? 'Začetek nove preiskave je začasno onemogočen. Odštevalnik je prikazan ob gumbu.' : 'Zdaj lahko začneš novo preiskavo.' : ''}</span>
        <p className="landing-save-note" id="landing-name-note">Ime skupine bo prikazano na lestvici.</p>
      </form>}
      <ul className="landing-facts" aria-label="O delavnici"><li><strong>8</strong> izzivov</li><li><strong>45–60</strong> minut</li></ul>
    </div>
  </main>;
}
