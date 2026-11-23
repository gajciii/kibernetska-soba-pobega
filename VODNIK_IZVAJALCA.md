# Vodič za izvajalca: Operacija 404

To je gradivo za izvajalca. Vsebuje rešitve in ni del javne aplikacije. Ne premakni ga v `public/` ali `dist/client/`. V javnem repozitoriju je izvorna koda skupaj z rešitvami seveda dostopna; za igro uporabljaj naslov aplikacije.

Delavnica je izmišljena izobraževalna simulacija. Dvojica uporablja en računalnik in isti brskalnik, brez registracije in zunanjih spletnih orodij. Vmesnik igralca nagovarja v ednini tudi pri delu v paru; ta vodič opisuje izvedbo delavnice z dvojicami. Igralca sta preiskovalca dogodka na šoli Piramida. Začetna sled je sumljiv prenos datoteke `/zaupno/nacrt.pdf`. Njeno splošno ime ne razkriva vsebine, zato par z dokazi ugotavlja, kateremu šolskemu projektu pripada. Osem ugank vodi do imena **BRUCOVANJE**.

Pod zgodbo vsakega izziva je privzeto zaprta kratka teorija v nekaj preprostih stavkih. Razlaga osnovne pojme in ne porabi namiga; pri domenah ostaja prikaz delov URL-ja. Omenjena orodja [CyberChef](https://gchq.github.io/CyberChef/), [ExifTool](https://exiftool.org/) in [Wireshark](https://www.wireshark.org/docs/wsug_html_chunked/ChapterIntroduction.html) so primeri iz prakse, za reševanje igre jih ni treba nameščati ali odpirati. Razlaga [socialnega inženiringa](https://www.cyber.gc.ca/en/guidance/dont-take-bait-recognize-and-avoid-phishing-attacks) vključuje tudi prevare prek SMS-ov in klicev.

## Rdeča nit zgodbe

Cezarjeva koda **PIRAMIDA** odpre prvo mapo, dvojno kodirano obvestilo pa razkrije **Luko Kralja** kot prijavitelja in kodo mape **PREDAL**. Njegova prijava sumljive pošte utemelji pregled predala. Pregled sumljive pošte vodi k preverjanju zaščite računa, javnemu profilu in hipotetično šibkemu geslu. Luka nato pove, da je uporabljal skupni šolski računalnik in ob odhodu fotografiral hodnik. Čas fotografije usmeri pregled okoliških omrežnih dogodkov. Uspešen prenos poveže račun **ucenec17** z računalnikom **10.0.0.17**, njegova zavarovana zgodovina pa vsebuje isto lažno povezavo kot pošta. Ko sta obe ponarejeni prijavni strani prepoznani, detektiv v pravem arhivu po računu, času in poti najde ustrezno različico načrta. Arhivski izpis njene oznake v ASCII razkrije **BRUCOVANJE**.

Časovne sledi z dne 20. 11. 2026 so:

| Čas | Podatek v dokazih |
| --- | --- |
| 09:57 | Čas phishing sporočila B v predalu. |
| 10:42:17 | Zapisani čas nastanka fotografije hodnika, ki ga Luka povezuje z odhodom iz učilnice. |
| 10:45:12 | Uspešen prenos `/zaupno/nacrt.pdf` z računom `ucenec17` in IP `10.0.0.17`. |
| 11:15:00 | Čas spremembe fotografije, ne čas njenega nastanka. |

To zaporedje usmerja preverjanje sledi. Ne dokazuje, da je Luka odprl lažno povezavo, uporabil predvidljivo geslo ali izvedel prenos; tudi prisotnost povezave v zgodovini sama ne potrjuje vnesenih prijavnih podatkov ali vzroka prenosa.

## Pred izvedbo

Odpri aplikacijo na računalnikih in preveri dostop do strežnika. Vsaka dvojica potrebuje svoj profil brskalnika oziroma svoj računalnik. Dva zavihka istega profila delita isto sejo. Če se pari pri računalniku zamenjajo, naj novi par potrdi ponastavitev prejšnje igre.

Med začetkoma dveh iger v istem brskalniku mora preteči 60 sekund od prejšnjega začetka. Ponastavitev tega premora ne odstrani. To ne omejuje oddaj odgovorov med igro. Pri množičnem zagonu sta na skupnem IP-ju ločeni omejitvi 60 novih sej in 60 začetkov iger na minuto; ob obvestilu o omejitvi počakaj navedeni čas.

Preizkusi en celoten prehod. Nastavitev `APP_ORIGIN`, varen piškotek in HTTPS morajo ustrezati dejanskemu naslovu. Aplikacija potrebuje povezavo s svojim strežnikom, vsi dokazi in pripomočki pa ostanejo na istem spletnem mestu. Ne zahteva resničnega gesla, fotografije ali osebnih podatkov dijakov. Ime skupine je obvezno in javno na lestvici; par naj izbere izmišljeno oznako z 1–60 znaki. Robni presledki se odstranijo, samo presledki ali nevidni znaki niso veljavno ime. Predstavitev dokazov vključuje izbiranje sporočil, datotek in paketov. Četrta naloga zahteva ročni vnos predvidljivega gesla in nato priporočila; prej že rešene stopnje ostanejo rešene.

Vsako nalogo uvede kratka zgodba, ki dokaze poveže s preiskavo. Pri nalogah 3–8 navodilo opredeli iskani podatek ali odločitev; konkretni postopki so v namigih. Pri drugi nalogi kratko navodilo usmeri v uporabo pretvornika in oddajo dobljene kode. Polje oziroma izbira odgovora je zgoraj desno, namigi in razlaga pa so dostopni v stranskem panelu. Na ozkem zaslonu se elementi zložijo navpično. Dodatni dokazni zapiski niso prikazani v glavnem delu; spodnje opombe so pomoč izvajalcu pri pogovoru.

## Predlog poteka: 45–60 minut

| Čas | Dejavnost |
| --- | --- |
| 0–5 min | Predstavi simulacijo, delo v paru in razliko med dokazom ter sklepanjem. |
| 5–15 min | Nalogi 1–2: razlika med preprosto šifro in kodiranjem. |
| 15–25 min | Nalogi 3–4: phishing in predvidljivost gesel. |
| 25–37 min | Nalogi 5–6: branje metapodatkov in povezovanje pogojev v dnevniku. |
| 37–47 min | Nalogi 7–8: domene in binarni zapis. |
| 47–60 min | Zaključek igre, pogovor in prenos spoznanj v vsakodnevno rabo. |

Časi so okvirni. Ura igre ne prekine, število poskusov ni omejeno. Prvi namig se odklene 2 minuti po prvem odprtju izziva, drugi pa po 7 minutah od istega trenutka in po razkritju prvega. Odštevanje teče tudi po osvežitvi strani. Namigi pomagajo pri učenju in vplivajo na razvrstitev na lestvici po spodaj opisanih pravilih. Eden lahko upravlja pripomočke, drugi bere dokaze; po četrti nalogi naj vlogi zamenjata. Če par obstane, naj najprej s svojimi besedami povzame vprašanje, nato uporabi prvi in po potrebi drugi namig. Po pravilnem odgovoru naj prebere razlago.

## 1. Razbij skrivno sporočilo

**Dokaz:** `NRGD MH SLUDPLGD`, iz datoteke `sporocilo.txt`. Detektiv je s Cezarjevo šifro skril kodo prvega dela preiskovalne mape, v kateri je zbral sledi prenosa. Nad pripomočkom je zgodbeni odstavek. Par naj ga prebere: uvod pojasni namen kode ter zgodovinski premik za **tri mesta** s primerom A → D. Iz omembe vračanja črk na prvotna mesta mora sklepati na obratno smer pri dešifriranju. Navodilo zahteva samo razbiranje sporočila in vnos kode; ne pove smeri premika ali zaporedja klikov.

**Potek reševanja:** uporabljata abecedo A–Z brez šumnikov. V ročnem pripomočku premikata abecedo v obe smeri, nastavita ustrezno preslikavo in po črkah razbereta sporočilo. Samodejnega dešifriranja ni. Razkrito sporočilo je `KODA JE PIRAMIDA`; v edino polje za odgovor zgoraj desno vneseta samo kodo **`PIRAMIDA`**. Strežniško preverjanje zaradi združljivosti še naprej sprejme tudi celoten stavek, ne glede na velikost črk in odvečne presledke.

**Opomba za izvajalca:** ime datoteke ni koda; presledki in vrstni red omogočajo preverjanje smiselnosti treh besed. Če dobita drug rezultat, naj primerjata smer šifriranja s smerjo dešifriranja. Številke in ločila se ne spreminjajo.

- Namig 1: »Cezar je črke premaknil, prejemnik pa jih mora vrniti. Primerjaj A in D ter razmisli, v katero smer boš bral sporočilo.«
- Namig 2: »Pri dešifriranju se premakni za tri mesta nazaj: N postane K. Isto preslikavo uporabi za vse črke.«

**Učni cilj:** iz zgodbe izluščiti podatek, ročno povezati šifrirane in izvirne črke ter razumeti stalni premik in obratno smer. Takšna šifra je primerna za osnove, ne za sodobno varovanje podatkov.

**Zgodovinski vir:** Svetonij v *Življenju Julija Cezarja*, 56.6, opisuje prikrivanje zaupnih sporočil s premaknjenimi črkami in povezavo A–D. Prikazana abeceda A–Z in šolska datoteka sta sodoben učni primer. [Svetonij, Julij Cezar 56.6: izvirni vir v angleškem prevodu](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius%2A.html#56.6). Vir je namenjen izvajalcu; za reševanje ni treba odpreti zunanje strani.

## 2. Kaj se skriva za čudnimi znaki?

**Dokaz:** pod zgodbenim odstavkom je naslednji zapis. Par ga lahko kopira z gumbom »Kopiraj« ob dokazu in prilepi v prazni vhod pretvornika; v delovnem oknu ni dodatne kopije dokaza.

```text
55 46 4A 4A 53 6B 46 57 53 56 52 46 54 45 6F 36 49 45 78 56 53 30 45 67 53 31 4A 42 54 45 6F 75 49 45 74 50 52 45 45 67 54 55 46 51 52 54 6F 67 55 46 4A 46 52 45 46 4D 4C 67 3D 3D
```

Zgodba predstavi datoteko `obvestilo.dat`, detektivov izvoz prve prijave nenavadnega dogajanja. V njem sta prijaviteljevo ime in koda naslednje mape. Nepopolni pripis govori o **dveh preoblekah**: zunanja pozna **šestnajst znakov**, pod njo pa je abeceda **štiriinšestdesetih**. Besedi »zunanja« in »pod njo« namigujeta na vrstni red. Uvod ne našteva dovoljenih znakov, ne razloži dopolnila in ne pove korakov pretvorbe; neposrednejša pomoč je v namigih. Reševanje poteka brez samodejnega prenosa rezultatov:

1. Izbereta **Šestnajstiško (HEX)** in dekodiranje. Prvi rezultat je še vedno kodiran zapis:

   ```text
   UFJJSkFWSVRFTEo6IExVS0EgS1JBTEouIEtPREEgTUFQRTogUFJFREFMLg==
   ```

2. Celoten vmesni rezultat kopirata z gumbom **»Kopiraj« ob rezultatu** in ga **prilepita v vhod**, izbereta **Base64** in ponovno dekodirata. Končno besedilo je **`PRIJAVITELJ: LUKA KRALJ. KODA MAPE: PREDAL.`**
3. V polje za odgovor zgoraj desno vneseta samo **`PREDAL`**. Celotno obvestilo ni odgovor; sprejet je tudi vnos `KODA: PREDAL`. Velikost črk in odvečni presledki niso pomembni.

- Namig 1: »Upoštevaj vrstni red: najprej zunanji zapis s šestnajstimi znaki v parih, nato notranji z naborom štiriinšestdesetih znakov.«
- Namig 2: »Najprej dekodiraj Šestnajstiško (HEX). Celoten rezultat ročno prekopiraj v vhod, izberi Base64 in ponovno dekodiraj. Odgovor je samo koda naslednje mape.«

**Opomba za izvajalca:** končnica `.dat` ne določa kodiranja. Če pretvorba ne uspe, naj preverita vrstni red, celovitost prekopiranih parov in vmesnega rezultata ter smer dekodiranja. Vmesni niz vsebuje 60 znakov in se konča z dvema znakoma `=`; končno sporočilo vsebuje 43 bajtov ASCII. Neuspešen poskus v pripomočku ne poveča števila oddanih odgovorov. Ime prijavitelja pojasni naslednji pregled predala, ne določi storilca.

**Učni cilj:** prepoznati dve zaporedni kodiranji in uporabiti rezultat prvega kot vhod drugega. Par šestnajstiških znakov predstavlja en bajt zapisa Base64, ta pa predstavlja končno besedilo. HEX in Base64 sta kodiranji, ne šifriranje; za obratno pretvorbo ne potrebujemo skrivnega ključa in njuna kombinacija ne zagotavlja zaupnosti.

## 3. Poišči phishing sporočilo

Šolska domena v učnem primeru je `piramida.si`. Obvestilo iz druge naloge pripelje do **Luke Kralja**, ki je na dan sumljivega prenosa prejel nenavadno e-pošto in jo prijavil detektivu. Detektiv je zbral sporočila iz Lukinega šolskega predala **`luka.kralj@piramida.si`**, da bi preveril morebiten poskus pridobitve prijavnih podatkov. Zato sledi pregled njegove pošte. To je izmišljeni lastnik predala; aplikacija ne bere prave pošte ali navezuje stikov. Vseh sedem sporočil je naslovljenih nanj.

Začetni vrstni red je **A, B, C, D, E, F, G**: knjižnični opomnik, mentorsko obvestilo, načrtovano IT-vzdrževanje, lažna IT-zahteva, pomembna sprememba učilnice, pričakovana priponka fotografskega krožka in jedilnik. Phishing sporočilo je **četrto** in ima oznako **D**. Vrstni red je ureditev dokazne zbirke, ne časovno razvrščanje.

Odpiranje sporočila označi njegovo prebranost in prikaže dejanskega pošiljatelja, prejemnika ter vsebino brez dodatnega podvojenega razdelka z glavami. Dejanski cilj povezave je viden ob lebdenju z miško, fokusu s tipkovnico ali dotiku. Naslov se prikaže znotraj predala in se ne odpre na drugi strani. Zelene oznake varnega in rdeče oznake sumljivega sporočila so **lastna presoja ekipe**, ne vnaprej razkrite rešitve; stanje je razvidno tudi iz besedila. Prebranost in izbira odgovora sta ločeni. Kot odgovor je izbrano eno sumljivo sporočilo; ob izbiri drugega se prejšnja sumljiva oznaka odstrani. Oznake »V redu« pri drugih sporočilih ostanejo. Če izbrano sumljivo sporočilo označita kot »V redu«, se polje za odgovor počisti.

Pravilen izbor je **sporočilo D** in **najmanj dva** od teh opozorilnih znakov, brez napačnih:

- Domena pošiljatelja se ne ujema s šolsko domeno: `podpora@piramida-prijava.si`.
- Povezava vodi na drugo domeno: `https://piramida-prijava.si/prijava`. Isti URL se pojavi kot tretji zapis zgodovine v sedmi nalogi.
- Sporočilo pritiska z nujnostjo in grožnjo blokade čez 10 minut.
- Zahteva geslo in enkratno prijavno kodo na nepričakovani strani.

»Sporočilo vsebuje pozdrav« in »Sporočilo uporablja HTTPS« sta **napačna razloga**. Izbor D z enim razlogom ne zadostuje; prav tako ne zadostujeta dva pravilna razloga, če je označen še napačen.

- Namig 1: »Primerjaj dejanski naslov pošiljatelja in cilj povezave z domeno piramida.si. Ime, ki ga prepoznaš, samo po sebi še ni dokaz pristnosti.«
- Namig 2: »Primerjaj zahteve sporočil: eno združuje tuji domeni, grožnjo takojšnje blokade in zahtevo po geslu ter enkratni kodi.«

**Učni cilj:** pregledati dejanskega pošiljatelja, cilj povezave, zahteve in okoliščine. Prikazno ime ni dokaz pristnosti. HTTPS šifrira povezavo, vendar sam ne potrjuje legitimnosti spletnega mesta. V tem pripravljenem primeru je samo B phishing. Pomembno obvestilo E in pričakovana priponka F sama po sebi nista opozorilo; tudi ujemajoča se domena pa v resničnem svetu ne jamči varnosti.

## 4. Ugotovi predvidljivo geslo

Po pregledu sumljive pošte detektiv preveri še, ali bi bilo mogoče Lukino geslo uganiti iz javno dostopnih podatkov. Zato Luka pokaže svoj javni profil (`@luka.kralj`). Ima profilno fotografijo, opis z letnikom **2009** in **tri fotografske objave**: psičko **Luno**, smučanje in gorsko pot. Podatek o imenu psičke je v pripisu prve objave. Opis je »🎂 2009. 🏫 Šola Piramida. Najraje zunaj, na snegu ⛷️ ali na poti v hribe. 🏔️«. Pod kartico profila je privzeto zaprt razdelek »Pogosta slaba gesla« s šestimi vzorci: zaporedje številk, ime hišnega ljubljenčka, zaporedje tipk na tipkovnici, beseda »geslo« ali »password«, letnica rojstva ter ponavljanje istega znaka. Ime ljubljenčka in letnica sta ločena. Vse slike so ustvarjene za učno zgodbo in se nalagajo lokalno.

Naloga ima dva zaporedna dela:

1. Par ročno vnese **`luna2009`** ali **`2009luna`**. Velikost črk in robni presledki niso pomembni; sprejet je tudi en končni klicaj. Ponujenih gesel ni. Pravilen vnos odpre priporočila, vendar še ne reši stopnje in ne odklene pete naloge.
2. Par med šestimi možnostmi označi **vsa štiri ustrezna priporočila**, brez napačnih: dolga, naključna gesla; drugačno geslo za vsak račun; upravljalnik gesel; večfaktorska prijava. Ponovna uporaba istega gesla in kombinacija osebnih podatkov s klicajem sta napačni možnosti. Šele pravilen izbor zaključi stopnjo.

Potrditev prvega dela se shrani v sejo in preživi osvežitev ali ponovni zagon strežnika. Po vrnitvi par nadaljuje pri priporočilih; vneseno geslo se na strežniku ne hrani. Vsaka oddaja v obeh delih šteje kot poskus. Ponovna oddaja že rešene stopnje števila ne poveča.

- Namig 1: »Katera javna podatka bi si lastnik zlahka zapomnil in ju združil? Pri priporočilih razmisli tudi o ponavljanju gesel med računi.«
- Namig 2: »Poveži ime psičke in letnico v opisu profila v eno besedo. Nato izberi priporočila za dolžino, različna gesla, upravljalnik in dodatno zaščito prijave.«

**Učni cilj:** prepoznati predvidljivost gesla iz javnih podatkov in izbrati učinkovite zaščitne ukrepe. Klicaj ali preprosta zamenjava črke z znakom predvidljivosti ne odpravita. Prednost imajo dolga, naključna in za vsak račun različna gesla, pri ustvarjanju ter shranjevanju pomaga upravljalnik. Večfaktorska prijava dodatno zaščiti račun, ne spremeni pa šibkega gesla v močno. Ne zahtevamo obveznih simbolov ali redne menjave brez razloga. Priporočila sledijo [CISA: močna gesla](https://www.cisa.gov/sites/default/files/2024-09/Secure-Our-World-Passwords-Tip-Sheet.pdf), [CISA: dodatna zaščita z MFA](https://www.cisa.gov/sites/default/files/2024-09/Secure-Our-World-4-Easy-Ways-Stay-Safe-Online-Tip-Sheet.pdf) in [NIST: gesla](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver).

Dijaki sestavijo hipotetično predvidljivo geslo za ta učni primer. Ne iščejo Lukovega dejanskega gesla, ne izvajajo prijavnih poskusov in iz rešitve ne sklepajo, katero geslo je bilo uporabljeno pri incidentu.

## 5. Fotografija skriva namig

Po pregledu javnega profila se pogovor nadaljuje o možnih poteh dostopa do Lukinega računa. Luka pove, da je na dan sumljivega prenosa uporabljal skupni šolski računalnik. Detektiv želi njegov odhod primerjati s časom prenosa datoteke. Luka se spomni, da je ob odhodu fotografiral svoj rdeči nahrbtnik na hodniku pred računalniško učilnico. Trdi, da je bilo to ob **11:15**, in detektivu pošlje mapo šolskih in osebnih slik. Posnetek je sled za časovno umestitev odhoda. Uvod na kratko pojasni, da so metapodatki podatki, ki spremljajo datoteko, na primer ime, velikost in zapisani časi. Navodilo se glasi: »Ob kateri uri je bila fotografija dejansko posneta? Odgovori v obliki HH:MM.« Imena datoteke in pravilnega polja uvod ne razkrije; par fotografijo najprej prepozna po opisu.

Pregledovalnik vsebuje **12 datotek** v tem vrstnem redu: `ucilnica.jpg`, `dvorisce.jpg`, `knjiznica.jpg`, `telovadnica.jpg`, `projekt.jpg`, `stopnisce.jpg`, `obvestilo.png`, `gore.jpg`, `jedilnica.jpg`, `vhod.jpg`, **`hodnik.jpg`**, `tabla.jpg`. Iskana fotografija je enajsta, torej predzadnja. Pri njenem pregledu so na voljo slovensko poimenovani metapodatki:

```text
Ime datoteke: hodnik.jpg
Velikost: 2,4 MB
Čas nastanka posnetka: 20. 11. 2026 10:42:17
Čas spremembe: 20. 11. 2026 11:15:00
Časovni pas: UTC+01:00
```

Pravilen odgovor je **`10:42`**. Dovoljeni sta tudi obliki `10.42` in `10:42:17`. Zapisani čas nastanka posnetka je **10:42:17**, `11:15` pa je čas spremembe. Poznejše urejanje ali ponovno shranjevanje lahko spremeni čas datoteke, zato čas spremembe ne pomeni nujno časa fotografiranja. Iz njega tudi ni mogoče razbrati, kaj je bilo spremenjeno.

Vsaka datoteka ima svoj pripravljeni izpis. `ucilnica.jpg` ohrani nastanek ob 08:16:09 in spremembo ob 08:25:44. Posnetek zaslona `obvestilo.png` ima **Čas ustvarjanja** 09:51:06 in spremembo 10:03:28, nima pa polja **Čas nastanka posnetka**. Druge slike ne vsebujejo ciljnega časa. Izpisi so učni podatki, aplikacija jih ne bere iz dejanskega EXIF-a ustvarjenih predogledov; tudi prikazane velikosti opisujejo datoteke v zgodbi.

- Namig 1: »Med slikami poišči hodnik z rdečim nahrbtnikom in odpri njegove metapodatke. Čas poznejše spremembe ni nujno čas fotografiranja.«
- Namig 2: »Pri datoteki hodnik.jpg primerjaj polji Čas nastanka posnetka in Čas spremembe. V odgovor prepiši uro in minute iz prvega.«

**Učni cilj:** prepoznati pravi dokaz in razlikovati nastanek posnetka od poznejše spremembe datoteke. Za izvajalca: polje »Čas nastanka posnetka« predstavlja pomen `DateTimeOriginal`, »Čas spremembe« pa `ModifyDate`. Časovni odmik je izpisan; ni treba preračunavati v UTC. Metapodatki lahko manjkajo, so napačno nastavljeni ali spremenjeni, zato sami niso nezmotljiv dokaz. Razlika med časoma ne dokazuje namernega zavajanja, posega v vsebino slike ali identitete osebe, ki jo je spreminjala.

## 6. Kateri račun je bil uporabljen za prenos?

Čas fotografije **10:42** se ne ujema z Lukinim spominom na odhod ob **11:15**, zato se preiskava nadaljuje s pregledom dogajanja v šolskem omrežju okoli Lukinega odhoda iz učilnice. Detektiv pripravi promet in strežniške dnevnike iz tega časovnega okvira. Uvod pojasni omrežni promet kot izmenjavo podatkov med napravami v majhnih delih, imenovanih paketi. Ime `/zaupno/nacrt.pdf` pomaga pri iskanju uspešnega prenosa; račun v zapisu še ne določi osebe za skupnim računalnikom.

Forenzični pregledovalnik vsebuje **32 simuliranih paketov** in **16 ločenih zapisov aplikacijskega dnevnika**. Vsi dogodki so z dne 20. 11. 2026; časi so lokalni. Paketni izbor vključuje ARP, DNS, TCP, TLS in HTTP ter ni celoten zajem povezav. Par filtrira prikaz, izbere paket ter odpre njegove podrobnosti in morebitno povezavo z aplikacijskim zapisom.

Pravilen račun je **`ucenec17`**: ob **10:45:12** je z IP `10.0.0.17` izvedel `DOWNLOAD` datoteke `/zaupno/nacrt.pdf` z rezultatom `SUCCESS`. S tem zapisom je v učnem primeru povezan **paket 28**. Omrežna vrstica kaže šifriran odziv s strežnika `10.0.0.5` proti `10.0.0.17`; račun, dejanje, pot in rezultat izvirajo iz ločenega dnevnika.

Primerjaj tri pogoje hkrati: prenos, prava datoteka in uspeh. `ucenec12` je imel prenos zavrnjen (`DENIED`, **paket 17**, 10:41:23), `ucenec08` je opravil ogled (`VIEW`, **paket 21**, 10:42:31), `ucenec05` pa uspešno prenesel drugo datoteko (`/javno/urnik.pdf`, paket 26, 10:44:08). Dodani dogodki vključujejo javne dokumente, prijave in odjave. Nobeden ne spremeni edinega pravilnega odgovora.

- Namig 1: »V iskalnik »Besedilni filter« vnesi ime iskane datoteke. Pri preostalih paketih primerjaj povezane strežniške zapise: uspešen prenos ni isto kot ogled ali zavrnjen poskus.«
- Namig 2: »V ločenem aplikacijskem dnevniku poišči vrstico, v kateri so hkrati DOWNLOAD, /zaupno/nacrt.pdf in SUCCESS.«

**Učni cilj:** povezovati več virov in pogojev ter razlikovati omrežni prenos od aplikacijskega dogodka. Šifriran promet TLS sam ne razkrije računa ali poti datoteke. Povezavo med paketom in dnevnikom je vnaprej pripravila učna preiskovalna ekipa; v resnični preiskavi samo ujemanje časa ne bi nujno zadostovalo. ACK potrjuje prejem na ravni TCP, ne dovoljenja aplikacije; HTTP 200 v tem izboru se nanaša na javni `/status`, ne na zaupni dokument. ARP uporablja strojne naslove, vključno z oddajnim `ff:ff:ff:ff:ff:ff`. Aplikacija ne zajema dejanskega prometa in ne pošilja učnih zahtev v omrežje. Dnevnik potrjuje uporabo računa, ne identitete osebe za tipkovnico.

## 7. Najdi ponarejeni spletni strani

Zapis uspešnega prenosa poveže račun `ucenec17` z računalnikom `10.0.0.17`. Detektiv odpre njegovo zavarovano zgodovino: med petimi naslovi je tudi lažna povezava iz Lukove pošte, tretji zapis oziroma izbira C. Pri vsakem je podoba portala enaka; spreminja se naslovna vrstica. Pred iskanjem načrta je treba ločiti šolske naslove od tujih. Uvod pojasni, da je URL spletni naslov in da je treba pred vnosom gesla preveriti domeno, saj je videz strani mogoče kopirati. Pod zgodbo je privzeto zaprt razdelek »Kaj pomenijo deli spletnega naslova?«. Na pravilnem primeru `https://piramida.si/prijava?jezik=sl` z barvami in puščicami poveže HTTPS, domeno, pot in parameter z razlagami. Pojasni tudi znake `/`, `?`, `=` in `&` ter poddomeno na primeru `ucilnica.piramida.si`: `ucilnica` je poddomena, `piramida.si` pa osnovna domena šole. Odpiranje razdelka ne porabi namiga in ne razkrije ponaredkov. Potrjena šolska gostitelja sta `piramida.si` in `ucilnica.piramida.si`.

| Zapis | Naslov | Presoja |
| --- | --- | --- |
| 1 | `https://piramida.si/prijava` | Pravi šolski naslov. |
| 2 | `https://ucilnica.piramida.si/prijava` | Prava šolska učilnica. |
| 3 | `https://piramida-prijava.si/prijava` | Ponaredek: `piramida-prijava.si` je samostojna domena, ne pot na `piramida.si`. |
| 4 | `https://pirameda.si/prijava` | Ponaredek: podobno ime pripada drugi domeni. |
| 5 | `https://piramida.si/prijava?jezik=sl` | Pravi šolski naslov; parameter ne spremeni gostitelja. |

Navodilo se glasi: »V zgodovini poišči obe ponarejeni povezavi. V polji za odgovor vpiši njuni tuji domeni, brez https:// in poti. Vrstni red ni pomemben.« Par v polji **Prva tuja domena** in **Druga tuja domena** vpiše **obe** domeni:

- **`piramida-prijava.si`** (tretja povezava).
- **`pirameda.si`** (četrta povezava).

Vrstni red ni pomemben; velikost črk in robni presledki se prezrejo. En odgovor, ponovljena domena, celoten URL ali šolska domena ne zadostujejo. Preklapljanje med povezavami ne spreminja vnosov. Preverjanje poteka za obe domeni skupaj in ne razkrije, katera od njiju je pravilna. Prva, druga in peta povezava so prave. Naslovi ostanejo lokalno učno gradivo, brez odpiranja zunanjih strani ali prijavnih poskusov.

- Namig 1: »Preberi celotnega gostitelja med https:// in prvo naslednjo poševnico ter ga primerjaj s potrjenima šolskima gostiteljema. Sam pojav imena piramida.si še ne potrjuje pripadnosti šoli.«
- Namig 2: »Pri enem ponaredku je imenu šole z vezajem dodana beseda, pri drugem je zamenjana ena črka. Vpiši obe tuji domeni skupaj s končnico .si, vsako v svoje polje.«

**Učni cilj:** brati celoten gostitelj, ločiti domeno od poddomene, poti in parametrov ter prepoznati obe odstopanji od potrjene šolske domene. Vezaj sam po sebi ni dokaz prevare; `piramida-prijava.si` je ponaredek v zgodbi, ker ni potrjena šolska domena. Kopirana podoba in HTTPS ne potrjujeta pripadnosti šoli. Šolsko ime kjerkoli v URL-ju ni dovolj. Ne učimo pravila, da je registrirana domena vedno sestavljena iz zadnjih dveh delov; razlaga velja za konkretne prikazane naslove. Pri drugih URL-jih se lahko pojavijo še vrata, uporabniški podatki ali drugačna zgradba.

## 8. Računalnik govori v ničlah in enicah

**Dokaz:** `01000010 01010010 01010101 01000011 01001111 01010110 01000001 01001110 01001010 01000101`. Po prepoznanih ponarejenih prijavnih straneh detektiv v pravem arhivu po računu, času in poti prenosa najde ustrezno različico načrta. Dokaz je arhivski izpis kodnega imena projekta: deset skupin ničel in enic predstavlja deset črk v zapisu ASCII. Detektiv izpisu doda namig o vrednosti mest z enico. Presledki ločujejo skupine in niso del končnega sporočila. Vrstni red skupin se ohrani.

**Potek reševanja:** par izbere eno skupino in prebere osem bitov od leve proti desni. Mesta imajo uteži **128, 64, 32, 16, 8, 4, 2, 1**. Pri bitu **1** prišteje utež mesta, pri bitu **0** jo preskoči. Dobljeno decimalno število poišče v zložljivem pregledu ASCII s pari števil in črk A–Z ter si zapiše črko. Primer takoj pod tremi koraki navodil pokaže postopek: `01000001` je `64 + 1 = 65` in predstavlja črko `A`.

Pripomoček omogoča pregled posameznega bita in njegovega prispevka, ne izračuna pa skupne vsote ali črke. V njem ni izbire kodiranja, smeri ali gumba »Pretvori«. Rešitev se sestavi ročno:

| Skupina | Prištete uteži | Decimalno število | Znak ASCII |
| --- | --- | --- | --- |
| `01000010` | 64 + 2 | 66 | B |
| `01010010` | 64 + 16 + 2 | 82 | R |
| `01010101` | 64 + 16 + 4 + 1 | 85 | U |
| `01000011` | 64 + 2 + 1 | 67 | C |
| `01001111` | 64 + 8 + 4 + 2 + 1 | 79 | O |
| `01010110` | 64 + 16 + 4 + 2 | 86 | V |
| `01000001` | 64 + 1 | 65 | A |
| `01001110` | 64 + 8 + 4 + 2 | 78 | N |
| `01001010` | 64 + 8 + 2 | 74 | J |
| `01000101` | 64 + 4 + 1 | 69 | E |

V edino polje za odgovor v sekciji **ODGOVOR** zgoraj desno par vpiše kodno ime projekta **`BRUCOVANJE`**, ne glede na velikost črk in robne presledke. Na ozkem zaslonu je sekcija pod pripomočkom. Posameznih vsot ali črk ni treba oddajati.

- Namig 1: »Uteži mest od leve proti desni so 128, 64, 32, 16, 8, 4, 2 in 1. Seštej samo uteži mest z enico; ničle ne prispevajo ničesar. Vsota enega bajta določi eno črko v tabeli ASCII.«
- Namig 2: »Pri prvem bajtu 01000010 sta enici na mestih z utežmi 64 in 2. Vsota je 66, v tabeli ASCII pa to pomeni B. Enako obdelaj preostalih devet bajtov in ohrani njihov vrstni red.«

**Učni cilj:** povezati mesta v binarnem zapisu s potencami števila dve, ročno izračunati decimalno vrednost bajta ter po dogovorjenem kodiranju ASCII razbrati črko. Vsota dobi pomen znaka šele s tem dogovorom; ta primer ni šifriranje. Pravilen odgovor odpre finale; devete uganke ni. Večnamenski pretvornik ostaja pripomoček druge naloge.

## Zaključek in pogovor

»Odkril si projekt BRUCOVANJE.« potrdi cilj, zastavljen na začetku. Zaključek pokaže tri statistike: osem rešenih stopenj, čas in uporabljene namige. Pod njimi je vodoravna vrstica osmih obravnavanih tem; na ozkem zaslonu se pomika. Spodnja vprašanja in omejitve dokazov so gradivo za pogovor z izvajalcem.

Na ločeni javni lestvici `/lestvica` se ekipe razvrstijo najprej po več rešenih izzivih, nato po manj uporabljenih namigih in nazadnje po krajšem času. Ob enakih treh vrednostih si delijo mesto. Podatki se med ogledom osvežujejo vsakih pet sekund; za ogled ni potreben začetek igre. Čas teče od začetka igre in se ustavi po rešitvi vseh osmih izzivov. Pri nedokončanem poskusu se čas ustavi ob potrditvi nove preiskave ali izteku seje; tak rezultat dobi oznako »Prekinjeno«. Ponoven ogled istega namiga števila ne poveča; tudi namig, prvič odprt po rešitvi njegove stopnje, ne poslabša rezultata. Zaključen rezultat ostane nespremenjen.

Lestvica prikaže prvih 100 rezultatov in lasten rezultat tudi zunaj tega izbora. Ena igra ima en zapis, ki nastane že ob začetku z rezultatom 0/8. Ponastavitev odpre novo prazno sejo, vnos imena pa ustvari nov rezultat. Stari rezultat z njegovim imenom ostane, tudi če poteče seja ali se izbriše piškotek. Ime skupine je javno, zato pred delavnico dogovori izmišljene oznake. Ekipe lahko uporabljajo namige, ko jih potrebujejo; razvrstitev naj bo izhodišče za pogovor o postopku in ne ocena znanja.

**Ne sklepamo**, da je lastnik tega računa dokazano storilec, da je bilo iz javnih podatkov sestavljeno geslo dejansko uporabljeno pri vdoru ali da prikazani dokazi potrjujejo ves potek napada. Fotografija sama ne pove, kdo je uporabljal račun, časovna bližina dogodkov pa ni dokaz vzroka.

Pogovor odpri z vprašanjema:

- »Kateri podatek je bil najbolj prepričljiv dokaz in kakšne so njegove omejitve?«
- »Kaj bi lahko šola in uporabniki naredili za boljšo zaščito?«

Možne usmeritve: preverjanje nenavadnih zahtev po neodvisnem kanalu, upravljalnik in enkratna gesla, večfaktorska prijava, omejene pravice dostopa, dnevniki in njihovo varovanje, redne posodobitve ter jasen način prijave suma. Loči uporabne predloge od trditev o tem, kaj se je v tej zgodbi zagotovo zgodilo.

## Če se kaj zatakne

Napačen odgovor ostane v polju in omogoča nov poskus. Pri omrežni napaki naj par počaka na povezavo in ponovi oddajo, brez ponastavitve. Ob vrnitvi v isti brskalnik izbere »Nadaljuj preiskavo«. Če je bil piškotek izbrisan ali se je uporabljalo zasebno okno, povezave z anonimno sejo ni mogoče obnoviti prek imena ekipe. Ne uporabljaj skupnega javnega računalnika za več hkratnih ekip v istem profilu brskalnika.

Če stara seja še nima imena, ga par dopolni in nadaljuje z ohranjenim napredkom. Napredka ne briši s premikanjem baze ali ponovno objavo. Gumb za ponastavitev po potrditvi konča trenutni poskus, ustavi njegov čas in odpre novo igro. Prejšnji rezultat ostane na lestvici, stare seje pa ni več mogoče nadaljevati. V primeru težave s strežnikom skrbnik preveri `/api/health` in dnevnik procesa, ne da bi javno delil produkcijsko okolje ali podatkovno bazo.
