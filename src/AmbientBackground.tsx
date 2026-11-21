import { useEffect, useRef, useState } from 'react';
import './ambient-background.css';

const finePointerQuery = '(hover: hover) and (pointer: fine)';
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const forcedColorsQuery = '(forced-colors: active)';

function canUseLight(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia(finePointerQuery).matches
    && !window.matchMedia(reducedMotionQuery).matches
    && !window.matchMedia(forcedColorsQuery).matches;
}

/** Ena dekorativna površina za vse poglede; položaj kazalca ne sproža izrisov Reacta. */
export default function AmbientBackground() {
  const background = useRef<HTMLDivElement>(null);
  const [lightEnabled, setLightEnabled] = useState(canUseLight);

  useEffect(() => {
    const media = [finePointerQuery, reducedMotionQuery, forcedColorsQuery].map(query => window.matchMedia(query));
    const update = () => setLightEnabled(canUseLight());
    media.forEach(query => query.addEventListener('change', update));
    return () => media.forEach(query => query.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    const shell = background.current?.closest<HTMLElement>('.app-shell');
    if (!shell) return;
    shell.style.setProperty('--ambient-light-opacity', '0');
    if (!lightEnabled) return;
    let frame: number | null = null;
    let pointer: { x: number; y: number } | null = null;

    function paint() {
      frame = null;
      if (!pointer || !shell) return;
      shell.style.setProperty('--ambient-pointer-x', `${pointer.x}px`);
      shell.style.setProperty('--ambient-pointer-y', `${pointer.y}px`);
      shell.style.setProperty('--ambient-light-opacity', '1');
      shell.querySelectorAll<HTMLElement>('[data-ambient-heading]').forEach(heading => {
        const bounds = heading.getBoundingClientRect();
        heading.style.setProperty('--ambient-title-x', `${pointer!.x - bounds.left}px`);
        heading.style.setProperty('--ambient-title-y', `${pointer!.y - bounds.top}px`);
      });
    }
    function schedule() {
      if (frame === null && pointer) frame = window.requestAnimationFrame(paint);
    }
    function move(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    }
    function leave(event: PointerEvent) {
      if (event.relatedTarget) return;
      pointer = null;
      shell?.style.setProperty('--ambient-light-opacity', '0');
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    }
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      shell.style.setProperty('--ambient-light-opacity', '0');
    };
  }, [lightEnabled]);

  return <div className="ambient-background" ref={background} data-testid="ambient-background" aria-hidden="true">
    <div className="ambient-stars">{Array.from({ length: 14 }, (_, index) => <span key={index}/>)}</div>
    {lightEnabled && <div className="ambient-light" data-testid="ambient-light"/>}
    <svg className="ambient-wave" viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 50C170 88 300 88 460 49C630 8 780 8 950 48C1130 91 1290 86 1440 44V110H0Z"/></svg>
  </div>;
}
