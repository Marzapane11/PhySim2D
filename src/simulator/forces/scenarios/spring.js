import * as THREE from 'three';
import { springForce, weight } from '../../../math/force-math.js';
import { createArrow, createSlopeComponentLines, scaleForceVector } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';
import { calcTriangle, drawTriangle, drawBox, addLine, addTextLabel } from './inclined-plane.js';

export function computeSpring(params) { return springForce(params); }

export function createSpringSolver() {
  return createSolver({
    variables: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', defaultValue: 4, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B8)', unit: '\u00B0', defaultValue: 45, mode: 'input' },
      { id: 'mu', label: 'Coeff. attrito (\u03BC)', unit: '', defaultValue: 0.7, mode: 'input' },
      { id: 'l', label: 'Ipotenusa (l)', unit: 'm', defaultValue: 5, mode: 'input',
        visibleIf: (v) => v.alpha == null || Math.abs(v.alpha) >= 0.5 },
      { id: 'h', label: 'Altezza (h)', unit: 'm', defaultValue: 0, mode: 'output',
        visibleIf: (v) => v.alpha == null || Math.abs(v.alpha) >= 0.5 },
      { id: 'b', label: 'Base (b)', unit: 'm', defaultValue: 0, mode: 'output' },
      { id: 'k', label: 'Costante (k)', unit: 'N/m', defaultValue: 60, mode: 'input' },
      { id: 'dx', label: 'Deformazione (\u0394x)', unit: 'm', defaultValue: 0.5, mode: 'input' },
      { id: 'P', label: 'Peso (<span class="vec-arrow">P</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Px', label: 'Px (lungo piano)', unit: 'N', defaultValue: 0, mode: 'output',
        visibleIf: (v) => v.alpha == null || Math.abs(v.alpha) >= 0.5 },
      { id: 'Py', label: 'Py (perpendicolare)', unit: 'N', defaultValue: 0, mode: 'output',
        visibleIf: (v) => v.alpha == null || Math.abs(v.alpha) >= 0.5 },
      { id: 'N', label: 'Normale (<span class="vec-arrow">N</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fa', label: 'Attrito (<span class="vec-arrow">F</span>a)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fe', label: '<span class="vec-arrow">F</span>e (elastica)', unit: 'N', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const G = 9.81;
      const has = (id) => inputIds.includes(id);
      // Start with only inputs; outputs null until computed
      let m = has('m') ? vals.m : null;
      let alpha = has('alpha') ? vals.alpha : null;
      let mu = has('mu') ? vals.mu : null;
      let l = has('l') ? vals.l : null;
      let h = has('h') ? vals.h : null;
      let b = has('b') ? vals.b : null;
      let k = has('k') ? vals.k : null;
      let dx = has('dx') ? vals.dx : null;
      let P = has('P') ? vals.P : null;
      let Px = has('Px') ? vals.Px : null;
      let Py = has('Py') ? vals.Py : null;
      let N = has('N') ? vals.N : null;
      let Fa = has('Fa') ? vals.Fa : null;
      let Fe = has('Fe') ? vals.Fe : null;

      // === Geometry ===
      if (alpha == null) {
        if (h != null && b != null) {
          alpha = Math.atan2(h, b) * 180 / Math.PI;
        } else if (h != null && l != null && l > 0) {
          alpha = Math.asin(Math.min(1, h / l)) * 180 / Math.PI;
        } else if (b != null && l != null && l > 0) {
          alpha = Math.acos(Math.min(1, b / l)) * 180 / Math.PI;
        }
      }

      if (alpha != null) {
        const rad = (alpha * Math.PI) / 180;

        if (l != null) {
          if (h == null) h = l * Math.sin(rad);
          if (b == null) b = l * Math.cos(rad);
        } else if (h != null && Math.sin(rad) > 0.0001) {
          l = h / Math.sin(rad);
          if (b == null) b = l * Math.cos(rad);
        } else if (b != null && Math.cos(rad) > 0.0001) {
          l = b / Math.cos(rad);
          if (h == null) h = l * Math.sin(rad);
        }

        // === Forces ===
        if (P == null && m != null) P = m * G;
        else if (m == null && P != null) m = P / G;

        if (P != null) {
          if (Px == null) Px = P * Math.sin(rad);
          if (Py == null) Py = P * Math.cos(rad);
        }

        // N e' lo stesso valore di Py (modulo perpendicolare) — sincronizzati in entrambi i versi
        if (N == null && Py != null) N = Py;
        else if (Py == null && N != null) Py = N;

        if (Fa == null && mu != null && N != null) Fa = mu * N;
        else if (mu == null && Fa != null && N != null && N > 0) mu = Fa / N;
      }

      // Elastic force is independent of geometry
      if (Fe == null && k != null && dx != null) Fe = Math.abs(k * dx);
      else if (dx == null && Fe != null && k != null && k > 0) dx = Fe / k;
      else if (k == null && Fe != null && dx != null && dx !== 0) k = Fe / Math.abs(dx);

      return { m, alpha, mu, l, h, b, k, dx, P, Px, Py, N, Fa, Fe };
    }
  });
}

