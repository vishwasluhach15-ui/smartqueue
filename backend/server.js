const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/offices', require('./routes/offices'));
app.use('/api/tokens',  require('./routes/tokens'));
app.use('/api/admin',   require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Socket.io — real-time queue updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Citizen joins a room for their office
  socket.on('join_office', (officeId) => {
    socket.join(`office_${officeId}`);
    console.log(`Socket ${socket.id} joined office_${officeId}`);
  });

  // Admin joins admin room
  socket.on('join_admin', (officeId) => {
    socket.join(`admin_${officeId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartqueue')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
