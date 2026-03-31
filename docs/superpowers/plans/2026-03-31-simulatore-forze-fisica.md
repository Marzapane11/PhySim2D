# Simulatore Forze e Vettori — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop Windows app to simulate 2D forces and vectors with a rotatable 3D view, plus an integrated theory section, for first-year physics students.

**Architecture:** Electron desktop shell wrapping a Vite-bundled vanilla JS frontend. Three.js renders the 3D canvas with OrbitControls for rotation. Pure math modules handle all physics calculations (no AI). A simple hash router switches between Home, Vectors, Forces, Theory, and Settings pages. CSS custom properties power dark/light theming.

**Tech Stack:** Electron, Vite, Three.js, Vitest, vanilla JavaScript (ES modules), CSS custom properties, electron-builder (Windows packaging)

---

## File Structure

```
Simulatore-Forze-Fisica/
├── package.json
├── vite.config.js
├── vitest.config.js
├── electron/
│   ├── main.js                  # Electron main process
│   └── preload.js               # Context bridge
├── index.html                   # Entry HTML
├── src/
│   ├── main.js                  # Renderer entry, router init
│   ├── router.js                # Hash-based router
│   ├── state.js                 # Global state (theme, visibility)
│   ├── styles/
│   │   ├── variables.css        # CSS custom properties (themes)
│   │   ├── global.css           # Reset, base styles
│   │   ├── sidebar.css          # Sidebar navigation
│   │   ├── simulator.css        # Simulator layout (canvas, panels)
│   │   └── theory.css           # Theory pages
│   ├── components/
│   │   ├── sidebar.js           # Sidebar navigation component
│   │   ├── home.js              # Home page
│   │   └── settings.js          # Settings page (theme toggle)
│   ├── simulator/
│   │   ├── scene-manager.js     # Three.js scene, camera, controls
│   │   ├── grid.js              # Grid + axes overlay
│   │   ├── vector-renderer.js   # Draw vector arrows in 3D
│   │   ├── label-renderer.js    # CSS2D labels for names/values
│   │   ├── properties-panel.js  # Right panel: properties + calcs
│   │   ├── visibility-menu.js   # Toggle visibility of elements
│   │   ├── toolbar.js           # Bottom toolbar
│   │   ├── simulator-layout.js  # Shared layout (canvas+panel+toolbar)
│   │   ├── vectors/
│   │   │   └── vectors-page.js  # Vectors simulator page + tools
│   │   └── forces/
│   │       ├── forces-page.js   # Forces simulator page + scenario picker
│   │       └── scenarios/
│   │           ├── point-forces.js
│   │           ├── inclined-plane.js
│   │           ├── spring.js
│   │           ├── friction.js
│   │           ├── equilibrium.js
│   │           └── pulley.js
│   ├── math/
│   │   ├── vector-math.js       # Vector operations (pure functions)
│   │   └── force-math.js        # Force calculations (pure functions)
│   └── theory/
│       ├── theory-page.js       # Theory browsing page
│       ├── theory-data.js       # All theory content (structured data)
│       └── contextual-tip.js    # Contextual theory box component
├── tests/
│   ├── math/
│   │   ├── vector-math.test.js
│   │   └── force-math.test.js
│   └── scenarios/
│       ├── point-forces.test.js
│       ├── inclined-plane.test.js
│       ├── spring.test.js
│       ├── friction.test.js
│       ├── equilibrium.test.js
│       └── pulley.test.js
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-03-31-simulatore-forze-fisica-design.md
        └── plans/
            └── 2026-03-31-simulatore-forze-fisica.md
```

---

## Task 1: Project Scaffolding & Electron Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `electron/main.js`
- Create: `electron/preload.js`
- Create: `index.html`
- Create: `src/main.js`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "simulatore-forze-fisica",
  "version": "1.0.0",
  "description": "Simulatore 2D di forze e vettori con visuale 3D per studenti di prima superiore",
  "main": "electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"sleep 2 && electron .\"",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "package": "vite build && electron-builder --win"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "build": {
    "appId": "com.simulatore.forze-fisica",
    "productName": "Simulatore Forze e Vettori",
    "win": {
      "target": "nsis"
    },
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ]
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 4: Create electron/main.js**

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'src', 'assets', 'icon.png'),
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
```

- [ ] **Step 5: Create electron/preload.js**

```js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
```

- [ ] **Step 6: Create index.html**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simulatore Forze e Vettori</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 7: Create src/main.js (minimal entry)**

```js
const app = document.getElementById('app');
app.textContent = 'Simulatore Forze e Vettori — Caricamento...';
```

- [ ] **Step 8: Install dependencies and verify Electron launches**

Run:
```bash
cd /home/user/code-server/Simulatore-Forze-Fisica
npm install
```

Expected: `node_modules` created, no errors.

Then verify vite builds:
```bash
npx vite build
```

Expected: `dist/` folder created with bundled files.

- [ ] **Step 9: Commit**

```bash
git init
git add package.json vite.config.js vitest.config.js electron/ index.html src/main.js
git commit -m "feat: project scaffolding with Electron + Vite + Three.js"
```

---

## Task 2: Theme System & Global Styles

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/global.css`
- Modify: `index.html` (add stylesheet)

- [ ] **Step 1: Create src/styles/variables.css**

```css
:root,
[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --bg-surface: #1e2a4a;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0b0;
  --text-accent: #4fc3f7;
  --border-color: #2a3a5c;
  --accent: #4fc3f7;
  --accent-hover: #81d4fa;
  --danger: #ef5350;
  --success: #66bb6a;
  --warning: #ffa726;
  --sidebar-width: 220px;
  --panel-width: 300px;
  --toolbar-height: 60px;
  --header-height: 0px;
  --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-mono: 'Consolas', 'Courier New', monospace;
  --radius: 8px;
  --radius-sm: 4px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="light"] {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e3f2fd;
  --bg-surface: #ffffff;
  --text-primary: #212121;
  --text-secondary: #616161;
  --text-accent: #1565c0;
  --border-color: #e0e0e0;
  --accent: #1976d2;
  --accent-hover: #1565c0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

- [ ] **Step 2: Create src/styles/global.css**

```css
@import './variables.css';

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-primary);
}

#app {
  display: flex;
  height: 100vh;
  width: 100vw;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
}

button:hover {
  opacity: 0.85;
}

input, select {
  font: inherit;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
```

- [ ] **Step 3: Add stylesheet to index.html**

Replace the `<head>` content in `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simulatore Forze e Vettori</title>
  <link rel="stylesheet" href="/src/styles/global.css" />
</head>
```

- [ ] **Step 4: Verify dark theme renders**

Run: `npx vite build` — Expected: build succeeds with no CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/ index.html
git commit -m "feat: add dark/light theme system with CSS custom properties"
```

---

## Task 3: Global State Manager

**Files:**
- Create: `src/state.js`

- [ ] **Step 1: Create src/state.js**

A simple event-based store for theme and visibility toggles.

```js
const listeners = new Set();

const state = {
  theme: localStorage.getItem('theme') || 'dark',
  visibility: {
    forceNames: true,
    forceValues: true,
    forceArrows: true,
    body: true,
    grid: true,
    angles: true,
    components: true,
  },
};

export function getState() {
  return state;
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  notify();
}

export function toggleVisibility(key) {
  state.visibility[key] = !state.visibility[key];
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

// Apply saved theme on load
document.documentElement.setAttribute('data-theme', state.theme);
```

- [ ] **Step 2: Commit**

```bash
git add src/state.js
git commit -m "feat: add global state manager for theme and visibility"
```

---

## Task 4: Sidebar & Router

**Files:**
- Create: `src/router.js`
- Create: `src/components/sidebar.js`
- Create: `src/styles/sidebar.css`
- Modify: `src/main.js`

- [ ] **Step 1: Create src/router.js**

```js
const routes = {};
let currentCleanup = null;

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function initRouter(container) {
  function onHashChange() {
    const path = window.location.hash.slice(1) || '/home';

    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }

    container.innerHTML = '';

    const renderFn = routes[path];
    if (renderFn) {
      currentCleanup = renderFn(container) || null;
    } else {
      container.innerHTML = '<p>Pagina non trovata</p>';
    }
  }

  window.addEventListener('hashchange', onHashChange);
  onHashChange();
}
```

- [ ] **Step 2: Create src/styles/sidebar.css**

```css
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 4px;
  user-select: none;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-accent);
  padding: 0 16px 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}

.sidebar-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: var(--bg-tertiary);
  color: var(--text-accent);
  font-weight: 600;
}

.sidebar-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-bottom {
  padding: 0 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
}
```

- [ ] **Step 3: Create src/components/sidebar.js**

```js
import { navigateTo } from '../router.js';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: 'home' },
  { path: '/vectors', label: 'Vettori', icon: 'vectors' },
  { path: '/forces', label: 'Forze', icon: 'forces' },
  { path: '/theory', label: 'Teoria', icon: 'theory' },
];

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>`,
  vectors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="13 5 19 5 19 11"/></svg>`,
  forces: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="2"/><polyline points="9 4 12 2 15 4"/><line x1="15" y1="12" x2="22" y2="12"/><polyline points="20 9 22 12 20 15"/><line x1="12" y1="15" x2="12" y2="22"/><polyline points="15 20 12 22 9 20"/></svg>`,
  theory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
};

export function renderSidebar(container) {
  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';

  sidebar.innerHTML = `
    <div class="sidebar-title">Simulatore Fisica</div>
    <div class="sidebar-nav">
      ${NAV_ITEMS.map(
        (item) => `
        <a class="sidebar-link" href="#${item.path}" data-path="${item.path}">
          ${ICONS[item.icon]}
          <span>${item.label}</span>
        </a>`
      ).join('')}
    </div>
    <div class="sidebar-bottom">
      <a class="sidebar-link" href="#/settings" data-path="/settings">
        ${ICONS.settings}
        <span>Impostazioni</span>
      </a>
    </div>
  `;

  function updateActive() {
    const currentPath = window.location.hash.slice(1) || '/home';
    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.path === currentPath);
    });
  }

  window.addEventListener('hashchange', updateActive);
  updateActive();

  container.appendChild(sidebar);
}
```

- [ ] **Step 4: Update src/main.js to wire sidebar + router**

```js
import './styles/global.css';
import './styles/sidebar.css';
import { renderSidebar } from './components/sidebar.js';
import { initRouter, registerRoute } from './router.js';
import './state.js';

const app = document.getElementById('app');

// Sidebar
renderSidebar(app);

// Main content area
const main = document.createElement('main');
main.id = 'main-content';
main.style.flex = '1';
main.style.overflow = 'hidden';
main.style.position = 'relative';
app.appendChild(main);

// Placeholder routes (replaced in later tasks)
registerRoute('/home', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Forze e Vettori</h1><p>Benvenuto!</p></div>';
});

registerRoute('/vectors', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Vettori</h1><p>In costruzione...</p></div>';
});

registerRoute('/forces', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Forze</h1><p>In costruzione...</p></div>';
});

registerRoute('/theory', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Teoria</h1><p>In costruzione...</p></div>';
});

registerRoute('/settings', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Impostazioni</h1><p>In costruzione...</p></div>';
});

initRouter(main);
```

- [ ] **Step 5: Verify app shell renders**

Run: `npx vite build` — Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/router.js src/components/sidebar.js src/styles/sidebar.css src/main.js
git commit -m "feat: add sidebar navigation and hash router"
```

---

## Task 5: Vector Math Engine (TDD)

**Files:**
- Create: `src/math/vector-math.js`
- Create: `tests/math/vector-math.test.js`

- [ ] **Step 1: Write failing tests for vector operations**

