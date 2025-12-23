import React from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight } from 'lucide-react';

export default function CheckoutOverlay() {
  // Wir hören auf den Store: Ändert sich was, rendert React neu.
  const $isCartOpen = useStore(isCartOpen);
  const $cartItems = useStore(cartItems);

  // Preis berechnen
  const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {$isCartOpen && (
        <>
          {/* Dunkler Hintergrund (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => isCartOpen.set(false)}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Der Slide-In Warenkorb */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col border-l border-neutral-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold tracking-tight">WARENKORB ({$cartItems.length})</h2>
              <button onClick={() => isCartOpen.set(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Items Liste */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {$cartItems.length === 0 ? (
                <p className="text-neutral-500 text-center mt-10">Dein Warenkorb ist leer.</p>
              ) : (
                $cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-neutral-100" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-500">{item.price.toFixed(2)}€</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-neutral-100 px-2 py-1 rounded">Menge: {item.quantity}</span>
                        <button 
                          onClick={() => removeCartItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer mit Checkout Button */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50">
              <div className="flex justify-between mb-4 text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <a 
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-bold hover:bg-neutral-800 transition-colors"
              >
                ZUR KASSE <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}