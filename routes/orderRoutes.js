const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrdersForAdmin, updateOrderStatus, updateOrderLocation } = require('../controllers/orderController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/admin/all', authMiddleware, isAdmin, getAllOrdersForAdmin);
router.put('/:id/status', authMiddleware, isAdmin, updateOrderStatus);
router.put('/:id/location', authMiddleware, updateOrderLocation);

module.exports = router;