Create `tests/math/vector-math.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  createVector,
  addVectors,
  subtractVectors,
  scalarMultiply,
  magnitude,
  direction,
  decompose,
  resultant,
} from '../../src/math/vector-math.js';

describe('createVector', () => {
  it('creates a vector from components', () => {
    const v = createVector(3, 4);
    expect(v).toEqual({ x: 3, y: 4 });
  });

  it('creates a vector from magnitude and angle', () => {
    const v = createVector(5, 0, { polar: true });
    expect(v.x).toBeCloseTo(5, 5);
    expect(v.y).toBeCloseTo(0, 5);
  });

  it('creates a vector at 90 degrees', () => {
    const v = createVector(5, 90, { polar: true });
    expect(v.x).toBeCloseTo(0, 5);
    expect(v.y).toBeCloseTo(5, 5);
  });

  it('creates a vector at 45 degrees', () => {
    const v = createVector(10, 45, { polar: true });
    expect(v.x).toBeCloseTo(7.07107, 4);
    expect(v.y).toBeCloseTo(7.07107, 4);
  });
});

describe('addVectors', () => {
  it('adds two vectors', () => {
    const a = createVector(3, 4);
    const b = createVector(1, 2);
    const r = addVectors(a, b);
    expect(r).toEqual({ x: 4, y: 6 });
  });

  it('adds multiple vectors', () => {
    const a = createVector(1, 0);
    const b = createVector(0, 1);
    const c = createVector(-1, -1);
    const r = addVectors(a, b, c);
    expect(r).toEqual({ x: 0, y: 0 });
  });
});

describe('subtractVectors', () => {
  it('subtracts two vectors', () => {
    const a = createVector(5, 7);
    const b = createVector(2, 3);
    const r = subtractVectors(a, b);
    expect(r).toEqual({ x: 3, y: 4 });
  });
});

describe('scalarMultiply', () => {
  it('multiplies vector by scalar', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, 2);
    expect(r).toEqual({ x: 6, y: 8 });
  });

  it('multiplies by negative scalar', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, -1);
    expect(r).toEqual({ x: -3, y: -4 });
  });

  it('multiplies by zero', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, 0);
    expect(r).toEqual({ x: 0, y: 0 });
  });
});

describe('magnitude', () => {
  it('calculates magnitude of 3-4-5 triangle', () => {
    const v = createVector(3, 4);
    expect(magnitude(v)).toBeCloseTo(5, 5);
  });

  it('calculates magnitude of unit vector', () => {
    const v = createVector(1, 0);
    expect(magnitude(v)).toBeCloseTo(1, 5);
  });

  it('calculates magnitude of zero vector', () => {
    const v = createVector(0, 0);
    expect(magnitude(v)).toBeCloseTo(0, 5);
  });
});

describe('direction', () => {
  it('returns 0 for vector along x-axis', () => {
    const v = createVector(5, 0);
    expect(direction(v)).toBeCloseTo(0, 5);
  });

  it('returns 90 for vector along y-axis', () => {
    const v = createVector(0, 5);
    expect(direction(v)).toBeCloseTo(90, 5);
  });

  it('returns 45 for equal components', () => {
    const v = createVector(5, 5);
    expect(direction(v)).toBeCloseTo(45, 5);
  });

  it('returns 180 for negative x-axis', () => {
    const v = createVector(-5, 0);
    expect(direction(v)).toBeCloseTo(180, 5);
  });
});

describe('decompose', () => {
  it('decomposes a vector at 30 degrees', () => {
    const v = createVector(10, 30, { polar: true });
    const { x, y } = decompose(v);
    expect(x).toBeCloseTo(8.66025, 4);
    expect(y).toBeCloseTo(5, 4);
  });
});

describe('resultant', () => {
  it('computes resultant of multiple vectors', () => {
    const vectors = [
      createVector(3, 0),
      createVector(0, 4),
    ];
    const r = resultant(vectors);
    expect(r.vector).toEqual({ x: 3, y: 4 });
    expect(r.magnitude).toBeCloseTo(5, 5);
    expect(r.direction).toBeCloseTo(53.13010, 4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/math/vector-math.test.js`

Expected: All tests FAIL — module not found.

- [ ] **Step 3: Implement vector-math.js**

Create `src/math/vector-math.js`:

```js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function createVector(a, b, options = {}) {
  if (options.polar) {
    const mag = a;
    const angleDeg = b;
    const angleRad = angleDeg * DEG_TO_RAD;
    return {
      x: mag * Math.cos(angleRad),
      y: mag * Math.sin(angleRad),
    };
  }
  return { x: a, y: b };
}

export function addVectors(...vectors) {
  const flat = vectors.flat();
  return {
    x: flat.reduce((sum, v) => sum + v.x, 0),
    y: flat.reduce((sum, v) => sum + v.y, 0),
  };
}

export function subtractVectors(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function scalarMultiply(v, scalar) {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function direction(v) {
  const angleRad = Math.atan2(v.y, v.x);
  const angleDeg = angleRad * RAD_TO_DEG;
  return angleDeg < 0 ? angleDeg + 360 : angleDeg;
}

export function decompose(v) {
  return { x: v.x, y: v.y };
}

export function resultant(vectors) {
  const sum = addVectors(...vectors);
  return {
    vector: sum,
    magnitude: magnitude(sum),
    direction: direction(sum),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/math/vector-math.test.js`

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/math/vector-math.js tests/math/vector-math.test.js
git commit -m "feat: vector math engine with full test coverage"
```

---

## Task 6: Force Math Engine (TDD)

**Files:**
- Create: `src/math/force-math.js`
- Create: `tests/math/force-math.test.js`

- [ ] **Step 1: Write failing tests for force calculations**

Create `tests/math/force-math.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  weight,
  inclinedPlane,
  springForce,
  frictionForce,
  isEquilibrium,
  pulleySystem,
} from '../../src/math/force-math.js';

const G = 9.81;

describe('weight', () => {
  it('calculates weight from mass', () => {
    expect(weight(10)).toBeCloseTo(98.1, 2);
  });

  it('returns 0 for mass 0', () => {
    expect(weight(0)).toBe(0);
  });
});

describe('inclinedPlane', () => {
  it('calculates forces on a 30-degree incline without friction', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0 });
    expect(result.weight).toBeCloseTo(98.1, 1);
    expect(result.parallel).toBeCloseTo(49.05, 1);
    expect(result.perpendicular).toBeCloseTo(84.96, 1);
    expect(result.normal).toBeCloseTo(84.96, 1);
    expect(result.friction).toBeCloseTo(0, 5);
    expect(result.netForce).toBeCloseTo(49.05, 1);
    expect(result.slides).toBe(true);
  });

  it('calculates forces on a 30-degree incline with friction', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0.7 });
    expect(result.friction).toBeCloseTo(59.47, 1);
    expect(result.slides).toBe(false);
  });

  it('handles flat surface (0 degrees)', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 0, frictionCoeff: 0 });
    expect(result.parallel).toBeCloseTo(0, 5);
    expect(result.perpendicular).toBeCloseTo(98.1, 1);
    expect(result.slides).toBe(false);
  });
});

describe('springForce', () => {
  it('calculates spring force with Hooke law', () => {
    const result = springForce({ k: 100, x: 0.5 });
    expect(result.force).toBeCloseTo(50, 5);
    expect(result.direction).toBe('restore');
  });

  it('handles compression (negative displacement)', () => {
    const result = springForce({ k: 100, x: -0.3 });
    expect(result.force).toBeCloseTo(30, 5);
    expect(result.direction).toBe('restore');
  });

  it('returns 0 for no displacement', () => {
    const result = springForce({ k: 100, x: 0 });
    expect(result.force).toBe(0);
  });
});

describe('frictionForce', () => {
  it('returns static friction when applied force is less than max static', () => {
    const result = frictionForce({
      mass: 10,
      appliedForce: 20,
      staticCoeff: 0.5,
      dynamicCoeff: 0.3,
    });
    expect(result.frictionValue).toBeCloseTo(20, 5);
    expect(result.maxStatic).toBeCloseTo(49.05, 1);
    expect(result.type).toBe('static');
    expect(result.moves).toBe(false);
  });

  it('returns dynamic friction when applied force exceeds max static', () => {
    const result = frictionForce({
      mass: 10,
      appliedForce: 60,
      staticCoeff: 0.5,
      dynamicCoeff: 0.3,
    });
    expect(result.frictionValue).toBeCloseTo(29.43, 1);
    expect(result.type).toBe('dynamic');
    expect(result.moves).toBe(true);
    expect(result.netForce).toBeCloseTo(30.57, 1);
  });
});

describe('isEquilibrium', () => {
  it('detects equilibrium when forces cancel', () => {
    const forces = [
      { x: 10, y: 0 },
      { x: -10, y: 0 },
    ];
    const result = isEquilibrium(forces);
    expect(result.balanced).toBe(true);
    expect(result.resultantMagnitude).toBeCloseTo(0, 5);
  });

  it('detects non-equilibrium', () => {
    const forces = [
      { x: 10, y: 0 },
      { x: -5, y: 0 },
    ];
    const result = isEquilibrium(forces);
    expect(result.balanced).toBe(false);
    expect(result.resultantMagnitude).toBeCloseTo(5, 5);
    expect(result.missingForce).toEqual({ x: -5, y: 0 });
  });
});

describe('pulleySystem', () => {
  it('calculates simple Atwood machine', () => {
    const result = pulleySystem({ mass1: 10, mass2: 5 });
    const expectedAcc = (G * (10 - 5)) / (10 + 5);
    const expectedTension = (2 * 10 * 5 * G) / (10 + 5);
    expect(result.acceleration).toBeCloseTo(expectedAcc, 2);
    expect(result.tension).toBeCloseTo(expectedTension, 2);
    expect(result.heavierSide).toBe('mass1');
  });

  it('returns 0 acceleration for equal masses', () => {
    const result = pulleySystem({ mass1: 5, mass2: 5 });
    expect(result.acceleration).toBeCloseTo(0, 5);
    expect(result.heavierSide).toBe('balanced');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/math/force-math.test.js`

Expected: All tests FAIL — module not found.

- [ ] **Step 3: Implement force-math.js**

Create `src/math/force-math.js`:

```js
const G = 9.81;

export function weight(mass) {
  return mass * G;
}

export function inclinedPlane({ mass, angleDeg, frictionCoeff }) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const W = weight(mass);
  const parallel = W * Math.sin(angleRad);
  const perpendicular = W * Math.cos(angleRad);
  const normal = perpendicular;
  const friction = frictionCoeff * normal;
  const netForce = Math.max(0, parallel - friction);
  const slides = parallel > friction && parallel > 0.0001;

  return { weight: W, parallel, perpendicular, normal, friction, netForce, slides };
}

export function springForce({ k, x }) {
  const force = Math.abs(k * x);
  return {
    force,
    signedForce: -k * x,
    direction: x === 0 ? 'none' : 'restore',
  };
}

export function frictionForce({ mass, appliedForce, staticCoeff, dynamicCoeff }) {
  const W = weight(mass);
  const normal = W;
  const maxStatic = staticCoeff * normal;
  const dynamicFriction = dynamicCoeff * normal;

  if (Math.abs(appliedForce) <= maxStatic) {
    return {
      frictionValue: Math.abs(appliedForce),
      maxStatic,
      dynamicFriction,
      type: 'static',
      moves: false,
      netForce: 0,
    };
  }

  return {
    frictionValue: dynamicFriction,
    maxStatic,
    dynamicFriction,
    type: 'dynamic',
    moves: true,
    netForce: Math.abs(appliedForce) - dynamicFriction,
  };
}

export function isEquilibrium(forces) {
  const rx = forces.reduce((sum, f) => sum + f.x, 0);
  const ry = forces.reduce((sum, f) => sum + f.y, 0);
  const resultantMagnitude = Math.sqrt(rx * rx + ry * ry);
  const balanced = resultantMagnitude < 0.0001;

  return {
    balanced,
    resultant: { x: rx, y: ry },
    resultantMagnitude,
    missingForce: balanced ? null : { x: -rx, y: -ry },
  };
}

export function pulleySystem({ mass1, mass2 }) {
  const totalMass = mass1 + mass2;
  const diff = mass1 - mass2;
  const acceleration = (G * diff) / totalMass;
  const tension = (2 * mass1 * mass2 * G) / totalMass;

  let heavierSide;
  if (Math.abs(diff) < 0.0001) {
    heavierSide = 'balanced';
  } else {
    heavierSide = diff > 0 ? 'mass1' : 'mass2';
  }

  return {
    acceleration: Math.abs(acceleration),
    tension,
    heavierSide,
    weight1: weight(mass1),
    weight2: weight(mass2),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/math/force-math.test.js`

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/math/force-math.js tests/math/force-math.test.js
git commit -m "feat: force math engine with full test coverage"
```

---

## Task 7: Three.js Scene Manager

**Files:**
- Create: `src/simulator/scene-manager.js`
- Create: `src/simulator/grid.js`

- [ ] **Step 1: Create src/simulator/scene-manager.js**

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.objects = new THREE.Group();
    this.scene.add(this.objects);

    // Camera — looking at 2D plane from slightly above and angled
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1a, 1);
    canvasContainer.appendChild(this.renderer.domElement);

    // Orbit controls — allow rotation, but keep it intuitive
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 30;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Resize handling
    this._onResize = () => this._handleResize();
    window.addEventListener('resize', this._onResize);
    this._resizeObserver = new ResizeObserver(() => this._handleResize());
    this._resizeObserver.observe(canvasContainer);

    // Animation loop
    this._animating = true;
    this._animate();
  }

  _handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    if (!this._animating) return;
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  clearObjects() {
    while (this.objects.children.length > 0) {
      const obj = this.objects.children[0];
      this.objects.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
  }

  resetCamera() {
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
  }

  dispose() {
    this._animating = false;
    window.removeEventListener('resize', this._onResize);
    this._resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
```

- [ ] **Step 2: Create src/simulator/grid.js**

```js
import * as THREE from 'three';

export function createGrid(scene) {
  const group = new THREE.Group();
  group.name = 'grid';

  // Grid
  const gridHelper = new THREE.GridHelper(20, 20, 0x2a3a5c, 0x1a2a4c);
  gridHelper.rotation.x = Math.PI / 2; // Lay flat on XY plane
  group.add(gridHelper);

  // X axis (red)
  const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 });
  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-10, 0, 0.01),
    new THREE.Vector3(10, 0, 0.01),
  ]);
  const xAxis = new THREE.Line(xGeometry, xMaterial);
  group.add(xAxis);

  // Y axis (green)
  const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44 });
  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -10, 0.01),
    new THREE.Vector3(0, 10, 0.01),
  ]);
  const yAxis = new THREE.Line(yGeometry, yMaterial);
  group.add(yAxis);

  // Axis labels using sprites
  group.add(createTextSprite('X', 10.5, 0, 0.01, 0xff4444));
  group.add(createTextSprite('Y', 0, 10.5, 0.01, 0x44ff44));

  scene.add(group);
  return group;
}

