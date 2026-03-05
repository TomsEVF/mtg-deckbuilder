import React from 'react';
import ManaCost from './ManaCost';

const CardModal = ({
  card,
  onClose,
  onAddToDeck,
  onAddToSideboard,
  onUpdateDeckQuantity,
  onUpdateSideboardQuantity,
  onRemoveFromDeck,
  onRemoveFromSideboard,
  inDeck,
  inSideboard,
  deckQuantity,
  sideboardQuantity
}) => {
  if (!card) return null;

  const imageUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.small;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          {imageUrl && (
            <div className="modal-image">
              <img src={imageUrl} alt={card.name} />
            </div>
          )}
          <div className="modal-details">
            <h2>{card.name}</h2>
            {card.mana_cost && <ManaCost manaCost={card.mana_cost} />}
            <p className="modal-type">{card.type_line}</p>
            {card.oracle_text && (
              <div className="modal-text">
                {card.oracle_text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
            {card.power && card.toughness && <p className="modal-pt">{card.power}/{card.toughness}</p>}

            <div className="modal-actions">
              {/* Hauptdeck-Steuerung */}
              <div className="modal-section">
                <h3>Hauptdeck</h3>
                {inDeck ? (
                  <div className="modal-deck-actions">
                    <div className="quantity-controls">
                      <button onClick={() => onUpdateDeckQuantity(card.id, deckQuantity - 1)}>-</button>
                      <span>{deckQuantity}</span>
                      <button onClick={() => onUpdateDeckQuantity(card.id, deckQuantity + 1)}>+</button>
                    </div>
                    <button className="danger" onClick={() => { onRemoveFromDeck(card.id); onClose(); }}>Entfernen</button>
                  </div>
                ) : (
                  <button onClick={() => { onAddToDeck(card); onClose(); }}>Ins Hauptdeck</button>
                )}
              </div>

              {/* Sideboard-Steuerung */}
              <div className="modal-section">
                <h3>Sideboard</h3>
                {inSideboard ? (
                  <div className="modal-deck-actions">
                    <div className="quantity-controls">
                      <button onClick={() => onUpdateSideboardQuantity(card.id, sideboardQuantity - 1)}>-</button>
                      <span>{sideboardQuantity}</span>
                      <button onClick={() => onUpdateSideboardQuantity(card.id, sideboardQuantity + 1)}>+</button>
                    </div>
                    <button className="danger" onClick={() => { onRemoveFromSideboard(card.id); onClose(); }}>Entfernen</button>
                  </div>
                ) : (
                  <button onClick={() => { onAddToSideboard(card); onClose(); }}>Ins Sideboard</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;