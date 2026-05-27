const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  const lowerUsername = username ? username.trim().toLowerCase() : "";

  try {
    // Check for existing username
    const existingUsername = await User.findByUsername(lowerUsername);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // email added to the parameter list
    const user = await User.create(name, lowerUsername, email, hashedPassword);
    
    // Generate token for instant login after signup
    const token = jwt.sign(
      { id: user.id, name: user.name, username: user.username, role: user.role || 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    res.status(201).json({ 
      message: 'User Created Successfully',
      token,
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const lowerUsername = username ? username.trim().toLowerCase() : "";
  
  console.log(`\n🔍 Login Attempt: Field "username" = [${username}], Normalised = [${lowerUsername}]`);

  try {
    const user = await User.findByUsername(lowerUsername);
    
    if (!user) {
      console.log(`❌ Login Failed: User with username "${lowerUsername}" not found in DB.`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in DB: ID ${user.id}, Username ${user.username}`);
    
    const match = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password Match Result: ${match}`);

    if (!match) {
      console.log(`❌ Login Failed: Incorrect password for ${lowerUsername}.`);
      return res.status(401).json({ message: 'Incorrect password' });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, username: user.username, role: user.role || 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    console.log(`🚀 Login Successful for: ${lowerUsername}`);
    res.json({ id: user.id, name: user.name, username: user.username, role: user.role, token });
  } catch (error) {
    console.error('❌ Login Controller Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  console.log("\n--- DEBUG: GET /profile ---");
  console.log("Headers:", req.headers);
  console.log("Token Extracted:", req.header("Authorization")?.replace("Bearer ", ""));
  console.log("Decoded req.user:", req.user);

  try {
    const userId = req.user?.id;

    if (!userId) {
      console.log("❌ Error: No userId found in req.user");
      return res.status(401).json({ message: "Unauthorized - No valid user ID" });
    }

    // Explicit exact query requested by the requirements
    const query = 'SELECT id, name, username as email, role, profile_image FROM users WHERE id = $1';
    console.log("Executing Query:", query, "with ID:", userId);
    
    const result = await db.query(query, [userId]);
    console.log("Database Query Result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('\n❌ Get User Profile Failed: Internal Server Error (500)');
    console.error(error);
    res.status(500).json({ 
      message: 'Failed to fetch profile: Internal Server Error (500)', 
      error: error.message 
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.username as email, u.created_at as joined_date,
             c.phone, c.address, c.city, 
             COUNT(o.id) as orders_count
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, c.phone, c.address, c.city
      ORDER BY u.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get All Customers Error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const productsCount = await db.query(`SELECT COUNT(*) FROM products`);
    const customersCount = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'user'`);
    const ordersCount = await db.query(`SELECT COUNT(*) FROM orders`);
    const totalRevenue = await db.query(`SELECT SUM(total) FROM orders WHERE status != 'Cancelled'`);
    
    res.json({
      totalProducts: parseInt(productsCount.rows[0].count),
      totalCustomers: parseInt(customersCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      totalRevenue: totalRevenue.rows[0].sum || 0
    });
  } catch (error) {
    console.error('❌ Get Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getAllCustomers, getDashboardStats };

