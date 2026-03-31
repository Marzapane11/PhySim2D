import { getTopic } from './theory-data.js';

export function renderContextualTip(topicId) {
  const topic = getTopic(topicId);
  if (!topic) {
    return '<div class="theory-tip">Seleziona uno strumento per vedere la teoria.</div>';
  }
  let html = '<div class="theory-tip">';
  if (topic.formula) {
    html += `<div class="theory-tip-formula">${topic.formula.replace(/\n/g, '<br>')}</div>`;
  }
  html += `<a class="theory-tip-link" href="#/theory?topic=${topicId}">Approfondisci \u2192</a>`;
  html += '</div>';
  return html;
}
