import express from 'express';
import { User } from '../models/index.js';
import { generateToken, authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Fallback user data from employeesData.js
let employeesData = [];
try {
  // Dynamic import for employeesData
  import('../../src/data/employeesData.js')
    .then(module => {
      employeesData = module.default;
      console.log('✅ Loaded fallback employee data for auth');
    })
    .catch(err => {
      console.error('❌ Error loading fallback employee data:', err);
    });
} catch (error) {
  console.error('❌ Error importing employeesData:', error);
}

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      username,
      password,
      name,
      role: role || 'user'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data and token
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Try MongoDB authentication first
        const user = await User.findOne({ username });
        
        if (user) {
          // Check password
          const isMatch = await user.comparePassword(password);
          
          if (isMatch) {
            // Generate JWT token
            const token = generateToken(user);
            
            // Return user data and token
            return res.json({
              user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
              },
              token,
              source: 'mongodb'
            });
          }
        }
      } catch (mongoError) {
        console.error('MongoDB auth error, falling back to local auth:', mongoError);
        // Fall through to local auth
      }
    }
    
    // Fallback to local authentication if MongoDB fails or user not found
    const localUser = employeesData.find(
      u => u.username === username && u.password === password
    );
    
    if (localUser) {
      // Generate JWT token for local user
      const token = generateToken({
        id: Date.now(), // Use timestamp as ID
        username: localUser.username,
        name: localUser.name,
        role: localUser.role
      });
      
      return res.json({
        user: {
          id: Date.now(),
          username: localUser.username,
          name: localUser.name,
          role: localUser.role
        },
        token,
        source: 'local'
      });
    }
    
    // If we get here, authentication failed in both MongoDB and local
    return res.status(400).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', authenticateUser, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
          return res.json({
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            source: 'mongodb'
          });
        }
      } catch (mongoError) {
        console.error('MongoDB user fetch error, falling back to JWT data:', mongoError);
        // Fall through to JWT data
      }
    }
    
    // If MongoDB is not connected or user not found, use the data from JWT
    return res.json({
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      source: 'jwt'
    });
  } catch (error) {
    console.error('Error in get user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/status
// @desc    Check server and database status
// @access  Public
router.get('/status', optionalAuth, (req, res) => {
  const status = {
    server: 'online',
    database: isMongoConnected() ? 'connected' : 'disconnected',
    auth: req.user ? 'authenticated' : 'unauthenticated',
    timestamp: new Date().toISOString()
  };
  
  res.json(status);
});

export default router;