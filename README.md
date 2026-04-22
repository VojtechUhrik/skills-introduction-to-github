# Snake Mobile (lokální hra)

Jednoduchá, ale vizuálně vyladěná hra Snake optimalizovaná pro mobil.

## Spuštění lokálně

V kořeni projektu spusť:

```bash
python3 -m http.server 8000
```

Pak otevři v prohlížeči:

- na tomto zařízení: `http://localhost:8000`
- na mobilu ve stejné Wi‑Fi: `http://IP_ADRESA_POČÍTAČE:8000`

> Tip: IP adresu zjistíš například přes `hostname -I` (Linux) nebo `ipconfig` (Windows).

## Ovládání

- Tahem (swipe) po herní ploše.
- Nebo tlačítky šipek pod herní plochou.
- Na desktopu můžeš použít i klávesy šipek.

## Herní prvky

- Zelený had.
- Obdélníková herní plocha vhodná pro displej mobilu.
- Světelné efekty, jemná mřížka, částice po sebrání krmiva.
- Ukládání rekordu do `localStorage`.
