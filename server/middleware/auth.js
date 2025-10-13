const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find the user and attach to request
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }
    
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };
    
    console.log('Authenticated user:', req.user.name);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};