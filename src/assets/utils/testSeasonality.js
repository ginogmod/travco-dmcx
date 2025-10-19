/**
 * Test script to verify that the quotation system correctly loads rates from localStorage
 */

// Import the determineSeason function
import { determineSeason } from './seasonalityUtils';

// Test function
export const testSeasonalityDetermination = async () => {
  console.log('=== Testing Seasonality Determination ===');
  
  // Sample data
  const arrivalDate = '2025-01-15';
  const departureDate = '2025-01-20';
  const hotelName = 'Test Hotel';
  
  // Create sample seasonality data
  const seasonalityData = {
    hotelSeasons: {
      [hotelName]: {
        'Low': [{
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          rateId: 'test_low_1'
        }],
        'High': [{
          startDate: '2025-02-01',
          endDate: '2025-02-28',
          rateId: 'test_high_1'
        }]
      }
    }
  };
  
  // Save to localStorage
  localStorage.setItem('seasonalityData', JSON.stringify(seasonalityData));
  
  // Test with hotel that has seasonality data
  console.log('Testing with hotel that has seasonality data:');
  const season1 = await determineSeason(arrivalDate, departureDate, hotelName);
  console.log(`Determined season for ${hotelName}: ${season1}`);
  
  // Test with hotel that doesn't have seasonality data
  console.log('\nTesting with hotel that doesn\'t have seasonality data:');
  const season2 = await determineSeason(arrivalDate, departureDate, 'Unknown Hotel');
  console.log(`Determined season for Unknown Hotel: ${season2}`);
  
  // Test with different dates
  console.log('\nTesting with dates in February:');
  const season3 = await determineSeason('2025-02-15', '2025-02-20', hotelName);
  console.log(`Determined season for ${hotelName} in February: ${season3}`);
  
  // Clean up
  // localStorage.removeItem('seasonalityData');
  
  console.log('\nTest completed!');
};

// Run the test
testSeasonalityDetermination();