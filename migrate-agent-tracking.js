const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Agent Tracking Migration...');
    
    // Add columns for current agent location to orders table
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS agent_lat DECIMAL,
      ADD COLUMN IF NOT EXISTS agent_lng DECIMAL;
    `);
    
    console.log('✅ Migration Successful: Added agent tracking columns to orders table.');
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
