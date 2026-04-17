import { getState, toggleVisibility, subscribe } from '../state.js';

// Etichette complete di tutte le possibili voci (lo scenario ne seleziona un sottoinsieme)
const VISIBILITY_LABELS = {
  body: 'Corpo/oggetto',
  forceArrows: 'Frecce forze',
  components: 'Componenti (Px, Py)',
  grid: 'Griglia',
};

/**
 * @param {HTMLElement} container
 * @param {Array<string>} [allowedKeys] - se passato, mostra solo le voci con queste chiavi.
 *                                        Altrimenti mostra tutte.
 */
export function renderVisibilityMenu(container, allowedKeys) {
  // Remove existing visibility section if present
  const existing = container.querySelector('.visibility-section');
  if (existing) existing.remove();

  const section = document.createElement('div');
  section.className = 'panel-section visibility-section';
  section.innerHTML = '<div class="panel-section-title">Visibilit\u00e0</div>';

  const state = getState();
  const keys = allowedKeys && allowedKeys.length ? allowedKeys : Object.keys(VISIBILITY_LABELS);
  const visibleKeys = keys.filter((k) => VISIBILITY_LABELS[k]);

  for (const key of visibleKeys) {
    const label = VISIBILITY_LABELS[key];
    const row = document.createElement('div');
    row.className = 'toggle-row';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const toggle = document.createElement('div');
    toggle.className = `toggle-switch ${state.visibility[key] ? 'on' : ''}`;
    toggle.dataset.key = key;
    toggle.addEventListener('click', () => { toggleVisibility(key); });
    row.appendChild(labelEl);
    row.appendChild(toggle);
    section.appendChild(row);
  }

  const unsub = subscribe((newState) => {
    const toggles = section.querySelectorAll('.toggle-switch');
    toggles.forEach((toggle) => {
      const k = toggle.dataset.key;
      toggle.classList.toggle('on', !!newState.visibility[k]);
    });
  });

  container.appendChild(section);
  return unsub;
}
