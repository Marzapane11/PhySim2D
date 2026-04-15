# Simulatore Forze e Vettori — Stato del Progetto

**Ultima modifica:** 2026-04-12
**Versione:** 1.0 Beta
**Sviluppatore:** Mataro M.
**Target:** Studente italiano di prima superiore (liceo scientifico scienze applicate) del Liceo Enrico Medi, Cicciano

## Panoramica

App desktop Electron che simula forze e vettori 2D con canvas ortografica Three.js. Pensata per studiare il programma di fisica del Liceo Medi (Mod. 0 Grandezze, Mod. 1 Vettori e Forze, Mod. 2 Equilibrio).

Il simulatore e gia funzionante — questo documento descrive lo stato corrente per permettere a un'altra AI di continuare il lavoro.

## Stack tecnico

- **Electron** (app desktop)
- **Vite** (build e dev server)
- **Three.js** (rendering 2D con OrthographicCamera)
- **Vitest + jsdom** (test)
- **JavaScript vanilla** (niente framework UI)
- **CSS custom properties** (temi chiaro/scuro)

## Struttura dei file

```
src/
├── main.js                          # Entry point, registra le route
├── router.js                        # Router hash-based
├── state.js                         # Stato globale (tema, visibilita)
├── styles/
│   ├── variables.css                # Variabili CSS per i temi
│   ├── global.css                   # Reset e stili base
│   ├── sidebar.css                  # Sidebar
│   ├── simulator.css                # Layout simulatori
│   └── theory.css                   # Pagine teoria
├── components/
│   ├── sidebar.js                   # Navigazione laterale
│   ├── home.js                      # Home page
│   ├── settings.js                  # Pagina impostazioni (tema)
│   ├── mod0-page.js                 # Mod. 0 - Grandezze fisiche
│   ├── mod1-page.js                 # Mod. 1 - Tab Vettori/Forze
│   └── mod2-page.js                 # Mod. 2 - Equilibrio (teoria)
├── simulator/
│   ├── scene-manager.js             # Setup Three.js (OrthographicCamera, zoom, pan)
│   ├── grid.js                      # Griglia e assi
│   ├── vector-renderer.js           # Frecce 2D + scaleForceVector + linee componenti
│   ├── label-renderer.js            # Label HTML overlay
│   ├── toolbar.js                   # Toolbar generica
│   ├── properties-panel.js          # Helpers pannello destro
│   ├── visibility-menu.js           # Menu toggle visibilita
│   ├── simulator-layout.js          # Layout (canvas + toolbar + panel) + fullscreen
│   ├── dynamic-solver.js            # Risolutore dinamico generico
│   ├── dynamic-panel.js             # UI per parametri dinamici (input/output toggle)
│   ├── vectors/
│   │   └── vectors-page.js          # Pagina Vettori (crea, somma, differenza, scomponi)
│   └── forces/
│       ├── forces-page.js           # Pagina Forze (3 scenari)
│       ├── physics.js               # Logica di fisica pura e testabile
│       └── scenarios/
│           ├── inclined-plane.js    # Piano e piano inclinato
│           ├── spring.js            # Molla su piano inclinato
│           ├── pulley.js            # Carrucola
│           └── point-forces.js      # (mantenuto per test, non usato)
├── theory/
│   ├── theory-page.js               # Pagina Teoria
│   ├── theory-data.js               # Contenuto teoria (14 argomenti)
│   └── contextual-tip.js            # Tip contestuale
└── math/
    ├── vector-math.js               # Operazioni vettoriali
    └── force-math.js                # Formule fisica

tests/
├── math/                            # Test matematica base
├── physics/                         # Test fisica piano inclinato/molla + integrazione
└── scenarios/                       # Test legacy scenari
```

**88 test passano** (vitest + jsdom).

## Funzionalita principali

### Navigazione
- **Sidebar**: Home, Mod. 0, Mod. 1, Mod. 2, Teoria, Impostazioni
- **Tema**: Scuro (default) / Chiaro con switch dinamico

### Mod. 1 — Vettori
- Tool: Crea vettore, Somma, Differenza, Scomponi
- Ogni vettore ha il suo **solver dinamico** (X, Y, modulo, direzione — qualsiasi combinazione di 2 input calcola gli altri)
- Linee tratteggiate per scomposizione come nei libri di testo

### Mod. 1 — Forze (3 scenari)

