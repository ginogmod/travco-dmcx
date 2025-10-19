/**
 * Utility functions for determining seasonality based on dates
 */

/**
 * Determines the season based on the arrival date and hotel name
 * @param {string} arrivalDate - The arrival date in ISO format (YYYY-MM-DD)
 * @param {string} departureDate - The departure date in ISO format (YYYY-MM-DD)
 * @param {string} hotelName - The hotel name
 * @returns {string} The determined season (Low, Mid, High, Peak, etc.)
 */
export const determineSeason = async (arrivalDate, departureDate, hotelName) => {
  try {
    // Parse the arrival and departure dates - ensure they're in YYYY-MM-DD format for consistent comparison
    const arrivalDateStr = arrivalDate.split('T')[0]; // Remove any time component
    const arrivalDateObj = new Date(arrivalDateStr);
    
    // Parse departure date if provided
    let departureDateObj = null;
    if (departureDate) {
      const departureDateStr = departureDate.split('T')[0];
      departureDateObj = new Date(departureDateStr);
    } else {
      // If no departure date is provided, use arrival date
      departureDateObj = arrivalDateObj;
    }
    
    // Format the dates for logging
    const formattedArrivalDate = arrivalDateObj.toISOString().split('T')[0];
    const formattedDepartureDate = departureDateObj.toISOString().split('T')[0];
    
    console.log(`Checking seasonality for stay from ${formattedArrivalDate} to ${formattedDepartureDate}`);
    
    // First try to load seasonality data from localStorage
    const savedSeasonalityData = localStorage.getItem('seasonalityData');
    let hotelSeasons = {};
    
    if (savedSeasonalityData) {
      try {
        const parsedData = JSON.parse(savedSeasonalityData);
        hotelSeasons = parsedData.hotelSeasons || {};
        console.log("Using hotel seasonality data from localStorage");
      } catch (err) {
        console.error("Error parsing localStorage seasonality data:", err);
        // If localStorage fails, try to load from server
        const response = await fetch(`/data/seasonality.json?nocache=${Date.now()}`);
        if (response.ok) {
          const seasonalityConfig = await response.json();
          hotelSeasons = seasonalityConfig.hotelSeasons || {};
        }
      }
    } else {
      // If no localStorage data, try to load from server
      try {
        const response = await fetch(`/data/seasonality.json?nocache=${Date.now()}`);
        if (response.ok) {
          const seasonalityConfig = await response.json();
          hotelSeasons = seasonalityConfig.hotelSeasons || {};
        }
      } catch (error) {
        console.error("Error loading seasonality data from server:", error);
      }
    }
    
    // Check if there's a hotel-specific seasonality configuration
    if (hotelName && hotelSeasons[hotelName]) {
      const hotelConfig = hotelSeasons[hotelName];
      console.log(`Checking hotel-specific season for ${hotelName} for stay: ${formattedArrivalDate} to ${formattedDepartureDate}`);
      console.log(`Available seasons for ${hotelName}:`, Object.keys(hotelConfig));
      
      // Check which season the stay falls into
      for (const [season, dateRanges] of Object.entries(hotelConfig)) {
        if (dateRanges && Array.isArray(dateRanges)) {
          console.log(`Checking ${season} season with date ranges:`, dateRanges);
          
          // Check each date range object in the array
          for (const dateRange of dateRanges) {
            if (dateRange.startDate && dateRange.endDate) {
              // Ensure dates are in YYYY-MM-DD format
              const startDateStr = dateRange.startDate.split('T')[0];
              const endDateStr = dateRange.endDate.split('T')[0];
              
              const startDate = new Date(startDateStr);
              const endDate = new Date(endDateStr);
              
              // Add logging to debug date comparisons
              console.log(`Comparing stay: ${formattedArrivalDate} to ${formattedDepartureDate} with range: ${startDateStr} to ${endDateStr}`);
              
              // Check if any part of the stay falls within the season date range
              // This is true if:
              // 1. Arrival date is within the range, OR
              // 2. Departure date is within the range, OR
              // 3. The stay completely encompasses the range
              if ((arrivalDateObj >= startDate && arrivalDateObj <= endDate) ||
                  (departureDateObj >= startDate && departureDateObj <= endDate) ||
                  (arrivalDateObj <= startDate && departureDateObj >= endDate)) {
                console.log(`✅ Hotel-specific season determined: ${season} for ${hotelName} for stay from ${formattedArrivalDate} to ${formattedDepartureDate}`);
                console.log(`Date range: ${startDateStr} to ${endDateStr}`);
                return season;
              }
            }
          }
        }
      }
    }
    
    console.log(`No hotel-specific season found for ${hotelName}, falling back to default season`);
    
    // If no specific season is found, determine based on month
    const month = arrivalDateObj.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Define default seasons based on month
    if ([5, 6, 9, 10].includes(month)) {
      console.log(`Defaulting to Low season based on month ${month}`);
      return "Low";
    } else if ([3, 4, 11].includes(month) || (month === 12 && arrivalDateObj.getDate() <= 15)) {
      console.log(`Defaulting to Shoulder/Mid season based on month ${month}`);
      return "Shoulder";
    } else if ([1, 2, 7, 8].includes(month) || (month === 12 && arrivalDateObj.getDate() > 15)) {
      console.log(`Defaulting to High season based on month ${month}`);
      return "High";
    } else {
      console.log(`Defaulting to Regular season as fallback`);
      return "Regular";
    }
  } catch (error) {
    console.error('Error determining season:', error);
    // Default to Regular season in case of error
    return "Regular";
  }
};

/**
 * Gets the hotel name with season for automatic selection
 * @param {string} city - The city name
 * @param {string|number} stars - The hotel star rating or category
 * @param {string} season - The determined season (Low, Mid, High, Peak, etc.)
 * @param {string} hotelName - The base hotel name (without season)
 * @returns {string} The hotel name with season (e.g., "Boutique - Low")
 */
export const getHotelWithSeason = (city, stars, season, hotelName) => {
  if (!city || !stars || !season || !hotelName) {
    return null;
  }
  
  // Trim the hotel name to remove any leading/trailing spaces
  const trimmedHotelName = hotelName.trim();
  
  // Log the formatted hotel name for debugging
  const formattedName = `${trimmedHotelName} - ${season}`;
  console.log(`Formatted hotel name with season: ${formattedName}`);
  
  return formattedName;
};