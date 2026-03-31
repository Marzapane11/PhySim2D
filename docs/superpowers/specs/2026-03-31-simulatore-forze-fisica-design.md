# Simulatore Forze e Vettori — Design Spec

## Panoramica

App desktop per Windows per simulare forze e vettori 2D con visuale 3D rotabile. Pensata per studenti di prima superiore (liceo scientifico scienze applicate). Include una sezione teoria integrata per consultazione e suggerimenti contestuali.

## Tech Stack

- **Electron** — app desktop Windows installabile
- **Three.js** — grafica 3D per il canvas di simulazione
- **JavaScript/TypeScript** — linguaggio principale
- **HTML/CSS** — interfaccia (tema dark di default, light opzionale)

## Struttura dell'App

### Navigazione

Sidebar sinistra con accesso a:

1. **Home** — schermata iniziale con accesso rapido
2. **Simulatore Vettori** — operazioni su vettori e scalari
3. **Simulatore Forze** — scenari fisici con forze
4. **Teoria** — sezione consultabile per argomento
5. **Impostazioni** (icona ingranaggio, in basso nella sidebar) — tema dark/light, personalizzazioni future (lingua, unita di misura, ecc.)

### Layout Schermata di Simulazione

```
+--------+----------------------------+------------+
|        |                            |            |
| Side   |     Canvas 3D              | Pannello   |
| bar    |     (scena di simulazione) | Proprieta  |
|        |                            | e Calcoli  |
|        |                            |            |
|        +----------------------------+ Visibilita |
|        | Barra strumenti (elementi) |            |
+--------+----------------------------+------------+
```

- **Sidebar sinistra:** navigazione tra le sezioni
- **Canvas centrale:** scena 3D rotabile (fisica 2D, visuale 3D)
- **Barra strumenti in basso:** elementi da selezionare/trascinare
- **Pannello destro:** proprieta, calcoli in tempo reale, teoria contestuale, menu visibilita

### Menu Visibilita (pannello destro)

Toggle on/off per controllare cosa si vede nella scena:

- Nomi delle forze
- Valori numerici
- Frecce delle forze
- Corpo/oggetto
- Griglia/assi
- Angoli
- Componenti (scomposizione)

---

## Parte 1: Simulatore Vettori

Sezione dedicata alle operazioni matematiche su vettori e scalari.

### Strumenti

- **Crea vettore** — click e trascina per disegnare, poi imposta modulo/angolo dal pannello destro
- **Somma vettori** — piazza 2+ vettori, mostra risultante con metodo punta-coda e parallelogramma
- **Differenza vettori** — come la somma, ma sottrae
- **Moltiplicazione scalare x vettore** — seleziona vettore, inserisci scalare, mostra risultato
- **Scomposizione** — seleziona vettore, scomponi in componenti x e y
- **Info vettore** — mostra: modulo, direzione (angolo), verso, componenti x e y

### Visualizzazione

- Vettori come frecce colorate (colore diverso per ogni vettore)
- Risultante evidenziata con colore e tratto diverso (bianco, piu spesso)
- Griglia di sfondo con assi x/y
- Visuale 3D rotabile per esplorare la geometria
- Valori numerici in tempo reale nel pannello destro
- Teoria contestuale: box con formula rilevante all'operazione attiva

---

## Parte 2: Simulatore Forze

Sezione per creare scenari fisici reali. Si sceglie lo scenario dalla barra strumenti e si configurano i parametri.

### Scenari

#### 1. Forze su un punto
- Piazza un punto, aggiungi piu forze con direzioni/intensita diverse
- Calcola e mostra la risultante

#### 2. Piano inclinato
- Configura: angolo di inclinazione, massa oggetto, coefficiente di attrito
- Mostra automaticamente: peso, componente parallela, componente perpendicolare, normale, forza d'attrito
- Indica se l'oggetto e in equilibrio o scivola

#### 3. Molle (Hooke)
- Molla attaccata a un oggetto
- Configura: costante elastica (k), deformazione (x)
- Mostra forza elastica F = -kx con freccia corrispondente

#### 4. Attrito
- Superficie piana con oggetto sopra
- Configura: massa, forza applicata, coefficiente di attrito statico/dinamico
- Mostra se l'oggetto resta fermo (attrito statico) o si muove (attrito dinamico)

#### 5. Equilibrio
- Corpo con piu forze applicate
- Indica se e in equilibrio (risultante = 0) o mostra quanto manca all'equilibrio

#### 6. Carrucole/Funi
- Sistema con carrucola, fune e masse
- Calcola tensione della fune e accelerazione del sistema

### Visualizzazione Comune a Tutti gli Scenari

- Forze come frecce colorate con etichetta (nome + valore)
- Calcoli nel pannello destro aggiornati in tempo reale
- Suggerimento di teoria contestuale
- Menu visibilita per personalizzare la vista

---

## Sezione Teoria

### Modalita 1: Consultazione Libera (dalla sidebar)

Pagina organizzata per argomenti:

**Vettori e Scalari:**
- Cos'e un vettore / cos'e uno scalare
- Modulo, direzione, verso
- Operazioni: somma, differenza, moltiplicazione
- Scomposizione nelle componenti

**Forze:**
- Cos'e una forza
- Forza peso
- Forza normale
- Forza elastica (Hooke)
- Attrito statico e dinamico
- Piano inclinato
- Tensione (funi e carrucole)
- Equilibrio di un corpo

Ogni argomento include: spiegazione semplice, formula con descrizione dei simboli, esempio numerico.

### Modalita 2: Suggerimenti Contestuali (nel simulatore)

Box compatto nel pannello destro che mostra:
- Formula principale dello scenario attivo
- Link "Approfondisci" che porta alla pagina teoria completa

---

## Calcoli

Tutti i calcoli sono eseguiti tramite **algoritmo puro** (formule matematiche). Nessuna AI per ora. L'architettura sara predisposta per aggiungere un chatbot AI in futuro.

### Formule Implementate

- Somma vettoriale: componenti (Rx = sum Fx, Ry = sum Fy), modulo risultante, angolo
- Scomposizione: Fx = F * cos(theta), Fy = F * sin(theta)
- Moltiplicazione scalare: k * V
- Peso: P = m * g
- Piano inclinato: F_parallela = P * sin(alpha), F_perpendicolare = P * cos(alpha)
- Hooke: F = -k * x
- Attrito: F_attrito = mu * N
- Equilibrio: sum F = 0
- Carrucole: T e accelerazione del sistema

---

## Impostazioni

Accessibili da icona ingranaggio in basso nella sidebar:

- **Tema:** dark (default) / light
- **Predisposto per future aggiunte:** lingua, unita di misura, ecc.

---

## Vincoli e Decisioni

- **Fisica 2D sola** — niente asse z, coerente col programma di prima superiore
- **Visuale 3D** — la scena 2D e esplorabile ruotando la visuale con il mouse
- **Target:** Windows
- **Offline:** l'app funziona completamente senza connessione internet
- **Futura estensione AI:** architettura pronta per aggiungere un chatbot senza API key o con API key
