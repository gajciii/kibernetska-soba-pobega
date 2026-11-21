# Operacija 404: Kdo je vdrl v šolski sistem?

Slovenska izobraževalna spletna igra za pare srednješolcev. Osem zaporednih nalog povezuje Cezarjevo šifro, Base64, phishing, predvidljiva gesla, metapodatke, strežniške dnevnike, domene in binarni zapis. Dokazi, lokalne ilustracije in delujoči pretvorniki so v aplikaciji; za igranje niso potrebni zunanji računi ali spletna orodja. Šola Most in vsi predstavljeni podatki so izmišljeni učni primeri.

## Lokalni zagon

Uporabi **Node.js 24 LTS, najmanj 24.13.0**, ter PostgreSQL 14 ali novejši; podprta glavna različica je zapisana v `.nvmrc`, natančne različice odvisnosti pa v `package-lock.json`. Projekt uporablja React, TypeScript, Vite, Express in PostgreSQL prek `pg`. Docker ni potreben.

```sh
nvm use
npm ci
cp .env.example .env
npm run db:local
npm run dev
```

Za `db:local` morajo biti v sistemu nameščena orodja PostgreSQL (`initdb`, `pg_ctl`, `createdb`); skripta zažene namensko lokalno instanco na vratih 55432, zunaj produkcije, in ustvari razvojno ter testno bazo z uporabnikom `operacija404`. Predloga `.env.example` vsebuje pravilni povezavi `postgresql://operacija404@127.0.0.1:55432/operacija404` in `postgresql://operacija404@127.0.0.1:55432/operacija404_test`. Podatki so v prezrti mapi `.local/postgres/`. Razvojna instanca uporablja lokalno zaupanje in posluša samo na loopbacku; namenjena je lokalnemu računalniku, ne produkciji.

Na macOS lahko uporabiš nameščeni PostgreSQL/Homebrew, na Linuxu distribucijski paket. Skripta poišče pogoste sistemske poti. Če orodij ne najde, podaj njihovo mapo, npr. `PG_BIN=/usr/lib/postgresql/16/bin npm run db:local`; isto nastavitev uporabi pri ustavitvi. Če že imaš PostgreSQL, namesto `db:local` nastavi `DATABASE_URL` in `TEST_DATABASE_URL` na dve ločeni namenski bazi. Produkcijske baze nikoli ne uporabi za teste. Lokalni podatki ostanejo po ustavitvi; `npm run db:local:stop` ustavi samo to razvojno instanco.

Odpri `http://localhost:5173`. Vite posreduje `/api` lokalnemu Expressu na vratih 3000. Po spremembi razvojnega porta ali izvora uskladi tudi `APP_ORIGIN` in razvojni proxy. Za začetek zadostuje »Začni preiskavo«; ime ekipe je neobvezno.

