import Order from '../models/Order.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js'; // WICHTIG: Das Model für den Bestand

// Middleware: Prüft, ob das Passwort stimmt
export const checkAdmin = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: 'Zugriff verweigert!' });
  }
  next();
};

// 1. Alle Bestellungen holen
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Status einer Bestellung ändern
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    await Order.findByIdAndUpdate(id, { status });
    res.json({ success: true, message: 'Status aktualisiert' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Alle Support-Nachrichten holen
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Nachricht löschen
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Nachricht gelöscht' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Bestellung komplett löschen
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bestellung gelöscht' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- NEU: LAGERBESTAND FUNKTIONEN ---

// 6. Alle Bestände aus der DB holen
export const getStock = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Bestand aktualisieren oder neu anlegen (Upsert)
export const updateStock = async (req, res) => {
  try {
    const { productId, stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { productId },
      { stock, lastUpdate: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};