import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import employees from '../../src/data/employeesData.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Function to seed users
const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('Users already exist in the database. Skipping seeding.');
      process.exit(0);
    }
    
    // Convert employees to user format
    const users = employees.map(emp => ({
      username: emp.username,
      password: emp.password, // Will be hashed by the pre-save hook in the User model
      name: emp.name,
      role: emp.role
    }));
    
    // Insert users into the database
    await User.insertMany(users);
    
    console.log(`✅ Successfully seeded ${users.length} users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();