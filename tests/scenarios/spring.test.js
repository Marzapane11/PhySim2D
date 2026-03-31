import { describe, it, expect } from 'vitest';
import { computeSpring } from '../../src/simulator/forces/scenarios/spring.js';

describe('computeSpring', () => {
  it('calculates spring force', () => {
    const r = computeSpring({ k: 200, x: 0.5 });
    expect(r.force).toBeCloseTo(100, 5);
    expect(r.direction).toBe('restore');
  });
  it('returns 0 for no displacement', () => {
    const r = computeSpring({ k: 200, x: 0 });
    expect(r.force).toBe(0);
  });
});
