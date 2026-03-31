import * as THREE from 'three';
import { frictionForce, weight } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computeFriction(params) { return frictionForce(params); }

export function getFrictionConfig() {
  return { id: 'friction', label: 'Attrito', defaults: { mass: 10, appliedForce: 30, staticCoeff: 0.5, dynamicCoeff: 0.3 } };
}

export function renderFriction(sceneManager, state, visibility) {
  const calc = computeFriction(state);
  const W = weight(state.mass);
  const scale = 0.03;

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 0.3), new THREE.MeshBasicMaterial({ color: 0x3a3a5a, side: THREE.DoubleSide }));
  ground.position.set(0, -0.65, 0);
  sceneManager.objects.add(ground);

  // Hatching
  for (let i = -7; i < 8; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -0.8, 0.01), new THREE.Vector3(i - 0.4, -1.2, 0.01),
    ]);
    sceneManager.objects.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x5a5a7a })));
  }

  if (visibility.body) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff7043 }));
    box.position.set(0, 0, 0);
    sceneManager.objects.add(box);
  }

  const origin = { x: 0, y: 0 };
  if (visibility.forceArrows) {
    const wArrow = createArrow(origin, { x: 0, y: -W * scale }, 0xff4444, 'Peso');
    if (wArrow) sceneManager.objects.add(wArrow);
    const nArrow = createArrow(origin, { x: 0, y: W * scale }, 0x66bb6a, 'Normale');
    if (nArrow) sceneManager.objects.add(nArrow);
    const aArrow = createArrow(origin, { x: state.appliedForce * scale, y: 0 }, 0x4fc3f7, 'F applicata');
    if (aArrow) sceneManager.objects.add(aArrow);
    const fArrow = createArrow(origin, { x: -calc.frictionValue * scale, y: 0 }, 0xffa726, 'Attrito');
    if (fArrow) sceneManager.objects.add(fArrow);
  }
}
