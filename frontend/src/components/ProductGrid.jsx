import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery, stockLevels } from '../store';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  // Sicherstellen, dass query immer ein String ist
  const rawQuery = useStore(searchQuery);
  const query = (rawQuery || '').toLowerCase();
  
  const $stockLevels = useStore(stockLevels);

  if (!products) return null;

  // FIX: Filtern (Absturzsicher!)
  const filteredProducts = products.filter(product => {
    // Wenn Produkt oder Name fehlt, überspringen
    if (!product || !product.name) return false;
    return product.name.toLowerCase().includes(query);
  });

  // Sortieren
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockA = $stockLevels[a.id] !== undefined ? $stockLevels[a.id] : 999;
    const stockB = $stockLevels[b.id] !== undefined ? $stockLevels[b.id] : 999;

    const isOutA = stockA <= 0;
    const isOutB = stockB <= 0;

    if (isOutA && !isOutB) return 1;
    if (!isOutA && isOutB) return -1;
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
          <p className="text-xl">Keine Produkte gefunden für "{query}"</p>
        </div>
      )}
    </div>
  );
}