#### Piano e Piano inclinato
- Triangolo con vertici A, B, C, altezza h, base b, ipotenusa l (corsivo), angolo α
- **Quando α=0** diventa piano piatto (nasconde C, h, l, α, Px, Py)
- Parametri dinamici: m, α, μ, l, h, b, P, Px, Py, N, Fa, Fris
- **Forze personalizzate** (F1, F2, ...): modulo e angolo relativo a Px
- Fris mostra stato: **Equilibrio / Scivola giu / Sale**
- Attrito statico corretto (si adatta fino a Fa_max)
- Forze perpendicolari modificano N e quindi l'attrito max

#### Molla (Hooke) su piano inclinato
- Stessa geometria del piano inclinato + muro in cima + molla sinusoidale
- Parametri dinamici: m, α, μ, l, h, b, k, Δx, P, Px, N, Fa, Fe
- **Δx in output** → si aggiorna per equilibrio con forze personalizzate
- Forze personalizzate come nel piano inclinato

#### Carrucola (Atwood)
- Due masse m₁, m₂, tensione T, accelerazione a
- Parametri dinamici: m₁, m₂, P₁, P₂, a, T

### Mod. 0 — Grandezze Fisiche (pagina teoria)
Tabelle S.I., grandezze derivate, misure, errori, proporzionalita.

### Mod. 2 — Equilibrio (pagina teoria)
Equilibrio punto materiale, piano inclinato, momento forza, corpo rigido, baricentro, fluidi (pressione, Pascal, Stevino, Archimede).

### Teoria (14 argomenti)
Vettori: basics, modulo, somma, scomposizione, moltiplicazione scalare.
Forze: basics, peso, normale, Hooke, attrito, piano inclinato, tensione, equilibrio, forze su un punto.

### Impostazioni
- Tema Scuro/Chiaro
- Info: v1.0 Beta, Liceo Enrico Medi, Sviluppatore Mataro M., lista funzionalita

## Concetti chiave

### Solver Dinamico (`dynamic-solver.js`)
Ogni scenario definisce variabili con `mode: 'input' | 'output'` e una funzione `solve(vals, inputIds)`. L'utente puo cliccare il pallino (● input / ○ output) per cambiare modalita. Il solver calcola gli output dagli input usando formule dirette e inverse. Supporta `visibleIf(vals)` per nascondere variabili.

### Funzione `computeInclinedPlaneState` (`physics.js`)
Calcola lo stato fisico REALE considerando:
1. Proiezione delle forze personalizzate su slope e normale (custom angle relativo a Px)
2. Normale totale N = P·cos(α) − fcNormal (forze che spingono via dalla superficie riducono N)
3. Attrito statico se |net| ≤ μN, altrimenti cinetico

### Funzione `computeSpringEquilibriumDx` (`physics.js`)
Calcola Δx di equilibrio: (Px − fcSlope) / k. Quando Δx e in output mode, viene aggiornato via `updateSpringEquilibrium` nel postSolve hook.

### postSolve hook (`dynamic-panel.js`)
`renderDynamicPanel(solver, onChange, { postSolve })` — il callback viene chiamato dopo solver.solve() ma prima del rendering HTML, per permettere override dei valori.

### Scala forze logaritmica con cap (`vector-renderer.js`)
`scaleForceVector(fx, fy)` usa `log(1 + magnitude) * 0.35` con minimo 0.35 e massimo 4.0. Permette a forze grandi e piccole di essere visibili senza esplodere.

### Forze personalizzate
Angolo **relativo a Px** (direzione down-slope sul piano inclinato):
- 0° = giu lungo il piano
- 90° = perpendicolare in fuori (come N)
- 180° = su lungo il piano (come Fa)
- 270° = dentro la superficie

World angle = customAngle − α.

## Comandi utili

```bash
npm run dev              # Avvia Vite + Electron
npm run build            # Build di produzione
npx vitest run           # Esegui tutti i test
npx vite build           # Build renderer
npx vitest run --watch   # Test in watch mode
```

## Server di sviluppo

Il server Vite gira su `http://192.168.1.32:5173`. Dopo modifiche, l'hot-reload aggiorna l'app automaticamente.

## Archivio documenti

- `docs/superpowers/specs/` — Specifica originale
- `docs/superpowers/plans/` — Piano di implementazione iniziale
- `docs/STATO-PROGETTO.md` — Questo documento
