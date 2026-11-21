# Vodič za izvajalko: Operacija 404

To je gradivo za izvajalko. Vsebuje rešitve in ni del javne aplikacije. Ne premakni ga v `public/` ali `dist/client/`. V javnem repozitoriju je izvorna koda skupaj z rešitvami seveda dostopna; za igro uporabljaj naslov aplikacije.

Delavnica je izmišljena izobraževalna simulacija za srednješolce. Dvojica uporablja en računalnik in isti brskalnik, brez registracije in zunanjih spletnih orodij. Igralca sta preiskovalca dogodka na šoli Most. Varnostna ekipa je zavarovala digitalne sledi, osem ugank pa odklepa zaključni spis.

## Pred izvedbo

Odpri aplikacijo na računalnikih in preveri dostop do strežnika. Vsaka dvojica potrebuje svoj profil brskalnika oziroma svoj računalnik. Dva zavihka istega profila delita isto sejo. Če se pari pri računalniku zamenjajo, naj novi par potrdi ponastavitev prejšnje igre.

Preizkusi en celoten prehod. Nastavitev `APP_ORIGIN`, varen piškotek in HTTPS morajo ustrezati dejanskemu naslovu. Aplikacija potrebuje povezavo s svojim strežnikom, vsi dokazi in pripomočki pa ostanejo na istem spletnem mestu. Ne zahteva resničnega gesla, fotografije ali osebnih podatkov dijakov. Ime ekipe je neobvezno; priporočene so izmišljene oznake. Predstavitev dokazov je razširjena z izbiranjem sporočil, datotek in paketov. Odgovori so ostali enaki, zato obstoječe shranjene seje ostajajo veljavne.

Vsaka naloga ima eno kratko navodilo in delovni pripomoček. Polje oziroma izbira odgovora je zgoraj desno, namigi in razlaga pa so dostopni v stranskem panelu. Na ozkem zaslonu se elementi zložijo navpično. Dodatni dokazni zapiski niso več prikazani v glavnem delu; spodnje opombe so pomoč izvajalki pri pogovoru.

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

**Dokaz:** `NRGD MH PRVW`, iz datoteke `sporocilo.txt`, ki jo je izmišljena varnostna ekipa zavarovala med sledmi nenavadnega prenosa. Nad pripomočkom je zgodbeni odstavek. Par naj ga prebere: opis prejemnika vsebuje namig **»tri mesta nazaj«**, ki neposredno usmeri dešifriranje v levo. Kratko navodilo premika ne ponovi.

**Potek reševanja:** uporabljata abecedo A–Z brez šumnikov. V ročnem pripomočku premikata abecedo v obe smeri, nastavita ustrezno preslikavo in po črkah razbereta sporočilo. Samodejnega dešifriranja ni. Razkrito sporočilo je `KODA JE MOST`; v edino polje za odgovor zgoraj desno vneseta samo kodo **`MOST`**. Strežniško preverjanje zaradi združljivosti še naprej sprejme tudi celoten stavek, ne glede na velikost črk in odvečne presledke.

**Opomba za izvajalko:** ime datoteke ni koda; presledki in vrstni red omogočajo preverjanje smiselnosti treh besed. Če dobita drug rezultat, naj primerjata smer šifriranja s smerjo dešifriranja. Številke in ločila se ne spreminjajo.

- Namig 1: »V zgodbi poišči, kako je prejemnik razbral Cezarjevo sporočilo. Enak premik uporabi za vajin dokaz.«
- Namig 2: »Pri dešifriranju se premakni za tri mesta nazaj: N postane K. Isto preslikavo uporabi za vse črke.«

**Učni cilj:** iz zgodbe izluščiti podatek, ročno povezati šifrirane in izvirne črke ter razumeti stalni premik in obratno smer. Takšna šifra je primerna za osnove, ne za sodobno varovanje podatkov.

