const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    services:    [{ name: String, avgMinutes: Number }],
    openTime:    { type: String, default: '09:00' },
    closeTime:   { type: String, default: '17:00' },
    isOpen:      { type: Boolean, default: true },
    currentToken: { type: Number, default: 0 },  // token being served right now
    lastToken:   { type: Number, default: 0 },    // last issued token number
    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

// Virtual: people in queue
officeSchema.virtual('queueLength').get(function () {
  return Math.max(0, this.lastToken - this.currentToken);
});

// Estimated wait in minutes (avg 5 min per person)
officeSchema.virtual('estimatedWait').get(function () {
  return this.queueLength * 5;
});

officeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Office', officeSchema);
