import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createOrder } from './controllers/orderController.js';
import { createMessage } from './controllers/supportController.js'; // NEU
import { getOrders, updateOrderStatus, getMessages, checkAdmin } from './controllers/adminController.js'; // NEU
import { deleteMessage } from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // WICHTIG: PUT erlaubt das Bearbeiten!
  allowedHeaders: ['Content-Type', 'x-admin-secret'] // WICHTIG: Erlaubt unser Passwort
}));
app.use(express.json());

// DB Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routen
app.get('/', (req, res) => res.send('SECURE. API is running...'));
app.post('/api/orders', createOrder);
app.post('/api/support', createMessage); // NEU: Support Route

// --- ADMIN ROUTES (Geschützt) ---
app.get('/api/admin/orders', checkAdmin, getOrders);           // Bestellungen lesen
app.put('/api/admin/orders/:id', checkAdmin, updateOrderStatus); // Status ändern
app.get('/api/admin/messages', checkAdmin, getMessages);       // Nachrichten lesen
app.delete('/api/admin/messages/:id', checkAdmin, deleteMessage);

// CORS Update (Ganz wichtig für DELETE und PUT!)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});