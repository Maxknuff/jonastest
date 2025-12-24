import Order from '../models/Order.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js'; 

export const checkAdmin = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: 'Zugriff verweigert!' });
  }
  next();
};

export const getOrders = async (req, res) => {
  try { const orders = await Order.find().sort({ createdAt: -1 }); res.json(orders); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateOrderStatus = async (req, res) => {
  try { await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const getMessages = async (req, res) => {
  try { const messages = await Message.find().sort({ createdAt: -1 }); res.json(messages); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteMessage = async (req, res) => {
  try { await Message.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteOrder = async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const getStock = async (req, res) => {
  try { const products = await Product.find(); res.json(products); } 
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateStock = async (req, res) => {
  try {
    const { productId, stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { productId }, { stock, lastUpdate: Date.now() }, { upsert: true, new: true }
    );
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- NEU: PRODUKTE ERSTELLEN & LADEN ---

export const createProduct = async (req, res) => {
  try {
    const { productId, name, price, image, description, stock } = req.body;
    
    // Prüfen ob ID existiert
    const existing = await Product.findOne({ productId });
    if (existing) return res.status(400).json({ message: 'Produkt-ID existiert bereits!' });

    const newProduct = new Product({
      productId, name, price, image, description, stock: parseInt(stock) || 0
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    // Daten für das Frontend formatieren (id statt productId)
    const formatted = products.map(p => ({
      id: p.productId,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      stock: p.stock
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: err.message }); }
};