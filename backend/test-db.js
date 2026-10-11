import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check both backend/.env and root .env
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(process.cwd(), 'backend', '.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Fallback if not loaded via dotenv
const DEFAULT_URI = 'mongodb+srv://it23759152_db_user:r100SSYPSuH7kfcy@cluster0.8h3sprz.mongodb.net/transitplus?retryWrites=true&w=majority&appName=Cluster0';
const uri = process.env.MONGODB_URI || DEFAULT_URI;

console.log('----------------------------------------------------');
console.log('TRANSITPLUS MONGODB ATLAS CONNECTION DIAGNOSTIC TEST');
console.log('----------------------------------------------------');
console.log('Testing URI:', uri.replace(/:([^:@]+)@/, ':****@'));

try {
  console.log('\nConnecting to MongoDB Atlas cluster (timeout: 10s)...');
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ STATUS: CONNECTED SUCCESSFULLY TO MONGODB ATLAS!');
  console.log('   Cluster Host   :', conn.connection.host);
  console.log('   Database Name  :', conn.connection.name);
  console.log('   Ready State    :', conn.connection.readyState === 1 ? '1 (CONNECTED)' : conn.connection.readyState);
  
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('   Collections in DB:', collections.length > 0 ? collections.map(c => c.name).join(', ') : '(Empty database ready for collections)');
  
  await mongoose.disconnect();
  console.log('\nDiagnostic completed: Connection is 100% active and working.');
  process.exit(0);
} catch (err) {
  console.error('\n❌ STATUS: CONNECTION FAILED');
  console.error('   Error Code   :', err.code || 'N/A');
  console.error('   Error Message:', err.message);

  if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
    console.error('\n👉 DIAGNOSIS: Invalid Database Username or Password.');
    console.error('   Check your credentials in MongoDB Atlas -> Database Access.');
  } else if (err.message.includes('whitelist') || err.message.includes('timed out') || err.message.includes('SSL') || err.message.includes('ENOTFOUND') || err.message.includes('Could not connect to any servers')) {
    console.error('\n👉 DIAGNOSIS: IP Address Not Whitelisted in MongoDB Atlas.');
    console.error('   MongoDB Atlas blocks all connections by default until your IP is added.');
    console.error('   How to fix:');
    console.error('   1. Log into https://cloud.mongodb.com');
    console.error('   2. Navigate to: Security -> Network Access');
    console.error('   3. Click "+ Add IP Address" -> Click "Allow Access From Anywhere" (0.0.0.0/0)');
    console.error('   4. Click Confirm and wait 1 minute for changes to take effect.');
    console.error('   5. Re-run: node backend/test-db.js');
  }
  process.exit(1);
}
