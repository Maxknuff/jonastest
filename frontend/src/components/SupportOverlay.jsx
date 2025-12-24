import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isSupportOpen } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

// --- NEU: Automatische API-Erkennung ---
const getApiUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    // Wenn wir auf Vercel sind, nutze das echte Backend
    if (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("jonastest")) {
      return "https://jonastest.onrender.com";
    }
  }
  // Sonst lokal
  return "http://localhost:5000";
};

const API_URL = getApiUrl();

export default function SupportOverlay() {
  const isOpen = useStore(isSupportOpen);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // KORREKTUR: Hier nutzen wir jetzt die dynamische API_URL statt localhost
      await axios.post(`${API_URL}/api/support`, { email, message: msg });
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setMsg('');
        isSupportOpen.set(false);
      }, 2000);
    } catch (err) {
      console.error("Support Error:", err);
      alert('Fehler beim Senden. Bitte versuche es später erneut.');
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => isSupportOpen.set(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 md:right-8 md:bottom-8 w-full md:w-[400px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#0071E3] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} />
                <h2 className="font-bold text-lg">Support Chat</h2>
              </div>
              <button onClick={() => isSupportOpen.set(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-[#F5F5F7] min-h-[300px]">
              {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-green-600 animate-pulse">
                  <Send size={48} className="mb-4" />
                  <p className="font-bold">Nachricht gesendet!</p>
                  <p className="text-sm">Wir melden uns per E-Mail.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deine E-Mail</label>
                    <input 
                      type="email" required 
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-[#0071E3]"
                      placeholder="name@beispiel.de"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nachricht</label>
                    <textarea 
                      required rows="4"
                      value={msg} onChange={e => setMsg(e.target.value)}
                      className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-[#0071E3]"
                      placeholder="Wie können wir helfen?"
                    />
                  </div>
                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
                  >
                    {status === 'loading' ? 'Sende...' : 'Absenden'} <Send size={16}/>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}