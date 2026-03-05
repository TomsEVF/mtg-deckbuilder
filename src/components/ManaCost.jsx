import React from 'react';

const ManaCost = ({ manaCost }) => {
  if (!manaCost) return null;
  const symbols = manaCost.match(/\{([^}]+)\}/g) || [];
  return (
    <div className="mana-cost-icons">
      {symbols.map((symbol, index) => {
        const code = symbol.slice(1, -1);
        const url = `https://svgs.scryfall.io/card-symbols/${code}.svg`;
        return (
          <img
            key={index}
            src={url}
            alt={code}
            title={code}
            className="mana-symbol-icon"
            onError={(e) => e.target.style.display = 'none'}
          />
        );
      })}
    </div>
  );
};

export default ManaCost;