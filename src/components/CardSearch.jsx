import { useState, useEffect } from 'react';
import creatureTypesDe from '../data/creatureTypes_de';
import keywordsDe from '../data/keywords_de';
import ManaCost from './ManaCost';
import { getCardImage, getManaCost } from '../utils/cardHelpers';

const colorOptions = [
  { value: 'w', label: 'Weiß', symbol: 'W' },
  { value: 'u', label: 'Blau', symbol: 'U' },
  { value: 'b', label: 'Schwarz', symbol: 'B' },
  { value: 'r', label: 'Rot', symbol: 'R' },
  { value: 'g', label: 'Grün', symbol: 'G' },
  { value: 'c', label: 'Farblos', symbol: 'C' },
];

const typeOptions = [
  { value: '', label: 'Typ (alle)' },
  { value: 'creature', label: 'Kreatur' },
  { value: 'instant', label: 'Spontanzauber' },
  { value: 'sorcery', label: 'Hexerei' },
  { value: 'enchantment', label: 'Verzauberung' },
  { value: 'artifact', label: 'Artefakt' },
  { value: 'planeswalker', label: 'Planewalker' },
  { value: 'land', label: 'Land' },
];

const operatorOptions = [
  { value: '=', label: '=' },
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '<=', label: '<=' },
  { value: '>=', label: '>=' },
];

const rarityOptions = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'mythic', label: 'Mythic' },
];

const CardSearch = ({ onAddToDeck, onOpenModal }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [cardType, setCardType] = useState('');
  const [cmcOperator, setCmcOperator] = useState('=');
  const [cmcValue, setCmcValue] = useState('');
  const [creatureType, setCreatureType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [rarity, setRarity] = useState('');

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetColors = () => setSelectedColors([]);

  const buildQuery = () => {
    const parts = [];
    if (query) parts.push(query);
    if (selectedColors.length > 0) {
      if (selectedColors.includes('c')) {
        parts.push('c:c');
      } else {
        const colorString = selectedColors.sort().join('');
        parts.push(`c=${colorString}`);
      }
    }
    if (cardType) parts.push(`type:${cardType}`);
    if (cmcValue && !isNaN(cmcValue)) parts.push(`cmc${cmcOperator}${cmcValue}`);
    if (creatureType) parts.push(`t:${creatureType}`);
    if (keyword) parts.push(`keyword:${keyword}`);
    if (rarity) parts.push(`r:${rarity}`);
    return parts.join(' ');
  };

  useEffect(() => {
    const searchQuery = buildQuery();
    if (!searchQuery) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);
      fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'User-Agent': 'MTGDeckBuilder/1.0' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            // Sortierung nach Manakosten (CMC) aufsteigend
            const sorted = [...data.data].sort((a, b) => (a.cmc || 0) - (b.cmc || 0));
            setResults(sorted);
          } else {
            setResults([]);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delay);
  }, [query, selectedColors, cardType, cmcOperator, cmcValue, creatureType, keyword, rarity]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Kartennamen oder Text suchen..."
      />

      {/* Farbauswahl */}
      <div className="mana-color-picker">
        <button className="mana-color-btn" onClick={resetColors} title="Alle Farben zurücksetzen">
          <span>Alle</span>
        </button>
        {colorOptions.map(opt => (
          <button
            key={opt.value}
            className={`mana-color-btn ${selectedColors.includes(opt.value) ? 'active' : ''}`}
            onClick={() => toggleColor(opt.value)}
            title={opt.label}
          >
            <img
              src={`https://svgs.scryfall.io/card-symbols/${opt.symbol}.svg`}
              alt={opt.label}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = opt.symbol; }}
            />
          </button>
        ))}
      </div>

      {/* Seltenheitsfilter */}
      <div className="rarity-picker">
        <button
          className={`rarity-btn ${rarity === '' ? 'active' : ''}`}
          onClick={() => setRarity('')}
        >
          Alle
        </button>
        {rarityOptions.map(opt => (
          <button
            key={opt.value}
            className={`rarity-btn ${rarity === opt.value ? 'active' : ''}`}
            onClick={() => setRarity(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Weitere Filter */}
      <div className="filters">
        <div className="filter-group cmc-filter">
          <span className="cmc-label">CMC</span>
          <select value={cmcOperator} onChange={e => setCmcOperator(e.target.value)} className="filter-select">
            {operatorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input
            type="number"
            value={cmcValue}
            onChange={e => setCmcValue(e.target.value)}
            placeholder="Wert"
            className="filter-input"
            min="0"
          />
        </div>

        <select value={cardType} onChange={e => setCardType(e.target.value)} className="filter-select">
          {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <select
          value={creatureType}
          onChange={e => setCreatureType(e.target.value)}
          className="filter-select"
        >
          <option value="">Kreaturentyp (alle)</option>
          {Object.entries(creatureTypesDe)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([en, de]) => <option key={en} value={en}>{de}</option>)}
        </select>

        <select
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="filter-select"
        >
          <option value="">Schlagwort (alle)</option>
          {Object.entries(keywordsDe)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([en, de]) => <option key={en} value={en}>{de}</option>)}
        </select>
      </div>

      {loading && <p>Suche...</p>}
      <div className="card-grid">
        {results.map(card => (
          <div key={card.id} className="card-item">
            <div
              className="card-main"
              onClick={() => onAddToDeck(card)}
              style={{ cursor: 'pointer' }}
            >
              {getCardImage(card) ? (
                <img src={getCardImage(card)} alt={card.name} />
              ) : (
                <div style={{ height: '100px', background: '#3498db', borderRadius: '8px' }} />
              )}
              <div className="card-name">{card.name}</div>
              <ManaCost manaCost={getManaCost(card)} />
            </div>
            <button
              className="card-info-btn"
              onClick={(e) => { e.stopPropagation(); onOpenModal(card); }}
              title="Details anzeigen"
            >
              ℹ️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSearch;