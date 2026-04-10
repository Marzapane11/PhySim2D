import * as THREE from 'three';
import { getState, subscribe } from '../state.js';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.objects = new THREE.Group();
    this.scene.add(this.objects);

    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;
    const aspect = w / h;
    const viewSize = 10;

    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize,
      0.1, 100
    );
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this._updateClearColor();
    canvasContainer.appendChild(this.renderer.domElement);

    // Update canvas color when theme changes
    this._unsubTheme = subscribe(() => this._updateClearColor());

    // Simple zoom with mouse wheel
    this._viewSize = viewSize;
    this._panOffset = { x: 0, y: 0 };
    this.renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._viewSize *= e.deltaY > 0 ? 1.1 : 0.9;
      this._viewSize = Math.max(3, Math.min(30, this._viewSize));
      this._updateCamera();
    });

    // Pan with left mouse drag
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY };
      }
    });
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const dx = (e.clientX - panStart.x) / w * this._viewSize * 2 * aspect;
      const dy = (e.clientY - panStart.y) / h * this._viewSize * 2;
      this._panOffset.x -= dx;
      this._panOffset.y -= dy;
      panStart = { x: e.clientX, y: e.clientY };
      this._updateCamera();
    });
    window.addEventListener('mouseup', () => { isPanning = false; });

    // Touch pan support
    this.renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isPanning = true;
        panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    this.renderer.domElement.addEventListener('touchmove', (e) => {
      if (!isPanning || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = (e.touches[0].clientX - panStart.x) / w * this._viewSize * 2 * aspect;
      const dy = (e.touches[0].clientY - panStart.y) / h * this._viewSize * 2;
      this._panOffset.x -= dx;
      this._panOffset.y -= dy;
      panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this._updateCamera();
    }, { passive: false });
    this.renderer.domElement.addEventListener('touchend', () => { isPanning = false; });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 10);
    this.scene.add(directionalLight);

    this._onResize = () => this._handleResize();
    window.addEventListener('resize', this._onResize);
    this._resizeObserver = new ResizeObserver(() => this._handleResize());
    this._resizeObserver.observe(canvasContainer);

    this._animating = true;
    this._animate();
  }

  _updateClearColor() {
    const theme = getState().theme;
    this.renderer.setClearColor(theme === 'light' ? 0xe8ecf0 : 0x111827, 1);
  }

  _updateCamera() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const aspect = w / h;
    this.camera.left = -this._viewSize * aspect + this._panOffset.x;
    this.camera.right = this._viewSize * aspect + this._panOffset.x;
    this.camera.top = this._viewSize - this._panOffset.y;
    this.camera.bottom = -this._viewSize - this._panOffset.y;
    this.camera.updateProjectionMatrix();
  }

  _handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    this._updateCamera();
  }

  _animate() {
    if (!this._animating) return;
    requestAnimationFrame(() => this._animate());
    this.renderer.render(this.scene, this.camera);
  }

  clearObjects() {
    while (this.objects.children.length > 0) {
      const obj = this.objects.children[0];
      this.objects.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }

  resetCamera() {
    this._viewSize = 10;
    this._panOffset = { x: 0, y: 0 };
    this._updateCamera();
  }

  dispose() {
    this._animating = false;
    if (this._unsubTheme) this._unsubTheme();
    window.removeEventListener('resize', this._onResize);
    this._resizeObserver.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
