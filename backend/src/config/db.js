const mongoose = require('mongoose');

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitpulse';
    const conn = await mongoose.connect(dbUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    // Non-blocking in local dev so API health checks can still run
  }
};

module.exports = connectDB;
