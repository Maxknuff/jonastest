import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createOrder } from './controllers/orderController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Konfiguration (WICHTIG für Verbindung Frontend -> Backend)
app.use(cors({
  origin: '*', // Erlaubt Zugriff von überall (für Entwicklung okay)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. Logging Middleware (Damit wir sehen, ob der Request ankommt)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Datenbank Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routen
app.get('/', (req, res) => res.send('SECURE. API is running...'));
app.post('/api/orders', createOrder);

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});