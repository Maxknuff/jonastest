import React from 'react';
import { addCartItem } from '../store';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ id, name, price, image }) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[450px] group relative">
      
      {/* LINK ZUR DETAILSEITE (Umschließt Bild & Titel) */}
      <a href={`/product/${id}`} className="block flex-1 flex flex-col cursor-pointer">
        
        {/* Bild-Bereich */}
        <div className="h-48 w-full flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Info-Bereich */}
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
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            Klicke für Details & Beschreibung...
          </p>
        </div>
      </a>

      {/* Preis & Action (Außerhalb des Links, damit der Button nicht die Seite wechselt) */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="block text-xs text-gray-500">Preis</span>
          <span className="text-2xl font-bold">{price.toFixed(2)}€</span>
        </div>
        
        <button
          onClick={(e) => {
             e.stopPropagation(); // Verhindert, dass der Klick "durchfällt"
             addCartItem({ id, name, price, image });
          }}
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full p-3 shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2 z-10"
        >
          <ShoppingCart size={20} />
          <span className="font-medium pr-2">Kaufen</span>
        </button>
      </div>
    </div>
  );
}