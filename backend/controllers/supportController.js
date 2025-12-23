import Message from '../models/Message.js';

export const createMessage = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, message: 'Bitte alle Felder ausfüllen.' });
    }

    const newMessage = new Message({ email, message });
    await newMessage.save();

    console.log(`📩 Neue Support-Nachricht von ${email}`);

    res.status(201).json({ success: true, message: 'Nachricht gesendet!' });
  } catch (error) {
    console.error('Support Error:', error);
    res.status(500).json({ success: false, message: 'Server Fehler.' });
  }
};