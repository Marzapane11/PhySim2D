import { describe, it, expect } from 'vitest';
import { computePointForces } from '../../src/simulator/forces/scenarios/point-forces.js';

describe('computePointForces', () => {
  it('calculates resultant of two forces', () => {
    const forces = [{ x: 3, y: 0 }, { x: 0, y: 4 }];
    const result = computePointForces(forces);
    expect(result.resultant.x).toBeCloseTo(3, 5);
    expect(result.resultant.y).toBeCloseTo(4, 5);
    expect(result.magnitude).toBeCloseTo(5, 5);
  });
  it('returns zero for no forces', () => {
    const result = computePointForces([]);
    expect(result.magnitude).toBe(0);
  });
});
