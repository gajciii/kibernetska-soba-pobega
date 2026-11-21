# Vodič za izvajalko: Operacija 404

To je gradivo za izvajalko. Vsebuje rešitve in ni del javne aplikacije. Ne premakni ga v `public/` ali `dist/client/`. V javnem repozitoriju je izvorna koda skupaj z rešitvami seveda dostopna; za igro uporabljaj naslov aplikacije.

Delavnica je izmišljena izobraževalna simulacija za srednješolce. Dvojica uporablja en računalnik in isti brskalnik, brez registracije in zunanjih spletnih orodij. Igralca sta preiskovalca dogodka na šoli Most. Varnostna ekipa je zavarovala digitalne sledi, osem ugank pa odklepa zaključni spis.

## Pred izvedbo

Odpri aplikacijo na računalnikih in preveri dostop do strežnika. Vsaka dvojica potrebuje svoj profil brskalnika oziroma svoj računalnik. Dva zavihka istega profila delita isto sejo. Če se pari pri računalniku zamenjajo, naj novi par potrdi ponastavitev prejšnje igre.

Preizkusi en celoten prehod. Nastavitev `APP_ORIGIN`, varen piškotek in HTTPS morajo ustrezati dejanskemu naslovu. Aplikacija potrebuje povezavo s svojim strežnikom, vsi dokazi in pripomočki pa ostanejo na istem spletnem mestu. Ne zahteva resničnega gesla, fotografije ali osebnih podatkov dijakov. Ime ekipe je neobvezno; priporočene so izmišljene oznake.

## Predlog poteka: 45–60 minut

| Čas | Dejavnost |
| --- | --- |
| 0–5 min | Predstavi simulacijo, delo v paru in razliko med dokazom ter sklepanjem. |
| 5–15 min | Nalogi 1–2: razlika med preprosto šifro in kodiranjem. |
| 15–25 min | Nalogi 3–4: phishing in predvidljivost gesel. |
| 25–37 min | Nalogi 5–6: branje metapodatkov in povezovanje pogojev v dnevniku. |
| 37–47 min | Nalogi 7–8: domene in binarni zapis. |
| 47–60 min | Zaključno poročilo, pogovor in prenos spoznanj v vsakodnevno rabo. |

Časi so okvirni. Ura v igri ni omejitev, poskusi niso omejeni, namigi niso kazen. Eden lahko upravlja pripomočke, drugi bere dokaze; po četrti nalogi naj vlogi zamenjata. Če par obstane, naj najprej s svojimi besedami povzame vprašanje, nato uporabi prvi in po potrebi drugi namig. Po pravilnem odgovoru naj prebere razlago.

## 1. Razbij skrivno sporočilo

**Dokaz:** `NRGD MH PRVW`. Cezarjeva šifra uporablja A–Z brez šumnikov in premik 3. V pripomočku naj nastavita premik 3 in dešifrirata nazaj. Rezultat je `KODA JE MOST`; koda je **`MOST`**. Sprejet je tudi celoten stavek, ne glede na velikost črk in odvečne presledke.

- Namig 1: »Vsako črko premakni za enako število mest.«
- Namig 2: »Pri dešifriranju se premakni za 3 mesta nazaj: N postane K.«

**Učni cilj:** razumeti enostavno substitucijo in vlogo ključa/premika. Presledki in ločila se ohranijo. Takšna šifra je primerna za osnove, ne za sodobno varovanje podatkov. Če dobita drug rezultat, preverita smer in premik; začetna nastavitev pripomočka je 0.

## 2. Kaj se skriva za čudnimi znaki?

**Dokaz:** `S09EQTogU09WQQ==`. Pripomoček Base64 vrne `KODA: SOVA`; koda je **`SOVA`**. Sprejet je tudi celoten zapis, ne glede na velikost črk in odvečne presledke.

- Namig 1: »Poišči pripomoček za dekodiranje Base64.«
- Namig 2: »Po dekodiranju je iskana beseda za dvopičjem.«

**Učni cilj:** razlikovati kodiranje od šifriranja. Za dekodiranje Base64 ne potrebujemo skrivnega ključa in Base64 ne zagotavlja zaupnosti. Naključnemu videzu zapisa ne pripisujemo varnosti.

## 3. Poišči phishing sporočilo

