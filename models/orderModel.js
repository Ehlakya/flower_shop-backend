const db = require('../config/db');

const Order = {
  create: async (userId, total) => {
    const result = await db.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [userId, total]
    );
    return result.rows[0];
  }
};

module.exports = Order;
