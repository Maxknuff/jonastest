import React from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function CheckoutOverlay() {
  const $isCartOpen = useStore(isCartOpen);
  const $cartItems = useStore(cartItems);

  const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {$isCartOpen && (
        <>
          {/* Backdrop: Sanfter Blur statt hartem Schwarz */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => isCartOpen.set(false)}
            className="fixed inset-0 bg-[#323232]/30 backdrop-blur-sm z-40"
          />

          {/* Panel: Apple Style Floating Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white/90 backdrop-blur-xl z-50 shadow-2xl flex flex-col p-6 sm:m-4 sm:h-[calc(100%-2rem)] sm:rounded-3xl border border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Warenkorb</h2>
              <button 
                onClick={() => isCartOpen.set(false)} 
                className="bg-[#e8e8ed] p-2 rounded-full text-[#1d1d1f] hover:bg-[#d2d2d7] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {$cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                  <p>Dein Einkaufswagen ist leer.</p>
                </div>
              ) : (
                $cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                       <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1d1d1f]">{item.name}</h4>
                      <p className="text-sm text-[#86868b]">{item.price.toFixed(2)} €</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium bg-[#f5f5f7] px-2 py-1 rounded-md text-[#1d1d1f]">x{item.quantity}</span>
                        <button onClick={() => removeCartItem(item.id)} className="text-[#0071e3] text-xs hover:underline">
                          Entfernen
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-[#d2d2d7]/30">
              <div className="flex justify-between mb-6 text-xl font-semibold text-[#1d1d1f]">
                <span>Gesamt</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <a 
                href="/checkout"
                className="block w-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-center py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Zur Kasse
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}