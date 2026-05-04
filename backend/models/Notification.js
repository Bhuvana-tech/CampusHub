const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request', 'accept', 'message', 'invite'], required: true },
  content: { type: String, required: true },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
