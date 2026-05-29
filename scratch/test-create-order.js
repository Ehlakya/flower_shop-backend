const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../config/db');

async function testOrder() {
  const userId = 1; // Assuming user ID 1 exists (admin or a test user)
  const customerDetails = {
    name: "John Doe",
    phone: "1234567890",
    address: "123 Main St",
    city: "Coimbatore",
    pincode: "641001"
  };
  const cartItems = [
    { product_id: 1, quantity: 2, price: 500 }
  ];
  const total = 1000;
  const paymentMethod = "COD";
  const latitude = 11.0168;
  const longitude = 76.9558;

  const client = await db.connect();
  try {
    console.log('📦 Starting transaction...');
    await client.query('BEGIN');

    // 1. Upsert Customer Info
    console.log('Step 1: Upsert Customer Info...');
    await client.query(
      `INSERT INTO customers (user_id, name, phone, address, city, pincode) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         city = EXCLUDED.city,
         pincode = EXCLUDED.pincode`,
      [userId, customerDetails.name, customerDetails.phone, customerDetails.address, customerDetails.city, customerDetails.pincode]
    );

    // 2. Create the Order
    console.log('Step 2: Create Order...');
    const orderInsert = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, latitude, longitude, address_snapshot, pincode_snapshot) 
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7) RETURNING id`,
      [userId, total, paymentMethod, latitude, longitude, customerDetails.address, customerDetails.pincode]
    );
    const orderId = orderInsert.rows[0].id;
    console.log('Order ID created:', orderId);

    // 3. Insert Order Items
    console.log('Step 3: Insert Order Items...');
    for (const item of cartItems) {
      const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [item.product_id]);
      if (productCheck.rows.length === 0) {
        throw new Error(`Invalid product: The product with ID ${item.product_id} does not exist in our catalog.`);
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity || 1, item.price]
      );
    }

    // 4. Clear the Cart
    console.log('Step 4: Clear Cart...');
    await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    console.log('✅ Success! Order created.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during transaction:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

testOrder();
