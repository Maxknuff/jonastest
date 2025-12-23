import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String }, // Optional, außer bei Online
  email: { type: String },    // Optional, außer bei Online
  phone: { type: String },    // Optional, Pflicht bei Onsite
  
  address: {
    street: { type: String, required: true },
    zip: { type: String, required: true },
    city: { type: String, required: true },
  },

  paymentMethod: { 
    type: String, 
    enum: ['ONSITE', 'ONLINE'], 
    required: true 
  },
  provider: { type: String }, // z.B. 'paypal', 'crypto'

  items: [{
    id: String,
    name: String,
    // Preis speichern wir nicht hier vom Frontend, sondern berechnen ihn neu!
  }],

  totalAmount: { type: Number, required: true }, // Serverseitig berechnet
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);