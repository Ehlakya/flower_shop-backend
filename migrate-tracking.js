const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Order Tracking Migration...');
    
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL,
      ADD COLUMN IF NOT EXISTS longitude DECIMAL,
      ADD COLUMN IF NOT EXISTS address_snapshot TEXT,
      ADD COLUMN IF NOT EXISTS pincode_snapshot VARCHAR(10);
    `);
    
    console.log('✅ Migration Successful: Added tracking columns to orders table.');
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
