#!/usr/bin/env node
/**
 * Malliriiuli ZIP-pakkija.
 *
 * Kasutus:  node skriptid/pakenda.mjs
 *
 * Teeb iga kausta mallid/ all eraldi ZIP-faili zip/mall-<nimi>.zip
 * ja lisaks koondfaili zip/koik-mallid.zip.
 *
 * Igasse ZIP-i lisatakse ka JUHEND.txt, mida mallide kaustades endil ei ole.
 * Sõltuvusi ei ole – kasutab ainult Node'i sisseehitatud mooduleid.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const juur = fileURLToPath(new URL("..", import.meta.url));
const mallideKaust = join(juur, "mallid");
const zipKaust = join(juur, "zip");

const NIMED = {
  ajakiri: "Ajakiri",
  bento: "Bento",
  fotoportfoolio: "Fotoportfoolio",
  kohvik: "Kohvik",
  kollaaz: "Kollaaz",
  matkapaevik: "Matkapäevik",
  "neon-retro": "Neon-retro",
  "pastelne-paevik": "Pastelne päevik",
  pood: "Pood",
  terminal: "Terminal",
};

const JUHEND = (nimi) => `MALL: ${nimi}
============================================================

See on Malliriiuli valmis kujundus. Kaustas on:
  index.html  – lehe sisu
  stiil.css   – lehe välimus
  pildid/     – lehel kasutatud pildid
  skript.js   – ainult mõnel mallil (väike lisafunktsioon, nt ostukorv)

MIDA MUUTA
----------
1. Ava index.html tekstiredaktoris (nt VS Code, Notepad++ või lihtsalt Notepad).
2. Otsi kommentaare, mis algavad sõnaga „MUUDA“ — need näitavad täpselt,
   millist kohta muuta.
3. Pealkirjad ja tekstid on HTML-is tavalise tekstina. Muuda ainult seda,
   mis on siltide > ja < vahel.
4. Pildid on read kujul:
      <img src="pildid/kass-portree.jpg" alt="Kass vaatab kaamerasse">
   Vaheta src väärtus oma pildi vastu. Alt lahtrisse kirjuta, mida pildil näha on.
5. Värvid ja fondid on faili stiil.css alguses plokis :root. Muuda seal
   väärtusi ja terve leht muutub koos sinuga.

PILDID
------
Malliga on kaasas kaust „pildid/“, kus on veebi jaoks optimeeritud näidispildid.

Uue pildi lisamiseks:
  a) pane fail kausta „pildid/“ ja kirjuta src="pildid/sinu-pilt.jpg"
  b) või kasuta pildiserverit: src="http://pildid.local/loomad/sinu-pilt.jpg"

Hoia pilt mõistliku suurusega (pikem külg umbes 1600 px, alla 1 MB).
Kontrolli, et failinimi oleks täpselt sama, sh suured ja väikesed tähed.

LEHE VAATAMINE
--------------
Ava index.html oma brauseris. Kui paned kausta Raspberry Pi peale Nginxi
juurkausta (tavaliselt /var/www/html), avaneb leht sealsamas võrgus.

ÄRA KARDA MIDAGI RIKKUDA
------------------------
See on mall — kui midagi läheb katki, laadi ZIP uuesti alla ja alusta uuesti.
`;

/* ---------- ZIP-i kirjutamine ---------- */

const CRC_TABEL = (() => {
  const tabel = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabel[i] = c >>> 0;
  }
  return tabel;
})();

