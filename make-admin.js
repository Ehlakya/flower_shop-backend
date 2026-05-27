const db = require('./config/db');

const addRoleAndPromote = async (username) => {
  try {
    // 1. Add column if it doesn't exist
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    `);
    console.log('✅ Role column verified/added');

    // 2. Promote user to admin
    if (username) {
      const result = await db.query(
        'UPDATE users SET role = $1 WHERE username = $2 RETURNING *',
        ['admin', username]
      );
      if (result.rowCount > 0) {
        console.log(`🚀 User '${username}' promoted to admin!`);
      } else {
        console.log(`❌ User '${username}' not found.`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    process.exit();
  }
};

const username = process.argv[2];
addRoleAndPromote(username);
