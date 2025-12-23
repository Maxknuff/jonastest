import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'unread' } // unread, read, replied
});

export default mongoose.model('Message', MessageSchema);