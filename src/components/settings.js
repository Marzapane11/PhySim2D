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
          ">Dark</button>
          <button id="theme-light" style="
            flex: 1; padding: 14px; border-radius: var(--radius);
            border: 2px solid ${state.theme === 'light' ? 'var(--accent)' : 'var(--border-color)'};
            background: #f5f5f5; color: #212121; font-size: 14px; cursor: pointer;
          ">Light</button>
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
  container.querySelector('#theme-dark').addEventListener('click', () => { setTheme('dark'); renderSettingsPage(container); });
  container.querySelector('#theme-light').addEventListener('click', () => { setTheme('light'); renderSettingsPage(container); });
}
