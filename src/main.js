import './styles/global.css';
import './styles/sidebar.css';
import './styles/simulator.css';
import { renderSidebar } from './components/sidebar.js';
import { initRouter, registerRoute } from './router.js';
import { renderHomePage } from './components/home.js';
import { renderSettingsPage } from './components/settings.js';
import { renderVectorsPage } from './simulator/vectors/vectors-page.js';
import { renderForcesPage } from './simulator/forces/forces-page.js';
import { renderTheoryPage } from './theory/theory-page.js';
import './state.js';

const app = document.getElementById('app');

renderSidebar(app);

const main = document.createElement('main');
main.id = 'main-content';
main.style.flex = '1';
main.style.overflow = 'hidden';
main.style.position = 'relative';
app.appendChild(main);

registerRoute('/home', renderHomePage);
registerRoute('/vectors', renderVectorsPage);
registerRoute('/forces', renderForcesPage);
registerRoute('/theory', renderTheoryPage);
registerRoute('/settings', renderSettingsPage);

initRouter(main);
