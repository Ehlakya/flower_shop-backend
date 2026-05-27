const db = require('../config/db');

const Product = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  },
  getById: async (id) => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  },
  getByCategory: async (category) => {
    const result = await db.query('SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC', [category]);
    return result.rows;
  },
  create: async (name, price, category, image, description) => {
    const result = await db.query(
      'INSERT INTO products (name, price, category, image, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, category, image, description]
    );
    return result.rows[0];
  },
  update: async (id, name, price, category, image, description) => {
    const result = await db.query(
      'UPDATE products SET name = $1, price = $2, category = $3, image = $4, description = $5 WHERE id = $6 RETURNING *',
      [name, price, category, image, description, id]
    );
    return result.rows[0];
  },
  getLatestBalanced: async () => {
    const query = `
      SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC) as rn
        FROM products
        WHERE category IN ('Flowers', 'Cakes', 'Gifts', 'Plants')
      ) t
      WHERE rn <= 2
      ORDER BY category ASC, created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },
  delete: async (id) => {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Product;
