const router = require('express').Router();
const Token  = require('../models/Token');
const Office = require('../models/Office');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSMS } = require('../config/sms');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/dashboard — stats for admin's office
router.get('/dashboard', async (req, res) => {
  try {
    const officeId = req.user.officeId;
    const office   = await Office.findById(officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waiting, serving, done, noShow, queueList] = await Promise.all([
      Token.countDocuments({ office: officeId, status: 'waiting' }),
      Token.countDocuments({ office: officeId, status: 'serving' }),
      Token.countDocuments({ office: officeId, status: 'done', completedAt: { $gte: today } }),
      Token.countDocuments({ office: officeId, status: 'no_show' }),
      Token.find({ office: officeId, status: { $in: ['waiting', 'serving'] } })
        .populate('user', 'name phone')
        .sort({ tokenNumber: 1 })
        .limit(20),
    ]);

    // Avg service time today
    const doneTodayTokens = await Token.find({
      office: officeId, status: 'done',
      calledAt: { $exists: true }, completedAt: { $exists: true },
      completedAt: { $gte: today },
    });

    let avgServiceMin = 0;
    if (doneTodayTokens.length > 0) {
      const totalMs = doneTodayTokens.reduce(
        (sum, t) => sum + (new Date(t.completedAt) - new Date(t.calledAt)), 0
      );
      avgServiceMin = Math.round(totalMs / doneTodayTokens.length / 60000);
    }

    res.json({
      office,
      stats: { waiting, serving, done, noShow, avgServiceMin },
      queue: queueList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/call-next — call the next token
router.post('/call-next', async (req, res) => {
  try {
    const officeId = req.user.officeId;
    const office   = await Office.findById(officeId);

    // Mark current serving token as done
    const currentServing = await Token.findOne({ office: officeId, status: 'serving' });
    if (currentServing) {
      currentServing.status = 'done';
      currentServing.completedAt = new Date();
      await currentServing.save();
    }

    // Get next waiting token
    const next = await Token.findOne({ office: officeId, status: 'waiting' })
      .populate('user', 'name phone')
      .sort({ tokenNumber: 1 });

    if (!next) {
      return res.json({ message: 'No more tokens in queue', office });
    }

    next.status = 'serving';
    next.calledAt = new Date();
    await next.save();

    // Update office current token
    office.currentToken = next.tokenNumber;
    await office.save();

    // SMS to the person being called
    await sendSMS(next.phone, `SmartQueue: Token #${next.tokenNumber} — please proceed to the counter at ${office.name} NOW.`);

    // Check if 3rd person in queue needs a heads-up SMS
    const thirdAhead = await Token.findOne({ office: officeId, status: 'waiting' })
      .sort({ tokenNumber: 1 })
      .skip(2);
    if (thirdAhead && !thirdAhead.notified) {
      await sendSMS(thirdAhead.phone, `SmartQueue: Heads up! Token #${thirdAhead.tokenNumber} — 3 people ahead of you at ${office.name}. Please start heading over.`);
      thirdAhead.notified = true;
      await thirdAhead.save();
    }

    // Real-time broadcast to all clients in this office room
    const io = req.app.get('io');
    io.to(`office_${officeId}`).emit('queue_update', {
      type:         'next_called',
      officeId:     officeId.toString(),
      currentToken: office.currentToken,
      lastToken:    office.lastToken,
      calledToken:  next.tokenNumber,
      queueLength:  office.lastToken - office.currentToken,
    });

    // Broadcast to admin room too
    io.to(`admin_${officeId}`).emit('dashboard_update', {
      currentToken: office.currentToken,
      serving:      next,
    });

    res.json({ called: next, office });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/token/:id/no-show — mark no-show
router.patch('/token/:id/no-show', async (req, res) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, office: req.user.officeId });
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'no_show';
    await token.save();

    const io = req.app.get('io');
    io.to(`office_${req.user.officeId}`).emit('queue_update', { type: 'no_show', tokenId: token._id });

    res.json({ message: 'Marked as no-show', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/office/toggle — open/close office
router.patch('/office/toggle', async (req, res) => {
  try {
    const office = await Office.findById(req.user.officeId);
    office.isOpen = !office.isOpen;
    await office.save();
    res.json({ isOpen: office.isOpen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
