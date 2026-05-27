const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllCustomers, getDashboardStats } = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', authMiddleware, getUserProfile);
router.get('/customers', authMiddleware, isAdmin, getAllCustomers);
router.get('/stats', authMiddleware, isAdmin, getDashboardStats);

module.exports = router;
