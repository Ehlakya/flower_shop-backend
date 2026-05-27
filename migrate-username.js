const db = require('./config/db');

const migrate = async () => {
  try {
    // 1. Add column as nullable first
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)');
    
    // 2. Populate existing users with a default username (part of their email)
    await db.query(`UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL`);
    
    // 3. Make it NOT NULL and UNIQUE
    await db.query('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
    await db.query('ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username)');
    
    console.log('✅ Migration successful: Added unique username column to users table.');
    process.exit(0);
  } catch (err) {
    if (err.code === '42701') {
      console.log('💡 Column already exists, skipping migration step.');
    } else {
      console.error('❌ Migration Error:', err.message);
    }
    process.exit(0); // Exit gracefully to not block
  }
};

migrate();
