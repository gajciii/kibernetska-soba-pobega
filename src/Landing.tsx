import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import type { SessionView } from '../shared/types';
import './landing.css';

type LandingProps = {
  session: SessionView | null;
  busy: boolean;
  onStart: (name: string) => Promise<void>;
  onContinue: () => void;
  onReset: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

const finePointerQuery = '(hover: hover) and (pointer: fine)';
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function canUseCursorLight(): boolean {
  return typeof window !== 'undefined'
    && typeof CSS !== 'undefined'
    && window.matchMedia(finePointerQuery).matches
    && !window.matchMedia(reducedMotionQuery).matches
    && CSS.supports('mask-image', 'radial-gradient(circle, black, transparent)');
}

function TitleLines() {
  return <><span className="landing-title-main">Operacija <span>404.</span></span><span className="landing-title-sub">Sledi so tu. Povežita jih.</span></>;
}

/** Dekorativna svetloba ne prekriva kontrol in nikoli ne skriva osnovnega naslova. */
export default function Landing({ session, busy, onStart, onContinue, onReset, headingRef }: LandingProps) {
  const [name, setName] = useState('');
  const [cursorLight, setCursorLight] = useState(canUseCursorLight);
  const surface = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const pointer = window.matchMedia(finePointerQuery);
    const motion = window.matchMedia(reducedMotionQuery);
    const update = () => setCursorLight(canUseCursorLight());
    pointer.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      pointer.removeEventListener('change', update);
      motion.removeEventListener('change', update);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function moveLight(event: PointerEvent<HTMLElement>) {
    if (!cursorLight || event.pointerType === 'touch') return;
    const surfaceBounds = event.currentTarget.getBoundingClientRect();
    const titleBounds = title.current?.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = surface.current;
      element?.style.setProperty('--landing-pointer-x', `${x - surfaceBounds.left}px`);
      element?.style.setProperty('--landing-pointer-y', `${y - surfaceBounds.top}px`);
      element?.style.setProperty('--landing-title-pointer-x', `${x - (titleBounds?.left ?? surfaceBounds.left)}px`);
      element?.style.setProperty('--landing-title-pointer-y', `${y - (titleBounds?.top ?? surfaceBounds.top)}px`);
      element?.style.setProperty('--landing-light-opacity', '1');
      frame.current = null;
    });
  }

  function leaveLight() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    surface.current?.style.setProperty('--landing-light-opacity', '0');
  }

  return <main id="main" className="landing" data-testid="landing" ref={surface} onPointerMove={moveLight} onPointerLeave={leaveLight}>
    <div className="landing-stars" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <span key={index}/>)}</div>
    {cursorLight && <div className="landing-cursor-light" data-testid="landing-light" aria-hidden="true"/>}
    <div className="landing-content">
      <p className="landing-eyebrow">KIBERNETSKA SOBA POBEGA</p>
      <div className="landing-title-wrap" ref={title}>
        <h1 className="landing-title" ref={headingRef} tabIndex={-1}><TitleLines/></h1>
        {cursorLight && <div className="landing-title landing-title-light" aria-hidden="true"><TitleLines/></div>}
      </div>
      <p className="landing-story">Na šoli Most so zaznali sumljiv prenos datoteke.<br className="landing-desktop-break"/> Odprita preiskovalno mapo in sledita digitalnim dokazom.</p>
      {session ? <div className="landing-resume">
        <p>{session.teamName ? `${session.teamName} · ` : ''}Vajina preiskovalna mapa je shranjena.</p>
        <button type="button" className="landing-start-button" disabled={busy} onClick={onContinue}>{busy ? 'Odpiranje …' : session.completedAt ? 'Odpri zaključeno preiskavo' : 'Nadaljuj preiskavo'}</button>
        <button type="button" className="landing-reset-button" disabled={busy} onClick={onReset}>Začni novo preiskavo</button>
      </div> : <form className="landing-start-form" onSubmit={event => { event.preventDefault(); void onStart(name); }}>
        <label htmlFor="landing-team-name">Ime ekipe <span>(neobvezno)</span></label>
        <div className="landing-start-controls"><input id="landing-team-name" value={name} onChange={event => setName(event.target.value)} maxLength={60} placeholder="Vajino preiskovalno ime" autoComplete="off"/><button className="landing-start-button" disabled={busy}>{busy ? 'Odpiranje …' : 'Začni preiskavo'}</button></div>
        <p className="landing-save-note">Brez registracije. Napredek se shrani v tem brskalniku.</p>
      </form>}
      <ul className="landing-facts" aria-label="O delavnici"><li><strong>8</strong> izzivov</li><li>Delo v paru</li><li><strong>45–60</strong> minut</li></ul>
    </div>
    <svg className="landing-wave" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0 50C170 88 300 88 460 49C630 8 780 8 950 48C1130 91 1290 86 1440 44V110H0Z"/></svg>
  </main>;
}
