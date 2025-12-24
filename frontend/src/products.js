import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // z.B. "VAPE12K"
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Pfad zum Bild oder URL
  description: { type: String },
  stock: { type: Number, default: 0 }
});

export default mongoose.model('Product', productSchema);