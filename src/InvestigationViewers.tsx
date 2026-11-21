import { useEffect, useId, useRef, useState } from 'react';
import type { LogRow, Mail, TrafficPacket } from '../shared/types';
import './investigation-viewers.css';

function searchable(value: string): string {
  return value.toLocaleLowerCase('sl-SI').normalize('NFC');
}

function senderName(sender: string): string {
  return sender.replace(/\s*<[^>]+>\s*$/u, '').trim();
}

/** Lokalni učni predal: branje dokazov in izbira odgovora sta ločeni dejanji. */
export function Mailbox({ mails, answer, onAnswer, disabled }: {
  mails: Mail[];
  answer: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [openedId, setOpenedId] = useState<string | null>(null);
  const readerHeading = useRef<HTMLHeadingElement>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const needle = searchable(query.trim());
  const visible = mails.filter(mail => searchable([
    mail.id, mail.sender, mail.recipient, mail.subject, mail.body, mail.preview,
    mail.time, mail.replyTo, mail.attachment, mail.linkUrl,
  ].filter(Boolean).join(' ')).includes(needle));
  const opened = mails.find(mail => mail.id === openedId);
  const chosen = mails.find(mail => mail.id === answer);
  const unreadCount = mails.filter(mail => !readIds.has(mail.id)).length;

  useEffect(() => {
    if (openedId && window.matchMedia('(max-width: 760px)').matches) {
      readerHeading.current?.focus({ preventScroll: true });
      readerHeading.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [openedId]);

  function open(mail: Mail) {
    setOpenedId(mail.id);
    setReadIds(previous => new Set([...previous, mail.id]));
  }

  return <section className="iv-mailbox" aria-label="Simuliran e-poštni predal">
    <div className="iv-app-toolbar">
      <span className="iv-app-count">{mails.length} sporočil · {unreadCount} neprebranih</span>
    </div>
    <div className="iv-inbox-search">
      <label htmlFor={`${id}-mail-search`}>Išči po poštnem predalu</label>
      <div className="iv-search-line"><input id={`${id}-mail-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Pošiljatelj, zadeva ali besedilo" autoComplete="off"/><button type="button" className="iv-text-control" onClick={() => setQuery('')} disabled={!query}>Počisti iskanje</button></div>
    </div>
    <div className="iv-inbox-layout">
      <div className="iv-mail-list-pane">
        <div className="iv-list-caption"><span>PREJETO</span><span role="status">{visible.length} od {mails.length}</span></div>
        {visible.length ? <ul className="iv-mail-list" aria-label="Sporočila v predalu">{visible.map(mail => {
          const read = readIds.has(mail.id);
          const active = openedId === mail.id;
          const marked = answer === mail.id;
          return <li key={mail.id}><button type="button" className={`iv-mail-item${active ? ' is-open' : ''}${read ? '' : ' is-unread'}`} onClick={() => open(mail)} aria-label={`Odpri sporočilo ${mail.id}: ${mail.subject}`} aria-pressed={active} aria-controls={`${id}-mail-reader`}>
            <span className="iv-mail-row-top"><span className="iv-mail-id">{mail.id}</span><span>{read ? 'Prebrano' : 'Neprebrano'}</span><time>{mail.time}</time></span>
            <span className="iv-mail-list-sender">{senderName(mail.sender)}</span>
            <strong className="iv-mail-list-subject">{mail.subject}</strong>
            <span className="iv-mail-preview">{mail.preview}</span>
            {marked && <span className="iv-mail-marked">Označeno kot sumljivo</span>}
          </button></li>;
        })}</ul> : <div className="iv-empty-search"><p>Nobeno sporočilo ne ustreza iskanju.</p><button type="button" className="iv-text-control" onClick={() => setQuery('')}>Prikaži vsa sporočila</button></div>}
      </div>
      <div className="iv-mail-reader" id={`${id}-mail-reader`}>
        {opened ? <article key={opened.id} aria-labelledby={`${id}-mail-subject`}>
          <div className="iv-reader-caption"><span>SPOROČILO {opened.id}</span><span>{opened.time}</span></div>
          <h3 id={`${id}-mail-subject`} ref={readerHeading} tabIndex={-1}>{opened.subject}</h3>
          <dl className="iv-mail-addresses"><div><dt>Od</dt><dd>{opened.sender}</dd></div><div><dt>Za</dt><dd>{opened.recipient}</dd></div></dl>
          <details className="iv-mail-headers"><summary>Glave in podatki sporočila</summary><dl>
            <div><dt>Pošiljatelj</dt><dd><code>{opened.sender}</code></dd></div>
            <div><dt>Prejemnik</dt><dd><code>{opened.recipient}</code></dd></div>
            <div><dt>Čas</dt><dd>{opened.time}</dd></div>
            <div><dt>Odgovori na</dt><dd><code>{opened.replyTo || opened.sender}</code></dd></div>
            {opened.attachment && <div><dt>Priponka</dt><dd>{opened.attachment} <span className="iv-muted">· učni zapis, neaktivno</span></dd></div>}
          </dl></details>
          <div className="iv-mail-body"><p>{opened.body}</p>{opened.linkUrl && <div className="iv-mail-url"><span>{opened.linkLabel || 'Povezava v sporočilu'}</span><small>Dejanski naslov povezave · neaktivno</small><code>{opened.linkUrl}</code></div>}</div>
          {opened.attachment && <p className="iv-mail-attachment"><span>Priloženo</span><code>{opened.attachment}</code></p>}
          <div className="iv-mail-action"><button type="button" className="secondary" disabled={disabled} aria-pressed={answer === opened.id} onClick={() => onAnswer(opened.id)}>Označi sporočilo {opened.id} kot sumljivo</button></div>
        </article> : <div className="iv-reader-empty"><p>Izberita sporočilo.</p></div>}
      </div>
    </div>
    <div className="iv-viewer-status"><span role="status">{chosen ? `Izbrano kot sumljivo: sporočilo ${chosen.id}` : 'Brez označenega sporočila'}</span></div>
  </section>;
}

const protocols: TrafficPacket['protocol'][] = ['ARP', 'DNS', 'TCP', 'TLS', 'HTTP'];

function linkedLog(packet: TrafficPacket, logs: LogRow[]): LogRow | undefined {
  return packet.logTime ? logs.find(log => log.time === packet.logTime) : undefined;
}

function packetMatches(packet: TrafficPacket, logs: LogRow[], query: string, protocol: string): boolean {
  if (protocol && packet.protocol !== protocol) return false;
  const log = linkedLog(packet, logs);
  return searchable([
    packet.number, packet.time, packet.source, packet.destination, packet.protocol,
    packet.length, packet.info, packet.detail,
    ...(log ? [log.time, log.ip, log.account, log.event, log.file, log.result] : []),
  ].join(' ')).includes(searchable(query.trim()));
}

/** Paketni podatki in strežniški dogodek so jasno ločena vira učnih dokazov. */
export function TrafficViewer({ packets, logs }: { packets: TrafficPacket[]; logs: LogRow[] }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [protocol, setProtocol] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const packetHeading = useRef<HTMLHeadingElement>(null);
  const filtered = packets.filter(packet => packetMatches(packet, logs, query, protocol));
  const selected = filtered.find(packet => packet.number === selectedNumber);
  const correlated = selected ? linkedLog(selected, logs) : undefined;

  useEffect(() => {
    if (selectedNumber !== null && window.matchMedia('(max-width: 760px)').matches) {
      packetHeading.current?.focus({ preventScroll: true });
      packetHeading.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [selectedNumber]);

  function applyFilters(nextQuery: string, nextProtocol: string) {
    setQuery(nextQuery);
    setProtocol(nextProtocol);
    setSelectedNumber(previous => packets.some(packet => packet.number === previous && packetMatches(packet, logs, nextQuery, nextProtocol)) ? previous : null);
  }

  return <section className="iv-traffic" aria-label="Simuliran pregledovalnik omrežnega prometa">
    <div className="iv-app-toolbar"><span className="iv-app-count">20. 11. 2026 · lokalni časi</span></div>
    <div className="iv-traffic-filter">
      <div className="iv-packet-search"><label htmlFor={`${id}-packet-search`}>Besedilni filter</label><input id={`${id}-packet-search`} aria-label="Išči po prometu in povezanih dnevnikih" type="search" value={query} onChange={event => applyFilters(event.target.value, protocol)} placeholder="IP, protokol, račun, datoteka ali dejanje" autoComplete="off"/></div>
      <div className="iv-protocol-filter"><label htmlFor={`${id}-protocol`}>Protokol</label><select id={`${id}-protocol`} value={protocol} onChange={event => applyFilters(query, event.target.value)}><option value="">Vsi protokoli</option>{protocols.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
      <button type="button" className="iv-text-control" disabled={!query && !protocol} onClick={() => applyFilters('', '')}>Počisti filtre</button>
    </div>
    <div className="iv-packet-scroll" role="region" aria-label="Paketi, pomična tabela" tabIndex={0}>
      <table className="iv-packet-table"><caption className="sr-only">Lokalni učni zajem omrežnega prometa, {filtered.length} prikazanih paketov.</caption><thead><tr><th scope="col">Št.</th><th scope="col">Čas</th><th scope="col">Izvor</th><th scope="col">Cilj</th><th scope="col">Protokol</th><th scope="col">Bajti</th><th scope="col">Podatki</th></tr></thead><tbody>{filtered.map(packet => <tr key={packet.number} data-selected={selected?.number === packet.number} data-protocol={packet.protocol} onClick={() => setSelectedNumber(packet.number)}>
        <td><button type="button" className="iv-packet-open" aria-label={`Odpri paket ${packet.number}`} aria-pressed={selected?.number === packet.number} aria-controls={`${id}-packet-detail`} onClick={() => setSelectedNumber(packet.number)}>{packet.number}</button></td><td>{packet.time}</td><td>{packet.source}</td><td>{packet.destination}</td><td>{packet.protocol}</td><td className="iv-byte-count">{packet.length}</td><td>{packet.info}</td>
      </tr>)}</tbody></table>
    </div>
    {!filtered.length && <div className="iv-empty-packets" role="status"><p>Noben paket ne ustreza izbranim filtrom.</p><button type="button" className="iv-text-control" onClick={() => applyFilters('', '')}>Prikaži vse pakete</button></div>}
    <div className="iv-packet-status"><span role="status">Prikazano: {filtered.length} od {packets.length} paketov</span><span>{selected ? `Izbran paket: ${selected.number}` : 'Brez izbranega paketa'}</span></div>
    <div className="iv-packet-inspector" id={`${id}-packet-detail`}>
      {selected ? <>
        <section className="iv-packet-detail" aria-labelledby={`${id}-packet-title`}><h3 id={`${id}-packet-title`} ref={packetHeading} tabIndex={-1}>Paket {selected.number} · {selected.protocol}</h3><dl className="iv-packet-fields"><div><dt>Čas</dt><dd>{selected.time}</dd></div><div><dt>Izvor</dt><dd><code>{selected.source}</code></dd></div><div><dt>Cilj</dt><dd><code>{selected.destination}</code></dd></div><div><dt>Dolžina</dt><dd>{selected.length} bajtov</dd></div></dl><p className="iv-packet-description">{selected.detail}</p>{selected.protocol === 'TLS' && <p className="iv-encryption-note">TLS: vsebina je šifrirana. Računi in datoteke so razvidni le iz ločenega strežniškega dnevnika.</p>}</section>
        <section className="iv-correlated-log" aria-labelledby={`${id}-log-title`}><h3 id={`${id}-log-title`}>Simuliran strežniški dnevnik</h3>{correlated ? <><dl className="iv-log-fields"><div><dt>Čas dogodka</dt><dd>{correlated.time}</dd></div><div><dt>IP</dt><dd><code>{correlated.ip}</code></dd></div><div><dt>Uporabniški račun</dt><dd><code>{correlated.account}</code></dd></div><div><dt>Dogodek</dt><dd><code>{correlated.event}</code></dd></div><div><dt>Datoteka</dt><dd><code>{correlated.file}</code></dd></div><div><dt>Rezultat</dt><dd><code>{correlated.result}</code></dd></div></dl></> : <p className="iv-correlation-note">Ni povezanega strežniškega dogodka.</p>}</section>
      </> : <div className="iv-inspector-empty"><p>Izberita paket za podrobnosti.</p></div>}
    </div>
    <div className="iv-traffic-legend"><span>DOWNLOAD = prenos datoteke</span><span>VIEW = ogled</span><span>SUCCESS = uspešno</span><span>DENIED = zavrnjeno</span><span>LOGIN / LOGOUT = prijava / odjava</span></div>
    <details className="iv-protocol-legend"><summary>Legenda omrežnih protokolov</summary><dl><div><dt>ARP</dt><dd>iskanje naslova naprave v lokalnem omrežju</dd></div><div><dt>DNS</dt><dd>pretvorba imena gostitelja v omrežni naslov</dd></div><div><dt>TCP</dt><dd>vzpostavitev in prenos podatkov po povezavi</dd></div><div><dt>TLS</dt><dd>šifrirana povezava; vsebina ni prikazana</dd></div><div><dt>HTTP</dt><dd>spletni zahtevek v tem učnem zajemu</dd></div></dl></details>
  </section>;
}
