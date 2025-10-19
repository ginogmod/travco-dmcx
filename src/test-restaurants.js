// Simple test script to verify restaurant data loading and processing

// Import the JOD_TO_USD constant
const JOD_TO_USD = 1.41;

// Helper function to parse price strings like "JOD 09.00" or "USD 22.00"
function parsePriceString(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return { value: null, currency: null };
  
  console.log("Parsing price string:", priceStr);
  
  // Handle multiple formats
  const jodMatch = priceStr.match(/JOD\s*(\d+(?:\.\d+)?)/i);
  const usdMatch = priceStr.match(/USD\s*(\d+(?:\.\d+)?)/i);
  
  if (jodMatch) {
    console.log(`Found JOD match: ${jodMatch[1]}`);
    return { value: parseFloat(jodMatch[1]), currency: "JOD" };
  } else if (usdMatch) {
    console.log(`Found USD match: ${usdMatch[1]}`);
    return { value: parseFloat(usdMatch[1]), currency: "USD" };
  }
  
  // If no currency prefix, try to extract just the number
  const numberMatch = priceStr.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    console.log(`Found number match: ${numberMatch[1]}`);
    // Default to JOD if no currency specified
    return { value: parseFloat(numberMatch[1]), currency: "JOD" };
  }
  
  console.log("No price match found");
  return { value: null, currency: null };
}

// Function to test restaurant data loading and processing
async function testRestaurantData() {
  try {
    console.log("Testing restaurant data loading and processing...");
    
    // Use the file system to read the restaurant data
    const { readFileSync } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const filePath = join(__dirname, '..', 'public', 'data', 'Restaurants_2025.json');
    console.log("Reading restaurant data from:", filePath);
    
    const fileData = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);
    console.log("Restaurant data loaded:", data.length, "restaurants");
    console.log("First restaurant data:", data[0]);
    
    // Transform the data from Restaurants_2025.json format to the expected format
    if (data && Array.isArray(data) && data.length > 0 && data[0]["Region "] !== undefined) {
      console.log("Processing Restaurants_2025.json data, found", data.length, "restaurants");
      
      // Keep track of the last non-null region to handle null regions
      let lastRegion = "";
      const transformedData = [];
      
      data.forEach(item => {
        // If region is null, use the last non-null region
        const itemRegion = item["Region "];
        if (itemRegion && itemRegion.trim()) {
          lastRegion = itemRegion.trim();
        }
        
        const region = lastRegion || "Unknown";
        const restaurant = (item["Restaurant Name "] || "").trim();
        
        // Skip items with no restaurant name
        if (!restaurant) return;
        
        console.log(`Processing restaurant: ${restaurant} in region: ${region}`);
        
        // Process lunch price if available
        if (item["Lunch Price P.P"]) {
          // Handle null or undefined
          const lunchPrice = item["Lunch Price P.P"] ? item["Lunch Price P.P"].toString().trim() : "";
          if (!lunchPrice) {
            console.log(`Skipping empty lunch price for ${restaurant}`);
            return;
          }
          
          // Extract the first price if there are multiple (e.g., "JOD 08.00 / Special Lunch JOD 12.00")
          const firstPrice = lunchPrice.split('/')[0].trim();
          // Remove child price if present (e.g., "JOD 6.00 - CHD 03.00")
          const adultPrice = firstPrice.split('-')[0].trim();
          
          const { value, currency } = parsePriceString(adultPrice);
          
          console.log(`Lunch price: ${lunchPrice}, parsed: value=${value}, currency=${currency}`);
          
          if (value && currency) {
            const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
            
            transformedData.push({
              region: region,
              restaurant,
              itemType: "lunch",
              priceOriginalValue: value,
              priceOriginalCurrency: currency,
              usdPrice
            });
          }
        }
        
        // Process dinner price if available
        if (item["Dinner Price P.P"]) {
          // Handle null or undefined
          const dinnerPrice = item["Dinner Price P.P"] ? item["Dinner Price P.P"].toString().trim() : "";
          if (!dinnerPrice) {
            console.log(`Skipping empty dinner price for ${restaurant}`);
            return;
          }
          
          // Extract the first price if there are multiple
          const firstPrice = dinnerPrice.split('/')[0].trim();
          // Remove child price if present
          const adultPrice = firstPrice.split('-')[0].trim();
          
          const { value, currency } = parsePriceString(adultPrice);
          
          console.log(`Dinner price: ${dinnerPrice}, parsed: value=${value}, currency=${currency}`);
          
          if (value && currency) {
            const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
            
            transformedData.push({
              region: region,
              restaurant,
              itemType: "dinner",
              priceOriginalValue: value,
              priceOriginalCurrency: currency,
              usdPrice
            });
          }
        }
      });
      
      console.log("Transformed data:", transformedData.slice(0, 5));
      console.log("Total transformed restaurants:", transformedData.length);
      
      // Test filtering restaurants by region and meal type
      const testRegions = ["Amman", "Petra"];
      const testMealType = "lunch";
      
      console.log(`Testing filtering restaurants for regions: ${testRegions} and meal type: ${testMealType}`);
      
      const filteredRestaurants = transformedData.filter(restaurant => {
        const regionMatch = testRegions.includes(restaurant.region);
        const mealMatch = restaurant.itemType.toLowerCase().includes(testMealType.toLowerCase());
        return regionMatch && mealMatch;
      });
      
      console.log("Filtered restaurants:", filteredRestaurants.length);
      console.log("Filtered restaurant examples:", filteredRestaurants.slice(0, 5));
      
      return {
        success: true,
        message: `Successfully processed ${transformedData.length} restaurants and found ${filteredRestaurants.length} restaurants for regions ${testRegions} and meal type ${testMealType}`
      };
    } else {
      return {
        success: false,
        message: "Invalid restaurant data format"
      };
    }
  } catch (error) {
    console.error("Error testing restaurant data:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Run the test
testRestaurantData().then(result => {
  console.log("Test result:", result);
}).catch(error => {
  console.error("Test failed:", error);
});