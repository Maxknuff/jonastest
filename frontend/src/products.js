import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  // DIESE FELDER SIND NEU UND WICHTIG:
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  stock: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);