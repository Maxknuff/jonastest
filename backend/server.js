import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createOrder } from './controllers/orderController.js';

// Config laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Erlaubt Frontend Zugriff
app.use(express.json()); // Erlaubt JSON Body

// Datenbank Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routen
app.get('/', (req, res) => res.send('SECURE. API is running...'));
app.post('/api/orders', createOrder);

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});