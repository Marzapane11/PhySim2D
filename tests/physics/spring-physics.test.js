import { describe, it, expect } from 'vitest';
import { computeSpringEquilibriumDx } from '../../src/simulator/forces/physics.js';

describe('computeSpringEquilibriumDx — basic', () => {
  it('horizontal (α=0) with no custom forces: Δx = 0', () => {
    const dx = computeSpringEquilibriumDx({ mass: 5, angleDeg: 0, k: 100 });
    expect(dx).toBeCloseTo(0, 5);
  });

  it('α=30°, m=4, k=60: Δx = P·sin(30)/k', () => {
    const dx = computeSpringEquilibriumDx({ mass: 4, angleDeg: 30, k: 60 });
    // Px = 4*9.81*0.5 = 19.62, Δx = 19.62/60 = 0.327
    expect(dx).toBeCloseTo(0.327, 2);
  });

  it('α=45°, m=5, k=100: Δx = (5*9.81*sin45)/100', () => {
    const dx = computeSpringEquilibriumDx({ mass: 5, angleDeg: 45, k: 100 });
    expect(dx).toBeCloseTo(0.3467, 3);
  });

  it('k=0 returns 0', () => {
    const dx = computeSpringEquilibriumDx({ mass: 5, angleDeg: 30, k: 0 });
    expect(dx).toBe(0);
  });
});

describe('computeSpringEquilibriumDx — with custom forces', () => {
  it('up-slope force reduces Δx', () => {
    const base = computeSpringEquilibriumDx({ mass: 4, angleDeg: 30, k: 60 });
    const withF = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 5, angleDeg: 180 }],
    });
    expect(withF).toBeLessThan(base);
    // New: (19.62 - 5) / 60 = 0.2437
    expect(withF).toBeCloseTo(0.2437, 3);
  });

  it('down-slope force increases Δx', () => {
    const withF = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 5, angleDeg: 0 }],
    });
    // (19.62 - (-5)) / 60 = 24.62/60 = 0.4103
    expect(withF).toBeCloseTo(0.4103, 3);
  });

  it('up-slope force equal to Px makes Δx = 0', () => {
    const dx = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 19.62, angleDeg: 180 }],
    });
    expect(dx).toBeCloseTo(0, 3);
  });

  it('up-slope force larger than Px makes Δx negative (compression)', () => {
    const dx = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 30, angleDeg: 180 }],
    });
    // (19.62 - 30) / 60 = -0.173
    expect(dx).toBeCloseTo(-0.173, 2);
  });

  it('perpendicular force (outward) does not change Δx', () => {
    const base = computeSpringEquilibriumDx({ mass: 4, angleDeg: 30, k: 60 });
    const withF = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 15, angleDeg: 90 }],
    });
    expect(withF).toBeCloseTo(base, 3);
  });

  it('perpendicular force (into surface) does not change Δx', () => {
    const base = computeSpringEquilibriumDx({ mass: 4, angleDeg: 30, k: 60 });
    const withF = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [{ magnitude: 15, angleDeg: 270 }],
    });
    expect(withF).toBeCloseTo(base, 3);
  });

  it('multiple forces sum effects', () => {
    const dx = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60,
      customForces: [
        { magnitude: 5, angleDeg: 180 },  // up-slope → fcSlope = +5
        { magnitude: 3, angleDeg: 0 },    // down-slope → fcSlope = -3
        { magnitude: 10, angleDeg: 90 },  // perpendicular → no effect on dx
      ],
    });
    // Net fcSlope = 5 - 3 = 2
    // Δx = (19.62 - 2) / 60 = 0.2937
    expect(dx).toBeCloseTo(0.2937, 3);
  });
});
