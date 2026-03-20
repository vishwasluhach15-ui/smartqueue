const router = require('express').Router();
const Office = require('../models/Office');
const Token  = require('../models/Token');
const { protect } = require('../middleware/auth');

// GET /api/offices — list all offices
router.get('/', async (req, res) => {
  try {
    const offices = await Office.find({ isOpen: true });
    res.json(offices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/offices/:id — single office with live queue info
router.get('/:id', async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    const waitingCount = await Token.countDocuments({
      office: office._id,
      status: 'waiting',
    });

    res.json({ ...office.toJSON(), waitingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/offices — create office (admin setup)
router.post('/', async (req, res) => {
  try {
    const office = await Office.create(req.body);
    res.status(201).json(office);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/offices/seed — seed demo offices
router.post('/seed/demo', async (req, res) => {
  try {
    await Office.deleteMany({});
    const offices = await Office.insertMany([
      {
        name: 'MCD Birth & Death Certificate Office',
        address: 'Model Town, Rohtak, Haryana',
        city: 'Rohtak',
        services: [
          { name: 'Birth Certificate', avgMinutes: 12 },
          { name: 'Death Certificate', avgMinutes: 8 },
          { name: 'Certificate Correction', avgMinutes: 20 },
          { name: 'Status Check', avgMinutes: 5 },
        ],
        currentToken: 41,
        lastToken: 64,
        location: { lat: 28.8955, lng: 76.6066 },
      },
      {
        name: 'Rohtak Municipal Water Office',
        address: 'Civil Lines, Rohtak, Haryana',
        city: 'Rohtak',
        services: [
          { name: 'Bill Payment', avgMinutes: 5 },
          { name: 'New Connection', avgMinutes: 15 },
          { name: 'Complaint Registration', avgMinutes: 10 },
          { name: 'Meter Change', avgMinutes: 20 },
        ],
        currentToken: 12,
        lastToken: 18,
        location: { lat: 28.9008, lng: 76.5774 },
      },
      {
        name: 'Property Tax Office Rohtak',
        address: 'Subhash Nagar, Rohtak, Haryana',
        city: 'Rohtak',
        services: [
          { name: 'Tax Payment', avgMinutes: 10 },
          { name: 'Property Assessment', avgMinutes: 25 },
          { name: 'Objection Filing', avgMinutes: 30 },
          { name: 'NOC Certificate', avgMinutes: 15 },
        ],
        currentToken: 5,
        lastToken: 36,
        location: { lat: 28.8847, lng: 76.6122 },
      },
      {
        name: 'MCD Delhi — Ration Card Office',
        address: 'Kashmere Gate, Delhi NCR',
        city: 'Delhi',
        services: [
          { name: 'New Ration Card', avgMinutes: 20 },
          { name: 'Card Correction', avgMinutes: 15 },
          { name: 'Member Addition', avgMinutes: 10 },
          { name: 'Card Surrender', avgMinutes: 8 },
        ],
        currentToken: 22,
        lastToken: 55,
        location: { lat: 28.6677, lng: 77.2276 },
      },
      {
        name: 'Delhi Jal Board — Water Services',
        address: 'Karol Bagh, New Delhi',
        city: 'Delhi',
        services: [
          { name: 'Bill Payment', avgMinutes: 5 },
          { name: 'New Connection', avgMinutes: 20 },
          { name: 'Leak Complaint', avgMinutes: 8 },
          { name: 'Sewer Connection', avgMinutes: 25 },
        ],
        currentToken: 8,
        lastToken: 29,
        location: { lat: 28.6519, lng: 77.1909 },
      },
      {
        name: 'SDM Office — Gurugram',
        address: 'Sector 44, Gurugram, Haryana',
        city: 'Gurugram',
        services: [
          { name: 'Income Certificate', avgMinutes: 15 },
          { name: 'Caste Certificate', avgMinutes: 15 },
          { name: 'Domicile Certificate', avgMinutes: 20 },
          { name: 'Character Certificate', avgMinutes: 10 },
        ],
        currentToken: 14,
        lastToken: 42,
        location: { lat: 28.4595, lng: 77.0266 },
      },
    ]);
    res.json({ message: 'Demo offices seeded', offices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
