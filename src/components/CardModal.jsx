import React, { useState } from 'react';
import ManaCost from './ManaCost';
import { getCardImage } from '../utils/cardHelpers';

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

  const isDoubleFaced = card.card_faces && card.card_faces.length > 1;
  const [hover, setHover] = useState(false);

  // Angezeigte Seite für das Bild: Hover zeigt Rückseite (1), sonst Vorderseite (0)
  const displayedFace = isDoubleFaced && hover ? 1 : 0;

  // Bild-URL je nach Hover
  const imageUrl = isDoubleFaced
    ? card.card_faces[displayedFace].image_uris?.normal
    : getCardImage(card, 'normal');

  // Bei doppelseitigen Karten sammeln wir Daten beider Seiten für die Anzeige
  const renderDoubleFacedDetails = () => {
    const faces = card.card_faces;
    return (
      <div className="double-faced-details">
        {/* Vorderseite */}
        <div className="card-face-detail">
          <h4>{faces[0].name} (Vorderseite)</h4>
          {faces[0].mana_cost && <ManaCost manaCost={faces[0].mana_cost} />}
          <p className="modal-type">{faces[0].type_line}</p>
          {faces[0].oracle_text && (
            <div className="modal-text">
              {faces[0].oracle_text.split('\n').map((line, i) => <p key={`face0-${i}`}>{line}</p>)}
            </div>
          )}
          {faces[0].power && <p className="modal-pt">Stärke/Widerstand: {faces[0].power}/{faces[0].toughness}</p>}
        </div>

        {/* Rückseite */}
        <div className="card-face-detail">
          <h4>{faces[1].name} (Rückseite)</h4>
          {faces[1].mana_cost && <ManaCost manaCost={faces[1].mana_cost} />}
          <p className="modal-type">{faces[1].type_line}</p>
          {faces[1].oracle_text && (
            <div className="modal-text">
              {faces[1].oracle_text.split('\n').map((line, i) => <p key={`face1-${i}`}>{line}</p>)}
            </div>
          )}
          {faces[1].power && <p className="modal-pt">Stärke/Widerstand: {faces[1].power}/{faces[1].toughness}</p>}
        </div>
      </div>
    );
  };

  // Normale Karte: nur eine Seite
  const renderNormalDetails = () => (
    <>
      <h2>{card.name}</h2>
      {card.mana_cost && <ManaCost manaCost={card.mana_cost} />}
      <p className="modal-type">{card.type_line}</p>
      {card.oracle_text && (
        <div className="modal-text">
          {card.oracle_text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}
      {card.power && <p className="modal-pt">Stärke/Widerstand: {card.power}/{card.toughness}</p>}
    </>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          {/* Bildbereich mit Hover-Effekt */}
          {imageUrl && (
            <div
              className="modal-image"
              onMouseEnter={() => isDoubleFaced && setHover(true)}
              onMouseLeave={() => isDoubleFaced && setHover(false)}
            >
              <img src={imageUrl} alt={card.name} />
            </div>
          )}

          {/* Detailsbereich */}
          <div className="modal-details">
            {isDoubleFaced ? (
              <>
                {/* Bei doppelseitigen Karten zeigen wir den kombinierten Namen ganz oben */}
                <h2>{card.name}</h2>
                {renderDoubleFacedDetails()}
              </>
            ) : (
              renderNormalDetails()
            )}

            {/* Aktionsbereich (Hauptdeck/Sideboard) */}
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