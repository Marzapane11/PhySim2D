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

document.documentElement.setAttribute('data-theme', state.theme);
