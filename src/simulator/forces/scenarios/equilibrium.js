import * as THREE from 'three';
import { isEquilibrium } from '../../../math/force-math.js';
import { createArrow, createResultantArrow, getNextColor, resetColorIndex } from '../../vector-renderer.js';

export function computeEquilibrium(forces) { return isEquilibrium(forces); }

export function getEquilibriumConfig() {
  return { id: 'equilibrium', label: 'Equilibrio', defaultForces: [{ x: 3, y: 2, name: 'F\u20D71' }, { x: -3, y: -2, name: 'F\u20D72' }] };
}

export function renderEquilibrium(sceneManager, state, visibility) {
  resetColorIndex();
  const forces = state.forces;
  const calc = computeEquilibrium(forces);

  if (visibility.body) {
    const circleGeo = new THREE.RingGeometry(0.15, 0.2, 32);
    const circle = new THREE.Mesh(circleGeo, new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide }));
    circle.position.set(0, 0, 0.01);
    sceneManager.objects.add(circle);
  }

  if (visibility.forceArrows) {
    forces.forEach((f) => {
      const color = getNextColor();
      const arrow = createArrow({ x: 0, y: 0 }, f, color, f.name);
      if (arrow) sceneManager.objects.add(arrow);
    });
    if (!calc.balanced) {
      const rArrow = createResultantArrow({ x: 0, y: 0 }, calc.resultant);
      if (rArrow) sceneManager.objects.add(rArrow);
      const mArrow = createArrow({ x: 0, y: 0 }, calc.missingForce, 0xffff00, 'F\u20D7 mancante');
      if (mArrow) sceneManager.objects.add(mArrow);
    }
  }
}
