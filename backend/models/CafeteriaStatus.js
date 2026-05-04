const mongoose = require('mongoose');

const cafeteriaStatusSchema = new mongoose.Schema({
  notCrowded: { type: Number, default: 0 },
  moderate: { type: Number, default: 0 },
  crowded: { type: Number, default: 0 },
  reactions: [{
    type: { type: String, enum: ['queue', 'fast', 'rush'] },
    count: { type: Number, default: 0 }
  }]
});

module.exports = mongoose.model('CafeteriaStatus', cafeteriaStatusSchema);
