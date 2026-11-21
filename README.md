# Operacija 404: Odkrij ogroženi projekt

Iz šolskega arhiva je bil prenesen zaupni načrt. Skrbnik ima nenavadno sporočilo, fotografijo in dnevnike, ne ve pa, kateremu projektu načrt pripada. Sledi poveži v osmih izzivih in odkrij njegovo kodno ime.

## Namen

Slovenska izobraževalna soba pobega za srednješolce, predvidoma **45–60 minut v paru**. Obravnava Cezarjevo šifro, kodiranja, phishing, gesla, metapodatke, omrežne dnevnike, domene in binarni zapis. Šola Piramida, osebe in dokazi so izmišljeni; igra ne izvaja pravih vdorov ali prijav v tuje račune.

Registracija ni potrebna. Obvezno je ime skupine, ki je javno na lestvici, zato izberi izmišljeno oznako. Napredek se shranjuje v PostgreSQL in nadaljuje v istem brskalniku. Lestvica primerja rešene izzive, nato manj namigov in krajši čas; prejšnji rezultati ostanejo tudi po ponastavitvi.

## Kje lahko igram?

- **Igra:** [escaperoom.feri.um.si](https://escaperoom.feri.um.si)
- **Lestvica:** [escaperoom.feri.um.si/lestvica](https://escaperoom.feri.um.si/lestvica).
- **Lokalno po zagonu:** [http://localhost:5173](http://localhost:5173).

## Lokalni zagon

Potrebuješ **Node.js 24 LTS (najmanj 24.13.0)**, npm in **PostgreSQL 14+** z orodji `initdb`, `pg_ctl`, `psql` in `createdb`. Docker ni potreben. Če uporabljaš nvm, po kloniranju v mapi projekta izberi različico z `nvm use`.

```sh
git clone https://github.com/gajciii/kibernetska-soba-pobega.git
cd kibernetska-soba-pobega
npm ci
cp .env.example .env
npm run db:local
npm run dev
```

`db:local` ustvari razvojno in testno bazo na `127.0.0.1:55432`; podatki ostanejo v `.local/postgres/`. Če ne najde PostgreSQL, nastavi `PG_BIN` na mapo z njegovimi orodji. Bazo ustaviš z `npm run db:local:stop`. `.env.example` vsebuje pripravljene lokalne nastavitve; datoteke `.env` ne objavljaj.

## Postavitev na strežnik

Projekt uporablja React, TypeScript, Vite in Express. Za produkcijo pripravi trajni PostgreSQL, `.env` s pravim `APP_ORIGIN`, HTTPS in varen piškotek, nato:

```sh
npm run build
npm start
```

Express streže aplikacijo in API v enem procesu. [Navodila za postavitev](docs/DEPLOYMENT.md) vsebujejo konfiguracijo, systemd/Nginx, GitHub Actions, preverjanje, kopije in obnovitev. Samodejna objava zahteva pripravljen strežnik in nastavitev `ENABLE_DEPLOY=true`. Strežnik preverja odgovore; med začetkoma iger v istem brskalniku zahteva 60 sekund in dodatno omejuje prepogoste zahteve.

## Gradivo

[Vodič za izvajalca](VODNIK_IZVAJALKE.md) vsebuje potek delavnice, namige, razlage in rešitve. Namenjen je pripravi izvajalca.

**Avtorica: Gaja Gujt.**

## Rešitve

<details>
<summary><strong>POZOR: rešitve vseh izzivov — odpri le po igranju ali za pripravo delavnice.</strong></summary>

| Izziv | Rešitev |
| --- | --- |
| 1. Cezarjeva šifra | `PIRAMIDA` — premik za tri mesta nazaj. |
| 2. Kodirano obvestilo | `SOVA` — najprej HEX, nato Base64. |
| 3. Phishing | Sporočilo **B**, četrto na seznamu, in vsaj dva pravilna razloga: tuja domena pošiljatelja, tuja domena povezave, grožnja/nujnost, zahteva po geslu in enkratni kodi. Brez napačnih razlogov. |
| 4. Predvidljivo geslo | `luna2009` ali `2009luna`, nato vsa štiri priporočila: dolgo naključno geslo/fraza, drugačno geslo za vsak račun, upravljalnik gesel in večfaktorska prijava. |
| 5. Fotografija | `10:42` — čas nastanka posnetka `hodnik.jpg`. |
| 6. Prenos datoteke | `ucenec17` — uspešen prenos `/zaupno/nacrt.pdf`. |
| 7. Tuja domena | Eden od pravilnih parov: **C / 3. povezava** → `arhiv-nacrtov.example`; **D / 4.** → `piramida-si.example`; **E / 5.** → `prijava.example`. |
| 8. Binarni zapis | `BRUCOVANJE` — deset vrednosti ASCII: 66, 82, 85, 67, 79, 86, 65, 78, 74, 69. |

</details>
