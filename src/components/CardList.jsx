import { useMemo } from 'react';
import { getCardImage } from '../utils/cardHelpers';

// Hilfsfunktion zur Bestimmung der Kategorie
const getCategory = (card) => {
  const typeLine = card.type_line.toLowerCase();
  if (typeLine.includes('planeswalker')) return 'planeswalker';
  if (typeLine.includes('creature')) return 'creature';
  if (typeLine.includes('artifact')) return 'artifact';
  if (typeLine.includes('enchantment')) return 'enchantment';
  if (typeLine.includes('instant') || typeLine.includes('sorcery')) return 'instant/sorcery';
  return 'other';
};

const categoryNames = {
  creature: 'Kreaturen',
  artifact: 'Artefakte',
  enchantment: 'Verzauberungen',
  'instant/sorcery': 'Spontanzauber/Hexereien',
  planeswalker: 'Planeswalker',
  other: 'Sonstiges'
};

const CardList = ({
  items,
  onRemove,
  onUpdateQuantity,
  onOpenModal,
  onMoveToSideboard,
  onMoveToMain,
  showMoveButton = false,
  moveDirection = 'toSideboard',
  isLandList = false,
  showCategories = false
}) => {
  // Nach Manakosten sortieren
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0));
  }, [items]);

  // Einfache Liste ohne Kategorien (für Länder)
  if (!showCategories) {
    return (
      <ul className="deck-list">
        {sortedItems.map(({ card, quantity }) => (
          <li key={card.id} className={`deck-item ${!isLandList && quantity > 4 ? 'warning' : ''}`}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, cursor: 'pointer' }}
              onClick={() => onOpenModal(card)}
            >
              {getCardImage(card) ? (
                <img src={getCardImage(card)} alt={card.name} />
              ) : (
                <div style={{ width: '40px', height: '40px', background: '#3498db', borderRadius: '6px' }} />
              )}
              <span style={{ fontWeight: 'bold' }}>{card.name}</span>
            </div>
            <div className="deck-item-info">
              <div className="quantity-controls">
                <button onClick={() => onUpdateQuantity(card.id, quantity - 1)}>-</button>
                <span className={!isLandList && quantity > 4 ? 'warning-text' : ''}>{quantity}</span>
                <button onClick={() => onUpdateQuantity(card.id, quantity + 1)}>+</button>
                <button className="remove-btn" onClick={() => onRemove(card.id)}>×</button>
              </div>
              {showMoveButton && (
                <button
                  className="move-btn"
                  onClick={() => moveDirection === 'toSideboard' ? onMoveToSideboard(card.id) : onMoveToMain(card.id)}
                  title={moveDirection === 'toSideboard' ? 'Ins Sideboard verschieben' : 'Ins Hauptdeck verschieben'}
                >
                  {moveDirection === 'toSideboard' ? '→ SB' : '← Deck'}
                </button>
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
            Keine Karten vorhanden.
          </p>
        )}
      </ul>
    );
  }

  // Mit Kategorien (für Hauptdeck und Sideboard)
  const grouped = useMemo(() => {
    const groups = {};
    sortedItems.forEach(item => {
      const cat = getCategory(item.card);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [sortedItems]);

  const categoryOrder = ['planeswalker', 'creature', 'artifact', 'enchantment', 'instant/sorcery', 'other'];

  return (
    <ul className="deck-list">
      {categoryOrder.map(cat => {
        const groupItems = grouped[cat];
        if (!groupItems || groupItems.length === 0) return null;
        return (
          <li key={cat} className="category-group">
            <h3 className="category-header">{categoryNames[cat]}</h3>
            <ul className="category-items">
              {groupItems.map(({ card, quantity }) => (
                <li key={card.id} className={`deck-item ${!isLandList && quantity > 4 ? 'warning' : ''}`}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, cursor: 'pointer' }}
                    onClick={() => onOpenModal(card)}
                  >
                    {getCardImage(card) ? (
                      <img src={getCardImage(card)} alt={card.name} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#3498db', borderRadius: '6px' }} />
                    )}
                    <span style={{ fontWeight: 'bold' }}>{card.name}</span>
                  </div>
                  <div className="deck-item-info">
                    <div className="quantity-controls">
                      <button onClick={() => onUpdateQuantity(card.id, quantity - 1)}>-</button>
                      <span className={!isLandList && quantity > 4 ? 'warning-text' : ''}>{quantity}</span>
                      <button onClick={() => onUpdateQuantity(card.id, quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => onRemove(card.id)}>×</button>
                    </div>
                    {showMoveButton && (
                      <button
                        className="move-btn"
                        onClick={() => moveDirection === 'toSideboard' ? onMoveToSideboard(card.id) : onMoveToMain(card.id)}
                        title={moveDirection === 'toSideboard' ? 'Ins Sideboard verschieben' : 'Ins Hauptdeck verschieben'}
                      >
                        {moveDirection === 'toSideboard' ? '→ SB' : '← Deck'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
      {items.length === 0 && (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
          Keine Karten vorhanden.
        </p>
      )}
    </ul>
  );
};

export default CardList;