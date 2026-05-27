const db = require('./config/db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('🚀 Starting Orders Table Migration...');
    
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8),
      ADD COLUMN IF NOT EXISTS address_snapshot TEXT,
      ADD COLUMN IF NOT EXISTS pincode_snapshot VARCHAR(20)
    `);
    
    console.log('✅ Orders table updated successfully with tracking columns.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
