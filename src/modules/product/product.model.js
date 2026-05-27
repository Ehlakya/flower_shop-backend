const pool = require("../../config/db");

const createProduct = async (data) => {
  const { name, price, category, image } = data;
  const result = await pool.query(
    "INSERT INTO products(name, price, category, image) VALUES($1,$2,$3,$4) RETURNING *",
    [name, price, category, image]
  );
  return result.rows[0];
};

const getProducts = async () => {
  const result = await pool.query("SELECT * FROM products");
  return result.rows;
};

const deleteProduct = async (id) => {
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
};

const updateProduct = async (id, data) => {
  const { name, price, category, image } = data;
  const result = await pool.query(
    "UPDATE products SET name=$1, price=$2, category=$3, image=$4 WHERE id=$5 RETURNING *",
    [name, price, category, image, id]
  );
  return result.rows[0];
};

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};