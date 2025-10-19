// Test script for hotel-specific seasonality

// Import fs to read the seasonality.json file
import fs from 'fs';
import path from 'path';

// Mock seasonality data
const seasonalityData = JSON.parse(fs.readFileSync('./public/data/seasonality.json', 'utf8'));

// Test function
function testHotelSeasonality() {
  console.log('Testing hotel-specific seasonality...');
  
  // Test dates
  const testDates = [
    '2025-01-15', // Should be High season for Movenpick Resort Petra
    '2025-05-20', // Should be Low season for Movenpick Resort Petra
    '2025-12-25', // Should be High season for Movenpick Resort Petra
    '2025-05-10', // Should be Low season for Kempinski Hotel Aqaba
    '2025-12-25'  // Should be Peak season for Kempinski Hotel Aqaba
  ];
  
  // Test hotels
  const testHotels = [
    {
      name: 'Movenpick Resort Petra',
      city: 'Petra',
      stars: '5'
    },
    {
      name: 'Kempinski Hotel Aqaba',
      city: 'Aqaba',
      stars: '5'
    }
  ];
  
  // Run tests
  for (const hotel of testHotels) {
    console.log(`\nTesting hotel: ${hotel.name}`);
    
    for (const date of testDates) {
      const season = determineSeasonDirectly(date, null, hotel.name);
      console.log(`Date: ${date}, Season: ${season || 'Not found'}`);
    }
  }
  
  // Test non-existent hotel
  console.log('\nTesting non-existent hotel...');
  const nonExistentHotel = 'Non-existent Hotel';
  for (const date of testDates) {
    const season = determineSeasonDirectly(date, null, nonExistentHotel);
    console.log(`Date: ${date}, Season for non-existent hotel (should be null): ${season || 'Not found'}`);
  }
}

// Direct implementation of determineSeason without fetch
function determineSeasonDirectly(arrivalDate, departureDate, hotelName) {
  try {
    // Parse the arrival date - ensure it's in YYYY-MM-DD format for consistent comparison
    const arrivalDateStr = arrivalDate.split('T')[0]; // Remove any time component
    const arrivalDateObj = new Date(arrivalDateStr);
    
    // Format the arrival date for logging
    const formattedArrivalDate = arrivalDateObj.toISOString().split('T')[0];
    
    // First check if there's a hotel-specific seasonality configuration
    if (hotelName && seasonalityData.hotelSeasons?.[hotelName]) {
      const hotelConfig = seasonalityData.hotelSeasons[hotelName];
      console.log(`Checking hotel-specific season for ${hotelName} on date: ${formattedArrivalDate}`);
      console.log(`Available seasons for ${hotelName}:`, Object.keys(hotelConfig));
      
      // Check which season the arrival date falls into
      for (const [season, dateRanges] of Object.entries(hotelConfig)) {
        // The dateRanges array contains pairs of dates [start1, end1, start2, end2, ...]
        if (dateRanges && dateRanges.length >= 2) {
          console.log(`Checking ${season} season with date ranges:`, dateRanges);
          
          // Check each pair of dates
          for (let i = 0; i < dateRanges.length; i += 2) {
            if (i + 1 < dateRanges.length) { // Make sure we have both start and end dates
              // Ensure dates are in YYYY-MM-DD format
              const startDateStr = dateRanges[i].split('T')[0];
              const endDateStr = dateRanges[i + 1].split('T')[0];
              
              const startDate = new Date(startDateStr);
              const endDate = new Date(endDateStr);
              
              // Add logging to debug date comparisons
              console.log(`Comparing arrival: ${formattedArrivalDate} with range: ${startDateStr} to ${endDateStr}`);
              
              // Normalize all dates to midnight for proper comparison
              if (arrivalDateObj >= startDate && arrivalDateObj <= endDate) {
                console.log(`✅ Hotel-specific season determined: ${season} for ${hotelName} on ${formattedArrivalDate}`);
                return season;
              }
            }
          }
        }
      }
      
      console.log(`No hotel-specific season found for ${hotelName}`);
    }
    
    // If no hotel-specific seasonality is found or hotelName is not provided, we can't determine the season
    console.warn(`No hotel-specific season found for ${hotelName} and no fallback available`);
    return null;
  } catch (error) {
    console.error('Error determining season:', error);
    return null;
  }
}

// Run the test
testHotelSeasonality();