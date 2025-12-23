import React from 'react';
import { isCartOpen, isSupportOpen, searchQuery, cartItems } from '../store';
import { useStore } from '@nanostores/react';
import { Search, ShoppingBag, MessageCircle } from 'lucide-react';

export default function Header() {
  const $cartItems = useStore(cartItems);
  
  // Berechne Anzahl der Items für das kleine rote Badge
  const cartCount = $cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="fixed top-0 w-full z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-8">
        
        {/* LOGO */}
        <a href="/" className="text-2xl font-black tracking-tighter flex items-center gap-1 text-[#1D1D1F] no-underline">
          SECURE<span className="text-[#0071E3] text-4xl">.</span>
        </a>

        {/* SUCHLEISTE */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Suche..." 
            onChange={(e) => searchQuery.set(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all text-black"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>

        {/* RECHTS: Icons & Buttons */}
        <div className="flex items-center gap-4 ml-auto">
          
          {/* SUPPORT BUTTON */}
          <button 
            onClick={() => isSupportOpen.set(true)}
            className="flex items-center gap-2 text-sm font-medium text-[#1D1D1F] hover:text-[#0071E3] transition-colors bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-full"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:block">Support</span>
          </button>

          {/* WARENKORB BUTTON */}
          <button 
            onClick={() => isCartOpen.set(true)}
            className="relative cursor-pointer group p-2 hover:bg-gray-100 rounded-full transition text-[#1D1D1F]"
          >
             <ShoppingBag size={24} />
             {/* Rotes Badge wenn Items drin sind */}
             {cartCount > 0 && (
               <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                 {cartCount}
               </span>
             )}
          </button>
        </div>
      </div>
    </header>
  );
}