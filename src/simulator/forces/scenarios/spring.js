import * as THREE from 'three';
import { springForce, weight } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';
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

  // Spring starts at B (on the hypotenuse)
  const sx = B.x;
  const sy = B.y;
  // Spring ends further down the slope
  const endX = sx - sd.x * totalLen;
  const endY = sy - sd.y * totalLen;

  // Smooth sinusoidal coils (many points for a round look)
  const coils = 8;
  const coilW = 0.2;
  const numPoints = coils * 20;
  const points = [new THREE.Vector3(sx, sy, 0.03)];
  for (let i = 1; i < numPoints; i++) {
    const frac = i / numPoints;
    const px = sx + frac * (endX - sx);
    const py = sy + frac * (endY - sy);
    const wave = Math.sin(frac * coils * Math.PI * 2) * coilW;
    points.push(new THREE.Vector3(px + nd.x * wave, py + nd.y * wave, 0.03));
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
      const pA = createArrow(center, { x: 0, y: -W * s }, 0x4fc3f7, 'P');
      if (pA) sceneManager.objects.add(pA);

      // N — normal
      const nVal = W * Math.cos(tri.angleRad);
      const nA = createArrow(center, { x: nd.x * nVal * s, y: nd.y * nVal * s }, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // Px — parallel component, down the slope
      const pxVal = W * Math.sin(tri.angleRad);
      const pxA = createArrow(center, { x: -sd.x * pxVal * s, y: -sd.y * pxVal * s }, 0xffa726, 'Px');
      if (pxA) sceneManager.objects.add(pxA);

      // Fe — elastic force
      if (calc.force > 0.01) {
        const dir = state.x > 0 ? 1 : -1;
        const fA = createArrow(center, { x: dir * sd.x * calc.force * s, y: dir * sd.y * calc.force * s }, 0xffa726, 'Fe');
        if (fA) sceneManager.objects.add(fA);
      }
    }
  }
}
