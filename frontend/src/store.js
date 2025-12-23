import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// UI States
export const isCartOpen = atom(false);
export const isSupportOpen = atom(false); // NEU: Support Fenster Status
export const searchQuery = atom('');      // NEU: Suchbegriff

// Data State (Warenkorb)
export const cartItems = persistentAtom('secure-shop-cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse
});

// ACTIONS
export function addCartItem(product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find((item) => item.id === product.id);

  if (existingItem) {
    cartItems.set(
      currentItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  } else {
    cartItems.set([...currentItems, { ...product, quantity: 1 }]);
  }
  isCartOpen.set(true);
}

export function removeCartItem(id) {
  const currentItems = cartItems.get();
  cartItems.set(currentItems.filter((item) => item.id !== id));
}