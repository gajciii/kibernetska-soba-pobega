import { useId, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import './disclosure.css';

export function AnimatedPanel({ open, children, className = '', id, labelledBy, role = 'region' }: {
  open: boolean; children: ReactNode; className?: string; id?: string; labelledBy?: string; role?: 'region' | 'presentation';
}) {
  return <div className={`animated-panel ${className}`} data-open={open} id={id} role={role} aria-labelledby={labelledBy} aria-hidden={!open} inert={!open}>
    <div className="animated-panel-clip">{children}</div>
  </div>;
}

export default function Disclosure({ title, children, className = '', open: controlledOpen, onOpenChange, triggerRef, rootRef, panelClassName, onEscape }: {
  title: ReactNode; children: ReactNode; className?: string; open?: boolean; onOpenChange?: (open: boolean) => void;
  triggerRef?: Ref<HTMLButtonElement>; rootRef?: Ref<HTMLDivElement>; panelClassName?: string; onEscape?: () => void;
}) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function toggle() { setInternalOpen(!open); onOpenChange?.(!open); }
  return <div className={`disclosure ${className}`} data-open={open} ref={rootRef} onKeyDown={event => {
    if (event.key === 'Escape' && open && onEscape) { event.preventDefault(); onEscape(); }
  }}>
    <button type="button" className="disclosure-trigger" id={`${id}-toggle`} aria-expanded={open} aria-controls={`${id}-content`} onClick={toggle} ref={triggerRef}>
      <span className="disclosure-label">{title}</span>
      <svg className="disclosure-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 9h10"/><path className="disclosure-icon-vertical" d="M9 4v10"/></svg>
    </button>
    <AnimatedPanel open={open} id={`${id}-content`} labelledBy={`${id}-toggle`} className={panelClassName}>{children}</AnimatedPanel>
  </div>;
}
