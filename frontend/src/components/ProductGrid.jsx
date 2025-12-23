import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery } from '../store';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  const query = useStore(searchQuery);

  // Live Filter-Logik
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id} 
            name={product.name} 
            price={product.price} 
            image={product.image} 
          />
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-gray-400">
          <p className="text-xl">Keine Produkte gefunden für "{query}"</p>
        </div>
      )}
    </div>
  );
}