import * as THREE from 'three';
import { createArrow, scaleForceVector } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';
import { calcTriangle, drawTriangle, drawBox, addTextLabel } from './inclined-plane.js';

const G = 9.81;

function drawRope(sceneManager, p1, p2, color) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) return;
  const ux = dx / len;
  const uy = dy / len;
  const perpX = -uy;
  const perpY = ux;
  const w = 0.05;
  const shape = new THREE.Shape();
  shape.moveTo(p1.x + perpX * w / 2, p1.y + perpY * w / 2);
  shape.lineTo(p1.x - perpX * w / 2, p1.y - perpY * w / 2);
  shape.lineTo(p2.x - perpX * w / 2, p2.y - perpY * w / 2);
  shape.lineTo(p2.x + perpX * w / 2, p2.y + perpY * w / 2);
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  mesh.position.z = 0.015;
  sceneManager.objects.add(mesh);
}

/**
 * Carrucola con piano inclinato.
 * m1 appesa in verticale; m2 sul piano inclinato (angolo θ, attrito μ).
 * La fune, di massa trascurabile, passa su carrucola ideale in cima al piano.
 * Convenzione: a > 0 significa che m2 sale lungo il piano (m1 scende).
 */
export function computePulleyIncline({ m1, m2, angleDeg, mu }) {
  const rad = (angleDeg * Math.PI) / 180;
  const P1 = m1 * G;
  const P2 = m2 * G;
  const P2x = P2 * Math.sin(rad);   // componente di P2 lungo il piano (diretta in giu)
  const N = P2 * Math.cos(rad);     // normale sul piano
  const FaMax = mu * N;             // attrito statico massimo
  const driving = P1 - P2x;         // forza netta (>0 se m1 vince e tira m2 su)

  let a = 0;
  let T = 0;
  let Fa = 0;
  let status;
  let frictionDir = 0;              // +1 = lungo pendenza verso B (su), -1 = verso A (giu)

  if (Math.abs(driving) <= FaMax + 1e-9) {
    // Equilibrio statico: attrito si adatta per bilanciare
    a = 0;
    T = P1;
    Fa = Math.abs(driving);
    status = 'Equilibrio';
    frictionDir = driving >= 0 ? -1 : 1;
  } else if (driving > 0) {
    // m1 vince: m2 sale, m1 scende
    a = (driving - FaMax) / (m1 + m2);
    T = m1 * (G - a);
    Fa = FaMax;
    status = 'm\u2082 sale';
    frictionDir = -1;               // attrito oppone il moto = giu lungo il piano
  } else {
    // m2 vince: m2 scende, m1 sale
    a = (-driving - FaMax) / (m1 + m2);
    T = m1 * (G + a);
    Fa = FaMax;
    status = 'm\u2082 scende';
    frictionDir = 1;                // attrito oppone il moto = su lungo il piano
  }

  return { P1, P2, P2x, N, Fa, T, a, status, frictionDir, driving, FaMax };
}

// Backwards-compat wrapper per eventuali chiamate legacy
export function computePulley(params) { return computePulleyIncline(params); }

