# Městská Trasa — auto hra

Jednoduchá, ale vizuálně výrazná browser hra v HTML5 Canvas.

## Spuštění hned teď

Pokud si ji chceš hned vyzkoušet lokálně, stačí v kořeni projektu spustit:

```bash
./play-local.sh
```

Pak otevři:

- `http://127.0.0.1:8000/`

Nebo bez skriptu:

```bash
python -m http.server 8000
```

## Náhled online (GitHub Pages)

Po pushi se hra automaticky nasadí přes workflow v `.github/workflows/deploy-pages.yml`.
Typická URL je:

- `https://<tvůj-uživatel>.github.io/skills-introduction-to-github/`

## Jak hrát

1. Otevři `index.html` v prohlížeči (nebo lokální server podle návodu výše).
2. Jeď autem po vyznačené trase mezi ulicemi města.
3. Projeď všechny checkpointy a dojeď do cíle bez vyjetí mimo silnici.

### Ovládání

- `↑` / `W` — plyn
- `↓` / `S` — brzda / couvání
- `←` / `→` / `A` / `D` — zatáčení
- `R` — restart hry

## Herní prvky

- Stylizované město a silnice s vodicí čárou.
- Checkpointy s průběžným skórováním.
- HUD se stavem hry, rychlostí a skóre.
- Kolize při vyjetí z povolené trasy.
