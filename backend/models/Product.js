// backend/models/Product.js
import mongoose from 'mongoose'; // <--- HIER IST ES RICHTIG!

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },  // Wichtig
  price: { type: Number, required: true }, // Wichtig
  image: { type: String, required: true }, // Wichtig
  description: { type: String },
  stock: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);