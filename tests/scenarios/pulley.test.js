import { describe, it, expect } from 'vitest';
import { computePulleyIncline } from '../../src/simulator/forces/scenarios/pulley.js';

const G = 9.81;

describe('computePulleyIncline (carrucola con piano inclinato)', () => {
  it('equilibrio: attrito sufficiente a bilanciare', () => {
    // m1=1kg, m2=5kg, θ=30°, μ=0.5
    // Px = m2*g*sin(30) = 5*9.81*0.5 = 24.525 N
    // Fa_max = μ*m2*g*cos(30) = 0.5*5*9.81*0.866 = 21.24 N
    // P1 = 9.81 N; driving = P1 - Px = 9.81 - 24.525 = -14.7 N
    // |driving| (14.7) < Fa_max (21.24) → equilibrio
    const r = computePulleyIncline({ m1: 1, m2: 5, angleDeg: 30, mu: 0.5 });
    expect(r.status).toBe('Equilibrio');
    expect(r.a).toBeCloseTo(0, 5);
    expect(r.T).toBeCloseTo(G, 2);
    expect(r.Fa).toBeCloseTo(Math.abs(-14.715), 1);
  });

  it('m2 sale: m1 vince, supera l\'attrito', () => {
    // m1=10kg, m2=3kg, θ=30°, μ=0.2
    // P1 = 98.1, Px = 3*9.81*0.5 = 14.715
    // FaMax = 0.2*3*9.81*cos(30) = 5.097
    // driving = 98.1 - 14.715 = 83.385 >> FaMax → m2 sale
    // a = (83.385 - 5.097) / (10+3) = 6.022 m/s²
    const r = computePulleyIncline({ m1: 10, m2: 3, angleDeg: 30, mu: 0.2 });
    expect(r.status).toBe('m\u2082 sale');
    expect(r.a).toBeCloseTo(6.022, 2);
    expect(r.T).toBeCloseTo(10 * (G - r.a), 2);
    expect(r.Fa).toBeCloseTo(5.097, 2);
    expect(r.frictionDir).toBe(-1);
  });

  it('m2 scende: m2 vince, supera l\'attrito', () => {
    // m1=1kg, m2=10kg, θ=45°, μ=0.1
    // P1 = 9.81, Px = 10*9.81*sin(45) = 69.36
    // FaMax = 0.1*10*9.81*cos(45) = 6.936
    // driving = 9.81 - 69.36 = -59.55; |driving| > FaMax → m2 scende
    // a = (59.55 - 6.936) / (1+10) = 4.783 m/s²
    const r = computePulleyIncline({ m1: 1, m2: 10, angleDeg: 45, mu: 0.1 });
    expect(r.status).toBe('m\u2082 scende');
    expect(r.a).toBeCloseTo(4.783, 2);
    expect(r.T).toBeCloseTo(1 * (G + r.a), 2);
    expect(r.Fa).toBeCloseTo(6.936, 2);
    expect(r.frictionDir).toBe(1);
  });

  it('piano orizzontale (θ=0): solo P1 tira orizzontalmente', () => {
    // θ=0: Px=0, quindi driving = P1 sempre positivo
    // m1=2, m2=5, μ=0.1 → FaMax = 0.1*5*9.81 = 4.905
    // driving = 2*9.81 = 19.62 > 4.905 → m2 sale (orizzontale, verso la carrucola)
    const r = computePulleyIncline({ m1: 2, m2: 5, angleDeg: 0, mu: 0.1 });
    expect(r.status).toBe('m\u2082 sale');
    expect(r.P2x).toBeCloseTo(0, 5);
    expect(r.N).toBeCloseTo(5 * G, 2);
  });

  it('attrito statico alto: sempre equilibrio anche senza m1', () => {
    // μ molto alto: anche m2 grande su pendio con m1 piccolissima sta fermo
    const r = computePulleyIncline({ m1: 0.1, m2: 5, angleDeg: 20, mu: 0.9 });
    expect(r.status).toBe('Equilibrio');
    expect(r.a).toBeCloseTo(0, 5);
  });

  it('pesi calcolati correttamente', () => {
    const r = computePulleyIncline({ m1: 3, m2: 5, angleDeg: 30, mu: 0.2 });
    expect(r.P1).toBeCloseTo(3 * G, 2);
    expect(r.P2).toBeCloseTo(5 * G, 2);
    expect(r.N).toBeCloseTo(5 * G * Math.cos(Math.PI / 6), 2);
    expect(r.P2x).toBeCloseTo(5 * G * Math.sin(Math.PI / 6), 2);
  });
});
