export function renderHomePage(container) {
  container.innerHTML = `
    <div style="padding: 40px; max-width: 700px;">
      <h1 style="font-size: 28px; color: var(--text-accent); margin-bottom: 8px;">
        Simulatore Forze e Vettori
      </h1>
      <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
        Strumento interattivo per lo studio della fisica — prima superiore
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <a href="#/vectors" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Simulatore Vettori
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Somma, differenza, scomposizione, moltiplicazione scalare e molto altro.
          </div>
        </a>
        <a href="#/forces" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Simulatore Forze
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Piano inclinato, molle, attrito, equilibrio, carrucole e forze su un punto.
          </div>
        </a>
        <a href="#/theory" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; grid-column: 1 / -1; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Teoria
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Consulta le formule, le definizioni e gli esempi per ogni argomento.
          </div>
        </a>
      </div>
    </div>
  `;
  container.querySelectorAll('.home-card').forEach((card) => {
    card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--accent)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--border-color)'; });
  });
}
