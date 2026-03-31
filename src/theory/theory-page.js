import '../styles/theory.css';
import { getTopicsByCategory } from './theory-data.js';

export function renderTheoryPage(container) {
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'theory-page';
  page.innerHTML = '<h1>Teoria</h1>';

  const categories = [
    { id: 'vettori', title: 'Vettori e Scalari' },
    { id: 'forze', title: 'Forze' },
  ];

  const hash = window.location.hash;
  const topicParam = hash.includes('?topic=') ? hash.split('?topic=')[1] : null;

  categories.forEach((cat) => {
    const section = document.createElement('div');
    section.className = 'theory-category';
    section.innerHTML = `<div class="theory-category-title">${cat.title}</div>`;

    const topics = getTopicsByCategory(cat.id);
    topics.forEach((topic) => {
      const card = document.createElement('div');
      card.className = `theory-card ${topic.id === topicParam ? 'expanded' : ''}`;

      let contentHtml = topic.content;
      if (topic.formula) {
        contentHtml += `<div class="theory-formula-block">${topic.formula}</div>`;
      }
      if (topic.example) {
        contentHtml += `<div class="theory-example-block">${topic.example}</div>`;
      }

      card.innerHTML = `
        <div class="theory-card-title">${topic.title}</div>
        <div class="theory-card-content">${contentHtml}</div>
      `;

      card.addEventListener('click', () => { card.classList.toggle('expanded'); });
      section.appendChild(card);
    });

    page.appendChild(section);
  });

  container.appendChild(page);

  if (topicParam) {
    const expanded = page.querySelector('.theory-card.expanded');
    if (expanded) expanded.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