**Zgodovinski vir:** Svetonij v *Življenju Julija Cezarja*, 56.6, opisuje prikrivanje zaupnih sporočil s premaknjenimi črkami in povezavo A–D. Prikazana abeceda A–Z in šolska datoteka sta sodoben učni primer. [Svetonij, Julij Cezar 56.6 — izvirni vir v angleškem prevodu](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius%2A.html#56.6). Vir je namenjen izvajalki; za reševanje ni treba odpreti zunanje strani.

## 2. Kaj se skriva za čudnimi znaki?

**Dokaz:** pod zgodbenim odstavkom je naslednji zapis. Par ga mora sam prekopirati v prazni vhod pretvornika; v delovnem oknu ni dodatne kopije dokaza.

```text
55 46 4A 46 54 6B 39 54 49 46 70 42 51 6B 56 4D 52 56 70 46 54 69 34 67 53 30 39 45 51 53 42 4F 51 56 4E 4D 52 55 52 4F 53 6B 55 67 54 55 46 51 52 54 6F 67 55 30 39 57 51 53 34 3D
```

Zgodba zapis poveže z zavarovanim izvozom šolskih sistemskih obvestil in pove, da ima **dve plasti**. Zunanja uporablja **šestnajst znakov, 0–9 in A–F, v parih**; notranja nabor **štiriinšestdesetih znakov** in morebitno končno dopolnilo `=`. Znak `=` ni eden od 64 znakov osnovnega nabora. Postopka je treba uporabiti v tem vrstnem redu, brez samodejnega prenosa rezultatov:

1. Izbereta **Šestnajstiško (HEX)** in dekodiranje. Prvi rezultat je še vedno kodiran zapis:

   ```text
   UFJFTk9TIFpBQkVMRVpFTi4gS09EQSBOQVNMRUROSkUgTUFQRTogU09WQS4=
   ```

2. Celoten vmesni rezultat **ročno prekopirata v vhod**, izbereta **Base64** in ponovno dekodirata. Končno besedilo je **`PRENOS ZABELEZEN. KODA NASLEDNJE MAPE: SOVA.`**
3. V polje za odgovor zgoraj desno vneseta samo **`SOVA`**. Celotno obvestilo ni odgovor; zaradi združljivosti ostaja sprejet tudi stari vnos `KODA: SOVA`. Velikost črk in odvečni presledki niso pomembni.

- Namig 1: »Upoštevaj vrstni red: najprej zunanji zapis s šestnajstimi znaki v parih, nato notranji z naborom štiriinšestdesetih znakov.«
- Namig 2: »Najprej dekodiraj Šestnajstiško (HEX). Celoten rezultat ročno prekopiraj v vhod, izberi Base64 in ponovno dekodiraj. Odgovor je samo koda naslednje mape.«

**Opomba za izvajalko:** končnica `.dat` ne določa kodiranja. Če pretvorba ne uspe, naj preverita vrstni red, celovitost prekopiranih parov in vmesnega rezultata ter smer dekodiranja. Vmesni niz vsebuje 60 znakov in se konča z enim `=`; končno sporočilo vsebuje 44 bajtov ASCII. Neuspešen poskus v pripomočku ne poveča števila oddanih odgovorov. Besedilo obvestila je sled v zgodbi, ne dokaz celotnega poteka incidenta.

**Učni cilj:** prepoznati dve zaporedni kodiranji in uporabiti rezultat prvega kot vhod drugega. Par šestnajstiških znakov predstavlja en bajt zapisa Base64, ta pa predstavlja končno besedilo. HEX in Base64 sta kodiranji, ne šifriranje; za obratno pretvorbo ne potrebujemo skrivnega ključa in njuna kombinacija ne zagotavlja zaupnosti.

## 3. Poišči phishing sporočilo

Šolska domena v učnem primeru je `sola.example`. Predal vsebuje **sedem sporočil A–G**: knjižnični opomnik, lažno IT-zahtevo, mentorsko obvestilo, načrtovano IT-vzdrževanje, pomembno spremembo učilnice, pričakovano priponko fotografskega krožka in jedilnik. Izbira sporočila odpre podrobnosti s prejemnikom, časom, dejanskim pošiljateljem in morebitnimi dodatnimi naslovi ali priponko. Povezave in priponke so elementi simulacije.

Pravilen izbor je **sporočilo B** in **najmanj dva** od teh opozorilnih znakov, brez napačnih:

- Domena pošiljatelja se ne ujema s šolsko domeno: `podpora@sola-preverjanje.example`.
- Povezava vodi na drugo domeno: `https://sola.example.preveri-racun.example/prijava`.
- Sporočilo pritiska z nujnostjo in grožnjo blokade čez 10 minut.
- Zahteva geslo in enkratno prijavno kodo na nepričakovani strani.

»Sporočilo vsebuje pozdrav« in »Sporočilo uporablja HTTPS« sta **napačna razloga**. Izbor B z enim razlogom ne zadostuje; prav tako ne zadostujeta dva pravilna razloga, če je označen še napačen.

- Namig 1: »Odpri podrobnosti sporočil. Primerjaj dejanski naslov pošiljatelja in povezave z domeno sola.example.«
- Namig 2: »Primerjaj zahteve sporočil: eno združuje tuji domeni, grožnjo takojšnje blokade in zahtevo po geslu ter enkratni kodi.«

**Učni cilj:** pregledati dejanskega pošiljatelja, cilj povezave, zahteve in okoliščine. Prikazno ime ni dokaz pristnosti. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti spletnega mesta. V tem pripravljenem primeru je samo B phishing. Pomembno obvestilo E in pričakovana priponka F sama po sebi nista opozorilo; tudi ujemajoča se domena pa v resničnem svetu ne jamči varnosti.

## 4. Ugotovi predvidljivo geslo

Učni profil Nika (`@nika_ucni_profil`) vsebuje **pet javnih objav** o fotografiji, hobijih, projektu, letniku in psički. Par lahko pomembne objave pripne oziroma označi za primerjavo. Dve relevantni objavi ostajata »Letnik 2009.« in »Moja psička Luna je danes spet ukradla vso pozornost.« Pravilen izbor je **A: `Luna2009!`**. Označevanje objav je pripomoček, ne dodaten pogoj za napredovanje.

- Namig 1: »Poglej, katere osebne podatke lahko prebere vsak obiskovalec profila.«
- Namig 2: »Primerjaj ime psičke in letnico rojstva s ponujenimi gesli.«

**Učni cilj:** prepoznati predvidljivost gesla, sestavljenega iz javnih podatkov. Klicaj ne odpravi predvidljivosti. `Miza783?` ni predstavljen kot dober zgled gesla. Priporoči dolga, enkratna gesla, upravljalnik gesel in večfaktorsko prijavo. Dijaki primerjajo izmišljene možnosti; ne ugibajo resničnega gesla in ne izvajajo prijavnih poskusov.

## 5. Fotografija skriva namig

Pregledovalnik vsebuje **tri datoteke**. Na začetku ni izbrana nobena: par naj izbere `hodnik.jpg`, nato uporabi »Poglej metapodatke«. Izpis je urejen v poimenovana polja. Za zahtevano fotografijo so vrednosti:

```text
FileName: hodnik.jpg
DateTimeOriginal: 2026:11:20 10:42:17
OffsetTimeOriginal: +01:00
ModifyDate: 2026:11:20 11:15:00
```

Pravilen odgovor je **`10:42`**. Dovoljeni sta tudi obliki `10.42` in `10:42:17`. `11:15` je čas spremembe datoteke in ne čas nastanka posnetka.

Drugi datoteki sta `ucilnica.jpg` (nastanek ob 08:16:09, sprememba ob 08:25:44) in `obvestilo.png` (nastanek posnetka zaslona ob 09:51:06, sprememba ob 10:03:28, brez polja `DateTimeOriginal`). Njuni časi niso odgovor na vprašanje o hodniku. Vsi trije izpisi in lokalne ilustracije so jasno označeni učni primeri; aplikacija ne bere resničnega EXIF-a.

- Namig 1: »Preveri, da je izbrana datoteka hodnik.jpg. V njenem izpisu loči čas nastanka posnetka od časa spremembe datoteke.«
- Namig 2: »V metapodatkih hodnik.jpg poišči DateTimeOriginal in prepiši samo uro ter minute.«

**Učni cilj:** brati pravo polje in upoštevati pomen metapodatkov. Časovni odmik je izpisan; ni treba preračunavati v UTC. Metapodatki lahko manjkajo ali so spremenjeni, zato sami niso nezmotljiv dokaz.

## 6. Kdo je dostopal do skrivne datoteke?

Forenzični pregledovalnik vsebuje **32 simuliranih paketov** in **16 ločenih zapisov aplikacijskega dnevnika**. Vsi dogodki so z dne 20. 11. 2026; časi so lokalni. Paketni izbor vključuje ARP, DNS, TCP, TLS in HTTP ter ni celoten zajem povezav. Par filtrira prikaz, izbere paket ter odpre njegove podrobnosti in morebitno povezavo z aplikacijskim zapisom.

Pravilen račun je **`ucenec17`**: ob **10:45:12** je z IP `10.0.0.17` izvedel `DOWNLOAD` datoteke `/zaupno/nacrt.pdf` z rezultatom `SUCCESS`. S tem zapisom je v učnem primeru povezan **paket 28**. Omrežna vrstica kaže šifriran odziv s strežnika `10.0.0.5` proti `10.0.0.17`; račun, dejanje, pot in rezultat izvirajo iz ločenega dnevnika.

Primerjaj tri pogoje hkrati: prenos, prava datoteka in uspeh. `ucenec12` je imel prenos zavrnjen (`DENIED`, **paket 17**, 10:41:23), `ucenec08` je opravil ogled (`VIEW`, **paket 21**, 10:42:31), `ucenec05` pa uspešno prenesel drugo datoteko (`/javno/urnik.pdf`, paket 26, 10:44:08). Dodani dogodki vključujejo javne dokumente, prijave in odjave. Nobeden ne spremeni edinega pravilnega odgovora.

- Namig 1: »Odpri povezani aplikacijski zapis pri paketu TLS. Šifriran paket sam ne pove računa. Iščeš uspešen prenos točno določene datoteke, ne njen ogled.«
- Namig 2: »V ločenem aplikacijskem dnevniku poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.«

**Učni cilj:** povezovati več virov in pogojev ter razlikovati omrežni prenos od aplikacijskega dogodka. Šifriran promet TLS sam ne razkrije računa ali poti datoteke. Povezavo med paketom in dnevnikom je vnaprej pripravila učna preiskovalna ekipa; v resnični preiskavi samo ujemanje časa ne bi nujno zadostovalo. ACK potrjuje prejem na ravni TCP, ne dovoljenja aplikacije; HTTP 200 v tem izboru se nanaša na javni `/status`, ne na zaupni dokument. ARP uporablja strojne naslove, vključno z oddajnim `ff:ff:ff:ff:ff:ff`. Aplikacija ne zajema dejanskega prometa in ne pošilja učnih zahtev v omrežje. Dnevnik potrjuje uporabo računa, ne identitete osebe za tipkovnico.

## 7. Najdi ponarejeno spletno stran

Potrjena domena šole v tem primeru je `sola.example`. Pregledovalnik vsebuje tri simulirane zavihke. Par preklaplja med njimi, razčleni protokol, gostitelja in pot ter posebej označi izbrani naslov. Povezave ostanejo neaktivne. Pravilen izbor je **C**:

```text
https://sola.example.prijava-varno.example/prijava
```

Po rešitvi razčleni konkretni naslov: protokol `https`, gostitelj `sola.example.prijava-varno.example`, pot `/prijava`. Naslov pripada domeni **`prijava-varno.example`**; `sola.example` je tukaj le zavajajoči del pred njo. A uporablja šolsko domeno, B (`ucilnica.sola.example`) pa njeno poddomeno.

- Namig 1: »Ime šole se lahko pojavi tudi v poddomeni druge domene.«
- Namig 2: »Pri enem naslovu se za sola.example pojavi še .prijava-varno.example.«

**Učni cilj:** brati celoten gostitelj in razlikovati domeno od poddomene ter poti. HTTPS ne naredi strani samodejno zaupanja vredne. Ne učimo pravila, da je registrirana domena vedno sestavljena iz zadnjih dveh delov: domena in javne pripone se v resničnih primerih razlikujejo. Obravnavaj konkretne prikazane učne naslove.

## 8. Računalnik govori v ničlah in enicah

**Dokaz:** `01001011 01001100 01001010 01010101 01000011`. Pretvornik in referenčna tabela ASCII pokažeta **`KLJUC`**. Sprejet je tudi `KLJUČ`, ne glede na velikost črk in robne presledke. Izvoz vsebuje pet bajtov, uporablja ASCII in ohranja vrstni red. Presledki med skupinami so ločila in ne del končnega sporočila.

- Namig 1: »Vsaka skupina osmih bitov predstavlja en znak ASCII. Pretvori vseh pet skupin v istem vrstnem redu.«
- Namig 2: »Prva skupina 01001011 predstavlja črko K. Preostale skupine pretvori v istem vrstnem redu.«

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
