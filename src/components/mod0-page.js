import '../styles/theory.css';

export function renderMod0Page(container) {
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'theory-page';

  page.innerHTML = `
    <h1>Modulo 0 — Grandezze Fisiche</h1>
    <p style="color:var(--text-secondary);margin-bottom:24px;">Settembre - Ottobre</p>

    <div class="theory-category">
      <div class="theory-category-title">Il Sistema Internazionale (S.I.)</div>
      <div class="theory-card expanded">
        <div class="theory-card-title">Le grandezze fondamentali</div>
        <div class="theory-card-content" style="display:block">
          <p>Il <strong>Sistema Internazionale</strong> (S.I.) definisce 7 grandezze fondamentali:</p>
          <div class="data-table data-table-3col">
            <div class="data-row data-header">
              <div>Grandezza</div><div>Unità</div><div>Simbolo</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Lunghezza</div>
              <div data-label="Unità">metro</div>
              <div data-label="Simbolo">m</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Massa</div>
              <div data-label="Unità">kilogrammo</div>
              <div data-label="Simbolo">kg</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Tempo</div>
              <div data-label="Unità">secondo</div>
              <div data-label="Simbolo">s</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Corrente elettrica</div>
              <div data-label="Unità">ampere</div>
              <div data-label="Simbolo">A</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Temperatura</div>
              <div data-label="Unità">kelvin</div>
              <div data-label="Simbolo">K</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Quantità di sostanza</div>
              <div data-label="Unità">mole</div>
              <div data-label="Simbolo">mol</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Intensità luminosa</div>
              <div data-label="Unità">candela</div>
              <div data-label="Simbolo">cd</div>
            </div>
          </div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Grandezze derivate</div>
        <div class="theory-card-content" style="display:block">
          <p>Le <strong>grandezze derivate</strong> si ottengono combinando le grandezze fondamentali:</p>
          <div class="data-table data-table-3col">
            <div class="data-row data-header">
              <div>Grandezza</div><div>Formula</div><div>Unità S.I.</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Velocità</div>
              <div data-label="Formula">v = s/t</div>
              <div data-label="Unità S.I.">m/s</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Accelerazione</div>
              <div data-label="Formula">a = v/t</div>
              <div data-label="Unità S.I.">m/s²</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Forza</div>
              <div data-label="Formula"><span class="vec-arrow">F</span> = m·<span class="vec-arrow">a</span></div>
              <div data-label="Unità S.I.">N (Newton)</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Pressione</div>
              <div data-label="Formula">p = F/A</div>
              <div data-label="Unità S.I.">Pa (Pascal)</div>
            </div>
            <div class="data-row">
              <div data-label="Grandezza">Energia/Lavoro</div>
              <div data-label="Formula">L = F·s</div>
              <div data-label="Unità S.I.">J (Joule)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="theory-category">
      <div class="theory-category-title">Misure e Errori</div>
      <div class="theory-card expanded">
        <div class="theory-card-title">La misura delle grandezze</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Misurare</strong> significa confrontare una grandezza con un'altra grandezza omogenea scelta come unità di misura.</p>
          <p>Ogni strumento di misura ha:</p>
          <ul style="margin:8px 0 8px 20px;">
            <li><strong>Portata</strong>: il valore massimo che può misurare</li>
            <li><strong>Sensibilità</strong>: la più piccola variazione che può rilevare</li>
            <li><strong>Prontezza</strong>: la velocità di risposta</li>
          </ul>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Teoria degli errori</div>
        <div class="theory-card-content" style="display:block">
          <p>Ogni misura è affetta da <strong>errori</strong>:</p>
          <ul style="margin:8px 0 8px 20px;">
            <li><strong>Errori sistematici</strong>: dovuti allo strumento o al metodo di misura, si ripetono sempre uguali</li>
            <li><strong>Errori casuali</strong>: dovuti a cause imprevedibili, variano ad ogni misura</li>
          </ul>
          <div class="theory-formula-block">Errore assoluto: Ea = (x_max - x_min) / 2
Errore relativo: Er = Ea / x_medio
Errore percentuale: E% = Er · 100</div>
          <div class="theory-example-block">Misure: 10.2, 10.4, 10.1, 10.3, 10.5 cm
x_medio = 10.3 cm
Ea = (10.5 - 10.1) / 2 = 0.2 cm
Er = 0.2 / 10.3 = 0.019
E% = 1.9%
Risultato: (10.3 ± 0.2) cm</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Proporzionalità diretta e inversa</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Proporzionalità diretta</strong>: quando una grandezza aumenta, l'altra aumenta in modo proporzionale.</p>
          <div class="theory-formula-block">y = k · x    (k = costante)</div>
          <p>Il grafico è una retta passante per l'origine.</p>
          <p><strong>Proporzionalità inversa</strong>: quando una grandezza aumenta, l'altra diminuisce in modo proporzionale.</p>
          <div class="theory-formula-block">y = k / x    (k = costante)</div>
          <p>Il grafico è un'iperbole.</p>
        </div>
      </div>
    </div>
  `;

  container.appendChild(page);
}
