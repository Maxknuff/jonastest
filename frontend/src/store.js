import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// UI States
export const isCartOpen = atom(false);
export const isSupportOpen = atom(false); 
export const searchQuery = atom('');      

// --- NEU: Lagerbestands-State ---
// Speichert die Bestände vom Server, z.B. { "VAPE12K": 5, "VAPE15K": 0 }
export const stockLevels = atom({}); 

// Lädt die aktuellen Bestände vom Backend (öffentliche Route)
export async function loadStockLevels() {
  try {
    const res = await fetch('http://localhost:5000/api/stock');
    if (!res.ok) throw new Error('Fehler beim Laden der Bestände');
    const data = await res.json();
    
    // Umwandeln von Array [{productId: "X", stock: 5}] zu Objekt {"X": 5}
    const stockMap = {};
    data.forEach(item => {
      stockMap[item.productId] = item.stock;
    });
    
    stockLevels.set(stockMap);
  } catch (err) {
    console.error("Stock Load Error:", err);
  }
}

// Data State (Warenkorb)
export const cartItems = persistentAtom('secure-shop-cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse
});

// ACTIONS
export function addCartItem(product) {
  const currentItems = cartItems.get();
  const $stockLevels = stockLevels.get();
  
  // Finde heraus, wie viel wir maximal von diesem Produkt haben
  // Falls das Produkt nicht in der DB ist, erlauben wir sicherheitshalber den Kauf (Fallback 99)
  const maxAvailable = $stockLevels[product.id] !== undefined ? $stockLevels[product.id] : 99;

  const existingItem = currentItems.find((item) => item.id === product.id);
  const currentQtyInCart = existingItem ? existingItem.quantity : 0;

  // --- BESTANDSPRÜFUNG ---
  if (currentQtyInCart >= maxAvailable) {
    alert(`Leider sind nur ${maxAvailable} Stück von "${product.name}" verfügbar.`);
    return; // Abbruch: Nichts hinzufügen
  }

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

// Hilfsfunktion: Menge direkt setzen (nützlich für das Checkout-Overlay)
export function updateCartQuantity(id, newQuantity) {
  const currentItems = cartItems.get();
  const $stockLevels = stockLevels.get();
  const maxAvailable = $stockLevels[id] !== undefined ? $stockLevels[id] : 99;

  if (newQuantity > maxAvailable) {
    alert(`Maximaler Bestand von ${maxAvailable} erreicht.`);
    return;
  }

  if (newQuantity <= 0) {
    removeCartItem(id);
    return;
  }

  cartItems.set(
    currentItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
  );
}