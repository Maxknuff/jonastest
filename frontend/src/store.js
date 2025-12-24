import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// Die API-URL wird automatisch von Vercel (online) oder deiner .env (lokal) genommen
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

// UI States
export const isCartOpen = atom(false);
export const isSupportOpen = atom(false); 
export const searchQuery = atom('');      

// --- NEU: Lagerbestands-State ---
export const stockLevels = atom({}); 

// Lädt die aktuellen Bestände vom Backend
export async function loadStockLevels() {
  try {
    // Nutze die dynamische API_URL
    const res = await fetch(`${API_URL}/api/stock`);
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
  
  // Bestandsprüfung
  const maxAvailable = $stockLevels[product.id] !== undefined ? $stockLevels[product.id] : 0;

  const existingItem = currentItems.find((item) => item.id === product.id);
  const currentQtyInCart = existingItem ? existingItem.quantity : 0;

  if (currentQtyInCart >= maxAvailable) {
    alert(`Leider sind nur ${maxAvailable} Stück von "${product.name}" verfügbar.`);
    return; 
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

export function updateCartQuantity(id, newQuantity) {
  const currentItems = cartItems.get();
  const $stockLevels = stockLevels.get();
  const maxAvailable = $stockLevels[id] !== undefined ? $stockLevels[id] : 0;

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