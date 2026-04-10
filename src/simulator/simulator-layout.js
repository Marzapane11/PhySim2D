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

  function triggerResize() {
    // Use requestAnimationFrame to ensure CSS layout is complete before resizing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Force canvas to re-measure by briefly changing size
        const canvasEl = container.querySelector('#canvas-container canvas');
        if (canvasEl) {
          canvasEl.style.width = '1px';
          canvasEl.style.height = '1px';
          requestAnimationFrame(() => {
            canvasEl.style.width = '';
            canvasEl.style.height = '';
            window.dispatchEvent(new Event('resize'));
          });
        } else {
          window.dispatchEvent(new Event('resize'));
        }
      });
    });
  }

  fsBtn.addEventListener('click', () => {
    layout.classList.toggle('is-fullscreen');
    triggerResize();
  });

  // ESC to exit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && layout.classList.contains('is-fullscreen')) {
      layout.classList.remove('is-fullscreen');
      triggerResize();
    }
  });

  return {
    canvasContainer: container.querySelector('#canvas-container'),
    toolbar: container.querySelector('#toolbar'),
    rightPanel: container.querySelector('#right-panel'),
  };
}
