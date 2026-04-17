import { describe, it, expect } from 'vitest';
import { createInclinedPlaneSolver } from '../../src/simulator/forces/scenarios/inclined-plane.js';

// Verifica che Fris nel solver del piano inclinato gestisca correttamente
// l'attrito statico adattivo (equilibrio) e le formule inverse.

describe('Inclined plane solver: Fris con attrito statico adattivo', () => {
  it('Fris = 0 quando |Px| <= Fa (equilibrio)', () => {
    // m=10, α=30° → Px = 10*9.81*0.5 = 49.05; Py = 10*9.81*cos(30) = 84.96
    // μ=0.7 → Fa_max = 0.7*84.96 = 59.47 > Px = 49.05 → equilibrio
    const solver = createInclinedPlaneSolver();
    solver.setValue('m', 10);
    solver.setValue('alpha', 30);
    solver.setValue('mu', 0.7);
    solver.solve();
    const v = solver.getValues();
    expect(v.Fris).toBeCloseTo(0, 5);
  });

  it('Fris > 0 quando Px > Fa (scivola giu\')', () => {
    const solver = createInclinedPlaneSolver();
    solver.setValue('m', 10);
    solver.setValue('alpha', 45);
    solver.setValue('mu', 0.1);
    solver.solve();
    const v = solver.getValues();
    const expectedFris = v.Px - v.Fa;
    expect(v.Fris).toBeCloseTo(expectedFris, 2);
    expect(v.Fris).toBeGreaterThan(0);
  });

  it('Formula inversa: Px da Fris e Fa', () => {
    const solver = createInclinedPlaneSolver();
    // Fris e Fa input, Px output. Toggleiamo i mode dei parametri.
    solver.toggleMode('Fris'); // da output a input
    solver.toggleMode('Fa');   // da output a input
    solver.toggleMode('m');    // da input a output (per fare spazio nei gradi di liberta')
    solver.setValue('Fris', 20);
    solver.setValue('Fa', 10);
    solver.setValue('alpha', 30);
    solver.solve();
    const v = solver.getValues();
    // Px dovrebbe essere Fris + sign(Fris)*Fa = 20 + 10 = 30
    expect(v.Px).toBeCloseTo(30, 2);
  });
});
