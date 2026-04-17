import * as THREE from 'three';
import { createArrow, scaleForceVector } from '../../vector-renderer.js';
import { getState } from '../../../state.js';
import { createSolver } from '../../dynamic-solver.js';
import { calcTriangle, drawTriangle, drawBox, addTextLabel } from './inclined-plane.js';

const G = 9.81;

// Punto di tangenza sulla circonferenza dal punto esterno P (quello "sopra" se sign=1)
function tangentPoint(P, O, r, sign) {
  const dx = P.x - O.x;
  const dy = P.y - O.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= r) return { x: O.x, y: O.y };
  const cosA = r / d;
  const sinA = Math.sqrt(1 - cosA * cosA);
  const ux = dx / d;
  const uy = dy / d;
  const tx = ux * cosA - uy * sinA * sign;
  const ty = uy * cosA + ux * sinA * sign;
  return { x: O.x + r * tx, y: O.y + r * ty };
}

function drawRope(sceneManager, p1, p2, color) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) return;
  const ux = dx / len;
  const uy = dy / len;
  const perpX = -uy;
  const perpY = ux;
  const w = 0.025;
  const shape = new THREE.Shape();
  shape.moveTo(p1.x + perpX * w / 2, p1.y + perpY * w / 2);
  shape.lineTo(p1.x - perpX * w / 2, p1.y - perpY * w / 2);
  shape.lineTo(p2.x - perpX * w / 2, p2.y - perpY * w / 2);
  shape.lineTo(p2.x + perpX * w / 2, p2.y + perpY * w / 2);
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    })
  );
  mesh.position.z = 0.015;
  sceneManager.objects.add(mesh);
}

/**
 * Carrucola con piano inclinato.
 * m1 sul piano inclinato (angolo θ, attrito μ); m2 appesa in verticale.
 * La fune, di massa trascurabile, passa su carrucola ideale in cima al piano.
 * Convenzione: a > 0 significa che m1 sale lungo il piano (m2 scende).
 */
export function computePulleyIncline({ m1, m2, angleDeg, mu }) {
  const rad = (angleDeg * Math.PI) / 180;
  const P1 = m1 * G;                // peso m1 (sul piano)
  const P2 = m2 * G;                // peso m2 (appesa)
  const P1x = P1 * Math.sin(rad);   // componente di P1 lungo il piano (diretta in giu)
  const N = P1 * Math.cos(rad);     // normale sul piano
  const FaMax = mu * N;             // attrito statico massimo
  const driving = P2 - P1x;         // forza netta (>0 se m2 vince e tira m1 su per il piano)

  let a = 0;
  let T = 0;
  let Fa = 0;
  let status;
  let frictionDir = 0;              // +1 = lungo pendenza verso B (su), -1 = verso A (giu)

  if (Math.abs(driving) <= FaMax + 1e-9) {
    // Equilibrio statico: attrito si adatta per bilanciare
    a = 0;
    T = P2;
    Fa = Math.abs(driving);
    status = 'Equilibrio';
    frictionDir = driving >= 0 ? -1 : 1;
  } else if (driving > 0) {
    // m2 vince: m1 sale, m2 scende
    a = (driving - FaMax) / (m1 + m2);
    T = m2 * (G - a);
    Fa = FaMax;
    status = 'm\u2081 sale';
    frictionDir = -1;               // attrito oppone il moto = giu lungo il piano
  } else {
    // m1 vince: m1 scende, m2 sale
    a = (-driving - FaMax) / (m1 + m2);
    T = m2 * (G + a);
    Fa = FaMax;
    status = 'm\u2081 scende';
    frictionDir = 1;                // attrito oppone il moto = su lungo il piano
  }

  return { P1, P2, P1x, N, Fa, T, a, status, frictionDir, driving, FaMax };
}

// Backwards-compat wrapper per eventuali chiamate legacy
export function computePulley(params) { return computePulleyIncline(params); }

export function createPulleySolver() {
  return createSolver({
    variables: [
      { id: 'm1', label: 'Massa 1 (m\u2081, sul piano)', unit: 'kg', defaultValue: 5, mode: 'input' },
      { id: 'm2', label: 'Massa 2 (m\u2082, appesa)', unit: 'kg', defaultValue: 3, mode: 'input' },
      { id: 'alpha', label: 'Angolo (\u03B8)', unit: '\u00B0', defaultValue: 30, mode: 'input' },
      { id: 'mu', label: 'Coeff. attrito (\u03BC)', unit: '', defaultValue: 0.2, mode: 'input' },
      { id: 'P1', label: 'Peso 1 (<span class="vec-arrow">P</span>\u2081)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'P2', label: 'Peso 2 (<span class="vec-arrow">P</span>\u2082)', unit: 'N', defaultValue: 0, mode: 'output' },
      { id: 'P1x', label: 'P1x (lungo piano)', unit: 'N', defaultValue: 0, mode: 'output' },
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
          P1x: s.P1x, N: s.N, Fa: s.Fa, T: s.T, a: s.a,
        };
      }

      return { m1, m2, alpha, mu, P1, P2, P1x: 0, N: 0, Fa: 0, T: 0, a: 0 };
    },
  });
}

