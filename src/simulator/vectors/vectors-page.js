import '../../styles/simulator.css';
import { createSimulatorLayout } from '../simulator-layout.js';
import { SceneManager } from '../scene-manager.js';
import { createGrid, setGridVisible } from '../grid.js';
import { createArrow, createResultantArrow, createAngleArc, resetColorIndex, getNextColor } from '../vector-renderer.js';
import { LabelManager } from '../label-renderer.js';
import { renderToolbar } from '../toolbar.js';
import { renderPropertiesPanel, createPropertyRow, createInputRow } from '../properties-panel.js';
import { renderVisibilityMenu } from '../visibility-menu.js';
import { addVectors, subtractVectors, scalarMultiply, magnitude, direction } from '../../math/vector-math.js';
import { getState, subscribe } from '../../state.js';
import { renderContextualTip } from '../../theory/contextual-tip.js';
import { createSolver } from '../dynamic-solver.js';
import { renderDynamicPanel } from '../dynamic-panel.js';

const TOOLS = [
  { id: 'create', label: 'Crea Vettore', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="13 5 19 5 19 11"/></svg>' },
  { id: 'sum', label: 'Somma', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' },
  { id: 'difference', label: 'Differenza', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>' },
  { id: 'scalar', label: 'Scalare x Vettore', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><text x="6" y="17" font-size="14" font-weight="bold" fill="currentColor" stroke="none">k</text><line x1="14" y1="16" x2="22" y2="8"/><polyline points="18 8 22 8 22 12"/></svg>' },
  { id: 'decompose', label: 'Scomponi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/><polyline points="14 4 20 4 20 10"/><line x1="4" y1="20" x2="20" y2="20" stroke-dasharray="3,3"/><line x1="20" y1="20" x2="20" y2="4" stroke-dasharray="3,3"/></svg>' },
];

function createVectorSolver(vx, vy, name) {
  return createSolver({
    variables: [
      { id: 'vx', label: `${name}x`, unit: '', defaultValue: vx, mode: 'input' },
      { id: 'vy', label: `${name}y`, unit: '', defaultValue: vy, mode: 'input' },
      { id: 'mod', label: `|${name}| (modulo)`, unit: '', defaultValue: 0, mode: 'output' },
      { id: 'dir', label: '\u03b8 (direzione)', unit: '\u00b0', defaultValue: 0, mode: 'output' },
    ],
    solve(vals, inputIds) {
      const has = (id) => inputIds.includes(id);
      let { vx, vy, mod, dir } = vals;

      if (has('vx') && has('vy')) {
        mod = Math.sqrt(vx * vx + vy * vy);
        const rad = Math.atan2(vy, vx);
        dir = rad * 180 / Math.PI;
        if (dir < 0) dir += 360;
      } else if (has('mod') && has('dir')) {
        const rad = dir * Math.PI / 180;
        vx = mod * Math.cos(rad);
        vy = mod * Math.sin(rad);
      } else if (has('vx') && has('mod')) {
        const vyAbs = Math.sqrt(Math.max(0, mod * mod - vx * vx));
        vy = vy >= 0 ? vyAbs : -vyAbs;
        const rad = Math.atan2(vy, vx);
        dir = rad * 180 / Math.PI;
        if (dir < 0) dir += 360;
      } else if (has('vy') && has('mod')) {
        const vxAbs = Math.sqrt(Math.max(0, mod * mod - vy * vy));
        vx = vx >= 0 ? vxAbs : -vxAbs;
        const rad = Math.atan2(vy, vx);
        dir = rad * 180 / Math.PI;
        if (dir < 0) dir += 360;
      } else if (has('vx') && has('dir')) {
        const rad = dir * Math.PI / 180;
        const cosA = Math.cos(rad);
        if (Math.abs(cosA) > 0.001) {
          mod = vx / cosA;
          vy = mod * Math.sin(rad);
        }
      } else if (has('vy') && has('dir')) {
        const rad = dir * Math.PI / 180;
        const sinA = Math.sin(rad);
        if (Math.abs(sinA) > 0.001) {
          mod = vy / sinA;
          vx = mod * Math.cos(rad);
        }
      }

      return { vx, vy, mod, dir };
    }
  });
}

export function renderVectorsPage(container) {
  const { canvasContainer, toolbar, rightPanel } = createSimulatorLayout(container);

  const sceneManager = new SceneManager(canvasContainer);
  const gridGroup = createGrid(sceneManager.scene);
  const labelManager = new LabelManager(canvasContainer);

  let vectors = [];
  let solvers = [];
  let activeTool = 'create';
  let selectedIndex = -1;
  let scalarValue = 2;

  const vectorColors = [];

  renderToolbar(toolbar, TOOLS, (toolId) => {
    activeTool = toolId;
    updateScene();
    updatePanel();
  });

  canvasContainer.addEventListener('click', (e) => {
    if (activeTool !== 'create') return;
    if (e.target !== sceneManager.renderer.domElement) return;

    const angle = Math.random() * Math.PI * 2;
    const mag = 1.5 + Math.random() * 3;
    const name = String.fromCharCode(65 + vectors.length);
    const vx = parseFloat((mag * Math.cos(angle)).toFixed(2));
    const vy = parseFloat((mag * Math.sin(angle)).toFixed(2));
    vectors.push({ x: vx, y: vy, originX: 0, originY: 0, name });
    solvers.push(createVectorSolver(vx, vy, name));
    selectedIndex = vectors.length - 1;
    updateScene();
    updatePanel();
  });

  function updateScene() {
    sceneManager.clearObjects();
    labelManager.clear();
    resetColorIndex();
    vectorColors.length = 0;

    const vis = getState().visibility;
    setGridVisible(gridGroup, vis.grid);

    vectors.forEach((v, i) => {
      const color = getNextColor();
      vectorColors.push(color);
      const arrow = createArrow({ x: v.originX, y: v.originY }, { x: v.x, y: v.y }, color, v.name);
      if (arrow) {
        sceneManager.objects.add(arrow);
        if (vis.forceNames || vis.forceValues) {
          let labelText = '';
          if (vis.forceNames) labelText += v.name;
          if (vis.forceValues) {
            const mag = magnitude({ x: v.x, y: v.y });
            labelText += (labelText ? ': ' : '') + mag.toFixed(2);
          }
          labelManager.addLabel(labelText, arrow, sceneManager.camera, sceneManager.renderer);
        }
        if (vis.components) {
          const xArrow = createArrow({ x: v.originX, y: v.originY }, { x: v.x, y: 0 }, 0xff4444, 'Vx');
          if (xArrow) sceneManager.objects.add(xArrow);
          const yArrow = createArrow({ x: v.originX, y: v.originY }, { x: 0, y: v.y }, 0x44ff44, 'Vy');
          if (yArrow) sceneManager.objects.add(yArrow);
        }
        if (vis.angles) {
          const arc = createAngleArc({ x: v.originX, y: v.originY }, { x: 1, y: 0 }, { x: v.x, y: v.y }, 0xffff00);
          if (arc) sceneManager.objects.add(arc);
        }
      }
    });

    if (activeTool === 'sum' && vectors.length >= 2) {
      const sum = addVectors(...vectors.map(v => ({ x: v.x, y: v.y })));
      const resArrow = createResultantArrow({ x: 0, y: 0 }, sum);
      if (resArrow) {
        sceneManager.objects.add(resArrow);
        if (vis.forceNames || vis.forceValues) {
          let label = 'R';
          if (vis.forceValues) label += ` (${magnitude(sum).toFixed(2)})`;
          labelManager.addLabel(label, resArrow, sceneManager.camera, sceneManager.renderer);
        }
      }
    }

    if (activeTool === 'difference' && vectors.length >= 2) {
      const diff = subtractVectors({ x: vectors[0].x, y: vectors[0].y }, { x: vectors[1].x, y: vectors[1].y });
      const diffArrow = createResultantArrow({ x: 0, y: 0 }, diff);
      if (diffArrow) {
        sceneManager.objects.add(diffArrow);
        if (vis.forceNames || vis.forceValues) {
          let label = 'A - B';
          if (vis.forceValues) label += ` (${magnitude(diff).toFixed(2)})`;
          labelManager.addLabel(label, diffArrow, sceneManager.camera, sceneManager.renderer);
        }
      }
    }

    if (activeTool === 'scalar' && selectedIndex >= 0 && selectedIndex < vectors.length) {
      const v = vectors[selectedIndex];
      const scaled = scalarMultiply({ x: v.x, y: v.y }, scalarValue);
      const scaledArrow = createResultantArrow({ x: v.originX, y: v.originY }, scaled);
      if (scaledArrow) {
        sceneManager.objects.add(scaledArrow);
        if (vis.forceNames || vis.forceValues) {
          let label = `${scalarValue} \u00b7 ${v.name}`;
          if (vis.forceValues) label += ` (${magnitude(scaled).toFixed(2)})`;
          labelManager.addLabel(label, scaledArrow, sceneManager.camera, sceneManager.renderer);
        }
      }
    }

    if (activeTool === 'decompose' && selectedIndex >= 0 && selectedIndex < vectors.length) {
      const v = vectors[selectedIndex];
      if (!getState().visibility.components) {
        const xArrow = createArrow({ x: v.originX, y: v.originY }, { x: v.x, y: 0 }, 0xff4444, 'Vx');
        if (xArrow) {
          sceneManager.objects.add(xArrow);
          labelManager.addLabel(`Vx = ${v.x.toFixed(2)}`, xArrow, sceneManager.camera, sceneManager.renderer);
        }
        const yArrow = createArrow({ x: v.originX, y: v.originY }, { x: 0, y: v.y }, 0x44ff44, 'Vy');
        if (yArrow) {
          sceneManager.objects.add(yArrow);
          labelManager.addLabel(`Vy = ${v.y.toFixed(2)}`, yArrow, sceneManager.camera, sceneManager.renderer);
        }
      }
    }
  }

  let _panelWireEvents = null;

  function updatePanel() {
    const sections = [];

    // Dynamic vector properties for selected vector
    if (selectedIndex >= 0 && selectedIndex < vectors.length) {
      const solver = solvers[selectedIndex];
      // Sync solver with current vector values
      const v = vectors[selectedIndex];
      const inputIds = solver.getInputIds();
      if (inputIds.includes('vx')) solver.setValue('vx', v.x);
      if (inputIds.includes('vy')) solver.setValue('vy', v.y);
      solver.solve();

      const panel = renderDynamicPanel(solver, () => {
        // Read back computed values into the vector
        const vals = solver.getValues();
        vectors[selectedIndex].x = parseFloat(vals.vx.toFixed(4));
        vectors[selectedIndex].y = parseFloat(vals.vy.toFixed(4));
        updateScene();
        updatePanel();
      });
      sections.push({ title: `Vettore ${v.name}`, content: panel.html });
      _panelWireEvents = panel.wireEvents;
    } else {
      sections.push({
        title: 'Proprietà',
        content: '<p style="color:var(--text-secondary);font-size:13px;">Clicca sul canvas per creare un vettore, poi selezionalo dalla lista.</p>',
      });
      _panelWireEvents = null;
    }

    // Tool-specific results
    if (activeTool === 'sum' && vectors.length >= 2) {
      const sum = addVectors(...vectors.map(v => ({ x: v.x, y: v.y })));
      sections.push({
        title: 'Risultante (Somma)',
        content:
          createPropertyRow('Rx', sum.x.toFixed(2)) +
          createPropertyRow('Ry', sum.y.toFixed(2)) +
          createPropertyRow('|R|', magnitude(sum).toFixed(2)) +
          createPropertyRow('\u03b8', direction(sum).toFixed(1) + '\u00b0'),
      });
    }

    if (activeTool === 'difference' && vectors.length >= 2) {
      const diff = subtractVectors({ x: vectors[0].x, y: vectors[0].y }, { x: vectors[1].x, y: vectors[1].y });
      sections.push({
        title: 'Differenza (A - B)',
        content:
          createPropertyRow('Dx', diff.x.toFixed(2)) +
          createPropertyRow('Dy', diff.y.toFixed(2)) +
          createPropertyRow('|D|', magnitude(diff).toFixed(2)) +
          createPropertyRow('\u03b8', direction(diff).toFixed(1) + '\u00b0'),
      });
    }

    if (activeTool === 'scalar') {
      let content = createInputRow('Scalare k', 'scalar-k', scalarValue, '', 'step="0.5"');
      if (selectedIndex >= 0 && selectedIndex < vectors.length) {
        const v = vectors[selectedIndex];
        const scaled = scalarMultiply({ x: v.x, y: v.y }, scalarValue);
        content +=
          createPropertyRow('Risultato X', scaled.x.toFixed(2)) +
          createPropertyRow('Risultato Y', scaled.y.toFixed(2)) +
          createPropertyRow('|k\u00b7V|', magnitude(scaled).toFixed(2));
      }
      sections.push({ title: 'Moltiplicazione Scalare', content });
    }

    if (activeTool === 'decompose' && selectedIndex >= 0 && selectedIndex < vectors.length) {
      const v = vectors[selectedIndex];
      sections.push({
        title: `Scomposizione ${v.name}`,
        content:
          createPropertyRow(v.name + 'x', v.x.toFixed(2)) +
          createPropertyRow(v.name + 'y', v.y.toFixed(2)) +
          createPropertyRow('|' + v.name + '|', magnitude({ x: v.x, y: v.y }).toFixed(2)) +
          createPropertyRow('\u03b8', direction({ x: v.x, y: v.y }).toFixed(1) + '\u00b0'),
      });
    }

    // Vector list
    if (vectors.length > 0) {
      let listContent = '';
      vectors.forEach((v, i) => {
        const isSelected = i === selectedIndex;
        const colorHex = vectorColors[i] ? '#' + vectorColors[i].toString(16).padStart(6, '0') : '#4fc3f7';
        listContent += `<div class="panel-row" style="cursor:pointer;${isSelected ? 'background:var(--bg-tertiary);border-radius:4px;padding:4px 6px;' : 'padding:4px 6px;'}" data-vec-index="${i}">
          <span style="color:${colorHex};font-weight:600;">${v.name}</span>
          <span class="panel-row-value">(${v.x.toFixed(1)}, ${v.y.toFixed(1)})</span>
        </div>`;
      });
      listContent += `<button id="btn-clear-vectors" style="margin-top:8px;width:100%;padding:6px;background:var(--danger);color:white;border-radius:var(--radius-sm);font-size:12px;">Cancella tutti</button>`;
      sections.push({ title: 'Vettori', content: listContent });
    }

    // Theory tip
    let tipTopicId = 'vector-basics';
    if (activeTool === 'sum') tipTopicId = 'vector-sum';
    else if (activeTool === 'difference') tipTopicId = 'vector-sum';
    else if (activeTool === 'scalar') tipTopicId = 'vector-multiply';
    else if (activeTool === 'decompose') tipTopicId = 'vector-decompose';
    sections.push({ title: 'Teoria', content: renderContextualTip(tipTopicId) });

    renderPropertiesPanel(rightPanel, sections);
    renderVisibilityMenu(rightPanel);

    // Wire dynamic panel events
    if (_panelWireEvents) {
      _panelWireEvents(rightPanel);
      _panelWireEvents = null;
    }

    // Wire other events
    const scalarInput = rightPanel.querySelector('#scalar-k');
    if (scalarInput) {
      scalarInput.addEventListener('change', (e) => {
        scalarValue = parseFloat(e.target.value) || 1;
        updateScene();
        updatePanel();
      });
    }

    rightPanel.querySelectorAll('[data-vec-index]').forEach((row) => {
      row.addEventListener('click', () => {
        selectedIndex = parseInt(row.dataset.vecIndex, 10);
        updateScene();
        updatePanel();
      });
    });

    const clearBtn = rightPanel.querySelector('#btn-clear-vectors');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        vectors = [];
        solvers = [];
        selectedIndex = -1;
        updateScene();
        updatePanel();
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
