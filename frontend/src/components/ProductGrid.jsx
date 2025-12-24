import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery } from '../store';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  const query = useStore(searchQuery);

  // Sicherheits-Check, falls products undefined ist
  if (!products) return null;

  // Live Filter-Logik
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          // WICHTIG: Hier übergeben wir das GANZE Produkt-Objekt
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-gray-400">
          <p className="text-xl">Keine Produkte gefunden für "{query}"</p>
        </div>
      )}
    </div>
  );
}