export function getPulleyConfig() {
  return { id: 'pulley', label: 'Carrucola', defaults: { m1: 5, m2: 3, angleDeg: 30, frictionCoeff: 0.2 } };
}

export function renderPulley(sceneManager, state, visibility) {
  const isLight = getState().theme === 'light';
  const tri = calcTriangle(state.angleDeg);
  const { A, B, sd, nd } = tri;

  drawTriangle(sceneManager, tri, isLight, '\u03B8', { showSideLabels: false, showVertexB: false });

  const calc = computePulleyIncline({
    m1: state.m1, m2: state.m2, angleDeg: state.angleDeg, mu: state.mu,
  });

  // === m1 sul piano (piu' grande) ===
  const boxW = 1.2, boxH = 0.9;
  const boxT = 0.5;
  const boxBx = A.x + boxT * (B.x - A.x);
  const boxBy = A.y + boxT * (B.y - A.y);
  const m1Center = drawBox(sceneManager, boxBx, boxBy, sd, nd, boxW, boxH);

  // === Carrucola: centro all'altezza del centro del box m1 (boxH/2 dal piano) + r sulla normale
  // Cosi' la retta parallela al piano passante per m1Center e' tangente alla puleggia,
  // e la fune da m1Center al tangente e' perfettamente parallela all'ipotenusa.
  const pulleyR = 0.4;
  const pulleyOffsetN = boxH / 2 + pulleyR;
  const pulleyX = B.x + pulleyOffsetN * nd.x;
  const pulleyY = B.y + pulleyOffsetN * nd.y;

  // Staffa triangolare di supporto (sotto la puleggia, come nella foto)
  const bracketColor = isLight ? 0xa94438 : 0xd04438;
  const bracketMat = new THREE.LineBasicMaterial({ color: bracketColor });
  // Base della staffa attaccata al vertice B e al punto (B.x + 0.4, B.y)
  const bracketBase1 = { x: B.x, y: B.y };
  const bracketBase2 = { x: B.x + 0.5, y: B.y };
  const bracketApex = { x: pulleyX, y: pulleyY - pulleyR * 0.2 };
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bracketBase1.x, bracketBase1.y, 0.01),
      new THREE.Vector3(bracketApex.x, bracketApex.y, 0.01),
      new THREE.Vector3(bracketBase2.x, bracketBase2.y, 0.01),
      new THREE.Vector3(bracketBase1.x, bracketBase1.y, 0.01),
    ]),
    bracketMat,
  ));

  // Puleggia: disco pieno con bordo (come nella foto)
  const wheelFill = new THREE.Mesh(
    new THREE.CircleGeometry(pulleyR, 32),
    new THREE.MeshBasicMaterial({ color: isLight ? 0x9e9eff : 0x8585c8 })
  );
  wheelFill.position.set(pulleyX, pulleyY, 0.02);
  sceneManager.objects.add(wheelFill);

  // Bordo scuro della puleggia
  const wheelEdge = new THREE.Mesh(
    new THREE.RingGeometry(pulleyR - 0.03, pulleyR, 32),
    new THREE.MeshBasicMaterial({ color: isLight ? 0x333355 : 0x1a1a2e })
  );
  wheelEdge.position.set(pulleyX, pulleyY, 0.025);
  sceneManager.objects.add(wheelEdge);

  // Etichetta B al vertice del triangolo (dove e' davvero B)
  addTextLabel(sceneManager, 'B', B.x - 0.5, B.y + 0.4, '#4fc3f7');

  // Punto di attacco fune su m1: centro del box (come nella foto di riferimento)
  const ropeAttachX = m1Center.x;
  const ropeAttachY = m1Center.y;

  // Tangente esatta: il punto sulla puleggia piu' vicino al piano (centro - r*nd)
  // si trova esattamente sulla retta parallela al piano a quota boxH/2 (dove sta m1Center),
  // quindi la fune e' perfettamente parallela all'ipotenusa.
  const ropeSlopeEndX = pulleyX - pulleyR * nd.x;
  const ropeSlopeEndY = pulleyY - pulleyR * nd.y;
  const ropeVertEndX = pulleyX - pulleyR;          // tangente verticale a sinistra
  const ropeVertEndY = pulleyY;

  // === m2 sospesa: piu' piccola di m1, fuori dal lato del triangolo ===
  const m2W = 0.6, m2H = 0.6;
  const m2HangX = Math.min(ropeVertEndX, B.x - m2W / 2 - 0.1);
  const m2HangY = pulleyY - 1.8;

  // Fune disegnata come rettangolo sottile per essere ben visibile
  const ropeColor = isLight ? 0x444444 : 0xd0d0d0;
  drawRope(sceneManager, { x: ropeAttachX, y: ropeAttachY }, { x: ropeSlopeEndX, y: ropeSlopeEndY }, ropeColor);
  drawRope(sceneManager, { x: ropeVertEndX, y: ropeVertEndY }, { x: m2HangX, y: m2HangY }, ropeColor);

  if (visibility.body) {
    // Disegna m2 come rettangolo
    const m2Corners = [
      { x: m2HangX - m2W / 2, y: m2HangY - m2H / 2 },
      { x: m2HangX + m2W / 2, y: m2HangY - m2H / 2 },
      { x: m2HangX + m2W / 2, y: m2HangY + m2H / 2 },
      { x: m2HangX - m2W / 2, y: m2HangY + m2H / 2 },
    ];
    for (let i = 0; i < 4; i++) {
      const a0 = m2Corners[i];
      const b0 = m2Corners[(i + 1) % 4];
      sceneManager.objects.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a0.x, a0.y, 0.03),
          new THREE.Vector3(b0.x, b0.y, 0.03),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff7043 }),
      ));
    }

    // Etichette masse (fuori dalle scatole)
    // m1: sopra il box m1 sul piano
    const m1LabelOffset = boxH / 2 + 0.45;
    addTextLabel(sceneManager, 'm\u2081', m1Center.x + m1LabelOffset * nd.x, m1Center.y + m1LabelOffset * nd.y, '#ff7043');
    // m2: a sinistra del box m2 appesa
    addTextLabel(sceneManager, 'm\u2082', m2HangX - m2W / 2 - 0.4, m2HangY, '#ff7043');

    // μ sul piano, dal lato opposto alla fune (tra m2 e A, poco sopra la superficie)
    const muT = 0.25; // 25% da A verso B
    const muX = A.x + muT * (B.x - A.x) + nd.x * 0.35;
    const muY = A.y + muT * (B.y - A.y) + nd.y * 0.35;
    addTextLabel(sceneManager, '\u03BC', muX, muY, '#66bb6a');

    if (visibility.forceArrows) {
      // === Forze su m1 (sul piano) ===
      // P1 — peso verso il basso
      const p1Vec = scaleForceVector(0, -calc.P1);
      const p1A = createArrow(m1Center, p1Vec, 0x4fc3f7, 'P\u2081');
      if (p1A) sceneManager.objects.add(p1A);

      // N — normale (fuori dalla superficie)
      const nVec = scaleForceVector(nd.x * calc.N, nd.y * calc.N);
      const nA = createArrow(m1Center, nVec, 0x66bb6a, 'N');
      if (nA) sceneManager.objects.add(nA);

      // T su m1 — su lungo il piano (verso B)
      if (calc.T > 0.01) {
        const tVec = scaleForceVector(sd.x * calc.T, sd.y * calc.T);
        const tA = createArrow(m1Center, tVec, 0x9575cd, 'T');
        if (tA) sceneManager.objects.add(tA);
      }

      // Fa su m1 — direzione dipende dal moto
      if (calc.Fa > 0.01) {
        const dir = calc.frictionDir; // +1 verso B, -1 verso A
        const faVec = scaleForceVector(dir * sd.x * calc.Fa, dir * sd.y * calc.Fa, 0.28);
        const faA = createArrow(m1Center, faVec, 0xffff00, 'Fa');
        if (faA) sceneManager.objects.add(faA);
      }

      // === Forze su m2 (appesa) ===
      const m2Center = { x: m2HangX, y: m2HangY };

      // P2 — peso verso il basso
      const p2Vec = scaleForceVector(0, -calc.P2);
      const p2A = createArrow(m2Center, p2Vec, 0x4fc3f7, 'P\u2082');
      if (p2A) sceneManager.objects.add(p2A);

      // T su m2 — verticale verso l'alto
      if (calc.T > 0.01) {
        const t2Vec = scaleForceVector(0, calc.T);
        const t2A = createArrow(m2Center, t2Vec, 0x9575cd, 'T');
        if (t2A) sceneManager.objects.add(t2A);
      }
    }
  }
}
