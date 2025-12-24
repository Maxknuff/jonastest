import React from 'react';
import { useStore } from '@nanostores/react';
import { addCartItem, stockLevels } from '../store';
import { ShoppingBag, XCircle, Loader2 } from 'lucide-react';

export default function AddToCartButton({ product }) {
  const $stockLevels = useStore(stockLevels);
  
  // Bestimme den Zustand: 
  // undefined = Lädt noch | Zahl = Echter Bestand
  const currentStock = $stockLevels[product.id];
  const isLoading = currentStock === undefined;
  const isOutOfStock = currentStock === 0;

  // Nur anzeigen, wenn wir SICHER sind, dass der Bestand 0 ist
  if (!isLoading && isOutOfStock) {
    return (
      <div className="w-full bg-gray-50 text-red-500 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed border-2 border-dashed border-red-100 animate-in fade-in zoom-in duration-300">
        <XCircle size={20} /> Produkt aktuell ausverkauft
      </div>
    );
  }

  return (
    <button 
      onClick={() => addCartItem(product)}
      disabled={isLoading}
      className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 
        ${isLoading 
          ? 'bg-gray-200 text-gray-400 cursor-wait shadow-none' 
          : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-blue-500/30 hover:scale-[1.02] active:scale-95'
        }`}
    >
      {isLoading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Bestand wird geprüft...
        </>
      ) : (
        <>
          <ShoppingBag size={20} />
          In den Warenkorb
        </>
      )}
    </button>
  );
}