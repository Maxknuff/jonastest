import Joi from 'joi';
import axios from 'axios';
import Order from '../models/Order.js';

// --- CONFIG ---
const DISCORD_URL = process.env.DISCORD_WEBHOOK_URL;

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
  
  // Items validieren
  items: Joi.array().items(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      name: Joi.string().required()
    }).unknown(true)
  ).min(1).required()
}).unknown(true); // Erlaubt zusätzliche Felder, falls das Frontend mehr sendet


// --- MAIN CONTROLLER ---
export const createOrder = async (req, res) => {
  try {
    console.log("📥 Neue Bestellung empfangen:", req.body.paymentMethod);

    // 1. Validieren
    const validData = await orderSchema.validateAsync(req.body, { stripUnknown: true });

    // 2. Preis berechnen (Sicherheits-Check: Frontend-Preise werden ignoriert)
    // HINWEIS: Hier nutzen wir einen Test-Preis. Später würdest du die Preise aus der DB holen.
    const calculatedTotal = validData.items.length * 0.01; // 1 Cent pro Item zum Testen

    // 3. In Datenbank speichern
    const newOrder = new Order({
      ...validData,
      totalAmount: calculatedTotal,
      status: 'pending',
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Bestellung in DB gespeichert:", savedOrder._id);

    // 4. An Discord senden (Feuer & Vergessen)
    await sendToDiscord(savedOrder);

    // 5. Erfolg ans Frontend melden
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
  if (!DISCORD_URL) {
    console.warn("⚠️ Keine DISCORD_WEBHOOK_URL in .env gefunden!");
    return;
  }

  // Design Logik: Barzahlung = Orange, Versand = Grün
  const isOnline = order.paymentMethod === 'ONLINE';
  const color = isOnline ? 5763719 : 15105570; // Grün (#57F287) oder Orange (#E67E22)
  const title = isOnline ? "📦 Neue Bestellung (Versand)" : "🤝 Neue Reservierung (Barzahlung)";
  
  // Items schön formatieren
  // Wir zählen gleiche Items zusammen (z.B. "2x Ledger Nano X")
  const itemCounts = order.items.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});
  
  const itemsList = Object.entries(itemCounts)
    .map(([name, count]) => `• ${count}x **${name}**`)
    .join('\n');

  // Embed zusammenbauen
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
        name: "💰 Summe & Zahlung",
        value: `**${order.totalAmount.toFixed(2)}€**\nVia: ${order.provider || 'Bar vor Ort'}`,
        inline: true
      },
      {
        name: "📍 Adresse",
        value: `${order.address.street}\n${order.address.zip} ${order.address.city}`,
        inline: false
      },
      {
        name: "🛒 Warenkorb",
        value: itemsList,
        inline: false
      }
    ],
    footer: {
      text: `Order ID: ${order._id} | ${new Date().toLocaleTimeString('de-DE')} Uhr`
    }
  };

  try {
    await axios.post(DISCORD_URL, { embeds: [embed] });
    console.log("🚀 Discord Benachrichtigung gesendet!");
  } catch (err) {
    console.error('❌ Discord Senden fehlgeschlagen:', err.message);
  }
};