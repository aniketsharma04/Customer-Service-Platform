// models/Request.js

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  category: { type: String, required: true },
  comment: { type: String, required: true },
  user: {
    id: String,
    name: String,
    email: String
  },
  status: { type: String, default: 'open' },
  intercomContactId: String,
  intercomConversationId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);