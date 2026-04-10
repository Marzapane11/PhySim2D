import * as THREE from 'three';
import { springForce, weight } from '../../../math/force-math.js';
import { createArrow, createSlopeComponentLines } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';
import { calcTriangle, drawTriangle, drawBox, addLine, addTextLabel } from './inclined-plane.js';

export function computeSpring(params) { return springForce(params); }

export function createSpringSolver() {
  return createSolver({
    variables: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B8)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'k', label: 'Costante (k)', unit: 'N/m', defaultValue: 100, mode: 'input' },
      { id: 'dx', label: 'Deformazione (\u0394x)', unit: 'm', defaultValue: 0.5, mode: 'input' },
      { id: 'P', label: 'Peso (<span class="vec-arrow">P</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Px', label: 'Px (lungo piano)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'N', label: 'Normale (<span class="vec-arrow">N</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fe', label: '<span class="vec-arrow">F</span>e (elastica)', unit: 'N', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const G = 9.81;
      const has = (id) => inputIds.includes(id);
      let { m, alpha, k, dx, P, Px, N, Fe } = vals;
      const rad = (alpha * Math.PI) / 180;

      if (has('m')) P = m * G;
      else if (has('P')) m = P / G;

      if (P > 0) {
        Px = P * Math.sin(rad);
        N = P * Math.cos(rad);
      }

      if (has('k') && has('dx')) {
        Fe = Math.abs(k * dx);
      } else if (has('Fe') && has('k') && k > 0) {
        dx = Fe / k;
      } else if (has('Fe') && has('dx') && dx !== 0) {
        k = Fe / Math.abs(dx);
      }

      return { m, alpha, k, dx, P, Px, N, Fe };
    }
  });
}

export function getSpringConfig() {
  return { id: 'spring', label: 'Molla (Hooke)', defaults: { k: 100, x: 0.5, mass: 5, angleDeg: 30 } };
}

export function renderSpring(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computeSpring(state);
  const W = weight(state.mass);
  const tri = calcTriangle(state.angleDeg);
  const { A, B, sd, nd } = tri;

  // Same triangle as inclined plane
  drawTriangle(sceneManager, tri, isLight, '\u03B8');

  // === Spring (smooth sinusoidal coils) from B down to the box ===
  const restLen = 2.5;
  const displacement = state.x * 1.5;
  const totalLen = restLen + displacement;

  // Spring starts slightly below B on the slope
  const startT = 0.9;
  const sx = A.x + startT * (B.x - A.x);
  const sy = A.y + startT * (B.y - A.y);
  // Straight line from B to spring start
  const endX = sx - sd.x * totalLen;
  const endY = sy - sd.y * totalLen;

  // Smooth sinusoidal coils with damped start/end
  const coils = 8;
  const coilW = 0.2;
  const numPoints = coils * 20;
  const points = [new THREE.Vector3(B.x, B.y, 0.03), new THREE.Vector3(sx, sy, 0.03)];
  for (let i = 1; i < numPoints; i++) {
    const frac = i / numPoints;
    const px = sx + frac * (endX - sx);
    const py = sy + frac * (endY - sy);
    // Dampen amplitude at start and end so no pieces stick out
    const envelope = Math.min(1, frac * 5) * Math.min(1, (1 - frac) * 5);
    const wave = Math.sin(frac * coils * Math.PI * 2) * coilW * envelope;
    points.push(new THREE.Vector3(px - nd.x * wave, py - nd.y * wave, 0.03));
  }
  points.push(new THREE.Vector3(endX, endY, 0.03));

  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7 })
  ));

  // "k" label above spring
  addTextLabel(sceneManager, 'k', (sx + endX) / 2 + nd.x * 0.6, (sy + endY) / 2 + nd.y * 0.6, '#4fc3f7');

  // === Box ===
  if (visibility.body) {
    const boxBx = endX - sd.x * 0.6;
    const boxBy = endY - sd.y * 0.6;
    const center = drawBox(sceneManager, boxBx, boxBy, sd, nd, 1.2, 0.9);

    if (visibility.forceArrows) {
      const s = 0.025;

      // P — weight down
      const pVec = { x: 0, y: -W * s };
      const pA = createArrow(center, pVec, 0x4fc3f7, 'P');
      if (pA) sceneManager.objects.add(pA);

      // Dashed decomposition of P into Px (along slope) and Py (along normal)
      const compLines = createSlopeComponentLines(center, pVec, sd, nd, 0x4fc3f7, 0.04);
      sceneManager.objects.add(compLines);

      // N — normal
      const nVal = W * Math.cos(tri.angleRad);
      const nA = createArrow(center, { x: nd.x * nVal * s, y: nd.y * nVal * s }, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // Fe — elastic force
      if (calc.force > 0.01) {
        const dir = state.x > 0 ? 1 : -1;
        const fA = createArrow(center, { x: dir * sd.x * calc.force * s, y: dir * sd.y * calc.force * s }, 0xffa726, 'Fe');
        if (fA) sceneManager.objects.add(fA);
      }
    }
  }
}
