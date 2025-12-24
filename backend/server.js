import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Controller Imports
import { createOrder } from './controllers/orderController.js';
import { createMessage } from './controllers/supportController.js';
import { 
  getOrders, 
  updateOrderStatus, 
  getMessages, 
  checkAdmin, 
  deleteMessage, 
  deleteOrder, 
  getStock, 
  updateStock 
} from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Einstellungen (Einmalig und vollständig)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));

app.use(express.json());

// Datenbank Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// --- ÖFFENTLICHE ROUTEN ---
app.get('/', (req, res) => res.send('SECURE. API is running...'));
app.post('/api/orders', createOrder);
app.post('/api/support', createMessage);

// --- ADMIN ROUTES (Geschützt durch x-admin-secret) ---
app.get('/api/admin/orders', checkAdmin, getOrders);
app.put('/api/admin/orders/:id', checkAdmin, updateOrderStatus);
app.delete('/api/admin/orders/:id', checkAdmin, deleteOrder);

app.get('/api/admin/messages', checkAdmin, getMessages);
app.delete('/api/admin/messages/:id', checkAdmin, deleteMessage);

app.get('/api/admin/stock', checkAdmin, getStock);
app.post('/api/admin/stock', checkAdmin, updateStock);

app.get('/api/stock', async (req, res) => {
  try {
    // Importiere das Model, falls noch nicht geschehen
    const Product = mongoose.model('Product'); 
    const products = await Product.find({}, 'productId stock');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/stock', async (req, res) => {
  const Product = (await import('./models/Product.js')).default;
  const products = await Product.find({}, 'productId stock');
  res.json(products);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});