const Product = require('../models/productModel');

const getProducts = async (req, res) => {
  const { category } = req.query;
  try {
    let products;
    if (category) {
      products = await Product.getByCategory(category);
    } else {
      products = await Product.getAll();
    }
    res.json(products);
  } catch (error) {
    console.error('❌ Product Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.getById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found', error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('❌ Product Details Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
  }
};

const addProduct = async (req, res) => {
  // Multer stores original text fields in req.body and the file in req.file
  const { name, price, category, description } = req.body;
  const image = req.file ? req.file.filename : null; // Save filename only

  if (!name || !price || !category || !image) {
    return res.status(400).json({ message: 'Missing required fields (Name, Price, Category, and Image are mandatory)', error: 'Missing required fields' });
  }

  try {
    const newProduct = await Product.create(name, price, category, image, description);
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('❌ Add Product Error:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, existingImage } = req.body;
  
  // If a new file was uploaded, use it. Otherwise, use the existing image path.
  const image = req.file ? req.file.filename : existingImage;

  try {
    const updated = await Product.update(id, name, price, category, image, description);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found', error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.error('❌ Update Product Error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Product.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found', error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('❌ Delete Product Error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.getLatestBalanced();
    res.json(products);
  } catch (error) {
    console.error('❌ Latest Products Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch latest products', error: error.message });
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getLatestProducts
};
