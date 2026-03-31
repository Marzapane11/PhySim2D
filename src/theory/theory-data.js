export const THEORY_TOPICS = {
  'vector-basics': {
    title: 'Vettori e Scalari',
    category: 'vettori',
    content: `<p>In fisica esistono due tipi di grandezze: <strong>scalari</strong> e <strong>vettoriali</strong>.</p>
<p>Una grandezza <strong>scalare</strong> e completamente descritta da un numero e un'unita di misura (es. massa, temperatura, tempo).</p>
<p>Una grandezza <strong>vettoriale</strong> richiede anche una direzione e un verso per essere descritta completamente (es. forza, velocita, spostamento).</p>
<p>Un vettore si rappresenta graficamente con una freccia: la lunghezza indica il modulo, la retta su cui giace indica la direzione, e la punta indica il verso.</p>`,
    formula: null,
    example: null,
  },

  'vector-module': {
    title: 'Modulo, Direzione, Verso',
    category: 'vettori',
    content: `<p>Ogni vettore e caratterizzato da tre proprieta fondamentali:</p>
<p><strong>Modulo</strong> (o intensita): la lunghezza del vettore, sempre un numero positivo.</p>
<p><strong>Direzione</strong>: la retta su cui giace il vettore.</p>
<p><strong>Verso</strong>: indica quale delle due possibili orientazioni lungo la direzione e quella del vettore.</p>
<p>Se conosciamo le componenti cartesiane Vx e Vy, possiamo calcolare modulo e angolo.</p>`,
    formula: '|V| = \u221a(Vx\u00b2 + Vy\u00b2)\n\u03b8 = arctan(Vy / Vx)',
    example: 'V = (3, 4)\n|V| = \u221a(9 + 16) = \u221a25 = 5\n\u03b8 = arctan(4/3) \u2248 53.13\u00b0',
  },

  'vector-sum': {
    title: 'Somma di Vettori',
    category: 'vettori',
    content: `<p>La somma di due o piu vettori si chiama <strong>risultante</strong>.</p>
<p>Metodo del <strong>parallelogramma</strong>: si disegnano i due vettori con la stessa origine, si completa il parallelogramma, e la diagonale e la risultante.</p>
<p>Metodo <strong>punta-coda</strong>: si mette la coda del secondo vettore sulla punta del primo; la risultante va dalla coda del primo alla punta dell'ultimo.</p>
<p>In componenti, la somma e semplicemente la somma delle singole componenti.</p>`,
    formula: 'R = A + B\nRx = Ax + Bx\nRy = Ay + By',
    example: 'A = (3, 2), B = (1, 4)\nR = (3+1, 2+4) = (4, 6)\n|R| = \u221a(16 + 36) = \u221a52 \u2248 7.21',
  },

  'vector-decompose': {
    title: 'Scomposizione di un Vettore',
    category: 'vettori',
    content: `<p>Scomporre un vettore significa trovare le sue <strong>componenti</strong> lungo gli assi cartesiani (o lungo direzioni scelte).</p>
<p>Dato un vettore F di modulo |F| che forma un angolo \u03b8 con l'asse x, le componenti sono:</p>
<p>Questa operazione e fondamentale per analizzare le forze su un piano inclinato o in qualsiasi situazione con piu direzioni.</p>`,
    formula: 'Fx = F \u00b7 cos(\u03b8)\nFy = F \u00b7 sin(\u03b8)',
    example: 'F = 10 N, \u03b8 = 30\u00b0\nFx = 10 \u00b7 cos(30\u00b0) = 10 \u00b7 0.866 = 8.66 N\nFy = 10 \u00b7 sin(30\u00b0) = 10 \u00b7 0.5 = 5 N',
  },

  'vector-multiply': {
    title: 'Moltiplicazione Scalare per Vettore',
    category: 'vettori',
    content: `<p>Moltiplicare un vettore per uno scalare k significa moltiplicare ogni componente per k.</p>
<p>Se k > 0, il vettore risultante ha lo stesso verso dell'originale.</p>
<p>Se k < 0, il verso si inverte.</p>
<p>Il modulo del vettore risultante e |k| volte il modulo dell'originale.</p>`,
    formula: 'k \u00b7 V = (k \u00b7 Vx, k \u00b7 Vy)\n|k \u00b7 V| = |k| \u00b7 |V|',
    example: 'V = (3, 4), k = 2\n2 \u00b7 V = (6, 8)\n|2 \u00b7 V| = 2 \u00b7 5 = 10',
  },

  'force-basics': {
    title: "Cos'e una Forza",
    category: 'forze',
    content: `<p>Una <strong>forza</strong> e una grandezza vettoriale che descrive l'interazione tra due corpi.</p>
<p>Le forze possono causare accelerazione, deformazione o cambiamento di stato di moto di un corpo.</p>
<p>L'unita di misura nel S.I. e il <strong>Newton</strong> (N).</p>
<p>Secondo la seconda legge di Newton, la forza e uguale alla massa per l'accelerazione.</p>`,
    formula: 'F = m \u00b7 a',
    example: 'm = 5 kg, a = 3 m/s\u00b2\nF = 5 \u00b7 3 = 15 N',
  },

  'force-weight': {
    title: 'Forza Peso',
    category: 'forze',
    content: `<p>La <strong>forza peso</strong> (o forza di gravita) e la forza con cui la Terra attrae un corpo verso il suo centro.</p>
<p>E diretta sempre verso il basso (verso il centro della Terra) ed e proporzionale alla massa del corpo.</p>
<p>Il valore di g sulla superficie terrestre e circa 9.81 m/s\u00b2.</p>`,
    formula: 'P = m \u00b7 g\ng \u2248 9.81 m/s\u00b2',
    example: 'm = 10 kg\nP = 10 \u00b7 9.81 = 98.1 N',
  },

  'force-normal': {
    title: 'Forza Normale',
    category: 'forze',
    content: `<p>La <strong>forza normale</strong> e la forza di reazione esercitata da una superficie su un corpo appoggiato su di essa.</p>
<p>E sempre perpendicolare alla superficie di contatto.</p>
<p>Su un piano orizzontale, la forza normale equilibra la forza peso: N = P.</p>
<p>Su un piano inclinato di angolo \u03b1, la forza normale e la componente perpendicolare del peso.</p>`,
    formula: 'Piano orizzontale: N = P = m \u00b7 g\nPiano inclinato: N = P \u00b7 cos(\u03b1)',
    example: 'm = 5 kg, \u03b1 = 30\u00b0\nP = 5 \u00b7 9.81 = 49.05 N\nN = 49.05 \u00b7 cos(30\u00b0) = 42.48 N',
  },

  'force-hooke': {
    title: 'Forza Elastica / Hooke',
    category: 'forze',
    content: `<p>La <strong>legge di Hooke</strong> descrive la forza esercitata da una molla.</p>
<p>La forza e proporzionale all'allungamento (o compressione) della molla rispetto alla sua posizione di equilibrio.</p>
<p>Il segno negativo indica che la forza e di richiamo: si oppone alla deformazione.</p>
<p><strong>k</strong> e la costante elastica della molla, misurata in N/m.</p>`,
    formula: 'F = -k \u00b7 x',
    example: 'k = 200 N/m, x = 0.05 m\nF = -200 \u00b7 0.05 = -10 N\n(La forza di 10 N richiama verso l\'equilibrio)',
  },

  'force-friction': {
    title: 'Attrito',
    category: 'forze',
    content: `<p>La <strong>forza di attrito</strong> si oppone al moto (o al tentativo di moto) tra due superfici a contatto.</p>
<p><strong>Attrito statico</strong>: impedisce l'inizio del movimento. Ha un valore massimo.</p>
<p><strong>Attrito dinamico</strong> (o cinetico): agisce quando il corpo e gia in movimento.</p>
<p>In genere \u03bcs > \u03bcd (e piu difficile far partire un oggetto che mantenerlo in moto).</p>`,
    formula: 'Attrito statico max: Fs = \u03bcs \u00b7 N\nAttrito dinamico: Fd = \u03bcd \u00b7 N',
    example: '\u03bcs = 0.5, \u03bcd = 0.3, N = 100 N\nFs max = 0.5 \u00b7 100 = 50 N\nFd = 0.3 \u00b7 100 = 30 N',
  },

  'inclined-plane': {
    title: 'Piano Inclinato',
    category: 'forze',
    content: `<p>Il <strong>piano inclinato</strong> e una superficie piana che forma un angolo \u03b1 con l'orizzontale.</p>
<p>La forza peso si scompone in due componenti:</p>
<p><strong>Componente parallela</strong> al piano: tende a far scivolare il corpo verso il basso.</p>
<p><strong>Componente perpendicolare</strong> al piano: viene equilibrata dalla forza normale.</p>`,
    formula: 'F parallela = m \u00b7 g \u00b7 sin(\u03b1)\nF perpendicolare = m \u00b7 g \u00b7 cos(\u03b1)\nN = m \u00b7 g \u00b7 cos(\u03b1)',
    example: 'm = 10 kg, \u03b1 = 30\u00b0\nF\u2225 = 10 \u00b7 9.81 \u00b7 sin(30\u00b0) = 49.05 N\nF\u22a5 = 10 \u00b7 9.81 \u00b7 cos(30\u00b0) = 84.96 N',
  },

  'force-tension': {
    title: 'Tensione / Carrucole',
    category: 'forze',
    content: `<p>La <strong>tensione</strong> e la forza trasmessa attraverso una corda, filo o cavo quando viene tirato.</p>
<p>In una corda ideale (senza massa e inestensibile), la tensione e la stessa in ogni punto.</p>
<p>La <strong>macchina di Atwood</strong> e un sistema con due masse collegate da una corda che passa su una carrucola.</p>
<p>Se le masse sono diverse, il sistema accelera nella direzione della massa maggiore.</p>`,
    formula: 'Macchina di Atwood:\na = (m1 - m2) \u00b7 g / (m1 + m2)\nT = 2 \u00b7 m1 \u00b7 m2 \u00b7 g / (m1 + m2)',
    example: 'm1 = 8 kg, m2 = 5 kg\na = (8 - 5) \u00b7 9.81 / (8 + 5) = 2.26 m/s\u00b2\nT = 2 \u00b7 8 \u00b7 5 \u00b7 9.81 / 13 = 60.37 N',
  },

  'equilibrium': {
    title: 'Equilibrio',
    category: 'forze',
    content: `<p>Un corpo e in <strong>equilibrio</strong> quando la somma vettoriale di tutte le forze applicate e zero.</p>
<p>In equilibrio il corpo rimane fermo (equilibrio statico) o si muove a velocita costante (equilibrio dinamico).</p>
<p>Per verificare l'equilibrio, si controlla che la somma delle componenti x e la somma delle componenti y siano entrambe zero.</p>`,
    formula: '\u03a3F = 0\n\u03a3Fx = 0\n\u03a3Fy = 0',
    example: 'Un libro su un tavolo:\nPeso P = 20 N (verso il basso)\nNormale N = 20 N (verso l\'alto)\n\u03a3F = P + N = -20 + 20 = 0 N \u2192 equilibrio',
  },

  'point-forces': {
    title: 'Forze su un Punto',
    category: 'forze',
    content: `<p>Quando piu forze agiscono su uno stesso punto, si possono sommare vettorialmente per trovare la <strong>risultante</strong>.</p>
<p>Il metodo piu pratico e scomporre ogni forza nelle componenti x e y, sommare separatamente le componenti, e poi ricomporre il vettore risultante.</p>
<p>La risultante ha lo stesso effetto di tutte le forze agenti insieme.</p>`,
    formula: 'Rx = \u03a3Fix = F1x + F2x + ... + Fnx\nRy = \u03a3Fiy = F1y + F2y + ... + Fny\n|R| = \u221a(Rx\u00b2 + Ry\u00b2)\n\u03b8 = arctan(Ry / Rx)',
    example: 'F1 = (3, 0) N, F2 = (0, 4) N\nRx = 3 + 0 = 3 N\nRy = 0 + 4 = 4 N\n|R| = \u221a(9 + 16) = 5 N\n\u03b8 = arctan(4/3) \u2248 53.1\u00b0',
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
