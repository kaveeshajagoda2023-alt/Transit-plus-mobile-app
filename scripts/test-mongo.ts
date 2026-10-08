import { connectMongoDB, getMongooseConnectionState } from '../backend/src/db/mongoConnect.js';

async function testConnection() {
  console.log('Testing TransitPulse MongoDB Connection...');
  const success = await connectMongoDB();
  console.log('Connection Result:', success);
  console.log('Mongoose State:', getMongooseConnectionState());
  process.exit(success ? 0 : 1);
}

testConnection();