function crc32(puhver) {
  let c = 0xffffffff;
  for (let i = 0; i < puhver.length; i += 1) c = CRC_TABEL[(c ^ puhver[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosKuupaev(ms) {
  const d = new Date(ms);
  const aasta = Math.max(1980, d.getFullYear());
  const kuupaev = ((aasta - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const kellaaeg = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  return { kuupaev, kellaaeg };
}

function teeZip(kirjed) {
  const tükid = [];
  const keskkaust = [];
  let nihe = 0;

  for (const kirje of kirjed) {
    const nimePuhver = Buffer.from(kirje.nimi, "utf8");
    const andmed = kirje.andmed;
    const crc = crc32(andmed);
    const pakitud = deflateRawSync(andmed, { level: 9 });
    const kasutaPakkimist = pakitud.length < andmed.length;
    const keha = kasutaPakkimist ? pakitud : andmed;
    const meetod = kasutaPakkimist ? 8 : 0;
    const { kuupaev, kellaaeg } = dosKuupaev(kirje.aeg);

    const kohalik = Buffer.alloc(30);
    kohalik.writeUInt32LE(0x04034b50, 0);
    kohalik.writeUInt16LE(20, 4);
    kohalik.writeUInt16LE(0x0800, 6);
    kohalik.writeUInt16LE(meetod, 8);
    kohalik.writeUInt16LE(kellaaeg, 10);
    kohalik.writeUInt16LE(kuupaev, 12);
    kohalik.writeUInt32LE(crc, 14);
    kohalik.writeUInt32LE(keha.length, 18);
    kohalik.writeUInt32LE(andmed.length, 22);
    kohalik.writeUInt16LE(nimePuhver.length, 26);
    kohalik.writeUInt16LE(0, 28);
    tükid.push(kohalik, nimePuhver, keha);

    const kesk = Buffer.alloc(46);
    kesk.writeUInt32LE(0x02014b50, 0);
    kesk.writeUInt16LE(20, 4);
    kesk.writeUInt16LE(20, 6);
    kesk.writeUInt16LE(0x0800, 8);
    kesk.writeUInt16LE(meetod, 10);
    kesk.writeUInt16LE(kellaaeg, 12);
    kesk.writeUInt16LE(kuupaev, 14);
    kesk.writeUInt32LE(crc, 16);
    kesk.writeUInt32LE(keha.length, 20);
    kesk.writeUInt32LE(andmed.length, 24);
    kesk.writeUInt16LE(nimePuhver.length, 28);
    kesk.writeUInt16LE(0, 30);
    kesk.writeUInt16LE(0, 32);
    kesk.writeUInt16LE(0, 34);
    kesk.writeUInt16LE(0, 36);
    kesk.writeUInt32LE(0, 38);
    kesk.writeUInt32LE(nihe, 42);
    keskkaust.push(kesk, nimePuhver);

    nihe += kohalik.length + nimePuhver.length + keha.length;
  }

  const keskPuhver = Buffer.concat(keskkaust);
  const lõpp = Buffer.alloc(22);
  lõpp.writeUInt32LE(0x06054b50, 0);
  lõpp.writeUInt16LE(0, 4);
  lõpp.writeUInt16LE(0, 6);
  lõpp.writeUInt16LE(kirjed.length, 8);
  lõpp.writeUInt16LE(kirjed.length, 10);
  lõpp.writeUInt32LE(keskPuhver.length, 12);
  lõpp.writeUInt32LE(nihe, 16);
  lõpp.writeUInt16LE(0, 20);

  return Buffer.concat([...tükid, keskPuhver, lõpp]);
}

/* ---------- Failide kogumine ---------- */

function koguFailid(kaust, baas = kaust) {
  const nimekiri = [];
  for (const kirje of readdirSync(kaust, { withFileTypes: true })) {
    if (kirje.name.startsWith(".") || kirje.name === "Thumbs.db" || kirje.name === "JUHEND.txt") continue;
    const tee = join(kaust, kirje.name);
    if (kirje.isDirectory()) {
      nimekiri.push(...koguFailid(tee, baas));
    } else if (kirje.isFile()) {
      nimekiri.push({
        tee,
        sisemine: relative(baas, tee).split(sep).join("/"),
      });
    }
  }
  return nimekiri;
}

function malliKirjed(kaustaNimi) {
  const kaust = join(mallideKaust, kaustaNimi);
  const failid = koguFailid(kaust);
  const kirjed = failid
    .sort((a, b) => a.sisemine.localeCompare(b.sisemine))
    .map((fail) => ({
      nimi: `${kaustaNimi}/${fail.sisemine}`,
      andmed: readFileSync(fail.tee),
      aeg: statSync(fail.tee).mtimeMs,
    }));

  kirjed.push({
    nimi: `${kaustaNimi}/JUHEND.txt`,
    andmed: Buffer.from(JUHEND(NIMED[kaustaNimi] ?? kaustaNimi), "utf8"),
    aeg: Date.now(),
  });

  return kirjed;
}

/* ---------- Töö ---------- */

mkdirSync(zipKaust, { recursive: true });

const mallid = readdirSync(mallideKaust, { withFileTypes: true })
  .filter((kirje) => kirje.isDirectory() && !kirje.name.startsWith("."))
  .map((kirje) => kirje.name)
  .sort();

const koik = [];

for (const nimi of mallid) {
  const kirjed = malliKirjed(nimi);
  const puhver = teeZip(kirjed);
  const fail = join(zipKaust, `mall-${nimi}.zip`);
  writeFileSync(fail, puhver);
  koik.push(...kirjed);
  console.log(`${(puhver.length / 1024 / 1024).toFixed(2)} MB  zip/mall-${nimi}.zip  (${kirjed.length} faili)`);
}

const koikPuhver = teeZip(koik);
writeFileSync(join(zipKaust, "koik-mallid.zip"), koikPuhver);
console.log(`${(koikPuhver.length / 1024 / 1024).toFixed(2)} MB  zip/koik-mallid.zip  (${koik.length} faili)`);
console.log("Valmis.");
