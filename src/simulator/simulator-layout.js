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
