import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { convertText } from '../shared/converters';
import type { ConversionDirection, EncodingMethod } from '../shared/converters';
import type { StageContent } from '../shared/types';
import './converter-workbench.css';

const methods: { id: EncodingMethod; label: string; help: string }[] = [
  { id: 'base64', label: 'Base64', help: 'Uporablja črke A–Z, a–z, števke, + in /. Na koncu je lahko dopolnilo =. Dekodiranje pričakuje celoten zapis s pravilnim dopolnilom.' },
  { id: 'hex', label: 'Šestnajstiško (HEX)', help: 'En bajt sestavljata dva znaka od 0–9 in A–F. Vnesita pare, ločene s presledki, ali neprekinjen niz parov, brez predpone 0x.' },
  { id: 'binary', label: 'Binarno', help: 'En bajt sestavlja osem ničel ali enic. Skupine ločita s presledki ali novimi vrsticami. Črka A je v ASCII en bajt; šumniki in emoji v UTF-8 potrebujejo več bajtov.' },
  { id: 'url', label: 'URL – odstotkovno', help: 'Zapis % in dve šestnajstiški števki predstavljata bajt. Presledek je %20; znak + tukaj ostane plus. Pretvarjata del naslova kot besedilo, brez odpiranja povezav.' },
  { id: 'decimal', label: 'Decimalni bajti', help: 'Vsak bajt je celo število od 0 do 255. Števila ločita s presledki ali novimi vrsticami; vejice niso ločila.' },
];
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function ConverterWorkbench({ stage }: { stage: StageContent }) {
  const uid = useId();
  const [input, setInput] = useState(stage.evidence ?? '');
  const [method, setMethod] = useState<EncodingMethod | ''>(stage.kind === 'binary' ? 'binary' : '');
  const [direction, setDirection] = useState<ConversionDirection>('decode');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentMethod = methods.find((item) => item.id === method);

  function invalidate() { setResult(null); setError(''); setNotice(''); }
  function submit(event: FormEvent) {
    event.preventDefault();
    setError(''); setNotice(''); setResult(null);
    try {
      if (!input.length) throw new Error('Najprej vnesita besedilo za pretvorbo.');
      if (!method) throw new Error('Najprej izberita kodiranje, ki ga želita preizkusiti.');
      setResult(convertText(input, method, direction));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Pretvorba ni uspela. Preverita vnos.');
    }
  }
  function reuseResult() {
    if (result === null) return;
    setInput(result); setResult(null); setError('');
    setNotice('Rezultat je prenesen v vhod.');
    inputRef.current?.focus();
  }

  return <section className="converter-workbench" aria-label="Pretvornik besedila">
    <form onSubmit={submit}>
      <div className="workbench-controls">
        <div><label htmlFor={`${uid}-encoding`}>Kodiranje</label><select id={`${uid}-encoding`} value={method} onChange={event => { setMethod(event.target.value as EncodingMethod | ''); invalidate(); }}>
          <option value="">Izberita kodiranje</option>{methods.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
        </select></div>
        <div><label htmlFor={`${uid}-direction`}>Smer pretvorbe</label><select id={`${uid}-direction`} value={direction} onChange={event => { setDirection(event.target.value as ConversionDirection); invalidate(); }}>
          <option value="decode">Dekodiranje – zapis v besedilo</option><option value="encode">Kodiranje – besedilo v zapis</option>
        </select></div>
      </div>
      <div className="workbench-editors">
        <div className="workbench-input"><div className="workbench-editor-heading"><label htmlFor={`${uid}-input`}>Besedilo za pretvorbo</label><span>{Array.from(input).length} znakov</span></div>
          <textarea id={`${uid}-input`} ref={inputRef} value={input} onChange={event => { setInput(event.target.value); invalidate(); }} spellCheck={false} autoComplete="off" rows={6} maxLength={32768} aria-describedby={error ? `${uid}-error` : undefined}/>
        </div>
        <div className="workbench-result"><div className="workbench-editor-heading"><span id={`${uid}-output-label`} className="workbench-output-label">Rezultat</span><span>{result === null ? '' : `${Array.from(result).length} znakov`}</span></div>
          <output className={`workbench-output${result === null ? ' empty' : ''}`} aria-labelledby={`${uid}-output-label`} aria-live="polite" aria-atomic="true" tabIndex={0}>{result ?? '—'}</output>
        </div>
      </div>
      {error && <p id={`${uid}-error`} className="workbench-error" role="alert">{error}</p>}
      <div className="workbench-actions"><button className="primary" type="submit">Pretvori</button><button className="workbench-reuse" type="button" onClick={reuseResult} disabled={result === null}>Uporabi rezultat kot vhod</button></div>
      {notice && <p className="workbench-status" role="status">{notice}</p>}
    </form>
    <details className="workbench-help"><summary>Pomoč za kodiranje</summary><p>{currentMethod?.help ?? 'Izberita kodiranje za prikaz njegovega opisa. Pretvornik zapis pretvori samo z izbranim postopkom.'}</p><p>Besedilni formati uporabljajo UTF-8. Za naslednji korak uporabita rezultat kot vhod.</p></details>
    {stage.kind === 'binary' && <details className="workbench-ascii"><summary>Referenčna tabela ASCII · črke A–Z</summary><p>Vse prikazane črke imajo v ASCII in UTF-8 enak osembitni zapis.</p><div className="workbench-ascii-scroll"><table><caption className="sr-only">Črke A do Z z decimalnim in binarnim zapisom ASCII</caption><thead><tr><th scope="col">Črka</th><th scope="col">Decimalno</th><th scope="col">Binarno</th></tr></thead><tbody>{Array.from(alphabet, letter => <tr key={letter}><th scope="row">{letter}</th><td>{letter.charCodeAt(0)}</td><td>{letter.charCodeAt(0).toString(2).padStart(8, '0')}</td></tr>)}</tbody></table></div></details>}
  </section>;
}
