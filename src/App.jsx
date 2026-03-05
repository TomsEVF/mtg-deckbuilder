import { useState, useEffect } from 'react';
import CardSearch from './components/CardSearch';
import DeckList from './components/DeckList';
import ExportButton from './components/ExportButton';
import ImportButton from './components/ImportButton';
import CardModal from './components/CardModal';
import './index.css';

function App() {
  const [deck, setDeck] = useState(() => {
    const saved = localStorage.getItem('mtgDeck');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mtgDeck', JSON.stringify(deck));
  }, [deck]);

  const openModal = (card) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  const addCard = (card) => {
    setDeck(prev => {
      const existing = prev.find(c => c.card.id === card.id);
      if (existing && existing.quantity >= 4) return prev;
      if (existing) {
        return prev.map(c => c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { card, quantity: 1 }];
      }
    });
  };

  const removeCard = (cardId) => {
    setDeck(prev => prev.filter(c => c.card.id !== cardId));
  };

  const updateQuantity = (cardId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCard(cardId);
    } else {
      setDeck(prev => prev.map(c => c.card.id === cardId ? { ...c, quantity: newQuantity } : c));
    }
  };

  const clearDeck = () => setDeck([]);

  const getCardInDeck = (cardId) => {
    const entry = deck.find(c => c.card.id === cardId);
    return entry ? { inDeck: true, quantity: entry.quantity } : { inDeck: false, quantity: 0 };
  };

  return (
    <div className="app">
      <h1>MTG Deck Builder</h1>
      <div className="panels">
        <div className="search-panel">
          <CardSearch onAddCard={addCard} onOpenModal={openModal} />
        </div>
        <div className="deck-panel">
          <div className="deck-header">
            <h2>Deck ({deck.reduce((sum, c) => sum + c.quantity, 0)} Karten)</h2>
            <button className="danger" onClick={clearDeck}>Deck leeren</button>
          </div>
          <DeckList
            deck={deck}
            onRemove={removeCard}
            onUpdateQuantity={updateQuantity}
            onOpenModal={openModal}
          />
          <div className="export-import">
            <ExportButton deck={deck} />
            <ImportButton setDeck={setDeck} />
          </div>
        </div>
      </div>
      {modalOpen && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeModal}
          onAdd={addCard}
          onUpdateQuantity={updateQuantity}
          onRemove={removeCard}
          {...getCardInDeck(selectedCard.id)}
        />
      )}
    </div>
  );
}

export default App;