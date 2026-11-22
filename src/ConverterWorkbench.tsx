import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { convertText } from '../shared/converters';
import type { ConversionDirection, EncodingMethod } from '../shared/converters';
import type { StageContent } from '../shared/types';
import CopyButton from './CopyButton';
import AnimatedSelect from './AnimatedSelect';
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
  const methodRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const directionRef = useRef<HTMLButtonElement>(null);

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
        <AnimatedSelect id={`${uid}-encoding`} triggerRef={methodRef} value={method} invalid={!!fieldErrors.method} describedBy={fieldErrors.method ? `${uid}-method-error` : undefined} onChange={value => { setMethod(value as EncodingMethod | ''); invalidate('method'); }} options={[{ value: '', label: 'Izberi kodiranje' }, ...methods.map(item => ({ value: item.id, label: item.label }))]}/>
        {fieldErrors.method && <p id={`${uid}-method-error`} className="workbench-field-error" role="alert">{fieldErrors.method}</p>}
      </div>
      <div className="workbench-input">
        <div className="workbench-editor-heading"><label htmlFor={`${uid}-input`}>Besedilo za pretvorbo</label><span>{Array.from(input).length} znakov</span></div>
        <textarea id={`${uid}-input`} ref={inputRef} value={input} onChange={event => { setInput(event.target.value); invalidate('input'); }} spellCheck={false} autoComplete="off" rows={3} maxLength={32768} aria-invalid={!!fieldErrors.input} aria-describedby={fieldErrors.input ? `${uid}-input-error` : undefined}/>
        {fieldErrors.input && <p id={`${uid}-input-error`} className="workbench-field-error" role="alert">{fieldErrors.input}</p>}
      </div>
      <div className="workbench-field">
        <label htmlFor={`${uid}-direction`}>Smer pretvorbe</label>
        <AnimatedSelect id={`${uid}-direction`} triggerRef={directionRef} value={direction} invalid={!!fieldErrors.direction} describedBy={fieldErrors.direction ? `${uid}-direction-error` : undefined} onChange={value => { setDirection(value as ConversionDirection | ''); invalidate('direction'); }} options={[{ value: '', label: 'Izberi smer pretvorbe' }, { value: 'encode', label: 'Kodiranje – besedilo v zapis' }, { value: 'decode', label: 'Dekodiranje – zapis v besedilo' }]}/>
        {fieldErrors.direction && <p id={`${uid}-direction-error`} className="workbench-field-error" role="alert">{fieldErrors.direction}</p>}
      </div>
      <div className="workbench-result">
        <div className="workbench-editor-heading"><span id={`${uid}-output-label`} className="workbench-output-label">Rezultat</span><div className="workbench-result-actions"><span>{result === null ? '' : `${Array.from(result).length} znakov`}</span><CopyButton text={result} label="Kopiraj rezultat"/></div></div>
        <output className={`workbench-output${result === null ? ' empty' : ''}${conversionNotice ? ' conversion-notice' : ''}`} aria-labelledby={`${uid}-output-label`} role="status" aria-live="polite" aria-atomic="true" tabIndex={0}>{result ?? (conversionNotice || '…')}</output>
        {toolError && <p className="workbench-error" role="alert">{toolError}</p>}
      </div>
      <div className="workbench-actions"><button className="primary" type="submit">Pretvori</button></div>
    </form>
  </section>;
}
