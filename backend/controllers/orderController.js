import Joi from 'joi';
import axios from 'axios';
import Order from '../models/Order.js';

// 1. DEIN PRODUKT-KATALOG (Hier Preise definieren!)
// WICHTIG: Diese IDs müssen exakt so auch im Frontend (index.astro) stehen.
const PRODUCT_CATALOG = {
  "VAPE12K": 10.00,
  "VAPE15K": 29.90,
  "prod_hardware_wallet": 149.00,
  "prod_stick": 149.00 // Beispiel für weitere Produkte
};

// --- VALIDIERUNG (JOI) ---
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

// --- MAIN CONTROLLER ---
export const createOrder = async (req, res) => {
  try {
    console.log("📥 Neue Bestellung empfangen:", req.body.paymentMethod);

    const validData = await orderSchema.validateAsync(req.body, { stripUnknown: true });
    
    // 2. ECHTE PREISBERECHNUNG (Trust No One)
    // Wir ignorieren den Preis vom Frontend und nehmen den aus dem Katalog.
    let calculatedTotal = 0;

    for (const item of validData.items) {
      const realPrice = PRODUCT_CATALOG[item.id];
      
      // Sicherheits-Check: Gibt es das Produkt überhaupt?
      if (realPrice === undefined) {
        throw new Error(`Ungültige Produkt-ID erkannt: ${item.id} (${item.name})`);
      }
      
      calculatedTotal += realPrice;
    }

    console.log(`💰 Berechneter Gesamtpreis: ${calculatedTotal.toFixed(2)}€`);

    // DB Save
    const newOrder = new Order({
      ...validData,
      totalAmount: calculatedTotal,
      status: 'pending',
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Bestellung in DB gespeichert:", savedOrder._id);

    // Discord Trigger
    await sendToDiscord(savedOrder);

    res.status(201).json({ 
      success: true, 
      orderId: savedOrder._id,
      message: 'Order created successfully' 
    });

  } catch (error) {
    console.error('❌ Order Error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.details ? error.details[0].message : error.message 
    });
  }
};

// --- DISCORD HELPER FUNCTION ---
const sendToDiscord = async (order) => {
  // Variable erst HIER lesen, wenn dotenv sicher geladen ist
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("⚠️ FEHLER: DISCORD_WEBHOOK_URL ist nicht gesetzt!");
    return;
  }

  console.log("Versuche Discord Senden an:", webhookUrl.substring(0, 30) + "...");

  const isOnline = order.paymentMethod === 'ONLINE';
  const color = isOnline ? 5763719 : 15105570; // Grün oder Orange
  const title = isOnline ? "📦 Neue Bestellung (Versand)" : "🤝 Neue Reservierung (Barzahlung)";
  
  // Item Liste formatieren
  const itemCounts = order.items.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});
  
  const itemsList = Object.entries(itemCounts)
    .map(([name, count]) => `• ${count}x **${name}**`)
    .join('\n');

  const embed = {
    title: title,
    color: color,
    fields: [
      {
        name: "👤 Kunde",
        value: `${order.firstName} ${order.lastName || ''}\n${order.email || ''}\n${order.phone || ''}`,
        inline: true
      },
      {
        name: "💰 Summe",
        value: `**${order.totalAmount.toFixed(2)}€**\n${order.provider || 'Bar vor Ort'}`,
        inline: true
      },
      {
        name: "📍 Adresse",
        value: `${order.address.street}\n${order.address.zip} ${order.address.city}`,
        inline: false
      },
      {
        name: "🛒 Warenkorb",
        value: itemsList || "Keine Items",
        inline: false
      }
    ],
    footer: {
      text: `Order ID: ${order._id}`
    },
    timestamp: new Date().toISOString()
  };

  try {
    await axios.post(webhookUrl, { embeds: [embed] });
    console.log("🚀 Discord Benachrichtigung erfolgreich gesendet!");
  } catch (err) {
    console.error('❌ Discord API Error:', err.response ? err.response.data : err.message);
  }
};