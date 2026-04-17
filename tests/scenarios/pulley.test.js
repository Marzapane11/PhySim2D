import { describe, it, expect } from 'vitest';
import { computePulleyIncline } from '../../src/simulator/forces/scenarios/pulley.js';

const G = 9.81;

describe('computePulleyIncline (carrucola con piano inclinato)', () => {
  // m1 = sul piano (con attrito); m2 = appesa in verticale.
  // driving = P2 - P1x (quando positivo, m2 tira m1 su per il piano).

  it('equilibrio: attrito sufficiente a bilanciare', () => {
    // m1=5kg (sul piano), m2=1kg (appesa), θ=30°, μ=0.5
    // P1x = 5*9.81*sin(30) = 24.525
    // Fa_max = μ*P1*cos(30) = 21.24
    // P2 = 9.81; driving = 9.81 - 24.525 = -14.7
    // |driving| < Fa_max → equilibrio
    const r = computePulleyIncline({ m1: 5, m2: 1, angleDeg: 30, mu: 0.5 });
    expect(r.status).toBe('Equilibrio');
    expect(r.a).toBeCloseTo(0, 5);
    expect(r.T).toBeCloseTo(G, 2);
    expect(r.Fa).toBeCloseTo(14.715, 1);
  });

  it('m1 sale: m2 vince, supera l\'attrito', () => {
    // m1=3 (sul piano), m2=10 (appesa), θ=30°, μ=0.2
    // P1x = 3*9.81*0.5 = 14.715, FaMax = 0.2*3*9.81*cos(30)=5.097
    // P2 = 98.1; driving = 98.1 - 14.715 = 83.385 >> FaMax → m1 sale
    // a = (83.385 - 5.097)/(3+10) = 6.022
    const r = computePulleyIncline({ m1: 3, m2: 10, angleDeg: 30, mu: 0.2 });
    expect(r.status).toBe('m\u2081 sale');
    expect(r.a).toBeCloseTo(6.022, 2);
    expect(r.T).toBeCloseTo(10 * (G - r.a), 2);
    expect(r.Fa).toBeCloseTo(5.097, 2);
    expect(r.frictionDir).toBe(-1);
  });

  it('m1 scende: m1 vince, supera l\'attrito', () => {
    // m1=10 (sul piano), m2=1 (appesa), θ=45°, μ=0.1
    // P1x = 10*9.81*sin(45) = 69.36, FaMax = 0.1*10*9.81*cos(45)=6.936
    // P2 = 9.81; driving = 9.81 - 69.36 = -59.55
    // |driving| > FaMax → m1 scende
    // a = (59.55 - 6.936)/(10+1) = 4.783
    const r = computePulleyIncline({ m1: 10, m2: 1, angleDeg: 45, mu: 0.1 });
    expect(r.status).toBe('m\u2081 scende');
    expect(r.a).toBeCloseTo(4.783, 2);
    expect(r.T).toBeCloseTo(1 * (G + r.a), 2);
    expect(r.Fa).toBeCloseTo(6.936, 2);
    expect(r.frictionDir).toBe(1);
  });

  it('piano orizzontale (θ=0): solo P2 tira orizzontalmente', () => {
    // θ=0: P1x=0 → driving = P2 sempre positivo
    // m1=5 sul piano, m2=2 appesa, μ=0.1 → FaMax = 0.1*5*9.81 = 4.905
    // driving = 2*9.81 = 19.62 > 4.905 → m1 sale (trascinata dalla fune)
    const r = computePulleyIncline({ m1: 5, m2: 2, angleDeg: 0, mu: 0.1 });
    expect(r.status).toBe('m\u2081 sale');
    expect(r.P1x).toBeCloseTo(0, 5);
    expect(r.N).toBeCloseTo(5 * G, 2);
  });

  it('attrito alto: equilibrio anche senza m2', () => {
    const r = computePulleyIncline({ m1: 5, m2: 0.1, angleDeg: 20, mu: 0.9 });
    expect(r.status).toBe('Equilibrio');
    expect(r.a).toBeCloseTo(0, 5);
  });

  it('pesi calcolati correttamente', () => {
    const r = computePulleyIncline({ m1: 5, m2: 3, angleDeg: 30, mu: 0.2 });
    expect(r.P1).toBeCloseTo(5 * G, 2);
    expect(r.P2).toBeCloseTo(3 * G, 2);
    expect(r.N).toBeCloseTo(5 * G * Math.cos(Math.PI / 6), 2);
    expect(r.P1x).toBeCloseTo(5 * G * Math.sin(Math.PI / 6), 2);
  });
});
