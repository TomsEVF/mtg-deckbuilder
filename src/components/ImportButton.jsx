import { useState } from 'react';

const ImportButton = ({ setDeck, setSideboard }) => {
  const [importing, setImporting] = useState(false);

  const parseLine = (line) => {
    const regex = /^(\d+)\s+(.+?)(?:\s+\((\w+)\)(?:\s+(\d+))?)?$/;
    const match = line.trim().match(regex);
    if (!match) return null;
    return {
      quantity: parseInt(match[1], 10),
      name: match[2].trim(),
      setCode: match[3] || null,
      collectorNumber: match[4] || null,
    };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const lines = e.target.result.split('\n').filter(line => line.trim() !== '');
      setImporting(true);

      const newDeck = [];
      const newSideboard = [];
      let inSideboard = false;

      for (const line of lines) {
        // Sideboard-Marker erkennen
        if (line.toLowerCase().includes('sideboard') || line.trim() === 'SB:') {
          inSideboard = true;
          continue;
        }

        const parsed = parseLine(line);
        if (!parsed) continue;

        let query = `!"${parsed.name}"`;
        if (parsed.setCode) query += ` set:${parsed.setCode}`;

        try {
          const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'MTGDeckBuilder/1.0' }
          });
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const card = data.data[0];
            const targetArray = inSideboard ? newSideboard : newDeck;
            const existing = targetArray.find(c => c.card.id === card.id);
            if (existing) {
              existing.quantity += parsed.quantity;
            } else {
              targetArray.push({ card, quantity: parsed.quantity });
            }
          } else {
            alert(`Karte nicht gefunden: ${parsed.name}`);
          }
        } catch (err) {
          console.error('Fehler bei Scryfall-Anfrage:', err);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate-Limit-Schonung
      }

      setDeck(newDeck);
      setSideboard(newSideboard);
      setImporting(false);
      alert('Import abgeschlossen!');
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".txt"
        id="import-file"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        disabled={importing}
      />
      <button onClick={() => document.getElementById('import-file').click()} disabled={importing}>
        {importing ? 'Importiere...' : 'Deck importieren (TXT)'}
      </button>
    </div>
  );
};

export default ImportButton;