import express from 'express';
import { Quotation } from '../models/index.js';
// Import the mongoose model for Group Series Quotations
// Note: We're using the same Quotation model but with isGroupSeries flag
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/quotations
// @desc    Get all quotations
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Check if we need to filter for group series quotations
        const isGroupSeries = req.query.isGroupSeries === 'true';
        
        let query = {};
        if (isGroupSeries !== undefined) {
          query.isGroupSeries = isGroupSeries;
        }
        
        const quotations = await Quotation.find(query).sort({ createdAt: -1 });
        return res.json(quotations);
      } catch (mongoError) {
        console.error('MongoDB error getting quotations, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting quotations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quotations/:id
// @desc    Get quotation by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const quotation = await Quotation.findOne({ id: req.params.id });
        
        if (quotation) {
          return res.json(quotation);
        }
      } catch (mongoError) {
        console.error('MongoDB error getting quotation, falling back to localStorage:', mongoError);
        // Fall through to 404 response
      }
    }
    
    // If MongoDB is not connected or quotation not found, return 404
    // The client-side will use localStorage data
    return res.status(404).json({ message: 'Quotation not found' });
  } catch (error) {
    console.error('Error getting quotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quotations
// @desc    Create a new quotation
// @access  Private
router.post('/', async (req, res) => {
  try {
    const quotationData = req.body;
    
    // Set timestamps
    const now = new Date();
    quotationData.createdAt = now;
    quotationData.updatedAt = now;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Check if this is a group series quotation
        if (quotationData.isGroupSeries) {
          console.log('Creating a new Group Series Quotation');
          // Ensure validityDates is present for group series quotations
          if (!quotationData.validityDates || !Array.isArray(quotationData.validityDates)) {
            quotationData.validityDates = [{ from: quotationData.arrivalDate, to: quotationData.departureDate }];
          }
        }
        
        // Create new quotation
        const newQuotation = new Quotation(quotationData);
        const savedQuotation = await newQuotation.save();
        
        return res.status(201).json(savedQuotation);
      } catch (mongoError) {
        console.error('MongoDB error creating quotation, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json(quotationData);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/quotations/:id
// @desc    Update a quotation
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const quotationData = req.body;
    
    // Update timestamp
    quotationData.updatedAt = new Date();
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Find and update the quotation
        // Check if this is a group series quotation update
        if (quotationData.isGroupSeries) {
          console.log('Updating a Group Series Quotation');
          // Ensure validityDates is present for group series quotations
          if (!quotationData.validityDates || !Array.isArray(quotationData.validityDates)) {
            quotationData.validityDates = [{ from: quotationData.arrivalDate, to: quotationData.departureDate }];
          }
        }
        
        const updatedQuotation = await Quotation.findOneAndUpdate(
          { id: req.params.id },
          { $set: quotationData },
          { new: true }
        );
        
        if (updatedQuotation) {
          return res.json(updatedQuotation);
        }
      } catch (mongoError) {
        console.error('MongoDB error updating quotation, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or quotation not found, return the data
    // The client-side will update localStorage
    return res.json(quotationData);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/quotations/:id
// @desc    Delete a quotation
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const quotation = await Quotation.findOneAndDelete({ id: req.params.id });
        
        if (!quotation) {
          // Fall through to return success for localStorage
        } else {
          return res.json({ message: 'Quotation deleted' });
        }
      } catch (mongoError) {
        console.error('MongoDB error deleting quotation:', mongoError);
        // Fall through to return success for localStorage
      }
    }
    
    // If MongoDB is not connected or quotation not found, return success
    // The client-side will delete from localStorage
    return res.json({ message: 'Quotation deleted' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
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