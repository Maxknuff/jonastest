import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems } from '../store'; // Importiere deinen Store
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Truck, MapPin, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const $cartItems = useStore(cartItems);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Form State
  const [method, setMethod] = useState('ONLINE'); // 'ONLINE' (Versand) oder 'ONSITE' (Abholung)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    provider: 'paypal' // Default Payment Provider
  });

  // Redirect wenn leer (Client-Side Check)
  useEffect(() => {
    if ($cartItems.length === 0 && status !== 'success') {
       // Optional: window.location.href = '/'; 
    }
  }, [$cartItems]);

  const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Payload vorbereiten (Mapping für Backend)
      const payload = {
        paymentMethod: method,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          zip: formData.zip,
          city: formData.city
        },
        provider: method === 'ONLINE' ? formData.provider : undefined,
        items: $cartItems.flatMap(item => Array(item.quantity).fill({ id: item.id, name: item.name })) // Item Explosion
      };

      // API Call
      const response = await axios.post('http://localhost:5000/api/orders', payload);

      if (response.data.success) {
        setOrderId(response.data.orderId);
        cartItems.set([]); // Warenkorb leeren
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Verbindung zum Server fehlgeschlagen.');
    }
  };

  // --- SUCCESS VIEW ---
  if (status === 'success') {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bestellung erfolgreich!</h2>
        <p className="text-gray-500 mb-6">Deine Order ID: <span className="font-mono text-black">{orderId}</span></p>
        <a href="/" className="block w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">
          Zurück zum Shop
        </a>
      </div>
    );
  }

  // --- EMPTY CART VIEW ---
  if ($cartItems.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-500 mb-4">Dein Warenkorb ist leer.</p>
        <a href="/" className="text-[#0071E3] hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={16}/> Einkaufen fortsetzen
        </a>
      </div>
    );
  }

  // --- MAIN CHECKOUT FORM ---
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl items-start">
      
      {/* LINKS: Formular */}
      <div className="flex-1 bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 order-2 lg:order-1">
        
        {/* Toggle Switch (Apple Style Segmented Control) */}
        <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
          <button
            onClick={() => setMethod('ONLINE')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              method === 'ONLINE' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck size={16} /> Lieferung
          </button>
          <button
            onClick={() => setMethod('ONSITE')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              method === 'ONSITE' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin size={16} /> Abholung
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sektion 1: Persönliche Daten */}
          <div>
            <h3 className="text-lg font-bold mb-4">Deine Daten</h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                required 
                name="firstName" 
                placeholder="Vorname" 
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
              />
              {/* Nachname nur bei Online Pflicht, aber wir zeigen ihn immer */}
              <input 
                name="lastName" 
                placeholder="Nachname" 
                required={method === 'ONLINE'}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Sektion 2: Kontakt (Conditional) */}
          <AnimatePresence mode="wait">
            {method === 'ONLINE' ? (
              <motion.div 
                key="online-contact"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                 <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="E-Mail Adresse (für Bestätigung)" 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="onsite-contact"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-2">
                    Info: Wir reservieren die Ware für 24h im Store.
                 </div>
                 <input 
                  type="tel" 
                  name="phone" 
                  required 
                  placeholder="Handynummer (für Abhol-SMS)" 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sektion 3: Adresse (Immer da für Rechnung) */}
          <div>
            <h3 className="text-lg font-bold mb-4 mt-6">Rechnungsadresse</h3>
            <div className="space-y-4">
              <input 
                name="street" 
                required 
                placeholder="Straße & Hausnummer" 
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
              />
              <div className="grid grid-cols-3 gap-4">
                <input 
                  name="zip" 
                  required 
                  placeholder="PLZ" 
                  onChange={handleChange}
                  className="col-span-1 bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
                />
                <input 
                  name="city" 
                  required 
                  placeholder="Stadt" 
                  onChange={handleChange}
                  className="col-span-2 bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Sektion 4: Bezahlung (Nur Online) */}
          {method === 'ONLINE' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-lg font-bold mb-4 mt-6">Zahlungsmethode</h3>
              <div className="space-y-3">
                 <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${formData.provider === 'paypal' ? 'border-[#0071E3] bg-blue-50/30' : 'border-gray-200'}`}>
                    <input type="radio" name="provider" value="paypal" checked={formData.provider === 'paypal'} onChange={handleChange} className="accent-[#0071E3] w-5 h-5"/>
                    <span className="font-medium">PayPal</span>
                 </label>
                 <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${formData.provider === 'crypto' ? 'border-[#0071E3] bg-blue-50/30' : 'border-gray-200'}`}>
                    <input type="radio" name="provider" value="crypto" checked={formData.provider === 'crypto'} onChange={handleChange} className="accent-[#0071E3] w-5 h-5"/>
                    <span className="font-medium">Crypto (BTC/ETH)</span>
                 </label>
              </div>
            </motion.div>
          )}

          {/* ERROR MESSAGE */}
          {status === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
               <AlertCircle size={20} />
               {errorMsg}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold py-5 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {status === 'loading' ? (
              <span className="animate-pulse">Verarbeite...</span>
            ) : (
              <>
                <Lock size={20} />
                {method === 'ONLINE' ? `Jetzt zahlen (${total.toFixed(2)}€)` : 'Kostenpflichtig reservieren'}
              </>
            )}
          </button>

        </form>
      </div>

      {/* RECHTS: Zusammenfassung (Order Summary) */}
      <div className="w-full lg:w-96 order-1 lg:order-2">
         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-bold mb-6 border-b border-gray-100 pb-4">Übersicht</h3>
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
               {$cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 text-sm">
                     <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <img src={item.image} className="max-w-full max-h-full p-1" />
                     </div>
                     <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500">Menge: {item.quantity}</div>
                     </div>
                     <div className="font-medium">
                        {(item.price * item.quantity).toFixed(2)}€
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-6">
               <span>Gesamt</span>
               <span>{total.toFixed(2)}€</span>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
               Durch Klicken auf den Button akzeptierst du unsere AGB und Datenschutzbestimmungen.
            </div>
         </div>
      </div>

    </div>
  );
}