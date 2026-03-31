import { describe, it, expect } from 'vitest';
import {
  createVector,
  addVectors,
  subtractVectors,
  scalarMultiply,
  magnitude,
  direction,
  decompose,
  resultant,
} from '../../src/math/vector-math.js';

describe('createVector', () => {
  it('creates a vector from components', () => {
    const v = createVector(3, 4);
    expect(v).toEqual({ x: 3, y: 4 });
  });

  it('creates a vector from magnitude and angle', () => {
    const v = createVector(5, 0, { polar: true });
    expect(v.x).toBeCloseTo(5, 5);
    expect(v.y).toBeCloseTo(0, 5);
  });

  it('creates a vector at 90 degrees', () => {
    const v = createVector(5, 90, { polar: true });
    expect(v.x).toBeCloseTo(0, 5);
    expect(v.y).toBeCloseTo(5, 5);
  });

  it('creates a vector at 45 degrees', () => {
    const v = createVector(10, 45, { polar: true });
    expect(v.x).toBeCloseTo(7.07107, 4);
    expect(v.y).toBeCloseTo(7.07107, 4);
  });
});

describe('addVectors', () => {
  it('adds two vectors', () => {
    const a = createVector(3, 4);
    const b = createVector(1, 2);
    const r = addVectors(a, b);
    expect(r).toEqual({ x: 4, y: 6 });
  });

  it('adds multiple vectors', () => {
    const a = createVector(1, 0);
    const b = createVector(0, 1);
    const c = createVector(-1, -1);
    const r = addVectors(a, b, c);
    expect(r).toEqual({ x: 0, y: 0 });
  });
});

describe('subtractVectors', () => {
  it('subtracts two vectors', () => {
    const a = createVector(5, 7);
    const b = createVector(2, 3);
    const r = subtractVectors(a, b);
    expect(r).toEqual({ x: 3, y: 4 });
  });
});

describe('scalarMultiply', () => {
  it('multiplies vector by scalar', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, 2);
    expect(r).toEqual({ x: 6, y: 8 });
  });

  it('multiplies by negative scalar', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, -1);
    expect(r).toEqual({ x: -3, y: -4 });
  });

  it('multiplies by zero', () => {
    const v = createVector(3, 4);
    const r = scalarMultiply(v, 0);
    expect(r).toEqual({ x: 0, y: 0 });
  });
});

describe('magnitude', () => {
  it('calculates magnitude of 3-4-5 triangle', () => {
    const v = createVector(3, 4);
    expect(magnitude(v)).toBeCloseTo(5, 5);
  });

  it('calculates magnitude of unit vector', () => {
    const v = createVector(1, 0);
    expect(magnitude(v)).toBeCloseTo(1, 5);
  });

  it('calculates magnitude of zero vector', () => {
    const v = createVector(0, 0);
    expect(magnitude(v)).toBeCloseTo(0, 5);
  });
});

describe('direction', () => {
  it('returns 0 for vector along x-axis', () => {
    const v = createVector(5, 0);
    expect(direction(v)).toBeCloseTo(0, 5);
  });

  it('returns 90 for vector along y-axis', () => {
    const v = createVector(0, 5);
    expect(direction(v)).toBeCloseTo(90, 5);
  });

  it('returns 45 for equal components', () => {
    const v = createVector(5, 5);
    expect(direction(v)).toBeCloseTo(45, 5);
  });

  it('returns 180 for negative x-axis', () => {
    const v = createVector(-5, 0);
    expect(direction(v)).toBeCloseTo(180, 5);
  });
});

describe('decompose', () => {
  it('decomposes a vector at 30 degrees', () => {
    const v = createVector(10, 30, { polar: true });
    const { x, y } = decompose(v);
    expect(x).toBeCloseTo(8.66025, 4);
    expect(y).toBeCloseTo(5, 4);
  });
});

describe('resultant', () => {
  it('computes resultant of multiple vectors', () => {
    const vectors = [
      createVector(3, 0),
      createVector(0, 4),
    ];
    const r = resultant(vectors);
    expect(r.vector).toEqual({ x: 3, y: 4 });
    expect(r.magnitude).toBeCloseTo(5, 5);
    expect(r.direction).toBeCloseTo(53.13010, 4);
  });
});
