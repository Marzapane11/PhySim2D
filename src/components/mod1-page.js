import { renderVectorsPage } from '../simulator/vectors/vectors-page.js';
import { renderForcesPage } from '../simulator/forces/forces-page.js';

export function renderMod1Page(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;flex-direction:column;height:100%;';

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;background:var(--bg-secondary);border-bottom:1px solid var(--border-color);';

  const tabVettori = document.createElement('button');
  tabVettori.textContent = 'Vettori';
  tabVettori.style.cssText = 'flex:1;padding:10px;font-size:14px;font-weight:600;color:var(--text-accent);background:var(--bg-tertiary);border:none;border-bottom:2px solid var(--accent);cursor:pointer;';

  const tabForze = document.createElement('button');
  tabForze.textContent = 'Forze';
  tabForze.style.cssText = 'flex:1;padding:10px;font-size:14px;font-weight:600;color:var(--text-secondary);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;';

  tabBar.appendChild(tabVettori);
  tabBar.appendChild(tabForze);
  wrapper.appendChild(tabBar);

  const content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  wrapper.appendChild(content);
  container.appendChild(wrapper);

  let currentCleanup = null;

  function showVettori() {
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    content.innerHTML = '';
    tabVettori.style.color = 'var(--text-accent)';
    tabVettori.style.background = 'var(--bg-tertiary)';
    tabVettori.style.borderBottom = '2px solid var(--accent)';
    tabForze.style.color = 'var(--text-secondary)';
    tabForze.style.background = 'none';
    tabForze.style.borderBottom = '2px solid transparent';
    currentCleanup = renderVectorsPage(content);
  }

  function showForze() {
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    content.innerHTML = '';
    tabForze.style.color = 'var(--text-accent)';
    tabForze.style.background = 'var(--bg-tertiary)';
    tabForze.style.borderBottom = '2px solid var(--accent)';
    tabVettori.style.color = 'var(--text-secondary)';
    tabVettori.style.background = 'none';
    tabVettori.style.borderBottom = '2px solid transparent';
    currentCleanup = renderForcesPage(content);
  }

  tabVettori.addEventListener('click', showVettori);
  tabForze.addEventListener('click', showForze);

  showVettori();

  return () => {
    if (currentCleanup) currentCleanup();
  };
}
