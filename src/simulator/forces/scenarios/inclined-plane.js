import * as THREE from 'three';
import { inclinedPlane } from '../../../math/force-math.js';
import { createArrow, createSlopeComponentLines, scaleForceVector } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';

export function computeInclinedPlane(params) { return inclinedPlane(params); }

export function createInclinedPlaneSolver() {
  return createSolver({
    variables: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B1)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'mu', label: 'Coeff. attrito (\u03BC)', unit: '', defaultValue: 0.4, mode: 'input' },
      { id: 'P', label: 'Peso (<span class="vec-arrow">P</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Px', label: 'Px (parallela)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Py', label: 'Py (perpendicolare)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'N', label: 'Normale (<span class="vec-arrow">N</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fa', label: 'Attrito (<span class="vec-arrow">F</span>a)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fris', label: '<span class="vec-arrow">F</span>ris (risultante)', unit: 'N', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const G = 9.81;
      const has = (id) => inputIds.includes(id);
      let { m, alpha, mu, P, Px, Py, N, Fa, Fris } = vals;
      const rad = (alpha * Math.PI) / 180;

      if (has('m')) P = m * G;
      else if (has('P')) m = P / G;

      if (has('alpha') && P > 0) {
        Px = P * Math.sin(rad);
        Py = P * Math.cos(rad);
      } else if (has('Px') && P > 0) {
        alpha = Math.asin(Math.min(1, Px / P)) * 180 / Math.PI;
        Py = P * Math.cos((alpha * Math.PI) / 180);
      } else if (has('Py') && P > 0) {
        alpha = Math.acos(Math.min(1, Py / P)) * 180 / Math.PI;
        Px = P * Math.sin((alpha * Math.PI) / 180);
      }

      N = Py;

      if (has('mu') && N > 0) {
        Fa = mu * N;
      } else if (has('Fa') && N > 0) {
        mu = Fa / N;
      }

      Fris = Px - Fa;

      return { m, alpha, mu, P, Px, Py, N, Fa, Fris };
    }
  });
}

export function getInclinedPlaneConfig() {
  return { id: 'inclined-plane', label: 'Piano inclinato', defaults: { mass: 10, angleDeg: 30, frictionCoeff: 0.3 } };
}

// Shared helpers used by both inclined-plane and spring
export function calcTriangle(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const base = 8;
  const height = base * Math.tan(angleRad);
  const C = { x: -base / 2, y: -height / 2 };
  const A = { x: C.x + base, y: C.y };
  const B = { x: C.x, y: C.y + height };

  const slopeLen = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
  const sd = { x: (B.x - A.x) / slopeLen, y: (B.y - A.y) / slopeLen };
  // Normal outward: rotate slope 90° CW → (sd.y, -sd.x)
  const nd = { x: sd.y, y: -sd.x };

  return { A, B, C, sd, nd, angleRad, base, height };
}

export function drawTriangle(sceneManager, tri, isLight, angleLabel) {
  const { A, B, C, angleRad } = tri;

  // Fill
  const shape = new THREE.Shape();
  shape.moveTo(C.x, C.y);
  shape.lineTo(A.x, A.y);
  shape.lineTo(B.x, B.y);
  shape.closePath();
  sceneManager.objects.add(new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color: isLight ? 0xc8d4e0 : 0x1a2a4c, side: THREE.DoubleSide })
  ));

  // Outline
  addLine(sceneManager, A.x, A.y, B.x, B.y, 0xff7043);
  addLine(sceneManager, C.x, C.y, B.x, B.y, 0x66bb6a);
  addLine(sceneManager, C.x, C.y, A.x, A.y, 0x4fc3f7);

  // Right angle at C
  const ms = 0.35;
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(C.x + ms, C.y, 0.02),
      new THREE.Vector3(C.x + ms, C.y + ms, 0.02),
      new THREE.Vector3(C.x, C.y + ms, 0.02),
    ]),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // Angle arc at A
  const arcCurve = new THREE.EllipseCurve(A.x, A.y, 1.0, 1.0, Math.PI, Math.PI - angleRad, true);
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcCurve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, 0.02))),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // Labels
  addTextLabel(sceneManager, 'A', A.x + 0.5, A.y - 0.5, '#4fc3f7');
  addTextLabel(sceneManager, 'B', B.x - 0.5, B.y + 0.5, '#4fc3f7');
  addTextLabel(sceneManager, 'C', C.x - 0.5, C.y - 0.5, '#4fc3f7');
  addTextLabel(sceneManager, angleLabel || '\u03B1', A.x - 1.5, A.y + 0.4, '#66bb6a');
  addTextLabel(sceneManager, 'h', C.x - 0.7, (C.y + B.y) / 2, '#66bb6a');
  addTextLabel(sceneManager, 'b', (C.x + A.x) / 2, C.y - 0.5, '#4fc3f7');
  // l label (italic) on the hypotenuse, close to the line, away from box
  const lT = 0.15;
  const lx = A.x + lT * (B.x - A.x) + tri.nd.x * 0.3;
  const ly = A.y + lT * (B.y - A.y) + tri.nd.y * 0.3;
  addItalicLabel(sceneManager, 'l', lx, ly, '#ff7043');
}

