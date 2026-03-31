export function renderPropertiesPanel(panelEl, sections) {
  panelEl.innerHTML = sections
    .map((section) => `
    <div class="panel-section">
      <div class="panel-section-title">${section.title}</div>
      ${section.content}
    </div>
  `).join('');
}

export function createPropertyRow(label, value) {
  return `<div class="panel-row">
    <span class="panel-row-label">${label}</span>
    <span class="panel-row-value">${value}</span>
  </div>`;
}

export function createInputRow(label, id, value, unit, attrs = '') {
  return `<div class="panel-row">
    <span class="panel-row-label">${label}</span>
    <span>
      <input class="panel-input" type="number" id="${id}" value="${value}" ${attrs} />
      <span class="panel-row-label">${unit}</span>
    </span>
  </div>`;
}
