import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // z.B. "VAPE12K"
  stock: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);