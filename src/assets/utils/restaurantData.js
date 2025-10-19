// Import the restaurant data directly
import restaurantsData from '../../../public/data/Restaurants_2025.json';

// Define the JOD to USD conversion rate
const JOD_TO_USD = 1.41;

// Helper function to parse price strings like "JOD 09.00" or "USD 22.00"
function parsePriceString(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return { value: null, currency: null };
  
  // Handle multiple formats
  const jodMatch = priceStr.match(/JOD\s*(\d+(?:\.\d+)?)/i);
  const usdMatch = priceStr.match(/USD\s*(\d+(?:\.\d+)?)/i);
  
  if (jodMatch) {
    return { value: parseFloat(jodMatch[1]), currency: "JOD" };
  } else if (usdMatch) {
    return { value: parseFloat(usdMatch[1]), currency: "USD" };
  }
  
  // If no currency prefix, try to extract just the number
  const numberMatch = priceStr.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    // Default to JOD if no currency specified
    return { value: parseFloat(numberMatch[1]), currency: "JOD" };
  }
  
  return { value: null, currency: null };
}

// Helper function to extract pax range information from restaurant names
function extractPaxRange(restaurantName) {
  // Default pax range (no restrictions)
  const defaultRange = { minPax: 1, maxPax: 999 };
  
  if (!restaurantName) return defaultRange;
  
  // Check for FIT X pax pattern (e.g., "FIT 2 pax")
  const fitSinglePaxMatch = restaurantName.match(/FIT\s+(\d+)\s+pax/i);
  if (fitSinglePaxMatch) {
    const pax = parseInt(fitSinglePaxMatch[1], 10);
    return { minPax: pax, maxPax: pax };
  }
  
  // Check for FIT X-Y pax pattern (e.g., "FIT 5-19 pax")
  const fitRangePaxMatch = restaurantName.match(/FIT\s+(\d+)-(\d+)\s+pax/i);
  if (fitRangePaxMatch) {
    const minPax = parseInt(fitRangePaxMatch[1], 10);
    const maxPax = parseInt(fitRangePaxMatch[2], 10);
    return { minPax, maxPax };
  }
  
  // Check for FIT X+ pax pattern (e.g., "FIT 20+ pax")
  const fitPlusPaxMatch = restaurantName.match(/FIT\s+(\d+)\+\s+pax/i);
  if (fitPlusPaxMatch) {
    const minPax = parseInt(fitPlusPaxMatch[1], 10);
    return { minPax, maxPax: 999 };
  }
  
  // Check for PAX =< X pattern (e.g., "PAX =< 11")
  const paxLessThanMatch = restaurantName.match(/PAX\s+=<\s+(\d+)/i);
  if (paxLessThanMatch) {
    const maxPax = parseInt(paxLessThanMatch[1], 10);
    return { minPax: 1, maxPax };
  }
  
  // Check for PAX => X pattern (e.g., "PAX => 11")
  const paxGreaterThanMatch = restaurantName.match(/PAX\s+=>\s+(\d+)/i);
  if (paxGreaterThanMatch) {
    const minPax = parseInt(paxGreaterThanMatch[1], 10);
    return { minPax, maxPax: 999 };
  }
  
  // Check for X PAX => Y pattern (e.g., "2 PAX =< 11")
  const numPaxLessThanMatch = restaurantName.match(/(\d+)\s+PAX\s+=<\s+(\d+)/i);
  if (numPaxLessThanMatch) {
    const specificPax = parseInt(numPaxLessThanMatch[1], 10);
    return { minPax: specificPax, maxPax: specificPax };
  }
  
  // Check for X pax => Y pattern (e.g., "Beit Khiyrat Souf - Jerash 1 PAX => 10")
  const specificPaxMatch = restaurantName.match(/(\d+)\s+PAX\s+=>\s+(\d+)/i);
  if (specificPaxMatch) {
    const specificPax = parseInt(specificPaxMatch[1], 10);
    return { minPax: specificPax, maxPax: specificPax };
  }
  
  return defaultRange;
}

// Helper function to extract child price information
function extractChildPrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  
  // Check for child price pattern (e.g., "JOD 12.00 - CHD JOD 06.00")
  const childPriceMatch = priceStr.match(/CHD\s+(?:JOD|USD)\s*(\d+(?:\.\d+)?)/i);
  if (childPriceMatch) {
    return parseFloat(childPriceMatch[1]);
  }
  
  return null;
}

