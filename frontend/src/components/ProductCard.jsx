import React from 'react';
import { addCartItem } from '../store';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ id, name, price, image }) {
  return (
    <div className="group relative border border-neutral-200 bg-white hover:border-black transition-colors duration-300">
      {/* BILD BEREICH */}
      <div className="aspect-square w-full overflow-hidden bg-neutral-100 relative">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* ADD TO CART BUTTON (Erscheint nur beim Hovern auf Desktop, oder immer sichtbar mobil) */}
        <button
          onClick={() => addCartItem({ id, name, price, image })}
          className="absolute bottom-4 right-4 bg-black text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-neutral-800"
          aria-label="Add to cart"
        >
          <ShoppingBag size={20} />
        </button>
      </div>

      {/* INFO BEREICH */}
      <div className="p-4 border-t border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-900 tracking-tight uppercase">
          {name}
        </h3>
        <p className="mt-1 text-sm text-neutral-500 font-mono">
          {price.toFixed(2)}€
        </p>
      </div>
    </div>
  );
}