Vmesnik uporablja črno podlago čez cel zaslon, lokalno monospace tipografijo, minimalno glavo in nogo ter desni seznam izzivov s povezanimi pikami, številkami in naslovi. Naslov vsake naloge ima svetlobni poudarek, ki sledi kazalcu; idejo je navdihnil način »The Real Dark« na [pankajtanwar.in](https://www.pankajtanwar.in/). Osnovno besedilo naslova, navodila, dokazi in kontrolniki so ves čas berljivi. Na dotik, ob zmanjšanem gibanju ali brez podpore za masko je naslov enakomerno osvetljen. Po kliku »Začni preiskavo« se odpre neposredno prva naloga; dodatnega uvodnega koraka ni.

| Ukaz | Namen |
| --- | --- |
| `npm ci` | Ponovljiva namestitev iz zaklepne datoteke |
| `npm run db:local` | Zažene namenski lokalni PostgreSQL brez Dockerja |
| `npm run db:local:stop` | Ustavi namenski lokalni PostgreSQL |
| `npm run dev` | Razvojni vmesnik in API |
| `npm run lint` | Preverjanje pravil kode |
| `npm run typecheck` | Preverjanje TypeScript tipov |
| `npm test` | Enotski in API testi; zahtevajo namenski `TEST_DATABASE_URL` |
| `npm run test:e2e` | Vsi brskalniški testi v Chromiumu in Edge; prej build in `npx playwright install chromium msedge` |
| `npm run test:edge` | Samo Microsoft Edge Stable, namizni in ozek prikaz |
| `npm run build` | Produkcijski vmesnik in strežnik v `dist/` |
| `npm start` | Express streže produkcijski build in API na istem izvoru |
| `npm run db:init` | Inicializacija oziroma migracija baze; najprej izvedi build |
| `npm run db:backup -- /absolutna/pot/kopija.dump` | Konsistentna kopija PostgreSQL prek `pg_dump` v custom formatu; najprej izvedi build |

Baza se inicializira tudi ob zagonu aplikacije. Za lokalni preizkus produkcijskega builda nastavi `APP_ORIGIN=http://localhost:3000`, `COOKIE_SECURE=false` in `NODE_ENV=development`, nato izvedi `npm run build` in `npm start`. V produkciji z javnim dostopom uporabi HTTPS in varen piškotek, kot je opisano spodaj.

### Microsoft Edge

Aplikacija je pripravljena za aktualni **Microsoft Edge Stable**. Testi uporabljajo dejanski Edge prek Playwrightovega kanala `msedge`, kot opisujeta [Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/playwright/) in [Playwright](https://playwright.dev/docs/browsers). Star način Internet Explorer oziroma Edge Legacy ni podprt.

Če je Edge že nameščen na običajni sistemski poti, ga testi uporabijo neposredno. Sicer ga namesti z `npx playwright install msedge` (ta ukaz lahko namesti ali posodobi sistemski Edge in zahteva skrbniške pravice). Nato z zagnano testno bazo izvedi:

```sh
npm run build
npm run test:edge
```

Profila `edge-namizje` (1440 × 1000) in `edge-ozek-zaslon` (390 × 844) preverita celotno igro, pretvornike, tipkovnico, potrditveno okno, napake omrežja in nadaljevanje po dejanskem zaprtju ter ponovnem zagonu brskalnika z istim začasnim profilom. Ozek profil pomeni pomanjšano okno namiznega Edge, ne preizkusa aplikacije Edge na telefonu. Testi uporabljajo svoje začasne profile in ne odpirajo osebnega profila uporabnika. Za lokalno QA kopijo na drugi poti lahko nastaviš `EDGE_EXECUTABLE_PATH` na polno pot izvršljive datoteke; v CI ta nastavitev ni potrebna. Samo obstoječa Chromiumova profila zaženeš z `npm run test:e2e -- --project=namizje --project=ozek-zaslon`.

## Organizacija in podatki

- `src/`: igralni vmesnik, prikaz dokazov, pripomočki, dostopnost in slogi.
- `shared/types.ts`: tipi pogodb med vmesnikom in API-jem.
- `shared/converters.ts`: splošni lokalni pretvorniki; ne vsebujejo ključa rešitev.
- `server/content.ts`: uredljiva besedila, dokazi, namigi, strežniško preverjanje in razlage nalog.
- `server/`: API, upravljanje sej in PostgreSQL.
- `public/`: lokalni vizualni viri. Ne dodajaj vodiča ali odgovorov v to mapo.
- `public/fonts/`: lokalna pisava IBM Plex Mono (400, 500, 600), z vključeno licenco SIL Open Font License v `OFL.txt`. Med uporabo se pisava nalaga z istega strežnika kot aplikacija.
- `tests/`: testi pravil, pretvornikov in strežniškega poteka.
- `VODNIK_IZVAJALKE.md`: zasebno gradivo za izvajalko v repozitoriju, ki ga Express ne streže.
- `deploy/` in `.github/workflows/pipeline.yml`: priprava za Linux strežnik in GitHub Actions.

Vsaka ekipa ima naključen anonimni identifikator v piškotku `HttpOnly`; v bazi je shranjen njegov povzetek. Napredek, začetek in zaključek, poskusi ter že odprti namigi so trajni. Piškotek privzeto velja 180 dni. Izbris piškotka, zasebno okno ali drug brskalnik ustvarijo drugo ekipo; brez piškotka aplikacija ne more povezati anonimne ekipe s prejšnjim napredkom. Ponastavitev vpliva samo na trenutno sejo.

Pravilnost in dostop do stopenj preverja strežnik. API ne pošilja gradiva zaklenjenih nalog, neodprtih namigov ali celotnega ključa rešitev. Spremembe stanja zahtevajo žeton CSRF in preverjanje izvora. Poizvedbe so parametrizirane, vmesnik pa uporabniške podatke izpisuje kot besedilo. Ni skupne omejitve poskusov na javni IP; učilnica z enim javnim IP ima ločene seje za posamezne pare.

Ni zunanjih pisav, analitike, CDN-virov ali zunanjih API-jev za igranje. Čas je informativen in igre ne prekine. Napredek se ohrani ob ponovnem zagonu, če ohraniš bazo in piškotek.

## Postavitev in pipeline za Luko

**Pripravljeno je preverjanje v GitHub Actions in izklopljena, nastavljiva SSH-objava. Povezava s produkcijskim strežnikom ni vzpostavljena ali preverjena.** Predlagana domena `escaperoom.feri.um.si` še zahteva potrditev. Aplikacija pričakuje namestitev v korenu izbrane domene; `APP_ORIGIN` določa njen polni izvor (protokol, gostitelj in po potrebi port), ne podmape.

### 1. Strežnik in trajni podatki

Potreben je Linux z Node.js 24 LTS (najmanj 24.13.0), npm, Bash, tar, curl, util-linux (`flock`), OpenSSH, systemd in orodji PostgreSQL (`pg_dump`, `pg_restore`). PostgreSQL je samostojna lokalna ali upravljana storitev; podprta je različica 14 ali novejša, za novo postavitev izberi vzdrževano različico 16 ali novejšo. Različica odjemalca `pg_dump` mora podpirati različico strežnika. Nobena storitev ne zahteva Dockerja. Strežnik uredi proces aplikacije, DNS, HTTPS in obratni posrednik. Express posluša samo na `127.0.0.1`, en proces na vrata. Primeri predpostavljajo namenski sistemski uporabniški račun `operacija404`.

Luka enkrat pripravi strukturo in lastništvo:

```text
/srv/operacija404/
  incoming/                 # Prejeti arhivi iz pipelinea
  releases/<identifikator>/ # Koda, build in produkcijske odvisnosti posamezne izdaje
  current -> releases/...  # Aktivna izdaja
  shared/
    .env                   # Produkcijska konfiguracija; izven Gita in izdaj
    backups/               # pg_dump kopije baze; baza sama je v PostgreSQL
    deploy.lock            # Prepreči dve hkratni objavi
```

Namenski račun potrebuje pisanje v te direktorije; `shared/.env` naj bo berljiv samo temu računu (npr. način `600`). `DATABASE_URL` mora ves čas kazati na isto trajno produkcijsko bazo. Podatkovni direktorij PostgreSQL naj upravlja njegova storitev izven `/srv/operacija404/releases/` (npr. distribucijska pot `/var/lib/postgresql/...`) ali upravljani ponudnik. Pri nadgradnji aplikacije ne inicializiraj novega PostgreSQL-clustra, ne briši podatkov, ne briši `shared/` in ne zamenjuj njegovega `.env`. Namenski uporabnik baze potrebuje pravice za lastno aplikacijsko shemo in migracije, ne superuporabniških pravic. Produkcijsko bazo in njenega uporabnika Luka ustvari pred prvo objavo.

### 2. Okoljske spremenljivke

`.env.example` je javna predloga brez pravih skrivnosti. Za produkcijo Luka neposredno na strežniku pripravi `/srv/operacija404/shared/.env`:

| Spremenljivka | Produkcijski primer in pomen |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` | `127.0.0.1`; API naj bo dosegljiv prek posrednika |
| `PORT` | `3000`; uskladi z Nginxom in lokalnim zdravstvenim pregledom |
| `APP_ORIGIN` | `https://escaperoom.feri.um.si`; nadomesti s potrjeno domeno, brez končne poševnice |
| `DATABASE_URL` | `postgresql://operacija404:GESLO@127.0.0.1:5432/operacija404`; pravo geslo hrani samo v produkcijskem okolju, posebne znake v URL ustrezno kodiraj |
| `PG_DUMP_BIN` | Neobvezna absolutna pot do `pg_dump`, če ni v `PATH` |
| `COOKIE_SECURE` | `true`; brskalnik piškotek pošilja samo prek HTTPS |
| `TRUST_PROXY` | `1` samo za en zaupanja vreden posrednik pred lokalnim procesom; sicer `0` |
| `SESSION_TTL_DAYS` | `180`; življenjska doba anonimne seje |

Za oddaljeno bazo uporabi TLS s preverjenim certifikatom skladno z navodili ponudnika; ne izklapljaj preverjanja certifikatov. `TEST_DATABASE_URL` je samo razvojna/CI nastavitev in ne sme kazati na produkcijsko bazo.

Za seje ni treba ustvarjati skupnega gesla ali `SESSION_SECRET`. Skrivnosti za SSH sodijo v GitHub Secrets, ne v `.env.example`, Git ali arhiv izdaje. Ne izpisuj celotnega produkcijskega okolja v dnevnik pipelinea.

### 3. Proces in HTTPS

Prilagodi `deploy/operacija404.service.example` dejanskim potem, uporabniku in poti do Node.js; namesti ga kot `/etc/systemd/system/operacija404.service`, izvedi `systemctl daemon-reload` in omogoči storitev. Prvi zagon je smiseln po pripravi prve izdaje. Vzorčni systemd proces neposredno zaganja isti prevedeni strežnik kot `npm start`; razvojni Vite v produkciji ne teče.

`deploy/nginx.conf.example` prikazuje en HTTPS posrednik. Potrdilo, domeno in DNS pripravi skrbnik; vzorec sam ne izda potrdila. Posrednik naj prepiše zaupanja vredne glave, Expressova vrata pa naj ne bodo javno dostopna. Za namestitev v drugo domeno spremeni Nginx, certifikat in `APP_ORIGIN`; sprememba izvora zahteva ponovni zagon.

Namenskemu SSH-uporabniku dovoli samo potrebni nenadzorovani systemd dejanji prek `sudoers`: `systemctl restart operacija404.service` in `systemctl stop operacija404.service`, z dejansko absolutno potjo ukaza na strežniku. Ne dovoljuj poljubnega `sudo`. Če ime storitve spremeniš, uskladi tudi dovoljenja.

### 4. GitHub Actions

Ob pull requestu in spremembi veje `main` job `verify` pripravi izvorno nameščen PostgreSQL z namensko testno bazo ter izvede `npm ci`, lint, tipe, teste, produkcijski build in Playwrightov prehod v Chromiumu ter Microsoft Edge Stable. Edge se namesti na začasni Linux runner; pred pripravo izdaje morajo uspeti vsi štirje brskalniški profili. Ne uporablja Dockerjevih storitev. Testne poverilnice v workflowu veljajo samo na začasnem CI-runnerju. Arhiv vsebuje le `dist`, `package.json`, zaklepno datoteko in skripte `deploy`; produkcijske baze in okolja ni v njem. Prenesenega izvora iz pull requesta se ne objavlja.

Luka v GitHubu ustvari okolje **`production`** ter nastavi:

| Nastavitev | Mesto | Vrednost |
| --- | --- | --- |
| `DEPLOY_SSH_KEY` | Environment secret | Zasebni ključ namenskega računa z dostopom samo do tega strežnika |
| `DEPLOY_KNOWN_HOSTS` | Environment secret | Celotna vrstica/vrstice `known_hosts` z vnaprej in neodvisno preverjenim javnim ključem strežnika; pri drugih vratih oblika `[gostitelj]:vrata` |
| `DEPLOY_HOST` | Environment variable | Potrjen DNS gostitelj ali IPv4 strežnika |
| `DEPLOY_USER` | Environment variable | Npr. `operacija404` |
| `DEPLOY_PORT` | Environment variable | `22` ali druga vrata SSH |
| `DEPLOY_ROOT` | Environment variable | Npr. `/srv/operacija404` (absolutna pot brez presledkov) |
| `DEPLOY_SERVICE` | Environment variable | Npr. `operacija404.service` |
| `ENABLE_DEPLOY` | **Repository variable** | Nastavi na `true` šele po pripravi in pregledu strežnika; sicer se objava preskoči |

Ključ gostitelja pridobi po zaupanja vredni poti in primerjaj njegov odtis s skrbnikom. Pipeline uporablja `StrictHostKeyChecking=yes`; ključa ob objavi ne prevzame nekritično iz `ssh-keyscan`.

Ko je `ENABLE_DEPLOY=true`, uspešna sprememba `main` samodejno sproži objavo. Na `main` jo je mogoče sprožiti tudi ročno z `workflow_dispatch`, po enakih preverjanjih. Če produkcijska veja ni `main`, spremeni filter `push.branches` in pogoj joba `deploy`; priporočena je zaščita produkcijske veje z obveznim jobom `verify`.

### 5. Posodobitev, kopije in vrnitev

Objavna skripta zaklene hkratne objave, preveri nastavitev povezave PostgreSQL, razpakira novo izdajo in namesti samo produkcijske odvisnosti z `npm ci --omit=dev`. `.env` v izdaji je povezava na nespremenjeni `shared/.env`. Pred zagonom izdaje naredi konsistentno varnostno kopijo obstoječe baze s `pg_dump` v custom formatu, tudi ko aplikacija še teče. Če kopija ne uspe, izdaje ne aktivira. Nato atomsko zamenja povezavo `current`, ponovno zažene storitev in do 20-krat preveri `http://127.0.0.1:PORT/api/health`.

Health endpoint odgovori `{"status":"ok"}` samo ob dosegljivi bazi. Ob neuspehu skripta ponovno aktivira prejšnjo izdajo in ponovno zažene storitev; trenutne baze ne prepisuje. Ob neuspešni prvi objavi storitev ustavi. Lokalni zdravstveni pregled ne dokazuje pravilne nastavitve javnega DNS/HTTPS; Luka naj ob prvi postavitvi dodatno preveri javni naslov in v brskalniku zaključi poskusno igro.

Ročno kopijo naredi iz aktivne izdaje, npr.:

```sh
cd /srv/operacija404/current
npm run db:backup -- /srv/operacija404/shared/backups/rocna-2026-11-21.dump
```

Za redne kopije določi strežniški časovnik in kopiranje v ločeno varovano shrambo; primerna pogostost je odvisna od izvedb delavnice. Priloženi pipeline naredi kopijo pred objavo, ne časovno načrtovanih kopij. Podatkovnega direktorija delujočega PostgreSQL ne kopiraj z navadnim `cp`; uporabi `pg_dump` ali pravilno nastavljeno fizično kopiranje PostgreSQL. Kopije vsebujejo anonimen napredek in morebitna imena ekip; omeji dostop in preveri obnovitev v ločeni testni bazi.

Za ročno vrnitev kode izberi ohranjeno predhodno izdajo, pripravi novo simbolno povezavo in z `mv -Tf` atomsko zamenjaj `current`, ponovno zaženi storitev ter preveri health. S tem ohraniš najnovejši napredek. V prvi različici se uporablja začetna shema; prihodnje migracije morajo biti združljive s prejšnjo izdajo ali imeti dokumentiran postopek vrnitve. Samodejno vračanje kode ne vrača sheme baze.

Obnovitev baze je ločen skrbniški poseg: ustavi aplikacijo, naredi kopijo trenutnega stanja, s `pg_restore` obnovi preverjeno kopijo najprej v novo prazno bazo, preveri shemo in podatke, nato usmeri `DATABASE_URL` nanjo in zaženi aplikacijo. Povezovalnih nizov z gesli ne podajaj v javne dnevnike ali shell zgodovino; uporabi varovano okolje oziroma datoteko `.pgpass`. Obnovitev prejšnje kopije izgubi novejši napredek, zato je ne uporabljaj za običajno vračanje kode. Določi hrambo izdaj in kopij; skripta jih samodejno ne briše.

### Kaj mora Luka še dopolniti

Potrditi mora domeno in produkcijsko vejo, pripraviti strežnik, Node.js in trajni PostgreSQL z namensko bazo/uporabnikom, direktorije in lastništvo, produkcijski `.env`, HTTPS posrednik in systemd, omejene pravice za ponovni zagon, SSH-ključe ter vse zgornje GitHub nastavitve. Po prvem preverjenem ročnem zagonu lahko vključi samodejno objavo. Noben produkcijski dostopni podatek ni izmišljen ali vključen v repozitorij.

## Preverjanje delovanja

Preverjeno 21. 11. 2026 z Node.js 24.22.3 in lokalnim PostgreSQL 14.17:

- 70 enotskih in integracijskih testov je uspelo v dejanski bazi PostgreSQL.
- 20 testov Playwright je uspelo: po 10 v Chromiumu in dejanskem Microsoft Edge Stable 158.0.4370.33 na macOS, pri 1440 × 1000 in 390 × 844. Pokriti so vseh osem stopenj, pretvorniki, napake, namigi, finale, nadaljevanje po dejanskem ponovnem zagonu brskalnika, potrditev ponastavitve in ohranitev vnosa ob napaki omrežja. Preverjeni so tudi desni seznam povezanih stopenj, svetlobni učinek na naslovih ter prikaz na dotik in ob zmanjšanem gibanju.
- Med celotno igro ni bilo zahtev na zunanje izvore ali napak JavaScript. Preverjeni so tipkovnični premik šifre, začetni fokus potrditvenega okna, prehajanje med gumboma s Tab/Shift+Tab, zaprtje z Escape in vrnitev fokusa na odpiralni gumb ter odsotnost vodoravnega prelivanja strani; dnevnik se pomika znotraj svoje tabele. Vrnitev fokusa je bila popravljena po preizkusu v Edge.
- Čista namestitev `npm ci`, lint, TypeScript, produkcijski build in `bash -n` za objavno skripto so uspeli. `npm run check:client` je del builda in preverja odsotnost ključev rešitev, vodiča in source map iz javnega paketa.
- Ukaz za varnostno kopijo je izdelal arhiv PostgreSQL; `pg_restore --list` je potrdil njegovo berljivo vsebino.
- Vizualno so pregledani posnetki namiznega in ozkega vmesnika ter Edgeovega dnevnika. Vgrajeni predogled odjemalca ni bil na voljo; brskalniški testi in posnetki so bili izvedeni lokalno. Edge na Windows, Safari, Firefox, bralnik zaslona in povezava s produkcijskim strežnikom še niso preverjeni; Linux preverjanje obeh brskalnikov je pripravljeno v GitHub workflowu.

Avtomatski testi pokrivajo pretvornike z učnimi in dodatnimi vhodi, strežniške odgovore vseh nalog, napačne odgovore in zahtevane razlike pri phishingu, času fotografije in dnevniku. Integracijski testi preverijo zaklenjene naloge, napredek, namige, ponovno odprtje baze, dve ločeni ekipi, ponastavitev, zaporedno odklepanje in finale. Podrobnosti so v `tests/`.

Za sprejemni pregled preigraj vseh osem stopenj, osveži stran, zapri in ponovno odpri isti brskalnik, ter ponovno zaženi aplikacijo z isto bazo. Preveri tipkovnico (Tab, Enter, preslednica), vidne fokuse, oznake, neaktivne učne URL-je, širino okoli 390 px in namizni prikaz. V omrežnem panelu med igro ne sme biti zahtev do drugih izvorov. Izklopi povezavo med oddajo: odgovor naj ostane v polju in po ponovni povezavi omogoči ponovni poskus. Produkcijski build ne sme javno razkriti vodiča ali strežniškega ključa rešitev.
