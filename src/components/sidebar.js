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
    const currentPath = (window.location.hash.slice(1) || '/home').split('?')[0];
    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.path === currentPath);
    });
  }

  window.addEventListener('hashchange', updateActive);
  updateActive();

  container.appendChild(sidebar);
}
