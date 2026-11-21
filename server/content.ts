import type { Finale, StageContent, StageSummary } from '../shared/types.js';

// Učno gradivo in preverjanje sta namenoma samo na strežniku.
// getStage vrne samo dokaze trenutno dovoljene naloge; namige in razlago API
// razkrije ločeno, glede na napredek posamezne ekipe.
const stages: StageContent[] = [
  {
    id: 1,
    title: 'Razbij skrivno sporočilo',
    topic: 'Cezarjeva šifra',
    kind: 'caesar',
    intro: 'Na začetku preiskave najdeta zapis, ki kaže na prvi del zaklenjene preiskovalne mape.',
    question: 'Katera beseda je koda v dešifriranem sporočilu?',
    evidence: 'NRGD MH PRVW',
    note: 'Uporabljena je Cezarjeva šifra s premikom 3. Pri tej nalogi uporabljamo abecedo A–Z brez šumnikov. Dešifriranje pomeni premik nazaj po abecedi.',
  },
  {
    id: 2,
    title: 'Kaj se skriva za čudnimi znaki?',
    topic: 'Base64',
    kind: 'base64',
    intro: 'Prvi del mape je odprt. V naslednjem dokaznem gradivu je shranjen nenavaden niz.',
    question: 'Dekodiraj zapis Base64. Katera beseda je koda?',
    evidence: 'S09EQTogU09WQQ==',
    note: 'Za pretvorbo uporabi vgrajeni pripomoček. Vse ostane znotraj te preiskovalne strani.',
  },
  {
    id: 3,
    title: 'Poišči phishing sporočilo',
    topic: 'Phishing',
    kind: 'phishing',
    intro: 'Varnostna ekipa je zavarovala tri sporočila. Preglej njihovo vsebino in dejanske naslove.',
    question: 'Katero sporočilo je v tem primeru phishing? Izberi ga in označi vsaj dva opozorilna znaka.',
    note: 'Izmišljena šola uporablja domeno sola.example. To je simuliran e-poštni predal: prikazani naslovi in povezave niso aktivni.',
    mails: [
      {
        id: 'A',
        sender: 'Šolska knjižnica <knjiznica@sola.example>',
        subject: 'Opomnik za vračilo knjige',
        body: 'Pozdravljeni, v petek poteče rok za vračilo izposojene knjige. Če ste jo že vrnili, lahko opomnik prezrete. Lep pozdrav, šolska knjižnica.',
      },
      {
        id: 'B',
        sender: 'Šolska IT podpora <podpora@sola-preverjanje.example>',
        subject: 'NUJNO: vaš račun bo čez 10 minut blokiran',
        body: 'Zaznali smo težavo z vašim računom. V naslednjih 10 minutah odprite spodnjo povezavo ter vnesite geslo in enkratno prijavno kodo, sicer bo račun blokiran.',
        linkLabel: 'Preveri šolski račun',
        linkUrl: 'https://sola.example.preveri-racun.example/prijava',
      },
      {
        id: 'C',
        sender: 'Mentorica <mentorica@sola.example>',
        subject: 'Termin delavnice',
        body: 'Pozdravljeni, jutrišnja delavnica bo ob 10. uri v računalniški učilnici. Za delo potrebujete le šolski računalnik. Lep pozdrav.',
      },
    ],
    reasons: [
      { id: 'domain', label: 'Domena pošiljatelja se ne ujema s šolsko domeno.' },
      { id: 'link', label: 'Povezava vodi na drugo domeno.' },
      { id: 'urgency', label: 'Sporočilo pritiska z nujnostjo in grožnjo blokade.' },
      { id: 'credentials', label: 'Zahteva geslo in enkratno prijavno kodo na nepričakovani strani.' },
      { id: 'greeting', label: 'Sporočilo vsebuje pozdrav.' },
      { id: 'https', label: 'Sporočilo uporablja HTTPS.' },
    ],
  },
  {
    id: 4,
    title: 'Ugotovi predvidljivo geslo',
    topic: 'Predvidljiva gesla',
    kind: 'password',
    intro: 'Javne objave lahko razkrijejo več, kot se zdi. Primerjaj izmišljeni učni profil s ponujenimi gesli.',
    question: 'Katero geslo je najlažje predvideti na podlagi teh javnih podatkov?',
    note: 'To je izbirna učna naloga. Ne ugibamo dejanskega gesla in ne izvajamo prijavnih poskusov.',
    profile: {
      name: 'Nika — učni profil.',
      username: '@nika_ucni_profil',
      posts: ['Letnik 2009.', 'Moja psička Luna je danes spet ukradla vso pozornost.'],
    },
    choices: [
      { id: 'A', label: 'Luna2009!' },
      { id: 'B', label: 'Miza783?' },
      { id: 'C', label: 'vQ7#rT9!pL2' },
    ],
  },
  {
    id: 5,
    title: 'Fotografija skriva namig',
    topic: 'Metapodatki',
    kind: 'metadata',
    intro: 'Med dokazi je posnetek šolskega hodnika. Za časovnico preiskave potrebujeta podatek o nastanku posnetka.',
    question: 'Ob kateri uri je bila fotografija glede na metapodatke posneta? Vnesi uro in minute v obliki HH:MM.',
    note: 'Učna simulacija: prikazana je lokalna ilustracija, izpis metapodatkov pa je pripravljen učni primer in ni prebran iz ilustracije.',
    metadata: 'FileName: hodnik.jpg\nDateTimeOriginal: 2026:11:20 10:42:17\nOffsetTimeOriginal: +01:00\nModifyDate: 2026:11:20 11:15:00',
  },
  {
    id: 6,
    title: 'Kdo je dostopal do skrivne datoteke?',
    topic: 'Dnevniki',
    kind: 'logs',
    intro: 'Simuliran strežniški dnevnik beleži uporabo računov, dejanja in datoteke. Poiščita dogodek, ki ustreza vprašanju.',
    question: 'Kateri uporabniški račun je uspešno prenesel datoteko /zaupno/nacrt.pdf?',
    note: 'Simuliran strežniški dnevnik • vsi dogodki so iz 20. 11. 2026, časi so lokalni. To ni zajem šifriranega HTTPS-prometa. DOWNLOAD = prenos, VIEW = ogled, SUCCESS = uspešno, DENIED = zavrnjeno, LOGIN = prijava, LOGOUT = odjava.',
    logs: [
      { time: '10:40:02', ip: '10.0.0.11', account: 'ucenec05', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:41:23', ip: '10.0.0.12', account: 'ucenec12', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'DENIED' },
      { time: '10:42:31', ip: '10.0.0.14', account: 'ucenec08', event: 'VIEW', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' },
      { time: '10:43:05', ip: '10.0.0.17', account: 'ucenec17', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:44:08', ip: '10.0.0.11', account: 'ucenec05', event: 'DOWNLOAD', file: '/javno/urnik.pdf', result: 'SUCCESS' },
      { time: '10:45:12', ip: '10.0.0.17', account: 'ucenec17', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' },
      { time: '10:46:03', ip: '10.0.0.17', account: 'ucenec17', event: 'LOGOUT', file: '—', result: 'SUCCESS' },
    ],
  },
  {
    id: 7,
    title: 'Najdi ponarejeno spletno stran',
    topic: 'Domene',
    kind: 'domains',
    intro: 'V dokazih so trije spletni naslovi. Primerjaj celotnega gostitelja vsakega naslova.',
    question: 'Kateri naslov se predstavlja kot šolski, vendar pripada drugi domeni?',
    note: 'V tem učnem primeru je potrjena domena šole sola.example. Vse naslovne vrstice so simulirane; povezave niso aktivne.',
    choices: [
      { id: 'A', label: 'https://sola.example/prijava' },
      { id: 'B', label: 'https://ucilnica.sola.example/prijava' },
      { id: 'C', label: 'https://sola.example.prijava-varno.example/prijava' },
    ],
  },
  {
    id: 8,
    title: 'Računalnik govori v ničlah in enicah',
    topic: 'Binarni zapis',
    kind: 'binary',
    intro: 'Do zaključnega poročila manjka le še zadnja koda. Pretvori skupine bitov in odpri končno preiskovalno mapo.',
    question: 'Pretvori binarni zapis v besedilo in vnesi zadnjo kodo.',
    evidence: '01001011 01001100 01001010 01010101 01000011',
    note: 'Vsako skupino osmih bitov loči s presledkom ali novo vrstico. Pomagaš si lahko tudi s tabelo ASCII za črke A–Z.',
  },
];

export const stageSummaries: StageSummary[] = stages.map(({ id, title, topic }) => ({ id, title, topic }));

const hints: Record<number, [string, string]> = {
  1: ['Vsako črko premakni za enako število mest.', 'Pri dešifriranju se premakni za 3 mesta nazaj: N postane K.'],
  2: ['Poišči pripomoček za dekodiranje Base64.', 'Po dekodiranju je iskana beseda za dvopičjem.'],
  3: ['Primerjaj dejanski naslov pošiljatelja in povezave z domeno sola.example.', 'Preveri tudi, ali sporočilo zahteva hiter odziv in občutljive prijavne podatke.'],
  4: ['Poglej, katere osebne podatke lahko prebere vsak obiskovalec profila.', 'Primerjaj ime psičke in letnico rojstva s ponujenimi gesli.'],
  5: ['V izpisu sta čas nastanka posnetka in čas spremembe datoteke.', 'Poišči podatek DateTimeOriginal.'],
  6: ['Iščeš uspešen prenos točno določene datoteke, ne njen ogled.', 'Poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.'],
  7: ['Ime šole se lahko pojavi tudi v poddomeni druge domene.', 'Pri enem naslovu se za sola.example pojavi še .prijava-varno.example.'],
  8: ['Vsaka skupina osmih bitov predstavlja en znak.', 'Prva skupina 01001011 predstavlja črko K.'],
};

const explanations: Record<number, string> = {
  1: 'Cezarjeva šifra zamenja črke s premikom po abecedi. Primerna je za razumevanje osnov, ne za sodobno varovanje podatkov.',
  2: 'Base64 je kodiranje, ne šifriranje. Za pretvorbo nazaj ne potrebujemo skrivnega ključa in sam zapis ne zagotavlja zaupnosti.',
  3: 'Phishing skuša uporabnika zavesti v razkritje podatkov ali nevarno dejanje. Sporočilo B uporablja tujo domeno pošiljatelja in povezave ter grozi z blokado in zahteva prijavne podatke. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti spletne strani.',
  4: 'Imena ljubljenčkov in letnice rojstva so predvidljivi gradniki gesel. Dodan klicaj te predvidljivosti ne odpravi. Uporabljaj dolga, enkratna gesla, upravljalnik gesel in večfaktorsko prijavo. Tudi Miza783? ni zgled dobrega gesla. Iz te učne izbire ne moremo sklepati, katero geslo je bilo uporabljeno v incidentu.',
  5: 'Metapodatki lahko vsebujejo čas nastanka in druge podatke o datoteki. DateTimeOriginal označuje nastanek posnetka; čas spremembe ModifyDate ni nujno čas fotografiranja. Metapodatki lahko manjkajo ali so spremenjeni, zato sami po sebi niso nezmotljiv dokaz.',
  6: 'Dnevniki pomagajo rekonstruirati dogodke. Zapis potrjuje uspešen prenos /zaupno/nacrt.pdf z računom ucenec17. Zavrnjen prenos in uspešen ogled nista uspešen prenos. Zapis potrjuje uporabo določenega računa, sam po sebi pa ne dokazuje, katera oseba je bila za tipkovnico.',
  7: 'Naslov C pripada domeni prijava-varno.example. Protokol je https://, gostitelj je sola.example.prijava-varno.example, pot je /prijava. Šolsko ime sola.example je tukaj le del pred tujo domeno. Pri A je gostitelj potrjena domena sola.example, pri B pa je ucilnica njena poddomena. Prisotnost HTTPS ne naredi strani samodejno zaupanja vredne. Ta razčlenitev velja za konkretne učne primere; pri vseh naslovih registrirana domena ni nujno sestavljena iz zadnjih dveh delov.',
  8: 'Binarni zapis je način predstavitve podatkov. Vsaka osembitna skupina v tem primeru predstavlja znak ASCII. Ta primer ni šifriranje. Odprla sta končno preiskovalno mapo.',
};

const feedback: Record<number, string> = {
  1: 'Še ni pravilno. Preveri smer in velikost premika ter poišči besedo, ki jo sporočilo označuje kot kodo.',
  2: 'Še ni pravilno. Najprej dekodiraj celoten zapis Base64, nato poišči besedo za dvopičjem.',
  3: 'Še ni pravilno. Izberi eno sporočilo in vsaj dva različna opozorilna znaka. Vsak označeni razlog mora opisovati resnično opozorilo; preveri tudi morebitne odvečne izbire.',
  4: 'Še ni pravilno. Primerjaj javne podatke profila z gradniki vsakega ponujenega gesla.',
  5: 'Še ni pravilno. Loči nastanek posnetka od poznejše spremembe datoteke. Odgovori v obliki HH:MM.',
  6: 'Še ni pravilno. Hkrati preveri dejanje, natančno pot datoteke in rezultat. Ogled ter zavrnjen prenos ne zadostujeta.',
  7: 'Še ni pravilno. Preberi celotnega gostitelja. Pojav šolskega imena v naslovu še ne pomeni, da je stran na šolski domeni.',
  8: 'Še ni pravilno. Preveri vseh pet osembitnih skupin in vrstni red črk v rezultatu pretvorbe.',
};

export function getStage(id: number): StageContent | undefined {
  const stage = stages.find((candidate) => candidate.id === id);
  return stage ? structuredClone(stage) : undefined;
}

export function getHint(id: number, index: number): string | undefined {
  return index === 1 || index === 2 ? hints[id]?.[index - 1] : undefined;
}

export function getExplanation(id: number): string {
  return explanations[id] ?? '';
}

export function getFeedback(id: number): string {
  return feedback[id] ?? 'Preveri vnos in poskusi znova.';
}

function words(answer: unknown): string | undefined {
  return typeof answer === 'string' ? answer.trim().replace(/\s+/gu, ' ').toUpperCase() : undefined;
}

export function validateAnswer(id: number, answer: unknown): boolean {
  switch (id) {
    case 1:
      return ['MOST', 'KODA JE MOST'].includes(words(answer) ?? '');
    case 2: {
      const value = words(answer);
      return value === 'SOVA' || (value !== undefined && /^KODA\s*:\s*SOVA$/u.test(value));
    }
    case 3: {
      if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
      const { message, reasons } = answer as { message?: unknown; reasons?: unknown };
      if (message !== 'B' || !Array.isArray(reasons) || reasons.length > 6) return false;
      const allowed = new Set(['domain', 'link', 'urgency', 'credentials']);
      return reasons.every((reason) => typeof reason === 'string' && allowed.has(reason)) && new Set(reasons).size >= 2;
    }
    case 4:
      return answer === 'A';
    case 5:
      return typeof answer === 'string' && ['10:42', '10.42', '10:42:17'].includes(answer.trim());
    case 6:
      return words(answer) === 'UCENEC17';
    case 7:
      return answer === 'C';
    case 8:
      return typeof answer === 'string' && ['KLJUC', 'KLJUČ'].includes(answer.trim().toUpperCase());
    default:
      return false;
  }
}

export const finale: Finale = {
  title: 'Preiskava zaključena',
  findings: [
    'Prepoznala sta sumljivo sporočilo in lažno domeno.',
    'Iz prikazanih metapodatkov sta razbrala čas nastanka fotografije: 10:42.',
    'V dnevniku sta našla uspešen prenos datoteke /zaupno/nacrt.pdf z računom ucenec17.',
    'Odklenila sta končno poročilo in opravila vseh osem stopenj.',
  ],
  limitation: 'Dokazi potrjujejo uporabo računa, ne identitete osebe za tipkovnico. Ne dokazujejo, da je lastnik računa storilec, da je bilo prav izbrano učno geslo uporabljeno za vdor ali da poznamo celoten potek napada.',
  topics: stageSummaries.map(({ topic }) => topic),
  discussion: [
    'Kateri podatek je bil najbolj prepričljiv dokaz in kakšne so njegove omejitve?',
    'Kaj bi lahko šola in uporabniki naredili za boljšo zaščito?',
  ],
};
