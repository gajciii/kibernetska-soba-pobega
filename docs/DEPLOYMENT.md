# Postavitev in vzdrževanje Operacije 404

[Kratek opis in zagon](../README.md) · [Vodič za izvajalca z rešitvami](../VODNIK_IZVAJALKE.md)

Ukaze izvajaj iz korena repozitorija. Dogovorjeni javni naslov je [https://escaperoom.feri.um.si](https://escaperoom.feri.um.si), lestvica pa [https://escaperoom.feri.um.si/lestvica](https://escaperoom.feri.um.si/lestvica). Ob preverjanju DNS še ni bil dosegljiv. Lokalni razvoj uporablja [http://localhost:5173](http://localhost:5173).

## Lokalni PostgreSQL

Potrebni so Node.js 24 LTS, najmanj 24.13.0, npm in PostgreSQL 14 ali novejši. [Skripta db-local](../scripts/db-local.mjs) potrebuje orodja `initdb`, `pg_ctl`, `psql` in `createdb`; poišče običajne poti Homebrew in Linuxa. Če jih ne najde, podaj mapo, na primer:

```sh
PG_BIN=/usr/lib/postgresql/16/bin npm run db:local
```

Isto nastavitev uporabi pri `npm run db:local:stop`. Skripta posluša samo na `127.0.0.1:55432`, uporablja lokalno zaupanje in ustvari bazi `operacija404` ter `operacija404_test` z uporabnikom `operacija404`. Podatki ostanejo v prezrti mapi `.local/postgres/`. To je razvojna instanca, ki je ne izpostavljaj kot produkcijsko bazo. Če rezervirana vrata uporablja druga baza, skripta zagon zavrne.

[Predloga okolja](../.env.example) vsebuje razvojno povezavo `postgresql://operacija404@127.0.0.1:55432/operacija404` in ločeno testno povezavo. Če že imaš PostgreSQL, nastavi `DATABASE_URL` in `TEST_DATABASE_URL` na namenski bazi ter izpusti `db:local`. Produkcijske baze nikoli ne uporabi za teste. Vite na vratih 5173 posreduje `/api` Expressu na 3000; spremembo razvojnega izvora uskladi z `APP_ORIGIN` in proxyjem.

## Prevedena aplikacija

Za lokalni preizkus v `.env` nastavi `APP_ORIGIN=http://localhost:3000`, `COOKIE_SECURE=false` in `NODE_ENV=development`, nato:

```sh
npm run build
npm start
```

Odpri [http://localhost:3000](http://localhost:3000). Express streže `dist/client` in API v enem procesu. Baza se inicializira oziroma migrira ob zagonu; ročno lahko po buildu izvedeš `npm run db:init`. V produkciji uporabi `NODE_ENV=production`, HTTPS, varen piškotek in potrjeni `APP_ORIGIN` po spodnjih navodilih. Aplikacija se namesti v koren domene, ne v podmapo.

## Produkcijska postavitev

**Pripravljeno je preverjanje v GitHub Actions in nastavljiva SSH-objava. Povezava pipelinea s produkcijskim strežnikom še ni preverjena.** Javni naslov je `https://escaperoom.feri.um.si`; dostopi in strežniške nastavitve potrebujejo pregled. Aplikacija pričakuje namestitev v korenu domene; `APP_ORIGIN` določa njen polni izvor (protokol, gostitelj in po potrebi port), ne podmape.

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

[`.env.example`](../.env.example) je javna predloga brez pravih skrivnosti. Za produkcijo Luka neposredno na strežniku pripravi `/srv/operacija404/shared/.env`:

| Spremenljivka | Produkcijski primer in pomen |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` | `127.0.0.1`; API naj bo dosegljiv prek posrednika |
| `PORT` | `3000`; uskladi z Nginxom in lokalnim zdravstvenim pregledom |
| `APP_ORIGIN` | `https://escaperoom.feri.um.si`; potrjeni javni izvor, brez končne poševnice |
| `DATABASE_URL` | `postgresql://operacija404:GESLO@127.0.0.1:5432/operacija404`; pravo geslo hrani samo v produkcijskem okolju, posebne znake v URL ustrezno kodiraj |
| `PG_DUMP_BIN` | Neobvezna absolutna pot do `pg_dump`, če ni v `PATH` |
| `COOKIE_SECURE` | `true`; brskalnik piškotek pošilja samo prek HTTPS |
| `TRUST_PROXY` | `1` samo za en zaupanja vreden posrednik pred lokalnim procesom; sicer `0` |
| `SESSION_TTL_DAYS` | `180`; življenjska doba seje |

Za oddaljeno bazo uporabi TLS s preverjenim certifikatom skladno z navodili ponudnika; ne izklapljaj preverjanja certifikatov. `TEST_DATABASE_URL` je samo razvojna/CI nastavitev in ne sme kazati na produkcijsko bazo.

Za seje ni treba ustvarjati skupnega gesla ali `SESSION_SECRET`. Skrivnosti za SSH sodijo v GitHub Secrets, ne v `.env.example`, Git ali arhiv izdaje. Ne izpisuj celotnega produkcijskega okolja v dnevnik pipelinea.

### 3. Proces in HTTPS

Prilagodi [vzorčno storitev systemd](../deploy/operacija404.service.example) dejanskim potem, uporabniku in poti do Node.js; namesti jo kot `/etc/systemd/system/operacija404.service`, izvedi `systemctl daemon-reload` in omogoči storitev. Prvi zagon je smiseln po pripravi prve izdaje. Vzorčni systemd proces neposredno zaganja isti prevedeni strežnik kot `npm start`; razvojni Vite v produkciji ne teče.

[Vzorec Nginx](../deploy/nginx.conf.example) prikazuje en HTTPS posrednik. Potrdilo, domeno in DNS pripravi skrbnik; vzorec sam ne izda potrdila. Posrednik naj prepiše zaupanja vredne glave, Expressova vrata pa naj ne bodo javno dostopna. Za namestitev v drugo domeno spremeni Nginx, certifikat in `APP_ORIGIN`; sprememba izvora zahteva ponovni zagon.

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

Za redne kopije določi strežniški časovnik in kopiranje v ločeno varovano shrambo; primerna pogostost je odvisna od izvedb delavnice. Priloženi pipeline naredi kopijo pred objavo, ne časovno načrtovanih kopij. Podatkovnega direktorija delujočega PostgreSQL ne kopiraj z navadnim `cp`; uporabi `pg_dump` ali pravilno nastavljeno fizično kopiranje PostgreSQL. Kopije vsebujejo napredek sej in javna imena skupin z rezultati; omeji dostop in preveri obnovitev v ločeni testni bazi.

Za ročno vrnitev kode izberi ohranjeno predhodno izdajo, pripravi novo simbolno povezavo in z `mv -Tf` atomsko zamenjaj `current`, ponovno zaženi storitev ter preveri health. Baza pri tem ostane nespremenjena. Pred vrnitvijo preveri združljivost izbrane izdaje s trenutno shemo: objavna skripta vrne kodo, ne povrne migracij. Prejšnja izdaja, ki ne podpira sheme 3, zato ni samodejno varna pot za vrnitev.

Trenutna shema je različice **3**. Migracija doda čas dovoljenega naslednjega začetka seje in tabelo za omejevanje zahtev; ohrani obstoječi napredek in rezultate. Pri starih začetih sejah se premor izračuna iz prvotnega časa začetka. Pred nadgradnjo naredi kopijo in pred morebitno vrnitvijo kode preveri združljivost te sheme.

Obnovitev baze je ločen skrbniški poseg: ustavi aplikacijo, naredi kopijo trenutnega stanja, s `pg_restore` obnovi preverjeno kopijo najprej v novo prazno bazo, preveri shemo in podatke, nato usmeri `DATABASE_URL` nanjo in zaženi aplikacijo. Povezovalnih nizov z gesli ne podajaj v javne dnevnike ali shell zgodovino; uporabi varovano okolje oziroma datoteko `.pgpass`. Obnovitev prejšnje kopije izgubi novejši napredek, zato je ne uporabljaj za običajno vračanje kode. Določi hrambo izdaj in kopij; skripta jih samodejno ne briše.

### Kaj mora Luka še dopolniti

Potrditi mora produkcijsko vejo ter preveriti oziroma pripraviti DNS za dogovorjeno domeno, strežnik, Node.js in trajni PostgreSQL z namensko bazo/uporabnikom, direktorije in lastništvo, produkcijski `.env`, HTTPS posrednik in systemd, omejene pravice za ponovni zagon, SSH-ključe ter vse zgornje GitHub nastavitve. Po prvem preverjenem ročnem zagonu lahko vključi samodejno objavo. Noben produkcijski dostopni podatek ni izmišljen ali vključen v repozitorij.

## Preverjanje pred objavo

Z zagnano namensko testno bazo izvedi:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium msedge
npm run test:e2e
```

Playwright uporabi Chromium in dejanski Microsoft Edge Stable v namiznem ter ozkem profilu. Namestitev `msedge` lahko posodobi sistemski Edge in zahteva skrbniške pravice. Samo Edge zažene `npm run test:edge`; pri nestandardni poti uporabi `EDGE_EXECUTABLE_PATH`. Testi imajo ločene začasne profile. Ozek profil je pomanjšano namizno okno, ne mobilna aplikacija Edge. Podrobnosti: [Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/playwright/) in [Playwright](https://playwright.dev/docs/browsers).

Build vključuje `npm run check:client`, ki preveri odsotnost ključev rešitev, vodiča in source map iz javnega paketa. Pred javno uporabo preigraj vseh osem nalog, osveži stran in preveri nadaljevanje po ponovnem zagonu z isto bazo. Preveri tudi tipkovnico, ozek zaslon, javno lestvico ter ohranitev vnosa ob izpadu omrežja. Učni naslovi ne smejo sprožati zahtev na zunanje izvore.

## Seje, rezultati in omejitve

Piškotek `HttpOnly` vsebuje naključen identifikator seje, v bazi je njegov povzetek. Napredek, čas, poskusi in odprti namigi ostanejo v PostgreSQL; seja privzeto velja 180 dni. Prvi korak naloge o geslih shrani samo oznako potrditve, ne vnesenega gesla. Ime skupine ni način za obnovitev seje. Stara seja brez imena ga dopolni s `POST /api/session` in ohrani napredek.

Javni `GET /api/leaderboard` vrne prvih 100 rezultatov, lasten rezultat tudi zunaj njih ter čas osvežitve; podstran `/lestvica` jih med ogledom osvežuje vsakih pet sekund. Vrstni red je: rešeni izzivi padajoče, namigi naraščajoče, čas naraščajoče. Enake vrednosti pomenijo deljeno mesto. En začetek igre ustvari en javni rezultat; ponastavitev odpre novo prazno sejo, prejšnji rezultat pa ostane. Iztek seje in brisanje piškotka rezultata ne izbrišeta. Čas se ustavi pri 8/8; pri nedokončanem rezultatu teče dalje. Ponoven ogled namiga in prvi ogled po rešitvi njegove stopnje ne povečata števila uporabljenih namigov.

Pravilnost, zaporedje nalog in pogostost zahtev preverja strežnik. Spremembe stanja zahtevajo CSRF in preverjanje izvora; javni rezultati ne vsebujejo sejnih žetonov. Med začetkoma iger v istem brskalniku oziroma verigi ponastavitev mora preteči 60 sekund. Dve ločeni omejitvi v PostgreSQL dovolita največ 60 ustvarjenih anonimnih sej in največ 60 začetkov iger na minuto z istega IP-ja. Ločena števca preprečita, da bi običajni začetek igre v učilnici zasedel dve mesti iste omejitve.

Ob doseženi omejitvi API vrne HTTP `429`, glavo `Retry-After` in `retryAfterSeconds`. Ponastavitev 60-sekundnega premora med začetkoma ne odstrani; običajne oddaje odgovorov in ogled lestvice teh dveh števcev ne porabljajo. Pravilni `TRUST_PROXY` in prepisovanje posredniških glav sta pomembna tudi za določitev IP-ja.

## Datoteke in viri

- [Workflow](../.github/workflows/pipeline.yml) preverja kodo in pripravlja izdajo; [objavna skripta](../deploy/deploy-release.sh) jo aktivira na strežniku.
- [Pisava IBM Plex Mono](../public/fonts/OFL.txt) ohranja licenco SIL Open Font License; licence drugih odvisnosti ostanejo njihove.
- Fotografije so ustvarjene za učno zgodbo in shranjene lokalno; izvorni pozivi so v [profile-assets.json](profile-assets.json) in [metadata-assets.json](metadata-assets.json).
- Svetlobni učinek je navdihnil način »The Real Dark« na [pankajtanwar.in](https://www.pankajtanwar.in/); pregled prometa sledi [Wiresharkovemu vmesniku](https://www.wireshark.org/docs/wsug_html_chunked/ChapterUsing.html).
