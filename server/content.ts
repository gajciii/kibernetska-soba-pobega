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
    intro: 'Med sledmi nenavadnega prenosa iz šolskega sistema sta našla datoteko sporocilo.txt. Njen šifrirani zapis skriva kodo za prvi del preiskovalne mape. Avtor si je trik izposodil od Julija Cezarja. Prejemnik je njegovo zaupno sporočilo razbral tako, da je vsako črko premaknil za tri mesta nazaj. Enako naredita z vajino sledjo: po abecedi A–Z se pomikajta v levo, pred A pa nadaljujta pri Z.',
    question: 'Z abecednim pripomočkom razvozlaj sporočilo. V polje za odgovor vnesi samo besedo, ki jo sporočilo določi kot kodo.',
    evidence: 'NRGD MH PRVW',
    note: 'Uporabljamo abecedo A–Z brez šumnikov. Premik in smer razberi iz zgodbe, nato črke primerjaj s pomočjo abecednega pripomočka. Presledke in ločila ohrani.',
    investigations: [
      { id: 'arhiv', title: 'Izvor: začasna mapa', text: 'Zapis je bil najden v datoteki sporocilo.txt. Njeno ime opisuje vrsto datoteke in ni geslo.' },
      { id: 'razmiki', title: 'Ohranjen prepis', text: 'Pri prepisu so bili ohranjeni vsi presledki in vrstni red znakov. Rezultat bi moral biti smiselno sporočilo s tremi besedami.' },
      { id: 'abeceda', title: 'Opomba ob zapisu', text: 'Uporabljena je latinica A–Z. Ko pri premiku pridemo pred A, nadaljujemo z Z; številke in ločila pustimo pri miru.' },
    ],
  },
  {
    id: 2,
    title: 'Kaj se skriva za čudnimi znaki?',
    topic: 'Kodiranja',
    kind: 'encoding',
    intro: 'V zavarovanem izvozu šolskih sistemskih obvestil sta našla zapis, ki bi lahko pojasnil nenavadni prenos. Oznaka kodiranja je izgubljena, ostala pa je opomba: »Uporabljamo samo šestnajst znakov: števke od 0 do 9 in črke od A do F. Beremo jih v parih.« Prava pretvorba bo razkrila, kaj je bilo zabeleženo in katera koda odpira naslednjo mapo.',
    question: 'Prekopiraj zapis v pretvornik in razberi sporočilo. Vnesi samo kodo naslednje mape.',
    evidence: '50 52 45 4E 4F 53 20 5A 41 42 45 4C 45 5A 45 4E 2E 20 4B 4F 44 41 20 4E 41 53 4C 45 44 4E 4A 45 20 4D 41 50 45 3A 20 53 4F 56 41 2E',
    note: 'Presledki ločujejo pare znakov. Prenesi celoten zapis iz zgodbe v pretvornik, izberi metodo in preveri smiselnost rezultata. Poskus v pretvorniku ne šteje kot oddaja odgovora.',
    investigations: [
      { id: 'ovojnica', title: 'Izvoz: obvestilo.dat', text: 'Zavarovani izvoz vsebuje eno sistemsko obvestilo. Končnica .dat ne določa kodiranja.' },
      { id: 'nabor', title: 'Pregled znakov', text: 'Vsaka skupina vsebuje dva znaka iz nabora 0–9 in A–F. Presledki ločujejo skupine in niso del predstavljenih bajtov.' },
      { id: 'rezultat', title: 'Pričakovani rezultat', text: 'Izvor je kratko obvestilo s kodo naslednje mape. Samo uspešna pretvorba še ni dovolj: rezultat mora sestavljati smiselno sporočilo.' },
    ],
  },
  {
    id: 3,
    title: 'Poišči phishing sporočilo',
    topic: 'Phishing',
    kind: 'phishing',
    intro: 'V zavarovanem predalu je sedem sporočil.',
    question: 'Šolska domena je sola.example. Izberi phishing sporočilo in vsaj dva opozorilna znaka, brez napačnih razlogov.',
    note: 'Izmišljena šola uporablja domeno sola.example. Vsa sporočila so z dne 20. 11. 2026, časi so lokalni. Predal, priponke in povezave so neaktivna učna simulacija. Prikazno ime, nujnost ali sama prisotnost priponke še ne zadoščajo za sklep.',
    mails: [
      {
        id: 'A',
        sender: 'Šolska knjižnica <knjiznica@sola.example>',
        recipient: 'Preiskovalni razred <razred@sola.example>',
        time: '08:12',
        preview: 'V petek poteče rok za vračilo izposojene knjige.',
        replyTo: 'knjiznica@sola.example',
        subject: 'Opomnik za vračilo knjige',
        body: 'Pozdravljeni, v petek poteče rok za vračilo izposojene knjige. Če ste jo že vrnili, lahko opomnik prezrete. Lep pozdrav, šolska knjižnica.',
      },
      {
        id: 'B',
        sender: 'Šolska IT podpora <podpora@sola-preverjanje.example>',
        recipient: 'Preiskovalni razred <razred@sola.example>',
        time: '09:57',
        preview: 'Zaznali smo težavo z vašim računom. Odzovite se v 10 minutah.',
        replyTo: 'podpora@sola-preverjanje.example',
        subject: 'NUJNO: vaš račun bo čez 10 minut blokiran',
        body: 'Zaznali smo težavo z vašim računom. V naslednjih 10 minutah odprite spodnjo povezavo ter vnesite geslo in enkratno prijavno kodo, sicer bo račun blokiran.',
        linkLabel: 'Preveri šolski račun',
        linkUrl: 'https://sola.example.preveri-racun.example/prijava',
      },
      {
        id: 'C',
        sender: 'Mentorica <mentorica@sola.example>',
        recipient: 'Preiskovalni razred <razred@sola.example>',
        time: '08:44',
        preview: 'Jutrišnja delavnica bo ob 10. uri v računalniški učilnici.',
        replyTo: 'mentorica@sola.example',
        subject: 'Termin delavnice',
        body: 'Pozdravljeni, jutrišnja delavnica bo ob 10. uri v računalniški učilnici. Za delo potrebujete le šolski računalnik. Lep pozdrav.',
      },
      {
        id: 'D',
        sender: 'Šolska IT podpora <podpora@sola.example>',
        recipient: 'Vsi dijaki <dijaki@sola.example>',
        time: '07:50',
        preview: 'Danes od 16. do 17. ure bo potekalo načrtovano vzdrževanje.',
        subject: 'Načrtovano vzdrževanje šolske učilnice',
        body: 'Pozdravljeni, danes od 16. do 17. ure bo spletna učilnica občasno nedosegljiva zaradi načrtovanega vzdrževanja. Od vas ne potrebujemo nobenih podatkov ali dejanj. Po zaključku bo obvestilo objavljeno na običajni strani učilnice.',
        linkLabel: 'Obvestila spletne učilnice',
        linkUrl: 'https://ucilnica.sola.example/obvestila',
        replyTo: 'podpora@sola.example',
      },
      {
        id: 'E',
        sender: 'Tajništvo šole <tajnistvo@sola.example>',
        recipient: 'Preiskovalni razred <razred@sola.example>',
        time: '09:30',
        preview: 'Sprememba učilnice velja že za naslednjo šolsko uro.',
        subject: 'Pomembno: naslednja ura je v učilnici 204',
        body: 'Pozdravljeni, zaradi okvare projektorja se naslednja ura prestavi v učilnico 204. Spremembo lahko preverite na oglasni deski ali pri razredniku. To obvestilo ne zahteva prijave ali pošiljanja osebnih podatkov.',
        replyTo: 'tajnistvo@sola.example',
      },
      {
        id: 'F',
        sender: 'Šolski krožek fotografije <foto@sola.example>',
        recipient: 'Člani krožka <krozek@sola.example>',
        time: '09:08',
        preview: 'V priponki je že napovedani razpored fotografiranja razredov.',
        subject: 'Razpored fotografiranja za prihodnji teden',
        body: 'Živjo, pošiljamo razpored, ki smo ga dogovorili na srečanju krožka. Enak seznam je na oglasni deski pri knjižnici. Če opazite napako v terminu svojega razreda, odgovorite mentorici. Dokument ne vsebuje obrazca za prijavo.',
        attachment: 'razpored_fotografiranja.pdf · 84 KB · simulirana priponka',
        replyTo: 'foto@sola.example',
      },
      {
        id: 'G',
        sender: 'Šolska prehrana <prehrana@sola.example>',
        recipient: 'Vsi dijaki <dijaki@sola.example>',
        time: '10:05',
        preview: 'Jedilnik za prihodnji teden je objavljen na šolski strani.',
        subject: 'Jedilnik za prihodnji teden',
        body: 'Pozdravljeni, na šolski strani je objavljen jedilnik za prihodnji teden. Za ogled ni potrebna prijava. Običajen postopek odjave malice ostaja nespremenjen. Lep pozdrav, organizacija prehrane.',
        linkLabel: 'Poglej jedilnik',
        linkUrl: 'https://sola.example/prehrana/jedilnik',
        replyTo: 'prehrana@sola.example',
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
    intro: 'Javne objave lahko razkrijejo predvidljive gradnike gesel.',
    question: 'Preglej javne objave profila in izberi geslo, ki ga je na njihovi podlagi najlažje predvideti.',
    note: 'To je izbirna učna naloga. Ne ugibamo dejanskega gesla in ne izvajamo prijavnih poskusov.',
    profile: {
      name: 'Nika — učni profil.',
      username: '@nika_ucni_profil',
      posts: [
        'Letnik 2009.',
        'Včeraj smo s fotografskim krožkom lovili zanimive sence na šolskem dvorišču.',
        'Moja psička Luna je danes spet ukradla vso pozornost.',
        'Za vikend izbiram med kolesarskim izletom in branjem kriminalke. Oboje je dobra ideja.',
        'Projekt za šolski sejem napreduje. Najboljši del je delo z ekipo!',
      ],
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
    intro: 'V dokazni mapi sta dve fotografiji in posnetek zaslona.',
    question: 'Izberi hodnik.jpg in odpri metapodatke. Vnesi čas nastanka fotografije v obliki HH:MM.',
    note: 'Učna simulacija: slike so lokalne ilustracije, izpisi pa pripravljeni primeri in niso prebrani iz ilustracij. Časi v vseh treh primerih uporabljajo odmik +01:00. Ime in vsebino datoteke preveri pred branjem njenih metapodatkov.',
    metadata: 'FileName: hodnik.jpg\nDateTimeOriginal: 2026:11:20 10:42:17\nOffsetTimeOriginal: +01:00\nModifyDate: 2026:11:20 11:15:00',
    artifacts: [
      { id: 'hodnik', name: 'hodnik.jpg', kind: 'photo', size: '2,4 MB', description: 'Fotografija hodnika pred računalniško učilnico. Ta datoteka je predmet vprašanja.', metadata: 'FileName: hodnik.jpg\nDateTimeOriginal: 2026:11:20 10:42:17\nOffsetTimeOriginal: +01:00\nModifyDate: 2026:11:20 11:15:00' },
      { id: 'ucilnica', name: 'ucilnica.jpg', kind: 'photo', size: '1,8 MB', description: 'Fotografija prazne računalniške učilnice iz jutranjega pregleda prostorov.', metadata: 'FileName: ucilnica.jpg\nDateTimeOriginal: 2026:11:20 08:16:09\nOffsetTimeOriginal: +01:00\nModifyDate: 2026:11:20 08:25:44' },
      { id: 'obvestilo', name: 'obvestilo.png', kind: 'image', size: '186 KB', description: 'Posnetek zaslona obvestila o vzdrževanju. Ni fotografija hodnika in nima podatka DateTimeOriginal.', metadata: 'FileName: obvestilo.png\nCreateDate: 2026:11:20 09:51:06\nOffsetTime: +01:00\nModifyDate: 2026:11:20 10:03:28' },
    ],
  },
  {
    id: 6,
    title: 'Kdo je dostopal do skrivne datoteke?',
    topic: 'Dnevniki',
    kind: 'logs',
    intro: 'Omrežni izbor je povezan z ločenim aplikacijskim dnevnikom.',
    question: 'Odpri paket in povezani aplikacijski zapis. Vnesi račun, pri katerem so skupaj DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.',
    note: 'Simulacija • 20. 11. 2026, lokalni časi. Paketni pregled je pripravljen izbor dogodkov, ne celoten zajem. Šifriran promet TLS sam ne razkrije uporabniškega računa ali poti datoteke. Povezave do ločenega aplikacijskega dnevnika so vnaprej pripravljena učna korelacija; aplikacija ne zajema prometa in ne pošilja pravih zahtev. DOWNLOAD = prenos, VIEW = ogled, SUCCESS = uspešno, DENIED = zavrnjeno, LOGIN = prijava, LOGOUT = odjava.',
    logs: [
      { time: '10:39:48', ip: '10.0.0.10', account: 'ucenec03', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:40:02', ip: '10.0.0.11', account: 'ucenec05', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:40:14', ip: '10.0.0.10', account: 'ucenec03', event: 'VIEW', file: '/javno/obvestila.pdf', result: 'SUCCESS' },
      { time: '10:40:39', ip: '10.0.0.12', account: 'ucenec12', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:41:05', ip: '10.0.0.14', account: 'ucenec08', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:41:23', ip: '10.0.0.12', account: 'ucenec12', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'DENIED' },
      { time: '10:41:46', ip: '10.0.0.12', account: 'ucenec12', event: 'DOWNLOAD', file: '/javno/urnik.pdf', result: 'SUCCESS' },
      { time: '10:42:31', ip: '10.0.0.14', account: 'ucenec08', event: 'VIEW', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' },
      { time: '10:42:56', ip: '10.0.0.19', account: 'ucenec22', event: 'LOGIN', file: '—', result: 'DENIED' },
      { time: '10:43:05', ip: '10.0.0.17', account: 'ucenec17', event: 'LOGIN', file: '—', result: 'SUCCESS' },
      { time: '10:43:28', ip: '10.0.0.14', account: 'ucenec08', event: 'DOWNLOAD', file: '/javno/navodila.pdf', result: 'SUCCESS' },
      { time: '10:44:08', ip: '10.0.0.11', account: 'ucenec05', event: 'DOWNLOAD', file: '/javno/urnik.pdf', result: 'SUCCESS' },
      { time: '10:44:39', ip: '10.0.0.10', account: 'ucenec03', event: 'LOGOUT', file: '—', result: 'SUCCESS' },
      { time: '10:45:12', ip: '10.0.0.17', account: 'ucenec17', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' },
      { time: '10:45:44', ip: '10.0.0.11', account: 'ucenec05', event: 'LOGOUT', file: '—', result: 'SUCCESS' },
      { time: '10:46:03', ip: '10.0.0.17', account: 'ucenec17', event: 'LOGOUT', file: '—', result: 'SUCCESS' },
    ],
    packets: [
      { number: 1, time: '10:39:41.010', source: '02:40:40:00:00:10', destination: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP', length: 42, info: 'Kdo ima 10.0.0.1? Povej 10.0.0.10', detail: 'Poizvedba za strojni naslov lokalnega prehoda. Pri ARP sta prikazana strojna naslova; ff:ff:ff:ff:ff:ff pomeni oddajanje vsem na lokalni povezavi. ARP ne uporablja TCP.' },
      { number: 2, time: '10:39:41.012', source: '02:40:40:00:00:01', destination: '02:40:40:00:00:10', protocol: 'ARP', length: 42, info: '10.0.0.1 je na 02:40:40:00:00:01', detail: 'Odgovor lokalnega prehoda na poizvedbo ARP. Izmišljeni strojni naslov je del simulacije in ni podatek o uporabniku.' },
      { number: 3, time: '10:39:43.015', source: '10.0.0.10', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: sola.example', detail: 'Računalnik vpraša lokalni strežnik DNS za naslov gostitelja. Poizvedba ne dokazuje prijave ali prenosa datoteke.' },
      { number: 4, time: '10:39:43.019', source: '10.0.0.53', destination: '10.0.0.10', protocol: 'DNS', length: 88, info: 'Odgovor A: sola.example → 10.0.0.5', detail: 'V učnem omrežju je spletni strežnik na 10.0.0.5. Naslovi niso namenjeni obiskovanju zunaj simulacije.' },
      { number: 5, time: '10:39:47.100', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TCP', length: 74, info: '52810 → 443 · SYN', detail: 'Začetek vzpostavljanja povezave TCP. Vrata 443 so običajna za HTTPS, vendar sama številka vrat še ne pove, kaj je uporabnik naredil.' },
      { number: 6, time: '10:39:47.104', source: '10.0.0.5', destination: '10.0.0.10', protocol: 'TCP', length: 74, info: '443 → 52810 · SYN, ACK', detail: 'Strežnik potrjuje začetek povezave. Izbor ne vsebuje vseh paketov rokovanja; številke so vrstni red prikazanih dokazov.' },
      { number: 7, time: '10:39:48.130', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TLS', length: 602, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Vsebina paketa je šifrirana. Dodatna učna povezava vodi na ločeno zavarovan zapis aplikacijskega dnevnika istega dogodka.', logTime: '10:39:48' },
      { number: 8, time: '10:40:00.003', source: '10.0.0.9', destination: '10.0.0.5', protocol: 'HTTP', length: 132, info: 'GET /status HTTP/1.1', detail: 'Izmišljeni lokalni nadzor preverja javni status storitve prek nešifriranega HTTP. Pot je zato vidna v tem primeru. To ni dostop do preiskovane datoteke.' },
      { number: 9, time: '10:40:02.318', source: '10.0.0.11', destination: '10.0.0.5', protocol: 'TLS', length: 618, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'TLS varuje vsebino. Račun in dejanje lahko preveriš v povezanem aplikacijskem zapisu, ne v bajtih tega paketa.', logTime: '10:40:02' },
      { number: 10, time: '10:40:03.009', source: '10.0.0.5', destination: '10.0.0.9', protocol: 'HTTP', length: 184, info: 'HTTP/1.1 200 OK · status storitve', detail: 'Odgovor lokalnemu nadzoru. Koda 200 se nanaša na javni status storitve in ne dokazuje uspešnega prenosa katerekoli druge datoteke.' },
      { number: 11, time: '10:40:14.619', source: '10.0.0.5', destination: '10.0.0.10', protocol: 'TLS', length: 1266, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odziv strežnika prek TLS. Velikost in smer paketa sami ne ločita ogleda dokumenta od njegovega prenosa.', logTime: '10:40:14' },
      { number: 12, time: '10:40:30.102', source: '10.0.0.12', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: sola.example', detail: 'Poizvedba DNS drugega računalnika. Uporabniškega računa v tem paketu ni.' },
      { number: 13, time: '10:40:30.107', source: '10.0.0.53', destination: '10.0.0.12', protocol: 'DNS', length: 88, info: 'Odgovor A: sola.example → 10.0.0.5', detail: 'Odgovor lokalnega DNS določi cilj povezave. Ne potrjuje uspešne prijave v aplikacijo.' },
      { number: 14, time: '10:40:39.284', source: '10.0.0.12', destination: '10.0.0.5', protocol: 'TLS', length: 612, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Za vsebinski pomen izbranega dogodka je na voljo ločen aplikacijski zapis. Gre za pripravljeno korelacijo učnega primera.', logTime: '10:40:39' },
      { number: 15, time: '10:40:55.940', source: '10.0.0.14', destination: '10.0.0.5', protocol: 'TCP', length: 74, info: '53114 → 443 · SYN', detail: 'Nov računalnik vzpostavlja povezavo. Sam začetek povezave ne pomeni dostopa do zaupnih podatkov.' },
      { number: 16, time: '10:41:05.352', source: '10.0.0.14', destination: '10.0.0.5', protocol: 'TLS', length: 606, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Paket ne vsebuje berljivega uporabniškega imena. Oglej si ločen dnevnik, če želiš ugotoviti dejanje.', logTime: '10:41:05' },
      { number: 17, time: '10:41:23.648', source: '10.0.0.5', destination: '10.0.0.12', protocol: 'TLS', length: 510, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odziv je šifriran. Za ugotovitev rezultata dejanja preveri povezani zapis in njegovo polje Rezultat.', logTime: '10:41:23' },
      { number: 18, time: '10:41:23.652', source: '10.0.0.12', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '52912 → 443 · ACK', detail: 'Potrditev prejema podatkov na ravni TCP. ACK ne pomeni, da je aplikacija dovolila zahtevano dejanje.' },
      { number: 19, time: '10:41:46.205', source: '10.0.0.5', destination: '10.0.0.12', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Prenos podatkov v povezavi TLS. V ločenem dnevniku preveri tudi pot, saj lahko isti račun dostopa do različnih datotek.', logTime: '10:41:46' },
      { number: 20, time: '10:42:00.600', source: '02:40:40:00:00:19', destination: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP', length: 42, info: 'Kdo ima 10.0.0.1? Povej 10.0.0.19', detail: 'Lokalna poizvedba ARP z izmišljenima strojnima naslovoma. Ne gre za pošiljanje zahteve zunanjemu spletnemu mestu.' },
      { number: 21, time: '10:42:31.527', source: '10.0.0.5', destination: '10.0.0.14', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Iz samega šifriranega odziva ni mogoče ugotoviti vrste uporabnikovega dejanja. Primerjaj Dogodek in Rezultat v pripadajočem dnevniku.', logTime: '10:42:31' },
      { number: 22, time: '10:42:56.191', source: '10.0.0.19', destination: '10.0.0.5', protocol: 'TLS', length: 614, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Povezava je vzpostavljena, vendar to še ne pomeni uspešne prijave v aplikacijo. Preveri povezani dnevnik.', logTime: '10:42:56' },
      { number: 23, time: '10:43:00.012', source: '10.0.0.17', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: sola.example', detail: 'Poizvedba po šolskem strežniku. Račun uporabnika ni del tega DNS-paketa.' },
      { number: 24, time: '10:43:05.724', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TLS', length: 610, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Aplikacijsko vsebino varuje TLS. Podrobnosti računa so na voljo samo v ločenem učnem zapisu aplikacije.', logTime: '10:43:05' },
      { number: 25, time: '10:43:28.309', source: '10.0.0.5', destination: '10.0.0.14', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odgovor strežnika vsebuje šifrirane podatke. Ista velikost paketa se lahko pojavi pri različnih dokumentih.', logTime: '10:43:28' },
      { number: 26, time: '10:44:08.442', source: '10.0.0.5', destination: '10.0.0.11', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Povezani zapis dopolnjuje omrežni dokaz s potjo datoteke. Podatka nismo razbrali iz šifriranega paketa.', logTime: '10:44:08' },
      { number: 27, time: '10:44:39.833', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TLS', length: 306, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Krajša izmenjava v obstoječi povezavi. Pomen dejanja preveri v aplikacijskem dnevniku.', logTime: '10:44:39' },
      { number: 28, time: '10:45:12.208', source: '10.0.0.5', destination: '10.0.0.17', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Šifrirani odziv strežnika. Ločeni aplikacijski zapis omogoča primerjavo računa, dejanja, poti datoteke in rezultata.', logTime: '10:45:12' },
      { number: 29, time: '10:45:12.212', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '53417 → 443 · ACK', detail: 'Potrditev prejema paketa. Ne razkriva uporabniškega računa ali poti datoteke; za te podatke potrebujemo aplikacijski dnevnik.' },
      { number: 30, time: '10:45:44.440', source: '10.0.0.11', destination: '10.0.0.5', protocol: 'TLS', length: 310, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Še ena kratka šifrirana izmenjava. Velikost sporočila ni dokaz njegove vsebine.', logTime: '10:45:44' },
      { number: 31, time: '10:46:03.516', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TLS', length: 308, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Zaključni aplikacijski dogodek je dokumentiran ločeno. TLS-preplet sam ne izpisuje imen računov.', logTime: '10:46:03' },
      { number: 32, time: '10:46:03.532', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '53417 → 443 · FIN, ACK', detail: 'Zaključevanje povezave TCP. Omrežni konec povezave in aplikacijska odjava sta različna pojma; v tem primeru sta časovno blizu.' },
    ],
    investigations: [
      { id: 'omrezje', title: 'Oznake v paketnem pregledu', text: 'ARP išče napravo v lokalnem omrežju, DNS pretvarja ime v naslov, TCP prenaša podatke, TLS šifrira povezavo, HTTP pa v prikazanem nešifriranem primeru razkrije zahtevo ali odgovor.' },
      { id: 'korelacija', title: 'Dva ločena vira dokazov', text: 'Paket pokaže čas, naslova in protokol. Aplikacijski dnevnik pove račun, dejanje, datoteko in rezultat. Povezavo med njima je za ta primer pripravila preiskovalna ekipa; samo ujemanje časa v resnični preiskavi ne bi nujno zadostovalo.' },
      { id: 'omejitve', title: 'Kaj še ni dokaz prenosa?', text: 'Povezava na vrata 443, odgovor HTTP 200 za drugo storitev ali potrditev TCP ACK ne dokazujejo uspešnega prenosa iskane datoteke. Preveri celoten aplikacijski dogodek.' },
    ],
  },
  {
    id: 7,
    title: 'Najdi ponarejeno spletno stran',
    topic: 'Domene',
    kind: 'domains',
    intro: 'Tri podobne prijavne strani uporabljajo različne naslove.',
    question: 'Potrjena šolska domena je sola.example. Izberi naslov, ki se predstavlja kot šolski, vendar pripada drugi domeni.',
    note: 'V tem učnem primeru je potrjena domena šole sola.example. Vse naslovne vrstice so simulirane; povezave niso aktivne.',
    choices: [
      { id: 'A', label: 'https://sola.example/prijava' },
      { id: 'B', label: 'https://ucilnica.sola.example/prijava' },
      { id: 'C', label: 'https://sola.example.prijava-varno.example/prijava' },
    ],
    investigations: [
      { id: 'imenik', title: 'Izsek iz šolskega imenika', text: 'Uradna domena v tem primeru je sola.example. Spletna učilnica je njena storitev na gostitelju ucilnica.sola.example.' },
      { id: 'videz', title: 'Primerjava videza', text: 'Vse tri prikazane strani uporabljajo isto besedilo prijavnega obrazca. Logotip, barve in oznako šole lahko kopira tudi druga stran.' },
      { id: 'sifrirana-povezava', title: 'Podatek o povezavi', text: 'Pri vseh treh naslovih se povezava začne s https://. To opisuje zaščito prenosa, ne potrjuje pa pripadnosti šoli.' },
    ],
  },
  {
    id: 8,
    title: 'Računalnik govori v ničlah in enicah',
    topic: 'Binarni zapis',
    kind: 'binary',
    intro: 'Zaključno mapo odpre koda iz petih bajtov.',
    question: 'Pretvori osembitne skupine v besedilo ASCII in vnesi zadnjo kodo.',
    evidence: '01001011 01001100 01001010 01010101 01000011',
    note: 'Vsako skupino osmih bitov loči s presledkom ali novo vrstico. Pomagaš si lahko tudi s tabelo ASCII za črke A–Z.',
    investigations: [
      { id: 'glava', title: 'Glava izvoza: 5 bajtov', text: 'Izvoz vsebuje pet skupin po osem bitov. Med skupinami so samo ločilni presledki; ti niso znaki končnega sporočila.' },
      { id: 'format', title: 'Dogovorjeni format: ASCII', text: 'V tem učnem izvozu vsak bajt predstavlja en znak ASCII. Sporočilo je zapisano brez šumnikov. Za druga besedila bi morali preveriti, katero znakovno kodiranje uporabljajo.' },
      { id: 'vrstni-red', title: 'Kontrolna opomba', text: 'Skupine beri od leve proti desni. Biti in črke niso premešani; iskana je ena beseda, ne vsota binarnih števil.' },
    ],
  },
];

export const stageSummaries: StageSummary[] = stages.map(({ id, title, topic }) => ({ id, title, topic }));

const hints: Record<number, [string, string]> = {
  1: ['V zgodbi poišči, kako je prejemnik razbral Cezarjevo sporočilo. Enak premik uporabi za vajin dokaz.', 'Pri dešifriranju se premakni za tri mesta nazaj: N postane K. Isto preslikavo uporabi za vse črke.'],
  2: ['V zgodbi je omenjenih šestnajst znakov, zapis pa je razdeljen v pare. Poišči ustrezno ime kodiranja v izbirnem meniju.', 'Izberi Šestnajstiško (HEX) in dekodiranje. Iz razkritega sporočila prepiši samo kodo naslednje mape.'],
  3: ['Odpri podrobnosti sporočil. Primerjaj dejanski naslov pošiljatelja in povezave z domeno sola.example.', 'Primerjaj zahteve sporočil: eno združuje tuji domeni, grožnjo takojšnje blokade in zahtevo po geslu ter enkratni kodi.'],
  4: ['Poglej, katere osebne podatke lahko prebere vsak obiskovalec profila.', 'Primerjaj ime psičke in letnico rojstva s ponujenimi gesli.'],
  5: ['Preveri, da je izbrana datoteka hodnik.jpg. V njenem izpisu loči čas nastanka posnetka od časa spremembe datoteke.', 'V metapodatkih hodnik.jpg poišči DateTimeOriginal in prepiši samo uro ter minute.'],
  6: ['Odpri povezani aplikacijski zapis pri paketu TLS. Šifriran paket sam ne pove računa. Iščeš uspešen prenos točno določene datoteke, ne njen ogled.', 'V ločenem aplikacijskem dnevniku poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.'],
  7: ['Ime šole se lahko pojavi tudi v poddomeni druge domene.', 'Pri enem naslovu se za sola.example pojavi še .prijava-varno.example.'],
  8: ['Vsaka skupina osmih bitov predstavlja en znak ASCII. Pretvori vseh pet skupin v istem vrstnem redu.', 'Prva skupina 01001011 predstavlja črko K. Preostale skupine pretvori v istem vrstnem redu.'],
};

const explanations: Record<number, string> = {
  1: 'Cezarjeva šifra zamenja črke s stalnim premikom po abecedi. V tem primeru je šifriranje premaknilo črke za tri mesta naprej, dešifriranje pa jih je vrnilo nazaj. Zgodba je razkrila premik, primerjava abeced pa preslikavo posameznih črk. Presledki in vrstni red so pomagali preveriti smiselnost sporočila. Takšna šifra je primerna za razumevanje osnov, ne za sodobno varovanje podatkov.',
  2: 'Šestnajstiški zapis (HEX) uporablja šestnajst znakov, 0–9 in A–F. Vsak par v tem primeru predstavlja en bajt besedila. Smiseln izhod je potrdil izbiro metode in razkril kodo naslednje mape. HEX je kodiranje, ne šifriranje: za pretvorbo ne potrebujemo skrivnega ključa in zapis sam ne varuje zaupnosti. Besedilo obvestila tudi samo po sebi še ne pojasni celotnega poteka incidenta.',
  3: 'Phishing skuša uporabnika zavesti v razkritje podatkov ali nevarno dejanje. Sporočilo B združuje tuji domeni pošiljatelja in povezave, grožnjo blokade ter zahtevo po prijavnih podatkih. Nujno obvestilo o učilnici in pričakovana priponka v drugih sporočilih sama po sebi nista phishing. V tem pripravljenem primeru ostalih šest sporočil ni zlonamernih; v resničnem svetu tudi ujemajoča se domena sama ne jamči varnosti. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti strani.',
  4: 'Imena ljubljenčkov in letnice rojstva so predvidljivi gradniki gesel. Dodan klicaj te predvidljivosti ne odpravi. Uporabljaj dolga, enkratna gesla, upravljalnik gesel in večfaktorsko prijavo. Tudi Miza783? ni zgled dobrega gesla. Iz te učne izbire ne moremo sklepati, katero geslo je bilo uporabljeno v incidentu.',
  5: 'Najprej je treba izbrati pravo datoteko: čas druge fotografije ne pojasni nastanka hodnik.jpg. DateTimeOriginal označuje nastanek posnetka; čas spremembe ModifyDate ni nujno čas fotografiranja. Posnetek zaslona v tej mapi tega podatka nima. Metapodatki lahko manjkajo ali so spremenjeni, zato sami po sebi niso nezmotljiv dokaz.',
  6: 'Paketni pregled in aplikacijski dnevnik sta različna vira. Šifrirani TLS-paketi ne razkrijejo računa ali poti; tukaj je njuna povezava pripravljena učna korelacija. Ločen dnevniški zapis ob 10:45:12 potrjuje uspešen prenos /zaupno/nacrt.pdf z računom ucenec17. Zavrnjen prenos, uspešen ogled, prenos druge datoteke in TCP ACK niso enak dokaz. Zapis potrjuje uporabo računa, sam pa ne dokazuje, katera oseba je bila za tipkovnico.',
  7: 'Naslov C pripada domeni prijava-varno.example. Protokol je https://, gostitelj je sola.example.prijava-varno.example, pot je /prijava. Šolsko ime sola.example je tukaj le del pred tujo domeno. Pri A je gostitelj potrjena domena sola.example, pri B pa je ucilnica njena poddomena. Prisotnost HTTPS ne naredi strani samodejno zaupanja vredne. Ta razčlenitev velja za konkretne učne primere; pri vseh naslovih registrirana domena ni nujno sestavljena iz zadnjih dveh delov.',
  8: 'Binarni zapis je način predstavitve podatkov. V tem primeru pet bajtov predstavlja pet znakov ASCII. Šele ta dogovor daje številom pomen črk; druga kodiranja lahko iste bajte razložijo drugače. Ta primer ni šifriranje. Odprla sta končno preiskovalno mapo.',
};

const feedback: Record<number, string> = {
  1: 'Še ni pravilno. Preveri smer in velikost premika ter poišči besedo, ki jo sporočilo označuje kot kodo.',
  2: 'Še ni pravilno. Preveri, ali si prekopiral vse pare in izbral metodo, ki ustreza namigu v zgodbi. V odgovor sodi samo koda naslednje mape, ne celotno obvestilo.',
  3: 'Še ni pravilno. Izberi eno sporočilo in vsaj dva različna opozorilna znaka. Vsak označeni razlog mora opisovati resnično opozorilo; preveri tudi morebitne odvečne izbire.',
  4: 'Še ni pravilno. Primerjaj javne podatke profila z gradniki vsakega ponujenega gesla.',
  5: 'Še ni pravilno. Preveri izbrano datoteko in loči nastanek posnetka od poznejše spremembe datoteke. Odgovori v obliki HH:MM.',
  6: 'Še ni pravilno. Podatke poišči v povezanem aplikacijskem zapisu. Hkrati preveri dejanje, natančno pot datoteke in rezultat; ogled ter zavrnjen prenos ne zadostujeta.',
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
  topics: stageSummaries.map(({ id, topic }) => id === 2 ? 'Kodiranja (HEX)' : topic),
  discussion: [
    'Kateri podatek je bil najbolj prepričljiv dokaz in kakšne so njegove omejitve?',
    'Kaj bi lahko šola in uporabniki naredili za boljšo zaščito?',
  ],
};
