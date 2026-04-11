import * as THREE from 'three';

const COLORS = [
  0x4fc3f7, 0xff7043, 0x66bb6a, 0xffa726, 0xab47bc,
  0xef5350, 0x26c6da, 0xd4e157, 0xec407a, 0x8d6e63,
];

let colorIndex = 0;

export function resetColorIndex() {
  colorIndex = 0;
}

export function getNextColor() {
  const color = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return color;
}

/**
 * Very gentle force scaling with a cap.
 * Uses log + cap so arrows stay small and don't grow much with large forces.
 * 1 N -> 0.35, 10 N -> 1.2, 50 N -> 1.9, 100 N -> 2.3, 500 N -> 3.1, 1000 N -> 3.4, ∞ -> 4.0
 */
export function scaleForceVector(fx, fy, factor = 0.35) {
  const mag = Math.sqrt(fx * fx + fy * fy);
  if (mag < 0.0001) return { x: 0, y: 0 };
  const rawMag = Math.log(1 + mag) * factor;
  // Cap at 4.0 units so even huge forces stay within the triangle
  const cap = 4.0;
  const newMag = Math.min(rawMag, cap);
  return { x: (fx / mag) * newMag, y: (fy / mag) * newMag };
}

// Draw a 2D arrow: line + flat triangle tip. No 3D cones.
function makeArrow2D(origin, vector, color, z) {
  const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (len < 0.2) return null;

  const group = new THREE.Group();

  // Direction unit vector
  const dx = vector.x / len;
  const dy = vector.y / len;
  // Perpendicular
  const px = -dy;
  const py = dx;

  const tipLen = Math.min(len * 0.18, 0.3);
  const tipW = Math.min(len * 0.08, 0.12);

  // Shaft end (before the tip)
  const shaftEndX = origin.x + vector.x - dx * tipLen;
  const shaftEndY = origin.y + vector.y - dy * tipLen;

  // Shaft line
  const shaftGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(origin.x, origin.y, z),
    new THREE.Vector3(shaftEndX, shaftEndY, z),
  ]);
  group.add(new THREE.Line(shaftGeo, new THREE.LineBasicMaterial({ color })));

  // Arrowhead (two lines forming a V shape — no mesh)
  const tipX = origin.x + vector.x;
  const tipY = origin.y + vector.y;
  const baseLeftX = shaftEndX + px * tipW;
  const baseLeftY = shaftEndY + py * tipW;
  const baseRightX = shaftEndX - px * tipW;
  const baseRightY = shaftEndY - py * tipW;

  const tipGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(baseLeftX, baseLeftY, z),
    new THREE.Vector3(tipX, tipY, z),
    new THREE.Vector3(baseRightX, baseRightY, z),
  ]);
  group.add(new THREE.Line(tipGeo, new THREE.LineBasicMaterial({ color })));

  return group;
}

export function createArrow(origin, vector, color, name) {
  const group = makeArrow2D(origin, vector, color, 0.06);
  if (!group) return null;
  group.userData = { name, vector, origin, color };
  return group;
}

export function createResultantArrow(origin, vector) {
  const group = makeArrow2D(origin, vector, 0xffffff, 0.08);
  if (!group) return null;
  group.userData = { name: 'R', vector, origin, isResultant: true };
  return group;
}

/**
 * Draw component decomposition with dashed lines like a textbook:
 * From the tip of the vector, draw dashed lines to the axes,
 * forming a rectangle. Label Vx on x-axis, Vy on y-axis.
 */
export function createComponentLines(origin, vector, color, z) {
  const group = new THREE.Group();
  const tipX = origin.x + vector.x;
  const tipY = origin.y + vector.y;
  const dashSize = 0.15;
  const gapSize = 0.1;

  // Dashed line from tip down to x-axis (vertical dashed line at tip)
  const vertGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(tipX, tipY, z),
    new THREE.Vector3(tipX, origin.y, z),
  ]);
  const vertLine = new THREE.Line(vertGeo, new THREE.LineDashedMaterial({
    color, dashSize, gapSize, transparent: true, opacity: 0.7
  }));
  vertLine.computeLineDistances();
  group.add(vertLine);

  // Dashed line from tip left to y-axis (horizontal dashed line at tip)
  const horizGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(tipX, tipY, z),
    new THREE.Vector3(origin.x, tipY, z),
  ]);
  const horizLine = new THREE.Line(horizGeo, new THREE.LineDashedMaterial({
    color, dashSize, gapSize, transparent: true, opacity: 0.7
  }));
  horizLine.computeLineDistances();
  group.add(horizLine);

  // Vx arrow (from origin along x-axis)
  const xArrow = makeArrow2D(origin, { x: vector.x, y: 0 }, 0xff4444, z);
  if (xArrow) group.add(xArrow);

  // Vy arrow (from origin along y-axis)
  const yArrow = makeArrow2D(origin, { x: 0, y: vector.y }, 0x44ff44, z);
  if (yArrow) group.add(yArrow);

  return group;
}

/**
 * Draw component decomposition along slope/normal directions (for inclined plane).
 * From the tip of the force vector, draw dashed lines to the slope and normal axes.
 */
export function createSlopeComponentLines(origin, pVec, sd, nd, pxRaw, pyRaw, color, z) {
  const group = new THREE.Group();
  const tipX = origin.x + pVec.x;
  const tipY = origin.y + pVec.y;
  const dashSize = 0.15;
  const gapSize = 0.1;

  // Scale Px and Py independently (same scaling as other force arrows)
  const pxVec = scaleForceVector(sd.x * pxRaw, sd.y * pxRaw);
  const pyVec = scaleForceVector(-nd.x * pyRaw, -nd.y * pyRaw); // Py points into surface (opposite to normal)

  // Px arrow end point
  const pxEndX = origin.x + pxVec.x;
  const pxEndY = origin.y + pxVec.y;
  // Py arrow end point
  const pyEndX = origin.x + pyVec.x;
  const pyEndY = origin.y + pyVec.y;

  // Dashed line from tip of P to end of Px
  const dashToPx = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(tipX, tipY, z),
    new THREE.Vector3(pxEndX, pxEndY, z),
  ]);
  const line1 = new THREE.Line(dashToPx, new THREE.LineDashedMaterial({
    color, dashSize, gapSize, transparent: true, opacity: 0.5
  }));
  line1.computeLineDistances();
  group.add(line1);

  // Dashed line from tip of P to end of Py
  const dashToPy = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(tipX, tipY, z),
    new THREE.Vector3(pyEndX, pyEndY, z),
  ]);
  const line2 = new THREE.Line(dashToPy, new THREE.LineDashedMaterial({
    color, dashSize, gapSize, transparent: true, opacity: 0.5
  }));
  line2.computeLineDistances();
  group.add(line2);

  // Px arrow (independent log-scaled)
  const pxArrow = makeArrow2D(origin, pxVec, 0xffa726, z);
  if (pxArrow) group.add(pxArrow);

  // Py arrow (independent log-scaled)
  const pyArrow = makeArrow2D(origin, pyVec, 0x26c6da, z);
  if (pyArrow) group.add(pyArrow);

  return group;
}

export function createAngleArc(origin, vector1, vector2, color) {
  const angle1 = Math.atan2(vector1.y, vector1.x);
  const angle2 = Math.atan2(vector2.y, vector2.x);

  const curve = new THREE.EllipseCurve(origin.x, origin.y, 0.8, 0.8, angle1, angle2, false, 0);
  const points = curve.getPoints(32);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, p.y, 0.03))
  );
  const material = new THREE.LineBasicMaterial({ color: color || 0xffff00, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}
