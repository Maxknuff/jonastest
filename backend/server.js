import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importiere alle Controller
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
  updateStock,
  createProduct,   // <--- HIER hat das Komma gefehlt!
  getAllProducts   // <--- Das muss auch rein
} from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Einstellungen
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4321', 
  'https://jonastest-orpin.vercel.app',
  /\.vercel\.app$/ 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    if (isAllowed) callback(null, true);
    else callback(new Error('CORS Policy: Diese Origin ist nicht erlaubt.'));
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
app.get('/', (req, res) => res.send('SECURE. API is running...'));
app.post('/api/orders', createOrder);
app.post('/api/support', createMessage);
app.get('/api/products', getAllProducts); // Öffentliche Liste
app.get('/api/stock', getStock)


// Route für Produkte
app.get('/api/products', getAllProducts);

// Route für Bestand (Fix für den 404 Fehler)
app.get('/api/stock', getStock);

// --- ADMIN ROUTEN ---
app.get('/api/admin/orders', checkAdmin, getOrders);
app.put('/api/admin/orders/:id', checkAdmin, updateOrderStatus);
app.delete('/api/admin/orders/:id', checkAdmin, deleteOrder);

app.get('/api/admin/messages', checkAdmin, getMessages);
app.delete('/api/admin/messages/:id', checkAdmin, deleteMessage);

app.get('/api/admin/stock', checkAdmin, getStock);
app.post('/api/admin/stock', checkAdmin, updateStock);

// Route zum Erstellen neuer Produkte
app.post('/api/admin/products', checkAdmin, createProduct); // Erstellen (gab es schon)
app.get('/api/admin/products', checkAdmin, getAllProducts);
// SERVER START
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});