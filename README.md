# MTG Deck Builder

Eine webbasierte Anwendung zum Zusammenstellen von Magic: The Gathering Decks, inspiriert von MTG Arena. Die App nutzt die [Scryfall API](https://scryfall.com/docs/api) für Kartendaten und -bilder und ermöglicht das komfortable Suchen, Filtern und Verwalten von Karten.

🔗 **Live-Demo:** [https://TomsEVF.github.io/mtg-deckbuilder/](https://TomsEVF.github.io/mtg-deckbuilder/)

---

## Features

- 🔍 **Erweiterte Kartensuche** – nach Name, Text, Farbe (mehrere gleichzeitig), Manakosten (CMC), Kartentyp, Kreaturentyp und Schlagwortfähigkeiten
- 🎨 **Farbauswahl mit Mana-Symbolen** – genau wie in MTG Arena
- 🃏 **Karten als Vorschaubilder** – mit direktem Plus-Button zum Hinzufügen ins Deck
- 📦 **Deck-Editor** – Karten hinzufügen/entfernen, Mengen anpassen, automatische 4er-Limit
- 💾 **Lokale Speicherung** – Deck bleibt nach Seitenneuladen erhalten (localStorage)
- 📤 **Export** – als `.txt`-Datei (MTG Arena-Format) oder direkt in die Zwischenablage
- 📥 **Import** – bestehende Decklisten im MTGA-Format einlesen (mit Scryfall-Auflösung)
- 🔎 **Karten-Detailansicht** – per Klick auf eine Karte öffnet sich ein Modal mit großem Bild und allen Informationen
- 🌐 **Responsive Design** – funktioniert auf Desktop und Mobilgeräten

---

## Voraussetzungen

- [Node.js](https://nodejs.org) (Version 16 oder höher)
- npm (wird mit Node.js installiert)
- Optional: [Git](https://git-scm.com/)

---

## Installation & lokale Entwicklung

1. **Repository klonen** (oder [ZIP herunterladen](https://github.com/TomsEVF/mtg-deckbuilder/archive/refs/heads/main.zip)):
   ```bash
   git clone https://github.com/TomsEVF/mtg-deckbuilder.git
   cd mtg-deckbuilder
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```
   Die App ist nun unter [http://localhost:5173/mtg-deckbuilder/](http://localhost:5173/mtg-deckbuilder/) erreichbar.

4. **Produktionsversion bauen** (optional):
   ```bash
   npm run build
   ```
   Die optimierten Dateien liegen dann im `dist`-Ordner.

---

## Nutzung

### Suche und Filter
- Gib einen Suchbegriff ein (Kartenname oder Text) – nach kurzer Verzögerung erscheinen Ergebnisse.
- Wähle eine oder mehrere **Farben** durch Klick auf die Mana-Symbole. Ein erneuter Klick entfernt die Farbe. Der "Alle"-Button setzt die Farbauswahl zurück.
- Stelle **Manakosten (CMC)** mit Operator und Zahlenwert ein.
- Wähle einen **Kartentyp** aus der Dropdown-Liste.
- Filtere nach **Kreaturentyp** oder **Schlagwortfähigkeiten** (deutsche Bezeichnungen).

### Karten zum Deck hinzufügen
- **Per Plus-Button** – überfahre eine Karte und klicke auf das `+`, um sie direkt (mit Menge 1) ins Deck zu legen (maximal 4 pro Karte).
- **Per Modal** – klicke auf das Kartenbild, um das Detailfenster zu öffnen. Dort kannst du die Karte ebenfalls hinzufügen.

### Deck verwalten
- Im rechten Panel siehst du alle Karten mit Bild, Name und Menge.
- Mit den `+`/`-` Buttons änderst du die Menge (bei 0 wird die Karte entfernt).
- Das `×` entfernt die Karte sofort.
- Die Gesamtzahl der Karten wird oben angezeigt.

### Export / Import
- **Exportieren als Datei**: Klick auf „Als Datei speichern“ lädt eine `.txt`-Datei herunter (MTGA-Format).
- **In Zwischenablage kopieren**: Klick auf den Button kopiert die Deckliste – in MTG Arena kannst du sie dann über „Deck importieren“ → „Aus Zwischenablage“ einfügen.
- **Importieren**: Wähle eine `.txt`-Datei aus, die Deckliste wird eingelesen und die Karten bei Scryfall gesucht. Das aktuelle Deck wird ersetzt.

---

## Deployment auf GitHub Pages

Die App ist für das Hosting auf GitHub Pages vorkonfiguriert.

1. In der `vite.config.js` muss die `base` auf den Repository-Namen gesetzt sein (bereits erledigt):
   ```js
   base: '/mtg-deckbuilder/',
   ```

2. Das `gh-pages` Paket ist installiert. Führe aus:
   ```bash
   npm run deploy
   ```
   Der Befehl baut die App und pusht den `dist`-Ordner in den `gh-pages`-Branch.

3. Nach wenigen Minuten ist die App unter `https://<dein-benutzername>.github.io/mtg-deckbuilder/` live.

---

## Technologien

- [React](https://reactjs.org/) – UI-Bibliothek
- [Vite](https://vitejs.dev/) – Build-Tool und Entwicklungsserver
- [Scryfall API](https://scryfall.com/docs/api) – Kartendaten und -bilder
- [gh-pages](https://www.npmjs.com/package/gh-pages) – Deployment auf GitHub Pages
- CSS – eigenes Styling mit Glas-Effekt (Glassmorphismus)

---

## Lizenz & Danksagung

- **Scryfall**: Alle Kartendaten und -bilder werden über die [Scryfall API](https://scryfall.com/docs/api) bezogen. Bitte beachte die [Nutzungsbedingungen](https://scryfall.com/docs/terms).
- **Wizards of the Coast**: Magic: The Gathering ist eine eingetragene Marke von Wizards of the Coast. Die Nutzung der Kartenbilder erfolgt im Rahmen der Fan-Content-Richtlinien.
- Der Quellcode dieses Projekts ist unter der [MIT-Lizenz](LICENSE) verfügbar (sofern eine LICENSE-Datei vorhanden ist).

---

## Mitwirken / Kontakt

Verbesserungsvorschläge oder Fehlermeldungen sind willkommen. Erstelle einfach ein Issue oder einen Pull Request auf GitHub.

---

Viel Spaß beim Decks bauen! 🃏✨