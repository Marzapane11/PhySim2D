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
  section.innerHTML = '<div class="panel-section-title">Visibilita</div>';

  const state = getState();

  for (const [key, label] of Object.entries(VISIBILITY_LABELS)) {
    const row = document.createElement('div');
    row.className = 'toggle-row';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const toggle = document.createElement('div');
    toggle.className = `toggle-switch ${state.visibility[key] ? 'on' : ''}`;
    toggle.addEventListener('click', () => { toggleVisibility(key); });
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