Šolska domena v učnem primeru je `sola.example`. Pravilen izbor je **sporočilo B** in **najmanj dva** od teh opozorilnih znakov, brez napačnih:

- Domena pošiljatelja se ne ujema s šolsko domeno: `podpora@sola-preverjanje.example`.
- Povezava vodi na drugo domeno: `https://sola.example.preveri-racun.example/prijava`.
- Sporočilo pritiska z nujnostjo in grožnjo blokade čez 10 minut.
- Zahteva geslo in enkratno prijavno kodo na nepričakovani strani.

»Sporočilo vsebuje pozdrav« in »Sporočilo uporablja HTTPS« sta **napačna razloga**. Izbor B z enim razlogom ne zadostuje; prav tako ne zadostujeta dva pravilna razloga, če je označen še napačen.

- Namig 1: »Primerjaj dejanski naslov pošiljatelja in povezave z domeno sola.example.«
- Namig 2: »Preveri tudi, ali sporočilo zahteva hiter odziv in občutljive prijavne podatke.«

**Učni cilj:** pregledati dejanskega pošiljatelja, cilj povezave, zahteve in okoliščine. Prikazno ime ni dokaz pristnosti. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti spletnega mesta. A in C sta v tem omejenem primeru običajni sporočili; to ni splošno jamstvo, da je vsako sporočilo s šolsko domeno varno.

## 4. Ugotovi predvidljivo geslo

Učni profil Nika (`@nika_ucni_profil`) vsebuje »Letnik 2009.« in »Moja psička Luna je danes spet ukradla vso pozornost.« Pravilen izbor je **A: `Luna2009!`**.

- Namig 1: »Poglej, katere osebne podatke lahko prebere vsak obiskovalec profila.«
- Namig 2: »Primerjaj ime psičke in letnico rojstva s ponujenimi gesli.«

**Učni cilj:** prepoznati predvidljivost gesla, sestavljenega iz javnih podatkov. Klicaj ne odpravi predvidljivosti. `Miza783?` ni predstavljen kot dober zgled gesla. Priporoči dolga, enkratna gesla, upravljalnik gesel in večfaktorsko prijavo. Dijaki primerjajo izmišljene možnosti; ne ugibajo resničnega gesla in ne izvajajo prijavnih poskusov.

## 5. Fotografija skriva namig

Lokalna ilustracija in metapodatki so jasno označena simulacija. Ob »Poglej metapodatke« se pokaže:

```text
FileName: hodnik.jpg
DateTimeOriginal: 2026:11:20 10:42:17
OffsetTimeOriginal: +01:00
ModifyDate: 2026:11:20 11:15:00
```

Pravilen odgovor je **`10:42`**. Dovoljeni sta tudi obliki `10.42` in `10:42:17`. `11:15` je čas spremembe datoteke in ne čas nastanka posnetka.

- Namig 1: »V izpisu sta čas nastanka posnetka in čas spremembe datoteke.«
- Namig 2: »Poišči podatek DateTimeOriginal.«

**Učni cilj:** brati pravo polje in upoštevati pomen metapodatkov. Časovni odmik je izpisan; ni treba preračunavati v UTC. Metapodatki lahko manjkajo ali so spremenjeni, zato sami niso nezmotljiv dokaz.

## 6. Kdo je dostopal do skrivne datoteke?

V »Simuliranem strežniškem dnevniku« so lokalni časi z dne 20. 11. 2026. Pravilen račun je **`ucenec17`**: ob **10:45:12** je z IP `10.0.0.17` izvedel `DOWNLOAD` datoteke `/zaupno/nacrt.pdf` z rezultatom `SUCCESS`.

Primerjaj tri pogoje hkrati: prenos, prava datoteka in uspeh. `ucenec12` je imel prenos zavrnjen (`DENIED`), `ucenec08` je opravil ogled (`VIEW`), `ucenec05` pa uspešno prenesel drugo datoteko (`/javno/urnik.pdf`). Tabela omogoča filtriranje in izbiro vrstice za podrobnosti.

- Namig 1: »Iščeš uspešen prenos točno določene datoteke, ne njen ogled.«
- Namig 2: »Poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.«

**Učni cilj:** povezovati več pogojev in razlikovati dogodek od njegovega rezultata. To je simuliran strežniški dnevnik z uporabniškimi računi, dejanji in potmi, ne običajen Wiresharkov zajem šifriranega prometa HTTPS. Dnevnik potrjuje uporabo računa, ne identitete osebe za tipkovnico.

