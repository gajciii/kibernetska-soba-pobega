import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { convertText } from '../shared/converters';
import type { ConversionDirection, EncodingMethod } from '../shared/converters';
import type { StageContent } from '../shared/types';
import './converter-workbench.css';

const methods: { id: EncodingMethod; label: string }[] = [
  { id: 'base64', label: 'Base64' },
  { id: 'binary', label: 'Binarno' },
  { id: 'decimal', label: 'Decimalni bajti' },
  { id: 'hex', label: 'Šestnajstiško (HEX)' },
  { id: 'url', label: 'URL – odstotkovno' },
];
type FieldErrors = { method?: string; input?: string; direction?: string };

export default function ConverterWorkbench({ stage }: { stage: StageContent }) {
  const uid = useId();
  const manualSetup = stage.kind === 'encoding';
  const [input, setInput] = useState('');
  const [method, setMethod] = useState<EncodingMethod | ''>('');
  const [direction, setDirection] = useState<ConversionDirection | ''>('');
  const [result, setResult] = useState<string | null>(null);
  const [conversionNotice, setConversionNotice] = useState('');
  const [toolError, setToolError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const methodRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const directionRef = useRef<HTMLSelectElement>(null);

  function invalidate(field: keyof FieldErrors) {
    setResult(null);
    setConversionNotice('');
    setToolError('');
    setFieldErrors(previous => ({ ...previous, [field]: undefined }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    setConversionNotice('');
    setToolError('');
    const errors: FieldErrors = {};
    if (!method) errors.method = 'Izberi kodiranje.';
    if (!input.length) errors.input = 'Vnesi besedilo za pretvorbo.';
    if (!direction) errors.direction = 'Izberi smer pretvorbe.';
    setFieldErrors(errors);
    if (errors.method || errors.input || errors.direction) {
      if (errors.method) methodRef.current?.focus();
      else if (errors.input) inputRef.current?.focus();
      else directionRef.current?.focus();
      return;
    }
    if (!method || !direction) return;
    try {
      setResult(convertText(input, method, direction));
    } catch (failure) {
      if (manualSetup) {
        setConversionNotice('S temi nastavitvami zapisa ni mogoče pretvoriti. Preveri prepis in namig v zgodbi.');
      } else {
        setToolError(failure instanceof Error ? failure.message : 'Pretvorba ni uspela. Preveri vnos.');
      }
    }
  }

  return <section className="converter-workbench" aria-label="Pretvornik besedila">
    <form className="workbench-form" onSubmit={submit} noValidate>
      <div className="workbench-field">
        <label htmlFor={`${uid}-encoding`}>Kodiranje</label>
        <div className="workbench-select-wrap"><select id={`${uid}-encoding`} ref={methodRef} value={method} aria-invalid={!!fieldErrors.method} aria-describedby={fieldErrors.method ? `${uid}-method-error` : undefined} onChange={event => { setMethod(event.target.value as EncodingMethod | ''); invalidate('method'); }}>
          <option value="">Izberi kodiranje</option>{methods.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
        </select></div>
        {fieldErrors.method && <p id={`${uid}-method-error`} className="workbench-field-error" role="alert">{fieldErrors.method}</p>}
      </div>
      <div className="workbench-input">
        <div className="workbench-editor-heading"><label htmlFor={`${uid}-input`}>Besedilo za pretvorbo</label><span>{Array.from(input).length} znakov</span></div>
        <textarea id={`${uid}-input`} ref={inputRef} value={input} onChange={event => { setInput(event.target.value); invalidate('input'); }} spellCheck={false} autoComplete="off" rows={3} maxLength={32768} aria-invalid={!!fieldErrors.input} aria-describedby={fieldErrors.input ? `${uid}-input-error` : undefined}/>
        {fieldErrors.input && <p id={`${uid}-input-error`} className="workbench-field-error" role="alert">{fieldErrors.input}</p>}
      </div>
      <div className="workbench-field">
        <label htmlFor={`${uid}-direction`}>Smer pretvorbe</label>
        <div className="workbench-select-wrap"><select id={`${uid}-direction`} ref={directionRef} value={direction} aria-invalid={!!fieldErrors.direction} aria-describedby={fieldErrors.direction ? `${uid}-direction-error` : undefined} onChange={event => { setDirection(event.target.value as ConversionDirection | ''); invalidate('direction'); }}>
          <option value="">Izberi smer pretvorbe</option><option value="encode">Kodiranje – besedilo v zapis</option><option value="decode">Dekodiranje – zapis v besedilo</option>
        </select></div>
        {fieldErrors.direction && <p id={`${uid}-direction-error`} className="workbench-field-error" role="alert">{fieldErrors.direction}</p>}
      </div>
      <div className="workbench-result">
        <div className="workbench-editor-heading"><span id={`${uid}-output-label`} className="workbench-output-label">Rezultat</span><span>{result === null ? '' : `${Array.from(result).length} znakov`}</span></div>
        <output className={`workbench-output${result === null ? ' empty' : ''}${conversionNotice ? ' conversion-notice' : ''}`} aria-labelledby={`${uid}-output-label`} role="status" aria-live="polite" aria-atomic="true" tabIndex={0}>{result ?? (conversionNotice || '—')}</output>
        {toolError && <p className="workbench-error" role="alert">{toolError}</p>}
      </div>
      <div className="workbench-actions"><button className="primary" type="submit">Pretvori</button></div>
    </form>
  </section>;
}
