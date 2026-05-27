const db = require('./config/db');

async function migrate() {
  try {
    console.log('🚀 Starting migration: Adding ON DELETE CASCADE to product references...');

    // Fix Cart table
    console.log('🔄 Updating cart table...');
    await db.query('ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_product_id_fkey');
    await db.query('ALTER TABLE cart ADD CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');

    // Fix Order Items table
    console.log('🔄 Updating order_items table...');
    await db.query('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey');
    await db.query('ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
