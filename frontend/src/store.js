import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// 1. UI State: Ist der Warenkorb offen oder zu? (Nicht persistent)
export const isCartOpen = atom(false);

// 2. Data State: Der Inhalt des Warenkorbs (Persistent im LocalStorage)
// Wir speichern ein Array von Objekten.
// Key 'secure-shop-cart' ist der Name im Browser-Speicher.
export const cartItems = persistentAtom('secure-shop-cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse
});

// --- ACTIONS (Funktionen zum Ändern des State) ---

// Produkt hinzufügen
export function addCartItem(product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find((item) => item.id === product.id);

  if (existingItem) {
    // Wenn schon drin -> Menge +1
    cartItems.set(
      currentItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Wenn neu -> Hinzufügen mit Menge 1
    cartItems.set([...currentItems, { ...product, quantity: 1 }]);
  }
  
  // Warenkorb öffnen, um Feedback zu geben
  isCartOpen.set(true);
}

// Produkt entfernen
export function removeCartItem(id) {
  const currentItems = cartItems.get();
  cartItems.set(currentItems.filter((item) => item.id !== id));
}