const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../config/db');

const targetFlowers = [
  { name: "Roses Basket", image: "/images/flower1.jpg" },
  { name: "Mixed Flowers", image: "/images/flower2.jpg" },
  { name: "Roses Bokeh", image: "/images/flower3.jpg" },
  { name: "Roses Bokeh (Pink)", image: "/images/flower4.jpg" },
  { name: "Roses Bokeh (White)", image: "/images/flower5.jpeg" },
  { name: "Tulip Bokeh", image: "/images/flower6.png" },
  { name: "Flowers Basket", image: "/images/flower8.jpg" }
];

async function fixFlowers() {
  try {
    console.log('🌱 Fixing flower image paths in database...');
    for (const f of targetFlowers) {
      const res = await db.query('UPDATE products SET image = $1 WHERE name = $2 RETURNING id', [f.image, f.name]);
      if (res.rows.length > 0) {
        console.log(`Updated "${f.name}" to ${f.image}`);
      } else {
        console.log(`Product "${f.name}" not found in database.`);
      }
    }

    // Check if "Mixed Flowers Premium" exists
    const checkPremium = await db.query('SELECT * FROM products WHERE name = $1', ["Mixed Flowers Premium"]);
    if (checkPremium.rows.length === 0) {
      console.log('Inserting missing "Mixed Flowers Premium"...');
      await db.query(
        'INSERT INTO products (name, price, category, image, description) VALUES ($1, $2, $3, $4, $5)',
        ["Mixed Flowers Premium", 450, "Flowers", "/images/flower7.avif", "Colorful bouquet"]
      );
      console.log('Inserted "Mixed Flowers Premium"');
    }

    console.log('✅ Flower fix complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing flowers:', err);
    process.exit(1);
  }
}

fixFlowers();
