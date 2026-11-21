import { describe, expect, it } from 'vitest';
import { finale, getExplanation, getFeedback, getHint, getStage, stageSummaries, validateAnswer, validateProfilePassword } from '../server/content.js';
import { caesarDecrypt, convertText, hexToText, textToHex } from '../shared/converters.js';

const stage2Intermediate = 'UFJJSkFWSVRFTEo6IExVS0EgS09WQUMuIEtPREEgTUFQRTogUFJFREFMLg==';

describe('strežniško preverjanje osmih stopenj', () => {
  const correct: [number, unknown][] = [
    [1, 'PIRAMIDA'], [2, 'PREDAL'], [3, { message: 'B', reasons: ['domain', 'link'] }],
    [4, { recommendations: ['long', 'unique', 'manager', 'mfa'] }], [5, '10:42'], [6, 'ucenec17'], [7, { sourceId: 'C', domain: 'piramiida.si' }], [8, 'BRUCOVANJE'],
  ];

  it.each(correct)('sprejme pravilen odgovor stopnje %i', (id, answer) => {
    expect(validateAnswer(id, answer)).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('zavrne nepravilen odgovor in napačne tipe stopnje %i', (id) => {
    for (const invalid of ['narobe', '', null, undefined, 42, true, {}, [], ['A']]) {
      expect(validateAnswer(id, invalid)).toBe(false);
    }
  });

  it('prilagodi normalizacijo besednim kodam', () => {
    expect(validateAnswer(1, '  koda   je \n piramida  ')).toBe(true);
    expect(validateAnswer(1, '  piramida  ')).toBe(true);
    expect(validateAnswer(1, 'P I R A M I D A')).toBe(false);
    expect(validateAnswer(1, 'MOST')).toBe(false);
    expect(validateAnswer(1, 'KODA JE MOST')).toBe(false);
    expect(validateAnswer(2, ' koda :  predal ')).toBe(true);
    expect(validateAnswer(2, 'KODA:PREDAL')).toBe(true);
    expect(validateAnswer(2, ' pReDaL ')).toBe(true);
    expect(validateAnswer(2, 'SOVA')).toBe(false);
    expect(validateAnswer(6, ' UceNec17  ')).toBe(true);
    expect(validateAnswer(8, '  bRuCoVaNjE\n')).toBe(true);
    expect(validateAnswer(8, 'BRU COVANJE')).toBe(false);
    expect(validateAnswer(8, 'ISKRA')).toBe(false);
    expect(validateAnswer(8, 'KLJUC')).toBe(false);
    expect(validateAnswer(8, 'KLJUČ')).toBe(false);
  });

  it('Cezarjev dokaz razkrije novo kodo PIRAMIDA', () => {
    const decoded = caesarDecrypt(getStage(1)!.evidence!, 3);
    expect(decoded).toBe('KODA JE PIRAMIDA');
    expect(validateAnswer(1, decoded)).toBe(true);
    expect(validateAnswer(1, decoded.split(' ').at(-1))).toBe(true);
  });

  it('ločuje ročni vnos gesla od priporočil in zahteva tujo domeno', () => {
    expect(validateAnswer(4, 'a')).toBe(false);
    expect(validateAnswer(4, 'B')).toBe(false);
    expect(validateAnswer(4, 'C')).toBe(false);
    expect(validateAnswer(4, 'Luna2009')).toBe(false);
    expect(getStage(4)?.choices).toBeUndefined();
    expect(validateAnswer(7, 'A')).toBe(false);
    expect(validateAnswer(7, 'B')).toBe(false);
    expect(validateAnswer(7, 'C')).toBe(false);
  });

  it('sprejme obe zaporedji predvidljivega gesla, velikost črk in izrecno dovoljeni klicaj', () => {
    for (const answer of ['luna2009', '2009luna', ' LUNA2009 ', '2009Luna', 'Luna2009!', ' 2009LUNA! ']) {
      expect(validateProfilePassword(answer)).toBe(true);
      expect(validateAnswer(4, answer)).toBe(false);
    }
    for (const answer of ['A', 'Luna', '2009', 'luna 2009', '2009-luna', 'luna2009!!', 'luna2009?', 'Luna2008', '', null, {}, 2009]) {
      expect(validateProfilePassword(answer)).toBe(false);
    }
  });

  it('zahteva vsa štiri različna ustrezna priporočila brez odvečnih, napačnih ali neznanih možnosti', () => {
    expect(validateAnswer(4, { recommendations: ['mfa', 'manager', 'unique', 'long'] })).toBe(true);
    for (const recommendations of [
      [], ['long'], ['long', 'unique', 'manager'],
      ['long', 'unique', 'manager', 'reuse'],
      ['long', 'unique', 'manager', 'personal'],
      ['long', 'unique', 'manager', 'unknown'],
      ['long', 'unique', 'manager', 'mfa', 'reuse'],
      ['long', 'unique', 'manager', 'manager'],
      ['long', 'unique', 'manager', 1], 'long,unique,manager,mfa',
    ]) expect(validateAnswer(4, { recommendations })).toBe(false);
  });

  it('pogojuje phishing s sporočilom B in vsaj dvema različnima pravilnima razlogoma', () => {
    for (const answer of [
      { message: 'B', reasons: [] },
      { message: 'B', reasons: ['domain'] },
      { message: 'B', reasons: ['domain', 'domain'] },
      { message: 'A', reasons: ['domain', 'link'] },
      { message: 'C', reasons: ['domain', 'link'] },
      { message: 'B', reasons: ['domain', 'link', 'greeting'] },
      { message: 'B', reasons: ['domain', 'link', 'https'] },
      { message: 'B', reasons: ['domain', 'link', 1] },
      { message: 'B', reasons: ['domain', 'unknown'] },
      { message: 'B', reasons: 'domain,link' },
    ]) expect(validateAnswer(3, answer)).toBe(false);
    expect(validateAnswer(3, { message: 'B', reasons: ['urgency', 'credentials'] })).toBe(true);
    expect(validateAnswer(3, { message: 'B', reasons: ['domain', 'link', 'urgency', 'credentials'] })).toBe(true);
  });

  it('sprejme le izrecno dovoljene oblike časa nastanka, ne časa spremembe', () => {
    for (const value of ['10:42', '10.42', '10:42:17', ' 10:42 ']) expect(validateAnswer(5, value)).toBe(true);
    for (const value of ['11:15', '11:15:00', '10:42:00', '1042', '10 : 42', '010:42', '10.42.17']) {
      expect(validateAnswer(5, value)).toBe(false);
    }
    expect(getStage(5)?.metadata).toBe('Ime datoteke: hodnik.jpg\nVelikost: 2,4 MB\nČas nastanka posnetka: 20. 11. 2026 10:42:17\nČas spremembe: 20. 11. 2026 11:15:00\nČasovni pas: UTC+01:00');
  });

  it('ločuje uspešen prenos zaupne datoteke od zavrnjenega prenosa, ogleda in javne datoteke', () => {
    expect(validateAnswer(6, 'ucenec12')).toBe(false);
    expect(validateAnswer(6, 'ucenec08')).toBe(false);
    expect(validateAnswer(6, 'ucenec05')).toBe(false);
    const rows = getStage(6)?.logs;
    expect(rows).toHaveLength(16);
    expect(rows?.filter((row) => row.event === 'DOWNLOAD' && row.file === '/zaupno/nacrt.pdf' && row.result === 'SUCCESS'))
      .toEqual([{ time: '10:45:12', ip: '10.0.0.17', account: 'ucenec17', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' }]);
  });

  it('ne izmisli dodatne devete uganke', () => {
    expect(getStage(9)).toBeUndefined();
    expect(getStage(-1)).toBeUndefined();
    expect(validateAnswer(9, 'BRUCOVANJE')).toBe(false);
    expect(finale.title).toBe('Odkril si projekt BRUCOVANJE.');
    expect(finale.topics).toHaveLength(8);
    expect(Object.keys(finale).sort()).toEqual(['title', 'topics']);
  });
});

describe('razširjeni dokazi ostanejo skladni z obstoječimi rešitvami', () => {
  it('ponudi sedem različnih sporočil, vendar samo B izpolni pogoj za phishing', () => {
    const stage = getStage(3)!;
    const mails = stage.mails!;
    expect(stage.intro).toMatch(/Luk[ae] Kovača?/u);
    expect(stage.intro).toContain('piramida.si');
    expect(mails.map(mail => mail.id)).toEqual(['A', 'C', 'D', 'B', 'E', 'F', 'G']);
    expect(new Set(mails.map(mail => mail.subject)).size).toBe(7);
    for (const mail of mails) {
      expect(mail.recipient).toBe('Luka Kovač <luka.kovac@piramida.si>');
      expect(mail.preview).toBeTruthy();
      expect(mail.time).toMatch(/^\d{2}:\d{2}$/u);
      expect(mail.sender).toContain('@');
      expect(validateAnswer(3, { message: mail.id, reasons: ['domain', 'link'] })).toBe(mail.id === 'B');
      if (mail.id !== 'B') {
        expect(mail.sender).toMatch(/@piramida\.si>$/u);
        if (mail.linkUrl) {
          const host = new URL(mail.linkUrl).hostname;
          expect(host === 'piramida.si' || host === 'ucilnica.piramida.si').toBe(true);
        }
      }
    }
    expect(mails.find(mail => mail.id === 'B')!.linkUrl).toBe('https://piramida.si.piramiida.si/prijava');
    expect(getStage(7)!.choices!.map(choice => choice.label)).toContain(mails.find(mail => mail.id === 'B')!.linkUrl);
    expect(mails.find(mail => mail.id === 'D')!.sender).toBe('Šolska IT podpora <podpora@piramida.si>');
    expect(mails.find(mail => mail.id === 'F')!.attachment).toBeTruthy();
    expect(getExplanation(3)).toContain('ujemajoča se domena sama ne jamči varnosti');
  });

  it('poveže Lukov profil z lokalnimi fotografijami in javnima podatkoma brez ključa odgovorov', () => {
    const profile = getStage(4)!.profile!;
    expect(profile.name).toBe('Luka Kovač');
    expect(profile.username).toBe('@luka.kovac');
    expect(profile.bio).toContain('2009');
    expect(profile.avatar).toBe('/profile/luka.jpg');
    expect(profile.posts).toHaveLength(3);
    expect(profile.posts.some(post => post.caption.includes('Luna'))).toBe(true);
    for (const post of profile.posts) {
      expect(post.image).toMatch(/^\/profile\/[a-z]+\.jpg$/u);
      expect(post.alt).toBeTruthy();
      expect(post.caption).toBeTruthy();
      expect(post.location).toBeTruthy();
    }
    const stage = getStage(4)!;
    expect(stage.recommendations?.map(choice => choice.id)).toEqual(['long', 'reuse', 'manager', 'personal', 'unique', 'mfa']);
    expect(JSON.stringify(stage)).not.toMatch(/luna2009|2009luna|correctAnswer|isCorrect/iu);
  });

  it('zahteva tujo domeno, ki ustreza izbrani ponarejeni povezavi', () => {
    const choices = getStage(7)!.choices!;
    expect(choices).toHaveLength(6);
    expect(choices.map(choice => choice.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(choices[2].label).toBe('https://piramida.si.piramiida.si/prijava');
    const domains = { C: 'piramiida.si', D: 'pirameda.si', E: 'piramida-prijava.si' };
    for (const [sourceId, domain] of Object.entries(domains)) {
      expect(validateAnswer(7, { sourceId, domain })).toBe(true);
      expect(validateAnswer(7, { sourceId, domain: `  ${domain.toUpperCase()}  ` })).toBe(true);
      for (const other of Object.values(domains).filter(value => value !== domain)) {
        expect(validateAnswer(7, { sourceId, domain: other })).toBe(false);
      }
    }
    for (const choice of choices) {
      const host = new URL(choice.label).hostname;
      expect(['piramida.si', 'ucilnica.piramida.si', 'piramida.si.piramiida.si', 'pirameda.si', 'piramida-prijava.si']).toContain(host);
    }
  });

  it('zavrne šolsko domeno, celoten URL, pot, nepopolno domeno in stare odgovore', () => {
    for (const domain of [
      'piramida.si', 'ucilnica.piramida.si', 'piramida.si.piramiida.si',
      'https://piramiida.si', 'https://piramida.si.piramiida.si/prijava',
      'piramiida.si/prijava', 'piramiida.si?jezik=sl',
      'piramiida', '.si', 'si', 'piramiida.si.',
      'www.piramiida.si', 'piramiida.si:443',
      'piramiida .si', '', null, 42, {}, [],
    ]) expect(validateAnswer(7, { sourceId: 'C', domain })).toBe(false);
    for (const sourceId of ['A', 'B', 'F', 'c', 'Z', '', null, 7, ['C']]) {
      expect(validateAnswer(7, { sourceId, domain: 'piramiida.si' })).toBe(false);
    }
    for (const answer of ['C', 'piramiida.si', { sourceId: 'C' }, { domain: 'piramiida.si' }, { sourceId: 'C', url: 'https://piramida.si/prijava' }, [{ sourceId: 'C', domain: 'piramiida.si' }]]) {
      expect(validateAnswer(7, answer)).toBe(false);
    }
  });

  it('med dvanajstimi slikami poveže predzadnjo fotografijo z opisom in slovenskimi metapodatki', () => {
    const stage = getStage(5)!;
    const artifacts = stage.artifacts!;
    expect(artifacts).toHaveLength(12);
    expect(new Set(artifacts.map(artifact => artifact.id)).size).toBe(12);
    expect(artifacts.map(artifact => artifact.name)).toEqual([
      'ucilnica.jpg', 'dvorisce.jpg', 'knjiznica.jpg',
      'telovadnica.jpg', 'projekt.jpg', 'stopnisce.jpg', 'obvestilo.png', 'gore.jpg',
      'jedilnica.jpg', 'vhod.jpg', 'hodnik.jpg', 'tabla.jpg',
    ]);
    const required = artifacts[10];
    expect(required.id).toBe('hodnik');
    expect(required.metadata).toBe(stage.metadata);
    expect(required.description).toContain('rdečim nahrbtnikom');
    expect(stage.intro).toContain('rdečim nahrbtnikom');
    expect(stage.intro).toContain('11:15');
    expect(stage.intro).toContain('metapodatki');
    expect(stage.intro).not.toMatch(/hodnik\.jpg|10:42|Čas nastanka posnetka/u);
    expect(stage.question).toBe('Ob kateri uri je bila fotografija dejansko posneta? Odgovori v obliki HH:MM.');
    for (const artifact of artifacts) {
      const photo = artifact.kind === 'photo';
      expect(artifact.metadata).toContain(`Ime datoteke: ${artifact.name}`);
      expect(artifact.metadata).toContain(`Velikost: ${artifact.size}`);
      expect(artifact.metadata).toContain('Časovni pas: UTC+01:00');
      expect(artifact.metadata.split('\n').map(line => line.split(':')[0])).toEqual([
        'Ime datoteke', 'Velikost', photo ? 'Čas nastanka posnetka' : 'Čas ustvarjanja', 'Čas spremembe', 'Časovni pas',
      ]);
      expect(artifact.size).toBeTruthy();
      expect(artifact.description).toBeTruthy();
      expect(artifact.alt).toBeTruthy();
      const folder = artifact.id === 'gore' ? 'profile' : 'evidence';
      expect(artifact.preview).toBe(`/${folder}/${artifact.name}`);
      if (artifact.name !== 'hodnik.jpg') expect(artifact.metadata).not.toContain('10:42');
    }
    expect(artifacts[0].metadata).toContain('Čas nastanka posnetka: 20. 11. 2026 08:16:09');
    expect(artifacts[0].metadata).toContain('Čas spremembe: 20. 11. 2026 08:25:44');
    expect(artifacts[6].metadata).toContain('Čas ustvarjanja: 20. 11. 2026 09:51:06');
    expect(artifacts[6].metadata).toContain('Čas spremembe: 20. 11. 2026 10:03:28');
    expect(artifacts[6].metadata).not.toContain('Čas nastanka posnetka');
    expect(JSON.stringify(stage)).not.toMatch(/correctAnswer|isCorrect|DateTimeOriginal|ModifyDate/u);
    expect(getHint(5, 2)).toContain('Čas nastanka posnetka');
    expect(getExplanation(5)).toContain('ne pove, kaj je bilo spremenjeno');
    for (const otherTime of ['08:16', '08:25', '09:51', '10:03', '11:15']) expect(validateAnswer(5, otherTime)).toBe(false);
  });

  it('v paketnem izboru poveže vse aplikacijske dogodke z ustreznim časom in naslovom', () => {
    const stage = getStage(6)!;
    const packets = stage.packets!;
    const logs = stage.logs!;
    expect(packets).toHaveLength(32);
    expect(packets.map(packet => packet.number)).toEqual(Array.from({ length: 32 }, (_, index) => index + 1));
    expect(packets.map(packet => packet.time)).toEqual(packets.map(packet => packet.time).sort());
    expect(new Set(packets.map(packet => packet.protocol))).toEqual(new Set(['ARP', 'DNS', 'TCP', 'TLS', 'HTTP']));
    expect(new Set(logs.map(log => log.time)).size).toBe(logs.length);
    for (const packet of packets) {
      expect(packet.time).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/u);
      expect(packet.length).toBeGreaterThan(0);
      expect(packet.info).toBeTruthy();
      expect(packet.detail).toBeTruthy();
      if (packet.logTime) {
        const log = logs.find(row => row.time === packet.logTime);
        expect(log).toBeDefined();
        expect(packet.protocol).toBe('TLS');
        expect(packet.time.startsWith(log!.time)).toBe(true);
        expect([packet.source, packet.destination]).toContain(log!.ip);
      }
    }
    for (const log of logs) expect(packets.some(packet => packet.logTime === log.time)).toBe(true);
    expect(packets.find(packet => packet.number === 28)!.logTime).toBe('10:45:12');
    for (const time of ['10:41:23', '10:42:31', '10:45:12']) expect(packets.some(packet => packet.logTime === time)).toBe(true);
  });

  it('ne predstavlja računov ali poti kot berljive vsebine šifriranih paketov', () => {
    const stage = getStage(6)!;
    for (const packet of stage.packets!.filter(packet => packet.protocol === 'TLS')) {
      expect(`${packet.info} ${packet.detail}`).not.toMatch(/ucenec\d{2}|\/zaupno\/|\/javno\//u);
    }
    expect(stage.note).toContain('TLS sam ne razkrije');
    expect(stage.note).toContain('učna korelacija');
    expect(getExplanation(6)).toContain('različna vira');
    const broadcast = stage.packets!.filter(packet => [1, 20].includes(packet.number));
    expect(broadcast).toHaveLength(2);
    expect(broadcast.every(packet => packet.protocol === 'ARP')).toBe(true);
    expect(broadcast.every(packet => packet.destination === 'ff:ff:ff:ff:ff:ff')).toBe(true);
  });

  it('zapiski usmerjajo pregled dokazov brez izpisanih končnih kod', () => {
    for (const [id, solution] of [[1, 'PIRAMIDA'], [2, 'PREDAL'], [8, 'BRUCOVANJE']] as const) {
      const notes = getStage(id)!.investigations!;
      expect(notes).toHaveLength(3);
      expect(new Set(notes.map(note => note.id)).size).toBe(3);
      for (const note of notes) {
        expect(note.title).toBeTruthy();
        expect(note.text).toBeTruthy();
        expect(`${note.title} ${note.text}`.toUpperCase()).not.toMatch(new RegExp(`\\b${solution}\\b`, 'u'));
      }
    }
    const coding = getStage(2)!;
    expect(coding.topic).toBe('Kodiranja');
    expect(coding.kind).toBe('encoding');
    expect(`${coding.intro} ${coding.question} ${coding.note}`).not.toContain('Base64');
    expect(`${coding.intro} ${coding.question}`).not.toContain('HEX');
    expect(coding.intro).toContain('šestnajst');
    expect(getHint(2, 2)).toContain('HEX');
    expect(getHint(2, 2)).toContain('Base64');
    expect(finale.topics).toContain('Kodiranja (HEX in Base64)');
  });

  it('odpre obe plasti HEX in Base64 ter šele nato pridobi kodo', () => {
    const evidence = getStage(2)!.evidence!;
    expect(evidence.split(' ').every(pair => /^[0-9A-F]{2}$/u.test(pair))).toBe(true);
    const intermediate = convertText(evidence, 'hex', 'decode');
    expect(intermediate).toBe(stage2Intermediate);
    expect(validateAnswer(2, intermediate)).toBe(false);
    expect(validateAnswer(2, evidence)).toBe(false);
    const decoded = convertText(intermediate, 'base64', 'decode');
    expect(decoded).toBe('PRIJAVITELJ: LUKA KOVAC. KODA MAPE: PREDAL.');
    const profileName = getStage(4)!.profile!.name.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
    expect(decoded).toContain(`PRIJAVITELJ: ${profileName}.`);
    const code = /KODA MAPE: ([A-Z]+)\./u.exec(decoded)?.[1];
    expect(code).toBe('PREDAL');
    expect(validateAnswer(2, code)).toBe(true);
    expect(validateAnswer(2, decoded)).toBe(false);
    expect(textToHex(convertText(decoded, 'base64', 'encode'))).toBe(evidence);
    expect(hexToText(evidence.toLowerCase().replaceAll(' ', '\n'))).toBe(intermediate);
    expect(hexToText(evidence.replaceAll(' ', ''))).toBe(intermediate);
  });

  it('nobena posamezna pretvorba začetnega dokaza ne razkrije končnega sporočila', () => {
    const evidence = getStage(2)!.evidence!;
    for (const method of ['hex', 'base64', 'binary', 'decimal', 'url'] as const) {
      let result: string;
      try { result = convertText(evidence, method, 'decode'); }
      catch { continue; }
      expect(result).not.toContain('PREDAL');
      expect(validateAnswer(2, result)).toBe(false);
    }
  });

  it('pretvornik HEX obravnava tudi drugo besedilo in poškodovan prepis', () => {
    expect(convertText('44 52 55 47 41 20 53 4C 45 44', 'hex', 'decode')).toBe('DRUGA SLED');
    const different = 'Preveri č, š in ž!';
    expect(hexToText(textToHex(different))).toBe(different);
    const evidence = getStage(2)!.evidence!;
    expect(() => hexToText(`${evidence} F`)).toThrow('natanko dva znaka');
    expect(() => hexToText(`${evidence} GG`)).toThrow('samo števke');
  });

  it('ročno seštevanje uteži vsakega bajta vodi do kode ASCII, ne do številskega odgovora', () => {
    const stage = getStage(8)!;
    const weights = Array.from({ length: 8 }, (_, index) => 2 ** (7 - index));
    expect(stage.note?.match(/\d+/gu)?.map(Number)).toEqual(weights);
    expect(getHint(8, 1)?.match(/\d+/gu)?.map(Number)).toEqual(weights);
    expect(stage.note).toContain('ASCII');
    const bytes = stage.evidence!.split(' ');
    expect(bytes).toHaveLength(10);
    const values = bytes.map(byte => {
      expect(byte).toMatch(/^[01]{8}$/u);
      return [...byte].reduce((sum, bit, index) => sum + (bit === '1' ? weights[index] : 0), 0);
    });
    const code = String.fromCodePoint(...values);
    expect(values).toEqual([66, 82, 85, 67, 79, 86, 65, 78, 74, 69]);
    expect(code).toBe('BRUCOVANJE');
    expect(getHint(8, 2)).toContain(`${bytes[0]} sta enici na mestih z utežmi 64 in 2`);
    expect(getHint(8, 2)).toContain('Vsota je 66');
    expect(getHint(8, 2)).toContain('preostalih devet bajtov');
    expect(validateAnswer(8, code)).toBe(true);
    expect(finale.title).toContain(code);
    expect(validateAnswer(8, values.join(' '))).toBe(false);
    expect(validateAnswer(8, values.reduce((sum, value) => sum + value, 0))).toBe(false);
    expect(validateAnswer(8, [...code].reverse().join(''))).toBe(false);
    expect(JSON.stringify(stage)).not.toMatch(/\bBRUCOVANJE\b|correctAnswer|isCorrect/iu);
  });
});

describe('ločeno razkrivanje učne vsebine', () => {
  it('vrne javne povzetke brez rešitev in ohrani izvirno gradivo', () => {
    expect(stageSummaries).toHaveLength(8);
    for (const summary of stageSummaries) expect(Object.keys(summary).sort()).toEqual(['id', 'title', 'topic']);
    expect(getStage(1)?.evidence).toBe('NRGD MH SLUDPLGD');
    expect(getStage(2)?.evidence).toBe(textToHex(stage2Intermediate));
    expect(getStage(8)?.evidence).toBe('01000010 01010010 01010101 01000011 01001111 01010110 01000001 01001110 01001010 01000101');
    for (let id = 1; id <= 8; id++) {
      const stage = getStage(id);
      expect(stage).toBeDefined();
      expect(stage).not.toHaveProperty('correctAnswer');
      expect(stage).not.toHaveProperty('isCorrect');
      expect(stage).not.toHaveProperty('hints');
      expect(stage).not.toHaveProperty('explanation');
      expect(JSON.stringify(stage)).not.toMatch(/\bBRUCOVANJE\b/u);
      expect(getHint(id, 1)).toBeTruthy();
      expect(getHint(id, 2)).toBeTruthy();
      expect(getExplanation(id)).toBeTruthy();
      expect(getFeedback(id)).toBeTruthy();
    }
  });

  it('vrne samostojno kopijo podatkov in zavrne neobstoječ namig', () => {
    const stage = getStage(1)!;
    stage.evidence = 'spremenjeno';
    expect(getStage(1)?.evidence).toBe('NRGD MH SLUDPLGD');
    expect(getHint(1, 0)).toBeUndefined();
    expect(getHint(1, 3)).toBeUndefined();
    expect(getHint(9, 1)).toBeUndefined();
  });
});
