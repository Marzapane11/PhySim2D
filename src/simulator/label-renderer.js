export class LabelManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
    canvasContainer.style.position = 'relative';
    canvasContainer.appendChild(this.overlay);
    this.labels = [];
  }

  addLabel(text, object3D, camera, renderer) {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;color:#e0e0e0;font-size:11px;font-family:var(--font-mono);background:rgba(0,0,0,0.6);padding:2px 6px;border-radius:3px;white-space:nowrap;transform:translate(-50%,-100%);';
    el.textContent = text;
    this.overlay.appendChild(el);
    this.labels.push({ el, object3D, camera, renderer });
    return el;
  }

  update() {
    for (const label of this.labels) {
      const { el, object3D, camera, renderer } = label;
      const vec = object3D.position.clone();
      vec.project(camera);
      const canvas = renderer.domElement;
      const x = (vec.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-vec.y * 0.5 + 0.5) * canvas.clientHeight;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.display = vec.z > 1 ? 'none' : 'block';
    }
  }

  clear() {
    this.labels = [];
    this.overlay.innerHTML = '';
  }

  dispose() {
    this.clear();
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
