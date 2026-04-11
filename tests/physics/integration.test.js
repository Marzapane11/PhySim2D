import { describe, it, expect } from 'vitest';
import { computeInclinedPlaneState, computeSpringEquilibriumDx } from '../../src/simulator/forces/physics.js';
import { createInclinedPlaneSolver } from '../../src/simulator/forces/scenarios/inclined-plane.js';
import { createSpringSolver } from '../../src/simulator/forces/scenarios/spring.js';

describe('Integration: inclined-plane solver + physics override', () => {
  it('after applying up-slope custom force, Fa and Fris reflect real values', () => {
    const solver = createInclinedPlaneSolver();
    solver.setValue('m', 4);
    solver.setValue('alpha', 30);
    solver.setValue('mu', 0.5774);
    solver.solve();

    // Without custom force: balance
    const beforeVals = solver.getValues();
    expect(beforeVals.Fa).toBeCloseTo(19.62, 1);
    expect(beforeVals.Fris).toBeCloseTo(0, 1);

    // Now simulate override with custom force up-slope
    const customForces = [{ magnitude: 10, angleDeg: 180 }];
    const result = computeInclinedPlaneState({
      mass: 4, angleDeg: 30, mu: 0.5774, customForces,
    });

    // Override solver values
    solver.setValue('Fa', result.Fa);
    solver.setValue('Fris', result.Fris);
    solver.setValue('N', result.N);

    const afterVals = solver.getValues();
    // Up-slope force reduces down-slope component; friction adapts
    expect(afterVals.Fa).toBeCloseTo(9.62, 1);
    expect(afterVals.Fris).toBe(0);
  });

  it('overridden values survive if solver is not re-solved', () => {
    const solver = createInclinedPlaneSolver();
    solver.solve();
    solver.setValue('Fa', 999);
    // If we DON'T call solve() again, the value stays
    expect(solver.getValues().Fa).toBe(999);
    // But after solve(), it gets recomputed
    solver.solve();
    expect(solver.getValues().Fa).not.toBe(999);
  });
});

describe('Integration: spring solver + equilibrium override', () => {
  it('when dx is output, override + Fe sync work correctly', () => {
    const solver = createSpringSolver();
    solver.setValue('m', 4);
    solver.setValue('alpha', 30);
    solver.setValue('k', 60);
    solver.toggleMode('dx'); // dx is now output
    solver.solve(); // computes baseline

    // Simulate the postSolve override with custom force up-slope
    const customForces = [{ magnitude: 5, angleDeg: 180 }];
    const dx_eq = computeSpringEquilibriumDx({
      mass: 4, angleDeg: 30, k: 60, customForces,
    });
    solver.setValue('dx', dx_eq);
    solver.setValue('Fe', Math.abs(60 * dx_eq));

    const vals = solver.getValues();
    expect(vals.dx).toBeCloseTo(dx_eq, 5);
    expect(vals.Fe).toBeCloseTo(Math.abs(60 * dx_eq), 5);
    // Physically: dx should be smaller than without the up-slope force
    const dxNoForce = computeSpringEquilibriumDx({ mass: 4, angleDeg: 30, k: 60 });
    expect(dx_eq).toBeLessThan(dxNoForce);
  });
});

describe('Physics sanity checks', () => {
  it('flat plane: horizontal force smaller than friction → equilibrium', () => {
    const r = computeInclinedPlaneState({
      mass: 10, angleDeg: 0, mu: 0.5,
      customForces: [{ magnitude: 10, angleDeg: 0 }],
    });
    // Fa max = 0.5 * 98.1 = 49.05, force = 10 < 49.05 → static
    expect(r.Fris).toBe(0);
    expect(r.status).toBe('Equilibrio');
  });

  it('flat plane: horizontal force larger than friction → slides', () => {
    const r = computeInclinedPlaneState({
      mass: 2, angleDeg: 0, mu: 0.2,
      customForces: [{ magnitude: 10, angleDeg: 0 }],
    });
    // Fa max = 0.2 * 19.62 = 3.924, force = 10 > 3.924
    // netNoFa = 0 - (-10) = 10, Fris = 10 - 3.924 = 6.076
    expect(r.Fris).toBeCloseTo(6.076, 2);
    expect(r.status).toBe('Scivola giù');
  });

  it('vertical force upward on flat surface lifts box → N = 0 → no friction', () => {
    const r = computeInclinedPlaneState({
      mass: 5, angleDeg: 0, mu: 0.5,
      customForces: [{ magnitude: 49.05, angleDeg: 90 }],  // = mg
    });
    // On flat α=0: customAngle=90 → outward normal = upward (perpendicular to slope)
    // fcNormal = 49.05 (fully outward)
    // N = max(0, 49.05 - 49.05) = 0
    // Fa = 0, Fris = 0 (no horizontal force)
    expect(r.N).toBeCloseTo(0, 2);
    expect(r.Fa).toBeCloseTo(0, 2);
    expect(r.Fris).toBe(0);
  });

  it('opposing forces cancel out', () => {
    const r = computeInclinedPlaneState({
      mass: 10, angleDeg: 30, mu: 0.2,
      customForces: [
        { magnitude: 10, angleDeg: 0 },     // down-slope
        { magnitude: 10, angleDeg: 180 },   // up-slope
      ],
    });
    // fcSlope = -10 + 10 = 0
    // Same as no custom forces
    const baseline = computeInclinedPlaneState({ mass: 10, angleDeg: 30, mu: 0.2 });
    expect(r.Fris).toBeCloseTo(baseline.Fris, 3);
  });

  it('angle 90° (vertical wall), no friction', () => {
    const r = computeInclinedPlaneState({ mass: 5, angleDeg: 90, mu: 0 });
    // Px = P, N = 0, Fa = 0, Fris = Px = 49.05
    expect(r.Px).toBeCloseTo(49.05, 1);
    expect(r.N).toBeCloseTo(0, 3);
    expect(r.Fris).toBeCloseTo(49.05, 1);
  });

  it('zero mass returns all zeros', () => {
    const r = computeInclinedPlaneState({ mass: 0, angleDeg: 30, mu: 0.5 });
    expect(r.P).toBe(0);
    expect(r.Px).toBe(0);
    expect(r.N).toBe(0);
    expect(r.Fa).toBe(0);
    expect(r.Fris).toBe(0);
  });
});
