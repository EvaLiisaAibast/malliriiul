/* Pildipank – otsing, kategooriafilter ja tee kopeerimine. */

(function () {
  const otsing = document.getElementById("pildi-otsing");
  const loendur = document.getElementById("pildi-loendur");
  const tuhi = document.getElementById("pildi-tuhi");
  const kopeeriKoik = document.getElementById("kopeeri-koik");
  const kaardid = Array.from(document.querySelectorAll(".pilt"));
  const filtrid = Array.from(document.querySelectorAll(".filtreeri"));

  let valitudKategooria = "koik";

  function naitaKaarte() {
    const otsingusona = (otsing.value || "").trim().toLowerCase();
    let loend = 0;

    kaardid.forEach(function (kaart) {
      const kategooria = kaart.dataset.kategooria;
      const nimi = kaart.dataset.nimi;
      const sobibKategooria = valitudKategooria === "koik" || kategooria === valitudKategooria;
      const sobibTekst =
        !otsingusona || nimi.indexOf(otsingusona) !== -1 || kategooria.indexOf(otsingusona) !== -1;
      const naitame = sobibKategooria && sobibTekst;

      kaart.hidden = !naitame;
      if (naitame) loend += 1;
    });

    loendur.textContent = loend === 1 ? "1 pilt" : loend + " pilti";
    tuhi.hidden = loend !== 0;
  }

  function kopeeri(tekst) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(tekst);
    }

    return new Promise(function (lahenda, katkesta) {
      const abi = document.createElement("textarea");
      abi.value = tekst;
      abi.setAttribute("readonly", "");
      abi.style.position = "fixed";
      abi.style.opacity = "0";
      document.body.appendChild(abi);
      abi.select();

      try {
        document.execCommand("copy") ? lahenda() : katkesta(new Error("kopeerimine ebaõnnestus"));
      } catch (viga) {
        katkesta(viga);
      } finally {
        abi.remove();
      }
    });
  }

  function teata(nupp, tekst) {
    const algne = nupp.dataset.algne || nupp.textContent;
    nupp.dataset.algne = algne;
    nupp.textContent = tekst;
    nupp.classList.add("on-kopeeritud");

    window.setTimeout(function () {
      nupp.textContent = algne;
      nupp.classList.remove("on-kopeeritud");
    }, 1500);
  }

  kaardid.forEach(function (kaart) {
    const nupp = kaart.querySelector(".pilt__kopeeri");
    if (!nupp) return;

    nupp.addEventListener("click", function () {
      kopeeri(nupp.dataset.tee)
        .then(function () {
          teata(nupp, "Kopeeritud ✓");
        })
        .catch(function () {
          teata(nupp, "Tee käsitsi");
        });
    });
  });

  filtrid.forEach(function (nupp) {
    nupp.addEventListener("click", function () {
      valitudKategooria = nupp.dataset.filter;
      filtrid.forEach(function (teine) {
        const aktiivne = teine === nupp;
        teine.classList.toggle("on-aktiivne", aktiivne);
        teine.setAttribute("aria-pressed", aktiivne ? "true" : "false");
      });
      naitaKaarte();
    });
  });

  if (otsing) {
    otsing.addEventListener("input", naitaKaarte);
  }

  if (kopeeriKoik) {
    kopeeriKoik.addEventListener("click", function () {
      const teed = kaardid
        .filter(function (kaart) {
          return !kaart.hidden;
        })
        .map(function (kaart) {
          return kaart.querySelector(".pilt__tee").textContent;
        });

      if (!teed.length) return;

      kopeeri(teed.join("\n"))
        .then(function () {
          teata(kopeeriKoik, "Kopeeritud ✓");
        })
        .catch(function () {
          teata(kopeeriKoik, "Ei õnnestunud");
        });
    });
  }

  naitaKaarte();
})();
