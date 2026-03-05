import { useState, useEffect } from 'react';
import CardSearch from './components/CardSearch';
import CardList from './components/CardList';
import ExportButton from './components/ExportButton';
import ImportButton from './components/ImportButton';
import CardModal from './components/CardModal';
import './index.css';

function App() {
  // Hauptdeck
  const [deck, setDeck] = useState(() => {
    const saved = localStorage.getItem('mtgDeck');
    return saved ? JSON.parse(saved) : [];
  });

  // Sideboard
  const [sideboard, setSideboard] = useState(() => {
    const saved = localStorage.getItem('mtgSideboard');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Beide States im localStorage speichern
  useEffect(() => {
    localStorage.setItem('mtgDeck', JSON.stringify(deck));
  }, [deck]);

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

  // Hilfsfunktion: Gesamtanzahl einer Karte (Deck + Sideboard)
  const getTotalQuantity = (cardId) => {
    const deckEntry = deck.find(c => c.card.id === cardId);
    const sbEntry = sideboard.find(c => c.card.id === cardId);
    return (deckEntry?.quantity || 0) + (sbEntry?.quantity || 0);
  };

  // Karte ins Hauptdeck hinzufügen (von Suche oder Modal)
  const addToDeck = (card) => {
    const total = getTotalQuantity(card.id);
    if (total >= 4) return; // Maximal 4 insgesamt

    setDeck(prev => {
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

  // Karte ins Sideboard hinzufügen
  const addToSideboard = (card) => {
    const total = getTotalQuantity(card.id);
    if (total >= 4) return;

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

  // Karte aus Hauptdeck entfernen
  const removeFromDeck = (cardId) => {
    setDeck(prev => prev.filter(c => c.card.id !== cardId));
  };

  // Karte aus Sideboard entfernen
  const removeFromSideboard = (cardId) => {
    setSideboard(prev => prev.filter(c => c.card.id !== cardId));
  };

  // Menge im Hauptdeck ändern
  const updateDeckQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromDeck(cardId);
    } else {
      const totalOther = (sideboard.find(c => c.card.id === cardId)?.quantity || 0);
      if (newQuantity + totalOther > 4) return; // Gesamtlimit 4 nicht überschreiten
      setDeck(prev =>
        prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c)
      );
    }
  };

  // Menge im Sideboard ändern
  const updateSideboardQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromSideboard(cardId);
    } else {
      const totalOther = (deck.find(c => c.card.id === cardId)?.quantity || 0);
      if (newQuantity + totalOther > 4) return;
      setSideboard(prev =>
        prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c)
      );
    }
  };

  // Karte vom Hauptdeck ins Sideboard verschieben
  const moveToSideboard = (cardId) => {
    const deckEntry = deck.find(c => c.card.id === cardId);
    if (!deckEntry) return;
    if (deckEntry.quantity <= 0) return;

    const sbEntry = sideboard.find(c => c.card.id === cardId);
    const sbQuantity = sbEntry?.quantity || 0;
    if (sbQuantity + deckEntry.quantity > 4) {
      alert('Zu viele Exemplare insgesamt (maximal 4)');
      return;
    }

    // Aus Deck entfernen
    setDeck(prev => prev.filter(c => c.card.id !== cardId));
    // Ins Sideboard einfügen (Menge addieren)
    setSideboard(prev => {
      if (sbEntry) {
        return prev.map(c =>
          c.card.id === cardId ? { ...c, quantity: c.quantity + deckEntry.quantity } : c
        );
      } else {
        return [...prev, { card: deckEntry.card, quantity: deckEntry.quantity }];
      }
    });
  };

  // Karte vom Sideboard ins Hauptdeck verschieben
  const moveToDeck = (cardId) => {
    const sbEntry = sideboard.find(c => c.card.id === cardId);
    if (!sbEntry) return;
    if (sbEntry.quantity <= 0) return;

    const deckEntry = deck.find(c => c.card.id === cardId);
    const deckQuantity = deckEntry?.quantity || 0;
    if (deckQuantity + sbEntry.quantity > 4) {
      alert('Zu viele Exemplare insgesamt (maximal 4)');
      return;
    }

    setSideboard(prev => prev.filter(c => c.card.id !== cardId));
    setDeck(prev => {
      if (deckEntry) {
        return prev.map(c =>
          c.card.id === cardId ? { ...c, quantity: c.quantity + sbEntry.quantity } : c
        );
      } else {
        return [...prev, { card: sbEntry.card, quantity: sbEntry.quantity }];
      }
    });
  };

  // Gesamtzahl Karten im Sideboard (für Limit)
  const sideboardTotal = sideboard.reduce((sum, c) => sum + c.quantity, 0);

  // Leeren
  const clearDeck = () => setDeck([]);
  const clearSideboard = () => setSideboard([]);

  // Hilfsfunktion für Modal
  const getCardInDeck = (cardId) => {
    const deckEntry = deck.find(c => c.card.id === cardId);
    const sbEntry = sideboard.find(c => c.card.id === cardId);
    return {
      inDeck: !!deckEntry,
      inSideboard: !!sbEntry,
      deckQuantity: deckEntry?.quantity || 0,
      sideboardQuantity: sbEntry?.quantity || 0
    };
  };

  return (
    <div className="app">
      <h1>MTG Deck Builder</h1>
      <div className="panels">
        {/* Linke Spalte: Suche */}
        <div className="search-panel">
          <CardSearch
            onAddToDeck={addToDeck}
            onAddToSideboard={addToSideboard}
            onOpenModal={openModal}
          />
        </div>

        {/* Rechte Spalte: Deck und Sideboard */}
        <div className="deck-panel">
          <div className="deck-section">
            <div className="deck-header">
              <h2>Hauptdeck ({deck.reduce((sum, c) => sum + c.quantity, 0)} Karten)</h2>
              <button className="danger" onClick={clearDeck}>Deck leeren</button>
            </div>
            <CardList
              items={deck}
              onRemove={removeFromDeck}
              onUpdateQuantity={updateDeckQuantity}
              onOpenModal={openModal}
              onMoveToSideboard={moveToSideboard}
              showMoveButton={true}
              moveDirection="toSideboard"
            />
          </div>

          <div className="sideboard-section">
            <div className="deck-header">
              <h2>Sideboard ({sideboardTotal}/15 Karten)</h2>
              <button className="danger" onClick={clearSideboard}>Sideboard leeren</button>
            </div>
            <CardList
              items={sideboard}
              onRemove={removeFromSideboard}
              onUpdateQuantity={updateSideboardQuantity}
              onOpenModal={openModal}
              onMoveToDeck={moveToDeck}
              showMoveButton={true}
              moveDirection="toDeck"
            />
          </div>

          <div className="export-import">
            <ExportButton deck={deck} sideboard={sideboard} />
            <ImportButton setDeck={setDeck} setSideboard={setSideboard} />
          </div>
        </div>
      </div>

      {modalOpen && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeModal}
          onAddToDeck={addToDeck}
          onAddToSideboard={addToSideboard}
          onUpdateDeckQuantity={updateDeckQuantity}
          onUpdateSideboardQuantity={updateSideboardQuantity}
          onRemoveFromDeck={removeFromDeck}
          onRemoveFromSideboard={removeFromSideboard}
          {...getCardInDeck(selectedCard.id)}
        />
      )}
    </div>
  );
}

export default App;