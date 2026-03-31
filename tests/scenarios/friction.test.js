import { describe, it, expect } from 'vitest';
import { computeFriction } from '../../src/simulator/forces/scenarios/friction.js';

describe('computeFriction', () => {
  it('detects static friction', () => {
    const r = computeFriction({ mass: 10, appliedForce: 20, staticCoeff: 0.5, dynamicCoeff: 0.3 });
    expect(r.type).toBe('static');
    expect(r.moves).toBe(false);
  });
  it('detects dynamic friction', () => {
    const r = computeFriction({ mass: 10, appliedForce: 60, staticCoeff: 0.5, dynamicCoeff: 0.3 });
    expect(r.type).toBe('dynamic');
    expect(r.moves).toBe(true);
  });
});
