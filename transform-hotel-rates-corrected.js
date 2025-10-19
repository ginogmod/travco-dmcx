import fs from 'fs';

// Read the input files
const newRatesPath = '../Downloads/book1_final_rates_wadirum_verified.json';
const existingRatesPath = 'public/data/hotelRates_CLEAN.json';
const outputPath = 'public/data/hotelRates_CLEAN_updated.json';

// Create a backup of the existing file
const backupPath = 'public/data/hotelRates_CLEAN_backup.json';
fs.copyFileSync(existingRatesPath, backupPath);
console.log(`Backup created at ${backupPath}`);

// Read the data
const newRatesData = JSON.parse(fs.readFileSync(newRatesPath, 'utf8'));
const existingRatesData = JSON.parse(fs.readFileSync(existingRatesPath, 'utf8'));

// Function to convert star rating from text to number ONLY for numeric ratings
function convertStarsToNumber(stars) {
    switch (stars) {
        case 'Five': return 5;
        case 'Four': return 4;
        case 'Three': return 3;
        // Keep "Regular" and "Deluxe" as is for Wadi Rum hotels
        case 'Regular': return 'Regular';
        case 'Deluxe': return 'Deluxe';
        default: return stars;
    }
}

// Function to extract season from hotel name
function extractSeasonFromHotelName(hotelName) {
    const seasonKeywords = ['Low', 'High', 'Mid', 'Peak', 'Shoulder', 'EID', 'Regular', 'Flat', 'Easter', 'DLX', 'FIT', 'GRP'];
    
    for (const keyword of seasonKeywords) {
        if (hotelName.includes(` ${keyword}`)) {
            // Remove the season from the hotel name and return both
            const cleanHotelName = hotelName.replace(` ${keyword}`, '');
            return { cleanHotelName, season: keyword };
        }
    }
    
    // If no season found, return the original name and "Regular" as default season
    return { cleanHotelName: hotelName, season: 'Regular' };
}

// Group the new rates by City, Hotel, Stars, and Season
const groupedRates = {};

newRatesData.forEach(entry => {
    // Remove "Star " prefix from hotel name
    let hotelName = entry.Hotel.startsWith('Star ') ? entry.Hotel.substring(5) : entry.Hotel;
    
    // Extract season from hotel name if present
    const { cleanHotelName, season } = extractSeasonFromHotelName(hotelName);
    hotelName = cleanHotelName;
    
    // Convert stars to number (or keep as is for "Regular" and "Deluxe")
    const stars = convertStarsToNumber(entry.Stars);
    
    // Create a unique key for grouping
    const key = `${entry.City}|${hotelName}|${stars}|${season}`;
    
    if (!groupedRates[key]) {
        groupedRates[key] = {
            City: entry.City,
            Stars: stars,
            Hotel: hotelName,
            Season: season,
            Rate_DBL: null,
            Rate_SGL: null,
            Rate_HB: null
        };
    }
    
    // Set the appropriate rate based on room type
    if (entry.RoomType === 'DBL') {
        groupedRates[key].Rate_DBL = entry.Rate;
    } else if (entry.RoomType === 'SGL') {
        groupedRates[key].Rate_SGL = entry.Rate;
    } else if (entry.RoomType === 'HB') {
        groupedRates[key].Rate_HB = entry.Rate;
    }
});

// Convert the grouped rates to an array
const transformedRates = Object.values(groupedRates);

// Merge with existing rates (keeping existing entries that aren't in the new data)
const existingRateKeys = new Set();
existingRatesData.forEach(entry => {
    const key = `${entry.City}|${entry.Hotel}|${entry.Stars}|${entry.Season}`;
    existingRateKeys.add(key);
});

// Add existing entries that aren't in the new data
existingRatesData.forEach(entry => {
    const key = `${entry.City}|${entry.Hotel}|${entry.Stars}|${entry.Season}`;
    if (!groupedRates[key]) {
        transformedRates.push(entry);
    }
});

// Write the transformed data to the output file
fs.writeFileSync(outputPath, JSON.stringify(transformedRates, null, 2));
console.log(`Transformed data written to ${outputPath}`);

// Print some statistics
console.log(`Original new entries: ${newRatesData.length}`);
console.log(`Transformed entries: ${Object.keys(groupedRates).length}`);
console.log(`Total entries in output: ${transformedRates.length}`);