# Verwaltungssoftware eines Cannabis Social Clubs

Wir brauchen eine Navigationsleiste (linker Rand) mit 2 Dummy Buttons, sowie ein Button für "neue Ausgabe" und ein button um zu "Statistik" zu navigieren. Da vorerst nur die eine Seite implementieren ist die Statistik Seite schon angewäht und die anderen buttons navigieren auch nicht. Der "neue Ausgabe" Button öffnet ein Popup. Im Design können auch weitere Funktionen berücksichtigt aber noch nicht umgesetzt werden. Z.B. Startpage, User-Login, User-Settings, Mitgliedsmanagement, Vorratsmanagment, Wachstumsmanagement

# UI

- State of the Art UI Design
- farbgestaltung helles beige + dunkleres moosgrün
- Zielgruppe Beamte der Behörden und Mitarbeiter des Social Clubs

# Popup: Ausgabe

- Auswahl der auszugebenden Sorte. Diese soll eine grafisch ansprechende auflistung der vorhandenen Sorten sein, bestehend aus:
    - Bild
    - vorrätige Menge
    - THC / CBD Verhätniss (Prozentbalken) + Gehalt jeweils in %
    - weitere Informationen zur Sorte (Indika/Sativa/etc., Blütezeit, Wuchsdauer, etc.)
- Auszugebende Menge (Text Input in Gramm mit zwei Nachkommastellen)
- Mitgliedsnummer an wen ausgegeben wird (Zahleneingabefeld)
- Abbrechen / Speichern button

# Page: Statistik

- Tortendiagram zusammensetzung der Ausgabe an: männlich, weiblich, divers
- Prozentbalken zusammensetzung der Ausgabe an: über 21 jährige und unter 21
- Linegraph für gesamte Menge ausgegeben, mit optionen für den Zeitraum, und zusammensetzung (über 21 jährige und unter 21 & männlich, weiblich, divers)
- bargaph ausgabemenge im schnitt pro wochentag
- Tabelle "Heutige Ausgaben" (sorte, menge, ü21 ja/nein, m/w/d)
- Möglichkeit zum Export / Druck der Statistiken

# Techstack

- React
- Typescript
- Bootstrap 5
- Fetch API statt axios
- React Table für tabellarische Daten (Mitgliederlisten, Transaktionen etc.)
- Chart.js

Das Backend ist bereits implementiert und nutzt Blockchain (das ist aber für uns egal). Kommuniziert wird über http requests im JSON Format. Die UI Komponenten sollten nach dem atomic design prinzip aufgebaut sein.


- geschlechterverteilung als balken
- kuchendriagramm: sorten beliebtheit
- liniendiagram ansicht umschaltung defekt