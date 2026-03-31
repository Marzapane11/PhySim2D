import { describe, it, expect } from 'vitest';
import {
  weight,
  inclinedPlane,
  springForce,
  frictionForce,
  isEquilibrium,
  pulleySystem,
} from '../../src/math/force-math.js';

const G = 9.81;

describe('weight', () => {
  it('calculates weight from mass', () => {
    expect(weight(10)).toBeCloseTo(98.1, 2);
  });
  it('returns 0 for mass 0', () => {
    expect(weight(0)).toBe(0);
  });
});

describe('inclinedPlane', () => {
  it('calculates forces on a 30-degree incline without friction', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0 });
    expect(result.weight).toBeCloseTo(98.1, 1);
    expect(result.parallel).toBeCloseTo(49.05, 1);
    expect(result.perpendicular).toBeCloseTo(84.96, 1);
    expect(result.normal).toBeCloseTo(84.96, 1);
    expect(result.friction).toBeCloseTo(0, 5);
    expect(result.netForce).toBeCloseTo(49.05, 1);
    expect(result.slides).toBe(true);
  });

  it('calculates forces on a 30-degree incline with friction', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 30, frictionCoeff: 0.7 });
    expect(result.friction).toBeCloseTo(59.47, 1);
    expect(result.slides).toBe(false);
  });

  it('handles flat surface (0 degrees)', () => {
    const result = inclinedPlane({ mass: 10, angleDeg: 0, frictionCoeff: 0 });
    expect(result.parallel).toBeCloseTo(0, 5);
    expect(result.perpendicular).toBeCloseTo(98.1, 1);
    expect(result.slides).toBe(false);
  });
});

describe('springForce', () => {
  it('calculates spring force with Hooke law', () => {
    const result = springForce({ k: 100, x: 0.5 });
    expect(result.force).toBeCloseTo(50, 5);
    expect(result.direction).toBe('restore');
  });

  it('handles compression (negative displacement)', () => {
    const result = springForce({ k: 100, x: -0.3 });
    expect(result.force).toBeCloseTo(30, 5);
    expect(result.direction).toBe('restore');
  });

  it('returns 0 for no displacement', () => {
    const result = springForce({ k: 100, x: 0 });
    expect(result.force).toBe(0);
  });
});

describe('frictionForce', () => {
  it('returns static friction when applied force is less than max static', () => {
    const result = frictionForce({
      mass: 10, appliedForce: 20, staticCoeff: 0.5, dynamicCoeff: 0.3,
    });
    expect(result.frictionValue).toBeCloseTo(20, 5);
    expect(result.maxStatic).toBeCloseTo(49.05, 1);
    expect(result.type).toBe('static');
    expect(result.moves).toBe(false);
  });

  it('returns dynamic friction when applied force exceeds max static', () => {
    const result = frictionForce({
      mass: 10, appliedForce: 60, staticCoeff: 0.5, dynamicCoeff: 0.3,
    });
    expect(result.frictionValue).toBeCloseTo(29.43, 1);
    expect(result.type).toBe('dynamic');
    expect(result.moves).toBe(true);
    expect(result.netForce).toBeCloseTo(30.57, 1);
  });
});

describe('isEquilibrium', () => {
  it('detects equilibrium when forces cancel', () => {
    const forces = [{ x: 10, y: 0 }, { x: -10, y: 0 }];
    const result = isEquilibrium(forces);
    expect(result.balanced).toBe(true);
    expect(result.resultantMagnitude).toBeCloseTo(0, 5);
  });

  it('detects non-equilibrium', () => {
    const forces = [{ x: 10, y: 0 }, { x: -5, y: 0 }];
    const result = isEquilibrium(forces);
    expect(result.balanced).toBe(false);
    expect(result.resultantMagnitude).toBeCloseTo(5, 5);
    expect(result.missingForce).toEqual({ x: -5, y: 0 });
  });
});

describe('pulleySystem', () => {
  it('calculates simple Atwood machine', () => {
    const result = pulleySystem({ mass1: 10, mass2: 5 });
    const expectedAcc = (G * (10 - 5)) / (10 + 5);
    const expectedTension = (2 * 10 * 5 * G) / (10 + 5);
    expect(result.acceleration).toBeCloseTo(expectedAcc, 2);
    expect(result.tension).toBeCloseTo(expectedTension, 2);
    expect(result.heavierSide).toBe('mass1');
  });

  it('returns 0 acceleration for equal masses', () => {
    const result = pulleySystem({ mass1: 5, mass2: 5 });
    expect(result.acceleration).toBeCloseTo(0, 5);
    expect(result.heavierSide).toBe('balanced');
  });
});
