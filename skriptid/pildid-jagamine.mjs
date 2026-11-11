#!/usr/bin/env node
/**
 * Piltide jagamine mallide vahel.
 *
 * Kasutus:  node skriptid/pildid-jagamine.mjs
 *
 * Iga mall saab oma pildid pildipangast (pildid/) nii, et ükski foto ei
 * kordu kahes mallis. Failid kopeeritakse mallile uue nimega (pildipanga
 * failinimi) ja viited index.html / stiil.css failides uuendatakse.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const juur = fileURLToPath(new URL("..", import.meta.url));

/** mall -> [vana failinimi, pildipanga tee] */
const PLAAN = {
  ajakiri: [
    ["sadam-kraanad.jpg", "pildid/inimesed-ja-kohad/sadam.jpg"],
    ["autonaitus.jpg", "pildid/autod/automess.jpg"],
    ["metsas-oo.jpg", "pildid/loodus/raba-puud.jpg"],
  ],
  bento: [
    ["roosa-bmw.jpg", "pildid/autod/roosad-bmw-d.jpg"],
    ["skyline.jpg", "pildid/autod/hobedane-skyline.jpg"],
    ["viper.jpg", "pildid/autod/punane-sportauto.jpg"],
    ["ferrari.jpg", "pildid/autod/punane-ferrari.jpg"],
    ["punane-mini.jpg", "pildid/autod/punane-mini.jpg"],
    ["sinine-ralliauto.jpg", "pildid/autod/sinine-ralliauto.jpg"],
    ["must-auto-lumes.jpg", "pildid/autod/must-auto-lumes.jpg"],
    ["hobedane-klassikaline.jpg", "pildid/autod/hobedane-klassikaline.jpg"],
  ],
  fotoportfoolio: [
    ["juga.jpg", "pildid/loodus/juga.jpg"],
    ["maantee-droon.jpg", "pildid/loodus/maantee-droon.jpg"],
    ["ookull.jpg", "pildid/linnud/ookull-oksal.jpg"],
    ["raba-hommik.jpg", "pildid/loodus/raba-droon.jpg"],
    ["sugismets-droon.jpg", "pildid/loodus/sugismets-droon.jpg"],
  ],
  kohvik: [
    ["lilled.jpg", "pildid/taimed/roosa-lill-mesilasega.jpg"],
    ["mesinik.jpg", "pildid/putukad/mesilased-lahedalt.jpg"],
    ["vaarikas.jpg", "pildid/taimed/vaarikas.jpg"],
  ],
  kollaaz: [
    ["klassikaline-auto.jpg", "pildid/autod/klassikaline-auto.jpg"],
    ["mesinik-rohus.jpg", "pildid/taimed/sugislehed.jpg"],
    ["paat-merel.jpg", "pildid/soidukid/mootorpaat.jpg"],
  ],
  "neon-retro": [
    ["bensiinijaam-oo.jpg", "pildid/inimesed-ja-kohad/bensiinijaam-oo.jpg"],
    ["ilutulestik.jpg", "pildid/loodus/ilutulestik.jpg"],
    ["mootorratas-liikumises.jpg", "pildid/soidukid/mootorratas.jpg"],
  ],
  "pastelne-paevik": [
    ["kass-portree.jpg", "pildid/loomad/kass-portree.jpg"],
    ["kass-valgel.jpg", "pildid/loomad/kass-must-valgel.jpg"],
    ["ookull-oksal.jpg", "pildid/linnud/vaike-lind.jpg"],
    ["rebane-heinamaal.jpg", "pildid/loomad/rebane-heinamaal.jpg"],
    ["tuhkur-lahedalt.jpg", "pildid/loomad/tuhkur-lahedalt.jpg"],
  ],
  pood: [
    ["lilled.jpg", "pildid/taimed/lill-pall.jpg"],
    ["mesi.jpg", "pildid/inimesed-ja-kohad/mesinik-rohus.jpg"],
    ["mesilased.jpg", "pildid/putukad/mesilased-tarul.jpg"],
    ["mets.jpg", "pildid/loodus/seen-samblal.jpg"],
    ["pihlakas.jpg", "pildid/taimed/pihlakamarjad.jpg"],
    ["seened.jpg", "pildid/loodus/seened.jpg"],
    ["vaarikas.jpg", "pildid/taimed/kummelid.jpg"],
  ],
  matkapaevik: [
    ["merepromenaad.jpg", "pildid/loodus/merepromenaad.jpg"],
    ["inimene-metsas.jpg", "pildid/inimesed-ja-kohad/inimene-metsas.jpg"],
    ["jalgratturid.jpg", "pildid/inimesed-ja-kohad/jalgratturid.jpg"],
    ["kivised-astmed.jpg", "pildid/inimesed-ja-kohad/kivised-astmed.jpg"],
    ["lehmad-karjamaal.jpg", "pildid/loomad/lehmad-karjamaal.jpg"],
    ["valged-lilled.jpg", "pildid/taimed/valged-lilled.jpg"],
  ],
  terminal: [
    ["kopter-taevas.jpg", "pildid/soidukid/kopter-taevas.jpg"],
    ["lennuk-siluett.jpg", "pildid/soidukid/lennuk-siluett.jpg"],
    ["kabel.jpg", "pildid/inimesed-ja-kohad/kabel.jpg"],
    ["tuhi-maantee.jpg", "pildid/loodus/tuhi-maantee.jpg"],
  ],
};

const kasutatud = new Set();
let vigu = 0;

for (const [mall, kirjed] of Object.entries(PLAAN)) {
  const kaust = join(juur, "mallid", mall);
  if (!existsSync(kaust)) {
    console.log(`PUUDU: mallid/${mall} – jätan vahele`);
    continue;
  }

  const pildiKaust = join(kaust, "pildid");
  mkdirSync(pildiKaust, { recursive: true });
  const vanadNimed = readdirSync(existsSync(pildiKaust) ? pildiKaust : kaust).filter((n) => /\.(jpg|jpeg|png|webp)$/i.test(n));

  let html = readFileSync(join(kaust, "index.html"), "utf8");
  let cssTee = join(kaust, "stiil.css");
  let css = existsSync(cssTee) ? readFileSync(cssTee, "utf8") : "";

  for (const [vana, allikas] of kirjed) {
    const allikaTee = join(juur, allikas);
    const uusNimi = allikas.split("/").pop();

    if (!existsSync(allikaTee)) {
      console.log(`  VIGA: ${allikas} puudub`);
      vigu += 1;
      continue;
    }
    if (kasutatud.has(uusNimi)) {
      console.log(`  VIGA: ${uusNimi} on juba kasutusel`);
      vigu += 1;
      continue;
    }
    kasutatud.add(uusNimi);

    copyFileSync(allikaTee, join(pildiKaust, uusNimi));

    if (vana !== uusNimi) {
      html = html.split(`pildid/${vana}`).join(`pildid/${uusNimi}`);
      css = css.split(`pildid/${vana}`).join(`pildid/${uusNimi}`);
    }
  }

  // eemalda failid, mida enam ei viidata
  for (const nimi of vanadNimed) {
    if (!kirjed.some(([, allikas]) => allikas.endsWith(`/${nimi}`))) {
      unlinkSync(join(pildiKaust, nimi));
    }
  }

  writeFileSync(join(kaust, "index.html"), html, "utf8");
  if (css) writeFileSync(cssTee, css, "utf8");

  console.log(`${mall}: ${kirjed.length} pilti`);
}

console.log(`Kokku kasutusel ${kasutatud.size} unikaalset fotot, vigu ${vigu}.`);
