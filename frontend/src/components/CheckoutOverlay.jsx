import React from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, Lock } from 'lucide-react';

export default function CheckoutOverlay() {
  const $isCartOpen = useStore(isCartOpen);
  const $cartItems = useStore(cartItems);
  const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {$isCartOpen && (
        <>
          {/* Backdrop (Dunkler Hintergrund) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => isCartOpen.set(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Warenkorb Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white/90 backdrop-blur-xl z-50 shadow-2xl flex flex-col border-l border-white/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-[#1D1D1F]">Dein Einkauf</h2>
              <button 
                onClick={() => isCartOpen.set(false)} 
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {$cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingBag size={48} className="mb-4 opacity-50"/>
                  <p>Dein Warenkorb ist leer.</p>
                </div>
              ) : (
                $cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1D1D1F]">{item.name}</h4>
                      <p className="text-blue-600 font-medium">{item.price.toFixed(2)}€</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">x{item.quantity}</span>
                      <button onClick={() => removeCartItem(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/50 border-t border-gray-200/50">
              <div className="flex justify-between mb-6 text-xl font-bold">
                <span>Gesamtsumme</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <a 
                href="/checkout"
                className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Lock size={20} /> Zur Kasse
              </a>
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Lock size={12} /> SSL-Verschlüsselte Übertragung
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}