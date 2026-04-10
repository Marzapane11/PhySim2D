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

  // === Wall at B (top of slope) ===
  // Wall is perpendicular to the slope at point B
  // Hatching goes INTO the wall (opposite to slope direction, i.e. behind B)
  const wallLen = 0.8;
  const hatchColor = isLight ? 0x8090a0 : 0x5a5a7a;
  // Wall line perpendicular to slope
  addLine(sceneManager,
    B.x - wallLen / 2 * nd.x, B.y - wallLen / 2 * nd.y,
    B.x + wallLen / 2 * nd.x, B.y + wallLen / 2 * nd.y,
    hatchColor
  );
  // Hatching lines behind the wall (going away from slope, into the wall)
  for (let i = -3; i <= 3; i++) {
    const t = i * 0.12;
    const wx = B.x + t * nd.x;
    const wy = B.y + t * nd.y;
    // Go in OPPOSITE direction of slope (behind B, into the triangle)
    addLine(sceneManager, wx, wy, wx - 0.2 * sd.x, wy - 0.2 * sd.y, hatchColor);
  }

  // === Spring coils ===
  const restLen = 2.0;
  const displacement = state.x * 1.5;
  const totalLen = restLen + displacement;

  const springStartT = 0.92;
  const sx = A.x + springStartT * (B.x - A.x);
  const sy = A.y + springStartT * (B.y - A.y);
  const endX = sx - sd.x * totalLen;
  const endY = sy - sd.y * totalLen;

  const coils = 10;
  const coilW = 0.25;
  const points = [new THREE.Vector3(sx, sy, 0.03)];
  for (let i = 0; i < coils * 2; i++) {
    const frac = (i + 1) / (coils * 2 + 1);
    const px = sx + frac * (endX - sx);
    const py = sy + frac * (endY - sy);
    const offset = (i % 2 === 0 ? coilW : -coilW);
    points.push(new THREE.Vector3(px + nd.x * offset, py + nd.y * offset, 0.03));
  }
  points.push(new THREE.Vector3(endX, endY, 0.03));

  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7 })
  ));

  // "k" label
  addTextLabel(sceneManager, 'k', (sx + endX) / 2 + nd.x * 0.7, (sy + endY) / 2 + nd.y * 0.7, '#4fc3f7');

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
