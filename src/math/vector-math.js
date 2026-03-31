const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function createVector(a, b, options = {}) {
  if (options.polar) {
    const mag = a;
    const angleDeg = b;
    const angleRad = angleDeg * DEG_TO_RAD;
    return {
      x: mag * Math.cos(angleRad),
      y: mag * Math.sin(angleRad),
    };
  }
  return { x: a, y: b };
}

export function addVectors(...vectors) {
  const flat = vectors.flat();
  return {
    x: flat.reduce((sum, v) => sum + v.x, 0),
    y: flat.reduce((sum, v) => sum + v.y, 0),
  };
}

export function subtractVectors(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scalarMultiply(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function direction(v) {
  const angleRad = Math.atan2(v.y, v.x);
  const angleDeg = angleRad * RAD_TO_DEG;
  return angleDeg < 0 ? angleDeg + 360 : angleDeg;
}

export function decompose(v) {
  return { x: v.x, y: v.y };
}

export function resultant(vectors) {
  const sum = addVectors(...vectors);
  return {
    vector: sum,
    magnitude: magnitude(sum),
    direction: direction(sum),
  };
}
