const DeckList = ({ deck, onRemove, onUpdateQuantity, onOpenModal }) => {
  return (
    <ul className="deck-list">
      {deck.map(({ card, quantity }) => (
        <li key={card.id} className="deck-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, cursor: 'pointer' }} onClick={() => onOpenModal(card)}>
            {card.image_uris?.small ? (
              <img src={card.image_uris.small} alt={card.name} />
            ) : (
              <div style={{ width: '40px', height: '40px', background: '#3498db', borderRadius: '6px' }} />
            )}
            <span style={{ fontWeight: 'bold' }}>{card.name}</span>
          </div>
          <div className="deck-item-info">
            <div className="quantity-controls">
              <button onClick={() => onUpdateQuantity(card.id, quantity - 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => onUpdateQuantity(card.id, quantity + 1)}>+</button>
              <button className="remove-btn" onClick={() => onRemove(card.id)}>×</button>
            </div>
          </div>
        </li>
      ))}
      {deck.length === 0 && (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
          Noch keine Karten im Deck. Füge welche über die Suche hinzu!
        </p>
      )}
    </ul>
  );
};

export default DeckList;