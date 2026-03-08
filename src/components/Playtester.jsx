import React, { useState } from 'react';
import { getCardImage } from '../utils/cardHelpers';

// Hilfsfunktion: power/toughness als Zahl parsen (falls möglich, sonst 0)
const parsePower = (power) => {
  if (!power) return 0;
  const num = parseInt(power, 10);
  return isNaN(num) ? 0 : num;
};

// Deck aus mainDeck + lands in eine flache Liste mit Instanz-ID umwandeln
const flattenDeck = (mainDeck, lands) => {
  const cards = [];
  mainDeck.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      cards.push({
        ...item.card,
        instanceId: `${item.card.id}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  });
  lands.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      cards.push({
        ...item.card,
        instanceId: `${item.card.id}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  });
  return cards;
};

// Mischen (Fisher-Yates)
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Playtester = ({ mainDeck, lands, onClose }) => {
  const [gameState, setGameState] = useState(() => {
    const library = shuffle(flattenDeck(mainDeck, lands));
    const hand = library.splice(0, 7);
    return {
      library,
      hand,
      battlefield: [],
      graveyard: [],
      manaPool: { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 },
      playerLife: 20,
      opponentLife: 20,
      landPlayedThisTurn: false,
      attackers: [], // instanceIds der angreifenden Kreaturen
      tappedPermanents: new Set(),
      phase: 'main',
    };
  });

  // Karte ziehen
  const drawCard = () => {
    if (gameState.library.length === 0) return;
    setGameState(prev => {
      const newLibrary = [...prev.library];
      const drawn = newLibrary.shift();
      return {
        ...prev,
        library: newLibrary,
        hand: [...prev.hand, drawn],
      };
    });
  };

  // Land spielen
  const playLand = (card) => {
    if (gameState.landPlayedThisTurn) return;
    if (!card.type_line?.toLowerCase().includes('land')) return;

    setGameState(prev => ({
      ...prev,
      hand: prev.hand.filter(c => c.instanceId !== card.instanceId),
      battlefield: [...prev.battlefield, { ...card, type: 'land' }],
      landPlayedThisTurn: true,
    }));
  };

  // Mana von einem Land erzeugen (tappen)
  const tapLand = (card) => {
    if (gameState.tappedPermanents.has(card.instanceId)) return;

    let colors = [];
    if (card.type_line?.includes('Basic')) {
      if (card.name.includes('Plains')) colors = ['w'];
      else if (card.name.includes('Island')) colors = ['u'];
      else if (card.name.includes('Swamp')) colors = ['b'];
      else if (card.name.includes('Mountain')) colors = ['r'];
      else if (card.name.includes('Forest')) colors = ['g'];
      else colors = ['c'];
    } else {
      colors = card.color_identity ? card.color_identity.map(c => c.toLowerCase()) : ['c'];
    }
    const chosenColor = colors[0] || 'c';

    setGameState(prev => {
      const newTapped = new Set(prev.tappedPermanents);
      newTapped.add(card.instanceId);
      const newMana = { ...prev.manaPool };
      newMana[chosenColor] += 1;
      return {
        ...prev,
        tappedPermanents: newTapped,
        manaPool: newMana,
      };
    });
  };

  // Kreatur oder andere bleibende Karte wirken
  const castPermanent = (card) => {
    if (!card.cmc) return;
    const totalMana = Object.values(gameState.manaPool).reduce((a, b) => a + b, 0);
    if (totalMana < card.cmc) return;

    let remaining = card.cmc;
    const newMana = { ...gameState.manaPool };
    const colors = ['w', 'u', 'b', 'r', 'g', 'c'];
    for (let color of colors) {
      if (remaining <= 0) break;
      const take = Math.min(newMana[color], remaining);
      newMana[color] -= take;
      remaining -= take;
    }
    if (remaining > 0) return;

    setGameState(prev => ({
      ...prev,
      hand: prev.hand.filter(c => c.instanceId !== card.instanceId),
      battlefield: [...prev.battlefield, { ...card, type: 'permanent' }],
      manaPool: newMana,
    }));
  };

  // Angreifer togglen (hinzufügen/entfernen)
  const toggleAttacker = (card) => {
    if (gameState.phase !== 'combat') return;
    if (!card.power) return;

    setGameState(prev => {
      const isAttacking = prev.attackers.includes(card.instanceId);
      const isTapped = prev.tappedPermanents.has(card.instanceId);

      if (isAttacking) {
        // Abwählen und enttappen
        return {
          ...prev,
          attackers: prev.attackers.filter(id => id !== card.instanceId),
          tappedPermanents: new Set([...prev.tappedPermanents].filter(id => id !== card.instanceId)),
        };
      } else {
        // Hinzufügen, wenn nicht getappt
        if (isTapped) return prev;
        return {
          ...prev,
          attackers: [...prev.attackers, card.instanceId],
          tappedPermanents: new Set([...prev.tappedPermanents, card.instanceId]),
        };
      }
    });
  };

  // Kampf auflösen
  const resolveCombat = () => {
    const totalDamage = gameState.attackers.reduce((sum, id) => {
      const creature = gameState.battlefield.find(c => c.instanceId === id);
      // power als Zahl parsen
      const power = parsePower(creature?.power);
      return sum + power;
    }, 0);

    setGameState(prev => ({
      ...prev,
      opponentLife: prev.opponentLife - totalDamage,
      attackers: [], // Angreifer zurücksetzen
    }));
  };

  // Manuelle Schadensanpassung am Gegner
  const adjustOpponentLife = (delta) => {
    setGameState(prev => ({
      ...prev,
      opponentLife: prev.opponentLife + delta,
    }));
  };

  // Zug beenden
  const endTurn = () => {
    setGameState(prev => {
      const newLibrary = [...prev.library];
      const drawn = newLibrary.shift();
      return {
        ...prev,
        library: newLibrary,
        hand: drawn ? [...prev.hand, drawn] : prev.hand,
        tappedPermanents: new Set(),
        manaPool: { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 },
        landPlayedThisTurn: false,
        attackers: [],
        phase: 'main',
      };
    });
  };

  // Mana reduzieren
  const reduceMana = (color) => {
    setGameState(prev => ({
      ...prev,
      manaPool: {
        ...prev.manaPool,
        [color]: Math.max(0, prev.manaPool[color] - 1)
      }
    }));
  };

  // Spiel zurücksetzen
  const resetGame = () => {
    const library = shuffle(flattenDeck(mainDeck, lands));
    const hand = library.splice(0, 7);
    setGameState({
      library,
      hand,
      battlefield: [],
      graveyard: [],
      manaPool: { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 },
      playerLife: 20,
      opponentLife: 20,
      landPlayedThisTurn: false,
      attackers: [],
      tappedPermanents: new Set(),
      phase: 'main',
    });
  };

  // Klick auf Handkarte
  const handleCardClick = (card) => {
    if (card.type_line?.toLowerCase().includes('land')) {
      playLand(card);
    } else {
      castPermanent(card);
    }
  };

  // Gesamtstärke der Angreifer (als Zahl)
  const totalAttackerPower = gameState.attackers.reduce((sum, id) => {
    const creature = gameState.battlefield.find(c => c.instanceId === id);
    return sum + parsePower(creature?.power);
  }, 0);

  return (
    <div className="playtester-modal">
      <div className="playtester-header">
        <h2>Deck-Test (Goldfisch-Modus)</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="playtester-board">
        {/* Gegner */}
        <div className="opponent-area">
          <div className="life-total opponent-life">
            Gegner: {gameState.opponentLife}
            <div className="opponent-life-controls">
              <button className="small-button" onClick={() => adjustOpponentLife(1)}>+1</button>
              <button className="small-button" onClick={() => adjustOpponentLife(-1)}>-1</button>
            </div>
          </div>
        </div>

        {/* Spieler */}
        <div className="player-area">
          <div className="player-stats">
            <span>Leben: {gameState.playerLife}</span>
            <span>Bibliothek: {gameState.library.length}</span>
            <span>Phase: {gameState.phase === 'main' ? 'Hauptphase' : 'Kampfphase'}</span>
            <button className="big-button" onClick={drawCard}>Karte ziehen</button>
            <button className="big-button" onClick={endTurn}>Zug beenden</button>
            <button className="big-button" onClick={resetGame}>Reset</button>
          </div>

          {/* Manapool mit Reduzier-Buttons */}
          <div className="mana-pool">
            <strong>Mana:</strong>
            <div className="mana-symbols">
              {gameState.manaPool.w > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/W.svg" alt="W" /> {gameState.manaPool.w}
                  <button className="mana-reduce" onClick={() => reduceMana('w')}>-</button>
                </span>
              )}
              {gameState.manaPool.u > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/U.svg" alt="U" /> {gameState.manaPool.u}
                  <button className="mana-reduce" onClick={() => reduceMana('u')}>-</button>
                </span>
              )}
              {gameState.manaPool.b > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/B.svg" alt="B" /> {gameState.manaPool.b}
                  <button className="mana-reduce" onClick={() => reduceMana('b')}>-</button>
                </span>
              )}
              {gameState.manaPool.r > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/R.svg" alt="R" /> {gameState.manaPool.r}
                  <button className="mana-reduce" onClick={() => reduceMana('r')}>-</button>
                </span>
              )}
              {gameState.manaPool.g > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/G.svg" alt="G" /> {gameState.manaPool.g}
                  <button className="mana-reduce" onClick={() => reduceMana('g')}>-</button>
                </span>
              )}
              {gameState.manaPool.c > 0 && (
                <span className="mana-item">
                  <img src="https://svgs.scryfall.io/card-symbols/C.svg" alt="C" /> {gameState.manaPool.c}
                  <button className="mana-reduce" onClick={() => reduceMana('c')}>-</button>
                </span>
              )}
              {Object.values(gameState.manaPool).every(v => v === 0) && <span>0</span>}
            </div>
          </div>

          {/* Hand */}
          <div className="hand">
            <h3>Hand ({gameState.hand.length})</h3>
            <div className="hand-cards">
              {gameState.hand.map(card => (
                <div key={card.instanceId} className="hand-card" onClick={() => handleCardClick(card)}>
                  <img src={getCardImage(card)} alt={card.name} />
                  <div className="card-name">{card.name}</div>
                </div>
              ))}
              {gameState.hand.length === 0 && <p>Keine Karten auf der Hand</p>}
            </div>
          </div>

          {/* Battlefield */}
          <div className="battlefield">
            <h3>Battlefield</h3>
            <div className="battlefield-lanes">
              {/* Länder */}
              <div className="lands">
                <h4>Länder</h4>
                <div className="land-cards">
                  {gameState.battlefield.filter(c => c.type === 'land').map(card => (
                    <div
                      key={card.instanceId}
                      className={`battlefield-card ${gameState.tappedPermanents.has(card.instanceId) ? 'tapped' : ''}`}
                      onClick={() => tapLand(card)}
                    >
                      <img src={getCardImage(card)} alt={card.name} />
                      <div className="card-name">{card.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permanente */}
              <div className="permanents">
                <h4>Permanente</h4>
                <div className="permanent-cards">
                  {gameState.battlefield.filter(c => c.type !== 'land').map(card => (
                    <div
                      key={card.instanceId}
                      className={`battlefield-card ${gameState.tappedPermanents.has(card.instanceId) ? 'tapped' : ''} ${gameState.attackers.includes(card.instanceId) ? 'attacking' : ''}`}
                      onClick={() => toggleAttacker(card)}
                    >
                      <img src={getCardImage(card)} alt={card.name} />
                      <div className="card-name">{card.name}</div>
                      {card.power && (
                        <div className="power-toughness">
                          {card.power}/{card.toughness}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Friedhof */}
          <div className="graveyard">
            <h3>Friedhof ({gameState.graveyard.length})</h3>
          </div>

          {/* Angreifer-Vorschau */}
          {gameState.phase === 'combat' && (
            <div className="combat-preview">
              <strong>Angreifer ({gameState.attackers.length}): Gesamtstärke {totalAttackerPower}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Kampf-Button */}
      {gameState.phase === 'combat' && (
        <div className="combat-controls">
          <button className="big-button" onClick={resolveCombat}>
            Angriff abschließen ({totalAttackerPower} Schaden)
          </button>
        </div>
      )}

      {/* Phasenwechsel */}
      <div className="phase-controls">
        {gameState.phase === 'main' && (
          <button className="big-button" onClick={() => setGameState(prev => ({ ...prev, phase: 'combat' }))}>
            Zur Kampfphase
          </button>
        )}
        {gameState.phase === 'combat' && (
          <button className="big-button" onClick={() => setGameState(prev => ({ ...prev, phase: 'main' }))}>
            Zur Hauptphase
          </button>
        )}
      </div>

      {/* Mana-Erzeugung (manuell) */}
      <div className="manual-mana">
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, w: prev.manaPool.w + 1 } }))}>+W</button>
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, u: prev.manaPool.u + 1 } }))}>+U</button>
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, b: prev.manaPool.b + 1 } }))}>+B</button>
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, r: prev.manaPool.r + 1 } }))}>+R</button>
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, g: prev.manaPool.g + 1 } }))}>+G</button>
        <button className="mana-button" onClick={() => setGameState(prev => ({ ...prev, manaPool: { ...prev.manaPool, c: prev.manaPool.c + 1 } }))}>+C</button>
      </div>
    </div>
  );
};

export default Playtester;