const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied', error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { id: userId }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid', error: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('🛡️ Admin Check - User ID:', req.user?.id);
  console.log('🛡️ Admin Check - Role from token:', req.user?.role);
  
  if (req.user && req.user.role && req.user.role.trim().toLowerCase() === 'admin') {
    console.log('✅ Admin Check PASSED');
    next();
  } else {
    console.log('🚫 Admin Check FAILED - Role is:', req.user?.role);
    res.status(403).json({ 
      message: 'Access denied: Requires admin role', 
      error: 'Access denied: Requires admin role',
      debug_role: req.user?.role 
    });
  }
};

module.exports = { authMiddleware, isAdmin };
