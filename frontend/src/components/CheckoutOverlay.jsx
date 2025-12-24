import React from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateCartItemQuantity } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
// WICHTIG: ShoppingBag muss hier importiert sein!
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutOverlay() {
  const isOpen = useStore(isCartOpen);
  const $cartItems = useStore(cartItems);

  const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => isCartOpen.set(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-bold">Dein Warenkorb</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">
                  {$cartItems.length}
                </span>
              </div>
              <button 
                onClick={() => isCartOpen.set(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {$cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p>Dein Warenkorb ist leer.</p>
                  <button 
                    onClick={() => isCartOpen.set(false)}
                    className="text-[#0071E3] font-bold hover:underline"
                  >
                    Jetzt einkaufen
                  </button>
                </div>
              ) : (
                $cartItems.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4 bg-gray-50 p-4 rounded-2xl"
                  >
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full p-2 object-contain" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#1d1d1f] line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">{item.price.toFixed(2)}€ / Stück</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-100">
                          <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-[#0071E3] transition">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-[#0071E3] transition">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeCartItem(item.id)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {$cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500">Gesamtsumme</span>
                  <span className="text-2xl font-black">{total.toFixed(2)}€</span>
                </div>
                <a 
                  href="/checkout"
                  className="w-full bg-[#0071E3] text-white py-4 rounded-2xl font-bold hover:bg-[#0077ED] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Zur Kasse <ArrowRight size={20} />
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}