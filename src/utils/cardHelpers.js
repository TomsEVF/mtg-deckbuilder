// Gibt die Bild-URL einer Karte zurück (bevorzugt Vorderseite)
export const getCardImage = (card, size = 'small') => {
  // Normale Karte
  if (card.image_uris && card.image_uris[size]) {
    return card.image_uris[size];
  }
  // Doppelseitige Karte: nimm die erste Seite (Vorderseite)
  if (card.card_faces && card.card_faces[0] && card.card_faces[0].image_uris && card.card_faces[0].image_uris[size]) {
    return card.card_faces[0].image_uris[size];
  }
  return null;
};

// Gibt den Namen der Karte zurück (bei doppelseitigen den kombinierten Namen)
export const getCardName = (card) => {
  return card.name;
};

// Gibt den Manakosten-String zurück (bei doppelseitigen die der Vorderseite, oder kombiniert?)
export const getManaCost = (card) => {
  if (card.mana_cost) return card.mana_cost;
  if (card.card_faces && card.card_faces[0]) return card.card_faces[0].mana_cost;
  return null;
};