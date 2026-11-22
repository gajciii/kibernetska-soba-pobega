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
    intro: 'Na šoli Piramida je nekdo prenesel zaupni načrt. Tvoja naloga je odkriti, kateremu projektu pripada. Detektiv ti je pripravil mapo z dokazi, za vstop vanjo pa potrebuješ kodo. Skrita je v spodnjem sporočilu iz datoteke sporocilo.txt. Zapis uporablja šifro, poimenovano po Juliju Cezarju: vsako črko zamenja druga črka abecede. Cezar je zaupna sporočila prikrival s premikom za tri mesta po abecedi: namesto A je zapisal D. Prejemnik je moral črke vrniti na njihova prvotna mesta.',
    question: 'Razberi sporočilo in v polje »Odgovor« vnesi kodo za odpiranje mape.',
    evidence: 'NRGD MH SLUDPLGD',
    note: 'Uporabljaj abecedo A–Z brez šumnikov. Premik in smer razberi iz zgodbe, nato črke primerjaj s pomočjo abecednega pripomočka. Presledke in ločila ohrani.',
    investigations: [
      { id: 'arhiv', title: 'Izvor: začasna mapa', text: 'Zapis je bil najden v datoteki sporocilo.txt. Njeno ime opisuje vrsto datoteke in ni geslo.' },
      { id: 'razmiki', title: 'Ohranjen prepis', text: 'Pri prepisu so bili ohranjeni vsi presledki in vrstni red znakov. Rezultat bi moral biti smiselno sporočilo s tremi besedami.' },
      { id: 'abeceda', title: 'Opomba ob zapisu', text: 'Uporabljena je latinica A–Z. Ko pri premiku prideš pred A, nadaljuj z Z; številke in ločila pusti pri miru.' },
    ],
  },
  {
    id: 2,
    title: 'Kaj se skriva za čudnimi znaki?',
    topic: 'Kodiranja',
    kind: 'encoding',
    intro: 'V odprti mapi najdeš obvestilo.dat, detektivov izvoz prve prijave nenavadnega dogajanja. V njem se skriva ime osebe, pri kateri se je preiskava začela, in oznaka mape z njeno prijavo ter shranjeno e-pošto. Ob datoteki je pripis: »Kar gre skozi moj sistem, nosi dve preobleki. Zunanja pozna šestnajst znakov, pod njo pa se skriva abeceda štiriinšestdesetih.« Preostanek zapiska manjka.',
    question: 'Uporabi pretvornik, da razbereš sporočilo iz dokaza. Dobljeno kodo na koncu vpiši v polje »Odgovor«.',
    evidence: '55 46 4A 4A 53 6B 46 57 53 56 52 46 54 45 6F 36 49 45 78 56 53 30 45 67 53 31 4A 42 54 45 6F 75 49 45 74 50 52 45 45 67 54 55 46 51 52 54 6F 67 55 46 4A 46 52 45 46 4D 4C 67 3D 3D',
    note: 'Najprej dekodiraj zunanji zapis. Celoten vmesni rezultat ročno prekopiraj v vhod, nato izberi kodiranje notranjega zapisa in znova dekodiraj. Poskusi v pretvorniku ne štejejo kot oddaje odgovora.',
    investigations: [
      { id: 'ovojnica', title: 'Izvoz: obvestilo.dat', text: 'Detektivov izvoz prve prijave je bil kodiran dvakrat. Pri branju najprej odstrani zunanjo, nato notranjo plast; končnica .dat postopka ne določa.' },
      { id: 'nabor', title: 'Zunanji in notranji zapis', text: 'Zunanji zapis sestavljajo pari znakov 0–9 in A–F. Notranji uporablja večji nabor črk in števk ter lahko vsebuje +, / in končno dopolnilo =.' },
      { id: 'rezultat', title: 'Pričakovani rezultat', text: 'Po prvem koraku pričakuj drug kodiran zapis. Šele drugi korak razkrije kratko obvestilo s kodo naslednje mape.' },
    ],
  },
  {
    id: 3,
    title: 'Poišči phishing sporočilo',
    topic: 'Phishing',
    kind: 'phishing',
    intro: 'Razkrito obvestilo te pripelje do dijaka Luke Kralja. Na dan sumljivega prenosa je prejel nenavadno e-pošto in jo prijavil detektivu. Ta je z Lukovim dovoljenjem zbral sporočila iz njegovega šolskega predala, da bi preveril, ali je kdo poskušal pridobiti njegove prijavne podatke. Lukin naslov je luka.kralj@piramida.si, šola uporablja domeno piramida.si. Preglej sedem sporočil in označi sumljivega, da napreduješ.',
    question: 'Katero sporočilo je phishing? Utemelji izbiro.',
    note: 'Izmišljena šola uporablja domeno piramida.si. Vsa sporočila so z dne 20. 11. 2026, časi so lokalni. Predal, priponke in povezave so neaktivna učna simulacija. Prikazno ime, nujnost ali sama prisotnost priponke še ne zadoščajo za sklep.',
    mails: [
      {
        id: 'A',
        sender: 'Šolska knjižnica <knjiznica@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '08:12',
        preview: 'V petek poteče rok za vračilo izposojene knjige.',
        replyTo: 'knjiznica@piramida.si',
        subject: 'Opomnik za vračilo knjige',
        body: 'Pozdravljen, Luka, v petek poteče rok za vračilo tvoje izposojene knjige. Če si jo že vrnil, lahko opomnik prezreš. Lep pozdrav, šolska knjižnica.',
      },
      {
        id: 'C',
        sender: 'Mentorica <mentorica@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '08:44',
        preview: 'Jutrišnja delavnica bo ob 10. uri v računalniški učilnici.',
        replyTo: 'mentorica@piramida.si',
        subject: 'Termin delavnice',
        body: 'Pozdravljen, Luka, jutrišnja delavnica bo ob 10. uri v računalniški učilnici. Za delo potrebuješ le šolski računalnik. Se vidimo, mentorica.',
      },
      {
        id: 'D',
        sender: 'Šolska IT podpora <podpora@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '07:50',
        preview: 'Danes od 16. do 17. ure bo potekalo načrtovano vzdrževanje.',
        subject: 'Načrtovano vzdrževanje šolske učilnice',
        body: 'Pozdravljeni, danes od 16. do 17. ure bo spletna učilnica občasno nedosegljiva zaradi načrtovanega vzdrževanja. Od vas ne potrebujemo nobenih podatkov ali dejanj. Po zaključku bo obvestilo objavljeno na običajni strani učilnice.',
        linkLabel: 'Obvestila spletne učilnice',
        linkUrl: 'https://ucilnica.piramida.si/obvestila',
        replyTo: 'podpora@piramida.si',
      },
      {
        id: 'B',
        sender: 'Šolska IT podpora <podpora@piramiida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '09:57',
        preview: 'Zaznali smo težavo s tvojim računom. Odzovi se v 10 minutah.',
        replyTo: 'podpora@piramiida.si',
        subject: 'NUJNO: tvoj račun bo čez 10 minut blokiran',
        body: 'Pozdravljen, Luka Kralj, zaznali smo težavo s tvojim šolskim računom. V naslednjih 10 minutah odpri spodnjo povezavo ter vnesi geslo in enkratno prijavno kodo, sicer bo račun blokiran.',
        linkLabel: 'Preveri šolski račun',
        linkUrl: 'https://piramida.si.piramiida.si/prijava',
      },
      {
        id: 'E',
        sender: 'Tajništvo šole <tajnistvo@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '09:30',
        preview: 'Sprememba učilnice velja že za naslednjo šolsko uro.',
        subject: 'Pomembno: naslednja ura je v učilnici 204',
        body: 'Pozdravljeni, zaradi okvare projektorja se naslednja ura prestavi v učilnico 204. Spremembo lahko preverite na oglasni deski ali pri razredniku. To obvestilo ne zahteva prijave ali pošiljanja osebnih podatkov.',
        replyTo: 'tajnistvo@piramida.si',
      },
      {
        id: 'F',
        sender: 'Šolski krožek fotografije <foto@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '09:08',
        preview: 'V priponki je že napovedani razpored fotografiranja razredov.',
        subject: 'Razpored fotografiranja za prihodnji teden',
        body: 'Živjo, Luka, pošiljamo razpored, ki smo ga dogovorili na srečanju krožka. Enak seznam je na oglasni deski pri knjižnici. Če opaziš napako v terminu svojega razreda, odgovori mentorici. Dokument ne vsebuje obrazca za prijavo.',
        attachment: 'razpored_fotografiranja.pdf · 84 KB · simulirana priponka',
        replyTo: 'foto@piramida.si',
      },
      {
        id: 'G',
        sender: 'Šolska prehrana <prehrana@piramida.si>',
        recipient: 'Luka Kralj <luka.kralj@piramida.si>',
        time: '10:05',
        preview: 'Jedilnik za prihodnji teden je objavljen na šolski strani.',
        subject: 'Jedilnik za prihodnji teden',
        body: 'Pozdravljeni, na šolski strani je objavljen jedilnik za prihodnji teden. Za ogled ni potrebna prijava. Običajen postopek odjave malice ostaja nespremenjen. Lep pozdrav, organizacija prehrane.',
        linkLabel: 'Poglej jedilnik',
        linkUrl: 'https://piramida.si/prehrana/jedilnik',
        replyTo: 'prehrana@piramida.si',
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
    intro: 'Lažna podpora je Luko nagovorila z imenom in priimkom. Koliko bi neznanec o njem lahko izvedel že brez dostopa do predala? Luka detektivu pokaže svoj javni profil: izlete, psičko in nekaj vrstic o sebi. Ob pregledu se zamisli — podatki, iz katerih bi si sestavil nekaj lahko zapomnljivega, so ves čas na očeh vsem. Pred nadaljevanjem preiskave mu pomagaj prepoznati šibko izbiro in bolje zaščititi račun.',
    question: 'Iz javnih podatkov sestavi primer predvidljivega gesla, nato izberi priporočila za varnejšo uporabo gesel in zaščito računa.',
    note: 'Vnos se preveri samo v učni igri in se ne uporabi za prijavo. Potrditev predvidljivega gesla odpre drugi del naloge; naslednjo stopnjo odklene šele pravilen izbor priporočil.',
    profile: {
      name: 'Luka Kralj',
      username: '@luka.kralj',
      bio: '🎂 2009. 🏫 Šola Piramida. Najraje zunaj, na snegu ⛷️ ali na poti v hribe. 🏔️',
      avatar: '/profile/luka.jpg',
      avatarAlt: 'Portret Luke Kralja.',
      posts: [
        { id: 'luna', image: '/profile/luna.jpg', alt: 'Psička na sprehodu na prostem.', caption: 'Luna je danes spet ukradla vso pozornost. Z njo tudi kratek sprehod postane dogodivščina.', location: 'Popoldanski sprehod' },
        { id: 'smucanje', image: '/profile/smucanje.jpg', alt: 'Luka na zasneženem smučišču.', caption: 'Prva vožnja, mrzel zrak in cel dan na snegu. Takih vikendov se ne naveličam.', location: 'Na smučišču' },
        { id: 'gore', image: '/profile/gore.jpg', alt: 'Gorska pot med alpskimi vrhovi.', caption: 'Zgodnje vstajanje se je splačalo. Razgled na vrhu je bil boljši od vseh fotografij.', location: 'V gorah' },
      ],
    },
    recommendations: [
      { id: 'long', label: 'Uporabljaj dolga, naključno sestavljena gesla.' },
      { id: 'reuse', label: 'Isto geslo uporabljaj na več računih, da si ga lažje zapomniš.' },
      { id: 'manager', label: 'Za ustvarjanje in shranjevanje gesel uporabi upravljalnik gesel.' },
      { id: 'personal', label: 'Geslo sestavi iz imena ljubljenčka in rojstne letnice ter dodaj klicaj.' },
      { id: 'unique', label: 'Za vsak račun uporabi drugo geslo.' },
      { id: 'mfa', label: 'Za dodatno zaščito računa vklopi večfaktorsko prijavo.' },
    ],
  },
  {
    id: 5,
    title: 'Fotografija skriva namig',
    topic: 'Metapodatki',
    kind: 'metadata',
    intro: "Pri pogovoru o računu se Luka spomni, da je tisti dan uporabljal skupni računalnik v šoli. Ob odhodu je fotografiral hodnik pred računalniško učilnico z rdečim nahrbtnikom. Trdi, da je bilo to ob 11:15, in detektivu pošlje mapo fotografij. Posnetek bi lahko pomagal časovno umestiti njegov odhod. Toda sliko je mogoče pozneje urediti ali znova shraniti. Spremljajo jo metapodatki — podatki o datoteki, kot so ime, velikost in zapisani časi.",
    question: "Ob kateri uri je bila fotografija dejansko posneta? Odgovori v obliki HH:MM.",
    note: "Pripravljeni učni izpisi spremljajo lokalne slike in niso prebrani iz njihovih datotek. Vsi prikazani časi uporabljajo časovni pas UTC+01:00.",
    metadata: "Ime datoteke: hodnik.jpg\nVelikost: 2,4 MB\nČas nastanka posnetka: 20. 11. 2026 10:42:17\nČas spremembe: 20. 11. 2026 11:15:00\nČasovni pas: UTC+01:00",
    artifacts: [
      {"id": "ucilnica", "name": "ucilnica.jpg", "kind": "photo", "size": "1,8 MB", "description": "Prazna računalniška učilnica z vrstami delovnih mest.", "preview": "/evidence/ucilnica.jpg", "alt": "Računalniška učilnica z monitorji in praznimi stoli.", "metadata": "Ime datoteke: ucilnica.jpg\nVelikost: 1,8 MB\nČas nastanka posnetka: 20. 11. 2026 08:16:09\nČas spremembe: 20. 11. 2026 08:25:44\nČasovni pas: UTC+01:00"},
      {"id": "dvorisce", "name": "dvorisce.jpg", "kind": "photo", "size": "2,1 MB", "description": "Šolsko dvorišče pred začetkom pouka.", "preview": "/evidence/dvorisce.jpg", "alt": "Šolsko dvorišče s klopmi in drevesi.", "metadata": "Ime datoteke: dvorisce.jpg\nVelikost: 2,1 MB\nČas nastanka posnetka: 20. 11. 2026 07:48:32\nČas spremembe: 20. 11. 2026 07:53:10\nČasovni pas: UTC+01:00"},
      {"id": "knjiznica", "name": "knjiznica.jpg", "kind": "photo", "size": "1,9 MB", "description": "Knjižne police in bralna miza v šolski knjižnici.", "preview": "/evidence/knjiznica.jpg", "alt": "Šolska knjižnica s policami in bralno mizo.", "metadata": "Ime datoteke: knjiznica.jpg\nVelikost: 1,9 MB\nČas nastanka posnetka: 20. 11. 2026 09:07:15\nČas spremembe: 20. 11. 2026 09:12:46\nČasovni pas: UTC+01:00"},
      {"id": "telovadnica", "name": "telovadnica.jpg", "kind": "photo", "size": "2,3 MB", "description": "Šolska telovadnica pred vadbo.", "preview": "/evidence/telovadnica.jpg", "alt": "Prazna telovadnica s košarkarskim košem in označenim igriščem.", "metadata": "Ime datoteke: telovadnica.jpg\nVelikost: 2,3 MB\nČas nastanka posnetka: 20. 11. 2026 09:26:54\nČas spremembe: 20. 11. 2026 09:32:11\nČasovni pas: UTC+01:00"},
      {"id": "projekt", "name": "projekt.jpg", "kind": "photo", "size": "1,6 MB", "description": "Material in pripomočki na mizi za šolski projekt.", "preview": "/evidence/projekt.jpg", "alt": "Delovna miza z robotskim avtomobilčkom, elektronskimi deli in orodjem.", "metadata": "Ime datoteke: projekt.jpg\nVelikost: 1,6 MB\nČas nastanka posnetka: 19. 11. 2026 14:06:27\nČas spremembe: 19. 11. 2026 14:22:53\nČasovni pas: UTC+01:00"},
      {"id": "stopnisce", "name": "stopnisce.jpg", "kind": "photo", "size": "2,0 MB", "description": "Stopnišče med šolskima nadstropjema.", "preview": "/evidence/stopnisce.jpg", "alt": "Notranje šolsko stopnišče z ograjo.", "metadata": "Ime datoteke: stopnisce.jpg\nVelikost: 2,0 MB\nČas nastanka posnetka: 20. 11. 2026 09:34:21\nČas spremembe: 20. 11. 2026 09:39:17\nČasovni pas: UTC+01:00"},
      {"id": "obvestilo", "name": "obvestilo.png", "kind": "image", "size": "186 KB", "description": "Posnetek zaslona obvestila o vzdrževanju.", "preview": "/evidence/obvestilo.png", "alt": "Posnetek zaslona šolskega obvestila o vzdrževanju sistema.", "metadata": "Ime datoteke: obvestilo.png\nVelikost: 186 KB\nČas ustvarjanja: 20. 11. 2026 09:51:06\nČas spremembe: 20. 11. 2026 10:03:28\nČasovni pas: UTC+01:00"},
      {"id": "gore", "name": "gore.jpg", "kind": "photo", "size": "3,4 MB", "description": "Gorska pot z izleta v hribe.", "preview": "/profile/gore.jpg", "alt": "Gorska pot med alpskimi vrhovi.", "metadata": "Ime datoteke: gore.jpg\nVelikost: 3,4 MB\nČas nastanka posnetka: 4. 11. 2026 11:32:48\nČas spremembe: 4. 11. 2026 12:07:19\nČasovni pas: UTC+01:00"},
      {"id": "jedilnica", "name": "jedilnica.jpg", "kind": "photo", "size": "2,2 MB", "description": "Šolska jedilnica pred malico.", "preview": "/evidence/jedilnica.jpg", "alt": "Jedilnica z mizami in stoli.", "metadata": "Ime datoteke: jedilnica.jpg\nVelikost: 2,2 MB\nČas nastanka posnetka: 20. 11. 2026 10:08:36\nČas spremembe: 20. 11. 2026 10:14:09\nČasovni pas: UTC+01:00"},
      {"id": "vhod", "name": "vhod.jpg", "kind": "photo", "size": "2,5 MB", "description": "Glavni vhod v šolsko stavbo.", "preview": "/evidence/vhod.jpg", "alt": "Vhod v šolo z vrati in nadstreškom.", "metadata": "Ime datoteke: vhod.jpg\nVelikost: 2,5 MB\nČas nastanka posnetka: 20. 11. 2026 07:39:52\nČas spremembe: 20. 11. 2026 07:45:06\nČasovni pas: UTC+01:00"},
      {"id": "hodnik", "name": "hodnik.jpg", "kind": "photo", "size": "2,4 MB", "description": "Hodnik pred računalniško učilnico z rdečim nahrbtnikom.", "preview": "/evidence/hodnik.jpg", "alt": "Rdeč nahrbtnik na hodniku pred vrati računalniške učilnice.", "metadata": "Ime datoteke: hodnik.jpg\nVelikost: 2,4 MB\nČas nastanka posnetka: 20. 11. 2026 10:42:17\nČas spremembe: 20. 11. 2026 11:15:00\nČasovni pas: UTC+01:00"},
      {"id": "tabla", "name": "tabla.jpg", "kind": "photo", "size": "1,5 MB", "description": "Tabla z geometrijskimi skicami po koncu ure.", "preview": "/evidence/tabla.jpg", "alt": "Šolska tabla z geometrijskimi skicami in kredo.", "metadata": "Ime datoteke: tabla.jpg\nVelikost: 1,5 MB\nČas nastanka posnetka: 20. 11. 2026 10:22:05\nČas spremembe: 20. 11. 2026 10:28:41\nČasovni pas: UTC+01:00"},
    ],
  },
  {
    id: 6,
    title: 'Kateri račun je bil uporabljen za prenos?',
    topic: 'Dnevniki',
    kind: 'logs',
    intro: 'Čas fotografije usmeri pregled v dogajanje okoli Lukovega odhoda iz učilnice. Detektiv je iz tega časovnega okvira pripravil omrežni promet in strežniške dnevnike. Omrežni promet je izmenjava podatkov med napravami v majhnih delih, imenovanih paketi; nastaja ob prijavah, odpiranju strani in prenosih. Med običajnimi dogodki iščeš uspešen prenos /zaupno/nacrt.pdf. Iskalnik ti lahko pomaga zožiti izbor. Račun v zapisu je sled, sam pa še ne pove, kdo je sedel za skupnim računalnikom.',
    question: 'Kateri uporabniški račun je bil uporabljen za uspešen prenos iskane datoteke?',
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
      { number: 1, time: '10:39:41.010', source: '02:40:40:00:00:10', destination: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP', length: 42, info: 'Naprava 10.0.0.10 išče strojni naslov naprave 10.0.0.1.', detail: 'ARP poišče strojni naslov (MAC), ki pripada znanemu naslovu IP v lokalnem omrežju. Pri ARP sta prikazana strojna naslova; ff:ff:ff:ff:ff:ff pomeni oddajanje vsem na lokalni povezavi. ARP ne uporablja TCP.' },
      { number: 2, time: '10:39:41.012', source: '02:40:40:00:00:01', destination: '02:40:40:00:00:10', protocol: 'ARP', length: 42, info: 'Strojni naslov naprave 10.0.0.1 je 02:40:40:00:00:01.', detail: 'Odgovor lokalnega prehoda na poizvedbo ARP. Izmišljeni strojni naslov je del simulacije in ni podatek o uporabniku.' },
      { number: 3, time: '10:39:43.015', source: '10.0.0.10', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: piramida.si', detail: 'Računalnik vpraša lokalni strežnik DNS za naslov gostitelja. Poizvedba ne dokazuje prijave ali prenosa datoteke.' },
      { number: 4, time: '10:39:43.019', source: '10.0.0.53', destination: '10.0.0.10', protocol: 'DNS', length: 88, info: 'Odgovor A: piramida.si → 10.0.0.5', detail: 'V učnem omrežju je spletni strežnik na 10.0.0.5. Naslovi niso namenjeni obiskovanju zunaj simulacije.' },
      { number: 5, time: '10:39:47.100', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TCP', length: 74, info: '52810 → 443 · SYN', detail: 'Začetek vzpostavljanja povezave TCP. Vrata 443 so običajna za HTTPS, vendar sama številka vrat še ne pove, kaj je uporabnik naredil.' },
      { number: 6, time: '10:39:47.104', source: '10.0.0.5', destination: '10.0.0.10', protocol: 'TCP', length: 74, info: '443 → 52810 · SYN, ACK', detail: 'Strežnik potrjuje začetek povezave. Izbor ne vsebuje vseh paketov rokovanja; številke so vrstni red prikazanih dokazov.' },
      { number: 7, time: '10:39:48.130', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TLS', length: 602, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Vsebina paketa je šifrirana. Dodatna učna povezava vodi na ločeno zavarovan zapis aplikacijskega dnevnika istega dogodka.', logTime: '10:39:48' },
      { number: 8, time: '10:40:00.003', source: '10.0.0.9', destination: '10.0.0.5', protocol: 'HTTP', length: 132, info: 'GET /status HTTP/1.1', detail: 'Izmišljeni lokalni nadzor preverja javni status storitve prek nešifriranega HTTP. Pot je zato vidna v tem primeru. To ni dostop do preiskovane datoteke.' },
      { number: 9, time: '10:40:02.318', source: '10.0.0.11', destination: '10.0.0.5', protocol: 'TLS', length: 618, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'TLS varuje vsebino. Račun in dejanje lahko preveriš v povezanem aplikacijskem zapisu, ne v bajtih tega paketa.', logTime: '10:40:02' },
      { number: 10, time: '10:40:03.009', source: '10.0.0.5', destination: '10.0.0.9', protocol: 'HTTP', length: 184, info: 'HTTP/1.1 200 OK · status storitve', detail: 'Odgovor lokalnemu nadzoru. Koda 200 se nanaša na javni status storitve in ne dokazuje uspešnega prenosa katerekoli druge datoteke.' },
      { number: 11, time: '10:40:14.619', source: '10.0.0.5', destination: '10.0.0.10', protocol: 'TLS', length: 1266, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odziv strežnika prek TLS. Velikost in smer paketa sami ne ločita ogleda dokumenta od njegovega prenosa.', logTime: '10:40:14' },
      { number: 12, time: '10:40:30.102', source: '10.0.0.12', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: piramida.si', detail: 'Poizvedba DNS drugega računalnika. Uporabniškega računa v tem paketu ni.' },
      { number: 13, time: '10:40:30.107', source: '10.0.0.53', destination: '10.0.0.12', protocol: 'DNS', length: 88, info: 'Odgovor A: piramida.si → 10.0.0.5', detail: 'Odgovor lokalnega DNS določi cilj povezave. Ne potrjuje uspešne prijave v aplikacijo.' },
      { number: 14, time: '10:40:39.284', source: '10.0.0.12', destination: '10.0.0.5', protocol: 'TLS', length: 612, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Za vsebinski pomen izbranega dogodka je na voljo ločen aplikacijski zapis. Gre za pripravljeno korelacijo učnega primera.', logTime: '10:40:39' },
      { number: 15, time: '10:40:55.940', source: '10.0.0.14', destination: '10.0.0.5', protocol: 'TCP', length: 74, info: '53114 → 443 · SYN', detail: 'Nov računalnik vzpostavlja povezavo. Sam začetek povezave ne pomeni dostopa do zaupnih podatkov.' },
      { number: 16, time: '10:41:05.352', source: '10.0.0.14', destination: '10.0.0.5', protocol: 'TLS', length: 606, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Paket ne vsebuje berljivega uporabniškega imena. Oglej si ločen dnevnik, če želiš ugotoviti dejanje.', logTime: '10:41:05' },
      { number: 17, time: '10:41:23.648', source: '10.0.0.5', destination: '10.0.0.12', protocol: 'TLS', length: 510, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odziv je šifriran. Za ugotovitev rezultata dejanja preveri povezani zapis in njegovo polje Rezultat.', logTime: '10:41:23' },
      { number: 18, time: '10:41:23.652', source: '10.0.0.12', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '52912 → 443 · ACK', detail: 'Potrditev prejema podatkov na ravni TCP. ACK ne pomeni, da je aplikacija dovolila zahtevano dejanje.' },
      { number: 19, time: '10:41:46.205', source: '10.0.0.5', destination: '10.0.0.12', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Prenos podatkov v povezavi TLS. V ločenem dnevniku preveri tudi pot, saj lahko isti račun dostopa do različnih datotek.', logTime: '10:41:46' },
      { number: 20, time: '10:42:00.600', source: '02:40:40:00:00:19', destination: 'ff:ff:ff:ff:ff:ff', protocol: 'ARP', length: 42, info: 'Naprava 10.0.0.19 išče strojni naslov naprave 10.0.0.1.', detail: 'Lokalna poizvedba ARP z izmišljenima strojnima naslovoma. Ne gre za pošiljanje zahteve zunanjemu spletnemu mestu.' },
      { number: 21, time: '10:42:31.527', source: '10.0.0.5', destination: '10.0.0.14', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Iz samega šifriranega odziva ni mogoče ugotoviti vrste uporabnikovega dejanja. Primerjaj Dogodek in Rezultat v pripadajočem dnevniku.', logTime: '10:42:31' },
      { number: 22, time: '10:42:56.191', source: '10.0.0.19', destination: '10.0.0.5', protocol: 'TLS', length: 614, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Povezava je vzpostavljena, vendar to še ne pomeni uspešne prijave v aplikacijo. Preveri povezani dnevnik.', logTime: '10:42:56' },
      { number: 23, time: '10:43:00.012', source: '10.0.0.17', destination: '10.0.0.53', protocol: 'DNS', length: 72, info: 'Poizvedba A: piramida.si', detail: 'Poizvedba po šolskem strežniku. Račun uporabnika ni del tega DNS-paketa.' },
      { number: 24, time: '10:43:05.724', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TLS', length: 610, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Aplikacijsko vsebino varuje TLS. Podrobnosti računa so na voljo samo v ločenem učnem zapisu aplikacije.', logTime: '10:43:05' },
      { number: 25, time: '10:43:28.309', source: '10.0.0.5', destination: '10.0.0.14', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Odgovor strežnika vsebuje šifrirane podatke. Ista velikost paketa se lahko pojavi pri različnih dokumentih.', logTime: '10:43:28' },
      { number: 26, time: '10:44:08.442', source: '10.0.0.5', destination: '10.0.0.11', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Povezani zapis dopolnjuje omrežni dokaz s potjo datoteke. Podatka nismo razbrali iz šifriranega paketa.', logTime: '10:44:08' },
      { number: 27, time: '10:44:39.833', source: '10.0.0.10', destination: '10.0.0.5', protocol: 'TLS', length: 306, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Krajša izmenjava v obstoječi povezavi. Pomen dejanja preveri v aplikacijskem dnevniku.', logTime: '10:44:39' },
      { number: 28, time: '10:45:12.208', source: '10.0.0.5', destination: '10.0.0.17', protocol: 'TLS', length: 1434, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Šifrirani odziv strežnika. Ločeni aplikacijski zapis omogoča primerjavo računa, dejanja, poti datoteke in rezultata.', logTime: '10:45:12' },
      { number: 29, time: '10:45:12.212', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '53417 → 443 · ACK', detail: 'Potrditev prejema paketa. Ne razkriva uporabniškega računa ali poti datoteke; za te podatke je potreben aplikacijski dnevnik.' },
      { number: 30, time: '10:45:44.440', source: '10.0.0.11', destination: '10.0.0.5', protocol: 'TLS', length: 310, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Še ena kratka šifrirana izmenjava. Velikost sporočila ni dokaz njegove vsebine.', logTime: '10:45:44' },
      { number: 31, time: '10:46:03.516', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TLS', length: 308, info: 'TLS 1.3 · šifrirani aplikacijski podatki', detail: 'Zaključni aplikacijski dogodek je dokumentiran ločeno. TLS-preplet sam ne izpisuje imen računov.', logTime: '10:46:03' },
      { number: 32, time: '10:46:03.532', source: '10.0.0.17', destination: '10.0.0.5', protocol: 'TCP', length: 66, info: '53417 → 443 · FIN, ACK', detail: 'Zaključevanje povezave TCP. Omrežni konec povezave in aplikacijska odjava sta različna pojma; v tem primeru sta časovno blizu.' },
    ],
    investigations: [
      { id: 'omrezje', title: 'Oznake v paketnem pregledu', text: 'ARP išče strojni naslov (MAC) naprave v lokalnem omrežju, DNS pretvarja ime v naslov, TCP prenaša podatke, TLS šifrira povezavo, HTTP pa v prikazanem nešifriranem primeru razkrije zahtevo ali odgovor.' },
      { id: 'korelacija', title: 'Dva ločena vira dokazov', text: 'Paket pokaže čas, naslova in protokol. Aplikacijski dnevnik pove račun, dejanje, datoteko in rezultat. Povezavo med njima je za ta primer pripravila preiskovalna ekipa; samo ujemanje časa v resnični preiskavi ne bi nujno zadostovalo.' },
      { id: 'omejitve', title: 'Kaj še ni dokaz prenosa?', text: 'Povezava na vrata 443, odgovor HTTP 200 za drugo storitev ali potrditev TCP ACK ne dokazujejo uspešnega prenosa iskane datoteke. Preveri celoten aplikacijski dogodek.' },
    ],
  },
  {
    id: 7,
    title: 'Najdi ponarejeno spletno stran',
    topic: 'Domene',
    kind: 'domains',
    intro: 'Dnevnik je pokazal račun in naslov IP računalnika, s katerega je bil sprožen prenos načrta. Detektiv zdaj odpre zavarovano zgodovino tega računalnika. Med petimi naslovi je tudi povezava iz Lukove sumljive pošte. Prijavne strani so videti enako, zato preveri URL: gostitelj je del za https:// in pred naslednjo poševnico. Šola uporablja piramida.si in ucilnica.piramida.si. Ponaredek lahko spremeni eno črko, jo podvoji ali šolsko ime skrije v poddomeno tuje strani; dodatek za vprašajem je parameter. Pred iskanjem načrta loči šolski arhiv od tujih strani.',
    question: 'V zgodovini izberi eno ponarejeno povezavo. Kateri tuji domeni pripada? Vpiši samo domeno, brez https:// in poti.',
    note: 'Zgodovina vsebuje pet pripravljenih naslovov. Prikaz prijavne strani ostane enak; spreminja se naslovna vrstica. Noben naslov se ne odpre v omrežju in obrazec ne zbira prijavnih podatkov.',
    choices: [
      { id: 'A', label: 'https://piramida.si/prijava' },
      { id: 'B', label: 'https://ucilnica.piramida.si/prijava' },
      { id: 'C', label: 'https://piramida.si.piramiida.si/prijava' },
      { id: 'D', label: 'https://pirameda.si/prijava' },
      { id: 'F', label: 'https://piramida.si/prijava?jezik=sl' },
    ],
    investigations: [
      { id: 'zgodovina', title: 'Izpis zgodovine', text: 'Detektiv je zavaroval pet zapisov obiskov. Njihov vrstni red ni ocena varnosti in ne pove, kdo je posamezno stran odprl.' },
      { id: 'imenik', title: 'Izsek iz šolskega imenika', text: 'Šola uporablja domeno piramida.si. Njena spletna učilnica je na gostitelju ucilnica.piramida.si.' },
      { id: 'videz', title: 'Primerjava videza', text: 'Pri vseh petih zapisih se pokaže ista podoba prijavne strani. Logotip, barve in besedilo obrazca lahko kopira tudi druga stran.' },
      { id: 'sifrirana-povezava', title: 'Podatek o povezavi', text: 'Vsi prikazani naslovi se začnejo s https://. To opisuje zaščito prenosa, ne potrjuje pa pripadnosti šoli.' },
      { id: 'pot', title: 'Pot do strani', text: 'Besedilo za poševnico za gostiteljem določa pot na izbranem strežniku. Tudi ime druge organizacije je lahko del takšne poti.' },
      { id: 'parametri', title: 'Dodatni parametri', text: 'Vprašaj uvede dodatne parametre naslova, na primer izbiro jezika. Parameter sam ne spremeni gostitelja povezave.' },
    ],
  },
  {
    id: 8,
    title: 'Računalnik govori v ničlah in enicah',
    topic: 'Binarni zapis',
    kind: 'binary',
    intro: 'Prepoznal si ponarejeno prijavo. Detektiv je v pravem arhivu po računu, času in poti prenosa našel ustrezno različico načrta. Iz njegove oznake projekta je pripravil izvoz desetih bajtov ASCII in pripisal: »Vsaka enica nekaj šteje. Njeno mesto pove, koliko.« V teh desetih skupinah je kodno ime projekta, ki ga iščeš od začetka. Ko ga razbereš, bo jasno, kateri načrt je bil ogrožen.',
    question: 'Za vsak bajt seštej uteži mest z enico. Vsoto poišči v tabeli ASCII in sestavi kodno ime projekta. Vpiši ga v polje za odgovor.',
    evidence: '01000010 01010010 01010101 01000011 01001111 01010110 01000001 01001110 01001010 01000101',
    note: 'Uteži osmih mest od leve proti desni so 128, 64, 32, 16, 8, 4, 2 in 1. Enica prispeva utež svojega mesta, ničla pa nič. Za vsak bajt posebej seštej prispevke in decimalno vsoto poišči v tabeli ASCII za črke A–Z.',
    investigations: [
      { id: 'glava', title: 'Glava izvoza: 10 bajtov', text: 'Izvoz vsebuje deset skupin po osem bitov. Vsako skupino obdelaj posebej; presledki med njimi niso znaki končnega sporočila.' },
      { id: 'format', title: 'Dogovorjeni format: ASCII', text: 'V tem učnem izvozu vsak bajt predstavlja en znak ASCII. Sporočilo je zapisano brez šumnikov. Pri drugih besedilih je treba preveriti, katero znakovno kodiranje uporabljajo.' },
      { id: 'vrstni-red', title: 'Kontrolna opomba', text: 'Bajte beri od leve proti desni in za vsakega poišči eno črko. Uteži seštevaj znotraj posameznega bajta, ne čez vseh deset skupin. Črke ohranijo vrstni red bajtov.' },
    ],
  },
];

export const stageSummaries: StageSummary[] = stages.map(({ id, title, topic }) => ({ id, title, topic }));

const hints: Record<number, [string, string]> = {
  1: ['Cezar je črke premaknil, prejemnik pa jih mora vrniti. Primerjaj A in D ter razmisli, v katero smer boš bral sporočilo.', 'Pri dešifriranju se premakni za tri mesta nazaj: N postane K. Isto preslikavo uporabi za vse črke.'],
  2: ['Upoštevaj vrstni red: najprej zunanji zapis s šestnajstimi znaki v parih, nato notranji z naborom štiriinšestdesetih znakov.', 'Najprej dekodiraj Šestnajstiško (HEX). Celoten rezultat ročno prekopiraj v vhod, izberi Base64 in ponovno dekodiraj. Odgovor je samo koda naslednje mape.'],
  3: ['Primerjaj dejanski naslov pošiljatelja in cilj povezave z domeno piramida.si. Ime, ki ga prepoznaš, samo po sebi še ni dokaz pristnosti.', 'Primerjaj zahteve sporočil: eno združuje tuji domeni, grožnjo takojšnje blokade in zahtevo po geslu ter enkratni kodi.'],
  4: ['Katera javna podatka bi si lastnik zlahka zapomnil in ju združil? Pri priporočilih razmisli tudi o ponavljanju gesel med računi.', 'Poveži ime psičke in letnico v opisu profila v eno besedo. Nato izberi priporočila za dolžino, različna gesla, upravljalnik in dodatno zaščito prijave.'],
  5: ['Med slikami poišči hodnik z rdečim nahrbtnikom in odpri njegove metapodatke. Čas poznejše spremembe ni nujno čas fotografiranja.', 'Pri datoteki hodnik.jpg primerjaj polji Čas nastanka posnetka in Čas spremembe. V odgovor prepiši uro in minute iz prvega.'],
  6: ['V iskalnik »Besedilni filter« vnesi ime iskane datoteke. Pri preostalih paketih primerjaj povezane strežniške zapise: uspešen prenos ni isto kot ogled ali zavrnjen poskus.', 'V ločenem aplikacijskem dnevniku poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.'],
  7: ['Preberi celotnega gostitelja med https:// in prvo naslednjo poševnico ter ga primerjaj s potrjenima šolskima gostiteljema. Sam pojav imena piramida.si še ne potrjuje pripadnosti šoli.', 'Če je piramida.si na začetku daljšega gostitelja, preveri, katere tuje domene je poddomena. Vnesi tujo domeno izbranega ponaredka, brez poddomene piramida.si ali poti.'],
  8: ['Uteži mest od leve proti desni so 128, 64, 32, 16, 8, 4, 2 in 1. Seštej samo uteži mest z enico; ničle ne prispevajo ničesar. Vsota enega bajta določi eno črko v tabeli ASCII.', 'Pri prvem bajtu 01000010 sta enici na mestih z utežmi 64 in 2. Vsota je 66, v tabeli ASCII pa to pomeni B. Enako obdelaj preostalih devet bajtov in ohrani njihov vrstni red.'],
};

const explanations: Record<number, string> = {
  1: 'Koda PIRAMIDA odpre mapo z detektivovim izvozom prve prijave. Cezarjeva šifra zamenja črke s stalnim premikom po abecedi. V tem primeru je šifriranje premaknilo črke za tri mesta naprej, dešifriranje pa jih je vrnilo nazaj. Zgodba je razkrila premik, primerjava abeced pa preslikavo posameznih črk. Presledki in vrstni red so pomagali preveriti smiselnost sporočila. Takšna šifra je primerna za razumevanje osnov, ne za sodobno varovanje podatkov.',
  2: 'Obvestilo razkrije prijavitelja Luko Kralja in kodo PREDAL: ta odpre mapo z njegovo prijavo ter kopijo poštnega predala, ki jo pregledaš v naslednjem koraku. Zapis je vseboval dve plasti: dekodiranje HEX je razkrilo zapis Base64, šele njegovo dekodiranje pa besedilo. Vrstni red je pomemben, ker mora biti rezultat prvega postopka veljaven vhod za drugega. HEX in Base64 sta kodiranji, ne šifriranje; tudi njuna kombinacija ne zagotavlja zaupnosti. Besedilo obvestila samo po sebi še ne pojasni celotnega poteka incidenta.',
  3: 'Phishing skuša uporabnika zavesti v razkritje podatkov ali nevarno dejanje. Sporočilo B združuje tuji domeni pošiljatelja in povezave, grožnjo blokade ter zahtevo po prijavnih podatkih. Nujno obvestilo o učilnici in pričakovana priponka v drugih sporočilih sama po sebi nista phishing. V tem pripravljenem primeru ostalih šest sporočil ni zlonamernih; v resničnem svetu tudi ujemajoča se domena sama ne jamči varnosti. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti strani.',
  4: 'Ime ljubljenčka in rojstna letnica sta javna in predvidljiva gradnika. Dodan klicaj ali preprosta zamenjava črke z znakom tega ne odpravita. Boljša izbira so dolga, naključna in za vsak račun različna gesla; pri ustvarjanju ter shranjevanju pomaga upravljalnik gesel. Večfaktorska prijava doda zaščito računa, ne spremeni pa šibkega gesla v močno. Ta vaja ne razkriva Lukovega pravega gesla in ne dokazuje, kaj je bilo uporabljeno pri incidentu.',
  5: 'Čas 10:42 usmeri naslednji pregled na dogodke okoli domnevnega Lukovega odhoda iz učilnice; ne dokazuje, kdo je ostal za računalnikom. Rdeč nahrbtnik na hodniku je pomagal prepoznati pravo fotografijo med drugimi slikami. Polje Čas nastanka posnetka beleži 10:42:17, polje Čas spremembe pa 11:15:00. Poznejše urejanje ali ponovno shranjevanje lahko spremeni čas datoteke, zato 11:15 ne pomeni nujno časa fotografiranja. Sam zapis spremembe ne pove, kaj je bilo spremenjeno. Metapodatki lahko manjkajo ali so spremenjeni; so sled za preverjanje, ne nezmotljiv dokaz.',
  6: 'Paketni pregled in aplikacijski dnevnik sta različna vira. Šifrirani TLS-paketi ne razkrijejo računa ali poti; tukaj je njuna povezava pripravljena učna korelacija. Ločen dnevniški zapis ob 10:45:12 potrjuje uspešen prenos /zaupno/nacrt.pdf z računom ucenec17. Zavrnjen prenos, uspešen ogled, prenos druge datoteke in TCP ACK niso enak dokaz. Naslov IP 10.0.0.17 poveže dogodek z računalnikom, katerega zgodovino pregledaš v naslednjem koraku. Zapis potrjuje uporabo računa, sam pa ne dokazuje, katera oseba je bila za tipkovnico.',
  7: 'Povezava iz Lukove pošte se pojavi tudi v zavarovani zgodovini; to še ne dokazuje, kdo jo je odprl oziroma ali je kdo vnesel geslo. Domnevni arhiv na piramida.si.piramiida.si pripada tuji domeni piramiida.si; piramida.si je le njena zavajajoča poddomena. Domena piramiida.si ima podvojen i, pirameda.si pa namesto drugega i uporablja e; nobena ni šolska piramida.si. Potrjena gostitelja sta piramida.si in ucilnica.piramida.si; dodatek ?jezik=sl ne spremeni gostitelja. Izbira ponaredka je utemeljena z njegovo tujo domeno. Kopirana podoba in HTTPS sama ne potrjujeta pripadnosti šoli. Razčlenitev velja za te naslove; registrirana domena ni vedno sestavljena iz zadnjih dveh delov.',
  8: 'Mesta v bajtu imajo uteži 128, 64, 32, 16, 8, 4, 2 in 1. Enica prispeva pripadajočo utež, ničla pa nič; seštevek je decimalna vrednost bajta. Tabela ASCII to vrednost poveže z znakom. Deset bajtov da besedo BRUCOVANJE: kodno ime projekta, ki mu pripada preneseni načrt. S tem si našel podatek, zaradi katerega si odprl preiskavo. Gre za predstavitev podatkov, ne za šifriranje; druga znakovna kodiranja lahko iste bajte razložijo drugače. Preiskava je zaključena.',
};

const feedback: Record<number, string> = {
  1: 'Še ni pravilno. Preveri smer in velikost premika ter poišči besedo, ki jo sporočilo označuje kot kodo.',
  2: 'Še ni pravilno. Preveri oba koraka in njun vrstni red ter celovitost prekopiranega vmesnega rezultata. Prvi rezultat še ni sporočilo; v odgovor sodi samo koda iz končnega obvestila.',
  3: 'Še ni pravilno. Izberi eno sporočilo in vsaj dva različna opozorilna znaka. Vsak označeni razlog mora opisovati resnično opozorilo; preveri tudi morebitne odvečne izbire.',
  4: 'Izbor priporočil še ni pravilen. Preveri, ali izbrani ukrepi zmanjšajo predvidljivost in ponovno uporabo gesel ter bolje zaščitijo račun.',
  5: 'Še ni pravilno. Preveri fotografijo hodnika z rdečim nahrbtnikom in loči nastanek posnetka od poznejše spremembe datoteke. Odgovori v obliki HH:MM.',
  6: 'Še ni pravilno. Podatke poišči v povezanem aplikacijskem zapisu. Hkrati preveri dejanje, natančno pot datoteke in rezultat; ogled ter zavrnjen prenos ne zadostujeta.',
  7: 'Še ni pravilno. Izberi ponarejeno povezavo in vnesi tujo domeno, ki ji pripada. Ne prepisuj celotnega URL-ja, zavajajoče poddomene piramida.si ali poti.',
  8: 'Še ni pravilno. Pri vsakem bajtu prištej samo uteži mest z enico, nato preveri decimalno vsoto v tabeli ASCII. Vpiši deset črk v vrstnem redu bajtov, brez vmesnih presledkov.',
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

export function validateProfilePassword(answer: unknown): boolean {
  return typeof answer === 'string' && /^(?:luna2009|2009luna)!?$/iu.test(answer.trim());
}

export function validateAnswer(id: number, answer: unknown): boolean {
  switch (id) {
    case 1:
      return ['PIRAMIDA', 'KODA JE PIRAMIDA'].includes(words(answer) ?? '');
    case 2: {
      const value = words(answer);
      return value === 'PREDAL' || (value !== undefined && /^KODA\s*:\s*PREDAL$/u.test(value));
    }
    case 3: {
      if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
      const { message, reasons } = answer as { message?: unknown; reasons?: unknown };
      if (message !== 'B' || !Array.isArray(reasons) || reasons.length > 6) return false;
      const allowed = new Set(['domain', 'link', 'urgency', 'credentials']);
      return reasons.every((reason) => typeof reason === 'string' && allowed.has(reason)) && new Set(reasons).size >= 2;
    }
    case 4: {
      if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
      const { recommendations } = answer as { recommendations?: unknown };
      if (!Array.isArray(recommendations) || recommendations.length !== 4 || new Set(recommendations).size !== 4) return false;
      const allowed = new Set(['long', 'unique', 'manager', 'mfa']);
      return recommendations.every(value => typeof value === 'string' && allowed.has(value));
    }
    case 5:
      return typeof answer === 'string' && ['10:42', '10.42', '10:42:17'].includes(answer.trim());
    case 6:
      return words(answer) === 'UCENEC17';
    case 7: {
      if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
      const { sourceId, domain } = answer as { sourceId?: unknown; domain?: unknown };
      if (typeof sourceId !== 'string' || typeof domain !== 'string') return false;
      const foreignDomains = new Map([
        ['C', 'piramiida.si'], ['D', 'pirameda.si'],
      ]);
      return domain.trim().toLowerCase() === foreignDomains.get(sourceId);
    }
    case 8:
      return typeof answer === 'string' && answer.trim().toUpperCase() === 'BRUCOVANJE';
    default:
      return false;
  }
}

export const finale: Finale = {
  title: 'Odkril si projekt BRUCOVANJE.',
  topics: stageSummaries.map(({ id, topic }) => id === 2 ? 'Kodiranja (HEX in Base64)' : topic),
};
