# Malliriiul — tuba ja malligalerii

> **English version: [README.en.md](README.en.md)**

Üks staatiline veebileht, mis näeb välja nagu väike 1920. aastate elutuba. Toas saab
kõike puutuda: kell tiksub, grammofon mängib, klaveril saab mängida, korktahvlile
joonistada, kappi avada ja sealt peidetud esemeid otsida. Toa keskel on raamaturiiul,
mille köited on tegelikult koolitöötoa **kümme veebimalli** — köidet klõpsates avaneb
päris eelvaade ja ZIP-allalaad.

Kogu leht on **puhas HTML + CSS + JavaScript**: ei ehitamist, ei Node'i, ei andmebaasi,
ei raamistikku. Ainult failid, mida saab panna ükskõik millisele staatilisele serverile
(GitHub Pages, Nginx Raspberry Pi peal, `python3 -m http.server`).

---

## 1. Failide struktuur

```
INSA_html/
├── index.html            ← kogu tuba: HTML + CSS + JS ühes failis (~3900 rida)
├── pildipank.html        ← eraldi fotopank (kõik 85+ pilti, otsing, tee kopeerimine)
├── pildipank.css
├── pildipank.js
├── stiil.css             ← pildipanga ühised stiilid
├── README.md             ← see fail
├── vendor/
│   ├── gsap.min.js       ← GSAP 3 (kohalik koopia)
│   └── Draggable.min.js  ← GSAP Draggable (kohalik koopia)
├── pildid/               ← kogu graafika, kategooriatesse jaotatud
│   ├── tuba/             ← toa esemed (kapp, klaver, kleit, kell, grammofon …)
│   │   ├── klaver.png
│   │   ├── kleit.png
│   │   ├── postkaardid/
│   │   └── valjaloiked/  ← 13 ajastu väljalõiget (1920. aastate pildid)
│   ├── sein/  riistad/  esemed/  taust/
│   ├── loomad/  linnud/  putukad/  taimed/  loodus/  autod/  soidukid/  inimesed-ja-kohad/
├── mallid/               ← 10 veebimalli, igaüks oma kaustas (index.html + stiil.css + pildid/)
├── zip/                  ← valmis ZIP-failid mallide allalaadimiseks
├── kujud/                ← SVG-d, mida leht genereerib (lehevormid)
├── skriptid/             ← Node-skriptid ZIP-ide ja pildipanga genereerimiseks (ei ole saidi tööks vajalikud)
└── screenshots/
```

`index.html` on ainus fail, mida tuba vajab. `mallid/`, `zip/` ja `pildid/` on
kohalikud ressursid; `skriptid/` on ainult hooldamiseks.

---

## 2. Käivitamine

**Kohapeal** (soovitatav, sest osa funktsioone vajab HTTP-d):

```powershell
cd INSA_html
python -m http.server 8080
# või
npx serve .
```

Ava `http://localhost:8080`.

**Otse failina** töötab ka (`file:///.../index.html`), aga siis võivad mõned
brauserid piirata iframe-eelvaateid (`mallid/*/index.html`).

**GitHub Pages**: kogu kaust on staatiline, suhtelised aadressid, `index.html`
juurkaustas — sobib Pagesile muutmata kujul. Vaata jaotist 8.

---

## 3. Sõltuvused ja välised teenused

| Sõltuvus | Kuhu | Milleks | Vajab internetti? |
| --- | --- | --- | --- |
| GSAP + Draggable | `vendor/` (kohalik) | grammofoni vinkli ja helitugevuse pööramine | ei |
| Cinzel Decorative, Cormorant Garamond | Google Fonts (`fonts.googleapis.com`) | tüpograafia | **jah** (muidu langeb süsteemifondile) |
| Open-Meteo | `api.open-meteo.com` | akna ilmateade (Tallinn) | jah |
| YouTube / Spotify oEmbed | `youtube.com`, `open.spotify.com` | voo paneeli pealkirjad | jah |
| YouTube / Spotify embed | `youtube.com/embed`, `open.spotify.com/embed` | voo esitamine | jah |
| Heli (klaver, grammofon, kriuks) | Web Audio API, süntees kohapeal | kõik helid genereeritakse reaalajas | ei |
| Pildid | `pildid/` (kohalik) | kogu graafika | ei |

