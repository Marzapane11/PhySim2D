export function renderToolbar(toolbarEl, tools, onSelect) {
  toolbarEl.innerHTML = '';
  let activeIndex = 0;

  tools.forEach((tool, index) => {
    const btn = document.createElement('button');
    btn.className = `toolbar-btn ${index === 0 ? 'active' : ''}`;
    btn.innerHTML = `${tool.icon}<span>${tool.label}</span>`;
    btn.addEventListener('click', () => {
      toolbarEl.querySelectorAll('.toolbar-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeIndex = index;
      onSelect(tool.id, index);
    });
    toolbarEl.appendChild(btn);
  });

  return {
    getActive: () => tools[activeIndex],
    setActive: (id) => {
      const idx = tools.findIndex((t) => t.id === id);
      if (idx >= 0) toolbarEl.querySelectorAll('.toolbar-btn')[idx].click();
    },
  };
}
