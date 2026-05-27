const service = require("./product.service");

exports.createProduct = async (req, res) => {
  const data = await service.create(req.body);
  res.json(data);
};

exports.getProducts = async (req, res) => {
  const data = await service.getAll();
  res.json(data);
};

exports.deleteProduct = async (req, res) => {
  await service.delete(req.params.id);
  res.json({ message: "Deleted" });
};

exports.updateProduct = async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json(data);
};