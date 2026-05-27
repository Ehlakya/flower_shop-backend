// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// // Test connection on startup
// const testConnection = async () => {
//   try {
//     const res = await pool.query('SELECT NOW()');
//     console.log('✅ Database Connected successfully to:', process.env.DB_NAME);
//   } catch (err) {
//     console.error('❌ Database Connection Error:', err.message);
//     console.error('Detailed Error:', err);
//   }
// };

// testConnection();

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   pool
// };


const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection on startup
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database Connected successfully");
    console.log(res.rows[0]);
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    console.error("Detailed Error:", err);
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};