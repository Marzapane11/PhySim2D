import { describe, it, expect } from 'vitest';
import { computeEquilibrium } from '../../src/simulator/forces/scenarios/equilibrium.js';

describe('computeEquilibrium', () => {
  it('detects equilibrium', () => {
    const r = computeEquilibrium([{ x: 5, y: 0 }, { x: -5, y: 0 }]);
    expect(r.balanced).toBe(true);
  });
  it('detects non-equilibrium', () => {
    const r = computeEquilibrium([{ x: 5, y: 3 }, { x: -2, y: 0 }]);
    expect(r.balanced).toBe(false);
    expect(r.missingForce.x).toBeCloseTo(-3, 5);
    expect(r.missingForce.y).toBeCloseTo(-3, 5);
  });
});
