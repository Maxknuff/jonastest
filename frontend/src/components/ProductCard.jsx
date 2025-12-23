import React from 'react';
import { addCartItem } from '../store';
import { Plus } from 'lucide-react';

export default function ProductCard({ id, name, price, image }) {
  return (
    <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500 ease-out flex flex-col items-center text-center h-[500px]">
      
      {/* "New" Badge - optional, aber typisch Apple */}
      <span className="text-orange-500 text-xs font-semibold tracking-wide uppercase mb-2">Neu</span>

      <h3 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
        {name}
      </h3>
      
      <p className="text-[#1d1d1f] text-lg mb-8">
        Professionelle Sicherheit.<br/>Ab {price.toFixed(2)}€
      </p>

      {/* Bild Container - Nutzt den Platz maximal aus */}
      <div className="flex-1 w-full flex items-center justify-center mb-8 relative">
        <img
          src={image}
          alt={name}
          className="max-h-64 w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Button: Apple Blue Pill */}
      <div className="mt-auto">
        <button
          onClick={() => addCartItem({ id, name, price, image })}
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-6 py-2 font-medium text-sm flex items-center gap-2 transition-colors"
        >
          Hinzufügen <Plus size={16} />
        </button>
      </div>
    </div>
  );
}