import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery, stockLevels } from '../store';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  // FEHLER-FIX: Falls query undefined ist, nutzen wir einen leeren Text ''
  const rawQuery = useStore(searchQuery);
  const query = (rawQuery || '').toLowerCase();
  
  const $stockLevels = useStore(stockLevels);

  // Sicherheits-Check: Falls gar keine Produkte da sind, nichts tun
  if (!products) return null;

  // 1. Filtern (Suche) - Jetzt absturzsicher!
  const filteredProducts = products.filter(product => {
    // Wenn Produkt keinen Namen hat, ignorieren wir es
    if (!product || !product.name) return false;
    return product.name.toLowerCase().includes(query);
  });

  // 2. Sortieren (Ausverkaufte nach hinten)
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
          <p className="text-xl">Keine Produkte gefunden.</p>
        </div>
      )}
    </div>
  );
}