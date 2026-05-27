const db = require('../config/db');

const Cart = {
  getByUserId: async (userId) => {
    const result = await db.query(`
      SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = $1
    `, [userId]);
    return result.rows;
  },
  add: async (userId, productId, quantity) => {
    // Check if it already exists
    const existing = await db.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    if (existing.rows.length > 0) {
      const result = await db.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
        [quantity, existing.rows[0].id]
      );
      return result.rows[0];
    }
    const result = await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, productId, quantity]
    );
    return result.rows[0];
  },
  delete: async (id, userId) => {
    const result = await db.query('DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    return result.rows[0];
  }
};

module.exports = Cart;
