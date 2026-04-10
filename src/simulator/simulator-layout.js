export function createSimulatorLayout(container) {
  container.innerHTML = `
    <div class="simulator-layout" id="simulator-layout">
      <div class="canvas-area">
        <div class="canvas-container" id="canvas-container">
          <button class="fullscreen-btn" id="fullscreen-btn" title="Schermo intero">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          </button>
        </div>
        <div class="toolbar" id="toolbar"></div>
      </div>
      <div class="right-panel" id="right-panel"></div>
    </div>
  `;

  const fsBtn = container.querySelector('#fullscreen-btn');
  let isFullscreen = false;

  function enterFullscreen() {
    isFullscreen = true;
    // Hide sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';
    // Make main content fill the screen
    const main = document.getElementById('main-content');
    if (main) main.style.flex = '1';
    // Request browser fullscreen
    document.documentElement.requestFullscreen().catch(() => {});
    updateIcon();
  }

  function exitFullscreen() {
    isFullscreen = false;
    // Show sidebar again
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = '';
    // Exit browser fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    updateIcon();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }

  function updateIcon() {
    if (isFullscreen) {
      fsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M4 14h6v6m10-10h-6V4M4 10h6V4m10 10h-6v6"/>
      </svg>`;
      fsBtn.title = 'Esci da schermo intero';
    } else {
      fsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
      </svg>`;
      fsBtn.title = 'Schermo intero';
    }
  }

  fsBtn.addEventListener('click', () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  });

  // Handle ESC key or browser exit fullscreen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreen) {
      isFullscreen = false;
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.style.display = '';
      updateIcon();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
  });

  return {
    canvasContainer: container.querySelector('#canvas-container'),
    toolbar: container.querySelector('#toolbar'),
    rightPanel: container.querySelector('#right-panel'),
  };
}
