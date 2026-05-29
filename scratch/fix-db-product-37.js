const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../config/db');

async function fixProduct37() {
  try {
    console.log('🌱 Fixing product ID 37 in database...');
    const res = await db.query("UPDATE products SET image = '/images/plant1.jpg' WHERE id = 37 RETURNING id, name, image");
    if (res.rows.length > 0) {
      console.log('Updated successfully:', res.rows[0]);
    } else {
      console.log('Product ID 37 not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating product ID 37:', err);
    process.exit(1);
  }
}

fixProduct37();
