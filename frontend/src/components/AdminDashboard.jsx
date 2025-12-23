import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MessageSquare, Check, Truck, XCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'messages'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Login Funktion
  const handleLogin = (e) => {
    e.preventDefault();
    // Wir speichern das Passwort temporär im State für Requests
    fetchData(password);
  };

  const fetchData = async (pwd) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'orders' ? '/api/admin/orders' : '/api/admin/messages';
      // Wir schicken das Passwort im Header mit!
      const res = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { 'x-admin-secret': pwd }
      });
      setData(res.data);
      setIsAuth(true); // Wenn kein Fehler kam, war Passwort richtig
    } catch (err) {
      alert("Falsches Passwort oder Server-Fehler!");
      setIsAuth(false);
    }
    setLoading(false);
  };

  // Status ändern Funktion
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${id}`, 
        { status: newStatus },
        { headers: { 'x-admin-secret': password } }
      );
      // Liste neu laden
      fetchData(password);
    } catch (err) {
      alert("Fehler beim Update");
    }
  };

  // Tab Wechsel
  useEffect(() => {
    if (isAuth) fetchData(password);
  }, [activeTab]);

  // --- LOGIN VIEW ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-6">ADMIN ACCESS</h1>
          <input 
            type="password" 
            placeholder="Security Key" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-xl mb-4 text-center text-lg focus:ring-2 focus:ring-black outline-none"
          />
          <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">SECURE. <span className="text-gray-400">Dashboard</span></h1>
          <div className="flex bg-white p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'messages' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Support
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading && <p className="text-center text-gray-400">Lade Daten...</p>}
          
          {activeTab === 'orders' && data.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    order.status === 'shipped' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg">{order.firstName} {order.lastName}</h3>
                <p className="text-gray-500 text-sm">{order.address.street}, {order.address.zip} {order.address.city}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {order.items.map((item, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between min-w-[200px]">
                <div className="text-xl font-bold">{order.totalAmount.toFixed(2)}€</div>
                <div className="text-sm text-gray-500 mb-4">{order.paymentMethod} ({order.provider || 'Cash'})</div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status !== 'shipped' && (
                    <button onClick={() => updateStatus(order._id, 'shipped')} className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200" title="Als versendet markieren">
                      <Truck size={20} />
                    </button>
                  )}
                   {order.status !== 'completed' && (
                    <button onClick={() => updateStatus(order._id, 'completed')} className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200" title="Abschließen">
                      <Check size={20} />
                    </button>
                  )}
                  <button onClick={() => updateStatus(order._id, 'cancelled')} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100" title="Stornieren">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'messages' && data.map(msg => (
            <div key={msg._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between mb-2">
                <h3 className="font-bold">{msg.email}</h3>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{msg.message}</p>
            </div>
          ))}

          {data.length === 0 && !loading && (
             <div className="text-center py-20 text-gray-400">Keine Daten gefunden.</div>
          )}
        </div>

      </div>
    </div>
  );
}