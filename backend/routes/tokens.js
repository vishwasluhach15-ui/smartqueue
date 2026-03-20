const router  = require('express').Router();
const Token   = require('../models/Token');
const Office  = require('../models/Office');
const { protect } = require('../middleware/auth');
const { sendSMS }  = require('../config/sms');

// POST /api/tokens/book — citizen books a token
router.post('/book', protect, async (req, res) => {
  try {
    const { officeId, service } = req.body;
    if (!officeId || !service)
      return res.status(400).json({ message: 'officeId and service required' });

    const office = await Office.findById(officeId);
    if (!office || !office.isOpen)
      return res.status(404).json({ message: 'Office not found or closed' });

    // Check if user already has an active token for this office
    const existing = await Token.findOne({
      user: req.user._id,
      office: officeId,
      status: { $in: ['waiting', 'serving'] },
    });
    if (existing)
      return res.status(400).json({ message: 'You already have an active token here', token: existing });

    // Issue next token
    office.lastToken += 1;
    await office.save();

    const peopleAhead = await Token.countDocuments({
      office: officeId,
      status: 'waiting',
    });

    const token = await Token.create({
      tokenNumber: office.lastToken,
      office: officeId,
      user: req.user._id,
      service,
      phone: req.user.phone,
      status: 'waiting',
    });

    // SMS confirmation
    await sendSMS(
      req.user.phone,
      `SmartQueue: Your token is #${office.lastToken} at ${office.name}. ~${peopleAhead * 5} min wait. We'll alert you when your turn is near.`
    );

    // Real-time broadcast to office room
    const io = req.app.get('io');
    io.to(`office_${officeId}`).emit('queue_update', {
      type: 'new_token',
      officeId,
      currentToken: office.currentToken,
      lastToken: office.lastToken,
      queueLength: office.lastToken - office.currentToken,
    });

    res.status(201).json({ token, peopleAhead, estimatedWait: peopleAhead * 5 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tokens/my — citizen's active tokens
router.get('/my', protect, async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user._id })
      .populate('office', 'name address currentToken lastToken')
      .sort({ createdAt: -1 })
      .limit(10);

    const enriched = tokens.map((t) => {
      const office = t.office;
      const peopleAhead = Math.max(0, t.tokenNumber - (office?.currentToken || 0) - 1);
      return { ...t.toJSON(), peopleAhead, estimatedWait: peopleAhead * 5 };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tokens/:id — single token status
router.get('/:id', protect, async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate('office');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    const office = token.office;
    const peopleAhead = Math.max(0, token.tokenNumber - (office?.currentToken || 0) - 1);

    res.json({ ...token.toJSON(), peopleAhead, estimatedWait: peopleAhead * 5 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tokens/:id/cancel — citizen cancels
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, user: req.user._id });
    if (!token) return res.status(404).json({ message: 'Token not found' });
    if (token.status !== 'waiting')
      return res.status(400).json({ message: 'Cannot cancel a token that is already being served or done' });

    token.status = 'cancelled';
    await token.save();

    const io = req.app.get('io');
    io.to(`office_${token.office}`).emit('queue_update', { type: 'cancelled', tokenId: token._id });

    res.json({ message: 'Token cancelled', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
