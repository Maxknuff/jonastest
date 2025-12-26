import Joi from 'joi';
import axios from 'axios';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Validierungsschema
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
      name: Joi.string().required(),
      // Optional: quantity im Item-Objekt erlauben, falls das Frontend es so sendet
      quantity: Joi.number().optional().default(1)
    }).unknown(true)
  ).min(1).required()
}).unknown(true);

export const createOrder = async (req, res) => {
  try {
    console.log("📥 Neue Bestellung empfangen");
    const validData = await orderSchema.validateAsync(req.body, { stripUnknown: true });
    
    // --- 1. MENGEN ZUSAMMENFASSEN ---
    // Wir zählen, wie oft jede ID bestellt wurde
    const itemQuantities = {};
    validData.items.forEach(item => {
      // Falls das Frontend explizit eine Menge mitsendet (item.quantity), nutzen wir die.
      // Falls das Frontend jedes Item einzeln sendet (Array mit 5x gleichem Item), addieren wir 1.
      const qty = item.quantity || 1;
      itemQuantities[item.id] = (itemQuantities[item.id] || 0) + qty;
    });

    // --- 2. DATENBANK-CHECK (Preise & Bestand) ---
    let calculatedTotal = 0;
    
    // Wir gehen durch jede einzigartige Produkt-ID in der Bestellung
    for (const [productId, requestedQty] of Object.entries(itemQuantities)) {
      
      // Suche das Produkt in der Datenbank
      const dbProduct = await Product.findOne({ productId });

      // FEHLER: Produkt existiert nicht in der DB
      if (!dbProduct) {
        throw new Error(`Produkt nicht gefunden: ${productId}. Bitte Admin kontaktieren.`);
      }

      // CHECK: Bestand
      if (dbProduct.stock < requestedQty) {
        return res.status(400).json({ 
          success: false, 
          message: `Nicht genügend Bestand für "${dbProduct.name}". Vorhanden: ${dbProduct.stock}, im Warenkorb: ${requestedQty}.` 
        });
      }

      // PREIS: Berechnen (Preis aus DB * Menge)
      calculatedTotal += dbProduct.price * requestedQty;
    }

    console.log("💰 Berechneter Gesamtbetrag:", calculatedTotal);

    // --- 3. BESTELLUNG SPEICHERN ---
    const newOrder = new Order({
      ...validData,
      totalAmount: calculatedTotal,
      status: 'pending',
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Bestellung gespeichert:", savedOrder._id);

    // --- 4. BESTAND AKTUALISIEREN ---
    // Wir ziehen die gekauften Mengen ab
    for (const [productId, qty] of Object.entries(itemQuantities)) {
      await Product.findOneAndUpdate(
        { productId },
        { $inc: { stock: -qty } }
      );
    }

    // --- 5. DISCORD BENACHRICHTIGUNG ---
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

// --- DISCORD HELPER ---
const sendToDiscord = async (order) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const isOnline = order.paymentMethod === 'ONLINE';
  const color = isOnline ? 5763719 : 15105570; 
  
  // Items schön formatieren
  const itemCounts = {};
  order.items.forEach(item => {
    itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
  });
  
  const itemsList = Object.entries(itemCounts)
    .map(([name, count]) => `• ${count}x **${name}**`)
    .join('\n');

  const embed = {
    title: isOnline ? "📦 Neue Bestellung" : "🤝 Neue Reservierung",
    color: color,
    fields: [
      { name: "👤 Kunde", value: `${order.firstName} ${order.lastName || ''}\n${order.email || ''}`, inline: true },
      { name: "💰 Summe", value: `**${order.totalAmount.toFixed(2)}€**`, inline: true },
      { name: "🛒 Warenkorb", value: itemsList || "Keine Items", inline: false },
      { name: "📍 Adresse", value: `${order.address.street}, ${order.address.zip} ${order.address.city}`, inline: false }
    ],
    footer: { text: `Order ID: ${order._id}` },
    timestamp: new Date().toISOString()
  };

  try { await axios.post(webhookUrl, { embeds: [embed] }); } catch (err) { console.error("Discord Error", err); }
};