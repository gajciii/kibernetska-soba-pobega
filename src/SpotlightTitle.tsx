import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import './spotlight-title.css';

const pointerQuery = '(hover: hover) and (pointer: fine)';
const motionQuery = '(prefers-reduced-motion: reduce)';
const supportsSpotlight = () => window.matchMedia(pointerQuery).matches
  && !window.matchMedia(motionQuery).matches
  && CSS.supports('mask-image', 'radial-gradient(circle, transparent, black)');

/** Svetloba poudari naslov, ne prekriva navodil, dokazov ali kontrolnikov. */
export default function SpotlightTitle({ title, headingRef }: { title: string; headingRef: RefObject<HTMLHeadingElement | null> }) {
  const [enabled, setEnabled] = useState(supportsSpotlight);
  const light = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const pointer = window.matchMedia(pointerQuery);
    const motion = window.matchMedia(motionQuery);
    const update = () => setEnabled(supportsSpotlight());
    pointer.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      pointer.removeEventListener('change', update);
      motion.removeEventListener('change', update);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      light.current?.style.setProperty('--light-x', `${x}px`);
      light.current?.style.setProperty('--light-y', `${y}px`);
      frame.current = null;
    });
  }

  return <div className={`spotlight-title ${enabled ? 'spotlight-enabled' : ''}`} data-testid="spotlight-title" onPointerMove={moveLight}>
    <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
    {enabled && <span className="title-light" data-testid="title-light" ref={light} aria-hidden="true">{title}</span>}
  </div>;
}