function createTextSprite(text, x, y, z, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.5, 0.5, 1);
  return sprite;
}

export function setGridVisible(gridGroup, visible) {
  gridGroup.visible = visible;
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — Expected: builds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/simulator/scene-manager.js src/simulator/grid.js
git commit -m "feat: Three.js scene manager with grid and orbit controls"
```

---

## Task 8: Vector Renderer

**Files:**
- Create: `src/simulator/vector-renderer.js`
- Create: `src/simulator/label-renderer.js`

- [ ] **Step 1: Create src/simulator/label-renderer.js**

```js
export class LabelManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; overflow: hidden;
    `;
    canvasContainer.style.position = 'relative';
    canvasContainer.appendChild(this.overlay);
    this.labels = [];
  }

  addLabel(text, object3D, camera, renderer) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute; color: #e0e0e0; font-size: 11px;
      font-family: var(--font-mono); background: rgba(0,0,0,0.6);
      padding: 2px 6px; border-radius: 3px; white-space: nowrap;
      transform: translate(-50%, -100%);
    `;
    el.textContent = text;
    this.overlay.appendChild(el);
    this.labels.push({ el, object3D, camera, renderer });
    return el;
  }

  update() {
    for (const label of this.labels) {
      const { el, object3D, camera, renderer } = label;
      const vec = object3D.position.clone();
      vec.project(camera);
      const canvas = renderer.domElement;
      const x = (vec.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-vec.y * 0.5 + 0.5) * canvas.clientHeight;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.display = vec.z > 1 ? 'none' : 'block';
    }
  }

  clear() {
    this.labels = [];
    this.overlay.innerHTML = '';
  }

  dispose() {
    this.clear();
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
```

- [ ] **Step 2: Create src/simulator/vector-renderer.js**

```js
import * as THREE from 'three';

const COLORS = [
  0x4fc3f7, 0xff7043, 0x66bb6a, 0xffa726, 0xab47bc,
  0xef5350, 0x26c6da, 0xd4e157, 0xec407a, 0x8d6e63,
];

let colorIndex = 0;

export function resetColorIndex() {
  colorIndex = 0;
}

export function getNextColor() {
  const color = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return color;
}

export function createArrow(origin, vector, color, name) {
  const dir = new THREE.Vector3(vector.x, vector.y, 0).normalize();
  const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (len < 0.001) return null;

  const arrowHelper = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(origin.x, origin.y, 0.02),
    len,
    color,
    Math.min(len * 0.2, 0.4),
    Math.min(len * 0.12, 0.2)
  );

  arrowHelper.userData = { name, vector, origin, color };
  return arrowHelper;
}

export function createResultantArrow(origin, vector) {
  const dir = new THREE.Vector3(vector.x, vector.y, 0).normalize();
  const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (len < 0.001) return null;

  const arrowHelper = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(origin.x, origin.y, 0.04),
    len,
    0xffffff,
    Math.min(len * 0.25, 0.5),
    Math.min(len * 0.15, 0.25)
  );

  // Make the line thicker by replacing the line with a cylinder
  arrowHelper.userData = { name: 'Risultante', vector, origin, isResultant: true };
  return arrowHelper;
}

export function createAngleArc(origin, vector1, vector2, color) {
  const angle1 = Math.atan2(vector1.y, vector1.x);
  const angle2 = Math.atan2(vector2.y, vector2.x);

  const curve = new THREE.EllipseCurve(
    origin.x, origin.y,
    0.8, 0.8,
    angle1, angle2,
    false, 0
  );

  const points = curve.getPoints(32);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, p.y, 0.03))
  );
  const material = new THREE.LineBasicMaterial({ color: color || 0xffff00, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/simulator/vector-renderer.js src/simulator/label-renderer.js
git commit -m "feat: vector arrow renderer and CSS label system"
```

---

## Task 9: Simulator Layout, Properties Panel, Visibility Menu, Toolbar

**Files:**
- Create: `src/simulator/simulator-layout.js`
- Create: `src/simulator/properties-panel.js`
- Create: `src/simulator/visibility-menu.js`
- Create: `src/simulator/toolbar.js`
- Create: `src/styles/simulator.css`

- [ ] **Step 1: Create src/styles/simulator.css**

```css
.simulator-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: #0a0a1a;
}

.toolbar {
  height: var(--toolbar-height);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  overflow-x: auto;
}

.toolbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 11px;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--bg-tertiary);
  color: var(--text-accent);
}

.toolbar-btn svg {
  width: 22px;
  height: 22px;
}

