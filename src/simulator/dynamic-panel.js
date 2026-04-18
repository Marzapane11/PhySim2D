/**
 * Renders a dynamic parameter panel where each variable can be toggled
 * between input (editable) and output (read-only calculated).
 */
export function renderDynamicPanel(solver, onChange, options = {}) {
  if (!options.skipSolve) solver.solve();
  if (options.postSolve) options.postSolve();
  const vars = solver.getVariables();

  let html = '';
  vars.forEach(v => {
    const displayValue = v.value != null ? (typeof v.value === 'number' ? v.value.toFixed(2) : v.value) : '\u2014';
    const isInput = v.mode === 'input';

    const icon = isInput ? '\u25CF' : '\u25CB';
    const toggleBtn = `<span class="param-toggle" data-id="${v.id}" title="${isInput ? 'Clicca per calcolare' : 'Clicca per inserire manualmente'}">${icon}</span>`;

    if (isInput) {
      const minAttr = v.min != null ? `min="${v.min}"` : '';
      const maxAttr = v.max != null ? `max="${v.max}"` : '';
      html += `<div class="panel-row" style="align-items:center;">
        ${toggleBtn}
        <span class="panel-row-label" style="flex:1;">${v.label}</span>
        <span>
          <input class="panel-input" type="number" id="dp-${v.id}" value="${displayValue}" step="any" ${minAttr} ${maxAttr} style="width:70px;text-align:right;" />
          <span class="panel-row-label" style="font-size:11px;margin-left:4px;">${v.unit}</span>
        </span>
      </div>`;
    } else {
      html += `<div class="panel-row" style="align-items:center;opacity:0.85;">
        ${toggleBtn}
        <span class="panel-row-label" style="flex:1;">${v.label}</span>
        <span class="panel-row-value">${displayValue} <span style="font-size:11px;color:var(--text-secondary);">${v.unit}</span></span>
      </div>`;
    }
  });

  return {
    html,
    wireEvents(container) {
      container.querySelectorAll('.param-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          solver.toggleMode(btn.dataset.id);
          solver.solve();
          onChange();
        });
      });
      vars.filter(v => v.mode === 'input').forEach(v => {
        const input = container.querySelector(`#dp-${v.id}`);
        if (input) {
          input.addEventListener('change', (e) => {
            let val = parseFloat(e.target.value) || 0;
            if (v.min != null && val < v.min) val = v.min;
            if (v.max != null && val > v.max) val = v.max;
            e.target.value = val;
            solver.setValue(v.id, val);
            solver.solve();
            onChange();
          });
        }
      });
    }
  };
}
