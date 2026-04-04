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

  const layout = container.querySelector('#simulator-layout');
  const fsBtn = container.querySelector('#fullscreen-btn');

  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      layout.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
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
  });

  return {
    canvasContainer: container.querySelector('#canvas-container'),
    toolbar: container.querySelector('#toolbar'),
    rightPanel: container.querySelector('#right-panel'),
  };
}
