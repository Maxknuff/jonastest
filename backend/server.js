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
  updateStock,      // <--- WICHTIG: Hier muss ein Komma sein!
  createProduct,    // NEU
  getAllProducts    // NEU
} from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Einstellungen (Optimiert für Vercel & Eigene Domain)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4321', // Astro Standard Port
  'https://jonastest-orpin.vercel.app',
  /\.vercel\.app$/ // Erlaubt alle Vercel-Subdomains dieses Projekts
];

app.use(cors({
  origin: function (origin, callback) {
    // Erlaubt Anfragen ohne Origin (wie Postman oder mobile Apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Diese Origin ist nicht erlaubt.'));
    }
  },
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

// NEU: Produkte für den Shop abrufen
app.get('/api/products', getAllProducts);

// --- BESTANDS-ROUTE ---
// (Kann entfernt werden, wenn getAllProducts genutzt wird, aber wir lassen es zur Sicherheit drin)
app.get('/api/stock', async (req, res) => {
  try {
    const Product = (await import('./models/Product.js')).default;
    const products = await Product.find({}, 'productId stock');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/orders', checkAdmin, getOrders);
app.put('/api/admin/orders/:id', checkAdmin, updateOrderStatus);
app.delete('/api/admin/orders/:id', checkAdmin, deleteOrder);

app.get('/api/admin/messages', checkAdmin, getMessages);
app.delete('/api/admin/messages/:id', checkAdmin, deleteMessage);

app.get('/api/admin/stock', checkAdmin, getStock);
app.post('/api/admin/stock', checkAdmin, updateStock);

// NEU: Produkt erstellen
app.post('/api/admin/products', checkAdmin, createProduct);

// --- SERVER START ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});