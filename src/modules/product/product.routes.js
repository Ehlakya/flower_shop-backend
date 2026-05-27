const express = require("express");
const router = express.Router();
const controller = require("./product.controller");

router.post("/", controller.createProduct);
router.get("/", controller.getProducts);
router.delete("/:id", controller.deleteProduct);
router.put("/:id", controller.updateProduct);

module.exports = router;