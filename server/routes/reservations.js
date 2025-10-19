import express from 'express';
import { Reservation } from '../models/index.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/reservations
// @desc    Get all reservations
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        return res.json(reservations);
      } catch (mongoError) {
        console.error('MongoDB error getting reservations, falling back to localStorage:', mongoError);
        // Fall through to localStorage fallback
      }
    }
    
    // If MongoDB is not connected or there was an error, return an empty array
    // The client-side will use localStorage data
    return res.json([]);
  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const reservation = await Reservation.findOne({ id: req.params.id });
        
        if (reservation) {
          return res.json(reservation);
        }
      } catch (mongoError) {
        console.error('MongoDB error getting reservation, falling back to localStorage:', mongoError);
        // Fall through to 404 response
      }
    }
    
    // If MongoDB is not connected or reservation not found, return 404
    // The client-side will use localStorage data
    return res.status(404).json({ message: 'Reservation not found' });
  } catch (error) {
    console.error('Error getting reservation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post('/', async (req, res) => {
  try {
    const reservationData = req.body;
    
    // Add createdBy field with the authenticated user's username
    reservationData.createdBy = req.user.username;
    
    // Set timestamps
    const now = new Date();
    reservationData.createdAt = now;
    reservationData.updatedAt = now;
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Create new reservation
        const newReservation = new Reservation(reservationData);
        const savedReservation = await newReservation.save();
        
        return res.status(201).json(savedReservation);
      } catch (mongoError) {
        console.error('MongoDB error creating reservation, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or there was an error, return the data
    // The client-side will save to localStorage
    return res.status(201).json(reservationData);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update a reservation
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const reservationData = req.body;
    
    // Update timestamp
    reservationData.updatedAt = new Date();
    
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        // Find and update the reservation
        const updatedReservation = await Reservation.findOneAndUpdate(
          { id: req.params.id },
          { $set: reservationData },
          { new: true }
        );
        
        if (updatedReservation) {
          return res.json(updatedReservation);
        }
      } catch (mongoError) {
        console.error('MongoDB error updating reservation, returning data for localStorage:', mongoError);
        // Fall through to return the data for localStorage
      }
    }
    
    // If MongoDB is not connected or reservation not found, return the data
    // The client-side will update localStorage
    return res.json(reservationData);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        const reservation = await Reservation.findOneAndDelete({ id: req.params.id });
        
        if (!reservation) {
          // Fall through to return success for localStorage
        } else {
          return res.json({ message: 'Reservation deleted' });
        }
      } catch (mongoError) {
        console.error('MongoDB error deleting reservation:', mongoError);
        // Fall through to return success for localStorage
      }
    }
    
    // If MongoDB is not connected or reservation not found, return success
    // The client-side will delete from localStorage
    return res.json({ message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
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