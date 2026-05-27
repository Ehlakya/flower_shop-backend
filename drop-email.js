const db = require('./config/db');

const dropColumn = async () => {
  try {
    console.log('🗑️ Dropping email column from users table...');
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS email');
    console.log('✅ Email column removed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping column:', err.message);
    process.exit(1);
  }
};

dropColumn();
