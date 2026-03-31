import './styles/global.css';
import './styles/sidebar.css';
import { renderSidebar } from './components/sidebar.js';
import { initRouter, registerRoute } from './router.js';
import './state.js';

const app = document.getElementById('app');

renderSidebar(app);

const main = document.createElement('main');
main.id = 'main-content';
main.style.flex = '1';
main.style.overflow = 'hidden';
main.style.position = 'relative';
app.appendChild(main);

registerRoute('/home', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Forze e Vettori</h1><p>Benvenuto!</p></div>';
});

registerRoute('/vectors', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Vettori</h1><p>In costruzione...</p></div>';
});

registerRoute('/forces', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Simulatore Forze</h1><p>In costruzione...</p></div>';
});

registerRoute('/theory', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Teoria</h1><p>In costruzione...</p></div>';
});

registerRoute('/settings', (container) => {
  container.innerHTML = '<div style="padding:40px;"><h1>Impostazioni</h1><p>In costruzione...</p></div>';
});

initRouter(main);