export function drawBox(sceneManager, bx, by, sd, nd, boxW, boxH) {
  const hw = boxW / 2;

  // 4 corners
  const corners = [
    { x: bx - hw * sd.x, y: by - hw * sd.y },
    { x: bx + hw * sd.x, y: by + hw * sd.y },
    { x: bx + hw * sd.x + boxH * nd.x, y: by + hw * sd.y + boxH * nd.y },
    { x: bx - hw * sd.x + boxH * nd.x, y: by - hw * sd.y + boxH * nd.y },
  ];

  // Draw only the 4 edges as separate lines (no mesh, no fill, no artifacts)
  const z = 0.03;
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x, a.y, z),
        new THREE.Vector3(b.x, b.y, z),
      ]),
      new THREE.LineBasicMaterial({ color: 0xff7043 })
    ));
  }

  // Center of box
  const cx = bx + (boxH / 2) * nd.x;
  const cy = by + (boxH / 2) * nd.y;
  return { x: cx, y: cy };
}

export function renderInclinedPlane(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computeInclinedPlane(state);
  const tri = calcTriangle(state.angleDeg);

  drawTriangle(sceneManager, tri, isLight, '\u03B1');

  if (visibility.body) {
    // Box at 40% up the slope from A
    const t = 0.4;
    const bx = tri.A.x + t * (tri.B.x - tri.A.x);
    const by = tri.A.y + t * (tri.B.y - tri.A.y);
    const center = drawBox(sceneManager, bx, by, tri.sd, tri.nd, 1.2, 0.9);

    if (visibility.forceArrows) {
      const o = center;

      // P — weight, straight down
      const pVec = scaleForceVector(0, -calc.weight);
      const pA = createArrow(o, pVec, 0x4fc3f7, 'P');
      if (pA) sceneManager.objects.add(pA);

      // Dashed decomposition of P into Px (along slope) and Py (along normal)
      const compLines = createSlopeComponentLines(o, pVec, tri.sd, tri.nd, 0x4fc3f7, 0.04);
      sceneManager.objects.add(compLines);

      // N — normal, away from surface
      const nVec = scaleForceVector(tri.nd.x * calc.normal, tri.nd.y * calc.normal);
      const nA = createArrow(o, nVec, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // Fa — friction, up the slope
      if (calc.friction > 0.01) {
        const faVec = scaleForceVector(tri.sd.x * calc.friction, tri.sd.y * calc.friction);
        const faA = createArrow(o, faVec, 0xffff00, 'Fa');
        if (faA) sceneManager.objects.add(faA);
      }
    }
  }
}

export function addLine(sceneManager, x1, y1, x2, y2, color) {
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, 0.01), new THREE.Vector3(x2, y2, 0.01)
    ]),
    new THREE.LineBasicMaterial({ color })
  ));
}

export function addItalicLabel(sceneManager, text, x, y, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = color;
  ctx.font = 'bold italic 40px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, 0.05);
  sprite.scale.set(0.6, 0.6, 1);
  sceneManager.objects.add(sprite);
}

export function addTextLabel(sceneManager, text, x, y, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  // Ensure fully transparent background
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = color;
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, 0.05);
  sprite.scale.set(0.8, 0.4, 1);
  sceneManager.objects.add(sprite);
}