export function createPulleySolver() {
  return createSolver({
    variables: [
      { id: 'm1', label: 'Massa 1 (m\u2081)', unit: 'kg', defaultValue: 3, mode: 'input' },
      { id: 'm2', label: 'Massa 2 (m\u2082)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B8)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'mu', label: 'Coeff. attrito (\u03BC)', unit: '', defaultValue: 0.2, mode: 'input' },
      { id: 'P1', label: 'Peso 1 (<span class="vec-arrow">P</span>\u2081)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'P2', label: 'Peso 2 (<span class="vec-arrow">P</span>\u2082)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'P2x', label: 'P2x (lungo piano)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'N', label: 'Normale (<span class="vec-arrow">N</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'Fa', label: 'Attrito (<span class="vec-arrow">F</span>a)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'T', label: 'Tensione (<span class="vec-arrow">T</span>)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'a', label: 'Accelerazione (a)', unit: 'm/s\u00B2', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const has = (id) => inputIds.includes(id);
      let m1 = has('m1') ? vals.m1 : null;
      let m2 = has('m2') ? vals.m2 : null;
      let alpha = has('alpha') ? vals.alpha : null;
      let mu = has('mu') ? vals.mu : null;
      let P1 = has('P1') ? vals.P1 : null;
      let P2 = has('P2') ? vals.P2 : null;

      // Formule inverse peso <-> massa
      if (m1 == null && P1 != null) m1 = P1 / G;
      if (P1 == null && m1 != null) P1 = m1 * G;
      if (m2 == null && P2 != null) m2 = P2 / G;
      if (P2 == null && m2 != null) P2 = m2 * G;

      if (m1 != null && m2 != null && alpha != null && mu != null) {
        const s = computePulleyIncline({ m1, m2, angleDeg: alpha, mu });
        return {
          m1, m2, alpha, mu,
          P1: m1 * G, P2: m2 * G,
          P2x: s.P2x, N: s.N, Fa: s.Fa, T: s.T, a: s.a,
        };
      }

      return { m1, m2, alpha, mu, P1, P2, P2x: 0, N: 0, Fa: 0, T: 0, a: 0 };
    },
  });
}

export function getPulleyConfig() {
  return { id: 'pulley', label: 'Carrucola', defaults: { m1: 3, m2: 5, angleDeg: 30, frictionCoeff: 0.2 } };
}

export function renderPulley(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const tri = calcTriangle(state.angleDeg);
  const { A, B, sd, nd } = tri;

  drawTriangle(sceneManager, tri, isLight, '\u03B8', { showSideLabels: false, showVertexB: false });

  const calc = computePulleyIncline({
    m1: state.m1, m2: state.m2, angleDeg: state.angleDeg, mu: state.mu,
  });

  // === Carrucola tangente al piano nel vertice B ===
  // Centro = B + r*nd: slope tangente al cerchio in B, pulley visibilmente sul corner
  const pulleyR = 0.5;
  const pulleyX = B.x + pulleyR * nd.x;
  const pulleyY = B.y + pulleyR * nd.y;

  const wheel = new THREE.Mesh(
    new THREE.RingGeometry(pulleyR - 0.1, pulleyR, 32),
    new THREE.MeshBasicMaterial({ color: 0x4fc3f7, side: THREE.DoubleSide })
  );
  wheel.position.set(pulleyX, pulleyY, 0.02);
  sceneManager.objects.add(wheel);

  const axle = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 16),
    new THREE.MeshBasicMaterial({ color: isLight ? 0x333333 : 0xe0e0e0 })
  );
  axle.position.set(pulleyX, pulleyY, 0.025);
  sceneManager.objects.add(axle);

  // Etichetta B (in alto a sinistra della carrucola, vicino al vertice)
  addTextLabel(sceneManager, 'B', pulleyX - pulleyR - 0.3, pulleyY + 0.3, '#4fc3f7');

  // === m2 sul piano ===
  const boxW = 1.2, boxH = 0.9;
  const boxT = 0.5;
  const boxBx = A.x + boxT * (B.x - A.x);
  const boxBy = A.y + boxT * (B.y - A.y);
  const m2Center = drawBox(sceneManager, boxBx, boxBy, sd, nd, boxW, boxH);

  // Punto di attacco fune su m2: spigolo anteriore sul piano (lato verso B)
  const ropeAttachX = boxBx + (boxW / 2) * sd.x;
  const ropeAttachY = boxBy + (boxW / 2) * sd.y;

  // Tangenti esatte sulla carrucola
  const ropeSlopeEndX = B.x;                       // tangente esattamente in B
  const ropeSlopeEndY = B.y;
  const ropeVertEndX = pulleyX - pulleyR;          // tangente verticale sul lato sinistro
  const ropeVertEndY = pulleyY;

  // === m1 sospesa direttamente sotto il tangente verticale della carrucola ===
  const m1W = 0.6, m1H = 0.6;
  const m1HangX = ropeVertEndX;
  const m1HangY = pulleyY - 1.6;

  // Fune disegnata come rettangolo sottile per essere ben visibile
  const ropeColor = isLight ? 0x444444 : 0xd0d0d0;
  drawRope(sceneManager, { x: ropeAttachX, y: ropeAttachY }, { x: ropeSlopeEndX, y: ropeSlopeEndY }, ropeColor);
  drawRope(sceneManager, { x: ropeVertEndX, y: ropeVertEndY }, { x: m1HangX, y: m1HangY + m1H / 2 }, ropeColor);

  if (visibility.body) {
    // Disegna m1 come rettangolo (stile simile a drawBox)
    const m1Corners = [
      { x: m1HangX - m1W / 2, y: m1HangY - m1H / 2 },
      { x: m1HangX + m1W / 2, y: m1HangY - m1H / 2 },
      { x: m1HangX + m1W / 2, y: m1HangY + m1H / 2 },
      { x: m1HangX - m1W / 2, y: m1HangY + m1H / 2 },
    ];
    for (let i = 0; i < 4; i++) {
      const a0 = m1Corners[i];
      const b0 = m1Corners[(i + 1) % 4];
      sceneManager.objects.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a0.x, a0.y, 0.03),
          new THREE.Vector3(b0.x, b0.y, 0.03),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff7043 }),
      ));
    }

    // Etichette masse (dentro le scatole)
    addTextLabel(sceneManager, 'm\u2081', m1HangX, m1HangY, '#ff7043');
    addTextLabel(sceneManager, 'm\u2082', m2Center.x, m2Center.y, '#ff7043');

    // μ sul piano (tra m2 e il vertice B, spostato fuori dal piano)
    const muT = 0.25; // 25% da B verso A
    const muX = B.x + muT * (A.x - B.x) + nd.x * 0.5;
    const muY = B.y + muT * (A.y - B.y) + nd.y * 0.5;
    addTextLabel(sceneManager, '\u03BC', muX, muY, '#66bb6a');

    if (visibility.forceArrows) {
      // === Forze su m2 ===
      // P2 — peso verso il basso
      const p2Vec = scaleForceVector(0, -calc.P2);
      const p2A = createArrow(m2Center, p2Vec, 0x4fc3f7, 'P\u2082');
      if (p2A) sceneManager.objects.add(p2A);

      // N — normale (fuori dalla superficie)
      const nVec = scaleForceVector(nd.x * calc.N, nd.y * calc.N);
      const nA = createArrow(m2Center, nVec, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // T su m2 — su lungo il piano (verso B)
      if (calc.T > 0.01) {
        const tVec = scaleForceVector(sd.x * calc.T, sd.y * calc.T);
        const tA = createArrow(m2Center, tVec, 0x9575cd, 'T');
        if (tA) sceneManager.objects.add(tA);
      }

      // Fa su m2 — direzione dipende dal moto
      if (calc.Fa > 0.01) {
        const dir = calc.frictionDir; // +1 verso B, -1 verso A
        const faVec = scaleForceVector(dir * sd.x * calc.Fa, dir * sd.y * calc.Fa, 0.28);
        const faA = createArrow(m2Center, faVec, 0xffff00, 'Fa');
        if (faA) sceneManager.objects.add(faA);
      }

      // === Forze su m1 ===
      const m1Center = { x: m1HangX, y: m1HangY };

      // P1 — peso verso il basso
      const p1Vec = scaleForceVector(0, -calc.P1);
      const p1A = createArrow(m1Center, p1Vec, 0x4fc3f7, 'P\u2081');
      if (p1A) sceneManager.objects.add(p1A);

      // T su m1 — verticale verso l'alto
      if (calc.T > 0.01) {
        const t1Vec = scaleForceVector(0, calc.T);
        const t1A = createArrow(m1Center, t1Vec, 0x9575cd, 'T');
        if (t1A) sceneManager.objects.add(t1A);
      }
    }
  }
}
