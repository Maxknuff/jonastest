import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  // DIESE NEUEN FELDER FEHLEN NOCH BEI DIR:
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  stock: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);