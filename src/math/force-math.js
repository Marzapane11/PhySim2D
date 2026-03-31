const G = 9.81;

export function weight(mass) {
  return mass * G;
}

export function inclinedPlane({ mass, angleDeg, frictionCoeff }) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const W = weight(mass);
  const parallel = W * Math.sin(angleRad);
  const perpendicular = W * Math.cos(angleRad);
  const normal = perpendicular;
  const friction = frictionCoeff * normal;
  const netForce = Math.max(0, parallel - friction);
  const slides = parallel > friction && parallel > 0.0001;
  return { weight: W, parallel, perpendicular, normal, friction, netForce, slides };
}

export function springForce({ k, x }) {
  const force = Math.abs(k * x);
  return { force, signedForce: -k * x, direction: x === 0 ? 'none' : 'restore' };
}

export function frictionForce({ mass, appliedForce, staticCoeff, dynamicCoeff }) {
  const W = weight(mass);
  const normal = W;
  const maxStatic = staticCoeff * normal;
  const dynamicFriction = dynamicCoeff * normal;

  if (Math.abs(appliedForce) <= maxStatic) {
    return { frictionValue: Math.abs(appliedForce), maxStatic, dynamicFriction, type: 'static', moves: false, netForce: 0 };
  }
  return { frictionValue: dynamicFriction, maxStatic, dynamicFriction, type: 'dynamic', moves: true, netForce: Math.abs(appliedForce) - dynamicFriction };
}

export function isEquilibrium(forces) {
  const rx = forces.reduce((sum, f) => sum + f.x, 0);
  const ry = forces.reduce((sum, f) => sum + f.y, 0);
  const resultantMagnitude = Math.sqrt(rx * rx + ry * ry);
  const balanced = resultantMagnitude < 0.0001;
  return { balanced, resultant: { x: rx, y: ry }, resultantMagnitude, missingForce: balanced ? null : { x: -rx || 0, y: -ry || 0 } };
}

export function pulleySystem({ mass1, mass2 }) {
  const totalMass = mass1 + mass2;
  const diff = mass1 - mass2;
  const acceleration = (G * diff) / totalMass;
  const tension = (2 * mass1 * mass2 * G) / totalMass;
  let heavierSide;
  if (Math.abs(diff) < 0.0001) heavierSide = 'balanced';
  else heavierSide = diff > 0 ? 'mass1' : 'mass2';
  return { acceleration: Math.abs(acceleration), tension, heavierSide, weight1: weight(mass1), weight2: weight(mass2) };
}
