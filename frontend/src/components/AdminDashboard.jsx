import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MessageSquare, Check, Truck, XCircle, Trash2, Mail, Lock, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'messages', 'stock'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchData(password);
  };

  const fetchData = async (pwd) => {
    if (!pwd) return;
    setLoading(true);
    try {
      // Endpunkt je nach Tab wählen
      let endpoint = '/api/admin/orders';
      if (activeTab === 'messages') endpoint = '/api/admin/messages';
      if (activeTab === 'stock') endpoint = '/api/admin/stock';
      
      const res = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { 'x-admin-secret': pwd }
      });

      setData(Array.isArray(res.data) ? res.data : []);
      setIsAuth(true);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 403) {
        alert("Passwort falsch.");
        setIsAuth(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setData([]);
    setActiveTab(tab);
  };

  // --- LAGERBESTAND SPEICHERN ---
  const handleUpdateStock = async (productId, stock) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/stock`, 
        { productId, stock: parseInt(stock) },
        { headers: { 'x-admin-secret': password } }
      );
      // Optional: Ein kleiner "Gespeichert" Effekt
    } catch (err) {
      alert("Fehler beim Speichern des Bestands.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${id}`, { status: newStatus }, { headers: { 'x-admin-secret': password } });
      fetchData(password);
    } catch (err) { alert("Fehler beim Update."); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Löschen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, { headers: { 'x-admin-secret': password } });
      fetchData(password);
    } catch (err) { alert("Fehler."); }
  };

  const deleteMsg = async (id) => {
    if (!window.confirm("Löschen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/messages/${id}`, { headers: { 'x-admin-secret': password } });
      fetchData(password);
    } catch (err) { alert("Fehler."); }
  };

  useEffect(() => {
    if (isAuth) fetchData(password);
  }, [activeTab]);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-4">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-md text-center">
          <Lock size={32} className="mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-6">ADMIN LOGIN</h1>
          <input type="password" placeholder="Security Key" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl mb-4 text-center outline-none" />
          <button className="w-full bg-black text-white py-4 rounded-2xl font-bold">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl font-black italic">SECURE.<span className="text-[#0071E3]">ADMIN</span></h1>
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl overflow-x-auto">
            <button onClick={() => changeTab('orders')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow-md' : 'text-gray-500'}`}>Orders</button>
            <button onClick={() => changeTab('messages')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'messages' ? 'bg-white shadow-md' : 'text-gray-500'}`}>Support</button>
            <button onClick={() => changeTab('stock')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'stock' ? 'bg-white shadow-md' : 'text-gray-500'}`}>Bestand</button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && <div className="text-center py-10 animate-pulse text-gray-400">Lade...</div>}
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && !loading && data.map(order => (
            <div key={order._id} className="bg-white p-8 rounded-[28px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 animate-in fade-in">
               <div className="flex-1 w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-3 py-1 rounded-full mb-4 inline-block">{order.status}</span>
                  <h3 className="font-bold text-2xl">{order.firstName} {order.lastName}</h3>
                  <p className="text-gray-400">{order.address.street}, {order.address.zip} {order.address.city}</p>
               </div>
               <div className="flex flex-col items-end gap-4">
                  <div className="text-3xl font-black">{order.totalAmount?.toFixed(2)}€</div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order._id, 'shipped')} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck size={20}/></button>
                    <button onClick={() => updateStatus(order._id, 'completed')} className="p-3 bg-green-50 text-green-600 rounded-xl"><Check size={20}/></button>
                    <button onClick={() => deleteOrder(order._id)} className="p-3 bg-gray-50 text-gray-400 rounded-xl"><Trash2 size={20}/></button>
                  </div>
               </div>
            </div>
          ))}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && !loading && data.map(msg => (
            <div key={msg._id} className="bg-white p-8 rounded-[28px] border border-gray-100">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-xl">{msg.email}</h3>
                <button onClick={() => deleteMsg(msg._id)} className="text-red-400"><Trash2 size={20}/></button>
              </div>
              <p className="bg-gray-50 p-4 rounded-xl">{msg.message}</p>
            </div>
          ))}

          {/* STOCK TAB (Neu!) */}
          {activeTab === 'stock' && !loading && (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                {['VAPE12K', 'VAPE15K', 'prod_hardware_wallet'].map(id => {
                  // Finde aktuellen Bestand in den geladenen Daten
                  const currentStock = data.find(p => p.productId === id)?.stock || 0;
                  return (
                    <div key={id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <h4 className="font-black text-lg">{id}</h4>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Produkt-ID</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-gray-500 italic">Bestand:</label>
                        <input 
                          type="number" 
                          defaultValue={currentStock}
                          onBlur={(e) => handleUpdateStock(id, e.target.value)}
                          className="w-24 p-3 bg-white border-2 border-gray-200 rounded-xl text-center font-bold focus:border-[#0071E3] outline-none transition-all"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && data.length === 0 && activeTab !== 'stock' && (
             <div className="text-center py-20 text-gray-400 font-bold">Keine Einträge gefunden.</div>
          )}
        </div>
      </div>
    </div>
  );
}