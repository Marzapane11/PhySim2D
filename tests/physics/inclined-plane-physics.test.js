import { describe, it, expect } from 'vitest';
import { computeInclinedPlaneState, projectCustomForces } from '../../src/simulator/forces/physics.js';

const G = 9.81;

describe('projectCustomForces', () => {
  it('force at 0° is fully down-slope (negative up-slope)', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 0 }], 30);
    expect(r.fcSlope).toBeCloseTo(-10, 4);
    expect(r.fcNormal).toBeCloseTo(0, 4);
  });

  it('force at 180° is fully up-slope', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 180 }], 30);
    expect(r.fcSlope).toBeCloseTo(10, 4);
    expect(r.fcNormal).toBeCloseTo(0, 4);
  });

  it('force at 90° is fully outward normal', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 90 }], 30);
    expect(r.fcSlope).toBeCloseTo(0, 4);
    expect(r.fcNormal).toBeCloseTo(10, 4);
  });

  it('force at 270° is fully into surface', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 270 }], 30);
    expect(r.fcSlope).toBeCloseTo(0, 4);
    expect(r.fcNormal).toBeCloseTo(-10, 4);
  });

  it('force at 45° is half down-slope, half outward', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 45 }], 30);
    expect(r.fcSlope).toBeCloseTo(-7.071, 3);
    expect(r.fcNormal).toBeCloseTo(7.071, 3);
  });

  it('multiple forces sum correctly', () => {
    const r = projectCustomForces([
      { magnitude: 10, angleDeg: 180 },
      { magnitude: 5, angleDeg: 90 },
    ], 30);
    expect(r.fcSlope).toBeCloseTo(10, 4);
    expect(r.fcNormal).toBeCloseTo(5, 4);
  });

  it('magnitude is preserved through projection', () => {
    const r = projectCustomForces([{ magnitude: 15, angleDeg: 45 }], 30);
    const mag = Math.sqrt(r.fcSlope ** 2 + r.fcNormal ** 2);
    expect(mag).toBeCloseTo(15, 3);
  });

  it('works with alpha = 0 (flat)', () => {
    const r = projectCustomForces([{ magnitude: 10, angleDeg: 0 }], 0);
    // at alpha=0, slope direction is the negative x-axis
    // force at customAngle=0 → world angle 0 → (10, 0) → projection onto sd=(-1,0) = -10
    expect(r.fcSlope).toBeCloseTo(-10, 4);
    expect(r.fcNormal).toBeCloseTo(0, 4);
  });
});

describe('computeInclinedPlaneState — no custom forces', () => {
  it('equilibrium when mu = tan(alpha)', () => {
    const r = computeInclinedPlaneState({ mass: 10, angleDeg: 30, mu: Math.tan(Math.PI / 6) });
    expect(r.Fris).toBeCloseTo(0, 3);
    expect(r.status).toBe('Equilibrio');
  });

  it('slides when mu < tan(alpha)', () => {
    const r = computeInclinedPlaneState({ mass: 10, angleDeg: 45, mu: 0.3 });
    expect(r.Fris).toBeGreaterThan(0);
    expect(r.status).toBe('Scivola giù');
  });

  it('stays still when mu > tan(alpha)', () => {
    const r = computeInclinedPlaneState({ mass: 10, angleDeg: 20, mu: 0.9 });
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
  });

  it('flat surface with no friction and no force: equilibrium', () => {
    const r = computeInclinedPlaneState({ mass: 10, angleDeg: 0, mu: 0 });
    expect(r.Fris).toBe(0);
    expect(r.Px).toBeCloseTo(0, 5);
    expect(r.status).toBe('Equilibrio');
  });

  it('weight and normal at α=30° for m=4', () => {
    const r = computeInclinedPlaneState({ mass: 4, angleDeg: 30, mu: 0.5 });
    expect(r.P).toBeCloseTo(39.24, 2);
    expect(r.Px).toBeCloseTo(19.62, 2);
    expect(r.N).toBeCloseTo(33.98, 2);
  });
});

