const db = require('../config/db');

const User = {
  findByUsername: async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },
  create: async (name, username, email, password) => {
    const result = await db.query(
      'INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, username, email',
      [name, username, email, password]
    );
    return result.rows[0];
  }
};

module.exports = User;