// Transform the restaurant data
function transformRestaurantData() {
  console.log("Transforming restaurant data...");
  console.log("Restaurant data length:", restaurantsData.length);
  
  if (!restaurantsData || !Array.isArray(restaurantsData) || restaurantsData.length === 0) {
    console.warn("No restaurant data available");
    return [];
  }
  
  const transformedData = [];
  let lastRegion = "";
  
  // Process each restaurant in the data
  restaurantsData.forEach((item, index) => {
    // If region is null, use the last non-null region
    const itemRegion = item["Region "];
    if (itemRegion && itemRegion.trim()) {
      lastRegion = itemRegion.trim();
    }
    
    const region = lastRegion || "Unknown";
    const restaurant = (item["Restaurant Name "] || "").trim();
    
    // Skip items with no restaurant name
    if (!restaurant) {
      console.log(`Skipping item ${index} with no restaurant name`);
      return;
    }
    
    // Extract pax range information from restaurant name
    const { minPax, maxPax } = extractPaxRange(restaurant);
    
    console.log(`Processing restaurant: ${restaurant} in region: ${region} (pax range: ${minPax}-${maxPax})`);
    
    // Always add a lunch entry even if no price is available
    const lunchPrice = item["Lunch Price P.P"] ? item["Lunch Price P.P"].toString().trim() : "";
    
    if (lunchPrice) {
      // Extract the first price if there are multiple (e.g., "JOD 08.00 / Special Lunch JOD 12.00")
      const firstPrice = lunchPrice.split('/')[0].trim();
      // Remove child price if present (e.g., "JOD 6.00 - CHD 03.00")
      const adultPrice = firstPrice.split('-')[0].trim();
      
      const { value, currency } = parsePriceString(adultPrice);
      const childPrice = extractChildPrice(lunchPrice);
      
      if (value && currency) {
        const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
        const childUsdPrice = childPrice && currency === "JOD" ? childPrice * JOD_TO_USD : childPrice;
        
        transformedData.push({
          region: region,
          restaurant,
          itemType: "lunch",
          priceOriginalValue: value,
          priceOriginalCurrency: currency,
          usdPrice,
          childPrice: childPrice,
          childUsdPrice: childUsdPrice,
          minPax: minPax,
          maxPax: maxPax
        });
      } else {
        // Add with default price if parsing failed
        transformedData.push({
          region: region,
          restaurant,
          itemType: "lunch",
          priceOriginalValue: 10,
          priceOriginalCurrency: "JOD",
          usdPrice: 14.1,
          childPrice: null,
          childUsdPrice: null,
          minPax: minPax,
          maxPax: maxPax
        });
      }
    } else {
      // Add with default price if no lunch price
      transformedData.push({
        region: region,
        restaurant,
        itemType: "lunch",
        priceOriginalValue: 10,
        priceOriginalCurrency: "JOD",
        usdPrice: 14.1,
        childPrice: null,
        childUsdPrice: null,
        minPax: minPax,
        maxPax: maxPax
      });
    }
    
    // Always add a dinner entry even if no price is available
    const dinnerPrice = item["Dinner Price P.P"] ? item["Dinner Price P.P"].toString().trim() : "";
    
    if (dinnerPrice) {
      // Extract the first price if there are multiple
      const firstPrice = dinnerPrice.split('/')[0].trim();
      // Remove child price if present
      const adultPrice = firstPrice.split('-')[0].trim();
      
      const { value, currency } = parsePriceString(adultPrice);
      const childPrice = extractChildPrice(dinnerPrice);
      
      if (value && currency) {
        const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
        const childUsdPrice = childPrice && currency === "JOD" ? childPrice * JOD_TO_USD : childPrice;
        
        transformedData.push({
          region: region,
          restaurant,
          itemType: "dinner",
          priceOriginalValue: value,
          priceOriginalCurrency: currency,
          usdPrice,
          childPrice: childPrice,
          childUsdPrice: childUsdPrice,
          minPax: minPax,
          maxPax: maxPax
        });
      } else {
        // Add with default price if parsing failed
        transformedData.push({
          region: region,
          restaurant,
          itemType: "dinner",
          priceOriginalValue: 15,
          priceOriginalCurrency: "JOD",
          usdPrice: 21.15,
          childPrice: null,
          childUsdPrice: null,
          minPax: minPax,
          maxPax: maxPax
        });
      }
    } else {
      // Add with default price if no dinner price
      transformedData.push({
        region: region,
        restaurant,
        itemType: "dinner",
        priceOriginalValue: 15,
        priceOriginalCurrency: "JOD",
        usdPrice: 21.15,
        childPrice: null,
        childUsdPrice: null,
        minPax: minPax,
        maxPax: maxPax
      });
    }
  });
  
  console.log("Transformed data:", transformedData.length, "items");
  return transformedData;
}

// Export the transformed restaurant data
export const transformedRestaurantData = transformRestaurantData();

// Export the JOD to USD conversion rate
export const JOD_TO_USD_RATE = JOD_TO_USD;