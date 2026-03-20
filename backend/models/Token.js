const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true },
    office:      { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:     { type: String, required: true },
    phone:       { type: String, required: true },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'done', 'cancelled', 'no_show'],
      default: 'waiting',
    },
    issuedAt:    { type: Date, default: Date.now },
    calledAt:    { type: Date },
    completedAt: { type: Date },
    notified:    { type: Boolean, default: false }, // SMS sent when 3 ahead
  },
  { timestamps: true }
);

// People ahead of this token
tokenSchema.virtual('peopleAhead').get(function () {
  // Calculated dynamically in route, stored as a transient field
  return this._peopleAhead || 0;
});

tokenSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Token', tokenSchema);
