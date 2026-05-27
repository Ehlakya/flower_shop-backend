const db = require('./config/db');

const check = async () => {
  try {
    const res = await db.query('SELECT id, name, username, role, email FROM users');
    console.log('--- Current Users in DB ---');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

check();