export function getSpringConfig() {
  return { id: 'spring', label: 'Molla (Hooke)', defaults: { k: 60, x: 0.5, mass: 4, angleDeg: 45, frictionCoeff: 0.7 } };
}

export function renderSpring(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computeSpring(state);
  const W = weight(state.mass);
  const tri = calcTriangle(state.angleDeg);
  const { A, B, sd, nd } = tri;

  // Same triangle as inclined plane
  drawTriangle(sceneManager, tri, isLight, '\u03B8');

  // === Wall at B (sits ON the hypotenuse, like the box but at B) ===
  const wallW = 0.3;  // thin along slope
  const wallH = 0.8;  // height above slope
  const wallColor = isLight ? 0x8090a0 : 0x3a4a6a;
  // Bottom center of wall on the hypotenuse at B
  const wbx = B.x;
  const wby = B.y;
  const whw = wallW / 2;
  const wallShape = new THREE.Shape();
  // 4 corners: same logic as drawBox
  const wc0 = { x: wbx - whw * sd.x, y: wby - whw * sd.y };
  const wc1 = { x: wbx + whw * sd.x, y: wby + whw * sd.y };
  const wc2 = { x: wc1.x + wallH * nd.x, y: wc1.y + wallH * nd.y };
  const wc3 = { x: wc0.x + wallH * nd.x, y: wc0.y + wallH * nd.y };
  wallShape.moveTo(wc0.x, wc0.y);
  wallShape.lineTo(wc1.x, wc1.y);
  wallShape.lineTo(wc2.x, wc2.y);
  wallShape.lineTo(wc3.x, wc3.y);
  wallShape.closePath();
  const wallMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(wallShape),
    new THREE.MeshBasicMaterial({ color: wallColor, side: THREE.DoubleSide })
  );
  wallMesh.position.z = 0.01;
  sceneManager.objects.add(wallMesh);

  // === Box ===
  const boxW = 1.2;
  const boxH = 0.9;
  const hw = boxW / 2;
  // Box at ~45% up the slope from A (bottom center on slope)
  const boxT = 0.45;
  const boxBx = A.x + boxT * (B.x - A.x);
  const boxBy = A.y + boxT * (B.y - A.y);

  // Center of the box's side facing B = bottom center + hw along sd (toward B) + boxH/2 along nd (half height)
  const boxSideBx = boxBx + hw * sd.x + (boxH / 2) * nd.x;
  const boxSideBy = boxBy + hw * sd.y + (boxH / 2) * nd.y;

  // === Spring from inner face of wall (facing down slope) to center of box side facing B ===
  // Inner face is at B shifted down-slope by half wall width, at mid wall height
  const sx = B.x - (wallW / 2) * sd.x + (wallH / 2) * nd.x;
  const sy = B.y - (wallW / 2) * sd.y + (wallH / 2) * nd.y;
  const springEndX = boxSideBx;
  const springEndY = boxSideBy;

  // Sinusoidal coils
  const coils = 8;
  const coilW = 0.2;
  const numPoints = coils * 20;
  const points = [new THREE.Vector3(sx, sy, 0.03)];
  for (let i = 1; i < numPoints; i++) {
    const frac = i / numPoints;
    const px = sx + frac * (springEndX - sx);
    const py = sy + frac * (springEndY - sy);
    const envelope = Math.min(1, frac * 4) * Math.min(1, (1 - frac) * 4);
    const wave = Math.sin(frac * coils * Math.PI * 2) * coilW * envelope;
    points.push(new THREE.Vector3(px - nd.x * wave, py - nd.y * wave, 0.03));
  }
  points.push(new THREE.Vector3(springEndX, springEndY, 0.03));

  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.4 })
  ));

  // "k" label above spring
  const kx = (sx + springEndX) / 2 + nd.x * 0.6;
  const ky = (sy + springEndY) / 2 + nd.y * 0.6;
  addTextLabel(sceneManager, 'k', kx, ky, '#4fc3f7');

  // === Box ===
  if (visibility.body) {
    const center = drawBox(sceneManager, boxBx, boxBy, sd, nd, boxW, boxH);

    if (visibility.forceArrows) {
      // P — weight down
      const pVec = scaleForceVector(0, -W);
      const pA = createArrow(center, pVec, 0x4fc3f7, 'P');
      if (pA) sceneManager.objects.add(pA);

      // Dashed decomposition of P into Px (along slope, down) and Py (along normal, into surface)
      const pxRaw = W * Math.sin(tri.angleRad);
      const pyRaw = W * Math.cos(tri.angleRad);
      if (visibility.components !== false) {
        const compLines = createSlopeComponentLines(center, pVec, { x: -sd.x, y: -sd.y }, nd, pxRaw, pyRaw, 0x4fc3f7, 0.04);
        sceneManager.objects.add(compLines);
      }

      // N — normal
      const nVal = W * Math.cos(tri.angleRad);
      const nVec = scaleForceVector(nd.x * nVal, nd.y * nVal);
      const nA = createArrow(center, nVec, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // Fe — elastic force (drawn first, so Fa goes on top)
      if (calc.force > 0.01) {
        const dir = state.x > 0 ? 1 : -1;
        const feVec = scaleForceVector(dir * sd.x * calc.force, dir * sd.y * calc.force);
        const feA = createArrow(center, feVec, 0xaa00ff, 'Fe');
        if (feA) sceneManager.objects.add(feA);
      }

      // Fa — friction, up the slope (drawn LAST so it's on top and visible)
      const faVal = state.mass ? state.mass * 9.81 * Math.cos(tri.angleRad) * (state.frictionCoeff || 0) : 0;
      if (faVal > 0.01) {
        const faVec = scaleForceVector(sd.x * faVal, sd.y * faVal, 0.28);
        const faA = createArrow(center, faVec, 0xffff00, 'Fa');
        if (faA) sceneManager.objects.add(faA);
      }

      // Custom forces (always shown) — angle relative to Px direction (down slope)
      if (state.customForces && state.customForces.length > 0) {
        const customColors = [0xec407a, 0x26c6da, 0xd4e157, 0xab47bc, 0xef5350, 0x8d6e63];
        state.customForces.forEach((f, i) => {
          const rad = ((f.angleDeg - state.angleDeg) * Math.PI) / 180;
          const fx = f.magnitude * Math.cos(rad);
          const fy = f.magnitude * Math.sin(rad);
          const fVec = scaleForceVector(fx, fy);
          const color = customColors[i % customColors.length];
          const arrow = createArrow(center, fVec, color, f.name);
          if (arrow) sceneManager.objects.add(arrow);
        });
      }
    }
  }
}
