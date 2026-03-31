import { describe, it, expect } from 'vitest';
import { computeInclinedPlane } from '../../src/simulator/forces/scenarios/inclined-plane.js';

describe('computeInclinedPlane', () => {
  it('computes forces on 30-degree incline', () => {
    const r = computeInclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0 });
    expect(r.weight).toBeCloseTo(98.1, 1);
    expect(r.parallel).toBeCloseTo(49.05, 1);
    expect(r.slides).toBe(true);
  });
  it('detects no sliding with high friction', () => {
    const r = computeInclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0.8 });
    expect(r.slides).toBe(false);
  });
});
