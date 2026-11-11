# Pildipank

85 töötoa fotot, kategoriseeritud kaustadesse. Need on veebi jaoks
optimeeritud koopiad (pikem külg kuni 1400 px, JPEG). Originaalfailid jäävad
USB-le või arhiivi.

| Kaust | Sisu | Pilte |
| --- | --- | --- |
| [`loomad/`](loomad/) | kassid, tuhkur, rebane, sisalikud, madu, lehmad | 9 |
| [`linnud/`](linnud/) | öökull, vares, väikelind, röövlind | 4 |
| [`putukad/`](putukad/) | liblikad, mesilased, mardikad, ämblikud | 15 |
| [`taimed/`](taimed/) | lilled, marjad, sügislehed | 9 |
| [`loodus/`](loodus/) | maastikud, raba, juga, seened, taevas | 11 |
| [`autod/`](autod/) | sõiduautod, klassikud, ralliautod | 13 |
| [`soidukid/`](soidukid/) | lennukid, kopter, paat, mootorratas, veoautod | 9 |
| [`inimesed-ja-kohad/`](inimesed-ja-kohad/) | inimesed, hooned, tänavad, sadam, mesinik | 15 |

## Kuidas kasutada

**Mallis.** Kopeeri sobiv fail malli enda `pildid/` kausta ja viita sellele:

```html
<img src="pildid/kass-portree.jpg" alt="Kass vaatab kaamerasse">
```

**Pildiserveris.** Kopeeri kategooriad serveri juurkausta (näiteks
`/var/www/pildid`) ja kasuta aadressi:

```html
<img src="http://pildid.local/loomad/kass-portree.jpg" alt="Kass">
```

Failinimed on väiketähtedega ja ilma tühikuteta, et need töötaksid igas
süsteemis. Uusi pilte võib kaustadesse juurde lisada; hoia need mõistliku
suurusega (pikem külg umbes 1400–1600 px, alla 1 MB).

Algfailide ja uute nimede vastavus on failis [`kaardistus.tsv`](kaardistus.tsv).
