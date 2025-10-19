import express from 'express';
import { Offer } from '../models/index.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/offers
// @desc    Get all offers
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        return res.json(offers);
      } catch (mongoError) {
        console.error('MongoDB error getting offers, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/offers/:id
// @desc    Get offer by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const offer = await Offer.findOne({ id: req.params.id });
        
        if (offer) {
          return res.json(offer);
        }
      } catch (mongoError) {
        console.error('MongoDB error getting offer, falling back to localStorage:', mongoError);
        // Fall through to 404 response
      }
    }
    
    // If MongoDB is not connected or offer not found, return 404
    // The client-side will use localStorage data
    return res.status(404).json({ message: 'Offer not found' });
  } catch (error) {
    console.error('Error getting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/offers
// @desc    Create a new offer
// @access  Private
router.post('/', async (req, res) => {
  try {
    const offerData = req.body;
    
    // Set timestamps
    const now = new Date();
    offerData.createdAt = now;
    offerData.updatedAt = now;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Create new offer
        const newOffer = new Offer(offerData);
        const savedOffer = await newOffer.save();
        
        return res.status(201).json(savedOffer);
      } catch (mongoError) {
        console.error('MongoDB error creating offer, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json(offerData);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update an offer
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const offerData = req.body;
    
    // Update timestamp
    offerData.updatedAt = new Date();
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Find and update the offer
        const updatedOffer = await Offer.findOneAndUpdate(
          { id: req.params.id },
          { $set: offerData },
          { new: true }
        );
        
        if (updatedOffer) {
          return res.json(updatedOffer);
        }
      } catch (mongoError) {
        console.error('MongoDB error updating offer, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or offer not found, return the data
    // The client-side will update localStorage
    return res.json(offerData);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/offers/:id/confirm
// @desc    Mark an offer as confirmed
// @access  Private
router.patch('/:id/confirm', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const offer = await Offer.findOne({ id: req.params.id });
        
        if (offer) {
          offer.isConfirmed = true;
          offer.updatedAt = new Date();
          
          await offer.save();
          
          return res.json(offer);
        }
      } catch (mongoError) {
        console.error('MongoDB error confirming offer, falling back to localStorage:', mongoError);
        // Fall through to return modified data for localStorage
      }
    }
    
    // If MongoDB is not connected or offer not found, return modified data
    // The client-side will update localStorage
    return res.json({
      id: req.params.id,
      isConfirmed: true,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error confirming offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/offers/:id
// @desc    Delete an offer
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const offer = await Offer.findOneAndDelete({ id: req.params.id });
        
        if (!offer) {
          // Fall through to return success for localStorage
        } else {
          return res.json({ message: 'Offer deleted' });
        }
      } catch (mongoError) {
        console.error('MongoDB error deleting offer:', mongoError);
        // Fall through to return success for localStorage
      }
    }
    
    // If MongoDB is not connected or offer not found, return success
    // The client-side will delete from localStorage
    return res.json({ message: 'Offer deleted' });
  } catch (error) {
    console.error('Error deleting offer:', error);
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