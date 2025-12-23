import React from 'react';
import { useStore } from '@nanostores/react';
import { addCartItem, stockLevels } from '../store';
import { ShoppingBag, XCircle } from 'lucide-react';

export default function AddToCartButton({ product }) {
  const $stockLevels = useStore(stockLevels);
  const stock = $stockLevels[product.id] !== undefined ? $stockLevels[product.id] : 999;
  const isOutOfStock = stock <= 0;

  if (isOutOfStock) {
    return (
      <div className="w-full bg-gray-100 text-gray-500 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed border-2 border-dashed border-gray-200">
        <XCircle size={20} /> Produkt aktuell ausverkauft
      </div>
    );
  }

  return (
    <button 
      onClick={() => addCartItem(product)}
      className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
    >
      <ShoppingBag size={20} /> In den Warenkorb
    </button>
  );
}