// ============================================================
// METSAÄÄRE POOD – skript.js
// See fail teeb ainult ühe väikese asja: kui vajutad „Lisa korvi“,
// suureneb korvis olev number ja ilmub korraks teade.
//
// See EI saada andmeid kuhugi ega võta raha. Tegemist on näidisega.
// Õige veebipoe jaoks on vaja serverit (nt WordPress + WooCommerce).
// ============================================================

// Leiame lehelt korvi numbri ja teate kasti
const korviNumber = document.getElementById("korvi-arv");
const teavitus = document.getElementById("teavitus");

// Mitu asja on „korvis“
let mitu = 0;

// Anname kõigile „Lisa korvi“ nuppudele käsu
document.querySelectorAll(".lisa").forEach(function (nupp) {
  nupp.addEventListener("click", function () {
    // 1. Suurendame numbrit
    mitu = mitu + 1;
    korviNumber.textContent = mitu;

    // 2. Näitame teadet. Toote nimi tuleb HTML-ist (data-nimi).
    teavitus.textContent = nupp.dataset.nimi + " lisatud korvi ✓";
    teavitus.classList.add("on");

    // 3. Peidame teate 2 sekundi pärast
    window.clearTimeout(window.teateTaimer);
    window.teateTaimer = window.setTimeout(function () {
      teavitus.classList.remove("on");
    }, 2000);
  });
});
