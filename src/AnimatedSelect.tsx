import { useEffect, useRef, useState } from 'react';
import type { Ref } from 'react';
import { AnimatedPanel } from './Disclosure';
import './animated-select.css';

export default function AnimatedSelect({ id, value, options, onChange, triggerRef, invalid, describedBy }: {
  id: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
  triggerRef?: Ref<HTMLButtonElement>; invalid?: boolean; describedBy?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  const search = useRef({ text: '', time: 0 });
  function choose(index: number) { onChange(options[index].value); setOpen(false); }
  function show() { setActive(selected); search.current.text = ''; setOpen(true); }

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const option = rootRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`);
    const list = option?.parentElement;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open]);

  return <div className="animated-select" ref={rootRef} data-open={open}>
    <button type="button" id={id} ref={triggerRef} className="animated-select-trigger" role="combobox" aria-haspopup="listbox" aria-controls={`${id}-listbox`} aria-expanded={open} aria-activedescendant={open ? `${id}-option-${active}` : undefined} aria-invalid={invalid} aria-describedby={describedBy}
      onClick={() => open ? setOpen(false) : show()}
      onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={event => {
        const key = event.key;
        if (key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return; }
        if (key === 'Tab') { if (open) choose(active); return; }
        if (key === 'Enter' || key === ' ') { event.preventDefault(); open ? choose(active) : show(); return; }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
          event.preventDefault();
          setActive(key === 'Home' ? 0 : key === 'End' ? options.length - 1 : !open ? selected : Math.max(0, Math.min(options.length - 1, active + (key === 'ArrowDown' ? 1 : -1))));
          setOpen(true); return;
        }
        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          const query = (now - search.current.time < 700 ? search.current.text : '') + key.toLocaleLowerCase();
          search.current = { text: query, time: now };
          const index = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(query));
          if (index >= 0) { setActive(index); setOpen(true); }
        }
      }}>
      <span>{options[selected].label}</span><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
    <AnimatedPanel open={open} className="animated-select-dropdown" role="presentation">
      <ul id={`${id}-listbox`} className="animated-select-options" role="listbox" aria-labelledby={id}>{options.map((option, index) => <li key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={value === option.value} data-active={active === index} data-option-index={index}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>{option.label}<span aria-hidden="true">{value === option.value ? '✓' : ''}</span></li>)}</ul>
    </AnimatedPanel>
  </div>;
}
