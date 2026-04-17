export const THEORY_TOPICS = {
  'grandezze-fisiche': {
    title: 'Sistema Internazionale (S.I.)',
    category: 'grandezze',
    content: `<p>Il <strong>Sistema Internazionale</strong> (S.I.) definisce 7 grandezze fondamentali: lunghezza (m), massa (kg), tempo (s), corrente elettrica (A), temperatura (K), quantità di sostanza (mol), intensità luminosa (cd).</p>
<p>Le <strong>grandezze derivate</strong> si ottengono combinando le grandezze fondamentali. Ad esempio: velocità (m/s), accelerazione (m/s\u00b2), forza (N = kg\u00b7m/s\u00b2), pressione (Pa = N/m\u00b2), energia (J = N\u00b7m).</p>`,
    formula: 'v = s/t    [m/s]\na = v/t    [m/s\u00b2]\nF = m\u00b7a    [N]\np = F/A    [Pa]\nL = F\u00b7s    [J]',
    example: 'Forza: m = 5 kg, a = 3 m/s\u00b2 \u2192 F = 15 N\nPressione: F = 100 N, A = 0.5 m\u00b2 \u2192 p = 200 Pa',
  },

  'misure-errori': {
    title: 'Misure e Teoria degli errori',
    category: 'grandezze',
    content: `<p><strong>Misurare</strong> significa confrontare una grandezza con un'unità di misura omogenea.</p>
<p>Ogni strumento ha: <strong>portata</strong> (valore massimo misurabile), <strong>sensibilità</strong> (minima variazione rilevabile), <strong>prontezza</strong> (velocità di risposta).</p>
<p>Gli <strong>errori sistematici</strong> si ripetono sempre uguali; gli <strong>errori casuali</strong> variano ad ogni misura.</p>`,
    formula: 'Errore assoluto: Ea = (x_max - x_min) / 2\nErrore relativo: Er = Ea / x_medio\nErrore percentuale: E% = Er \u00b7 100',
    example: 'Misure: 10.2, 10.4, 10.1, 10.3, 10.5 cm\nx_medio = 10.3 cm\nEa = (10.5 - 10.1) / 2 = 0.2 cm\nEr = 0.2 / 10.3 = 0.019\nE% = 1.9%\nRisultato: (10.3 \u00b1 0.2) cm',
  },

  'proporzionalita': {
    title: 'Proporzionalità diretta e inversa',
    category: 'grandezze',
    content: `<p><strong>Proporzionalità diretta</strong>: quando una grandezza aumenta, l'altra aumenta in modo proporzionale. Il grafico è una retta passante per l'origine.</p>
<p><strong>Proporzionalità inversa</strong>: quando una grandezza aumenta, l'altra diminuisce in modo proporzionale. Il grafico è un'iperbole.</p>`,
    formula: 'Diretta: y = k \u00b7 x    (k = costante)\nInversa: y = k / x    (k = costante)',
    example: 'Diretta: se k = 3 e x = 4 \u2192 y = 12\nInversa: se k = 12 e x = 4 \u2192 y = 3',
  },

  'vector-basics': {
    title: 'Vettori e Scalari',
    category: 'vettori',
    content: `<p>In fisica esistono due tipi di grandezze: <strong>scalari</strong> e <strong>vettoriali</strong>.</p>
<p>Una grandezza <strong>scalare</strong> è completamente descritta da un numero e un'unità di misura (es. massa, temperatura, tempo).</p>
<p>Una grandezza <strong>vettoriale</strong> richiede anche una direzione e un verso per essere descritta completamente (es. forza <span class="vec-arrow">F</span>, velocità <span class="vec-arrow">v</span>, spostamento).</p>
<p>Un vettore si indica con una freccia sopra la lettera (es. <span class="vec-arrow">F</span>, <span class="vec-arrow">v</span>) e si rappresenta graficamente con una freccia: la lunghezza indica il modulo, la retta su cui giace indica la direzione, e la punta indica il verso.</p>`,
    formula: null,
    example: null,
  },

  'vector-module': {
    title: 'Modulo, Direzione, Verso',
    category: 'vettori',
    content: `<p>Ogni vettore è caratterizzato da tre proprietà fondamentali:</p>
<p><strong>Modulo</strong> (o intensità): la lunghezza del vettore, sempre un numero positivo. Si indica con |<span class="vec-arrow">V</span>|.</p>
<p><strong>Direzione</strong>: la retta su cui giace il vettore.</p>
<p><strong>Verso</strong>: indica quale delle due possibili orientazioni lungo la direzione è quella del vettore.</p>
<p>Se conosciamo le componenti cartesiane Vx e Vy, possiamo calcolare modulo e angolo.</p>`,
    formula: '|V| = \u221a(Vx\u00b2 + Vy\u00b2)\n\u03b8 = arctan(Vy / Vx)',
    example: 'V = (3, 4)\n|V| = \u221a(9 + 16) = \u221a25 = 5\n\u03b8 = arctan(4/3) \u2248 53.13\u00b0',
  },

  'vector-sum': {
    title: 'Somma di Vettori',
    category: 'vettori',
    content: `<p>La somma di due o più vettori si chiama <strong>risultante</strong> <span class="vec-arrow">R</span>.</p>
<p>Metodo del <strong>parallelogramma</strong>: si disegnano i due vettori con la stessa origine, si completa il parallelogramma, e la diagonale è la risultante.</p>
<p>Metodo <strong>punta-coda</strong>: si mette la coda del secondo vettore sulla punta del primo; la risultante va dalla coda del primo alla punta dell'ultimo.</p>
<p>In componenti: <span class="vec-arrow">R</span> = <span class="vec-arrow">A</span> + <span class="vec-arrow">B</span>, ovvero la somma delle singole componenti.</p>`,
    formula: 'R = A + B\nRx = Ax + Bx\nRy = Ay + By',
    example: 'A = (3, 2), B = (1, 4)\nR = (3+1, 2+4) = (4, 6)\n|R| = \u221a(16 + 36) = \u221a52 \u2248 7.21',
  },

  'vector-decompose': {
    title: 'Scomposizione di un Vettore',
    category: 'vettori',
    content: `<p>Scomporre un vettore significa trovare le sue <strong>componenti</strong> lungo gli assi cartesiani (o lungo direzioni scelte).</p>
<p>Dato un vettore <span class="vec-arrow">F</span> di modulo |<span class="vec-arrow">F</span>| che forma un angolo \u03b8 con l'asse x, le componenti sono Fx e Fy (scalari, senza freccia):</p>
<p>Questa operazione è fondamentale per analizzare le forze su un piano inclinato o in qualsiasi situazione con più direzioni.</p>`,
    formula: 'Fx = F \u00b7 cos(\u03b8)\nFy = F \u00b7 sin(\u03b8)',
    example: 'F = 10 N, \u03b8 = 30\u00b0\nFx = 10 \u00b7 cos(30\u00b0) = 10 \u00b7 0.866 = 8.66 N\nFy = 10 \u00b7 sin(30\u00b0) = 10 \u00b7 0.5 = 5 N',
  },

  'vector-multiply': {
    title: 'Moltiplicazione Scalare per Vettore',
    category: 'vettori',
    content: `<p>Moltiplicare un vettore <span class="vec-arrow">V</span> per uno scalare k significa moltiplicare ogni componente per k: k \u00b7 <span class="vec-arrow">V</span>.</p>
<p>Se k > 0, il vettore risultante ha lo stesso verso dell'originale.</p>
<p>Se k < 0, il verso si inverte.</p>
<p>Il modulo del vettore risultante è |k| volte il modulo dell'originale.</p>`,
    formula: 'k \u00b7 V = (k \u00b7 Vx, k \u00b7 Vy)\n|k \u00b7 V| = |k| \u00b7 |V|',
    example: 'V = (3, 4), k = 2\n2 \u00b7 V = (6, 8)\n|2 \u00b7 V| = 2 \u00b7 5 = 10',
  },

  'force-basics': {
    title: "Cos'è una Forza",
    category: 'forze',
    content: `<p>Una <strong>forza</strong> <span class="vec-arrow">F</span> è una grandezza vettoriale che descrive l'interazione tra due corpi.</p>
<p>Le forze possono causare accelerazione, deformazione o cambiamento di stato di moto di un corpo.</p>
<p>L'unità di misura nel S.I. è il <strong>Newton</strong> (N).</p>
<p>Secondo la seconda legge di Newton: <span class="vec-arrow">F</span> = m \u00b7 <span class="vec-arrow">a</span>.</p>`,
    formula: 'F = m \u00b7 a',
    example: 'm = 5 kg, a = 3 m/s\u00b2\nF = 5 \u00b7 3 = 15 N',
  },

  'force-weight': {
    title: 'Forza Peso',
    category: 'forze',
    content: `<p>La <strong>forza peso</strong> <span class="vec-arrow">P</span> (o forza di gravità) è la forza con cui la Terra attrae un corpo verso il suo centro.</p>
<p>È diretta sempre verso il basso (verso il centro della Terra) ed è proporzionale alla massa del corpo: <span class="vec-arrow">P</span> = m \u00b7 <span class="vec-arrow">g</span>.</p>
<p>Il valore di g sulla superficie terrestre è circa 9.81 m/s\u00b2.</p>`,
    formula: 'P = m \u00b7 g\ng \u2248 9.81 m/s\u00b2',
    example: 'm = 10 kg\nP = 10 \u00b7 9.81 = 98.1 N',
  },

  'force-normal': {
    title: 'Forza Normale',
    category: 'forze',
    content: `<p>La <strong>forza normale</strong> <span class="vec-arrow">N</span> è la forza di reazione esercitata da una superficie su un corpo appoggiato su di essa.</p>
<p>È sempre perpendicolare alla superficie di contatto.</p>
<p>Su un piano orizzontale, la forza normale equilibra la forza peso: <span class="vec-arrow">N</span> = <span class="vec-arrow">P</span>.</p>
<p>Su un piano inclinato di angolo \u03b1, la forza normale è la componente perpendicolare del peso: <span class="vec-arrow">N</span> = Py.</p>`,
    formula: 'Piano orizzontale: N = P = m \u00b7 g\nPiano inclinato: N = P \u00b7 cos(\u03b1)',
    example: 'm = 5 kg, \u03b1 = 30\u00b0\nP = 5 \u00b7 9.81 = 49.05 N\nN = 49.05 \u00b7 cos(30\u00b0) = 42.48 N',
  },

  'force-hooke': {
    title: 'Forza Elastica / Hooke',
    category: 'forze',
    content: `<p>La <strong>legge di Hooke</strong> descrive la forza elastica <span class="vec-arrow">F</span>e esercitata da una molla.</p>
<p>La forza è proporzionale all'allungamento (o compressione) <strong>\u0394x</strong> della molla rispetto alla sua posizione di equilibrio: <span class="vec-arrow">F</span>e = -k \u00b7 \u0394x.</p>
<p>Il segno negativo indica che la forza è di richiamo: si oppone alla deformazione.</p>
<p><strong>k</strong> è la costante elastica della molla, misurata in N/m.</p>`,
    formula: 'Fe = -k \u00b7 \u0394x',
    example: 'k = 200 N/m, \u0394x = 0.05 m\nFe = -200 \u00b7 0.05 = -10 N\n(La forza di 10 N richiama verso l\'equilibrio)',
  },

  'force-friction': {
    title: 'Attrito',
    category: 'forze',
    content: `<p>La <strong>forza di attrito</strong> <span class="vec-arrow">F</span>a si oppone al moto (o al tentativo di moto) tra due superfici a contatto.</p>
<p><strong>Attrito statico</strong>: impedisce l'inizio del movimento. Ha un valore massimo.</p>
<p><strong>Attrito dinamico</strong> (o cinetico): agisce quando il corpo è già in movimento.</p>
<p>In genere \u03bcs > \u03bcd (è più difficile far partire un oggetto che mantenerlo in moto).</p>`,
    formula: 'Attrito statico max: Fs = \u03bcs \u00b7 N\nAttrito dinamico: Fd = \u03bcd \u00b7 N',
    example: '\u03bcs = 0.5, \u03bcd = 0.3, N = 100 N\nFs max = 0.5 \u00b7 100 = 50 N\nFd = 0.3 \u00b7 100 = 30 N',
  },

  'inclined-plane': {
    title: 'Piano Inclinato',
    category: 'forze',
    content: `<p>Il <strong>piano inclinato</strong> è una superficie piana che forma un angolo \u03b1 con l'orizzontale.</p>
<p>La forza peso <span class="vec-arrow">P</span> si scompone in due componenti:</p>
<p><strong>Px</strong> (componente parallela al piano): tende a far scivolare il corpo verso il basso.</p>
<p><strong>Py</strong> (componente perpendicolare al piano): viene equilibrata dalla forza normale.</p>`,
    formula: 'Px = P \u00b7 sin(\u03b1) = m \u00b7 g \u00b7 sin(\u03b1)\nPy = P \u00b7 cos(\u03b1) = m \u00b7 g \u00b7 cos(\u03b1)\nN = Py = m \u00b7 g \u00b7 cos(\u03b1)',
    example: 'm = 10 kg, \u03b1 = 30\u00b0\nP = 10 \u00b7 9.81 = 98.1 N\nPx = 98.1 \u00b7 sin(30\u00b0) = 49.05 N\nPy = 98.1 \u00b7 cos(30\u00b0) = 84.96 N',
  },

  'force-tension': {
    title: 'Tensione / Carrucole',
    category: 'forze',
    content: `<p>La <strong>tensione</strong> <span class="vec-arrow">T</span> è la forza trasmessa attraverso una corda, filo o cavo quando viene tirato.</p>
<p>In una corda ideale (senza massa e inestensibile), la tensione è la stessa in ogni punto.</p>
<p>La <strong>carrucola</strong> è un disco che cambia la direzione della corda senza variarne la tensione.</p>
<p>Nel simulatore: <strong>m\u2081</strong> (sul piano inclinato con attrito \u03bc e angolo \u03b8) e <strong>m\u2082</strong> (appesa verticalmente) sono collegate dalla fune che passa sulla carrucola in cima al piano.</p>
<p>Definita la "forza motrice" <strong>driving = P\u2082 \u2212 P\u2081x</strong> (positiva se m\u2082 tira m\u2081 verso l'alto del piano), ci sono tre casi:</p>
<ul><li>|driving| \u2264 \u03bc\u00b7N \u2192 <strong>equilibrio</strong> (a = 0, T = P\u2082)</li>
<li>driving > \u03bc\u00b7N \u2192 <strong>m\u2081 sale</strong> sul piano, m\u2082 scende</li>
<li>driving < \u2212\u03bc\u00b7N \u2192 <strong>m\u2081 scende</strong>, m\u2082 sale</li></ul>`,
    formula: 'P\u2081 = m\u2081\u00b7g   P\u2082 = m\u2082\u00b7g\nP\u2081x = m\u2081\u00b7g\u00b7sin(\u03b8)   N = m\u2081\u00b7g\u00b7cos(\u03b8)\n\nEquilibrio: T = P\u2082, a = 0\nm\u2081 sale: a = (P\u2082 \u2212 P\u2081x \u2212 \u03bc\u00b7N) / (m\u2081+m\u2082)\n         T = m\u2082\u00b7(g \u2212 a)\nm\u2081 scende: a = (P\u2081x \u2212 P\u2082 \u2212 \u03bc\u00b7N) / (m\u2081+m\u2082)\n            T = m\u2082\u00b7(g + a)',
    example: 'm\u2081 = 5 kg, m\u2082 = 3 kg, \u03b8 = 30\u00b0, \u03bc = 0.2\nP\u2081 = 49.05 N, P\u2082 = 29.43 N\nP\u2081x = 5\u00b79.81\u00b70.5 = 24.53 N\nN = 5\u00b79.81\u00b7cos(30\u00b0) = 42.48 N\n\u03bc\u00b7N = 0.2\u00b742.48 = 8.50 N\ndriving = 29.43 \u2212 24.53 = 4.90 N\n|driving| < \u03bc\u00b7N \u2192 Equilibrio, T = 29.43 N',
  },

  'equilibrium': {
    title: 'Equilibrio',
    category: 'forze',
    content: `<p>Un corpo è in <strong>equilibrio</strong> quando la somma vettoriale di tutte le forze applicate è zero: \u03a3<span class="vec-arrow">F</span> = 0.</p>
<p>In equilibrio il corpo rimane fermo (equilibrio statico) o si muove a velocità costante (equilibrio dinamico).</p>
<p>Per verificare l'equilibrio, si controlla che la somma delle componenti x e la somma delle componenti y siano entrambe zero.</p>`,
    formula: '\u03a3F = 0\n\u03a3Fx = 0\n\u03a3Fy = 0',
    example: 'Un libro su un tavolo:\nPeso P = 20 N (verso il basso)\nNormale N = 20 N (verso l\'alto)\n\u03a3F = P + N = -20 + 20 = 0 N \u2192 equilibrio',
  },

  'point-forces': {
    title: 'Forze su un Punto',
    category: 'forze',
    content: `<p>Quando più forze agiscono su uno stesso punto, si possono sommare vettorialmente per trovare la <strong>risultante</strong> <span class="vec-arrow">R</span>.</p>
<p>Il metodo più pratico è scomporre ogni forza <span class="vec-arrow">F</span>\u2081, <span class="vec-arrow">F</span>\u2082, ... nelle componenti x e y, sommare separatamente le componenti, e poi ricomporre il vettore risultante.</p>
<p>La risultante <span class="vec-arrow">R</span> ha lo stesso effetto di tutte le forze agenti insieme.</p>`,
    formula: 'Rx = \u03a3Fix = F1x + F2x + ... + Fnx\nRy = \u03a3Fiy = F1y + F2y + ... + Fny\n|R| = \u221a(Rx\u00b2 + Ry\u00b2)\n\u03b8 = arctan(Ry / Rx)',
    example: 'F1 = (3, 0) N, F2 = (0, 4) N\nRx = 3 + 0 = 3 N\nRy = 0 + 4 = 4 N\n|R| = \u221a(9 + 16) = 5 N\n\u03b8 = arctan(4/3) \u2248 53.1\u00b0',
  },

  'equilibrio-punto': {
    title: 'Equilibrio del punto materiale',
    category: 'equilibrio',
    content: `<p>Un punto materiale è in <strong>equilibrio</strong> quando la somma vettoriale di tutte le forze applicate è nulla: \u03a3<span class="vec-arrow">F</span> = 0.</p>
<p>Si scompongono tutte le forze lungo due assi perpendicolari e si impone che la somma delle componenti su ciascun asse sia zero.</p>`,
    formula: '\u03a3F = 0\n\u03a3Fx = 0   e   \u03a3Fy = 0',
    example: 'Lampadario di 8 kg appeso al soffitto:\nP = 8 \u00b7 9.81 = 78.5 N (verso il basso)\nT = 78.5 N (verso l\'alto)\n\u03a3F = T - P = 0 \u2192 equilibrio',
  },

  'piano-inclinato-equilibrio': {
    title: 'Equilibrio su piano orizzontale e inclinato',
    category: 'equilibrio',
    content: `<p><strong>Piano orizzontale</strong>: <span class="vec-arrow">N</span> = <span class="vec-arrow">P</span>, cioè N = P = m\u00b7g.</p>
<p><strong>Piano inclinato</strong> (angolo \u03b1): il peso <span class="vec-arrow">P</span> si scompone in Px (parallela) e Py (perpendicolare). Per l'equilibrio con attrito: tan(\u03b1) = \u03bcs.</p>`,
    formula: 'Px = m\u00b7g\u00b7sin(\u03b1)\nPy = m\u00b7g\u00b7cos(\u03b1)\nN = Py\nEquilibrio con attrito: tan(\u03b1) = \u03bcs',
    example: 'm = 5 kg, \u03b1 = 20\u00b0, \u03bcs = 0.4\nPx = 5\u00b79.81\u00b7sin(20\u00b0) = 16.8 N\nFa max = 0.4\u00b75\u00b79.81\u00b7cos(20\u00b0) = 18.4 N\nFa > Px \u2192 equilibrio',
  },

  'momento-forza': {
    title: 'Momento di una forza e coppia di forze',
    category: 'equilibrio',
    content: `<p>Il <strong>momento</strong> di una forza rispetto a un polo misura la tendenza della forza a far ruotare il corpo. L'unità di misura è il N\u00b7m.</p>
<p>Una <strong>coppia di forze</strong> è formata da due forze uguali e contrarie applicate in punti diversi; produce solo rotazione.</p>`,
    formula: 'M = F \u00b7 d\n(d = braccio della forza)',
    example: 'F = 20 N, d = 0.5 m\nM = 20 \u00b7 0.5 = 10 N\u00b7m',
  },

  'corpo-rigido': {
    title: 'Equilibrio del corpo rigido e baricentro',
    category: 'equilibrio',
    content: `<p>Un corpo rigido è in equilibrio quando: <strong>\u03a3<span class="vec-arrow">F</span> = 0</strong> (equilibrio alla traslazione) e <strong>\u03a3M = 0</strong> (equilibrio alla rotazione).</p>
<p>Il <strong>baricentro</strong> è il punto in cui si può considerare applicata tutta la forza peso. Un corpo appoggiato è in equilibrio stabile se la verticale dal baricentro cade nella base di appoggio.</p>`,
    formula: '\u03a3F = 0   e   \u03a3M = 0',
    example: 'Asta di 2 m con fulcro al centro:\nF1 = 30 N a 1 m dal fulcro\n\u03a3M = 0 \u2192 F2 = F1 \u00b7 d1/d2 = 30 N',
  },

  'pressione': {
    title: 'La pressione',
    category: 'equilibrio',
    content: `<p>La <strong>pressione</strong> è il rapporto tra la forza applicata perpendicolarmente a una superficie e l'area della superficie.</p>
<p>L'unità di misura nel S.I. è il <strong>Pascal</strong> (Pa): 1 Pa = 1 N/m\u00b2.</p>`,
    formula: 'p = F / A',
    example: 'F = 500 N, A = 0.25 m\u00b2\np = 500 / 0.25 = 2000 Pa',
  },

  'pascal': {
    title: 'Legge di Pascal',
    category: 'equilibrio',
    content: `<p><strong>Legge di Pascal</strong>: la pressione esercitata su un fluido in equilibrio in un recipiente chiuso si trasmette con uguale intensità in tutte le direzioni.</p>
<p>Applicazione principale: il <strong>torchio idraulico</strong>.</p>`,
    formula: 'F1 / A1 = F2 / A2',
    example: 'Torchio idraulico:\nA1 = 0.01 m\u00b2, A2 = 0.5 m\u00b2, F1 = 100 N\nF2 = 100 \u00b7 0.5 / 0.01 = 5000 N',
  },

  'stevino': {
    title: 'Legge di Stevino',
    category: 'equilibrio',
    content: `<p><strong>Legge di Stevino</strong>: la pressione in un fluido aumenta con la profondità.</p>
<p>dove p0 è la pressione sulla superficie, \u03c1 è la densità del fluido, g l'accelerazione di gravità e h la profondità.</p>`,
    formula: 'p = p0 + \u03c1 \u00b7 g \u00b7 h',
    example: 'Acqua (\u03c1 = 1000 kg/m\u00b3), h = 10 m\np = 101325 + 1000\u00b79.81\u00b710 = 199425 Pa \u2248 2 atm',
  },

  'archimede': {
    title: 'Legge di Archimede',
    category: 'equilibrio',
    content: `<p><strong>Legge di Archimede</strong>: un corpo immerso in un fluido riceve una <strong>spinta</strong> verso l'alto (indicata con <span class="vec-arrow">F</span>A, per distinguerla dalla forza di attrito Fa) uguale al peso del fluido spostato.</p>
<p>Se FA > P il corpo galleggia; se FA = P resta sospeso; se FA < P affonda.</p>`,
    formula: 'FA = \u03c1f \u00b7 g \u00b7 V',
    example: 'Cubo di legno (V = 0.001 m\u00b3), massa 0.6 kg, in acqua:\nP = 0.6\u00b79.81 = 5.89 N\nFA = 1000\u00b79.81\u00b70.001 = 9.81 N\nFA > P \u2192 galleggia',
  },

  'pressione-atmosferica': {
    title: 'La pressione atmosferica',
    category: 'equilibrio',
    content: `<p>La <strong>pressione atmosferica</strong> è la pressione esercitata dall'aria sulla superficie terrestre. Fu misurata da <strong>Torricelli</strong> nel 1644.</p>
<p>La pressione atmosferica diminuisce con l'altitudine.</p>`,
    formula: '1 atm = 101325 Pa = 760 mmHg',
    example: 'Esperimento di Torricelli:\np_atm = \u03c1_Hg \u00b7 g \u00b7 h\n101325 = 13600 \u00b7 9.81 \u00b7 h\nh \u2248 0.76 m = 760 mm',
  },
};

export function getTopicsByCategory(category) {
  return Object.entries(THEORY_TOPICS)
    .filter(([, topic]) => topic.category === category)
    .map(([id, topic]) => ({ id, ...topic }));
}

export function getTopic(id) {
  return THEORY_TOPICS[id] || null;
}
