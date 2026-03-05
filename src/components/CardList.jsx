import { useMemo } from 'react';

const CardList = ({
  items,
  onRemove,
  onUpdateQuantity,
  onOpenModal,
  onMoveToSideboard,
  onMoveToDeck,
  showMoveButton = false,
  moveDirection = 'toSideboard' // 'toSideboard' oder 'toDeck'
}) => {
  // Nach Manakosten sortieren
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0));
  }, [items]);

  return (
    <ul className="deck-list">
      {sortedItems.map(({ card, quantity }) => (
        <li key={card.id} className="deck-item">
          {/* Klick auf Bild/Name öffnet Modal */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, cursor: 'pointer' }}
            onClick={() => onOpenModal(card)}
          >
            {card.image_uris?.small ? (
              <img src={card.image_uris.small} alt={card.name} />
            ) : (
              <div style={{ width: '40px', height: '40px', background: '#3498db', borderRadius: '6px' }} />
            )}
            <span style={{ fontWeight: 'bold' }}>{card.name}</span>
          </div>

          {/* Mengensteuerung und Transfer-Button */}
          <div className="deck-item-info">
            <div className="quantity-controls">
              <button onClick={() => onUpdateQuantity(card.id, quantity - 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => onUpdateQuantity(card.id, quantity + 1)}>+</button>
              <button className="remove-btn" onClick={() => onRemove(card.id)}>×</button>
            </div>
            {showMoveButton && (
              <button
                className="move-btn"
                onClick={() => moveDirection === 'toSideboard' ? onMoveToSideboard(card.id) : onMoveToDeck(card.id)}
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
};

export default CardList;