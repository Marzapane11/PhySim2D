// Tutorial dinamico per ogni scenario.
// Un tasto posto in cima al pannello apre un overlay centrato e leggibile
// con: (1) descrizione di cosa si simula, (2) spiegazione di come si usa la barra.

const TUTORIAL_CONTENT = {
  'inclined-plane': {
    title: 'Piano inclinato',
    what: `
      <p>Si simula un <strong>corpo su un piano inclinato</strong> di angolo α. La forza peso <span class="vec-arrow">P</span> si scompone in:</p>
      <ul>
        <li><strong>Px</strong> (parallela al piano) — tende a far scivolare il corpo;</li>
        <li><strong>Py</strong> (perpendicolare al piano) — bilanciata dalla forza normale <span class="vec-arrow">N</span>.</li>
      </ul>
      <p>L'<strong>attrito Fa</strong> = μ·N può trattenerlo o no a seconda del coefficiente μ e dell'inclinazione.</p>
      <p>La <strong>Fris</strong> (risultante lungo il piano) dice se il corpo è in equilibrio (=0), scivola giù o sale.</p>
    `,
    how: `
      <p>Nel pannello a destra trovi tutte le variabili. Per ogni variabile:</p>
      <ul>
        <li>Pallino <strong>●</strong> = input (lo scrivi tu); pallino <strong>○</strong> = output (lo calcola il simulatore).</li>
      </ul>
      <p><strong>Come cambiare input/output:</strong> clicca il pallino accanto al nome della variabile — se era ● diventa ○ (e viceversa). Inserisci il valore nell'input e gli output si aggiornano in tempo reale usando formule dirette e inverse.</p>
      <p><strong>Esempio:</strong> di default m è input (●) e P è output (○), quindi scrivi la massa e il simulatore calcola il peso. Se invece vuoi partire dal peso: clicca ● di m (diventa ○) e clicca ○ di P (diventa ●). Ora scrivi P = 98 N e il simulatore ti dice m ≈ 10 kg.</p>
      <p>Nella sezione <strong>Forze personalizzate</strong> puoi aggiungere altre forze (F1, F2…) con modulo e angolo rispetto a Px: 0° giù per il piano, 90° perpendicolare, 180° su per il piano.</p>
      <p>Sotto c'è lo <strong>Stato</strong> (Equilibrio / Scivola giù / Sale). Il menu <strong>Visibilità</strong> permette di nascondere corpo, frecce, componenti Px/Py o griglia.</p>
    `,
  },

  'spring': {
    title: 'Molla (Legge di Hooke)',
    what: `
      <p>Un corpo appoggiato su un piano inclinato è collegato tramite una <strong>molla</strong> di costante elastica k a un muro posto in cima al piano.</p>
      <p>La forza elastica vale <span class="vec-arrow">F</span>e = k·Δx: se la molla è stirata (Δx &gt; 0) tira il corpo verso l'alto; se è compressa lo spinge verso il basso.</p>
      <p>Per trovare la <strong>posizione di equilibrio</strong>, Δx può essere messa in output: il simulatore calcola automaticamente il valore di deformazione che bilancia le altre forze.</p>
    `,
    how: `
      <p>Funziona come nel Piano inclinato. In più hai:</p>
      <ul>
        <li><strong>k</strong>: costante elastica della molla (N/m);</li>
        <li><strong>Δx</strong>: deformazione della molla;</li>
        <li><strong>Fe</strong>: forza elastica (= k·Δx).</li>
      </ul>
      <p><strong>Come cambiare input/output:</strong> clicca sul pallino <strong>●</strong> (input) o <strong>○</strong> (output) accanto a ciascuna variabile per scambiarne la modalità. Scrivi il valore negli input, il simulatore fa il resto.</p>
      <p><strong>Esempio (posizione di equilibrio):</strong> con Δx in output (<strong>○</strong>), il simulatore trova da solo la deformazione che equilibra il corpo sulla molla. Se invece metti Δx in input (<strong>●</strong>) e scrivi 0.1 m, vedrai Fe = k·0.1 e lo stato (sale, scende, equilibrio).</p>
      <p>Anche qui puoi aggiungere <strong>Forze personalizzate</strong> (stessa convenzione di angolo del piano inclinato).</p>
    `,
  },

  'pulley': {
    title: 'Carrucola con piano inclinato',
    what: `
      <p>Due masse collegate da una fune che passa su una carrucola in cima al piano:</p>
      <ul>
        <li><strong>m₁</strong> è appoggiata sul piano inclinato (con attrito μ e angolo θ);</li>
        <li><strong>m₂</strong> è sospesa in verticale;</li>
      </ul>
      <p>Il sistema si muove o sta fermo a seconda del confronto tra la forza motrice (P₂ − P₁x) e l'attrito massimo μ·N.</p>
      <p>Possibili stati: <em>Equilibrio</em>, <em>m₁ sale</em> (m₂ scende), <em>m₁ scende</em> (m₂ sale).</p>
    `,
    how: `
      <p>Nella barra a destra imposta massa delle due masse (m₁, m₂), angolo θ, coefficiente di attrito μ.</p>
      <p>Il simulatore calcola peso P₁ e P₂, componente lungo piano P₁x, normale N, attrito Fa, tensione T, accelerazione a e mostra lo <strong>Stato</strong>.</p>
      <p><strong>Come cambiare input/output:</strong> clicca il pallino <strong>●</strong>/<strong>○</strong> accanto al nome della variabile per scambiarla tra input e output.</p>
      <p><strong>Esempio:</strong> di default m₁ e m₂ sono input e T (tensione) è output, quindi scrivi le masse e ottieni T. Se invece ti interessa trovare quale m₂ serve per avere una certa T: clicca ● di m₂ (→ ○) e ○ di T (→ ●), scrivi T = 30 N e il simulatore ti dice m₂.</p>
    `,
  },

  // Pagine Vettori (Mod 1 - Vettori)
  'vectors': {
    title: 'Vettori',
    what: `
      <p>Si lavora con <strong>vettori 2D</strong>: puoi creare un vettore, fare la somma o la differenza di due vettori, moltiplicare per uno scalare, oppure scomporre un vettore nelle sue componenti.</p>
      <p>Ogni vettore ha 4 parametri collegati: componenti x e y, modulo |<span class="vec-arrow">V</span>| e angolo θ.</p>
    `,
    how: `
      <p>Scegli lo strumento dalla barra in basso (Crea / Somma / Differenza / Scomponi).</p>
      <p>Nel pannello a destra, ogni vettore ha 4 parametri collegati: <strong>x</strong>, <strong>y</strong>, <strong>|V|</strong>, <strong>θ</strong>. Puoi sceglierne 2 come input (pallino <strong>●</strong>) e gli altri 2 diventano output (<strong>○</strong>) calcolati automaticamente.</p>
      <p><strong>Come cambiare input/output:</strong> clicca il pallino accanto a ciascun parametro. Se era ● (input) diventa ○ (output) e viceversa.</p>
      <p><strong>Esempio:</strong> di default x e y sono input (●), |V| e θ sono output (○). Scrivi x=3, y=4: ottieni |V|=5 e θ≈53°. Se invece vuoi partire da modulo e angolo: clicca ● di x e y (→ ○) e ○ di |V| e θ (→ ●), scrivi |V|=10 e θ=30°, vedrai x=8.66 e y=5.</p>
      <p>La <strong>Risultante</strong> (in Somma/Differenza) o il vettore scomposto vengono aggiornati automaticamente.</p>
    `,
  },
};

