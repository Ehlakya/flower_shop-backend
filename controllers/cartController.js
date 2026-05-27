const Cart = require('../models/cartModel');

const getCart = async (req, res) => {
  const user_id = req.user.id;
  try {
    const items = await Cart.getByUserId(user_id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;
  try {
    const item = await Cart.add(user_id, product_id, quantity || 1);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;
  try {
    const item = await Cart.delete(id, user_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in your cart' });
    }
    res.json({ message: 'Item removed from cart', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart };
