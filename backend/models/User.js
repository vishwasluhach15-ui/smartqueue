const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    phone:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    role:        { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    officeId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Office' }, // for admin
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
