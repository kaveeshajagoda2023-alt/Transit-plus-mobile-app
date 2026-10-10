// Express app without listen()/DB connect, so tests can import it with supertest.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TransitPulse Member 2 API Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TransitPulse API is running',
    data: { database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' },
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));

// 404 + central error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
