import * as THREE from 'three';
import { frictionForce, weight } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';
import { getState } from '../../../state.js';

export function computeFriction(params) { return frictionForce(params); }

export function getFrictionConfig() {
  return { id: 'friction', label: 'Attrito', defaults: { mass: 10, appliedForce: 30, staticCoeff: 0.5, dynamicCoeff: 0.3 } };
}

export function renderFriction(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computeFriction(state);
  const W = weight(state.mass);
  const scale = 0.03;

  const groundY = -1;

  // Ground line
  const groundLine = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-7, groundY, 0.01), new THREE.Vector3(8, groundY, 0.01)
  ]);
  sceneManager.objects.add(new THREE.Line(groundLine, new THREE.LineBasicMaterial({ color: isLight ? 0x8090a0 : 0x4a4a6a })));

  // Hatching
  for (let i = -7; i < 8; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, groundY, 0.01), new THREE.Vector3(i - 0.4, groundY - 0.4, 0.01),
    ]);
    sceneManager.objects.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: isLight ? 0x9aa0b0 : 0x3a3a5a })));
  }

  if (visibility.body) {
    // Box sitting ON the ground (2D ShapeGeometry)
    const boxW = 1.5;
    const boxH = 1;
    const boxLeft = -boxW / 2;
    const boxBottom = groundY;
    const bShape = new THREE.Shape();
    bShape.moveTo(boxLeft, boxBottom);
    bShape.lineTo(boxLeft + boxW, boxBottom);
    bShape.lineTo(boxLeft + boxW, boxBottom + boxH);
    bShape.lineTo(boxLeft, boxBottom + boxH);
    bShape.closePath();
    sceneManager.objects.add(new THREE.Mesh(
      new THREE.ShapeGeometry(bShape),
      new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide })
    ));
    // Box outline
    const boxOutline = [
      new THREE.Vector3(boxLeft, boxBottom, 0.02),
      new THREE.Vector3(boxLeft + boxW, boxBottom, 0.02),
      new THREE.Vector3(boxLeft + boxW, boxBottom + boxH, 0.02),
      new THREE.Vector3(boxLeft, boxBottom + boxH, 0.02),
      new THREE.Vector3(boxLeft, boxBottom, 0.02),
    ];
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(boxOutline),
      new THREE.LineBasicMaterial({ color: 0xff8a65 })
    ));
  }

  // Force arrows from center of box
  const originY = groundY + 0.5; // center of the box
  const origin = { x: 0, y: originY };
  if (visibility.forceArrows) {
    const wArrow = createArrow(origin, { x: 0, y: -W * scale }, 0xff4444, 'P');
    if (wArrow) sceneManager.objects.add(wArrow);
    const nArrow = createArrow(origin, { x: 0, y: W * scale }, 0x66bb6a, 'N');
    if (nArrow) sceneManager.objects.add(nArrow);
    const aArrow = createArrow(origin, { x: state.appliedForce * scale, y: 0 }, 0x4fc3f7, 'F');
    if (aArrow) sceneManager.objects.add(aArrow);
    const fArrow = createArrow(origin, { x: -calc.frictionValue * scale, y: 0 }, 0xffa726, 'Fa');
    if (fArrow) sceneManager.objects.add(fArrow);
  }
}
