const db = require('../config/db');

async function check() {
  try {
    const res = await db.query(`
      SELECT conname, conrelid::regclass as table_name
      FROM pg_constraint 
      WHERE conrelid IN ('cart'::regclass, 'order_items'::regclass)
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