.right-panel {
  width: var(--panel-width);
  min-width: var(--panel-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-section {
  padding: 14px;
  border-bottom: 1px solid var(--border-color);
}

.panel-section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.panel-row-label {
  color: var(--text-secondary);
}

.panel-row-value {
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.panel-input {
  width: 80px;
  text-align: right;
}

/* Visibility toggles */
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-switch.on {
  background: var(--accent);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.on::after {
  transform: translateX(16px);
}

/* Contextual theory tip */
.theory-tip {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
}

.theory-tip-formula {
  font-family: var(--font-mono);
  color: var(--text-accent);
  font-size: 14px;
  margin: 6px 0;
}

.theory-tip-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 12px;
}

.theory-tip-link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: Create src/simulator/simulator-layout.js**

```js
export function createSimulatorLayout(container) {
  container.innerHTML = `
    <div class="simulator-layout">
      <div class="canvas-area">
        <div class="canvas-container" id="canvas-container"></div>
        <div class="toolbar" id="toolbar"></div>
      </div>
      <div class="right-panel" id="right-panel"></div>
    </div>
  `;

  return {
    canvasContainer: container.querySelector('#canvas-container'),
    toolbar: container.querySelector('#toolbar'),
    rightPanel: container.querySelector('#right-panel'),
  };
}
```

- [ ] **Step 3: Create src/simulator/properties-panel.js**

```js
export function renderPropertiesPanel(panelEl, sections) {
  panelEl.innerHTML = sections
    .map(
      (section) => `
    <div class="panel-section">
      <div class="panel-section-title">${section.title}</div>
      ${section.content}
    </div>
  `
    )
    .join('');
}

export function createPropertyRow(label, value) {
  return `<div class="panel-row">
    <span class="panel-row-label">${label}</span>
    <span class="panel-row-value">${value}</span>
  </div>`;
}

export function createInputRow(label, id, value, unit, attrs = '') {
  return `<div class="panel-row">
    <span class="panel-row-label">${label}</span>
    <span>
      <input class="panel-input" type="number" id="${id}" value="${value}" ${attrs} />
      <span class="panel-row-label">${unit}</span>
    </span>
  </div>`;
}
```

- [ ] **Step 4: Create src/simulator/visibility-menu.js**

```js
import { getState, toggleVisibility, subscribe } from '../state.js';

const VISIBILITY_LABELS = {
  forceNames: 'Nomi forze',
  forceValues: 'Valori numerici',
  forceArrows: 'Frecce forze',
  body: 'Corpo/oggetto',
  grid: 'Griglia/assi',
  angles: 'Angoli',
  components: 'Componenti',
};

export function renderVisibilityMenu(container) {
  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = `<div class="panel-section-title">Visibilita</div>`;

  const state = getState();

  for (const [key, label] of Object.entries(VISIBILITY_LABELS)) {
    const row = document.createElement('div');
    row.className = 'toggle-row';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;

    const toggle = document.createElement('div');
    toggle.className = `toggle-switch ${state.visibility[key] ? 'on' : ''}`;
    toggle.addEventListener('click', () => {
      toggleVisibility(key);
    });

    row.appendChild(labelEl);
    row.appendChild(toggle);
    section.appendChild(row);
  }

  const unsub = subscribe((newState) => {
    const toggles = section.querySelectorAll('.toggle-switch');
    const keys = Object.keys(VISIBILITY_LABELS);
    toggles.forEach((toggle, i) => {
      toggle.classList.toggle('on', newState.visibility[keys[i]]);
    });
  });

  container.appendChild(section);
  return unsub;
}
```

- [ ] **Step 5: Create src/simulator/toolbar.js**

```js
export function renderToolbar(toolbarEl, tools, onSelect) {
  toolbarEl.innerHTML = '';
  let activeIndex = 0;

  tools.forEach((tool, index) => {
    const btn = document.createElement('button');
    btn.className = `toolbar-btn ${index === 0 ? 'active' : ''}`;
    btn.innerHTML = `${tool.icon}<span>${tool.label}</span>`;
    btn.addEventListener('click', () => {
      toolbarEl.querySelectorAll('.toolbar-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeIndex = index;
      onSelect(tool.id, index);
    });
    toolbarEl.appendChild(btn);
  });

  return {
    getActive: () => tools[activeIndex],
    setActive: (id) => {
      const idx = tools.findIndex((t) => t.id === id);
      if (idx >= 0) {
        toolbarEl.querySelectorAll('.toolbar-btn')[idx].click();
      }
    },
  };
}
```

- [ ] **Step 6: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/simulator/ src/styles/simulator.css
git commit -m "feat: simulator layout with properties panel, visibility menu, toolbar"
```

---

## Task 10: Vectors Simulator Page

**Files:**
- Create: `src/simulator/vectors/vectors-page.js`
- Modify: `src/main.js` (register real route)

- [ ] **Step 1: Create src/simulator/vectors/vectors-page.js**

```js
import '../../styles/simulator.css';
import { createSimulatorLayout } from '../simulator-layout.js';
import { SceneManager } from '../scene-manager.js';
import { createGrid, setGridVisible } from '../grid.js';
import { createArrow, createResultantArrow, resetColorIndex, getNextColor, createAngleArc } from '../vector-renderer.js';
import { LabelManager } from '../label-renderer.js';
import { renderToolbar } from '../toolbar.js';
import { renderPropertiesPanel, createPropertyRow, createInputRow } from '../properties-panel.js';
import { renderVisibilityMenu } from '../visibility-menu.js';
import { createVector, addVectors, subtractVectors, scalarMultiply, magnitude, direction, resultant } from '../../math/vector-math.js';
import { getState, subscribe } from '../../state.js';
import { renderContextualTip } from '../../theory/contextual-tip.js';

const TOOLS = [
  { id: 'create', label: 'Crea Vettore', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="13 5 19 5 19 11"/></svg>' },
  { id: 'sum', label: 'Somma', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' },
  { id: 'difference', label: 'Differenza', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>' },
  { id: 'scalar', label: 'Scalare x Vettore', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><text x="4" y="17" font-size="14" fill="currentColor">k</text><line x1="13" y1="17" x2="21" y2="9"/><polyline points="17 9 21 9 21 13"/></svg>' },
  { id: 'decompose', label: 'Scomponi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/><line x1="4" y1="20" x2="20" y2="20" stroke-dasharray="3 3"/><line x1="20" y1="20" x2="20" y2="4" stroke-dasharray="3 3"/></svg>' },
];

export function renderVectorsPage(container) {
  const { canvasContainer, toolbar, rightPanel } = createSimulatorLayout(container);

  const scene = new SceneManager(canvasContainer);
  const grid = createGrid(scene.scene);
  const labels = new LabelManager(canvasContainer);

  let vectors = [];
  let activeTool = 'create';
  let selectedIndex = -1;
  let scalarValue = 2;

  // Toolbar
  renderToolbar(toolbar, TOOLS, (id) => {
    activeTool = id;
    updateScene();
    updatePanel();
  });

  // Visibility subscription
  const unsubVis = subscribe((state) => {
    setGridVisible(grid, state.visibility.grid);
    updateScene();
  });

  // Canvas click — add vector
  canvasContainer.addEventListener('click', (e) => {
    if (e.target !== scene.renderer.domElement) return;
    if (activeTool !== 'create') return;

    // Default: add a new vector with random direction
    const angle = Math.random() * 360;
    const mag = 2 + Math.random() * 3;
    const v = createVector(mag, angle, { polar: true });
    vectors.push({ x: v.x, y: v.y, originX: 0, originY: 0, name: `V${vectors.length + 1}` });
    selectedIndex = vectors.length - 1;
    updateScene();
    updatePanel();
  });

  function updateScene() {
    scene.clearObjects();
    labels.clear();
    resetColorIndex();

    const vis = getState().visibility;

    vectors.forEach((v, i) => {
      if (vis.forceArrows) {
        const color = getNextColor();
        v._color = color;
        const arrow = createArrow({ x: v.originX, y: v.originY }, { x: v.x, y: v.y }, color, v.name);
        if (arrow) {
          scene.objects.add(arrow);
          if (vis.forceNames || vis.forceValues) {
            const labelText = [
              vis.forceNames ? v.name : '',
              vis.forceValues ? `${magnitude(v).toFixed(2)} N` : '',
            ].filter(Boolean).join(': ');
            labels.addLabel(labelText, arrow, scene.camera, scene.renderer);
          }
        }
      }

      if (vis.components) {
        // X component (dashed)
        const xArrow = createArrow({ x: v.originX, y: v.originY }, { x: v.x, y: 0 }, 0xff4444, 'Fx');
        if (xArrow) scene.objects.add(xArrow);
        // Y component (dashed)
        const yArrow = createArrow({ x: v.originX, y: v.originY }, { x: 0, y: v.y }, 0x44ff44, 'Fy');
        if (yArrow) scene.objects.add(yArrow);
      }
    });

    // Show resultant for sum/difference
    if ((activeTool === 'sum' || activeTool === 'difference') && vectors.length >= 2) {
      let res;
      if (activeTool === 'sum') {
        res = addVectors(...vectors);
      } else {
        res = vectors.reduce((acc, v, i) => (i === 0 ? v : subtractVectors(acc, v)));
      }
      const resultArrow = createResultantArrow({ x: 0, y: 0 }, res);
      if (resultArrow) {
        scene.objects.add(resultArrow);
        if (vis.forceNames || vis.forceValues) {
          const label = `R: ${magnitude(res).toFixed(2)} N @ ${direction(res).toFixed(1)}°`;
          labels.addLabel(label, resultArrow, scene.camera, scene.renderer);
        }
      }
    }

    // Show scalar multiplication
    if (activeTool === 'scalar' && selectedIndex >= 0) {
      const v = vectors[selectedIndex];
      const scaled = scalarMultiply(v, scalarValue);
      const arrow = createResultantArrow({ x: v.originX, y: v.originY }, scaled);
      if (arrow) {
        scene.objects.add(arrow);
        labels.addLabel(`${scalarValue} x ${v.name}`, arrow, scene.camera, scene.renderer);
      }
    }

    // Angle arcs
    if (vis.angles) {
      vectors.forEach((v) => {
        const arc = createAngleArc({ x: v.originX, y: v.originY }, { x: 1, y: 0 }, v, 0xffff00);
        if (arc) scene.objects.add(arc);
      });
    }

    labels.update();
  }

  // Run label update each frame
  const labelInterval = setInterval(() => labels.update(), 50);

  function updatePanel() {
    const sections = [];

    // Selected vector info
    if (selectedIndex >= 0 && selectedIndex < vectors.length) {
      const v = vectors[selectedIndex];
      const mag = magnitude(v);
      const dir = direction(v);
      sections.push({
        title: `${v.name} — Proprieta`,
        content: `
          ${createInputRow('X', 'vec-x', v.x.toFixed(2), '')}
          ${createInputRow('Y', 'vec-y', v.y.toFixed(2), '')}
          ${createPropertyRow('Modulo', `${mag.toFixed(2)}`)}
          ${createPropertyRow('Direzione', `${dir.toFixed(1)}°`)}
        `,
      });
    }

    // Calculations based on active tool
    if (activeTool === 'sum' && vectors.length >= 2) {
      const res = resultant(vectors);
      sections.push({
        title: 'Risultante (Somma)',
        content: `
          ${createPropertyRow('Rx', res.vector.x.toFixed(2))}
          ${createPropertyRow('Ry', res.vector.y.toFixed(2))}
          ${createPropertyRow('Modulo', `${res.magnitude.toFixed(2)}`)}
          ${createPropertyRow('Direzione', `${res.direction.toFixed(1)}°`)}
        `,
      });
    }

    if (activeTool === 'scalar' && selectedIndex >= 0) {
      sections.push({
        title: 'Moltiplicazione Scalare',
        content: createInputRow('Scalare (k)', 'scalar-k', scalarValue, ''),
      });
    }

    // Vector list
    if (vectors.length > 0) {
      sections.push({
        title: `Vettori (${vectors.length})`,
        content: vectors
          .map(
            (v, i) =>
              `<div class="panel-row" style="cursor:pointer;${i === selectedIndex ? 'color:var(--text-accent)' : ''}" data-vec-idx="${i}">
                <span>${v.name}</span>
                <span class="panel-row-value">${magnitude(v).toFixed(2)}</span>
              </div>`
          )
          .join(''),
      });
    }

    // Theory tip
    const tipContent = renderContextualTip(activeTool === 'sum' ? 'vector-sum' : activeTool === 'decompose' ? 'vector-decompose' : 'vector-basics');
    sections.push({ title: 'Teoria', content: tipContent });

    renderPropertiesPanel(rightPanel, sections);
    renderVisibilityMenu(rightPanel);

    // Wire up input events
    const vecX = rightPanel.querySelector('#vec-x');
    const vecY = rightPanel.querySelector('#vec-y');
    if (vecX && vecY) {
      vecX.addEventListener('change', (e) => {
        vectors[selectedIndex].x = parseFloat(e.target.value) || 0;
        updateScene();
        updatePanel();
      });
      vecY.addEventListener('change', (e) => {
        vectors[selectedIndex].y = parseFloat(e.target.value) || 0;
        updateScene();
        updatePanel();
      });
    }

    const scalarInput = rightPanel.querySelector('#scalar-k');
    if (scalarInput) {
      scalarInput.addEventListener('change', (e) => {
        scalarValue = parseFloat(e.target.value) || 1;
        updateScene();
      });
    }

    // Wire up vector list clicks
    rightPanel.querySelectorAll('[data-vec-idx]').forEach((el) => {
      el.addEventListener('click', () => {
        selectedIndex = parseInt(el.dataset.vecIdx);
        updatePanel();
      });
    });
  }

  updateScene();
  updatePanel();

  // Cleanup
  return () => {
    clearInterval(labelInterval);
    unsubVis();
    labels.dispose();
    scene.dispose();
  };
}
```

- [ ] **Step 2: Update src/main.js — register vectors route**

Replace the vectors placeholder route:

```js
import { renderVectorsPage } from './simulator/vectors/vectors-page.js';

// Replace the placeholder:
registerRoute('/vectors', renderVectorsPage);
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/simulator/vectors/vectors-page.js src/main.js
git commit -m "feat: vectors simulator page with all vector tools"
```

---

## Task 11: Forces Simulator — Page Shell & Point Forces Scenario

**Files:**
- Create: `src/simulator/forces/forces-page.js`
- Create: `src/simulator/forces/scenarios/point-forces.js`
- Create: `tests/scenarios/point-forces.test.js`

- [ ] **Step 1: Write failing test for point-forces scenario logic**

Create `tests/scenarios/point-forces.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computePointForces } from '../../src/simulator/forces/scenarios/point-forces.js';

describe('computePointForces', () => {
  it('calculates resultant of two forces', () => {
    const forces = [
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ];
    const result = computePointForces(forces);
    expect(result.resultant.x).toBeCloseTo(3, 5);
    expect(result.resultant.y).toBeCloseTo(4, 5);
    expect(result.magnitude).toBeCloseTo(5, 5);
  });

  it('returns zero for no forces', () => {
    const result = computePointForces([]);
    expect(result.magnitude).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scenarios/point-forces.test.js`

Expected: FAIL — module not found.

- [ ] **Step 3: Create src/simulator/forces/scenarios/point-forces.js**

```js
import { addVectors, magnitude, direction } from '../../../math/vector-math.js';
import { createArrow, createResultantArrow, getNextColor, resetColorIndex } from '../../vector-renderer.js';

export function computePointForces(forces) {
  if (forces.length === 0) {
    return { resultant: { x: 0, y: 0 }, magnitude: 0, direction: 0 };
  }
  const r = addVectors(...forces);
  return {
    resultant: r,
    magnitude: magnitude(r),
    direction: direction(r),
  };
}

export function renderPointForces(sceneManager, forces, visibility) {
  resetColorIndex();
  const arrows = [];

  forces.forEach((f) => {
    if (visibility.forceArrows) {
      const color = getNextColor();
      f._color = color;
      const arrow = createArrow({ x: 0, y: 0 }, f, color, f.name);
      if (arrow) {
        sceneManager.objects.add(arrow);
        arrows.push({ arrow, force: f });
      }
    }
  });

  // Resultant
  const result = computePointForces(forces);
  if (result.magnitude > 0.001 && visibility.forceArrows) {
    const rArrow = createResultantArrow({ x: 0, y: 0 }, result.resultant);
    if (rArrow) {
      sceneManager.objects.add(rArrow);
      arrows.push({ arrow: rArrow, force: { ...result.resultant, name: 'Risultante' } });
    }
  }

  return { result, arrows };
}

export function getPointForcesConfig() {
  return {
    id: 'point-forces',
    label: 'Forze su un punto',
    defaultForces: [
      { x: 3, y: 0, name: 'F1' },
      { x: 0, y: 4, name: 'F2' },
    ],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scenarios/point-forces.test.js`

Expected: PASS.

- [ ] **Step 5: Create src/simulator/forces/forces-page.js**

```js
import '../../styles/simulator.css';
import { createSimulatorLayout } from '../simulator-layout.js';
import { SceneManager } from '../scene-manager.js';
import { createGrid, setGridVisible } from '../grid.js';
import { LabelManager } from '../label-renderer.js';
import { renderToolbar } from '../toolbar.js';
import { renderPropertiesPanel, createPropertyRow, createInputRow } from '../properties-panel.js';
import { renderVisibilityMenu } from '../visibility-menu.js';
import { renderContextualTip } from '../../theory/contextual-tip.js';
import { getState, subscribe } from '../../state.js';
import { magnitude, direction } from '../../math/vector-math.js';

// Scenario imports
import { renderPointForces, getPointForcesConfig, computePointForces } from './scenarios/point-forces.js';
import { renderInclinedPlane, getInclinedPlaneConfig } from './scenarios/inclined-plane.js';
import { renderSpring, getSpringConfig } from './scenarios/spring.js';
import { renderFriction, getFrictionConfig } from './scenarios/friction.js';
import { renderEquilibrium, getEquilibriumConfig } from './scenarios/equilibrium.js';
import { renderPulley, getPulleyConfig } from './scenarios/pulley.js';

const SCENARIO_TOOLS = [
  { id: 'point-forces', label: 'Forze su un punto', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><line x1="12" y1="10" x2="12" y2="3"/><line x1="14" y1="12" x2="21" y2="12"/><line x1="10" y1="14" x2="5" y2="19"/></svg>' },
  { id: 'inclined-plane', label: 'Piano inclinato', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18L3 6z"/></svg>' },
  { id: 'spring', label: 'Molla', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h2l1-3 2 6 2-6 2 6 2-6 2 6 1-3h2"/></svg>' },
  { id: 'friction', label: 'Attrito', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="10" width="8" height="6"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="3" y1="17" x2="5" y2="19"/><line x1="6" y1="17" x2="8" y2="19"/><line x1="9" y1="17" x2="11" y2="19"/><line x1="12" y1="17" x2="14" y2="19"/></svg>' },
  { id: 'equilibrium', label: 'Equilibrio', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/><circle cx="12" cy="12" r="8"/></svg>' },
  { id: 'pulley', label: 'Carrucola', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="4"/><line x1="8" y1="6" x2="8" y2="20"/><line x1="16" y1="6" x2="16" y2="20"/><rect x="6" y="18" width="4" height="4"/><rect x="14" y="16" width="4" height="4"/></svg>' },
];

export function renderForcesPage(container) {
  const { canvasContainer, toolbar, rightPanel } = createSimulatorLayout(container);

  const scene = new SceneManager(canvasContainer);
  const grid = createGrid(scene.scene);
  const labels = new LabelManager(canvasContainer);

  let activeScenario = 'point-forces';
  let scenarioState = {};

  // Initialize default scenario states
  function initScenarioState(id) {
    switch (id) {
      case 'point-forces':
        return { forces: [...getPointForcesConfig().defaultForces] };
      case 'inclined-plane':
        return { ...getInclinedPlaneConfig().defaults };
      case 'spring':
        return { ...getSpringConfig().defaults };
      case 'friction':
        return { ...getFrictionConfig().defaults };
      case 'equilibrium':
        return { forces: [...getEquilibriumConfig().defaultForces] };
      case 'pulley':
        return { ...getPulleyConfig().defaults };
      default:
        return {};
    }
  }

  scenarioState = initScenarioState(activeScenario);

  renderToolbar(toolbar, SCENARIO_TOOLS, (id) => {
    activeScenario = id;
    scenarioState = initScenarioState(id);
    scene.resetCamera();
    updateScene();
    updatePanel();
  });

  const unsubVis = subscribe((state) => {
    setGridVisible(grid, state.visibility.grid);
    updateScene();
  });

  function updateScene() {
    scene.clearObjects();
    labels.clear();

    const vis = getState().visibility;

    switch (activeScenario) {
      case 'point-forces':
        renderPointForces(scene, scenarioState.forces, vis);
        break;
      case 'inclined-plane':
        renderInclinedPlane(scene, scenarioState, vis);
        break;
      case 'spring':
        renderSpring(scene, scenarioState, vis);
        break;
      case 'friction':
        renderFriction(scene, scenarioState, vis);
        break;
      case 'equilibrium':
        renderEquilibrium(scene, scenarioState, vis);
        break;
      case 'pulley':
        renderPulley(scene, scenarioState, vis);
        break;
    }
  }

  function updatePanel() {
    const sections = buildPanelSections();
    renderPropertiesPanel(rightPanel, sections);
    renderVisibilityMenu(rightPanel);
    wireUpInputs();
  }

  function buildPanelSections() {
    const sections = [];

    switch (activeScenario) {
      case 'point-forces': {
        const result = computePointForces(scenarioState.forces);
        sections.push({
          title: 'Parametri',
          content: scenarioState.forces
            .map((f, i) =>
              `${createInputRow(`${f.name} x`, `f-${i}-x`, f.x.toFixed(2), 'N')}
               ${createInputRow(`${f.name} y`, `f-${i}-y`, f.y.toFixed(2), 'N')}`
            )
            .join('') +
            `<button class="toolbar-btn" id="add-force" style="margin-top:8px;width:100%;justify-content:center;">+ Aggiungi forza</button>`,
        });
        sections.push({
          title: 'Risultante',
          content:
            createPropertyRow('Rx', `${result.resultant.x.toFixed(2)} N`) +
            createPropertyRow('Ry', `${result.resultant.y.toFixed(2)} N`) +
            createPropertyRow('Modulo', `${result.magnitude.toFixed(2)} N`) +
            createPropertyRow('Direzione', `${result.direction.toFixed(1)}°`),
        });
        break;
      }
      case 'inclined-plane': {
        const s = scenarioState;
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Massa', 'ip-mass', s.mass, 'kg') +
            createInputRow('Angolo', 'ip-angle', s.angleDeg, '°') +
            createInputRow('Coeff. attrito', 'ip-friction', s.frictionCoeff, ''),
        });
        const calc = require_inclinedPlaneCalc(s);
        sections.push({
          title: 'Forze calcolate',
          content:
            createPropertyRow('Peso', `${calc.weight.toFixed(2)} N`) +
            createPropertyRow('F parallela', `${calc.parallel.toFixed(2)} N`) +
            createPropertyRow('F perpendicolare', `${calc.perpendicular.toFixed(2)} N`) +
            createPropertyRow('Normale', `${calc.normal.toFixed(2)} N`) +
            createPropertyRow('Attrito', `${calc.friction.toFixed(2)} N`) +
            createPropertyRow('F netta', `${calc.netForce.toFixed(2)} N`) +
            createPropertyRow('Scivola?', calc.slides ? 'Si' : 'No'),
        });
        break;
      }
      case 'spring': {
        const s = scenarioState;
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Costante k', 'sp-k', s.k, 'N/m') +
            createInputRow('Deformazione x', 'sp-x', s.x, 'm'),
        });
        const calc = require_springCalc(s);
        sections.push({
          title: 'Forza elastica',
          content:
            createPropertyRow('F = k * x', `${calc.force.toFixed(2)} N`) +
            createPropertyRow('Direzione', calc.direction),
        });
        break;
      }
      case 'friction': {
        const s = scenarioState;
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Massa', 'fr-mass', s.mass, 'kg') +
            createInputRow('Forza applicata', 'fr-applied', s.appliedForce, 'N') +
            createInputRow('Coeff. statico', 'fr-static', s.staticCoeff, '') +
            createInputRow('Coeff. dinamico', 'fr-dynamic', s.dynamicCoeff, ''),
        });
        const calc = require_frictionCalc(s);
        sections.push({
          title: 'Risultato',
          content:
            createPropertyRow('Attrito', `${calc.frictionValue.toFixed(2)} N`) +
            createPropertyRow('Max statico', `${calc.maxStatic.toFixed(2)} N`) +
            createPropertyRow('Tipo', calc.type === 'static' ? 'Statico' : 'Dinamico') +
            createPropertyRow('Si muove?', calc.moves ? 'Si' : 'No') +
            (calc.moves ? createPropertyRow('F netta', `${calc.netForce.toFixed(2)} N`) : ''),
        });
        break;
      }
      case 'equilibrium': {
        const forces = scenarioState.forces;
        sections.push({
          title: 'Forze',
          content: forces
            .map((f, i) =>
              `${createInputRow(`${f.name} x`, `eq-${i}-x`, f.x.toFixed(2), 'N')}
               ${createInputRow(`${f.name} y`, `eq-${i}-y`, f.y.toFixed(2), 'N')}`
            )
            .join('') +
            `<button class="toolbar-btn" id="add-eq-force" style="margin-top:8px;width:100%;justify-content:center;">+ Aggiungi forza</button>`,
        });
        const calc = require_equilibriumCalc(forces);
        sections.push({
          title: 'Equilibrio',
          content:
            createPropertyRow('In equilibrio?', calc.balanced ? 'Si' : 'No') +
            createPropertyRow('Risultante', `${calc.resultantMagnitude.toFixed(2)} N`) +
            (calc.missingForce
              ? createPropertyRow('Forza mancante', `(${calc.missingForce.x.toFixed(2)}, ${calc.missingForce.y.toFixed(2)}) N`)
              : ''),
        });
        break;
      }
      case 'pulley': {
        const s = scenarioState;
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Massa 1', 'pu-m1', s.mass1, 'kg') +
            createInputRow('Massa 2', 'pu-m2', s.mass2, 'kg'),
        });
        const calc = require_pulleyCalc(s);
        sections.push({
          title: 'Risultato',
          content:
            createPropertyRow('Accelerazione', `${calc.acceleration.toFixed(2)} m/s²`) +
            createPropertyRow('Tensione', `${calc.tension.toFixed(2)} N`) +
            createPropertyRow('Lato pesante', calc.heavierSide === 'balanced' ? 'Bilanciato' : calc.heavierSide === 'mass1' ? 'Massa 1' : 'Massa 2'),
        });
        break;
      }
    }

    // Theory tip
    const tipContent = renderContextualTip(activeScenario);
    sections.push({ title: 'Teoria', content: tipContent });

    return sections;
  }

  // Lazy imports for force calcs (avoids circular)
  function require_inclinedPlaneCalc(s) {
    const { inclinedPlane } = require('../../math/force-math.js');
    return inclinedPlane(s);
  }
  function require_springCalc(s) {
    const { springForce } = require('../../math/force-math.js');
    return springForce(s);
  }
  function require_frictionCalc(s) {
    const { frictionForce } = require('../../math/force-math.js');
    return frictionForce(s);
  }
  function require_equilibriumCalc(forces) {
    const { isEquilibrium } = require('../../math/vector-math.js');
    return isEquilibrium(forces);
  }
  function require_pulleyCalc(s) {
    const { pulleySystem } = require('../../math/force-math.js');
    return pulleySystem(s);
  }

  function wireUpInputs() {
    // Point forces inputs
    if (activeScenario === 'point-forces') {
      scenarioState.forces.forEach((f, i) => {
        const xInput = rightPanel.querySelector(`#f-${i}-x`);
        const yInput = rightPanel.querySelector(`#f-${i}-y`);
        if (xInput) xInput.addEventListener('change', (e) => { f.x = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
        if (yInput) yInput.addEventListener('change', (e) => { f.y = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
      });
      const addBtn = rightPanel.querySelector('#add-force');
      if (addBtn) addBtn.addEventListener('click', () => {
        scenarioState.forces.push({ x: 1, y: 1, name: `F${scenarioState.forces.length + 1}` });
        updateScene();
        updatePanel();
      });
    }

    // Inclined plane inputs
    if (activeScenario === 'inclined-plane') {
      bindInput('ip-mass', 'mass');
      bindInput('ip-angle', 'angleDeg');
      bindInput('ip-friction', 'frictionCoeff');
    }

    // Spring inputs
    if (activeScenario === 'spring') {
      bindInput('sp-k', 'k');
      bindInput('sp-x', 'x');
    }

    // Friction inputs
    if (activeScenario === 'friction') {
      bindInput('fr-mass', 'mass');
      bindInput('fr-applied', 'appliedForce');
      bindInput('fr-static', 'staticCoeff');
      bindInput('fr-dynamic', 'dynamicCoeff');
    }

    // Equilibrium inputs
    if (activeScenario === 'equilibrium') {
      scenarioState.forces.forEach((f, i) => {
        const xInput = rightPanel.querySelector(`#eq-${i}-x`);
        const yInput = rightPanel.querySelector(`#eq-${i}-y`);
        if (xInput) xInput.addEventListener('change', (e) => { f.x = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
        if (yInput) yInput.addEventListener('change', (e) => { f.y = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
      });
      const addBtn = rightPanel.querySelector('#add-eq-force');
      if (addBtn) addBtn.addEventListener('click', () => {
        scenarioState.forces.push({ x: 1, y: 1, name: `F${scenarioState.forces.length + 1}` });
        updateScene();
        updatePanel();
      });
    }

    // Pulley inputs
    if (activeScenario === 'pulley') {
      bindInput('pu-m1', 'mass1');
      bindInput('pu-m2', 'mass2');
    }
  }

  function bindInput(inputId, stateKey) {
    const input = rightPanel.querySelector(`#${inputId}`);
    if (input) {
      input.addEventListener('change', (e) => {
        scenarioState[stateKey] = parseFloat(e.target.value) || 0;
        updateScene();
        updatePanel();
      });
    }
  }

  const labelInterval = setInterval(() => labels.update(), 50);
  updateScene();
  updatePanel();

  return () => {
    clearInterval(labelInterval);
    unsubVis();
    labels.dispose();
    scene.dispose();
  };
}
```

- [ ] **Step 6: Update src/main.js — register forces route**

```js
import { renderForcesPage } from './simulator/forces/forces-page.js';

registerRoute('/forces', renderForcesPage);
```

- [ ] **Step 7: Commit**

```bash
git add src/simulator/forces/ tests/scenarios/point-forces.test.js src/main.js
git commit -m "feat: forces page shell with point forces scenario"
```

---

## Task 12: Inclined Plane Scenario

**Files:**
- Create: `src/simulator/forces/scenarios/inclined-plane.js`
- Create: `tests/scenarios/inclined-plane.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/scenarios/inclined-plane.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computeInclinedPlane } from '../../src/simulator/forces/scenarios/inclined-plane.js';

describe('computeInclinedPlane', () => {
  it('computes forces on 30-degree incline', () => {
    const r = computeInclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0 });
    expect(r.weight).toBeCloseTo(98.1, 1);
    expect(r.parallel).toBeCloseTo(49.05, 1);
    expect(r.slides).toBe(true);
  });

  it('detects no sliding with high friction', () => {
    const r = computeInclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0.8 });
    expect(r.slides).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/scenarios/inclined-plane.test.js`

- [ ] **Step 3: Implement inclined-plane.js**

Create `src/simulator/forces/scenarios/inclined-plane.js`:

```js
import * as THREE from 'three';
import { inclinedPlane } from '../../../math/force-math.js';
import { createArrow, getNextColor, resetColorIndex } from '../../vector-renderer.js';

export function computeInclinedPlane(params) {
  return inclinedPlane(params);
}

export function getInclinedPlaneConfig() {
  return {
    id: 'inclined-plane',
    label: 'Piano inclinato',
    defaults: { mass: 10, angleDeg: 30, frictionCoeff: 0.3 },
  };
}

export function renderInclinedPlane(sceneManager, state, visibility) {
  resetColorIndex();
  const calc = computeInclinedPlane(state);
  const angleRad = (state.angleDeg * Math.PI) / 180;

  // Draw the inclined plane surface
  const planeGeo = new THREE.BufferGeometry();
  const len = 8;
  const height = len * Math.sin(angleRad);
  const base = len * Math.cos(angleRad);

  const vertices = new Float32Array([
    -base / 2, 0, 0,
    base / 2, 0, 0,
    -base / 2, height, 0,
  ]);
  planeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x2a3a5c,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  sceneManager.objects.add(planeMesh);

  // Draw plane outline
  const outlineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-base / 2, 0, 0.01),
    new THREE.Vector3(base / 2, 0, 0.01),
    new THREE.Vector3(-base / 2, height, 0.01),
    new THREE.Vector3(-base / 2, 0, 0.01),
  ]);
  const outlineMat = new THREE.LineBasicMaterial({ color: 0x4fc3f7 });
  sceneManager.objects.add(new THREE.Line(outlineGeo, outlineMat));

  // Body (small box on the incline)
  if (visibility.body) {
    const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const boxMat = new THREE.MeshPhongMaterial({ color: 0xff7043 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    // Position on the incline
    const posX = 0;
    const posY = height / 2 + 0.4;
    box.position.set(posX, posY, 0);
    box.rotation.z = angleRad;
    sceneManager.objects.add(box);

    // Force arrows from the box center
    const cx = posX;
    const cy = posY;
    const origin = { x: cx, y: cy };
    const scale = 0.03; // scale forces for visual

    if (visibility.forceArrows) {
      // Weight (downward)
      const wArrow = createArrow(origin, { x: 0, y: -calc.weight * scale }, 0xff4444, 'Peso');
      if (wArrow) sceneManager.objects.add(wArrow);

      // Normal (perpendicular to plane, outward)
      const nx = -Math.sin(angleRad) * calc.normal * scale;
      const ny = Math.cos(angleRad) * calc.normal * scale;
      const nArrow = createArrow(origin, { x: nx, y: ny }, 0x66bb6a, 'Normale');
      if (nArrow) sceneManager.objects.add(nArrow);

      // Parallel component (along plane, downward)
      const px = Math.cos(angleRad) * calc.parallel * scale;
      const py = -Math.sin(angleRad) * calc.parallel * scale;
      const pArrow = createArrow(origin, { x: -px, y: -py }, 0xffa726, 'F parallela');
      if (pArrow) sceneManager.objects.add(pArrow);

      // Friction (along plane, upward if sliding)
      if (calc.friction > 0.01) {
        const fx = Math.cos(angleRad) * calc.friction * scale;
        const fy = Math.sin(angleRad) * calc.friction * scale;
        const fArrow = createArrow(origin, { x: fx, y: fy }, 0xab47bc, 'Attrito');
        if (fArrow) sceneManager.objects.add(fArrow);
      }

      if (visibility.components) {
        // Perpendicular component
        const perpx = -Math.sin(angleRad) * calc.perpendicular * scale;
        const perpy = Math.cos(angleRad) * calc.perpendicular * scale;
        const perpArrow = createArrow(origin, { x: perpx, y: perpy }, 0x26c6da, 'F perpendicolare');
        if (perpArrow) sceneManager.objects.add(perpArrow);
      }
    }
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/scenarios/inclined-plane.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulator/forces/scenarios/inclined-plane.js tests/scenarios/inclined-plane.test.js
git commit -m "feat: inclined plane scenario with force visualization"
```

---

## Task 13: Spring (Hooke) Scenario

**Files:**
- Create: `src/simulator/forces/scenarios/spring.js`
- Create: `tests/scenarios/spring.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/scenarios/spring.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computeSpring } from '../../src/simulator/forces/scenarios/spring.js';

describe('computeSpring', () => {
  it('calculates spring force', () => {
    const r = computeSpring({ k: 200, x: 0.5 });
    expect(r.force).toBeCloseTo(100, 5);
    expect(r.direction).toBe('restore');
  });

  it('returns 0 for no displacement', () => {
    const r = computeSpring({ k: 200, x: 0 });
    expect(r.force).toBe(0);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/scenarios/spring.test.js`

- [ ] **Step 3: Implement spring.js**

Create `src/simulator/forces/scenarios/spring.js`:

```js
import * as THREE from 'three';
import { springForce } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computeSpring(params) {
  return springForce(params);
}

export function getSpringConfig() {
  return {
    id: 'spring',
    label: 'Molla (Hooke)',
    defaults: { k: 100, x: 0.5 },
  };
}

export function renderSpring(sceneManager, state, visibility) {
  const calc = computeSpring(state);
  const restLength = 3;
  const displacement = state.x * 3; // visual scale

  // Wall
  const wallGeo = new THREE.PlaneGeometry(0.3, 3);
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x4a4a6a, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(-4, 0, 0);
  sceneManager.objects.add(wall);

  // Spring coils (zigzag line)
  const coils = 8;
  const springStart = -3.85;
  const springEnd = springStart + restLength + displacement;
  const coilWidth = 0.4;
  const points = [new THREE.Vector3(springStart, 0, 0.01)];

  const segLen = (springEnd - springStart) / (coils * 2);
  for (let i = 0; i < coils * 2; i++) {
    const x = springStart + segLen * (i + 1);
    const y = i % 2 === 0 ? coilWidth : -coilWidth;
    points.push(new THREE.Vector3(x, y, 0.01));
  }
  points.push(new THREE.Vector3(springEnd, 0, 0.01));

  const springGeo = new THREE.BufferGeometry().setFromPoints(points);
  const springMat = new THREE.LineBasicMaterial({ color: 0x4fc3f7 });
  sceneManager.objects.add(new THREE.Line(springGeo, springMat));

  // Body attached to spring
  if (visibility.body) {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshPhongMaterial({ color: 0xff7043 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(springEnd + 0.5, 0, 0);
    sceneManager.objects.add(box);

    // Force arrow
    if (visibility.forceArrows && calc.force > 0.01) {
      const forceDir = state.x > 0 ? -1 : 1;
      const arrowLen = calc.force * 0.03;
      const arrow = createArrow(
        { x: springEnd + 0.5, y: 0 },
        { x: forceDir * arrowLen, y: 0 },
        0x66bb6a,
        'F elastica'
      );
      if (arrow) sceneManager.objects.add(arrow);
    }
  }

  // Rest position marker
  const restGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(springStart + restLength, -1.5, 0.01),
    new THREE.Vector3(springStart + restLength, 1.5, 0.01),
  ]);
  const restMat = new THREE.LineDashedMaterial({ color: 0xffff00, dashSize: 0.2, gapSize: 0.1 });
  const restLine = new THREE.Line(restGeo, restMat);
  restLine.computeLineDistances();
  sceneManager.objects.add(restLine);
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/scenarios/spring.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulator/forces/scenarios/spring.js tests/scenarios/spring.test.js
git commit -m "feat: spring (Hooke) scenario with coil visualization"
```

---

## Task 14: Friction Scenario

**Files:**
- Create: `src/simulator/forces/scenarios/friction.js`
- Create: `tests/scenarios/friction.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/scenarios/friction.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computeFriction } from '../../src/simulator/forces/scenarios/friction.js';

describe('computeFriction', () => {
  it('detects static friction', () => {
    const r = computeFriction({ mass: 10, appliedForce: 20, staticCoeff: 0.5, dynamicCoeff: 0.3 });
    expect(r.type).toBe('static');
    expect(r.moves).toBe(false);
  });

  it('detects dynamic friction', () => {
    const r = computeFriction({ mass: 10, appliedForce: 60, staticCoeff: 0.5, dynamicCoeff: 0.3 });
    expect(r.type).toBe('dynamic');
    expect(r.moves).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/scenarios/friction.test.js`

- [ ] **Step 3: Implement friction.js**

Create `src/simulator/forces/scenarios/friction.js`:

```js
import * as THREE from 'three';
import { frictionForce, weight } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computeFriction(params) {
  return frictionForce(params);
}

export function getFrictionConfig() {
  return {
    id: 'friction',
    label: 'Attrito',
    defaults: { mass: 10, appliedForce: 30, staticCoeff: 0.5, dynamicCoeff: 0.3 },
  };
}

export function renderFriction(sceneManager, state, visibility) {
  const calc = computeFriction(state);
  const W = weight(state.mass);
  const scale = 0.03;

  // Ground surface
  const groundGeo = new THREE.PlaneGeometry(16, 0.3);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x3a3a5a, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -0.65, 0);
  sceneManager.objects.add(ground);

  // Friction hatching
  for (let i = -7; i < 8; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -0.8, 0.01),
      new THREE.Vector3(i - 0.4, -1.2, 0.01),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x5a5a7a });
    sceneManager.objects.add(new THREE.Line(lineGeo, lineMat));
  }

  // Body
  if (visibility.body) {
    const boxGeo = new THREE.BoxGeometry(1.5, 1, 1);
    const boxMat = new THREE.MeshPhongMaterial({ color: 0xff7043 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0, 0);
    sceneManager.objects.add(box);
  }

  const origin = { x: 0, y: 0 };

  if (visibility.forceArrows) {
    // Weight
    const wArrow = createArrow(origin, { x: 0, y: -W * scale }, 0xff4444, 'Peso');
    if (wArrow) sceneManager.objects.add(wArrow);

    // Normal
    const nArrow = createArrow(origin, { x: 0, y: W * scale }, 0x66bb6a, 'Normale');
    if (nArrow) sceneManager.objects.add(nArrow);

    // Applied force
    const aArrow = createArrow(origin, { x: state.appliedForce * scale, y: 0 }, 0x4fc3f7, 'F applicata');
    if (aArrow) sceneManager.objects.add(aArrow);

    // Friction force (opposite direction)
    const fArrow = createArrow(origin, { x: -calc.frictionValue * scale, y: 0 }, 0xffa726, 'Attrito');
    if (fArrow) sceneManager.objects.add(fArrow);
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/scenarios/friction.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulator/forces/scenarios/friction.js tests/scenarios/friction.test.js
git commit -m "feat: friction scenario with static/dynamic detection"
```

---

## Task 15: Equilibrium Scenario

**Files:**
- Create: `src/simulator/forces/scenarios/equilibrium.js`
- Create: `tests/scenarios/equilibrium.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/scenarios/equilibrium.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computeEquilibrium } from '../../src/simulator/forces/scenarios/equilibrium.js';

describe('computeEquilibrium', () => {
  it('detects equilibrium', () => {
    const r = computeEquilibrium([{ x: 5, y: 0 }, { x: -5, y: 0 }]);
    expect(r.balanced).toBe(true);
  });

  it('detects non-equilibrium and provides missing force', () => {
    const r = computeEquilibrium([{ x: 5, y: 3 }, { x: -2, y: 0 }]);
    expect(r.balanced).toBe(false);
    expect(r.missingForce.x).toBeCloseTo(-3, 5);
    expect(r.missingForce.y).toBeCloseTo(-3, 5);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/scenarios/equilibrium.test.js`

- [ ] **Step 3: Implement equilibrium.js**

Create `src/simulator/forces/scenarios/equilibrium.js`:

```js
import { isEquilibrium } from '../../../math/force-math.js';
import { createArrow, createResultantArrow, getNextColor, resetColorIndex } from '../../vector-renderer.js';

export function computeEquilibrium(forces) {
  return isEquilibrium(forces);
}

export function getEquilibriumConfig() {
  return {
    id: 'equilibrium',
    label: 'Equilibrio',
    defaultForces: [
      { x: 3, y: 2, name: 'F1' },
      { x: -3, y: -2, name: 'F2' },
    ],
  };
}

export function renderEquilibrium(sceneManager, state, visibility) {
  resetColorIndex();
  const forces = state.forces;
  const calc = computeEquilibrium(forces);

  if (visibility.body) {
    // Draw a small circle at the origin
    const circleGeo = new THREE.RingGeometry(0.15, 0.2, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.position.set(0, 0, 0.01);
    sceneManager.objects.add(circle);
  }

  if (visibility.forceArrows) {
    forces.forEach((f) => {
      const color = getNextColor();
      const arrow = createArrow({ x: 0, y: 0 }, f, color, f.name);
      if (arrow) sceneManager.objects.add(arrow);
    });

    // Show resultant if not in equilibrium
    if (!calc.balanced) {
      const rArrow = createResultantArrow({ x: 0, y: 0 }, calc.resultant);
      if (rArrow) sceneManager.objects.add(rArrow);

      // Show missing force (dashed style — use different color)
      const mArrow = createArrow({ x: 0, y: 0 }, calc.missingForce, 0xffff00, 'F mancante');
      if (mArrow) sceneManager.objects.add(mArrow);
    }
  }
}

// Need THREE for body rendering
import * as THREE from 'three';
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/scenarios/equilibrium.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulator/forces/scenarios/equilibrium.js tests/scenarios/equilibrium.test.js
git commit -m "feat: equilibrium scenario with missing force indicator"
```

---

## Task 16: Pulley Scenario

**Files:**
- Create: `src/simulator/forces/scenarios/pulley.js`
- Create: `tests/scenarios/pulley.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/scenarios/pulley.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computePulley } from '../../src/simulator/forces/scenarios/pulley.js';

describe('computePulley', () => {
  it('calculates Atwood machine', () => {
    const r = computePulley({ mass1: 10, mass2: 5 });
    expect(r.acceleration).toBeCloseTo(3.27, 1);
    expect(r.tension).toBeCloseTo(65.4, 1);
    expect(r.heavierSide).toBe('mass1');
  });

  it('handles equal masses', () => {
    const r = computePulley({ mass1: 5, mass2: 5 });
    expect(r.acceleration).toBeCloseTo(0, 5);
    expect(r.heavierSide).toBe('balanced');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/scenarios/pulley.test.js`

- [ ] **Step 3: Implement pulley.js**

Create `src/simulator/forces/scenarios/pulley.js`:

```js
import * as THREE from 'three';
import { pulleySystem } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computePulley(params) {
  return pulleySystem(params);
}

export function getPulleyConfig() {
  return {
    id: 'pulley',
    label: 'Carrucola',
    defaults: { mass1: 10, mass2: 5 },
  };
}

export function renderPulley(sceneManager, state, visibility) {
  const calc = computePulley(state);
  const scale = 0.02;

  // Pulley wheel
  const wheelGeo = new THREE.RingGeometry(0.6, 0.7, 32);
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, side: THREE.DoubleSide });
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.position.set(0, 4, 0);
  sceneManager.objects.add(wheel);

  // Axle
  const axleGeo = new THREE.CircleGeometry(0.1, 16);
  const axleMat = new THREE.MeshBasicMaterial({ color: 0xe0e0e0 });
  const axle = new THREE.Mesh(axleGeo, axleMat);
  axle.position.set(0, 4, 0.01);
  sceneManager.objects.add(axle);

  // Support
  const supportGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2, 5, 0.01),
    new THREE.Vector3(2, 5, 0.01),
  ]);
  const supportMat = new THREE.LineBasicMaterial({ color: 0x6a6a8a });
  sceneManager.objects.add(new THREE.Line(supportGeo, supportMat));
  const supportVertGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 5, 0.01),
    new THREE.Vector3(0, 4.7, 0.01),
  ]);
  sceneManager.objects.add(new THREE.Line(supportVertGeo, supportMat));

  // Left rope + mass1
  const ropeLeft = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.65, 4, 0.01),
    new THREE.Vector3(-0.65, 0, 0.01),
  ]);
  const ropeMat = new THREE.LineBasicMaterial({ color: 0xc0c0c0 });
  sceneManager.objects.add(new THREE.Line(ropeLeft, ropeMat));

  // Right rope + mass2
  const ropeRight = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.65, 4, 0.01),
    new THREE.Vector3(0.65, 1, 0.01),
  ]);
  sceneManager.objects.add(new THREE.Line(ropeRight, ropeMat));

  if (visibility.body) {
    // Mass 1 (left, heavier by default)
    const box1Geo = new THREE.BoxGeometry(1, 1, 1);
    const box1Mat = new THREE.MeshPhongMaterial({ color: 0xff7043 });
    const box1 = new THREE.Mesh(box1Geo, box1Mat);
    box1.position.set(-0.65, -0.5, 0);
    sceneManager.objects.add(box1);

    // Mass 2 (right)
    const box2Geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const box2Mat = new THREE.MeshPhongMaterial({ color: 0x66bb6a });
    const box2 = new THREE.Mesh(box2Geo, box2Mat);
    box2.position.set(0.65, 0.6, 0);
    sceneManager.objects.add(box2);

    if (visibility.forceArrows) {
      // Weight arrows
      const w1Arrow = createArrow({ x: -0.65, y: -0.5 }, { x: 0, y: -calc.weight1 * scale }, 0xff4444, `P1 = ${calc.weight1.toFixed(1)} N`);
      if (w1Arrow) sceneManager.objects.add(w1Arrow);

      const w2Arrow = createArrow({ x: 0.65, y: 0.6 }, { x: 0, y: -calc.weight2 * scale }, 0xff4444, `P2 = ${calc.weight2.toFixed(1)} N`);
      if (w2Arrow) sceneManager.objects.add(w2Arrow);

      // Tension arrows (upward on both)
      const t1Arrow = createArrow({ x: -0.65, y: -0.5 }, { x: 0, y: calc.tension * scale }, 0x4fc3f7, `T = ${calc.tension.toFixed(1)} N`);
      if (t1Arrow) sceneManager.objects.add(t1Arrow);

      const t2Arrow = createArrow({ x: 0.65, y: 0.6 }, { x: 0, y: calc.tension * scale }, 0x4fc3f7, `T = ${calc.tension.toFixed(1)} N`);
      if (t2Arrow) sceneManager.objects.add(t2Arrow);
    }
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npx vitest run tests/scenarios/pulley.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulator/forces/scenarios/pulley.js tests/scenarios/pulley.test.js
git commit -m "feat: pulley (Atwood machine) scenario"
```

---

## Task 17: Theory Data & Theory Page

**Files:**
- Create: `src/theory/theory-data.js`
- Create: `src/theory/contextual-tip.js`
- Create: `src/theory/theory-page.js`
- Create: `src/styles/theory.css`

- [ ] **Step 1: Create src/theory/theory-data.js**

```js
export const THEORY_TOPICS = {
  // === VETTORI ===
  'vector-basics': {
    title: 'Vettori e Scalari',
    category: 'vettori',
    content: `
      <p>Una <strong>grandezza scalare</strong> e descritta solo da un numero e un'unita di misura (es. massa = 5 kg, temperatura = 20°C).</p>
      <p>Una <strong>grandezza vettoriale</strong> ha bisogno anche di una direzione e un verso (es. forza = 10 N verso destra, velocita = 30 km/h verso nord).</p>
      <p>Un <strong>vettore</strong> si rappresenta con una freccia: la lunghezza indica il modulo, la retta su cui giace indica la direzione, la punta indica il verso.</p>
    `,
    formula: null,
  },
  'vector-module': {
    title: 'Modulo, Direzione, Verso',
    category: 'vettori',
    content: `
      <p><strong>Modulo:</strong> la "lunghezza" del vettore, si calcola con il teorema di Pitagora se si conoscono le componenti.</p>
      <p><strong>Direzione:</strong> la retta su cui giace il vettore (es. orizzontale, a 30° rispetto all'asse x).</p>
      <p><strong>Verso:</strong> indica "da che parte" punta la freccia sulla direzione.</p>
    `,
    formula: '|V| = sqrt(Vx² + Vy²)\nAngolo: θ = arctan(Vy / Vx)',
    example: 'V = (3, 4) → |V| = sqrt(9 + 16) = sqrt(25) = 5\nθ = arctan(4/3) ≈ 53.1°',
  },
  'vector-sum': {
    title: 'Somma di Vettori',
    category: 'vettori',
    content: `
      <p>Per sommare due vettori si sommano le loro componenti:</p>
      <p><strong>Metodo delle componenti:</strong> Rx = Ax + Bx, Ry = Ay + By</p>
      <p><strong>Metodo punta-coda:</strong> si mette la coda del secondo vettore sulla punta del primo. La risultante va dalla coda del primo alla punta del secondo.</p>
      <p><strong>Metodo del parallelogramma:</strong> i due vettori partono dallo stesso punto, si completa il parallelogramma, la diagonale e la risultante.</p>
    `,
    formula: 'R = A + B\nRx = Ax + Bx\nRy = Ay + By\n|R| = sqrt(Rx² + Ry²)',
    example: 'A = (3, 0), B = (0, 4)\nR = (3, 4) → |R| = 5',
  },
  'vector-decompose': {
    title: 'Scomposizione di un Vettore',
    category: 'vettori',
    content: `
      <p>Scomporre un vettore significa trovare le sue <strong>componenti</strong> lungo gli assi x e y.</p>
      <p>Conoscendo il modulo |F| e l'angolo θ rispetto all'asse x:</p>
    `,
    formula: 'Fx = F · cos(θ)\nFy = F · sin(θ)',
    example: 'F = 10 N, θ = 30°\nFx = 10 · cos(30°) = 10 · 0.866 = 8.66 N\nFy = 10 · sin(30°) = 10 · 0.5 = 5 N',
  },
  'vector-multiply': {
    title: 'Moltiplicazione Scalare per Vettore',
    category: 'vettori',
    content: `
      <p>Moltiplicare un vettore per uno scalare cambia il suo modulo senza cambiarne la direzione (se lo scalare e positivo) o inverte il verso (se negativo).</p>
    `,
    formula: 'k · V = (k · Vx, k · Vy)',
    example: 'V = (2, 3), k = 3\n3 · V = (6, 9)\n|3V| = 3 · |V|',
  },

  // === FORZE ===
  'force-basics': {
    title: "Cos'e una Forza",
    category: 'forze',
    content: `
      <p>Una <strong>forza</strong> e una grandezza vettoriale che descrive l'interazione tra due corpi. Si misura in <strong>Newton (N)</strong>.</p>
      <p>Una forza puo: mettere in moto un corpo, fermarlo, cambiarne la direzione, o deformarlo.</p>
    `,
    formula: 'F = m · a (Secondo principio di Newton)',
    example: 'Un corpo di 5 kg accelerato a 2 m/s²:\nF = 5 · 2 = 10 N',
  },
  'force-weight': {
    title: 'Forza Peso',
    category: 'forze',
    content: `
      <p>La <strong>forza peso</strong> e la forza con cui la Terra attira un corpo. E sempre diretta verso il basso (centro della Terra).</p>
      <p><strong>g = 9.81 m/s²</strong> (accelerazione di gravita)</p>
    `,
    formula: 'P = m · g',
    example: 'Massa = 10 kg\nP = 10 · 9.81 = 98.1 N',
  },
  'force-normal': {
    title: 'Forza Normale',
    category: 'forze',
    content: `
      <p>La <strong>forza normale</strong> e la reazione del piano di appoggio. E sempre perpendicolare alla superficie e diretta verso l'esterno.</p>
      <p>Su un piano orizzontale senza altre forze verticali: N = P.</p>
    `,
    formula: 'N = P · cos(α) (su piano inclinato)',
    example: 'Piano inclinato a 30°, massa 10 kg:\nN = 98.1 · cos(30°) = 84.96 N',
  },
  'force-hooke': {
    title: 'Forza Elastica (Hooke)',
    category: 'forze',
    content: `
      <p>La <strong>legge di Hooke</strong> descrive la forza esercitata da una molla: e proporzionale alla deformazione e diretta in verso opposto.</p>
      <p><strong>k</strong> = costante elastica della molla (N/m)</p>
      <p><strong>x</strong> = deformazione (allungamento o compressione) rispetto alla posizione di riposo</p>
    `,
    formula: 'F = -k · x',
    example: 'k = 200 N/m, x = 0.1 m (allungamento)\nF = -200 · 0.1 = -20 N (verso la posizione di riposo)',
  },
  'force-friction': {
    title: 'Attrito',
    category: 'forze',
    content: `
      <p>L'<strong>attrito</strong> e una forza che si oppone al moto (o al tentativo di moto) tra due superfici a contatto.</p>
      <p><strong>Attrito statico:</strong> impedisce al corpo di muoversi. Cresce fino a un massimo (F_s,max = μ_s · N).</p>
      <p><strong>Attrito dinamico:</strong> agisce quando il corpo e gia in moto. E costante (F_d = μ_d · N) e minore del massimo statico.</p>
    `,
    formula: 'Attrito statico max: F_s = μ_s · N\nAttrito dinamico: F_d = μ_d · N\nμ_s > μ_d',
    example: 'Massa 10 kg, μ_s = 0.5, μ_d = 0.3\nF_s,max = 0.5 · 98.1 = 49.05 N\nF_d = 0.3 · 98.1 = 29.43 N',
  },
  'inclined-plane': {
    title: 'Piano Inclinato',
    category: 'forze',
    content: `
      <p>Su un <strong>piano inclinato</strong> il peso si scompone in due componenti:</p>
      <p><strong>Componente parallela:</strong> tende a far scivolare il corpo lungo il piano.</p>
      <p><strong>Componente perpendicolare:</strong> preme il corpo contro il piano (bilanciata dalla normale).</p>
    `,
    formula: 'F_parallela = P · sin(α)\nF_perpendicolare = P · cos(α)\nN = F_perpendicolare\nAttrito = μ · N',
    example: 'Massa 10 kg, angolo 30°, μ = 0.3\nF_par = 98.1 · sin(30°) = 49.05 N\nF_perp = 98.1 · cos(30°) = 84.96 N\nAttrito = 0.3 · 84.96 = 25.49 N\nF_netta = 49.05 - 25.49 = 23.56 N → scivola!',
  },
  'force-tension': {
    title: 'Tensione (Funi e Carrucole)',
    category: 'forze',
    content: `
      <p>La <strong>tensione</strong> e la forza trasmessa attraverso una fune. In una fune ideale (senza massa) la tensione e uguale in ogni punto.</p>
      <p>In una <strong>macchina di Atwood</strong> (due masse collegate da una fune su una carrucola):</p>
    `,
    formula: 'a = g · (m1 - m2) / (m1 + m2)\nT = 2 · m1 · m2 · g / (m1 + m2)',
    example: 'm1 = 10 kg, m2 = 5 kg\na = 9.81 · 5 / 15 = 3.27 m/s²\nT = 2 · 10 · 5 · 9.81 / 15 = 65.4 N',
  },
  'equilibrium': {
    title: 'Equilibrio di un Corpo',
    category: 'forze',
    content: `
      <p>Un corpo e in <strong>equilibrio</strong> quando la somma di tutte le forze applicate e zero (la risultante e nulla).</p>
      <p>Se non e in equilibrio, la risultante indica la direzione in cui il corpo accelerera.</p>
    `,
    formula: 'Equilibrio: ΣF = 0\nΣFx = 0 e ΣFy = 0',
    example: 'Tre forze: F1 = (3, 0), F2 = (0, 4), F3 = (-3, -4)\nΣF = (0, 0) → Equilibrio!',
  },
  'point-forces': {
    title: 'Forze su un Punto',
    category: 'forze',
    content: `
      <p>Quando piu forze agiscono su un <strong>stesso punto</strong>, si possono sommare vettorialmente per trovare la <strong>risultante</strong>.</p>
    `,
    formula: 'R = F1 + F2 + ... + Fn\nRx = ΣFx, Ry = ΣFy\n|R| = sqrt(Rx² + Ry²)',
    example: 'F1 = (3, 0) N, F2 = (0, 4) N\nR = (3, 4) → |R| = 5 N a 53.1°',
  },
};

export function getTopicsByCategory(category) {
  return Object.entries(THEORY_TOPICS)
    .filter(([, topic]) => topic.category === category)
    .map(([id, topic]) => ({ id, ...topic }));
}

export function getTopic(id) {
  return THEORY_TOPICS[id] || null;
}
```

- [ ] **Step 2: Create src/theory/contextual-tip.js**

```js
import { getTopic } from './theory-data.js';

export function renderContextualTip(topicId) {
  const topic = getTopic(topicId);
  if (!topic) {
    return '<div class="theory-tip">Seleziona uno strumento per vedere la teoria.</div>';
  }

  let html = `<div class="theory-tip">`;
  if (topic.formula) {
    html += `<div class="theory-tip-formula">${topic.formula.replace(/\n/g, '<br>')}</div>`;
  }
  html += `<a class="theory-tip-link" href="#/theory?topic=${topicId}">Approfondisci →</a>`;
  html += `</div>`;
  return html;
}
```

- [ ] **Step 3: Create src/styles/theory.css**

```css
.theory-page {
  padding: 30px 40px;
  max-width: 800px;
  overflow-y: auto;
  height: 100%;
}

.theory-page h1 {
  font-size: 24px;
  color: var(--text-accent);
  margin-bottom: 24px;
}

.theory-category {
  margin-bottom: 30px;
}

.theory-category-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.theory-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.theory-card:hover {
  border-color: var(--accent);
}

.theory-card.expanded {
  border-color: var(--accent);
}

.theory-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.theory-card-content {
  display: none;
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 14px;
}

.theory-card.expanded .theory-card-content {
  display: block;
}

.theory-card-content p {
  margin-bottom: 8px;
}

.theory-formula-block {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin: 10px 0;
  font-family: var(--font-mono);
  color: var(--text-accent);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.theory-example-block {
  background: var(--bg-primary);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin: 10px 0;
  font-family: var(--font-mono);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}
```

- [ ] **Step 4: Create src/theory/theory-page.js**

```js
import '../styles/theory.css';
import { getTopicsByCategory } from './theory-data.js';

export function renderTheoryPage(container) {
  container.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'theory-page';

  page.innerHTML = `<h1>Teoria</h1>`;

  const categories = [
    { id: 'vettori', title: 'Vettori e Scalari' },
    { id: 'forze', title: 'Forze' },
  ];

  // Check for deep-link to specific topic
  const hash = window.location.hash;
  const topicParam = hash.includes('?topic=') ? hash.split('?topic=')[1] : null;

  categories.forEach((cat) => {
    const section = document.createElement('div');
    section.className = 'theory-category';
    section.innerHTML = `<div class="theory-category-title">${cat.title}</div>`;

    const topics = getTopicsByCategory(cat.id);
    topics.forEach((topic) => {
      const card = document.createElement('div');
      card.className = `theory-card ${topic.id === topicParam ? 'expanded' : ''}`;

      let contentHtml = topic.content;
      if (topic.formula) {
        contentHtml += `<div class="theory-formula-block">${topic.formula}</div>`;
      }
      if (topic.example) {
        contentHtml += `<div class="theory-example-block">${topic.example}</div>`;
      }

      card.innerHTML = `
        <div class="theory-card-title">${topic.title}</div>
        <div class="theory-card-content">${contentHtml}</div>
      `;

      card.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });

      section.appendChild(card);
    });

    page.appendChild(section);
  });

  container.appendChild(page);

  // Scroll to deep-linked topic
  if (topicParam) {
    const expanded = page.querySelector('.theory-card.expanded');
    if (expanded) expanded.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

- [ ] **Step 5: Update src/main.js — register theory route**

```js
import { renderTheoryPage } from './theory/theory-page.js';

registerRoute('/theory', renderTheoryPage);
```

- [ ] **Step 6: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/theory/ src/styles/theory.css src/main.js
git commit -m "feat: theory section with all topics and contextual tips"
```

---

## Task 18: Home Page & Settings Page

**Files:**
- Create: `src/components/home.js`
- Create: `src/components/settings.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create src/components/home.js**

```js
export function renderHomePage(container) {
  container.innerHTML = `
    <div style="padding: 40px; max-width: 700px;">
      <h1 style="font-size: 28px; color: var(--text-accent); margin-bottom: 8px;">
        Simulatore Forze e Vettori
      </h1>
      <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
        Strumento interattivo per lo studio della fisica — prima superiore
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <a href="#/vectors" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Simulatore Vettori
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Somma, differenza, scomposizione, moltiplicazione scalare e molto altro.
          </div>
        </a>

        <a href="#/forces" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Simulatore Forze
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Piano inclinato, molle, attrito, equilibrio, carrucole e forze su un punto.
          </div>
        </a>

        <a href="#/theory" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; grid-column: 1 / -1; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Teoria
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Consulta le formule, le definizioni e gli esempi per ogni argomento.
          </div>
        </a>
      </div>
    </div>
  `;

  // Hover effect
  container.querySelectorAll('.home-card').forEach((card) => {
    card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--accent)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--border-color)'; });
  });
}
```

- [ ] **Step 2: Create src/components/settings.js**

```js
import { getState, setTheme } from '../state.js';

export function renderSettingsPage(container) {
  const state = getState();

  container.innerHTML = `
    <div style="padding: 40px; max-width: 500px;">
      <h1 style="font-size: 24px; color: var(--text-accent); margin-bottom: 24px;">Impostazioni</h1>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 20px;">
        <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">Tema</div>

        <div style="display: flex; gap: 12px;">
          <button id="theme-dark" style="
            flex: 1; padding: 14px; border-radius: var(--radius);
            border: 2px solid ${state.theme === 'dark' ? 'var(--accent)' : 'var(--border-color)'};
            background: #1a1a2e; color: #e0e0e0; font-size: 14px; cursor: pointer;
          ">
            Dark
          </button>
          <button id="theme-light" style="
            flex: 1; padding: 14px; border-radius: var(--radius);
            border: 2px solid ${state.theme === 'light' ? 'var(--accent)' : 'var(--border-color)'};
            background: #f5f5f5; color: #212121; font-size: 14px; cursor: pointer;
          ">
            Light
          </button>
        </div>
      </div>

      <div style="margin-top: 24px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 20px;">
        <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Info</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          Simulatore Forze e Vettori v1.0<br>
          Per studenti di prima superiore — Liceo Scientifico Scienze Applicate
        </p>
      </div>
    </div>
  `;

  container.querySelector('#theme-dark').addEventListener('click', () => {
    setTheme('dark');
    renderSettingsPage(container); // re-render to update button styles
  });

  container.querySelector('#theme-light').addEventListener('click', () => {
    setTheme('light');
    renderSettingsPage(container);
  });
}
```

- [ ] **Step 3: Update src/main.js — wire all routes**

Replace `src/main.js` entirely:

```js
import './styles/global.css';
import './styles/sidebar.css';
import './styles/simulator.css';
import { renderSidebar } from './components/sidebar.js';
import { initRouter, registerRoute } from './router.js';
import { renderHomePage } from './components/home.js';
import { renderSettingsPage } from './components/settings.js';
import { renderVectorsPage } from './simulator/vectors/vectors-page.js';
import { renderForcesPage } from './simulator/forces/forces-page.js';
import { renderTheoryPage } from './theory/theory-page.js';
import './state.js';

const app = document.getElementById('app');

renderSidebar(app);

const main = document.createElement('main');
main.id = 'main-content';
main.style.flex = '1';
main.style.overflow = 'hidden';
main.style.position = 'relative';
app.appendChild(main);

registerRoute('/home', renderHomePage);
registerRoute('/vectors', renderVectorsPage);
registerRoute('/forces', renderForcesPage);
registerRoute('/theory', renderTheoryPage);
registerRoute('/settings', renderSettingsPage);

initRouter(main);
```

- [ ] **Step 4: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/home.js src/components/settings.js src/main.js
git commit -m "feat: home page and settings page with theme toggle"
```

---

## Task 19: Fix Forces Page Imports & Integration

**Files:**
- Modify: `src/simulator/forces/forces-page.js` (fix require calls to use imports)

- [ ] **Step 1: Fix require() calls to use proper imports**

The forces-page.js uses `require()` which won't work in ES modules. Replace the lazy require functions at the bottom of `forces-page.js`:

Remove these functions:
```js
function require_inclinedPlaneCalc(s) { ... }
function require_springCalc(s) { ... }
function require_frictionCalc(s) { ... }
function require_equilibriumCalc(forces) { ... }
function require_pulleyCalc(s) { ... }
```

Add at the top of the file with the other imports:
```js
import { inclinedPlane, springForce, frictionForce, pulleySystem } from '../../math/force-math.js';
import { isEquilibrium } from '../../math/force-math.js';
```

Replace in `buildPanelSections()`:
- `require_inclinedPlaneCalc(s)` → `inclinedPlane(s)`
- `require_springCalc(s)` → `springForce(s)`
- `require_frictionCalc(s)` → `frictionForce(s)`
- `require_equilibriumCalc(forces)` → `isEquilibrium(forces)`
- `require_pulleyCalc(s)` → `pulleySystem(s)`

- [ ] **Step 2: Verify build**

Run: `npx vite build` — Expected: no errors.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/simulator/forces/forces-page.js
git commit -m "fix: replace require() with ES module imports in forces page"
```

---

## Task 20: Electron Packaging for Windows

**Files:**
- Modify: `package.json` (verify build config)
- Modify: `electron/main.js` (verify production path)

- [ ] **Step 1: Verify electron/main.js handles production correctly**

Read `electron/main.js` and confirm the production path loads from `dist/index.html`. Already implemented in Task 1 — verify no changes needed.

- [ ] **Step 2: Build the renderer**

Run:
```bash
cd /home/user/code-server/Simulatore-Forze-Fisica
npx vite build
```

Expected: `dist/` folder with `index.html` and bundled JS/CSS.

- [ ] **Step 3: Verify all tests pass**

Run:
```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Test Electron in dev mode**

Run:
```bash
npx electron . &
sleep 3
kill %1
```

Expected: Electron window opens (may fail in headless environment — verify no JS errors).

- [ ] **Step 5: Build Windows installer**

Run:
```bash
npx electron-builder --win --dir
```

Expected: `release/` folder with packaged app. Note: cross-compilation from Linux to Windows may require `wine` installed. If it fails, document the step for the user to run on their Windows machine.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete app with Electron packaging for Windows"
```

---

## Summary

| Task | Description | Tests |
|------|-------------|-------|
| 1 | Project scaffolding & Electron | - |
| 2 | Theme system & global styles | - |
| 3 | Global state manager | - |
| 4 | Sidebar & router | - |
| 5 | Vector math engine | 14 tests |
| 6 | Force math engine | 12 tests |
| 7 | Three.js scene manager | - |
| 8 | Vector renderer & labels | - |
| 9 | Simulator layout & UI components | - |
| 10 | Vectors simulator page | - |
| 11 | Forces page + point forces | 2 tests |
| 12 | Inclined plane scenario | 2 tests |
| 13 | Spring (Hooke) scenario | 2 tests |
| 14 | Friction scenario | 2 tests |
| 15 | Equilibrium scenario | 2 tests |
| 16 | Pulley scenario | 2 tests |
| 17 | Theory section (data + page + tips) | - |
| 18 | Home page & settings | - |
| 19 | Fix imports & integration | - |
| 20 | Electron packaging for Windows | - |