Iga väline teenus on valikuline: internetita jääb ilm „Ilm ei ole saadaval",
fonto asendub süsteemifondiga, voo paneel ei laadi, aga tuba ise töötab täielikult.

Piltide päritolu on kirjas lehe enda **Tänud** paneelis (HUD → Tänud): Jaak Aibast
(fotod), The Metropolitan Museum of Art (CC0), Wikimedia Commons (avalik omand /
CC BY-SA), Livrustkammaren, Pearson Scott Foresman, Wellcome Collection, rawpixel
(CC0) jt.

---

## 4. Interaktiivsete elementide täielik nimekiri

### 4.1 Tuba ja liikumine

| Element | Asukoht | Tegevus |
| --- | --- | --- |
| Tuba (`#ruum`) | kogu ekraan | lohista hiirega vasakule/paremale, keri rattaga või kasuta `←` `→`; puutelapatsiga kahe sõrme kerimine |
| Servanooled | ekraani servad | keri tuba ühe sammu võrra |
| Uks / aken | vasak tiib | aknast paistab päris tänavavaade; **lohista vaadet** või kasuta nooleklahve |
| Ilmateade | akna all | Open-Meteo andmed Tallinna kohta, uueneb ise |
| Kell | vasak tiib | näitab päris aega; klõps avab **Pomodoro** (25:00, start/peata/lähtesta) |
| Riiulituled (HUD → Riiuli tuled) | riiuli all | 5 värvitooni: kuldne, roosa, mint, lavendel, jääsinine — muudab kogu toa valgustust (`html[data-lamp]`) |
| Raamatud | riiul | klõps avab malli eelvaate (vt 4.6) |
| Sahtlid | vasakul all | klõps avab sahtli; sealt leiad fotopanga lingi ja teise sahtli |
| Pruudikleit | parem sein | **lohista** mööda tuba (nooleklahvid nihutavad 4 px, Shift 16 px); sädeleb; asukoht salvestub |
| Postkaardid | korktahvli kõrval seinal | lohista ringi või nihuta nooleklahvidega; asukoht salvestub |
| Kriuksuv põrandalaud | parem tiib, põrandal | klõps teeb kriuksu **ja avab seina seifi paneeli** |

### 4.2 Riistad (tööriistariba kapil)

Riistad ripuvad paremal seinal kapil. Vali riist ja seejärel klõpsa objektidel.

| Riist | Mida teeb |
| --- | --- |
| **Käsi** | neutraalne: klõpsad esemetel ja avad paneele |
| **Tolmuhiivuti** | tõmba üle riiuli, raamatute ja piltide — tolm kaob (`malliriiul-plekid`/tolm) |
| **Prillid (luup)** | lohista luupi mööda riiulit — pisikiri raamideselgadel muutub loetavaks |
| **Kastekann** | klõpsa taimedel ja potil — taimede niiskus taastub, kuivanud taim muutub elavaks |
| **Sulg** | avab külalisteraamatu kirjutamiseks (vt 5.3) |
| **Koi** | lase koid lendu; nad tiirlevad toas ja kaovad lõpuks kappi tagasi |
| **Käsn** | puhastab joonistused/plekid tahvlilt ja seintelt |

### 4.3 Korktahvel (parem sein)

