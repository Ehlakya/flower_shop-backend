const db = require('../config/db');
const Product = require('../models/productModel');
const initDB = require('../config/initDb');

async function test() {
  try {
    // First run initDB to ensure schema is correct locally
    await initDB();
    console.log('initDB ran successfully.');

    // Now try creating a product
    const product = await Product.create('Test Name', 100, 'Flowers', 'test.jpg', 'Test Description');
    console.log('Created product:', product);

    // Clean up the test product
    await db.query('DELETE FROM products WHERE id = $1', [product.id]);
    console.log('Cleaned up test product.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating product:', err);
    process.exit(1);
  }
}

test();
