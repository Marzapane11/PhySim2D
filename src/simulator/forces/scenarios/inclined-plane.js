import * as THREE from 'three';
import { inclinedPlane } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computeInclinedPlane(params) { return inclinedPlane(params); }

export function getInclinedPlaneConfig() {
  return { id: 'inclined-plane', label: 'Piano inclinato', defaults: { mass: 10, angleDeg: 30, frictionCoeff: 0.3 } };
}

export function renderInclinedPlane(sceneManager, state, visibility) {
  const calc = computeInclinedPlane(state);
  const angleRad = (state.angleDeg * Math.PI) / 180;

  const base = 8;
  const height = base * Math.tan(angleRad);
  const hyp = base / Math.cos(angleRad);

  // Triangle vertices: A (bottom-right), B (top-left), C (bottom-left)
  const A = { x: 4, y: -3 };
  const C = { x: A.x - base, y: A.y };
  const B = { x: C.x, y: C.y + height };

  // Draw triangle filled
  const shape = new THREE.Shape();
  shape.moveTo(A.x, A.y);
  shape.lineTo(B.x, B.y);
  shape.lineTo(C.x, C.y);
  shape.closePath();
  const fillGeo = new THREE.ShapeGeometry(shape);
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x1a2a4c, side: THREE.DoubleSide });
  sceneManager.objects.add(new THREE.Mesh(fillGeo, fillMat));

  // Triangle outline
  const outlinePoints = [
    new THREE.Vector3(A.x, A.y, 0.01),
    new THREE.Vector3(B.x, B.y, 0.01),
    new THREE.Vector3(C.x, C.y, 0.01),
    new THREE.Vector3(A.x, A.y, 0.01),
  ];
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outlinePoints),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7, linewidth: 2 })
  ));

  // Right angle marker at C
  const markerSize = 0.4;
  const rightAnglePoints = [
    new THREE.Vector3(C.x + markerSize, C.y, 0.02),
    new THREE.Vector3(C.x + markerSize, C.y + markerSize, 0.02),
    new THREE.Vector3(C.x, C.y + markerSize, 0.02),
  ];
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(rightAnglePoints),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // Angle alpha arc at A
  const arcRadius = 1.2;
  const arcCurve = new THREE.EllipseCurve(
    A.x, A.y, arcRadius, arcRadius,
    Math.PI, Math.PI - angleRad, true, 0
  );
  const arcPoints = arcCurve.getPoints(20).map(p => new THREE.Vector3(p.x, p.y, 0.02));
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPoints),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // Vertex labels
  const addLabel = (text, x, y, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.set(x, y, 0.02);
    sprite.scale.set(0.7, 0.7, 1);
    sceneManager.objects.add(sprite);
  };

  addLabel('A', A.x + 0.5, A.y - 0.5, '#4fc3f7');
  addLabel('B', B.x - 0.5, B.y + 0.5, '#4fc3f7');
  addLabel('C', C.x - 0.5, C.y - 0.5, '#4fc3f7');
  addLabel('\u03B1', A.x - 1.6, A.y + 0.4, '#66bb6a');  // alpha

  // Dimension labels
  addLabel('h', C.x - 0.8, (C.y + B.y) / 2, '#66bb6a');
  addLabel('d', (C.x + A.x) / 2, C.y - 0.6, '#4fc3f7');
  addLabel('l', (A.x + B.x) / 2 + 0.8, (A.y + B.y) / 2 + 0.5, '#ff7043');

  // Body on the incline (small square)
  if (visibility.body) {
    const midX = (A.x + B.x) / 2;
    const midY = (A.y + B.y) / 2;
    const boxSize = 0.8;

    // Create rotated square on the incline
    const boxShape = new THREE.Shape();
    boxShape.moveTo(-boxSize/2, -boxSize/2);
    boxShape.lineTo(boxSize/2, -boxSize/2);
    boxShape.lineTo(boxSize/2, boxSize/2);
    boxShape.lineTo(-boxSize/2, boxSize/2);
    boxShape.closePath();
    const boxGeo = new THREE.ShapeGeometry(boxShape);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(midX, midY, 0.03);
    box.rotation.z = Math.PI - angleRad;
    sceneManager.objects.add(box);

    // Force arrows from box center
    if (visibility.forceArrows) {
      const origin = { x: midX, y: midY };
      const scale = 0.025;

      // P (weight, straight down)
      const pArrow = createArrow(origin, { x: 0, y: -calc.weight * scale }, 0x4fc3f7, 'P');
      if (pArrow) sceneManager.objects.add(pArrow);

      // Py (perpendicular component - into the surface)
      const pyX = -Math.sin(angleRad) * (-calc.perpendicular * scale);
      const pyY = Math.cos(angleRad) * (-calc.perpendicular * scale);
      if (visibility.components) {
        const pyArrow = createArrow(origin, { x: pyX, y: pyY }, 0x4fc3f7, 'Py');
        if (pyArrow) sceneManager.objects.add(pyArrow);
      }

      // Px (parallel component - down the slope)
      const pxMag = calc.parallel * scale;
      const pxX = Math.cos(angleRad) * pxMag;
      const pxY = -Math.sin(angleRad) * pxMag;
      if (visibility.components) {
        const pxArrow = createArrow(origin, { x: -pxX, y: -pxY }, 0x4fc3f7, 'Px');
        if (pxArrow) sceneManager.objects.add(pxArrow);
      }

      // N (normal force - perpendicular to surface, outward)
      const nX = Math.sin(angleRad) * calc.normal * scale;
      const nY = -Math.cos(angleRad) * (-calc.normal * scale);
      const nArrow = createArrow(origin, { x: -nX, y: nY }, 0x66bb6a, 'N');
      if (nArrow) sceneManager.objects.add(nArrow);

      // Friction (along surface, up the slope if sliding)
      if (calc.friction > 0.01) {
        const fX = Math.cos(angleRad) * calc.friction * scale;
        const fY = Math.sin(angleRad) * calc.friction * scale;
        const fArrow = createArrow(origin, { x: fX, y: fY }, 0xffa726, 'Fa');
        if (fArrow) sceneManager.objects.add(fArrow);
      }
    }
  }
}
