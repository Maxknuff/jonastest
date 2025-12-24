import React from 'react';
import { addCartItem } from '../store';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  // Fallback, falls keine Beschreibung da ist
  const description = product.description || "Hochwertiges Premium-Produkt.";

  return (
    <div className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      
      {/* Klickbarer Bereich für Details */}
      <a href={`/product/${product.id}`} className="block flex-1">
        <div className="relative aspect-square bg-gray-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">{product.name}</h3>
          
          {/* HIER IST DIE ÄNDERUNG: Echte Beschreibung statt "Klicke für Details" */}
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>

          <div className="text-xl font-bold text-[#1d1d1f]">
            {product.price.toFixed(2)}€
          </div>
        </div>
      </a>

      {/* Button zum Warenkorb */}
      <div className="mt-6 pt-4 border-t border-gray-50">
        <button 
          onClick={(e) => {
            e.preventDefault(); // Verhindert, dass der Link oben ausgelöst wird
            addCartItem(product);
          }}
          className="w-full bg-[#F5F5F7] hover:bg-[#0071E3] hover:text-white text-[#1d1d1f] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <ShoppingBag size={18} />
          In den Warenkorb
        </button>
      </div>

    </div>
  );
}