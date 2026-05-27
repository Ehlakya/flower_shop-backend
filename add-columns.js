const db = require('./config/db');

const addColumns = async () => {
  try {
    console.log("Checking and adding 'email' and 'profile_image' columns to 'users' table...");
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);`);
    console.log("✅ Columns added successfully.");
  } catch (error) {
    console.error("❌ Error adding columns:", error);
  } finally {
    process.exit(0);
  }
};

addColumns();