function createTutorialOverlay(entry) {
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.style.cssText = [
    'position:fixed', 'inset:0',
    'background:rgba(0,0,0,0.65)',
    'z-index:20000',
    'display:flex', 'align-items:center', 'justify-content:center',
    'padding:20px',
    'backdrop-filter:blur(3px)',
  ].join(';');

  overlay.innerHTML = `
    <div style="
      background:var(--bg-surface);
      color:var(--text-primary);
      max-width:640px;
      width:100%;
      max-height:85vh;
      overflow-y:auto;
      border-radius:12px;
      padding:28px 28px 24px;
      position:relative;
      box-shadow:0 10px 40px rgba(0,0,0,0.5);
      border:1px solid var(--border-color);
    ">
      <button class="tutorial-close" style="
        position:absolute;top:10px;right:14px;
        background:none;border:none;font-size:28px;line-height:1;
        cursor:pointer;color:var(--text-secondary);
      " aria-label="Chiudi">&times;</button>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
        <div style="font-size:28px;">\u{1F4D6}</div>
        <h2 style="color:var(--text-accent);font-size:22px;margin:0;">Tutorial — ${entry.title}</h2>
      </div>
      <h3 style="color:var(--text-accent);font-size:15px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Cosa si simula</h3>
      <div style="font-size:14px;line-height:1.65;margin-bottom:18px;">${entry.what}</div>
      <h3 style="color:var(--text-accent);font-size:15px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Come si usa la barra</h3>
      <div style="font-size:14px;line-height:1.65;">${entry.how}</div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.querySelector('.tutorial-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  // ESC to close
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}

/**
 * Inserisce (o aggiorna) il tasto Tutorial in cima al pannello destro.
 * @param {HTMLElement} container  Il pannello destro (right-panel).
 * @param {string} scenarioId      ID dello scenario attivo.
 */
export function renderTutorialButton(container, scenarioId) {
  // Rimuovi sezione esistente
  const existing = container.querySelector('.tutorial-button-section');
  if (existing) existing.remove();

  const entry = TUTORIAL_CONTENT[scenarioId];
  if (!entry) return;

  const section = document.createElement('div');
  section.className = 'panel-section tutorial-button-section';
  section.style.cssText = 'padding:10px 14px;';
  section.innerHTML = `
    <button class="tutorial-btn" style="
      width:100%;padding:10px 12px;
      background:linear-gradient(135deg, #4fc3f7, #2196f3);
      color:white;border:none;border-radius:var(--radius-sm);
      font-size:13px;font-weight:600;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:8px;
      letter-spacing:0.3px;
    ">
      <span style="font-size:16px;">\u{1F4D6}</span>
      <span>Tutorial</span>
    </button>
  `;

  section.querySelector('.tutorial-btn').addEventListener('click', () => createTutorialOverlay(entry));

  container.insertBefore(section, container.firstChild);
}
