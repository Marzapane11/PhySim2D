import * as THREE from 'three';
import { inclinedPlane } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';

export function computeInclinedPlane(params) { return inclinedPlane(params); }

export function createInclinedPlaneSolver() {
  return createSolver({
    variables: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', defaultValue: 10, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B1)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'mu', label: 'Coeff. attrito (\u03BC)', unit: '', defaultValue: 0.3, mode: 'input' },
      { id: 'P', label: 'Peso (P\u20D7)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Px', label: 'Px (parallela)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Py', label: 'Py (perpendicolare)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'N', label: 'Normale (N\u20D7)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fa', label: 'Attrito (F\u20D7a)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fnet', label: 'F\u20D7 netta', unit: 'N', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const G = 9.81;
      const has = (id) => inputIds.includes(id);
      let { m, alpha, mu, P, Px, Py, N, Fa, Fnet } = vals;
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

      Fnet = Math.max(0, Px - Fa);

      return { m, alpha, mu, P, Px, Py, N, Fa, Fnet };
    }
  });
}

export function getInclinedPlaneConfig() {
  return { id: 'inclined-plane', label: 'Piano inclinato', defaults: { mass: 10, angleDeg: 30, frictionCoeff: 0.3 } };
}

export function renderInclinedPlane(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const calc = computeInclinedPlane(state);
  const angleRad = (state.angleDeg * Math.PI) / 180;

  const base = 8;
  const height = base * Math.tan(angleRad);

  // Triangle vertices: C (bottom-left), A (bottom-right), B (top-left)
  // Centered nicely in view
  const C = { x: -base / 2, y: -height / 2 };
  const A = { x: C.x + base, y: C.y };
  const B = { x: C.x, y: C.y + height };

  // === Triangle fill ===
  const shape = new THREE.Shape();
  shape.moveTo(C.x, C.y);
  shape.lineTo(A.x, A.y);
  shape.lineTo(B.x, B.y);
  shape.closePath();
  sceneManager.objects.add(new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color: isLight ? 0xc8d4e0 : 0x1a2a4c, side: THREE.DoubleSide })
  ));

  // === Triangle outline ===
  // Hypotenuse (orange)
  addLine(sceneManager, A.x, A.y, B.x, B.y, 0xff7043);
  // Height (green, vertical)
  addLine(sceneManager, C.x, C.y, B.x, B.y, 0x66bb6a);
  // Base (cyan, horizontal)
  addLine(sceneManager, C.x, C.y, A.x, A.y, 0x4fc3f7);

  // === Right angle marker at C ===
  const ms = 0.35;
  const raPoints = [
    new THREE.Vector3(C.x + ms, C.y, 0.02),
    new THREE.Vector3(C.x + ms, C.y + ms, 0.02),
    new THREE.Vector3(C.x, C.y + ms, 0.02),
  ];
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(raPoints),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // === Angle alpha arc at A ===
  const arcR = 1.0;
  const arcCurve = new THREE.EllipseCurve(A.x, A.y, arcR, arcR, Math.PI, Math.PI - angleRad, true);
  const arcPts = arcCurve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, 0.02));
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // === Labels ===
  addTextLabel(sceneManager, 'A', A.x + 0.4, A.y - 0.5, '#4fc3f7');
  addTextLabel(sceneManager, 'B', B.x - 0.5, B.y + 0.4, '#4fc3f7');
  addTextLabel(sceneManager, 'C', C.x - 0.5, C.y - 0.5, '#4fc3f7');
  addTextLabel(sceneManager, '\u03B1', A.x - 1.5, A.y + 0.3, '#66bb6a');
  addTextLabel(sceneManager, 'h', C.x - 0.7, (C.y + B.y) / 2, '#66bb6a');
  addTextLabel(sceneManager, 'd', (C.x + A.x) / 2, C.y - 0.5, '#4fc3f7');
  addTextLabel(sceneManager, 'l', (A.x + B.x) / 2 + 0.6, (A.y + B.y) / 2 + 0.4, '#ff7043');

  // === Body on the incline ===
  if (visibility.body) {
    // Position: about 1/3 up the slope from A
    const t = 0.35;
    const objX = A.x + t * (B.x - A.x);
    const objY = A.y + t * (B.y - A.y);
    const boxW = 1.0;
    const boxH = 0.8;

    // Slope direction unit vector (from A to B)
    const slopeLen = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const sdx = (B.x - A.x) / slopeLen;
    const sdy = (B.y - A.y) / slopeLen;
    // Normal direction (perpendicular, outward from surface) — rotate slope 90° CW
    const ndx = sdy;
    const ndy = -sdx;

    // Box corners: bottom edge sits on the slope surface
    const hw = boxW / 2;
    const bx = objX; // center bottom on slope
    const by = objY;
    const corners = [
      { x: bx - hw * sdx, y: by - hw * sdy },                                    // bottom-left
      { x: bx + hw * sdx, y: by + hw * sdy },                                    // bottom-right
      { x: bx + hw * sdx + boxH * ndx, y: by + hw * sdy + boxH * ndy },         // top-right
      { x: bx - hw * sdx + boxH * ndx, y: by - hw * sdy + boxH * ndy },         // top-left
    ];

    const boxShape = new THREE.Shape();
    boxShape.moveTo(corners[0].x, corners[0].y);
    boxShape.lineTo(corners[1].x, corners[1].y);
    boxShape.lineTo(corners[2].x, corners[2].y);
    boxShape.lineTo(corners[3].x, corners[3].y);
    boxShape.closePath();
    const boxMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(boxShape),
      new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide })
    );
    boxMesh.position.z = 0.02;
    sceneManager.objects.add(boxMesh);
    // Box outline
    const boxOutlinePts = [...corners, corners[0]].map(c => new THREE.Vector3(c.x, c.y, 0.04));
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(boxOutlinePts),
      new THREE.LineBasicMaterial({ color: 0xff8a65 })
    ));

    // Center of the box (for force arrows)
    const cx = bx + (boxH / 2) * ndx;
    const cy = by + (boxH / 2) * ndy;

    if (visibility.forceArrows) {
      const scale = 0.02;
      const origin = { x: cx, y: cy };

      // P (weight, straight down)
      const pArrow = createArrow(origin, { x: 0, y: -calc.weight * scale }, 0x4fc3f7, 'P\u20D7');
      if (pArrow) sceneManager.objects.add(pArrow);

      // N (normal, perpendicular to slope, away from surface)
      const nForce = createArrow(origin, { x: ndx * calc.normal * scale, y: ndy * calc.normal * scale }, 0x66bb6a, 'N\u20D7');
      if (nForce) sceneManager.objects.add(nForce);

      if (visibility.components) {
        // Px (parallel component, down the slope)
        const pxArrow = createArrow(origin, { x: -sdx * calc.parallel * scale, y: -sdy * calc.parallel * scale }, 0xffa726, 'Px');
        if (pxArrow) sceneManager.objects.add(pxArrow);

        // Py (perpendicular component, into surface = opposite of normal)
        const pyArrow = createArrow(origin, { x: -ndx * calc.perpendicular * scale, y: -ndy * calc.perpendicular * scale }, 0x26c6da, 'Py');
        if (pyArrow) sceneManager.objects.add(pyArrow);
      }

      // Fa (friction, up the slope)
      if (calc.friction > 0.01) {
        const faArrow = createArrow(origin, { x: sdx * calc.friction * scale, y: sdy * calc.friction * scale }, 0xab47bc, 'F\u20D7a');
        if (faArrow) sceneManager.objects.add(faArrow);
      }
    }
  }
}

function addLine(sceneManager, x1, y1, x2, y2, color) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x1, y1, 0.01), new THREE.Vector3(x2, y2, 0.01)
  ]);
  sceneManager.objects.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
}

function addTextLabel(sceneManager, text, x, y, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.position.set(x, y, 0.02);
  sprite.scale.set(0.7, 0.7, 1);
  sceneManager.objects.add(sprite);
}
