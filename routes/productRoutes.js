const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getLatestProducts 
} = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/latest-products', getLatestProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin Protected Routes
// Use upload.single('image') to handle the "image" field in multipart/form-data
router.post('/', authMiddleware, isAdmin, upload.single('image'), addProduct);
router.put('/:id', authMiddleware, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
