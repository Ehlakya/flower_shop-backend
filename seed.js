const db = require('./config/db');
const bcrypt = require('bcryptjs');
const seedProducts = require('./config/seedProducts');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Products
    await seedProducts();

    // 2. Seed Admin User
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const adminName = 'System Admin';
    const adminEmail = 'admin@example.com';

    console.log(`👤 Seeding admin user: '${adminUsername}'...`);

    // Check if the admin user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [adminUsername]);
    
    // Check if email column exists in users table to prevent schema mismatch errors
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);
    const hasEmailColumn = columnCheck.rows.length > 0;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (userCheck.rows.length > 0) {
      // Admin exists, update credentials and role
      if (hasEmailColumn) {
        await db.query(
          'UPDATE users SET name = $1, password = $2, role = $3, email = $4 WHERE username = $5',
          [adminName, hashedPassword, 'admin', adminEmail, adminUsername]
        );
      } else {
        await db.query(
          'UPDATE users SET name = $1, password = $2, role = $3 WHERE username = $4',
          [adminName, hashedPassword, 'admin', adminUsername]
        );
      }
      console.log(`✅ Admin user '${adminUsername}' credentials updated successfully.`);
    } else {
      // Admin doesn't exist, create new admin
      if (hasEmailColumn) {
        await db.query(
          'INSERT INTO users (name, username, email, password, role) VALUES ($1, $2, $3, $4, $5)',
          [adminName, adminUsername, adminEmail, hashedPassword, 'admin']
        );
      } else {
        await db.query(
          'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)',
          [adminName, adminUsername, hashedPassword, 'admin']
        );
      }
      console.log(`✅ Admin user '${adminUsername}' created successfully.`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
