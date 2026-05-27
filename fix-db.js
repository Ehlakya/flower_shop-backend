const db = require('./config/db');

const fix = async () => {
  try {
    await db.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT');
    console.log('✅ Added description column to products');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding column:', err.message);
    process.exit(1);
  }
};

fix();
