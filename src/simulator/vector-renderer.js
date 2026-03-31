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

export function createArrow(origin, vector, color, name) {
  const dir = new THREE.Vector3(vector.x, vector.y, 0).normalize();
  const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (len < 0.001) return null;

  const arrowHelper = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(origin.x, origin.y, 0.02),
    len, color,
    Math.min(len * 0.2, 0.4),
    Math.min(len * 0.12, 0.2)
  );
  arrowHelper.userData = { name, vector, origin, color };
  return arrowHelper;
}

export function createResultantArrow(origin, vector) {
  const dir = new THREE.Vector3(vector.x, vector.y, 0).normalize();
  const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (len < 0.001) return null;

  const arrowHelper = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(origin.x, origin.y, 0.04),
    len, 0xffffff,
    Math.min(len * 0.25, 0.5),
    Math.min(len * 0.15, 0.25)
  );
  arrowHelper.userData = { name: 'Risultante', vector, origin, isResultant: true };
  return arrowHelper;
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
