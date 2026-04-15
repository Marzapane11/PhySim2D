# Prompt per continuare il lavoro in una nuova chat

Copia e incolla questo prompt all'inizio della nuova sessione:

---

Ciao! Sto lavorando a un progetto e ho bisogno che tu continui il lavoro da dove l'ho lasciato. Leggi attentamente queste istruzioni prima di fare qualsiasi cosa.

## Chi sono
Sono uno studente italiano di prima superiore (liceo scientifico scienze applicate) del Liceo Enrico Medi di Cicciano. Non so programmare, quindi spiegami sempre tutto in italiano semplice. Non leggere il codice a me — scrivilo tu. Io ti dico cosa voglio, tu lo fai. Preferisco il tema scuro.

## Cosa stiamo costruendo
Un simulatore di forze e vettori 2D (web app Electron con Three.js) che segue il programma di fisica del mio liceo.

Cartella del progetto: `/home/user/code-server/Simulatore-Forze-Fisica/`

## Prima cosa da fare
1. **Leggi il documento di stato del progetto**: `docs/STATO-PROGETTO.md` — spiega tutto: struttura, funzionalita implementate, concetti chiave.
2. **Controlla la memoria utente** in `/home/user/.claude/projects/-home-user-code-server-Simulatore-Forze-Fisica/memory/` per ricordarti le mie preferenze.
3. **Verifica che i test passino**: `npx vitest run` (devono essere 88/88).
4. **Verifica che il server sia attivo**: `curl -s http://localhost:5173 > /dev/null && echo ok` — se e spento, riavvialo con `npx vite --host 0.0.0.0 --port 5173 &`
5. **Link dell'app**: dopo ogni risposta che mi dai, aggiungi sempre questo link in fondo: `[Apri l'app → http://192.168.1.32:5173](http://192.168.1.32:5173)`

## Cose importanti sul mio modo di lavorare
- Parlami in italiano sempre
- Risposte brevi e concise, niente pappardelle
- Non dirmi mai di leggere il codice: ne scritto tu
- Quando mi mostri una modifica, testala (build + test) prima di dire che funziona
- Tutto e gia in italiano (interfaccia e commenti dove servono). Non cambiare questo.
- I vettori hanno una freccia sopra la lettera realizzata con CSS: `<span class="vec-arrow">F</span>` — usa questa classe quando parli di vettori in HTML.
- Stile grafico: 2D pulito, come un libro di testo. Niente 3D.
- Scala forze: logaritmica con cap (vedi `scaleForceVector` in `src/simulator/vector-renderer.js`).
- Forze personalizzate: angolo relativo a Px (direzione lungo il piano verso il basso).

## Cose da NON toccare (senza che te lo chieda)
- La sezione Teoria in `src/theory/theory-data.js`
- Il nome "Mataro M." come sviluppatore
- Il riferimento al Liceo Medi di Cicciano
- I tre scenari nelle Forze: "Piano e Piano inclinato", "Molla", "Carrucola"
- Il programma di fisica che segue i 3 moduli del liceo (Mod. 0, 1, 2)

## Flusso di lavoro
1. Leggi STATO-PROGETTO.md
2. Aspetta che io ti dica cosa modificare o aggiungere
3. Fai le modifiche, testa, committa con un messaggio chiaro
4. Dammi una risposta breve + il link all'app

## Cosa ho gia fatto (riassunto)
- Setup completo Electron + Vite + Three.js + Vitest
- 3 moduli del programma scolastico (Grandezze, Vettori+Forze, Equilibrio)
- 3 scenari interattivi: Piano inclinato (con modalita piatta), Molla su piano, Carrucola
- Parametri dinamici: qualsiasi variabile puo essere input o output, formule inverse automatiche
- Forze personalizzate (F1, F2, ...) con modulo e angolo relativo a Px
- Calcolo fisico corretto: attrito statico adattivo, normale modificata da forze perpendicolari
- Scomposizione Px/Py con linee tratteggiate come nei libri
- Rendering 2D pulito con frecce a punta triangolare
- Zoom, pan (trascinamento), fullscreen
- Tema chiaro/scuro con canvas che si adatta
- 88 test automatici che verificano tutti i calcoli

## Bug noti / aree da migliorare (quando vorrai)
- La carrucola e piu semplice degli altri scenari (non ha forze personalizzate)
- Mod. 0 e Mod. 2 sono solo teoria testuale, non simulatori
- Le forze personalizzate sulla molla potrebbero avere il calcolo di Fris visibile
- Potrebbe servire salvataggio/caricamento problemi

---

Aspetto che tu mi confermi di aver letto il documento di stato prima di procedere. Dammi un breve riassunto di quello che e gia implementato e chiedimi cosa vuoi che ti aiuti a fare oggi.
