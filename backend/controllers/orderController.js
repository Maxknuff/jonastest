import Joi from 'joi';
import axios from 'axios';
import Order from '../models/Order.js';

// KONSTANTEN
const FIXED_PRICE = 0.01; // Test-Preis pro Item
const DISCORD_URL = process.env.DISCORD_WEBHOOK_URL;

// JOI SCHEMA (Die strengen Regeln)
const orderSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  
  address: Joi.object({
    street: Joi.string().required(),
    zip: Joi.string().required(),
    city: Joi.string().required()
  }).required(),

  paymentMethod: Joi.string().valid('ONSITE', 'ONLINE').required(),
  provider: Joi.string().allow('').optional(),
  
  items: Joi.array().items(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      name: Joi.string().required()
    })
  ).min(1).required()
})
// BEDINGTE VALIDIERUNG (Conditional Logic)
.when(Joi.object({ paymentMethod: 'ONLINE' }).unknown(), {
  then: Joi.object({
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    provider: Joi.string().required()
  })
})
.when(Joi.object({ paymentMethod: 'ONSITE' }).unknown(), {
  then: Joi.object({
    phone: Joi.string().required()
  })
});

// MAIN FUNCTION
export const createOrder = async (req, res) => {
  try {
    // 1. Validieren
    const validData = await orderSchema.validateAsync(req.body, { stripUnknown: true });

    // 2. Trust No One: Preis berechnen
    const calculatedTotal = validData.items.length * FIXED_PRICE;

    // 3. In DB speichern
    const newOrder = new Order({
      ...validData,
      totalAmount: calculatedTotal
    });
    const savedOrder = await newOrder.save();

    // 4. Discord Benachrichtigung (Feuer & Vergessen)
    sendToDiscord(savedOrder);

    // 5. Erfolg melden
    res.status(201).json({ 
      success: true, 
      orderId: savedOrder._id,
      message: 'Order created successfully' 
    });

  } catch (error) {
    console.error('Order Error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.details ? error.details[0].message : error.message 
    });
  }
};

// HELPER: Discord Webhook
const sendToDiscord = async (order) => {
  if (!DISCORD_URL) return;

  const embed = {
    title: `Neue Bestellung: ${order.paymentMethod}`,
    color: order.paymentMethod === 'ONLINE' ? 0x00ff00 : 0xff9900, // Grün oder Orange
    fields: [
      { name: 'Kunde', value: `${order.firstName} ${order.lastName || ''}`, inline: true },
      { name: 'Total', value: `${order.totalAmount.toFixed(2)}€`, inline: true },
      { name: 'Items', value: order.items.map(i => `• ${i.name}`).join('\n') }
    ],
    footer: { text: `ID: ${order._id}` },
    timestamp: new Date().toISOString()
  };

  try {
    await axios.post(DISCORD_URL, { embeds: [embed] });
  } catch (err) {
    console.error('Discord Webhook failed', err.message);
  }
};