import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery, stockLevels } from '../store'; // stockLevels importieren
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  const query = useStore(searchQuery);
  const $stockLevels = useStore(stockLevels); // Live-Bestände laden

  // Sicherheits-Check
  if (!products) return null;

  // 1. Filtern (Suche)
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  // 2. Sortieren (Ausverkaufte nach hinten)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Wir holen den Bestand für Produkt A und B
    // Falls Bestand noch lädt (undefined), nehmen wir an es ist verfügbar (999),
    // damit die Produkte nicht wild herumspringen.
    const stockA = $stockLevels[a.id] !== undefined ? $stockLevels[a.id] : 999;
    const stockB = $stockLevels[b.id] !== undefined ? $stockLevels[b.id] : 999;

    const isOutA = stockA <= 0;
    const isOutB = stockB <= 0;

    // Logik: 
    // Wenn A ausverkauft ist und B nicht -> B kommt zuerst (return 1 schiebt A nach hinten)
    if (isOutA && !isOutB) return 1;
    // Wenn A da ist und B ausverkauft -> A kommt zuerst (return -1 schiebt A nach vorne)
    if (!isOutA && isOutB) return -1;
    
    // Ansonsten behalten wir die Reihenfolge bei
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