import '../../styles/simulator.css';
import { createSimulatorLayout } from '../simulator-layout.js';
import { SceneManager } from '../scene-manager.js';
import { createGrid, setAxesVisible } from '../grid.js';
import { LabelManager } from '../label-renderer.js';
import { renderToolbar } from '../toolbar.js';
import { renderPropertiesPanel, createPropertyRow, createInputRow } from '../properties-panel.js';
import { renderVisibilityMenu } from '../visibility-menu.js';
import { renderContextualTip } from '../../theory/contextual-tip.js';
import { getState, subscribe } from '../../state.js';
import { magnitude, direction } from '../../math/vector-math.js';

import { renderPointForces, getPointForcesConfig, computePointForces } from './scenarios/point-forces.js';
import { renderInclinedPlane, getInclinedPlaneConfig, computeInclinedPlane, createInclinedPlaneSolver } from './scenarios/inclined-plane.js';
import { renderSpring, getSpringConfig, computeSpring, createSpringSolver } from './scenarios/spring.js';
import { renderPulley, getPulleyConfig, computePulley, createPulleySolver } from './scenarios/pulley.js';
import { renderDynamicPanel } from '../dynamic-panel.js';

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
    case 'inclined-plane':
      return { type: 'inclined-plane', solver: createInclinedPlaneSolver() };
    case 'spring':
      return { type: 'spring', solver: createSpringSolver() };
    case 'pulley':
      return { type: 'pulley', solver: createPulleySolver() };
    default:
      return {};
  }
}

export function renderForcesPage(container) {
  const { canvasContainer, toolbar, rightPanel } = createSimulatorLayout(container);

  const sceneManager = new SceneManager(canvasContainer);
  const gridGroup = createGrid(sceneManager.scene);
  setAxesVisible(gridGroup, false); // Grid si, assi no
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

    switch (activeScenario) {
      case 'point-forces':
        renderPointForces(sceneManager, scenarioState.forces, vis);
        break;
      case 'inclined-plane': {
        scenarioState.solver.solve();
        const ipv = scenarioState.solver.getValues();
        renderInclinedPlane(sceneManager, { mass: ipv.m, angleDeg: ipv.alpha, frictionCoeff: ipv.mu }, vis);
        break;
      }
      case 'spring': {
        scenarioState.solver.solve();
        const spv = scenarioState.solver.getValues();
        renderSpring(sceneManager, { mass: spv.m, angleDeg: spv.alpha, k: spv.k, x: spv.dx }, vis);
        break;
      }
      case 'pulley': {
        scenarioState.solver.solve();
        const puv = scenarioState.solver.getValues();
        renderPulley(sceneManager, { mass1: puv.m1, mass2: puv.m2 }, vis);
        break;
      }
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

      case 'inclined-plane':
      case 'spring':
      case 'pulley': {
        const panel = renderDynamicPanel(scenarioState.solver, () => { updateScene(); updatePanel(); });
        const solverVals = scenarioState.solver.getValues();
        let statusHtml = '';
        if (activeScenario === 'inclined-plane') {
          const Fris = solverVals.Fris || 0;
          let stato;
          if (Math.abs(Fris) < 0.01) {
            stato = '<span style="color:var(--success);font-weight:600;">Equilibrio (Fris = 0)</span>';
          } else if (Fris > 0) {
            stato = '<span style="color:var(--danger);font-weight:600;">Scivola (Fris > 0)</span>';
          } else {
            stato = '<span style="color:var(--success);font-weight:600;">Fermo (Fris < 0)</span>';
          }
          statusHtml = `<div class="panel-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);"><span class="panel-row-label">Stato</span><span class="panel-row-value">${stato}</span></div>`;
        }
        sections.push({ title: 'Parametri e Risultati', content: panel.html + statusHtml });
        scenarioState._wireEvents = panel.wireEvents;
        break;
      }
    }

    // Theory tip
    const tipId = TIP_MAP[activeScenario] || 'point-forces';
    sections.push({ title: 'Teoria', content: renderContextualTip(tipId) });

    renderPropertiesPanel(rightPanel, sections);
    renderVisibilityMenu(rightPanel);

    if (scenarioState._wireEvents) {
      scenarioState._wireEvents(rightPanel);
      scenarioState._wireEvents = null;
    }

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

      // inclined-plane, spring, pulley handled by dynamic panel wireEvents
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
