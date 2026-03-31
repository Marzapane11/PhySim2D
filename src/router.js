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
