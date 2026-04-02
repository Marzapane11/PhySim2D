import * as THREE from 'three';
import { springForce, weight } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';

export function computeSpring(params) { return springForce(params); }

export function createSpringSolver() {
  return createSolver({
    variables: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B8)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'k', label: 'Costante (k)', unit: 'N/m', defaultValue: 100, mode: 'input' },
      { id: 'dx', label: 'Deformazione (\u0394x)', unit: 'm', defaultValue: 0.5, mode: 'input' },
      { id: 'P', label: 'Peso (P)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Px', label: 'Px (lungo piano)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'N', label: 'Normale (N)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fe', label: 'Fe (elastica)', unit: 'N', defaultValue: 0, mode: 'output' },
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
  const angleRad = (state.angleDeg * Math.PI) / 180;
  const W = weight(state.mass);

  // Triangle geometry (same style as inclined plane)
  const base = 8;
  const height = base * Math.tan(angleRad);

  const C = { x: -base / 2, y: -height / 2 };
  const A = { x: C.x + base, y: C.y };
  const B = { x: C.x, y: C.y + height };

  // Slope direction (from A up to B)
  const slopeLen = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
  const sdx = (B.x - A.x) / slopeLen;
  const sdy = (B.y - A.y) / slopeLen;
  // Normal outward (CW rotation)
  const ndx = sdy;
  const ndy = -sdx;

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
  addLine(sceneManager, A.x, A.y, B.x, B.y, 0xff7043); // Hypotenuse
  addLine(sceneManager, C.x, C.y, B.x, B.y, 0x66bb6a); // Height
  addLine(sceneManager, C.x, C.y, A.x, A.y, 0x4fc3f7); // Base

  // Right angle marker at C
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

  // Angle alpha arc at A
  const arcR = 1.0;
  const arcCurve = new THREE.EllipseCurve(A.x, A.y, arcR, arcR, Math.PI, Math.PI - angleRad, true);
  const arcPts = arcCurve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, 0.02));
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0x66bb6a })
  ));

  // Labels
  addTextLabel(sceneManager, '\u03B8', A.x - 1.5, A.y + 0.3, '#66bb6a');

  // === Wall at the top of the slope (at B) ===
  // Wall is a small rectangle perpendicular to the slope at B
  const wallThick = 0.15;
  const wallLen = 1.2;
  // Wall extends outward from the slope surface at B
  const wallCorners = [
    { x: B.x - wallLen / 2 * ndx, y: B.y - wallLen / 2 * ndy },
    { x: B.x + wallLen / 2 * ndx, y: B.y + wallLen / 2 * ndy },
    { x: B.x + wallLen / 2 * ndx + wallThick * sdx, y: B.y + wallLen / 2 * ndy + wallThick * sdy },
    { x: B.x - wallLen / 2 * ndx + wallThick * sdx, y: B.y - wallLen / 2 * ndy + wallThick * sdy },
  ];
  const wallShape = new THREE.Shape();
  wallShape.moveTo(wallCorners[0].x, wallCorners[0].y);
  wallShape.lineTo(wallCorners[1].x, wallCorners[1].y);
  wallShape.lineTo(wallCorners[2].x, wallCorners[2].y);
  wallShape.lineTo(wallCorners[3].x, wallCorners[3].y);
  wallShape.closePath();
  sceneManager.objects.add(new THREE.Mesh(
    new THREE.ShapeGeometry(wallShape),
    new THREE.MeshBasicMaterial({ color: isLight ? 0x8090a0 : 0x4a4a6a, side: THREE.DoubleSide })
  ));

  // Wall hatching
  for (let t = -wallLen / 2; t < wallLen / 2; t += 0.25) {
    const wx = B.x + t * ndx;
    const wy = B.y + t * ndy;
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(wx, wy, 0.02),
      new THREE.Vector3(wx + 0.2 * sdx + 0.15 * ndx, wy + 0.2 * sdy + 0.15 * ndy, 0.02),
    ]);
    sceneManager.objects.add(new THREE.Line(hGeo, new THREE.LineBasicMaterial({ color: isLight ? 0x9aa0b0 : 0x3a3a5a })));
  }

  // === Spring coils along the slope (from wall down to box) ===
  // Box position: about 40% up the slope from A
  const restLengthSlope = 2.5;
  const displacementSlope = state.x * 2; // visual scale
  const boxW = 1.0;
  const boxH = 0.8;

  // Wall anchor point (on the slope surface, just below B)
  const wallAnchorT = 0.95; // very close to B
  const wallAnchorX = A.x + wallAnchorT * (B.x - A.x);
  const wallAnchorY = A.y + wallAnchorT * (B.y - A.y);

  // Spring end (where box connects)
  const springEndX = wallAnchorX - sdx * (restLengthSlope + displacementSlope);
  const springEndY = wallAnchorY - sdy * (restLengthSlope + displacementSlope);

  // Spring coils (zigzag along slope direction)
  const coils = 8;
  const coilWidth = 0.3;
  const springStartX = wallAnchorX;
  const springStartY = wallAnchorY;
  const springPoints = [new THREE.Vector3(springStartX, springStartY, 0.03)];
  const totalSpringLen = restLengthSlope + displacementSlope;
  const segLen = totalSpringLen / (coils * 2);

  for (let i = 0; i < coils * 2; i++) {
    const dist = segLen * (i + 1);
    // Position along slope (going down from wall)
    const px = springStartX - sdx * dist;
    const py = springStartY - sdy * dist;
    // Offset perpendicular to slope for zigzag
    const offset = (i % 2 === 0 ? coilWidth : -coilWidth);
    springPoints.push(new THREE.Vector3(px + ndx * offset, py + ndy * offset, 0.03));
  }
  springPoints.push(new THREE.Vector3(springEndX, springEndY, 0.03));

  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(springPoints),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7 })
  ));

  // Label "k" above the spring
  const springMidX = (springStartX + springEndX) / 2 + ndx * 0.8;
  const springMidY = (springStartY + springEndY) / 2 + ndy * 0.8;
  addTextLabel(sceneManager, 'k', springMidX, springMidY, '#4fc3f7');

  // === Box on the slope ===
  if (visibility.body) {
    // Box bottom center on the slope at springEnd
    const bx = springEndX - sdx * (boxW / 2);
    const by = springEndY - sdy * (boxW / 2);

    const hw = boxW / 2;
    const corners = [
      { x: bx - hw * sdx, y: by - hw * sdy },
      { x: bx + hw * sdx, y: by + hw * sdy },
      { x: bx + hw * sdx + boxH * ndx, y: by + hw * sdy + boxH * ndy },
      { x: bx - hw * sdx + boxH * ndx, y: by - hw * sdy + boxH * ndy },
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

    // Label "M" on the box
    const boxCx = bx + (boxH / 2) * ndx;
    const boxCy = by + (boxH / 2) * ndy;
    addTextLabel(sceneManager, 'M', boxCx, boxCy, '#ffffff');

    // Force arrows from box center
    if (visibility.forceArrows) {
      const scale = 0.02;
      const origin = { x: boxCx, y: boxCy };

      // P (weight, straight down)
      const pArrow = createArrow(origin, { x: 0, y: -W * scale }, 0x4fc3f7, 'P');
      if (pArrow) sceneManager.objects.add(pArrow);

      // N (normal, away from surface)
      const nForce = createArrow(origin, { x: ndx * W * Math.cos(angleRad) * scale, y: ndy * W * Math.cos(angleRad) * scale }, 0x66bb6a, 'N');
      if (nForce) sceneManager.objects.add(nForce);

      // Fe (spring force, along slope toward wall = up the slope)
      if (calc.force > 0.01) {
        const feDir = state.x > 0 ? 1 : -1; // restoring: if stretched (x>0), force goes up slope
        const feArrow = createArrow(origin, { x: feDir * sdx * calc.force * scale, y: feDir * sdy * calc.force * scale }, 0xffa726, 'Fe');
        if (feArrow) sceneManager.objects.add(feArrow);
      }
    }
  }

  // Axes indicator (x along slope, y perpendicular)
  const axisOriginX = A.x + 0.3 * (B.x - A.x) + ndx * 2.5;
  const axisOriginY = A.y + 0.3 * (B.y - A.y) + ndy * 2.5;
  const axisLen = 1.0;
  // x-axis along slope
  addLine(sceneManager, axisOriginX, axisOriginY, axisOriginX - sdx * axisLen, axisOriginY - sdy * axisLen, 0xff4444);
  addLine(sceneManager, axisOriginX, axisOriginY, axisOriginX + ndx * axisLen, axisOriginY + ndy * axisLen, 0x44ff44);
  addTextLabel(sceneManager, 'x', axisOriginX - sdx * (axisLen + 0.3), axisOriginY - sdy * (axisLen + 0.3), '#ff4444');
  addTextLabel(sceneManager, 'y', axisOriginX + ndx * (axisLen + 0.3), axisOriginY + ndy * (axisLen + 0.3), '#44ff44');
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
  sprite.position.set(x, y, 0.05);
  sprite.scale.set(0.6, 0.6, 1);
  sceneManager.objects.add(sprite);
}
