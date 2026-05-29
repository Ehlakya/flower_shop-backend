const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../config/db');

async function check() {
  try {
    const res = await db.query('SELECT id, name, category, image FROM products ORDER BY id ASC');
    console.log('Database products:');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching products:', err);
    process.exit(1);
  }
}

check();
