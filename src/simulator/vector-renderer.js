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

  // Arrowhead (flat triangle)
  const tipX = origin.x + vector.x;
  const tipY = origin.y + vector.y;
  const baseLeftX = shaftEndX + px * tipW;
  const baseLeftY = shaftEndY + py * tipW;
  const baseRightX = shaftEndX - px * tipW;
  const baseRightY = shaftEndY - py * tipW;

  const tipShape = new THREE.Shape();
  tipShape.moveTo(tipX, tipY);
  tipShape.lineTo(baseLeftX, baseLeftY);
  tipShape.lineTo(baseRightX, baseRightY);
  tipShape.closePath();

  const tipMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(tipShape),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  tipMesh.position.z = z;
  group.add(tipMesh);

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
