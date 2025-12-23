import Order from '../models/Order.js';
import Message from '../models/Message.js';

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
    // Neueste zuerst
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Status ändern (z.B. auf "Versendet")
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'shipped', 'completed', etc.
    
    await Order.findByIdAndUpdate(id, { status });
    res.json({ success: true, message: 'Status aktualisiert' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Nachrichten holen
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};