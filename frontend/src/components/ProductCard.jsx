import React from 'react';
import { useStore } from '@nanostores/react';
import { addCartItem, stockLevels } from '../store';
import { ShoppingCart, Star, XCircle } from 'lucide-react';

export default function ProductCard({ id, name, price, image }) {
  const $stockLevels = useStore(stockLevels);
  
  // WICHTIG: Wenn $stockLevels[id] undefined ist, lädt die Seite noch.
  // Wir nehmen 999 an (verfügbar), damit beim Reload nichts flackert.
  const stock = $stockLevels[id] !== undefined ? $stockLevels[id] : 999;
  
  // Nur ausverkauft, wenn der Wert wirklich 0 oder kleiner ist
  const isOutOfStock = stock <= 0;

  return (
    <div className={`bg-white rounded-[20px] p-6 shadow-sm transition-all duration-300 flex flex-col justify-between h-[450px] group relative ${isOutOfStock ? 'opacity-80' : 'hover:shadow-xl'}`}>
      
      <a href={`/product/${id}`} className="block flex-1 flex flex-col cursor-pointer">
        <div className="h-48 w-full flex items-center justify-center mb-4 overflow-hidden relative">
          
          {/* Badge nur anzeigen, wenn der Stock wirklich 0 ist (nicht während des Ladens) */}
          {isOutOfStock && $stockLevels[id] !== undefined && (
            <div className="absolute inset-0 z-10 flex items-center justify-center animate-in fade-in duration-300">
              <span className="bg-white/90 text-red-600 px-4 py-2 rounded-full font-black text-xs shadow-xl border border-red-100 uppercase tracking-widest">
                Ausverkauft
              </span>
            </div>
          )}
          
          <img
            src={image}
            alt={name}
            className={`h-full object-contain transition-transform duration-500 ${isOutOfStock ? 'grayscale blur-[1px]' : 'group-hover:scale-110'}`}
          />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-1 mb-2 text-yellow-400">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <span className="text-gray-400 text-xs ml-1">(128)</span>
          </div>

          <h3 className="text-lg font-semibold tracking-tight leading-tight mb-2 text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
            {name}
          </h3>
          
          <p className={`${isOutOfStock ? 'text-red-500' : 'text-gray-500'} text-sm line-clamp-2 mb-4 font-medium`}>
            {isOutOfStock ? 'Aktuell nicht lieferbar' : 'Klicke für Details & Beschreibung...'}
          </p>
        </div>
      </a>

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="block text-xs text-gray-500">Preis</span>
          <span className="text-2xl font-bold">{price.toFixed(2)}€</span>
        </div>
        
        {isOutOfStock ? (
          <div className="bg-gray-100 text-gray-400 rounded-full px-4 py-3 flex items-center gap-2 cursor-not-allowed border border-gray-200">
            <XCircle size={18} />
            <span className="font-bold text-sm">Leer</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
               e.preventDefault(); // Verhindert Link-Aktivierung
               e.stopPropagation();
               addCartItem({ id, name, price, image });
            }}
            // Während die Bestände laden (undefined), machen wir den Button etwas blasser
            className={`bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full p-3 shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2 z-10 ${$stockLevels[id] === undefined ? 'opacity-50' : ''}`}
          >
            <ShoppingCart size={20} />
            <span className="font-medium pr-2 text-sm md:text-base">Kaufen</span>
          </button>
        )}
      </div>
    </div>
  );
}