describe('computeInclinedPlaneState — with custom forces', () => {
  const base = { mass: 4, angleDeg: 30, mu: 0.5774 }; // mu ~ tan(30)

  it('custom force up-slope small (within friction range) → equilibrium', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 10, angleDeg: 180 }],
    });
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
    // Fa should be 9.62 (balances remaining down-slope)
    expect(r.Fa).toBeCloseTo(9.62, 2);
  });

  it('custom force up-slope large → box goes up', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 50, angleDeg: 180 }],
    });
    // Net no-fa = 19.62 - 50 = -30.38 (up)
    // FaMax = 0.5774 * 33.98 = 19.62
    // |30.38| > 19.62 → kinetic
    // Fris = -30.38 + 19.62 = -10.76
    expect(r.Fris).toBeCloseTo(-10.76, 1);
    expect(r.status).toBe('Sale');
  });

  it('custom force down-slope adds to Px → slides faster', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 10, angleDeg: 0 }],
    });
    // Net no-fa = 19.62 - (-10) = 29.62
    // Fris = 29.62 - 19.62 = 10
    expect(r.Fris).toBeCloseTo(10, 2);
    expect(r.status).toBe('Scivola giù');
  });

  it('custom force outward reduces N → less friction → slides', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 10, angleDeg: 90 }],
    });
    // fcNormal = 10, N_tot = 33.98 - 10 = 23.98
    // FaMax = 0.5774 * 23.98 = 13.85
    // netNoFa = 19.62
    // Fris = 19.62 - 13.85 = 5.77
    expect(r.N).toBeCloseTo(23.98, 2);
    expect(r.Fris).toBeCloseTo(5.77, 1);
    expect(r.status).toBe('Scivola giù');
  });

  it('custom force into surface increases N → more friction → stays', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 10, angleDeg: 270 }],
    });
    // fcNormal = -10, N_tot = 43.98
    // FaMax = 0.5774 * 43.98 = 25.40
    // netNoFa = 19.62 ≤ 25.40 → static
    expect(r.N).toBeCloseTo(43.98, 2);
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
  });

  it('mixed force (magnitude, diagonal)', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [{ magnitude: 15, angleDeg: 45 }],
    });
    // fcSlope = -10.607, fcNormal = 10.607
    // N = 33.98 - 10.607 = 23.37
    // FaMax = 0.5774 * 23.37 = 13.50
    // netNoFa = 19.62 - (-10.607) = 30.23
    // Fris = 30.23 - 13.50 = 16.73
    expect(r.N).toBeCloseTo(23.37, 1);
    expect(r.Fris).toBeCloseTo(16.73, 1);
    expect(r.status).toBe('Scivola giù');
  });

  it('two forces: up-slope and outward', () => {
    const r = computeInclinedPlaneState({
      ...base,
      customForces: [
        { magnitude: 10, angleDeg: 180 },
        { magnitude: 5, angleDeg: 90 },
      ],
    });
    // fcSlope = 10, fcNormal = 5
    // N = 33.98 - 5 = 28.98
    // FaMax = 0.5774 * 28.98 = 16.74
    // netNoFa = 19.62 - 10 = 9.62 ≤ 16.74 → static
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
  });

  it('flat surface with horizontal custom force and friction → equilibrium', () => {
    const r = computeInclinedPlaneState({
      mass: 4,
      angleDeg: 0,
      mu: 0.5,
      customForces: [{ magnitude: 10, angleDeg: 0 }],
    });
    // On flat: sd = (-1, 0). Force at customAngle=0 → world 0° → (10, 0)
    // fcSlope = -10 (down-slope which is +x). fcNormal = 0
    // Px = 0, N = 4*9.81 = 39.24, FaMax = 19.62
    // netNoFa = 0 - (-10) = 10 ≤ 19.62 → static
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
  });

  it('flat surface with horizontal force exceeding friction → slides', () => {
    const r = computeInclinedPlaneState({
      mass: 4,
      angleDeg: 0,
      mu: 0.3,
      customForces: [{ magnitude: 20, angleDeg: 0 }],
    });
    // Px = 0, N = 39.24, FaMax = 11.77
    // netNoFa = 0 - (-20) = 20 > 11.77
    // Fris = 20 - 11.77 = 8.23
    expect(r.Fris).toBeCloseTo(8.23, 1);
    expect(r.status).toBe('Scivola giù');
  });

  it('zero custom forces matches no-custom case', () => {
    const a = computeInclinedPlaneState({ mass: 5, angleDeg: 25, mu: 0.4 });
    const b = computeInclinedPlaneState({ mass: 5, angleDeg: 25, mu: 0.4, customForces: [] });
    expect(a.Fris).toBeCloseTo(b.Fris, 5);
    expect(a.status).toBe(b.status);
  });
});
