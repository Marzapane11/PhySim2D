export function renderHomePage(container) {
  container.innerHTML = `
    <div style="padding: 40px; max-width: 700px;">
      <h1 style="font-size: 28px; color: var(--text-accent); margin-bottom: 8px;">
        Simulatore Forze e Vettori
      </h1>
      <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
        Programma di Fisica — Liceo Enrico Medi, Cicciano
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <a href="#/mod0" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Mod. 0 — Grandezze Fisiche
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Sistema Internazionale, grandezze fondamentali e derivate, misure e teoria degli errori.
          </div>
        </a>
        <a href="#/mod1" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Mod. 1 — Vettori e Forze
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Somma, differenza, scomposizione di vettori. Forza peso, elastica, attrito, piano inclinato.
          </div>
        </a>
        <a href="#/mod2" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
        ">
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Mod. 2 — Equilibrio
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
            Equilibrio dei corpi, momento di una forza, pressione, leggi di Pascal, Stevino e Archimede.
          </div>
        </a>
        <a href="#/theory" class="home-card" style="
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius); padding: 24px; text-decoration: none;
          color: inherit; transition: border-color 0.15s;
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
