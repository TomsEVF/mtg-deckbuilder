import { useState, useEffect } from 'react';
import CardSearch from './components/CardSearch';
import CardList from './components/CardList';
import ExportButton from './components/ExportButton';
import ImportButton from './components/ImportButton';
import CardModal from './components/CardModal';
import Playtester from './components/Playtester';
import './index.css';

function App() {
  // Hauptdeck (nur Nicht-Länder)
  const [mainDeck, setMainDeck] = useState(() => {
    const saved = localStorage.getItem('mtgMainDeck');
    return saved ? JSON.parse(saved) : [];
  });

  // Länder (separat)
  const [lands, setLands] = useState(() => {
    const saved = localStorage.getItem('mtgLands');
    return saved ? JSON.parse(saved) : [];
  });

  // Sideboard
  const [sideboard, setSideboard] = useState(() => {
    const saved = localStorage.getItem('mtgSideboard');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [playtesterOpen, setPlaytesterOpen] = useState(false);

  // Alles im localStorage speichern
  useEffect(() => {
    localStorage.setItem('mtgMainDeck', JSON.stringify(mainDeck));
  }, [mainDeck]);

  useEffect(() => {
    localStorage.setItem('mtgLands', JSON.stringify(lands));
  }, [lands]);

  useEffect(() => {
    localStorage.setItem('mtgSideboard', JSON.stringify(sideboard));
  }, [sideboard]);

  const openModal = (card) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  const openPlaytester = () => setPlaytesterOpen(true);
  const closePlaytester = () => setPlaytesterOpen(false);

  // Hilfsfunktion: Ist die Karte ein Land?
  const isLand = (card) => {
    return card.type_line && card.type_line.includes('Land');
  };

  // Gesamtanzahl einer Karte über alle Bereiche
  const getTotalQuantity = (cardId) => {
    const main = mainDeck.find(c => c.card.id === cardId)?.quantity || 0;
    const land = lands.find(c => c.card.id === cardId)?.quantity || 0;
    const sb = sideboard.find(c => c.card.id === cardId)?.quantity || 0;
    return main + land + sb;
  };

  // Karte hinzufügen (je nach Typ in mainDeck oder lands)
  const addCard = (card) => {
    if (isLand(card)) {
      // Länder kommen in den lands-Bereich
      setLands(prev => {
        const existing = prev.find(c => c.card.id === card.id);
        if (existing) {
          return prev.map(c =>
            c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        } else {
          return [...prev, { card, quantity: 1 }];
        }
      });
    } else {
      // Nicht-Länder kommen ins Hauptdeck
      setMainDeck(prev => {
        const existing = prev.find(c => c.card.id === card.id);
        if (existing) {
          return prev.map(c =>
            c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        } else {
          return [...prev, { card, quantity: 1 }];
        }
      });
    }
  };

  // Für Sideboard (auch Länder können ins Sideboard)
  const addToSideboard = (card) => {
    setSideboard(prev => {
      const existing = prev.find(c => c.card.id === card.id);
      if (existing) {
        return prev.map(c =>
          c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      } else {
        return [...prev, { card, quantity: 1 }];
      }
    });
  };

  // Entfernen aus mainDeck
  const removeFromMain = (cardId) => {
    setMainDeck(prev => prev.filter(c => c.card.id !== cardId));
  };

  // Entfernen aus lands
  const removeFromLands = (cardId) => {
    setLands(prev => prev.filter(c => c.card.id !== cardId));
  };

  // Entfernen aus sideboard
  const removeFromSideboard = (cardId) => {
    setSideboard(prev => prev.filter(c => c.card.id !== cardId));
  };

  // Menge ändern in mainDeck
  const updateMainQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromMain(cardId);
    } else {
      setMainDeck(prev =>
        prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c)
      );
    }
  };

  // Menge ändern in lands
  const updateLandsQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromLands(cardId);
    } else {
      setLands(prev =>
        prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c)
      );
    }
  };

  // Menge ändern in sideboard
  const updateSideboardQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromSideboard(cardId);
    } else {
      setSideboard(prev =>
        prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c)
      );
    }
  };

  // Verschieben aus Sideboard ins Hauptdeck (Länder in lands, Nicht-Länder in main)
  const moveToMain = (cardId) => {
    const entry = sideboard.find(c => c.card.id === cardId);
    if (!entry) return;
    setSideboard(prev => prev.filter(c => c.card.id !== cardId));

    if (isLand(entry.card)) {
      // Land in lands verschieben
      setLands(prev => {
        const existing = prev.find(c => c.card.id === cardId);
        if (existing) {
          return prev.map(c =>
            c.card.id === cardId ? { ...c, quantity: c.quantity + entry.quantity } : c
          );
        } else {
          return [...prev, { card: entry.card, quantity: entry.quantity }];
        }
      });
    } else {
      // Nicht-Land in mainDeck
      setMainDeck(prev => {
        const existing = prev.find(c => c.card.id === cardId);
        if (existing) {
          return prev.map(c =>
            c.card.id === cardId ? { ...c, quantity: c.quantity + entry.quantity } : c
          );
        } else {
          return [...prev, { card: entry.card, quantity: entry.quantity }];
        }
      });
    }
  };

  // Verschieben aus Hauptdeck oder Länder ins Sideboard
  const moveToSideboard = (cardId, from) => {
    let entry;
    if (from === 'main') {
      entry = mainDeck.find(c => c.card.id === cardId);
      if (!entry) return;
      setMainDeck(prev => prev.filter(c => c.card.id !== cardId));
    } else if (from === 'lands') {
      entry = lands.find(c => c.card.id === cardId);
      if (!entry) return;
      setLands(prev => prev.filter(c => c.card.id !== cardId));
    } else {
      return;
    }

    setSideboard(prev => {
      const existing = prev.find(c => c.card.id === cardId);
      if (existing) {
        return prev.map(c =>
          c.card.id === cardId ? { ...c, quantity: c.quantity + entry.quantity } : c
        );
      } else {
        return [...prev, { card: entry.card, quantity: entry.quantity }];
      }
    });
  };

  // Gesamtkartenzahl
  const totalMain = mainDeck.reduce((sum, c) => sum + c.quantity, 0);
  const totalLands = lands.reduce((sum, c) => sum + c.quantity, 0);
  const totalDeck = totalMain + totalLands;
  const totalSideboard = sideboard.reduce((sum, c) => sum + c.quantity, 0);

  // Leeren
  const clearMain = () => setMainDeck([]);
  const clearLands = () => setLands([]);
  const clearSideboard = () => setSideboard([]);

  // Hilfsfunktion für Modal
  const getCardInDecks = (cardId) => {
    const main = mainDeck.find(c => c.card.id === cardId);
    const land = lands.find(c => c.card.id === cardId);
    const sb = sideboard.find(c => c.card.id === cardId);
    return {
      inMain: !!main,
      inLands: !!land,
      inSideboard: !!sb,
      mainQuantity: main?.quantity || 0,
      landsQuantity: land?.quantity || 0,
      sideboardQuantity: sb?.quantity || 0
    };
  };

  return (
    <div className="app">
      <h1>MTG Deck Builder</h1>
      <div className="panels">
        {/* Linke Spalte: Suche */}
        <div className="search-panel">
          <CardSearch
            onAddToMain={addCard}
            onAddToLands={addCard}
            onAddToSideboard={addToSideboard}
            onOpenModal={openModal}
          />
        </div>

        {/* Rechte Spalte: Deck und Sideboard */}
        <div className="deck-panel">
          {/* Hauptdeck (Nicht-Länder) */}
          <div className="deck-section">
            <div className="deck-header">
              <h2>Hauptdeck ({totalMain} Karten)</h2>
              <button className="danger" onClick={clearMain}>Leeren</button>
            </div>
            <CardList
              items={mainDeck}
              onRemove={removeFromMain}
              onUpdateQuantity={updateMainQuantity}
              onOpenModal={openModal}
              onMoveToSideboard={(id) => moveToSideboard(id, 'main')}
              showMoveButton={true}
              moveDirection="toSideboard"
              isLandList={false}
              showCategories={true}
            />
          </div>

          {/* Länder */}
          <div className="lands-section">
            <div className="deck-header">
              <h2>Länder ({totalLands} Karten)</h2>
              <button className="danger" onClick={clearLands}>Leeren</button>
            </div>
            <CardList
              items={lands}
              onRemove={removeFromLands}
              onUpdateQuantity={updateLandsQuantity}
              onOpenModal={openModal}
              onMoveToSideboard={(id) => moveToSideboard(id, 'lands')}
              showMoveButton={true}
              moveDirection="toSideboard"
              isLandList={true}
              showCategories={false}
            />
          </div>

          {/* Sideboard */}
          <div className="sideboard-section">
            <div className="deck-header">
              <h2 className={totalSideboard > 15 ? 'warning-text' : ''}>
                Sideboard ({totalSideboard}/15 Karten)
              </h2>
              <button className="danger" onClick={clearSideboard}>Leeren</button>
            </div>
            <CardList
              items={sideboard}
              onRemove={removeFromSideboard}
              onUpdateQuantity={updateSideboardQuantity}
              onOpenModal={openModal}
              onMoveToMain={(id) => moveToMain(id)}
              showMoveButton={true}
              moveDirection="toMain"
              isLandList={false}
              showCategories={true}
            />
          </div>

          {/* Gesamt-Deckgröße mit Warnung bei <60 */}
          <div className={`deck-total ${totalDeck < 60 ? 'warning-text' : ''}`}>
            <strong>Deck insgesamt: {totalDeck} Karten</strong>
          </div>

          <div className="export-import">
            <ExportButton mainDeck={mainDeck} lands={lands} sideboard={sideboard} />
            <ImportButton setMainDeck={setMainDeck} setLands={setLands} setSideboard={setSideboard} />
            <button className="test-button" onClick={openPlaytester}>Deck testen</button>
          </div>
        </div>
      </div>

      {modalOpen && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeModal}
          onAddToMain={addCard}
          onAddToLands={addCard}
          onAddToSideboard={addToSideboard}
          onUpdateMainQuantity={updateMainQuantity}
          onUpdateLandsQuantity={updateLandsQuantity}
          onUpdateSideboardQuantity={updateSideboardQuantity}
          onRemoveFromMain={removeFromMain}
          onRemoveFromLands={removeFromLands}
          onRemoveFromSideboard={removeFromSideboard}
          {...getCardInDecks(selectedCard.id)}
        />
      )}

      {playtesterOpen && (
        <Playtester
          mainDeck={mainDeck}
          lands={lands}
          onClose={closePlaytester}
        />
      )}
    </div>
  );
}

export default App;