import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery, stockLevels } from '../store';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  const rawQuery = useStore(searchQuery);
  const query = (rawQuery || '').toLowerCase();
  
  const $stockLevels = useStore(stockLevels) || {};

  // Debugging: Zeigt in der Konsole an, ob Produkte ankommen
  if (!products || products.length === 0) {
    console.log("ProductGrid: Keine Produkte erhalten.");
    return (
      <div className="col-span-full text-center py-20 text-gray-400">
        <p className="text-xl">Keine Produkte gefunden.</p>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    if (!product || !product.name) return false;
    return product.name.toLowerCase().includes(query);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockA = $stockLevels[a.id] !== undefined ? $stockLevels[a.id] : 999;
    const stockB = $stockLevels[b.id] !== undefined ? $stockLevels[b.id] : 999;
    
    if (stockA <= 0 && stockB > 0) return 1;
    if (stockA > 0 && stockB <= 0) return -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
      {sortedProducts.length > 0 ? (
        sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-gray-400">
          <p className="text-xl">Keine Ergebnisse für "{query}"</p>
        </div>
      )}
    </div>
  );
}