import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Request path:', req.path);
    console.log('Authorization header present:', !!req.headers.authorization);
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Yes' : 'No');
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      console.log('Token decoded, user ID:', decoded.id);
      
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      
      if (!req.user) {
        console.log('User not found with ID:', decoded.id);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.log('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

