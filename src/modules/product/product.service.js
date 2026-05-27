const Product = require("./product.model");

exports.create = (data) => Product.createProduct(data);
exports.getAll = () => Product.getProducts();
exports.delete = (id) => Product.deleteProduct(id);
exports.update = (id, data) => Product.updateProduct(id, data);