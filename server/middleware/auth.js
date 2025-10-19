import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'travco-dmc-secret-key-change-in-production';

export const authenticateUser = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token validation error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }
    
    res.status(401).json({
      message: 'Token validation failed. Please log in again.',
      code: 'AUTH_FAILED'
    });
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id || Date.now(),
      username: user.username,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Extended to 7 days for better user experience
  );
};

// Optional middleware that doesn't fail if token is invalid
export const optionalAuth = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // If no token, just continue without setting user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded;
  } catch (error) {
    // Don't fail, just don't set the user
    req.user = null;
  }
  
  next();
};