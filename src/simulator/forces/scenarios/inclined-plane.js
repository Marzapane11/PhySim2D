import * as THREE from 'three';
import { inclinedPlane } from '../../../math/force-math.js';
import { createArrow, resetColorIndex } from '../../vector-renderer.js';

export function computeInclinedPlane(params) { return inclinedPlane(params); }

export function getInclinedPlaneConfig() {
  return { id: 'inclined-plane', label: 'Piano inclinato', defaults: { mass: 10, angleDeg: 30, frictionCoeff: 0.3 } };
}

export function renderInclinedPlane(sceneManager, state, visibility) {
  resetColorIndex();
  const calc = computeInclinedPlane(state);
  const angleRad = (state.angleDeg * Math.PI) / 180;
  const len = 8;
  const height = len * Math.sin(angleRad);
  const base = len * Math.cos(angleRad);

  // Triangle surface
  const shape = new THREE.Shape();
  shape.moveTo(-base / 2, 0);
  shape.lineTo(base / 2, 0);
  shape.lineTo(-base / 2, height);
  shape.closePath();
  const planeGeo = new THREE.ShapeGeometry(shape);
  const planeMat = new THREE.MeshBasicMaterial({ color: 0x2a3a5c, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  planeMesh.position.z = 0;
  sceneManager.objects.add(planeMesh);

  // Outline
  const outlinePoints = [
    new THREE.Vector3(-base / 2, 0, 0.01), new THREE.Vector3(base / 2, 0, 0.01),
    new THREE.Vector3(-base / 2, height, 0.01), new THREE.Vector3(-base / 2, 0, 0.01),
  ];
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePoints);
  sceneManager.objects.add(new THREE.Line(outlineGeo, new THREE.LineBasicMaterial({ color: 0x4fc3f7 })));

  if (visibility.body) {
    const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const box = new THREE.Mesh(boxGeo, new THREE.MeshPhongMaterial({ color: 0xff7043 }));
    const posX = 0;
    const posY = height / 2 + 0.4;
    box.position.set(posX, posY, 0);
    box.rotation.z = angleRad;
    sceneManager.objects.add(box);

    if (visibility.forceArrows) {
      const origin = { x: posX, y: posY };
      const scale = 0.03;

      const wArrow = createArrow(origin, { x: 0, y: -calc.weight * scale }, 0xff4444, 'Peso');
      if (wArrow) sceneManager.objects.add(wArrow);

      const nx = -Math.sin(angleRad) * calc.normal * scale;
      const ny = Math.cos(angleRad) * calc.normal * scale;
      const nArrow = createArrow(origin, { x: nx, y: ny }, 0x66bb6a, 'Normale');
      if (nArrow) sceneManager.objects.add(nArrow);

      const px = Math.cos(angleRad) * calc.parallel * scale;
      const py = Math.sin(angleRad) * calc.parallel * scale;
      const pArrow = createArrow(origin, { x: -px, y: -py }, 0xffa726, 'F parallela');
      if (pArrow) sceneManager.objects.add(pArrow);

      if (calc.friction > 0.01) {
        const fx = Math.cos(angleRad) * calc.friction * scale;
        const fy = Math.sin(angleRad) * calc.friction * scale;
        const fArrow = createArrow(origin, { x: fx, y: fy }, 0xab47bc, 'Attrito');
        if (fArrow) sceneManager.objects.add(fArrow);
      }
    }
  }
}
