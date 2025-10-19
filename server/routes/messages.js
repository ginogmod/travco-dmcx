import express from 'express';
import { Message } from '../models/index.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/messages
// @desc    Get all messages for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const messages = await Message.find({
          $or: [
            { sender: req.user.username },
            { receiver: req.user.username }
          ]
        }).sort({ timestamp: -1 });
        
        return res.json(messages);
      } catch (mongoError) {
        console.error('MongoDB error getting messages, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread
// @desc    Get unread messages for the authenticated user
// @access  Private
router.get('/unread', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const messages = await Message.find({
          receiver: req.user.username,
          read: false,
          notify: true
        }).sort({ timestamp: -1 });
        
        return res.json(messages);
      } catch (mongoError) {
        console.error('MongoDB error getting unread messages, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting unread messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:username
// @desc    Get conversation between authenticated user and another user
// @access  Private
router.get('/conversation/:username', async (req, res) => {
  try {
    const otherUsername = req.params.username;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const messages = await Message.find({
          $or: [
            { sender: req.user.username, receiver: otherUsername },
            { sender: otherUsername, receiver: req.user.username }
          ]
        }).sort({ timestamp: 1 });
        
        return res.json(messages);
      } catch (mongoError) {
        console.error('MongoDB error getting conversation, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { receiver, content, notify = false } = req.body;
    
    const messageData = {
      sender: req.user.username,
      senderName: req.user.name,
      receiver,
      content,
      timestamp: new Date(),
      read: false,
      notify
    };
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const newMessage = new Message(messageData);
        const savedMessage = await newMessage.save();
        
        return res.status(201).json(savedMessage);
      } catch (mongoError) {
        console.error('MongoDB error creating message, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json({
      ...messageData,
      id: Date.now(), // Generate an ID for localStorage
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/messages/:id/read
// @desc    Mark a message as read
// @access  Private
router.patch('/:id/read', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
          // Fall through to localStorage fallback
        } else {
          // Only the receiver can mark a message as read
          if (message.receiver !== req.user.username) {
            return res.status(403).json({ message: 'Not authorized to mark this message as read' });
          }
          
          message.read = true;
          await message.save();
          
          return res.json(message);
        }
      } catch (mongoError) {
        console.error('MongoDB error marking message as read, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or message not found, return success
    // The client-side will update localStorage
    return res.json({
      id: req.params.id,
      read: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/messages/read-all
// @desc    Mark all messages as read for the authenticated user
// @access  Private
router.patch('/read-all', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        await Message.updateMany(
          { receiver: req.user.username, read: false },
          { $set: { read: true } }
        );
        
        return res.json({ message: 'All messages marked as read' });
      } catch (mongoError) {
        console.error('MongoDB error marking all messages as read, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return success
    // The client-side will update localStorage
    return res.json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a status endpoint to check if the server is available
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