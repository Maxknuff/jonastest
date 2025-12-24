import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MessageSquare, Check, Truck, Trash2, Lock, ShoppingCart, Plus, Image as ImageIcon } from 'lucide-react';

// --- FEHLERRESISTENTE URL-LOGIK ---
const getApiUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    if (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("jonastest")) {
      return "https://jonastest.onrender.com";
    }
  }
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEU: State für das Produkt-Formular
  const [newProduct, setNewProduct] = useState({
    productId: '', 
    name: '', 
    price: '', 
    image: '/products/VAPE12K.png', 
    description: '', 
    stock: 0
  });

  const handleLogin = (e) => {
    e.preventDefault();
    fetchData(password);
  };

  const fetchData = async (pwd) => {
    if (!pwd) return;
    setLoading(true);
    try {
      let endpoint = '/api/admin/orders';
      if (activeTab === 'messages') endpoint = '/api/admin/messages';
      if (activeTab === 'stock') endpoint = '/api/admin/stock';
      
      // Für den "Produkte erstellen"-Tab brauchen wir keine Daten laden
      if (activeTab === 'products') {
        setLoading(false);
        setIsAuth(true);
        return; 
      }
      
      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { 'x-admin-secret': pwd }
      });

      setData(Array.isArray(res.data) ? res.data : []);
      setIsAuth(true);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 403) {
        alert("Passwort falsch.");
        setIsAuth(false);
      } else {
        alert("Server nicht erreichbar. Prüfe die API_URL.");
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setData([]);
    setActiveTab(tab);
  };

  // NEU: Produkt erstellen Funktion
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/products`, newProduct, {
        headers: { 'x-admin-secret': password }
      });
      alert('Produkt erfolgreich erstellt!');
      // Formular zurücksetzen
      setNewProduct({ productId: '', name: '', price: '', image: '', description: '', stock: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Erstellen des Produkts');
    }
  };

  const handleUpdateStock = async (productId, stock) => {
    try {
      await axios.post(`${API_URL}/api/admin/stock`, 
        { productId, stock: parseInt(stock) },
        { headers: { 'x-admin-secret': password } }
      );
      alert("Bestand aktualisiert!");
    } catch (err) {
      alert("Fehler beim Speichern des Bestands.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${id}`, { status: newStatus }, { headers: { 'x-admin-secret': password } });
      fetchData(password);
    } catch (err) { alert("Fehler beim Update."); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Löschen?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/orders/${id}`, { headers: { 'x-admin-secret': password } });
      fetchData(password);
    } catch (err) { alert("Fehler."); }
  };

  const deleteMsg = async (id) => {
    if (!window.confirm("Löschen?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/messages/${id}`, { headers: { 'x-admin-secret': password } });
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
          <button className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all">Unlock</button>
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
            
            {/* NEUER TAB-BUTTON */}
            <button onClick={() => changeTab('products')} className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-black text-white shadow-md' : 'text-gray-500'}`}>
              <Plus size={16}/> Neues Produkt
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && <div className="text-center py-10 animate-pulse text-gray-400">Verbinde mit Server...</div>}
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && !loading && data.map(order => (
            <div key={order._id} className="bg-white p-8 rounded-[28px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-8">
               <div className="flex-1 w-full">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {order.status}
                  </span>
                  <h3 className="font-bold text-2xl">{order.firstName} {order.lastName}</h3>
                  <p className="text-gray-400 mb-4">{order.address?.street}, {order.address?.zip} {order.address?.city}</p>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ShoppingCart size={12} /> Artikel
                    </h4>
                    <div className="space-y-2">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <span className="font-bold text-[#1D1D1F]">
                            {item.quantity || 1}x {item.name}
                          </span>
                          <span className="text-gray-400 font-mono text-xs">{item.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="flex flex-col items-center md:items-end gap-4 min-w-[150px]">
                  <div className="text-3xl font-black">{order.totalAmount?.toFixed(2)}€</div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order._id, 'shipped')} title="Versenden" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Truck size={20}/></button>
                    <button onClick={() => updateStatus(order._id, 'completed')} title="Abschließen" className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><Check size={20}/></button>
                    <button onClick={() => deleteOrder(order._id)} title="Löschen" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                  </div>
               </div>
            </div>
          ))}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && !loading && data.map(msg => (
            <div key={msg._id} className="bg-white p-8 rounded-[28px] border border-gray-100">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-xl">{msg.email}</h3>
                <button onClick={() => deleteMsg(msg._id)} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
              </div>
              <p className="bg-gray-50 p-4 rounded-xl text-gray-700">{msg.message}</p>
            </div>
          ))}

          {/* STOCK TAB */}
          {activeTab === 'stock' && !loading && (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                {/* Hinweis: Hier werden nur die Produkte angezeigt, die schon eine Stock-Entry haben oder im Array stehen */}
                {/* Für dynamische Produkte wird das Array 'data' genutzt, das von getAllProducts/getStock befüllt wird */}
                {/* Falls du hier eine feste Liste hattest, wird diese nun durch die API-Daten ersetzt, sobald wir getStock anpassen. */}
                {/* Vorläufige Anzeige basierend auf den geladenen Daten: */}
                {data.map(p => (
                    <div key={p.productId} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <h4 className="font-black text-lg">{p.productId}</h4>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Produkt-ID</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-gray-500 italic">Bestand:</label>
                        <input 
                          type="number" 
                          defaultValue={p.stock}
                          onBlur={(e) => handleUpdateStock(p.productId, e.target.value)}
                          className="w-24 p-3 bg-white border-2 border-gray-200 rounded-xl text-center font-bold focus:border-[#0071E3] outline-none transition-all"
                        />
                      </div>
                    </div>
                  ))
                }
                {/* Fallback für leere Daten im Stock Tab */}
                {data.length === 0 && <p className="text-center text-gray-400">Keine Bestandsdaten verfügbar.</p>}
              </div>
            </div>
          )}

          {/* --- NEUER PRODUKT TAB INHALT --- */}
          {activeTab === 'products' && (
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plus className="text-[#0071E3]"/> Produkt hinzufügen</h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Produkt ID</label>
                    <input 
                      required 
                      placeholder="z.B. VAPE20K" 
                      value={newProduct.productId} 
                      onChange={e => setNewProduct({...newProduct, productId: e.target.value})} 
                      className="w-full p-3 bg-gray-50 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Preis (€)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      placeholder="29.99" 
                      value={newProduct.price} 
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                      className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Name</label>
                  <input 
                    required 
                    placeholder="Produktname" 
                    value={newProduct.name} 
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                    className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Bild URL / Pfad</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      placeholder="/products/bild.png" 
                      value={newProduct.image} 
                      onChange={e => setNewProduct({...newProduct, image: e.target.value})} 
                      className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition" 
                    />
                    {/* Bild Vorschau */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                       {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} alt="Vorschau" /> : <ImageIcon size={20} className="text-gray-300"/>}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">* Bild muss im 'public/products' Ordner liegen oder eine URL sein.</p>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Beschreibung</label>
                   <textarea 
                      placeholder="Beschreibung..." 
                      value={newProduct.description} 
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                      className="w-full p-3 bg-gray-50 rounded-xl h-24 focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition resize-none" 
                   />
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Start-Bestand</label>
                   <input 
                      type="number" 
                      placeholder="0" 
                      value={newProduct.stock} 
                      onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                      className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3] outline-none transition" 
                   />
                </div>

                <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-[#0071E3] transition-colors mt-4 flex justify-center items-center gap-2">
                  <Plus size={20} /> Produkt erstellen
                </button>
              </form>
            </div>
          )}

          {!loading && data.length === 0 && activeTab !== 'stock' && activeTab !== 'products' && (
             <div className="text-center py-20 text-gray-400 font-bold">Keine Einträge in der Datenbank gefunden.</div>
          )}
        </div>
      </div>
    </div>
  );
}