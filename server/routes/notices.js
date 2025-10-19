import express from 'express';
import { Notice, NoticeComment } from '../models/notice.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/notices
// @desc    Get all notices
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const notices = await Notice.find()
          .sort({ pinned: -1, timestamp: -1 }); // Pinned first, then by date
        
        return res.json(notices);
      } catch (mongoError) {
        console.error('MongoDB error getting notices, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting notices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notices/category/:category
// @desc    Get notices by category
// @access  Private
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const notices = await Notice.find({ category })
          .sort({ pinned: -1, timestamp: -1 }); // Pinned first, then by date
        
        return res.json(notices);
      } catch (mongoError) {
        console.error('MongoDB error getting notices by category, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting notices by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notices
// @desc    Create a new notice
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const noticeData = {
      author: req.user.username,
      authorName: req.user.name,
      authorRole: req.user.role,
      title,
      content,
      category: category || 'general',
      timestamp: new Date(),
      likes: [],
      pinned: false
    };
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const newNotice = new Notice(noticeData);
        const savedNotice = await newNotice.save();
        
        return res.status(201).json(savedNotice);
      } catch (mongoError) {
        console.error('MongoDB error creating notice, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json({
      ...noticeData,
      id: Date.now(), // Generate an ID for localStorage
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/notices/:id/like
// @desc    Like or unlike a notice
// @access  Private
router.patch('/:id/like', async (req, res) => {
  try {
    const noticeId = req.params.id;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const notice = await Notice.findById(noticeId);
        
        if (!notice) {
          return res.status(404).json({ message: 'Notice not found' });
        }
        
        // Check if user already liked this notice
        const alreadyLiked = notice.likes.includes(req.user.username);
        
        if (alreadyLiked) {
          // Unlike the notice
          notice.likes = notice.likes.filter(username => username !== req.user.username);
        } else {
          // Like the notice
          notice.likes.push(req.user.username);
        }
        
        await notice.save();
        
        return res.json(notice);
      } catch (mongoError) {
        console.error('MongoDB error liking notice, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return success
    // The client-side will update localStorage
    return res.json({
      id: noticeId,
      action: 'like_toggle',
      username: req.user.username,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error liking notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/notices/:id/pin
// @desc    Pin or unpin a notice (admin, manager, hr only)
// @access  Private
router.patch('/:id/pin', async (req, res) => {
  try {
    // Check if user has permission to pin notices
    if (!['admin', 'manager', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to pin notices' });
    }
    
    const noticeId = req.params.id;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const notice = await Notice.findById(noticeId);
        
        if (!notice) {
          return res.status(404).json({ message: 'Notice not found' });
        }
        
        // Toggle pinned status
        notice.pinned = !notice.pinned;
        
        await notice.save();
        
        return res.json(notice);
      } catch (mongoError) {
        console.error('MongoDB error pinning notice, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return success
    // The client-side will update localStorage
    return res.json({
      id: noticeId,
      action: 'pin_toggle',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error pinning notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notices/:id/comments
// @desc    Get comments for a notice
// @access  Private
router.get('/:id/comments', async (req, res) => {
  try {
    const noticeId = req.params.id;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const comments = await NoticeComment.find({ noticeId })
          .sort({ timestamp: 1 }); // Oldest first for comments
        
        return res.json(comments);
      } catch (mongoError) {
        console.error('MongoDB error getting comments, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notices/:id/comments
// @desc    Add a comment to a notice
// @access  Private
router.post('/:id/comments', async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { content } = req.body;
    
    const commentData = {
      noticeId,
      author: req.user.username,
      authorName: req.user.name,
      authorRole: req.user.role,
      content,
      timestamp: new Date(),
      likes: []
    };
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Verify notice exists
        const notice = await Notice.findById(noticeId);
        
        if (!notice) {
          return res.status(404).json({ message: 'Notice not found' });
        }
        
        const newComment = new NoticeComment(commentData);
        const savedComment = await newComment.save();
        
        return res.status(201).json(savedComment);
      } catch (mongoError) {
        console.error('MongoDB error creating comment, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json({
      ...commentData,
      id: Date.now(), // Generate an ID for localStorage
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/notices/comments/:id/like
// @desc    Like or unlike a comment
// @access  Private
router.patch('/comments/:id/like', async (req, res) => {
  try {
    const commentId = req.params.id;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const comment = await NoticeComment.findById(commentId);
        
        if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user already liked this comment
        const alreadyLiked = comment.likes.includes(req.user.username);
        
        if (alreadyLiked) {
          // Unlike the comment
          comment.likes = comment.likes.filter(username => username !== req.user.username);
        } else {
          // Like the comment
          comment.likes.push(req.user.username);
        }
        
        await comment.save();
        
        return res.json(comment);
      } catch (mongoError) {
        console.error('MongoDB error liking comment, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return success
    // The client-side will update localStorage
    return res.json({
      id: commentId,
      action: 'like_toggle',
      username: req.user.username,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error liking comment:', error);
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