## 7. Najdi ponarejeno spletno stran

Potrjena domena šole v tem primeru je `sola.example`. Pravilen izbor je **C**:

```text
https://sola.example.prijava-varno.example/prijava
```

Po rešitvi razčleni konkretni naslov: protokol `https`, gostitelj `sola.example.prijava-varno.example`, pot `/prijava`. Naslov pripada domeni **`prijava-varno.example`**; `sola.example` je tukaj le zavajajoči del pred njo. A uporablja šolsko domeno, B (`ucilnica.sola.example`) pa njeno poddomeno.

- Namig 1: »Ime šole se lahko pojavi tudi v poddomeni druge domene.«
- Namig 2: »Pri enem naslovu se za sola.example pojavi še .prijava-varno.example.«

**Učni cilj:** brati celoten gostitelj in razlikovati domeno od poddomene ter poti. HTTPS ne naredi strani samodejno zaupanja vredne. Ne učimo pravila, da je registrirana domena vedno sestavljena iz zadnjih dveh delov: domena in javne pripone se v resničnih primerih razlikujejo. Obravnavaj konkretne prikazane učne naslove.

## 8. Računalnik govori v ničlah in enicah

**Dokaz:** `01001011 01001100 01001010 01010101 01000011`. Pretvornik in referenčna tabela ASCII pokažeta **`KLJUC`**. Sprejet je tudi `KLJUČ`, ne glede na velikost črk in robne presledke.

- Namig 1: »Vsaka skupina osmih bitov predstavlja en znak.«
- Namig 2: »Prva skupina 01001011 predstavlja črko K.«

**Učni cilj:** razumeti binarno predstavitev znakov in osembitne skupine. Pretvornik sprejme presledke ali nove vrstice, nepravilne skupine pa pojasni z napako. Ta primer ni šifriranje. Pravilen odgovor odpre finale; devete uganke ni.

## Zaključek in pogovor

»Preiskava zaključena« pokaže osem rešenih stopenj, informativni čas in število uporabljenih namigov. Ponoven ogled istega namiga ne poveča števila. Namigi naj podpirajo delo, ne razvrščanja ekip.

Dokazi v poročilu omogočajo naslednje ugotovitve: prepoznano je sumljivo sporočilo in lažna domena; iz simuliranih metapodatkov je razbran čas nastanka fotografije; dnevnik vsebuje uspešen prenos `/zaupno/nacrt.pdf` z računom `ucenec17`; preiskovalna mapa je odklenjena.

**Ne sklepamo**, da je lastnik tega računa dokazano storilec, da je bilo učniško geslo `Luna2009!` dejansko uporabljeno pri vdoru ali da prikazani dokazi potrjujejo ves potek napada. Fotografija sama ne pove, kdo je uporabljal račun, časovna bližina dogodkov pa ni dokaz vzroka.

Pogovor odpri z vprašanjema:

- »Kateri podatek je bil najbolj prepričljiv dokaz in kakšne so njegove omejitve?«
- »Kaj bi lahko šola in uporabniki naredili za boljšo zaščito?«

Možne usmeritve: preverjanje nenavadnih zahtev po neodvisnem kanalu, upravljalnik in enkratna gesla, večfaktorska prijava, omejene pravice dostopa, dnevniki in njihovo varovanje, redne posodobitve ter jasen način prijave suma. Loči uporabne predloge od trditev o tem, kaj se je v tej zgodbi zagotovo zgodilo.

## Če se kaj zatakne

Napačen odgovor ostane v polju in omogoča nov poskus. Pri omrežni napaki naj par počaka na povezavo in ponovi oddajo, brez ponastavitve. Ob vrnitvi v isti brskalnik izbere »Nadaljuj preiskavo«. Če je bil piškotek izbrisan ali se je uporabljalo zasebno okno, povezave z anonimno sejo ni mogoče obnoviti prek imena ekipe. Ne uporabljaj skupnega javnega računalnika za več hkratnih ekip v istem profilu brskalnika.

Napredka ne briši s premikanjem baze ali ponovno objavo; uporabniški gumb za ponastavitev po potrditvi izbriše le trenutno igro. V primeru težave s strežnikom skrbnik preveri `/api/health` in dnevnik procesa, ne da bi javno delil produkcijsko okolje ali podatkovno bazo.
