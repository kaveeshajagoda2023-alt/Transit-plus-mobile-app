const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();

console.log('Testing MongoDB connection...');
connectDB().then(() => {
  console.log('Test completed.');
});
