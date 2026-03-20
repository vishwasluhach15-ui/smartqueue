const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Office = require('../models/Office');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ name, phone, password });
    res.status(201).json({ token: signToken(user._id), user: { id: user._id, name, phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid phone or password' });

    res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, phone, role: user.role, officeId: user.officeId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//register-admin
router.post('/register-admin', async (req, res) => {
  try {
    const { name, phone, password, officeId, secretKey } = req.body;
    
    // Secret key check
    if (secretKey !== 'SMARTQUEUE-ADMIN-2026') {
      return res.status(403).json({ message: 'Invalid admin secret key. Contact system administrator.' });
    }

    const office = await Office.findById(officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ name, phone, password, role: 'admin', officeId });
    res.status(201).json({ token: signToken(user._id), user: { id: user._id, name, phone, role: 'admin', officeId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// In-memory OTP store (use Redis in production)
const otpStore = {};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'No account found with this phone number' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

    // Send SMS
    const { sendSMS } = require('../config/sms');
    await sendSMS(phone, `SmartQueue: Your password reset OTP is ${otp}. Valid for 10 minutes. Do not share.`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    const record = otpStore[phone];
    if (!record) return res.status(400).json({ message: 'OTP not requested. Please request a new one.' });
    if (Date.now() > record.expires) {
      delete otpStore[phone];
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Try again.' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();
    delete otpStore[phone];

    res.json({ message: 'Password reset successful! Please login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
