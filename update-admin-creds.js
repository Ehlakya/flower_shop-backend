const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updateAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // 1. Reset all other admins to user if necessary, or just pick one to be the primary admin
    await pool.query("UPDATE users SET role = 'user' WHERE username != 'admin'");

    // 2. Set the designated admin account
    const result = await pool.query(
      "UPDATE users SET username = $1, password = $2, role = 'admin' WHERE id = 11 RETURNING id, username, role",
      ['admin@gmail.com', hashedPassword]
    );
    
    console.log('✅ Admin credentials updated successfully:', result.rows);
  } catch (err) {
    console.error('❌ Error updating admin:', err);
  } finally {
    await pool.end();
  }
}

updateAdmin();
