const db = require('./config/db');

const cleanup = async () => {
  try {
    console.log('🧹 Normalising all usernames to lowercase...');
    await db.query('UPDATE users SET username = LOWER(username)');
    console.log('✅ All usernames are now lowercased.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup Error:', err);
    process.exit(1);
  }
};

cleanup();