| Element | Tegevus |
| --- | --- |
| `−` / `%` / `+` / `⟲` | suum 100% → 108%, lähtestamine |
| `⤢` | avab tahvli **suurel töölaual** (eraldi paneel, Esc sulgeb) |
| `✍` | avab külalisteraamatu |
| Nööpnõelad, postkaardid, väljalõiked | **lohista** vabalt ringi; `×` kustutab; asukohad salvestuvad |
| Väljalõigete riba | 13 ajastu pilti (Chaplin, Pickford, Houdini, Wallace Reid, E. M. Favor, daam 1905, grammofonikuulutus 1909, Excelsiori jalgratas, biplaan, roos, kass „Lavine", Great Arrow 1908, Fiat) — klõps kleebib tahvlile |
| Joonistamine (suur töölaud) | 11 riista: pliiats, pintsel, marker, aerograaf, kustukumm, täitevärv, joon, ristkülik, ellips, tekst, tempel; 13 värvi; suuruse liugur; filtrid (negatiiv, seepia, peegel, pritse); undo/redo (`Ctrl+Z`); tühjenda; **PNG-eksport**; kiht „peal"/„all" |
| Joonistus salvestub | automaatselt (`malliriiul-korkjoonis`) ja taastub laadimisel |

### 4.4 Klaver (parem nurk)

| Element | Tegevus |
| --- | --- |
| Klõps klaveril või HUD → **Klaver** | avab klaveripaneeli kahe oktaviga |
| Klahvid | hiir, sõrm või tähed `A W S E D F T G Y H U J K` |
| Noodivalik | 5 sisseehitatud pala: „Rõõmuhüüe" (Beethoven), „Für Elise", „Greensleeves", „Maple Leaf Rag", „Kellamäng" |
| Sinu noodid | tekstiväli: noot + oktav (`C4 D4 E4`), `/2` = kaks lööki, `.` = poolteist, `r` = paus, `\|` ignored |
| Salvestused | oma pala salvestamine ja hiljem uuesti mängimine (`malliriiul-salvestused`) |
| Raadioekraan | 2000. aastate stiilis roheline ekraan, mis näitab, mida mängitakse |

### 4.5 Grammofon

| Element | Tegevus |
| --- | --- |
| `▶ Mängi` / plaat | mängib/peatab valitud plaadi (heli sünteesitakse Web Audio API-ga) |
| Helitugevuse nupp | **pööratav** (Draggable, rotation) |
| Helipea (vinkkel) | **pööratav**; kraapimine teeb kriimustushäält |
| Plaadivalik | 5 plaati: Dixieland One-Step (1917), Tiger Rag (1917), Maple Leaf Rag (1899), Dippermouth Blues (1923), Alexander's Ragtime Band (1911) |
| `⋯` paneel | kleebi YouTube'i või Spotify link — see mängib grammofoni kaudu (embed + oEmbed pealkiri) |

### 4.6 Malligalerii (riiul)

| Element | Tegevus |
| --- | --- |
| Raamat (köide) | klõps avab malli eelvaate paneeli: iframe päris lehega + **ZIP** allalaad |
| Mallid | Pastelne päevik, Neon Retro, Ajakiri, Fotoportfoolio, Terminal, Kollaaž, Bento, Kohvik Kirsipuu, Metsaääre pood, Matkapäevik |
| Pildisahtel | avab `pildipank.html` — kõik fotod, otsing, filtrite ja tee kopeerimine |

### 4.7 HUD (ekraani alumine riba)

| Nupp | Tegevus |
| --- | --- |
| **Läbi kõik ↓** | kerib toa lõppu |
| **Klaver** | avab klaveripaneeli |
| **Tänud** | autorid ja piltide päritolu |
| **Juhend** | lühike kasutusjuhend |
| Riiuli tuled | 5 valgustooni |
| Vasakul all | hetkevihje (mida saab teha) |

---

## 5. Mõistatused ja peidetud tegevused (samm-sammult)

### 5.1 Seif ja vaskvõti

1. Vaata **kella** või **riiulitulesid** — vihje on „kell 03:33 või jääsinine tuli".
2. Klõpsa **kriuksuval põrandalaual** (parem tiib, põrandal) — see avab seina seifi paneeli.
3. Seifil on kolm numbriketast. Keera need asendisse **3 · 3 · 3** → seif avaneb.
4. Seifist saab **vaskvõtme**. Võti salvestub (`malliriiul-voti`) ja jääb alles ka pärast lehe uuendamist.

### 5.2 Kapp: hammasrattad → 1926. aasta joonis

1. **Vaskvõtmega** klõpsa kapi lukul → uks avaneb.
2. Kapi sees on **kolm hammasratast**. Klõps ühel keerab seda 90° ja naabreid 45°.
3. Keera nii, et kõik kolm märki on ülal (iga ratas jõuab täisringini). Kui tahad
   kiiremini, vajuta **„Lahenda automaatselt"**.
4. Kui mehhanism klõpsatab, ilmub kapi taha **1926. aasta mehaaniline joonis**.
5. Klõpsa joonisel → see on **käes**; klõpsa korktahvlil → joonis kinnitatakse tahvlile
   (läheb külaliste lehtede hulka, `malliriiul-joonis`).
6. **Kapi saab uuesti kinni panna** alles siis, kui hammasrattad on lahendatud **ja**
   joonis on kapi tagant ära võetud. Sulgemisnupp „Sulge kapp" on nähtav kohe, kui uks
   on lahti; kui midagi on veel tegemata, ütleb vihjeriba, mida puudu on.

### 5.3 Külalisteraamat ja külalised

1. Vali riistaks **sulg** (või vajuta korktahvli `✍`) → avaneb külalisteraamat.
2. Kirjuta nimi ja sõnum; leht tekib korktahvlile.
3. Lehti saab tahvlil lohistada ja `×`-iga kustutada; kustutatud ei tule tagasi
   (`malliriiul-korkkust`).

### 5.4 Tolm ja luup

1. Vali **tolmuhiivuti** ja tõmba üle riiuli, raamatute ja piltide — tolmurullid kaovad.
2. Vali **prillid** ja lohista luupi mööda raamideselgu — peidetud pisikiri muutub loetavaks.

### 5.5 Taimed

Taimedel on niiskus (`malliriiul-niiskus`), mis ajapikku langeb. Vali **kastekann** ja
klõpsa taimel/potil — niiskus taastub, kuivanud taim muutub jälle roheliseks.

### 5.6 Koi (moth)

Vali **koi** ja lase need lendu: nad tiirlevad toas, põrkavad vastu seinu ja kaovad
lõpuks kappi tagasi („Koid kadusid kappi tagasi").

### 5.7 Kleit

Pruudikleit ripub korktahvli kõrval riidepuul **ühes tükis** (kleit + riidepuu).
Seda saab lohistada ükskõik kuhu tuppa; asukoht salvestub (`malliriiul-kleit`).
Kleit on riiulipaneelist kõrgemal z-kihis, seega ei jää ta riiuli taha kinni.
Sädelus (22 täheke + kleidi kujuga maskeeritud peegeldusriba) on puhas CSS.

### 5.8 Peidetud tekstid

- Kellal ja kapi ustel on vihjed, mis muutuvad vastavalt olekule.
- Vihjeriba (HUD, vasakul all) räägib iga tegevuse järel, mis juhtus.
- Riiuliraamatute juures on juhuslikud kaebused („Tolm! Sellel riiulil on jälle tolm!"),
  mis ilmuvad riiuli kasutamisel.

---

## 6. Klaviatuuri otseteed

| Klahv | Kus | Mida teeb |
| --- | --- | --- |
| `←` `→` | tuba fookuses | keri tuba |
| `+` / `-` | korktahvel fookuses | suum sisse/välja |
| `Ctrl+Z` | joonistamine | võta tagasi |
| `Esc` | suur töölaud / paneelid | sulge |
| `Enter` / `Space` | fookustatud ese | aktiveeri (klõpsu ekvivalent) |
| `A W S E D F T G Y H U J K` | klaver | mängi noote |
| `Shift` + nooled | kleit / postkaardid | suurem samm (16 px) |
| `Tab` | kogu leht | liigu järgmise fookustatava juurde |

---

## 7. Salvestatud olek (localStorage)

Kõik, mis on „meeles", on brauseri `localStorage`-s. Võtme eesliide on `malliriiul-`.

| Võti | Sisu |
| --- | --- |
| `malliriiul-kapp` | kas kapp on lahti (`true`/`false`) |
| `malliriiul-voti` | kas vaskvõti on käes |
| `malliriiul-hammas` | kas hammasrattad on lahendatud |
| `malliriiul-joonis` | joonise olek: `peidus` \| `laual` \| `kaes` \| `tahvlil` |
| `malliriiul-kleit` | kleidi asukoht `[left, bottom]` |
| `malliriiul-korkzoom` | korktahvli suum |
| `malliriiul-korkpinnad` | nööpnõelte asukohad |
| `malliriiul-korkkust` | kustutatud nõelte ID-d |
| `malliriiul-korkloiked` | tahvlile kleebitud väljalõiked |
| `malliriiul-korkjoonis` | korktahvli joonistus (PNG data-URL) |
| `malliriiul-kylalised` | külaliste lehed tahvlil |
| `malliriiul-kylastus` | külastuste arv |
| `malliriiul-lamp` | riiulitulede toon |
| `malliriiul-niiskus` | taimede niiskus |
| `malliriiul-plekid` | plekid/tolm |
| `malliriiul-postkaardid` | postkaartide asukohad |
| `malliriiul-salvestused` | klaveril salvestatud palad |

**Kõige lähtestamine:** brauseri konsoolis

```js
Object.keys(localStorage).filter(k => k.startsWith('malliriiul-')).forEach(k => localStorage.removeItem(k));
location.reload();
```

---

## 8. GitHub Pages

Leht on staatiline ja töötab Pagesil muutmata kujul: suhtelised aadressid (ei ühtegi
`/`-ga algavat teed), `index.html` juurkaustas, kõik pildid ja JS kohalikud.
Ainus, mis vajab internetti, on Google Fonts ja ilm/voog (vt jaotis 3).

**Oluline:** avaldatakse kogu see kaust (umbes 58 MB, sh `zip/` ja `mallid/`), seega
mahupiirangutega (1 GB repo, 100 MB fail) probleemi ei ole. `skriptid/` (Node) on
kaasas, aga Pages neid ei käivita — need on ainult hooldamiseks.

---

## 9. Kuidas muudatusi teha

**Uus väljalõige korktahvlile**
1. Pane pilt kausta `pildid/tuba/valjaloiked/` (soovitavalt 500 px lai, JPEG).
2. `index.html`-is leia massiiv `var LOIKED=[` ja lisa rida:
   `{k:'minu-id',n:'Nimi · aasta',img:'pildid/tuba/valjaloiked/minu-pilt.jpg'},`
3. Valmis — nupp tekib ribale automaatselt.

**Uus plaat grammofonile**
`var PLAADID=[ ... ]` — iga rida: `[nimi, allikas, toon, värv, esitaja]`.

**Uus pala klaverile**
`var TUNNID=[ ... ]` — `{nimi, autor, bpm, noodid:'C4 D4 E4 ...'}`.

**Vihjete muutmine**
`RIIS_VIHJED` (riistade vihjed) ja `vihjeEl.textContent=` read vastavate tegevuste järel.

**Uus mall galeriisse**
Lisa kaust `mallid/<nimi>/` (`index.html` + `stiil.css` + `pildid/`), seejärel lisa rida
massiivi `MALLID` ja paki ZIP: `node skriptid/pakenda.mjs`.

---

## 10. Ligipääsetavus

- Kõik olulised esemed on fookustatavad (`Tab`) ja aktiveeritavad `Enter`/`Space`-iga.
- Paneelid kasutavad `aria-expanded`, `aria-controls`, `role="group"`, `aria-label`.
- Vihjeriba on `aria-live="polite"` — ekraanilugeja kuuleb, mis juhtus.
- `prefers-reduced-motion: reduce` korral lülituvad välja lendavad koid, vihm/lumi,
  kleidi sädelus, grammofoni pöörlemine jm animatsioonid.
- Heli käivitub alles kasutaja klõpsu järel (brauserite autoplay-piirang).

---

## 11. Autorid ja litsents

- **Mallid:** Eva-Liisa Aibast
- **Fotod:** Jaak Aibast
- **Toa graafika:** vt lehe **Tänud** paneeli (The Metropolitan Museum of Art CC0,
  Wikimedia Commons — avalik omand ja CC BY-SA, Livrustkammaren, Pearson Scott
  Foresman, Wellcome Collection, rawpixel CC0 jt)
- **GSAP + Draggable:** gsap.com (Standard "no charge" litsents)

Kood on kirjutatud INSA insapäevade töötoa jaoks.
