const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('[Config] JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}
if (!process.env.QR_SIGNING_SECRET) {
  console.warn('[Config] QR_SIGNING_SECRET is not set - falling back to JWT_SECRET for QR signing.');
}

// Connect to MongoDB
connectDB();

// 0.0.0.0 so the phone can reach the API over the LAN IP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] TransitPulse API Server running on port ${PORT}`);
});
