import Joi from 'joi';
import axios from 'axios';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const PRODUCT_CATALOG = {
  "VAPE12K": 10.00,
  "VAPE15K": 15.00,
  "prod_hardware_wallet": 149.00,
  "prod_stick": 149.00 
};

const orderSchema = Joi.object({
  paymentMethod: Joi.string().valid('ONSITE', 'ONLINE').required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  address: Joi.object({
    street: Joi.string().required(),
    zip: Joi.string().required(),
    city: Joi.string().required()
  }).required(),
  provider: Joi.string().allow('').optional(),
  items: Joi.array().items(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      name: Joi.string().required()
    }).unknown(true)
  ).min(1).required()
}).unknown(true);

export const createOrder = async (req, res) => {
  try {
    console.log("📥 Neue Bestellung empfangen");
    const validData = await orderSchema.validateAsync(req.body, { stripUnknown: true });
    
    // --- 1. MENGEN SUMMIEREN (Aggregierung) ---
    // Wir zählen, wie oft jede ID im Warenkorb vorkommt
    const itemQuantities = validData.items.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1;
      return acc;
    }, {});

    // --- 2. LAGERBESTAND PRÜFEN (Präzise) ---
    for (const [productId, requestedQty] of Object.entries(itemQuantities)) {
      const dbProduct = await Product.findOne({ productId });
      
      if (dbProduct) {
        if (dbProduct.stock < requestedQty) {
          // Den Namen des Produkts für die Fehlermeldung finden
          const productName = validData.items.find(i => i.id === productId)?.name || productId;
          
          return res.status(400).json({ 
            success: false, 
            message: `Nicht genügend Bestand für "${productName}". Vorhanden: ${dbProduct.stock}, im Warenkorb: ${requestedQty}.` 
          });
        }
      } else {
        // Falls das Produkt gar nicht in der Stock-Datenbank ist, 
        // kannst du entscheiden, ob du den Verkauf erlaubst oder blockst.
        // Hier lassen wir es sicherheitshalber durch, wenn kein Eintrag existiert.
      }
    }

    // --- 3. PREIS BERECHNEN ---
    let calculatedTotal = 0;
    for (const item of validData.items) {
      const realPrice = PRODUCT_CATALOG[item.id];
      if (realPrice === undefined) {
        throw new Error(`Ungültige Produkt-ID: ${item.id}`);
      }
      calculatedTotal += realPrice;
    }

    // --- 4. BESTELLUNG SPEICHERN ---
    const newOrder = new Order({
      ...validData,
      totalAmount: calculatedTotal,
      status: 'pending',
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Bestellung gespeichert:", savedOrder._id);

    // --- 5. LAGERBESTAND ABZIEHEN ---
    for (const [productId, qty] of Object.entries(itemQuantities)) {
      await Product.findOneAndUpdate(
        { productId },
        { $inc: { stock: -qty } } // Zieht die exakte Anzahl ab
      );
    }

    await sendToDiscord(savedOrder);

    res.status(201).json({ 
      success: true, 
      orderId: savedOrder._id,
      message: 'Bestellung erfolgreich' 
    });

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// --- DISCORD HELPER (Bleibt gleich) ---
const sendToDiscord = async (order) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const isOnline = order.paymentMethod === 'ONLINE';
  const color = isOnline ? 5763719 : 15105570; 
  
  const itemCounts = order.items.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});
  
  const itemsList = Object.entries(itemCounts)
    .map(([name, count]) => `• ${count}x **${name}**`)
    .join('\n');

  const embed = {
    title: isOnline ? "📦 Neue Bestellung" : "🤝 Neue Reservierung",
    color: color,
    fields: [
      { name: "👤 Kunde", value: `${order.firstName} ${order.lastName || ''}\n${order.email || ''}`, inline: true },
      { name: "💰 Summe", value: `**${order.totalAmount.toFixed(2)}€**`, inline: true },
      { name: "🛒 Warenkorb", value: itemsList || "Keine Items", inline: false }
    ],
    footer: { text: `Order ID: ${order._id}` },
    timestamp: new Date().toISOString()
  };

  try { await axios.post(webhookUrl, { embeds: [embed] }); } catch (err) {}
};