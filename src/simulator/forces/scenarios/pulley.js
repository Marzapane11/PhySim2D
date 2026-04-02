import * as THREE from 'three';
import { pulleySystem } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';

export function computePulley(params) { return pulleySystem(params); }

export function createPulleySolver() {
  return createSolver({
    variables: [
      { id: 'm1', label: 'Massa 1 (m\u2081)', unit: 'kg', defaultValue: 10, mode: 'input' },
      { id: 'm2', label: 'Massa 2 (m\u2082)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'P1', label: 'Peso 1 (P\u20D7\u2081)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'P2', label: 'Peso 2 (P\u20D7\u2082)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'a', label: 'Accelerazione (a)', unit: 'm/s\u00B2', defaultValue: 0, mode: 'output' },
      { id: 'T', label: 'Tensione (T\u20D7)', unit: 'N', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const G = 9.81;
      const has = (id) => inputIds.includes(id);
      let { m1, m2, P1, P2, a, T } = vals;

      if (has('m1')) P1 = m1 * G;
      else if (has('P1')) m1 = P1 / G;

      if (has('m2')) P2 = m2 * G;
      else if (has('P2')) m2 = P2 / G;

      const totalMass = m1 + m2;
      if (totalMass > 0) {
        if (has('a')) {
          T = m1 * (G - a);
          if (!has('m1') && has('T')) m1 = T / (G - a);
          if (!has('m2') && has('T')) m2 = T / (G + a);
        } else {
          a = (G * Math.abs(m1 - m2)) / totalMass;
          T = (2 * m1 * m2 * G) / totalMass;
        }
      }

      return { m1, m2, P1, P2, a, T };
    }
  });
}

export function getPulleyConfig() {
  return { id: 'pulley', label: 'Carrucola', defaults: { mass1: 10, mass2: 5 } };
}

export function renderPulley(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computePulley(state);
  const scale = 0.02;

  // Wheel
  const wheel = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.7, 32), new THREE.MeshBasicMaterial({ color: 0x4fc3f7, side: THREE.DoubleSide }));
  wheel.position.set(0, 4, 0);
  sceneManager.objects.add(wheel);

  // Axle
  const axle = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
  axle.position.set(0, 4, 0.01);
  sceneManager.objects.add(axle);

  // Support
  const supportMat = new THREE.LineBasicMaterial({ color: isLight ? 0x8090a0 : 0x6a6a8a });
  sceneManager.objects.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2, 5, 0.01), new THREE.Vector3(2, 5, 0.01)
  ]), supportMat));
  sceneManager.objects.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 5, 0.01), new THREE.Vector3(0, 4.7, 0.01)
  ]), supportMat));

  // Ropes
  const ropeMat = new THREE.LineBasicMaterial({ color: 0xc0c0c0 });
  sceneManager.objects.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.65, 4, 0.01), new THREE.Vector3(-0.65, 0, 0.01)
  ]), ropeMat));
  sceneManager.objects.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.65, 4, 0.01), new THREE.Vector3(0.65, 1, 0.01)
  ]), ropeMat));

  if (visibility.body) {
    // Mass 1 (2D ShapeGeometry)
    const box1W = 1;
    const box1H = 1;
    const box1Shape = new THREE.Shape();
    box1Shape.moveTo(-0.65 - box1W / 2, -1);
    box1Shape.lineTo(-0.65 + box1W / 2, -1);
    box1Shape.lineTo(-0.65 + box1W / 2, -1 + box1H);
    box1Shape.lineTo(-0.65 - box1W / 2, -1 + box1H);
    box1Shape.closePath();
    const box1Mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(box1Shape),
      new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide })
    );
    box1Mesh.position.z = 0.01;
    sceneManager.objects.add(box1Mesh);
    // Box 1 outline
    const box1Outline = [
      new THREE.Vector3(-0.65 - box1W / 2, -1, 0.02),
      new THREE.Vector3(-0.65 + box1W / 2, -1, 0.02),
      new THREE.Vector3(-0.65 + box1W / 2, -1 + box1H, 0.02),
      new THREE.Vector3(-0.65 - box1W / 2, -1 + box1H, 0.02),
      new THREE.Vector3(-0.65 - box1W / 2, -1, 0.02),
    ];
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(box1Outline),
      new THREE.LineBasicMaterial({ color: 0xff8a65 })
    ));

    // Mass 2 (2D ShapeGeometry)
    const box2W = 0.8;
    const box2H = 0.8;
    const box2Shape = new THREE.Shape();
    box2Shape.moveTo(0.65 - box2W / 2, 0.2);
    box2Shape.lineTo(0.65 + box2W / 2, 0.2);
    box2Shape.lineTo(0.65 + box2W / 2, 0.2 + box2H);
    box2Shape.lineTo(0.65 - box2W / 2, 0.2 + box2H);
    box2Shape.closePath();
    const box2Mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(box2Shape),
      new THREE.MeshBasicMaterial({ color: 0x66bb6a, side: THREE.DoubleSide })
    );
    box2Mesh.position.z = 0.01;
    sceneManager.objects.add(box2Mesh);
    // Box 2 outline
    const box2Outline = [
      new THREE.Vector3(0.65 - box2W / 2, 0.2, 0.02),
      new THREE.Vector3(0.65 + box2W / 2, 0.2, 0.02),
      new THREE.Vector3(0.65 + box2W / 2, 0.2 + box2H, 0.02),
      new THREE.Vector3(0.65 - box2W / 2, 0.2 + box2H, 0.02),
      new THREE.Vector3(0.65 - box2W / 2, 0.2, 0.02),
    ];
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(box2Outline),
      new THREE.LineBasicMaterial({ color: 0x81c784 })
    ));

    if (visibility.forceArrows) {
      const box1CenterY = -1 + box1H / 2;
      const box2CenterY = 0.2 + box2H / 2;

      const w1 = createArrow({ x: -0.65, y: box1CenterY }, { x: 0, y: -calc.weight1 * scale }, 0xff4444, 'P\u20D71');
      if (w1) sceneManager.objects.add(w1);
      const w2 = createArrow({ x: 0.65, y: box2CenterY }, { x: 0, y: -calc.weight2 * scale }, 0xff4444, 'P\u20D72');
      if (w2) sceneManager.objects.add(w2);
      const t1 = createArrow({ x: -0.65, y: box1CenterY }, { x: 0, y: calc.tension * scale }, 0x4fc3f7, 'T\u20D7');
      if (t1) sceneManager.objects.add(t1);
      const t2 = createArrow({ x: 0.65, y: box2CenterY }, { x: 0, y: calc.tension * scale }, 0x4fc3f7, 'T\u20D7');
      if (t2) sceneManager.objects.add(t2);
    }
  }
}
