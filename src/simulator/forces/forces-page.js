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

import { renderInclinedPlane, getInclinedPlaneConfig, computeInclinedPlane, createInclinedPlaneSolver } from './scenarios/inclined-plane.js';
import { renderSpring, getSpringConfig, computeSpring, createSpringSolver } from './scenarios/spring.js';
import { renderPulley, getPulleyConfig, computePulley, createPulleySolver } from './scenarios/pulley.js';
import { renderDynamicPanel } from '../dynamic-panel.js';
import { computeInclinedPlaneState, computeSpringEquilibriumDx } from './physics.js';

const SCENARIO_TOOLS = [
  { id: 'inclined-plane', label: 'Piano e Piano inclinato', icon: '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="18" x2="13" y2="18"/><path d="M17 18h14L17 6z"/></svg>' },
  { id: 'spring', label: 'Molla', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h2l1-3 2 6 2-6 2 6 2-6 2 6 1-3h2"/></svg>' },
  { id: 'pulley', label: 'Carrucola', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="4"/><line x1="8" y1="6" x2="8" y2="20"/><line x1="16" y1="6" x2="16" y2="20"/><rect x="6" y="18" width="4" height="4"/><rect x="14" y="16" width="4" height="4"/></svg>' },
];

const TIP_MAP = {
  'inclined-plane': 'inclined-plane',
  'spring': 'force-hooke',
  'pulley': 'force-tension',
};

function initScenarioState(id) {
  switch (id) {
    case 'inclined-plane':
      return { type: 'inclined-plane', solver: createInclinedPlaneSolver(), customForces: [] };
    case 'spring':
      return { type: 'spring', solver: createSpringSolver(), customForces: [] };
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

  let activeScenario = 'inclined-plane';
  let scenarioState = initScenarioState(activeScenario);

  renderToolbar(toolbar, SCENARIO_TOOLS, (toolId) => {
    activeScenario = toolId;
    scenarioState = initScenarioState(toolId);
    sceneManager.resetCamera();
    updateScene();
    updatePanel();
  });

  // Override inclined-plane Fa and Fris with physically correct values (including custom forces)
  function updateInclinedPlaneRealValues() {
    if (activeScenario !== 'inclined-plane') return;
    const vars = scenarioState.solver.getVariables();
    const faVar = vars.find(v => v.id === 'Fa');
    const frisVar = vars.find(v => v.id === 'Fris');
    if (!faVar || !frisVar) return;
    if (faVar.mode !== 'output' || frisVar.mode !== 'output') return;

    const vals = scenarioState.solver.getValues();
    const result = computeInclinedPlaneState({
      mass: vals.m || 0,
      angleDeg: vals.alpha || 0,
      mu: vals.mu || 0,
      customForces: scenarioState.customForces || [],
    });

    scenarioState.solver.setValue('Fa', result.Fa);
    scenarioState.solver.setValue('Fris', result.Fris);
    scenarioState.solver.setValue('N', result.N);
  }

  // Recompute spring deformation from equilibrium when dx is in output mode
  function updateSpringEquilibrium() {
    if (activeScenario !== 'spring' || !scenarioState.customForces) return;
    const vars = scenarioState.solver.getVariables();
    const dxVar = vars.find(v => v.id === 'dx');
    if (!dxVar || dxVar.mode !== 'output') return;

    const vals = scenarioState.solver.getValues();
    const dx_eq = computeSpringEquilibriumDx({
      mass: vals.m || 0,
      angleDeg: vals.alpha || 0,
      k: vals.k || 0,
      customForces: scenarioState.customForces,
    });
    scenarioState.solver.setValue('dx', dx_eq);
  }

  function updateScene() {
    sceneManager.clearObjects();
    labelManager.clear();

    const vis = getState().visibility;
    updateSpringEquilibrium();
    // After solver.solve() runs in renderDynamicPanel, override with real values
    // But updateScene is called before panel is rendered, so solve here
    if (activeScenario === 'inclined-plane') {
      scenarioState.solver.solve();
      updateInclinedPlaneRealValues();
    }

    switch (activeScenario) {
      case 'inclined-plane': {
        scenarioState.solver.solve();
        const ipv = scenarioState.solver.getValues();
        renderInclinedPlane(sceneManager, { mass: ipv.m, angleDeg: ipv.alpha, frictionCoeff: ipv.mu, customForces: scenarioState.customForces }, vis);
        break;
      }
      case 'spring': {
        scenarioState.solver.solve();
        const spv = scenarioState.solver.getValues();
        renderSpring(sceneManager, { mass: spv.m, angleDeg: spv.alpha, k: spv.k, x: spv.dx, frictionCoeff: spv.mu, customForces: scenarioState.customForces }, vis);
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
    updateSpringEquilibrium();
    if (activeScenario === 'inclined-plane') {
      scenarioState.solver.solve();
      updateInclinedPlaneRealValues();
    }

    switch (activeScenario) {
      case 'inclined-plane':
      case 'spring':
      case 'pulley': {
        const panel = renderDynamicPanel(scenarioState.solver, () => { updateScene(); updatePanel(); });
        const solverVals = scenarioState.solver.getValues();
        let statusHtml = '';
        if (activeScenario === 'inclined-plane') {
          const result = computeInclinedPlaneState({
            mass: solverVals.m || 0,
            angleDeg: solverVals.alpha || 0,
            mu: solverVals.mu || 0,
            customForces: scenarioState.customForces || [],
          });
          let stato;
          if (result.status === 'Equilibrio') {
            stato = '<span style="color:var(--success);font-weight:600;">Equilibrio</span>';
          } else if (result.status === 'Scivola giù') {
            stato = '<span style="color:var(--danger);font-weight:600;">Scivola gi\u00F9</span>';
          } else {
            stato = '<span style="color:var(--warning);font-weight:600;">Sale</span>';
          }
          statusHtml = `<div class="panel-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);"><span class="panel-row-label">Stato</span><span class="panel-row-value">${stato}</span></div>`;
        }

        sections.push({ title: 'Parametri e Risultati', content: panel.html + statusHtml });
        scenarioState._wireEvents = panel.wireEvents;

        // Custom forces panel (always shown on inclined-plane and spring)
        if ((activeScenario === 'inclined-plane' || activeScenario === 'spring') && scenarioState.customForces) {
          let forcesHtml = '';
          scenarioState.customForces.forEach((f, i) => {
            forcesHtml += `<div style="margin-bottom:8px;padding:6px;border:1px solid var(--border-color);border-radius:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <strong style="color:var(--text-accent);">${f.name}</strong>
                <button class="remove-force" data-idx="${i}" style="color:var(--danger);background:none;border:none;cursor:pointer;font-size:14px;">\u2715</button>
              </div>
              ${createInputRow('Modulo', `cf-mag-${i}`, f.magnitude, 'N', 'step="1"')}
              ${createInputRow('Angolo', `cf-ang-${i}`, f.angleDeg, '\u00B0', 'step="5"')}
            </div>`;
          });
          forcesHtml += `<button id="btn-add-custom-force" style="width:100%;padding:8px;background:var(--accent);color:white;border-radius:var(--radius-sm);font-size:13px;font-weight:600;">+ Aggiungi forza</button>`;
          sections.push({ title: 'Forze personalizzate', content: forcesHtml });
        }
        break;
      }
    }

    // Theory tip
    const tipId = TIP_MAP[activeScenario] || 'inclined-plane';
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
    // Custom forces UI (inclined-plane and spring)
    if ((activeScenario === 'inclined-plane' || activeScenario === 'spring') && scenarioState.customForces) {
      const addBtn = rightPanel.querySelector('#btn-add-custom-force');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const idx = scenarioState.customForces.length + 1;
          scenarioState.customForces.push({ name: `F${idx}`, magnitude: 10, angleDeg: 0 });
          updateScene();
          updatePanel();
        });
      }
      scenarioState.customForces.forEach((f, i) => {
        const magInput = rightPanel.querySelector(`#cf-mag-${i}`);
        const angInput = rightPanel.querySelector(`#cf-ang-${i}`);
        if (magInput) {
          magInput.addEventListener('change', (e) => {
            scenarioState.customForces[i].magnitude = parseFloat(e.target.value) || 0;
            updateScene();
            updatePanel();
          });
        }
        if (angInput) {
          angInput.addEventListener('change', (e) => {
            scenarioState.customForces[i].angleDeg = parseFloat(e.target.value) || 0;
            updateScene();
            updatePanel();
          });
        }
      });
      rightPanel.querySelectorAll('.remove-force').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          scenarioState.customForces.splice(idx, 1);
          updateScene();
          updatePanel();
        });
      });
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
