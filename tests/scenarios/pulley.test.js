import { describe, it, expect } from 'vitest';
import { computePulley } from '../../src/simulator/forces/scenarios/pulley.js';

describe('computePulley', () => {
  it('calculates Atwood machine', () => {
    const r = computePulley({ mass1: 10, mass2: 5 });
    expect(r.acceleration).toBeCloseTo(3.27, 1);
    expect(r.tension).toBeCloseTo(65.4, 1);
    expect(r.heavierSide).toBe('mass1');
  });
  it('handles equal masses', () => {
    const r = computePulley({ mass1: 5, mass2: 5 });
    expect(r.acceleration).toBeCloseTo(0, 5);
    expect(r.heavierSide).toBe('balanced');
  });
});
