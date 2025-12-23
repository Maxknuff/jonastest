import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MessageSquare, Check, Truck, XCircle, Trash2, Mail, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchData(password);
  };

  const fetchData = async (pwd) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'orders' ? '/api/admin/orders' : '/api/admin/messages';
      const res = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { 'x-admin-secret': pwd }
      });
      setData(res.data);
      setIsAuth(true);
    } catch (err) {
      alert("Zugriff verweigert! Passwort prüfen.");
      setIsAuth(false);
    }
    setLoading(false);
  };

  // --- ACTIONS FÜR ORDERS ---
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${id}`, 
        { status: newStatus },
        { headers: { 'x-admin-secret': password } }
      );
      fetchData(password); // Liste aktualisieren
    } catch (err) {
      alert("Fehler beim Aktualisieren des Status.");
    }
  };

  // --- ACTIONS FÜR SUPPORT ---
  const deleteMsg = async (id) => {
    if (!window.confirm("Nachricht unwiderruflich löschen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/messages/${id}`, {
        headers: { 'x-admin-secret': password }
      });
      fetchData(password);
    } catch (err) {
      alert("Fehler beim Löschen der Nachricht.");
    }
  };

  useEffect(() => {
    if (isAuth) fetchData(password);
  }, [activeTab]);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-4">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tighter">ADMIN LOGIN</h1>
          <p className="text-gray-400 mb-8">Secure Access Only</p>
          <input 
            type="password" 
            placeholder="Security Key" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl mb-4 text-center text-lg transition-all outline-none"
          />
          <button className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95">
            Dashboard entsperren
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl font-black tracking-tighter italic">SECURE.<span className="text-[#0071E3]">ADMIN</span></h1>
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-black'}`}
            >
              Bestellungen
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'messages' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-black'}`}
            >
              Support
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && <div className="text-center py-10 animate-pulse text-gray-400">Synchronisiere Daten...</div>}
          
          {activeTab === 'orders' && data.map(order => (
            <div key={order._id} className="bg-white p-8 rounded-[28px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-md transition-all">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {order.status}
                  </span>
                  <span className="font-mono text-xs text-gray-300">ID: {order._id.slice(-8)}</span>
                </div>
                <h3 className="font-bold text-2xl mb-1">{order.firstName} {order.lastName}</h3>
                <p className="text-gray-400 font-medium mb-4">{order.address.street}, {order.address.zip} {order.address.city}</p>
                
                <div className="flex gap-2 flex-wrap">
                  {order.items.map((item, i) => (
                    <span key={i} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold border border-gray-100">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                <div className="text-3xl font-black">{order.totalAmount.toFixed(2)}€</div>
                
                <div className="flex gap-3">
                  {/* VERSENDET */}
                  <button 
                    onClick={() => updateStatus(order._id, 'shipped')} 
                    className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Als versendet markieren"
                  >
                    <Truck size={22} />
                  </button>
                  
                  {/* ABSCHLIESSEN */}
                  <button 
                    onClick={() => updateStatus(order._id, 'completed')} 
                    className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="Bestellung abschließen"
                  >
                    <Check size={22} />
                  </button>

                  {/* STORNIEREN */}
                  <button 
                    onClick={() => updateStatus(order._id, 'cancelled')} 
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Stornieren"
                  >
                    <XCircle size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'messages' && data.map(msg => (
            <div key={msg._id} className="bg-white p-8 rounded-[28px] shadow-sm border border-gray-100 group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl mb-1">{msg.email}</h3>
                  <p className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleString('de-DE')}</p>
                </div>
                <div className="flex gap-2">
                   <a href={`mailto:${msg.email}`} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-[#0071E3] hover:text-white transition-all">
                      <Mail size={20} />
                   </a>
                   <button onClick={() => deleteMsg(msg._id)} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={20} />
                   </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed border border-gray-100">
                {msg.message}
              </div>
            </div>
          ))}

          {data.length === 0 && !loading && (
             <div className="text-center py-32 bg-white rounded-[32px] border-2 border-dashed border-gray-200">
                <Package size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold text-lg">Keine Einträge gefunden.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}