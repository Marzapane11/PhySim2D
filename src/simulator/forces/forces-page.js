import '../../styles/simulator.css';
import { createSimulatorLayout } from '../simulator-layout.js';
import { SceneManager } from '../scene-manager.js';
import { createGrid, setGridVisible } from '../grid.js';
import { LabelManager } from '../label-renderer.js';
import { renderToolbar } from '../toolbar.js';
import { renderPropertiesPanel, createPropertyRow, createInputRow } from '../properties-panel.js';
import { renderVisibilityMenu } from '../visibility-menu.js';
import { renderContextualTip } from '../../theory/contextual-tip.js';
import { getState, subscribe } from '../../state.js';
import { magnitude, direction } from '../../math/vector-math.js';

import { renderPointForces, getPointForcesConfig, computePointForces } from './scenarios/point-forces.js';
import { renderInclinedPlane, getInclinedPlaneConfig, computeInclinedPlane } from './scenarios/inclined-plane.js';
import { renderSpring, getSpringConfig, computeSpring } from './scenarios/spring.js';
import { renderPulley, getPulleyConfig, computePulley } from './scenarios/pulley.js';

const SCENARIO_TOOLS = [
  { id: 'point-forces', label: 'Forze su un punto', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><line x1="12" y1="10" x2="12" y2="3"/><line x1="14" y1="12" x2="21" y2="12"/><line x1="10" y1="14" x2="5" y2="19"/></svg>' },
  { id: 'inclined-plane', label: 'Piano inclinato', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18L3 6z"/></svg>' },
  { id: 'spring', label: 'Molla', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h2l1-3 2 6 2-6 2 6 2-6 2 6 1-3h2"/></svg>' },
  { id: 'pulley', label: 'Carrucola', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="4"/><line x1="8" y1="6" x2="8" y2="20"/><line x1="16" y1="6" x2="16" y2="20"/><rect x="6" y="18" width="4" height="4"/><rect x="14" y="16" width="4" height="4"/></svg>' },
];

const TIP_MAP = {
  'point-forces': 'point-forces',
  'inclined-plane': 'inclined-plane',
  'spring': 'force-hooke',
  'pulley': 'force-tension',
};

function initScenarioState(id) {
  switch (id) {
    case 'point-forces': {
      const cfg = getPointForcesConfig();
      return { forces: cfg.defaultForces.map((f) => ({ ...f })) };
    }
    case 'inclined-plane': {
      const cfg = getInclinedPlaneConfig();
      return { ...cfg.defaults };
    }
    case 'spring': {
      const cfg = getSpringConfig();
      return { ...cfg.defaults };
    }
    case 'pulley': {
      const cfg = getPulleyConfig();
      return { ...cfg.defaults };
    }
    default:
      return {};
  }
}

export function renderForcesPage(container) {
  const { canvasContainer, toolbar, rightPanel } = createSimulatorLayout(container);

  const sceneManager = new SceneManager(canvasContainer);
  const gridGroup = createGrid(sceneManager.scene);
  setGridVisible(gridGroup, false); // No grid for force scenarios
  const labelManager = new LabelManager(canvasContainer);

  let activeScenario = 'point-forces';
  let scenarioState = initScenarioState(activeScenario);

  renderToolbar(toolbar, SCENARIO_TOOLS, (toolId) => {
    activeScenario = toolId;
    scenarioState = initScenarioState(toolId);
    sceneManager.resetCamera();
    updateScene();
    updatePanel();
  });

  function updateScene() {
    sceneManager.clearObjects();
    labelManager.clear();

    const vis = getState().visibility;
    setGridVisible(gridGroup, vis.grid);

    switch (activeScenario) {
      case 'point-forces':
        renderPointForces(sceneManager, scenarioState.forces, vis);
        break;
      case 'inclined-plane':
        renderInclinedPlane(sceneManager, scenarioState, vis);
        break;
      case 'spring':
        renderSpring(sceneManager, scenarioState, vis);
        break;
      case 'pulley':
        renderPulley(sceneManager, scenarioState, vis);
        break;
    }
  }

  function updatePanel() {
    const sections = [];

    switch (activeScenario) {
      case 'point-forces': {
        const forces = scenarioState.forces;
        let forceRows = '';
        forces.forEach((f, i) => {
          forceRows +=
            `<div style="margin-bottom:6px;padding:4px 0;border-bottom:1px solid var(--border);">` +
            `<strong style="color:var(--text-primary);font-size:13px;">${f.name}</strong>` +
            createInputRow('X', `pf-x-${i}`, f.x, 'N', 'step="0.5"') +
            createInputRow('Y', `pf-y-${i}`, f.y, 'N', 'step="0.5"') +
            `</div>`;
        });
        forceRows += `<button id="btn-add-force" style="margin-top:8px;width:100%;padding:6px;background:var(--accent);color:white;border-radius:var(--radius-sm);font-size:12px;">Aggiungi forza</button>`;
        sections.push({ title: 'Forze', content: forceRows });

        const result = computePointForces(forces);
        sections.push({
          title: 'Risultante',
          content:
            createPropertyRow('Rx', result.resultant.x.toFixed(2) + ' N') +
            createPropertyRow('Ry', result.resultant.y.toFixed(2) + ' N') +
            createPropertyRow('|R|', result.magnitude.toFixed(2) + ' N') +
            createPropertyRow('\u03b8', result.direction.toFixed(1) + '\u00b0'),
        });
        break;
      }

      case 'inclined-plane': {
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Massa', 'ip-mass', scenarioState.mass, 'kg', 'step="1" min="0.1"') +
            createInputRow('Angolo', 'ip-angle', scenarioState.angleDeg, '\u00b0', 'step="1" min="0" max="90"') +
            createInputRow('Coeff. attrito', 'ip-friction', scenarioState.frictionCoeff, '', 'step="0.05" min="0" max="1"'),
        });
        const calc = computeInclinedPlane(scenarioState);
        sections.push({
          title: 'Risultati',
          content:
            createPropertyRow('P (peso)', calc.weight.toFixed(2) + ' N') +
            createPropertyRow('N (normale)', calc.normal.toFixed(2) + ' N') +
            createPropertyRow('Px (parallela)', calc.parallel.toFixed(2) + ' N') +
            createPropertyRow('Fa (attrito)', calc.friction.toFixed(2) + ' N') +
            createPropertyRow('F netta', calc.netForce.toFixed(2) + ' N') +
            createPropertyRow('Scivola?', calc.slides ? 'Si' : 'No'),
        });
        break;
      }

      case 'spring': {
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('k', 'sp-k', scenarioState.k, 'N/m', 'step="10" min="1"') +
            createInputRow('x', 'sp-x', scenarioState.x, 'm', 'step="0.1"'),
        });
        const calc = computeSpring(scenarioState);
        sections.push({
          title: 'Risultati',
          content:
            createPropertyRow('Fe (elastica)', calc.force.toFixed(2) + ' N') +
            createPropertyRow('F = -kx', calc.signedForce.toFixed(2) + ' N') +
            createPropertyRow('Direzione', calc.direction === 'restore' ? 'Richiamo' : 'Nessuna'),
        });
        break;
      }

      case 'pulley': {
        sections.push({
          title: 'Parametri',
          content:
            createInputRow('Massa 1', 'pu-m1', scenarioState.mass1, 'kg', 'step="1" min="0.1"') +
            createInputRow('Massa 2', 'pu-m2', scenarioState.mass2, 'kg', 'step="1" min="0.1"'),
        });
        const calc = computePulley(scenarioState);
        sections.push({
          title: 'Risultati',
          content:
            createPropertyRow('Accelerazione', calc.acceleration.toFixed(2) + ' m/s\u00b2') +
            createPropertyRow('Tensione', calc.tension.toFixed(2) + ' N') +
            createPropertyRow('Peso 1', calc.weight1.toFixed(2) + ' N') +
            createPropertyRow('Peso 2', calc.weight2.toFixed(2) + ' N') +
            createPropertyRow('Lato pesante', calc.heavierSide === 'balanced' ? 'Bilanciato' : calc.heavierSide === 'mass1' ? 'Massa 1' : 'Massa 2'),
        });
        break;
      }
    }

    // Theory tip
    const tipId = TIP_MAP[activeScenario] || 'point-forces';
    sections.push({ title: 'Teoria', content: renderContextualTip(tipId) });

    renderPropertiesPanel(rightPanel, sections);
    renderVisibilityMenu(rightPanel);

    wireUpEvents();
  }

  function wireUpEvents() {
    switch (activeScenario) {
      case 'point-forces': {
        scenarioState.forces.forEach((f, i) => {
          const xInput = rightPanel.querySelector(`#pf-x-${i}`);
          const yInput = rightPanel.querySelector(`#pf-y-${i}`);
          if (xInput) {
            xInput.addEventListener('change', (e) => {
              scenarioState.forces[i].x = parseFloat(e.target.value) || 0;
              updateScene();
              updatePanel();
            });
          }
          if (yInput) {
            yInput.addEventListener('change', (e) => {
              scenarioState.forces[i].y = parseFloat(e.target.value) || 0;
              updateScene();
              updatePanel();
            });
          }
        });
        const addBtn = rightPanel.querySelector('#btn-add-force');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            const idx = scenarioState.forces.length + 1;
            scenarioState.forces.push({ x: 1, y: 0, name: `F${idx}` });
            updateScene();
            updatePanel();
          });
        }
        break;
      }

      case 'inclined-plane': {
        const massInput = rightPanel.querySelector('#ip-mass');
        const angleInput = rightPanel.querySelector('#ip-angle');
        const frictionInput = rightPanel.querySelector('#ip-friction');
        if (massInput) massInput.addEventListener('change', (e) => { scenarioState.mass = parseFloat(e.target.value) || 1; updateScene(); updatePanel(); });
        if (angleInput) angleInput.addEventListener('change', (e) => { scenarioState.angleDeg = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
        if (frictionInput) frictionInput.addEventListener('change', (e) => { scenarioState.frictionCoeff = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
        break;
      }

      case 'spring': {
        const kInput = rightPanel.querySelector('#sp-k');
        const xInput = rightPanel.querySelector('#sp-x');
        if (kInput) kInput.addEventListener('change', (e) => { scenarioState.k = parseFloat(e.target.value) || 1; updateScene(); updatePanel(); });
        if (xInput) xInput.addEventListener('change', (e) => { scenarioState.x = parseFloat(e.target.value) || 0; updateScene(); updatePanel(); });
        break;
      }

      case 'pulley': {
        const m1Input = rightPanel.querySelector('#pu-m1');
        const m2Input = rightPanel.querySelector('#pu-m2');
        if (m1Input) m1Input.addEventListener('change', (e) => { scenarioState.mass1 = parseFloat(e.target.value) || 1; updateScene(); updatePanel(); });
        if (m2Input) m2Input.addEventListener('change', (e) => { scenarioState.mass2 = parseFloat(e.target.value) || 1; updateScene(); updatePanel(); });
        break;
      }
    }
  }

  const unsubState = subscribe(() => {
    updateScene();
    updatePanel();
  });

  const labelInterval = setInterval(() => {
    labelManager.update();
  }, 50);

  updateScene();
  updatePanel();

  return () => {
    clearInterval(labelInterval);
    unsubState();
    labelManager.dispose();
    sceneManager.dispose();
  };
}
