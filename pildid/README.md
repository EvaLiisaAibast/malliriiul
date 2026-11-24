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
| [`kaunistus/`](kaunistus/) | lehtede kaunistused Wikimedia Commonsist ja Internet Archive'ist (avalik omand) | 6 |

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

## Kaunistused

`kaunistus/` on mõeldud lehtede ilustamiseks, mitte mallide sisuks. Kõik on
avalikus omandis.

Wikimedia Commons:

| Fail | Sisu | Allikas |
| --- | --- | --- |
| `trukikoda-1897.jpg` | Kamehameha poiste trükikoda, 1897 | [Commons](https://commons.wikimedia.org/wiki/File:Kamehameha_School_for_Boys_Print_Shop,_1897.jpg) |
| `kirjatahed-1857.jpg` | Prantsuse kirjatähtede kast, 1857 | [Commons](https://commons.wikimedia.org/wiki/File:Casse_fran%C3%A7aise_-_1857.jpg) |
| `kodak-brownie-1905.jpg` | Kodaki Brownie kuulutus, 1905 | [Commons](https://commons.wikimedia.org/wiki/File:Brownie_Camera_(1905)_(ADVERT_428).jpeg) |

Internet Archive (skaneeritud raamatulehed):

| Fail | Sisu | Allikas |
| --- | --- | --- |
| `arhiiv-tyybid-1912.jpg` | Kirjatüüpide näidiseleht, American specimen book of type styles, 1912, lk 209 | [archive.org](https://archive.org/details/americanspecimen00amer) |
| `arhiiv-kapiteelid-1900.jpg` | G. E. Walteri kataloog, kapiteelid, 1900, lk 9 | [archive.org](https://archive.org/details/catalogofcapital00gewa) |
| `arhiiv-ornament-1892.jpg` | Meyeri „Handbook of Ornament“, plaat 14 (oblong ja selle jaotus), 1892 | [archive.org](https://archive.org/details/handbookoforname00meyerich) |
