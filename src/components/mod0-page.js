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
          <div class="table-scroll"><table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;min-width:360px;">
            <tr style="border-bottom:1px solid var(--border-color);">
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Grandezza</th>
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Unità</th>
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Simbolo</th>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Lunghezza</td><td style="padding:6px;">metro</td><td style="padding:6px;">m</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Massa</td><td style="padding:6px;">kilogrammo</td><td style="padding:6px;">kg</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Tempo</td><td style="padding:6px;">secondo</td><td style="padding:6px;">s</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Corrente elettrica</td><td style="padding:6px;">ampere</td><td style="padding:6px;">A</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Temperatura</td><td style="padding:6px;">kelvin</td><td style="padding:6px;">K</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Quantità di sostanza</td><td style="padding:6px;">mole</td><td style="padding:6px;">mol</td>
            </tr>
            <tr>
              <td style="padding:6px;">Intensità luminosa</td><td style="padding:6px;">candela</td><td style="padding:6px;">cd</td>
            </tr>
          </table></div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Grandezze derivate</div>
        <div class="theory-card-content" style="display:block">
          <p>Le <strong>grandezze derivate</strong> si ottengono combinando le grandezze fondamentali:</p>
          <div class="table-scroll"><table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;min-width:360px;">
            <tr style="border-bottom:1px solid var(--border-color);">
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Grandezza</th>
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Formula</th>
              <th style="text-align:left;padding:6px;color:var(--text-accent);">Unità S.I.</th>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Velocità</td><td style="padding:6px;">v = s/t</td><td style="padding:6px;">m/s</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Accelerazione</td><td style="padding:6px;">a = v/t</td><td style="padding:6px;">m/s²</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Forza</td><td style="padding:6px;"><span class="vec-arrow">F</span> = m·<span class="vec-arrow">a</span></td><td style="padding:6px;">N (Newton)</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:6px;">Pressione</td><td style="padding:6px;">p = F/A</td><td style="padding:6px;">Pa (Pascal)</td>
            </tr>
            <tr>
              <td style="padding:6px;">Energia/Lavoro</td><td style="padding:6px;">L = F·s</td><td style="padding:6px;">J (Joule)</td>
            </tr>
          </table></div>
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
