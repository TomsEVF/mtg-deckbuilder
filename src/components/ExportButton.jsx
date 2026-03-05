import { useState } from 'react';

const ExportButton = ({ deck, sideboard }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const generateDeckText = () => {
    const mainLines = deck.map(({ card, quantity }) =>
      `${quantity} ${card.name} (${card.set}) ${card.collector_number}`
    );

    const sideLines = sideboard.map(({ card, quantity }) =>
      `${quantity} ${card.name} (${card.set}) ${card.collector_number}`
    );

    if (sideLines.length === 0) {
      return mainLines.join('\n');
    } else {
      return mainLines.join('\n') + '\n\n' + 'Sideboard\n' + sideLines.join('\n');
    }
  };

  const exportAsFile = () => {
    const content = generateDeckText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deck.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const content = generateDeckText();
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => alert('Kopieren fehlgeschlagen.'));
  };

  return (
    <>
      <button onClick={exportAsFile}>Als Datei speichern</button>
      <button onClick={copyToClipboard}>
        {copySuccess ? 'Kopiert!' : 'In Zwischenablage kopieren'}
      </button>
    </>
  );
};

export default ExportButton;