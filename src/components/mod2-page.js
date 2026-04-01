import '../styles/theory.css';

export function renderMod2Page(container) {
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'theory-page';

  page.innerHTML = `
    <h1>Modulo 2 — Equilibrio</h1>
    <p style="color:var(--text-secondary);margin-bottom:24px;">Gennaio - Maggio</p>

    <div class="theory-category">
      <div class="theory-category-title">Equilibrio dei corpi</div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Equilibrio del punto materiale</div>
        <div class="theory-card-content" style="display:block">
          <p>Un punto materiale è in <strong>equilibrio</strong> quando la somma vettoriale di tutte le forze applicate è nulla.</p>
          <div class="theory-formula-block">\u03a3F = 0
\u03a3Fx = 0   e   \u03a3Fy = 0</div>
          <p>In pratica, si scompongono tutte le forze lungo due assi perpendicolari e si impone che la somma delle componenti su ciascun asse sia zero.</p>
          <div class="theory-example-block">Un lampadario di 8 kg appeso al soffitto:
P = m \u00b7 g = 8 \u00b7 9.81 = 78.5 N (verso il basso)
T = 78.5 N (verso l'alto, tensione del filo)
\u03a3F = T - P = 78.5 - 78.5 = 0 N \u2192 equilibrio</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Equilibrio su piano orizzontale e inclinato</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Piano orizzontale</strong>: un corpo è in equilibrio quando la forza normale N equilibra il peso P.</p>
          <div class="theory-formula-block">N = P = m \u00b7 g</div>
          <p><strong>Piano inclinato</strong> (angolo \u03b1): il peso si scompone in componente parallela Px e perpendicolare Py al piano.</p>
          <div class="theory-formula-block">Px = P \u00b7 sin(\u03b1) = m \u00b7 g \u00b7 sin(\u03b1)
Py = P \u00b7 cos(\u03b1) = m \u00b7 g \u00b7 cos(\u03b1)
N = Py</div>
          <p>Per l'equilibrio sul piano inclinato con attrito:</p>
          <div class="theory-formula-block">Px = Fa   \u2192   m \u00b7 g \u00b7 sin(\u03b1) = \u03bcs \u00b7 m \u00b7 g \u00b7 cos(\u03b1)
tan(\u03b1) = \u03bcs</div>
          <div class="theory-example-block">m = 5 kg, \u03b1 = 20\u00b0, \u03bcs = 0.4
Px = 5 \u00b7 9.81 \u00b7 sin(20\u00b0) = 16.8 N
Fa max = 0.4 \u00b7 5 \u00b7 9.81 \u00b7 cos(20\u00b0) = 18.4 N
Fa max > Px \u2192 il corpo resta in equilibrio</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Momento di una forza</div>
        <div class="theory-card-content" style="display:block">
          <p>Il <strong>momento</strong> di una forza rispetto a un punto (polo) misura la tendenza della forza a far ruotare il corpo attorno a quel punto.</p>
          <div class="theory-formula-block">M = F \u00b7 d</div>
          <p>dove <strong>d</strong> è il braccio della forza, cioè la distanza tra la retta d'azione della forza e il polo.</p>
          <p>L'unità di misura è il Newton-metro (N\u00b7m).</p>
          <p>Il momento è positivo se la rotazione è antioraria, negativo se oraria.</p>
          <div class="theory-example-block">Una forza F = 20 N applicata a una distanza d = 0.5 m dal fulcro:
M = 20 \u00b7 0.5 = 10 N\u00b7m</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Coppia di forze</div>
        <div class="theory-card-content" style="display:block">
          <p>Una <strong>coppia di forze</strong> è formata da due forze uguali e contrarie, applicate in punti diversi.</p>
          <p>La coppia produce solo rotazione (nessuna traslazione), e il suo momento è:</p>
          <div class="theory-formula-block">M = F \u00b7 d</div>
          <p>dove d è la distanza tra le rette d'azione delle due forze.</p>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Equilibrio del corpo rigido</div>
        <div class="theory-card-content" style="display:block">
          <p>Un <strong>corpo rigido</strong> è in equilibrio quando sono soddisfatte due condizioni:</p>
          <ol style="margin:8px 0 8px 20px;">
            <li>La risultante di tutte le forze è nulla: <strong>\u03a3F = 0</strong> (equilibrio alla traslazione)</li>
            <li>La somma di tutti i momenti rispetto a qualsiasi polo è nulla: <strong>\u03a3M = 0</strong> (equilibrio alla rotazione)</li>
          </ol>
          <div class="theory-formula-block">\u03a3F = 0   e   \u03a3M = 0</div>
          <div class="theory-example-block">Un'asta lunga 2 m con fulcro al centro:
F1 = 30 N a sinistra (distanza 1 m dal fulcro)
F2 = ? a destra (distanza 1 m dal fulcro)
\u03a3M = 0 \u2192 F1 \u00b7 1 = F2 \u00b7 1 \u2192 F2 = 30 N</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Il baricentro</div>
        <div class="theory-card-content" style="display:block">
          <p>Il <strong>baricentro</strong> (o centro di gravità) è il punto in cui si può considerare applicata tutta la forza peso del corpo.</p>
          <p>Per un corpo omogeneo, il baricentro coincide con il centro geometrico.</p>
          <p>Un corpo appoggiato è in equilibrio stabile se la verticale passante per il baricentro cade all'interno della base di appoggio.</p>
          <p>Tipi di equilibrio:</p>
          <ul style="margin:8px 0 8px 20px;">
            <li><strong>Stabile</strong>: il corpo torna alla posizione iniziale dopo una piccola perturbazione</li>
            <li><strong>Instabile</strong>: il corpo si allontana dalla posizione iniziale</li>
            <li><strong>Indifferente</strong>: il corpo resta in equilibrio nella nuova posizione</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="theory-category">
      <div class="theory-category-title">Equilibrio dei fluidi</div>

      <div class="theory-card expanded">
        <div class="theory-card-title">La pressione</div>
        <div class="theory-card-content" style="display:block">
          <p>La <strong>pressione</strong> è il rapporto tra la forza applicata perpendicolarmente a una superficie e l'area della superficie stessa.</p>
          <div class="theory-formula-block">p = F / A</div>
          <p>L'unità di misura nel S.I. è il <strong>Pascal</strong> (Pa): 1 Pa = 1 N/m\u00b2</p>
          <div class="theory-example-block">F = 500 N, A = 0.25 m\u00b2
p = 500 / 0.25 = 2000 Pa</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Legge di Pascal</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Legge di Pascal</strong>: la pressione esercitata su un fluido in equilibrio in un recipiente chiuso si trasmette con uguale intensità in tutte le direzioni e su tutte le pareti del recipiente.</p>
          <p>Applicazione: il <strong>torchio idraulico</strong>.</p>
          <div class="theory-formula-block">F1 / A1 = F2 / A2</div>
          <div class="theory-example-block">Torchio idraulico:
A1 = 0.01 m\u00b2, A2 = 0.5 m\u00b2, F1 = 100 N
F2 = F1 \u00b7 A2 / A1 = 100 \u00b7 0.5 / 0.01 = 5000 N</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Legge di Stevino</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Legge di Stevino</strong>: la pressione in un fluido aumenta con la profondità.</p>
          <div class="theory-formula-block">p = p0 + \u03c1 \u00b7 g \u00b7 h</div>
          <p>dove p0 è la pressione sulla superficie, \u03c1 è la densità del fluido, g l'accelerazione di gravità e h la profondità.</p>
          <div class="theory-example-block">Acqua (\u03c1 = 1000 kg/m\u00b3), h = 10 m
p = 101325 + 1000 \u00b7 9.81 \u00b7 10
p = 101325 + 98100 = 199425 Pa \u2248 2 atm</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Vasi comunicanti</div>
        <div class="theory-card-content" style="display:block">
          <p>In un sistema di <strong>vasi comunicanti</strong> contenenti lo stesso liquido in equilibrio, il livello del liquido è lo stesso in tutti i rami, indipendentemente dalla forma dei vasi.</p>
          <p>Se i vasi contengono liquidi diversi (non miscibili), le altezze sono inversamente proporzionali alle densità:</p>
          <div class="theory-formula-block">\u03c11 \u00b7 h1 = \u03c12 \u00b7 h2</div>
          <div class="theory-example-block">Acqua (\u03c11 = 1000 kg/m\u00b3) e olio (\u03c12 = 800 kg/m\u00b3)
Se h1 = 20 cm (acqua):
h2 = \u03c11 \u00b7 h1 / \u03c12 = 1000 \u00b7 20 / 800 = 25 cm (olio)</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">Legge di Archimede</div>
        <div class="theory-card-content" style="display:block">
          <p><strong>Legge di Archimede</strong>: un corpo immerso in un fluido riceve una spinta verso l'alto (spinta di Archimede) uguale al peso del fluido spostato.</p>
          <div class="theory-formula-block">Fa = \u03c1f \u00b7 g \u00b7 V</div>
          <p>dove \u03c1f è la densità del fluido e V è il volume della parte immersa del corpo.</p>
          <ul style="margin:8px 0 8px 20px;">
            <li>Se Fa > P: il corpo <strong>galleggia</strong> (sale)</li>
            <li>Se Fa = P: il corpo <strong>resta sospeso</strong></li>
            <li>Se Fa < P: il corpo <strong>affonda</strong></li>
          </ul>
          <div class="theory-example-block">Cubo di legno (lato 10 cm), massa 0.6 kg, immerso in acqua:
V = 0.001 m\u00b3
P = 0.6 \u00b7 9.81 = 5.89 N
Fa = 1000 \u00b7 9.81 \u00b7 0.001 = 9.81 N
Fa > P \u2192 il cubo galleggia</div>
        </div>
      </div>

      <div class="theory-card expanded">
        <div class="theory-card-title">La pressione atmosferica</div>
        <div class="theory-card-content" style="display:block">
          <p>La <strong>pressione atmosferica</strong> è la pressione esercitata dall'aria sulla superficie terrestre.</p>
          <p>Fu misurata per la prima volta da <strong>Torricelli</strong> nel 1644 con un tubo di mercurio.</p>
          <div class="theory-formula-block">1 atm = 101325 Pa = 760 mmHg</div>
          <p>La pressione atmosferica diminuisce con l'altitudine, perché lo strato d'aria sovrastante diventa più sottile.</p>
          <div class="theory-example-block">Esperimento di Torricelli:
p_atm = \u03c1_Hg \u00b7 g \u00b7 h
101325 = 13600 \u00b7 9.81 \u00b7 h
h = 101325 / 133416 \u2248 0.76 m = 760 mm</div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(page);
}
