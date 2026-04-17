// Pure physics calculations for inclined plane and spring scenarios.
// All these functions are side-effect free and fully testable.

const G = 9.81;

/**
 * Compute per-custom-force contributions along the up-slope direction
 * and along the outward normal direction.
 *
 * Convenzione dell'angolo delle forze personalizzate:
 *   - 0°   = giu' lungo il piano (direzione di Px)
 *   - 90°  = perpendicolare, uscente dalla superficie (direzione di N)
 *   - 180° = su lungo il piano (direzione opposta a Px)
 *   - 270° = dentro la superficie (direzione opposta a N)
 * In coordinate world, questo corrisponde a un angolo (customAngleDeg - alphaDeg).
 */
export function projectCustomForces(customForces, alphaDeg) {
  const rad = (alphaDeg * Math.PI) / 180;
  // Up-slope direction (from A to B): (-cos α, sin α)
  const sdx = -Math.cos(rad);
  const sdy = Math.sin(rad);
  // Outward normal (rotate sd 90° CW): (sin α, cos α)
  const ndx = sdy;
  const ndy = -sdx;

  let fcSlope = 0;
  let fcNormal = 0;
  (customForces || []).forEach((f) => {
    const fr = ((f.angleDeg - alphaDeg) * Math.PI) / 180;
    const fx = f.magnitude * Math.cos(fr);
    const fy = f.magnitude * Math.sin(fr);
    fcSlope += fx * sdx + fy * sdy;
    fcNormal += fx * ndx + fy * ndy;
  });
  return { fcSlope, fcNormal };
}

/**
 * Inclined plane physics with proper static/kinetic friction.
 * Returns the actual Fa, Fris, and status.
 *
 * @param {Object} params
 * @param {number} params.mass - kg
 * @param {number} params.angleDeg - degrees
 * @param {number} params.mu - friction coefficient
 * @param {Array} [params.customForces] - array of {magnitude, angleDeg}
 */
export function computeInclinedPlaneState({ mass, angleDeg, mu, customForces = [] }) {
  const rad = (angleDeg * Math.PI) / 180;
  const P = mass * G;
  const Px = P * Math.sin(rad);
  const { fcSlope, fcNormal } = projectCustomForces(customForces, angleDeg);

  // Total normal force: base normal minus outward custom force component
  const N = Math.max(0, P * Math.cos(rad) - fcNormal);
  const FaMax = mu * N;

  // Net down-slope force WITHOUT friction
  const netNoFa = Px - fcSlope;

  let Fa, Fris, status;
  if (Math.abs(netNoFa) <= FaMax + 1e-9) {
    // Static friction can balance
    Fa = Math.abs(netNoFa);
    Fris = 0;
    status = 'Equilibrio';
  } else {
    Fa = FaMax;
    Fris = netNoFa - Math.sign(netNoFa) * FaMax;
    status = Fris > 0 ? 'Scivola giù' : 'Sale';
  }

  return { P, Px, N, Fa, Fris, FaMax, status, fcSlope, fcNormal };
}

/**
 * Spring equilibrium deformation.
 * Computes the Δx that makes the system balance (ignoring friction for the
 * canonical equilibrium — friction provides a range but we use the midpoint).
 */
export function computeSpringEquilibriumDx({ mass, angleDeg, k, customForces = [] }) {
  const rad = (angleDeg * Math.PI) / 180;
  const P = mass * G;
  const Px = P * Math.sin(rad);
  const { fcSlope } = projectCustomForces(customForces, angleDeg);
  // Net down-slope force without spring
  const netNoSpring = Px - fcSlope;
  // Spring force (up-slope, positive when stretched) needed to balance:
  //   Fe = netNoSpring  →  k·Δx = netNoSpring  →  Δx = netNoSpring / k
  if (k <= 0) return 0;
  return netNoSpring / k;
}
