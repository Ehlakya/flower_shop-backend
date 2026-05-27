const db = require('./db');

const initDB = async () => {
  try {
    // Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');

    // Products Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(50),
        image VARCHAR(255),
        description TEXT
      );
    `);
    console.log('✅ Products table ready');

    // Cart Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Cart table ready');

    // Orders Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        latitude NUMERIC(10, 8),
        longitude NUMERIC(11, 8),
        agent_lat NUMERIC(10, 8),
        agent_lng NUMERIC(11, 8),
        address_snapshot TEXT,
        pincode_snapshot VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Ensure columns exist if table was already created
    await db.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS agent_lat NUMERIC(10, 8);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS agent_lng NUMERIC(11, 8);
    `);
    console.log('✅ Orders table ready');

    // Customers Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100),
        pincode VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Customers table ready');

    // Order Items Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      );
    `);
    console.log('✅ Order Items table ready');

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

module.exports = initDB;
