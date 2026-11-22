import { useEffect, useId, useState } from 'react';

export default function CopyButton({ text, label }: { text: string | null; label: string }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; copied: boolean } | null>(null);
  const current = feedback?.text === text ? feedback : null;

  useEffect(() => {
    if (!feedback?.copied) return;
    const timer = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function copy() {
    if (!text || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setFeedback({ text, copied: true });
    } catch {
      setFeedback({ text, copied: false });
    } finally { setBusy(false); }
  }

  return <span className="copy-control">
    <button type="button" className="copy-button" disabled={!text || busy} aria-label={label} aria-describedby={current && !current.copied ? id : undefined} onClick={() => void copy()}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {current?.copied ? <path d="m5 12 4 4L19 6"/> : <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>}
      </svg>
      {current?.copied ? 'Kopirano' : 'Kopiraj'}
    </button>
    <span id={id} className={current && !current.copied ? 'copy-error' : 'sr-only'} role="status" aria-live="polite">{current ? current.copied ? 'Besedilo je kopirano.' : 'Kopiranje ni uspelo. Označi besedilo in ga kopiraj ročno.' : ''}</span>
  </span>;
}
