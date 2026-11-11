#!/usr/bin/env node
/**
 * Pildipanga lehe generaator.
 *
 * Kasutus:  node skriptid/pildipank.mjs
 *
 * Loeb kausta pildid/ kõik kategooriad ja pildid ning kirjutab
 * pildipank.html – lehe, kus kõiki pilte saab eelvaadata ja
 * failiteid kopeerida.
 *
 * Kui lisad pildipanka uusi pilte, jooksuta see skript uuesti.
 */

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const juur = fileURLToPath(new URL("..", import.meta.url));
const pildiKaust = join(juur, "pildid");
const valjund = join(juur, "pildipank.html");

const KATEGOORIAD = [
  ["loomad", "Loomad"],
  ["linnud", "Linnud"],
  ["putukad", "Putukad"],
  ["taimed", "Taimed"],
  ["loodus", "Loodus"],
  ["autod", "Autod"],
  ["soidukid", "Sõidukid"],
  ["inimesed-ja-kohad", "Inimesed ja kohad"],
];

const LAIENDID = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function pealkiri(failinimi) {
  const ilmaLaiendita = failinimi.replace(/\.[^.]+$/, "");
  const sonad = ilmaLaiendita.replace(/[-_]+/g, " ").trim();
  return sonad.charAt(0).toUpperCase() + sonad.slice(1);
}

function pildidKaustast(kaust) {
  let kirjed = [];
  try {
    kirjed = readdirSync(join(pildiKaust, kaust), { withFileTypes: true });
  } catch {
    return [];
  }
  return kirjed
    .filter((kirje) => kirje.isFile() && LAIENDID.has(kirje.name.slice(kirje.name.lastIndexOf(".")).toLowerCase()))
    .map((kirje) => kirje.name)
    .sort((a, b) => a.localeCompare(b, "et"));
}

function kaart(kaust, failinimi) {
  const tee = `pildid/${kaust}/${failinimi}`;
  const nimi = pealkiri(failinimi);
  return `      <article class="pilt" data-kategooria="${kaust}" data-nimi="${failinimi.toLowerCase()}">
        <a class="pilt__ava" href="${tee}" target="_blank" rel="noopener">
          <img src="${tee}" alt="${nimi}" loading="lazy">
        </a>
        <div class="pilt__info">
          <p class="pilt__nimi">${nimi}</p>
          <code class="pilt__tee">${tee}</code>
          <button class="pilt__kopeeri" type="button" data-tee="${tee}">Kopeeri tee</button>
        </div>
      </article>`;
}

const plokid = [];
const filtrid = [];
let koguarv = 0;

for (const [kaust, silt] of KATEGOORIAD) {
  const failid = pildidKaustast(kaust);
  if (!failid.length) continue;
  koguarv += failid.length;
  filtrid.push(`        <button class="filtreeri" data-filter="${kaust}" aria-pressed="false">${silt} <span class="filtreeri__arv">${failid.length}</span></button>`);
  plokid.push(
    failid.map((failinimi) => kaart(kaust, failinimi)).join("\n")
  );
}

const html = `<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pildipank – ${koguarv} fotot Malliriiulist</title>
  <meta name="description" content="Kõik ${koguarv} töötoa fotot ühes vaates: eelvaade, kategooriad ja valmis failiteed, mille saab ühe klikiga kopeerida.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23ff4d24'/><path d='M24 72V28h10l16 24 16-24h10v44H66V46L50 68 34 46v26z' fill='%23f7f2e8'/></svg>">
  <link rel="stylesheet" href="stiil.css">
  <link rel="stylesheet" href="pildipank.css">
</head>
<body>

  <a class="huppe-link" href="#pildid">Hüppa piltide juurde</a>

  <header class="pais">
    <a class="logo" href="index.html" aria-label="Malliriiul, avaleht">
      <span class="logo__marg">M</span>
      <span class="logo__nimi">Malliriiul</span>
    </a>

    <nav class="pais__nav" aria-label="Põhinavigatsioon">
      <a href="index.html#mallid">Mallid</a>
      <a href="index.html#juhend">Kuidas kasutada</a>
      <a href="pildipank.html" aria-current="page">Pildipank</a>
    </nav>

    <a class="nupp nupp--tume nupp--vaike" href="zip/koik-mallid.zip" download>
      Laadi kõik alla <span aria-hidden="true">↓</span>
    </a>
  </header>

  <main class="pildipank">

    <div class="pildipank__pais">
      <p class="silt"><span class="silt__tapp"></span> Pildipank · ${koguarv} fotot</p>
      <h1>Kõik pildid <em>ühes kohas.</em></h1>
      <p class="pildipank__sissejuhatus">
        Siin on kogu töötoa pildivalik kategooriate kaupa. Klõpsa pildil, et näha
        seda suuremalt, ja kopeeri tee nupuga „Kopeeri tee“ — see sobib otse
        <code>&lt;img src="…"&gt;</code> reale sinu lehel.
      </p>
      <p class="pildipank__meta">Fotod: Jaak Aibast (andis ühiskasutuseks 88 pilti) · Tehtud INSA insapäevade raames</p>
    </div>

    <div class="pildipank__riistad">
      <label class="pildipank__otsing">
        <span class="pildipank__otsing-silt">Otsi pilti</span>
        <input id="pildi-otsing" type="search" placeholder="nt kass, raba, bmw" autocomplete="off">
      </label>
      <button class="nupp nupp--vaata nupp--vaike" id="kopeeri-koik" type="button">Kopeeri nähtavad teed</button>
      <p class="pildipank__loendur" id="pildi-loendur">${koguarv} pilti</p>
    </div>

    <div class="filtrid" id="pildi-filtrid" role="group" aria-label="Filtreeri kategooria järgi">
      <button class="filtreeri on-aktiivne" data-filter="koik" aria-pressed="true">Kõik <span class="filtreeri__arv">${koguarv}</span></button>
${filtrid.join("\n")}
    </div>

    <p class="tuhi-tulemus" id="pildi-tuhi" hidden>Ühtegi pilti selle otsinguga ei leidunud. Proovi teist sõna või kategooriat.</p>

    <div class="pildipank__vorgustik" id="pildid">
${plokid.join("\n")}
    </div>

  </main>

  <footer class="jalus">
    <div class="jalus__logo">
      <span class="logo__marg">M</span>
      <div>
        <p>Malliriiul</p>
        <p class="jalus__vaike">Valmis kujundused õpilastele · Tehtud INSA insapäevade raames 2026</p>
      </div>
    </div>
    <nav class="jalus__nav" aria-label="Jaluse navigatsioon">
      <a href="index.html#mallid">Mallid</a>
      <a href="index.html#juhend">Juhend</a>
      <a href="pildipank.html">Pildipank</a>
      <a href="index.html#mallid">Laadi alla</a>
    </nav>
    <p class="jalus__markus">Mallid: Eva-Liisa Aibast (tegi mallid) · Fotod: Jaak Aibast (andis ühiskasutuseks 88 pilti)</p>
  </footer>

  <script src="pildipank.js"></script>
</body>
</html>
`;

writeFileSync(valjund, html, "utf8");
console.log(`pildipank.html kirjutatud – ${koguarv} pilti, ${KATEGOORIAD.length} kategooriat.`);
