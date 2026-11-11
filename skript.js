/* ==========================================================================
   MALLIRIIUL – galerii loogika
   1. Eelvaate-iframe'ide skaleerimine
   2. Mallide filtreerimine
   3. Eelvaate modaal (lauaarvuti / telefoni vaade)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. EELVAADETE SKALEERIMINE
     Iframe on 1280 px lai, aga kaart on väiksem. Seetõttu vähendame
     iframe'i CSS-transformiga ja lõikame ülejäänud kõrguse ära.
     ------------------------------------------------------------------ */

  function skaleeri(kast) {
    const aken = kast.querySelector("iframe");
    if (!aken) return;

    const laius = kast.clientWidth;
    if (!laius) return;

    const tegur = laius / 1280;
    aken.style.transform = "scale(" + tegur + ")";
    aken.style.height = Math.ceil(kast.clientHeight / tegur) + "px";
  }

  const eelvaated = Array.from(document.querySelectorAll(".kaader, .leht"));

  if ("ResizeObserver" in window) {
    const vaatleja = new ResizeObserver(function (kirjed) {
      kirjed.forEach(function (kirje) {
        skaleeri(kirje.target);
      });
    });

    eelvaated.forEach(function (kast) {
      skaleeri(kast);
      vaatleja.observe(kast);
    });
  } else {
    // Vanemate brauserite tagavaravariant
    eelvaated.forEach(skaleeri);
    window.addEventListener("resize", function () {
      eelvaated.forEach(skaleeri);
    });
  }

  window.addEventListener("load", function () {
    eelvaated.forEach(skaleeri);
  });

  /* ------------------------------------------------------------------
     2. FILTREERIMINE
     Iga kaardi küljes on data-tags="manguline retro" jne.
     ------------------------------------------------------------------ */

  const filtrinupud = Array.from(document.querySelectorAll(".filtreeri"));
  const kaardid = Array.from(document.querySelectorAll(".mall"));
  const tuhiTulemus = document.querySelector(".tuhi-tulemus");

  filtrinupud.forEach(function (nupp) {
    nupp.addEventListener("click", function () {
      const filter = nupp.dataset.filter;

      filtrinupud.forEach(function (teine) {
        const aktiivne = teine === nupp;
        teine.classList.toggle("on-aktiivne", aktiivne);
        teine.setAttribute("aria-pressed", String(aktiivne));
      });

      let nähtavaid = 0;

      kaardid.forEach(function (kaart) {
        const sildid = (kaart.dataset.tags || "").split(" ");
        const sobib = filter === "koik" || sildid.indexOf(filter) !== -1;
        kaart.classList.toggle("on-peidetud", !sobib);
        if (sobib) nähtavaid += 1;
      });

      if (tuhiTulemus) {
        tuhiTulemus.hidden = nähtavaid > 0;
      }

      // Pärast kuvamist arvutame laiuse uuesti (nt kitsal ekraanil)
      requestAnimationFrame(function () {
        kaardid.forEach(function (kaart) {
          if (kaart.classList.contains("on-peidetud")) return;
          const kast = kaart.querySelector(".kaader");
          if (kast) skaleeri(kast);
        });
      });
    });
  });

  /* ------------------------------------------------------------------
     3. EELVAATE MODAAL
     ------------------------------------------------------------------ */

  const modaal = document.getElementById("modaal");
  const modaalAken = document.getElementById("modaal-aken");
  const modaalIframe = document.getElementById("modaal-iframe");
  const modaalPealkiri = document.getElementById("modaal-pealkiri");
  const modaalZip = document.getElementById("modaal-zip");
  const sulgemisnupud = Array.from(document.querySelectorAll("[data-sulge]"));
  const vaatenupud = Array.from(document.querySelectorAll(".vaade"));
  const leheosad = Array.from(document.querySelectorAll(".pais, main, .jalus"));

  let viimaneFookus = null;

  function valiVaade(vaade) {
    if (!modaalAken) return;

    modaalAken.classList.toggle("on-mobiil", vaade === "mobiil");

    vaatenupud.forEach(function (nupp) {
      const aktiivne = nupp.dataset.vaade === vaade;
      nupp.classList.toggle("on-aktiivne", aktiivne);
      nupp.setAttribute("aria-pressed", String(aktiivne));
    });
  }

  function avaModaal(nupp) {
    if (!modaal || !modaalIframe) return;

    viimaneFookus = document.activeElement;

    modaalPealkiri.textContent = nupp.dataset.pealkiri || "Malli eelvaade";
    modaalIframe.title = (nupp.dataset.pealkiri || "Mall") + " – eelvaade";
    modaalIframe.src = nupp.dataset.ava;
    modaalZip.href = nupp.dataset.zip || "#";

    modaal.hidden = false;
    document.body.classList.add("modaal-avatud");
    leheosad.forEach(function (osa) {
      osa.inert = true;
    });

    valiVaade("desktop");

    const sulge = modaal.querySelector(".modaal__sulge");
    if (sulge) sulge.focus();
  }

  function sulgeModaal() {
    if (!modaal || modaal.hidden) return;

    modaal.hidden = true;
    document.body.classList.remove("modaal-avatud");
    modaalIframe.src = "about:blank";

    leheosad.forEach(function (osa) {
      osa.inert = false;
    });

    if (viimaneFookus && typeof viimaneFookus.focus === "function") {
      viimaneFookus.focus();
    }
  }

  document.querySelectorAll("[data-ava]").forEach(function (nupp) {
    nupp.addEventListener("click", function () {
      avaModaal(nupp);
    });
  });

  sulgemisnupud.forEach(function (nupp) {
    nupp.addEventListener("click", sulgeModaal);
  });

  vaatenupud.forEach(function (nupp) {
    nupp.addEventListener("click", function () {
      valiVaade(nupp.dataset.vaade);
    });
  });

  document.addEventListener("keydown", function (sündmus) {
    if (sündmus.key === "Escape") sulgeModaal();
  });
})();
