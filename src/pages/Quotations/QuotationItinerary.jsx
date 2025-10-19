import React, { useState, useEffect, useMemo, useCallback } from "react";
import CostRow from "./CostRow";
import { determineSeason } from "../../assets/utils/seasonalityUtils";
import { transformedRestaurantData, JOD_TO_USD_RATE } from "../../assets/utils/restaurantData";

 // Define extras options for dropdown (mirrors GroupSeriesQuotationItinerary)
const extrasOptions = [
  "Airport Transfer",
  "VIP Service",
  "Special Guide",
  "Photography Service",
  "Luxury Transportation",
  "Private Access",
  "Special Meal",
  "Cultural Experience",
  "Adventure Activity",
  "Wellness Service",
  "Shopping Tour",
  "Custom Request",
  "Guide AQB - AMMAN Transport",
  "AlHreith Trail - Yarmouk Forest Reserve",
  "Alshreif Mountain - Yarmouk Forest Reserve",
  "Arqoub Romi Trail - Yarmouk Forest Reserve",
  "Audio Guide Gear",
  "Azraq Village Bike Trail - Azraq Wetland Reserve",
  "Beach Access with Boat Trip/snorkeling & Lunch - Aladdin Wavs",
  "Beach Access with Boat Trip/snorkeling & Lunch + DJ Party - Aladdin Waves",
  "Aladdin Wavs",
  "Bedouin Storytelling Session",
  "Beer Testing",
  "Biscuit House Experience - Ajloun Forest Reserve",
  "Breakfast",
  "Burqu Castle Trail - Burqu Reserve",
  "Burqu Dame Trail (Sunset)- Burqu Reserve",
  "Burqu desert safari Alhadallat Safari 4X4 Trail - Burqu Reserve",
  "Cake",
  "Calligraphy",
  "Calligraphy House Experience - Ajloun Forest Reserve",
  "Camel in Wadi Rum",
  "canapes & Drink",
  "Cardamom Coffee",
  "Commission",
  "Conference/MICE",
  "Dana Village Trail - Dana Biosphere Reserve",
  "Dead Sea Swim & Lunch",
  "Departure Tax",
  "Diesel Train Tour",
  "Dinner",
  "Dinner Local family house",
  "Discover Scuba Diving with Sindibad",
  "Discovery Glass Bottom Boat with BBQ Lunch with Sindibad Aqaba",
  "Discovery Glass Bottom Boat without lunch with Sindibad Aqaba",
  "Driver fees",
  "Driver Overnight",
  "Driver Tips",
  "Electric car in Petra (One Way)",
  "Entrance only (Beach)",
  "Entrance Ticket to Saraya Aqaba",
  "Extra Service (Details at the Notes)",
  "Ferry Boat",
  "Flight Ticket",
  "Flower Bouquet",
  "Fuel",
  "Geft",
  "Glass Bottom Boat Trip with BBQ Lunch (3 hour) - Aquamarina / Seabreeze",
  "Glass Bottom Boat Trip with Lunch (4 hour) - Aladdin Waves",
  "Glass Bottom Boat Trip without lunch - Aquamarina / Seabreeze",
  "Golf Course (18 Holes)",
  "Golf Course (9 Holes)",
  "Guide Commission",
  "Guide Fees",
  "Guide Overnight",
  "Guide Tip",
  "Henna Fantasia - Jordan Folklore Night Show",
  "Henna Workshop",
  "Hiking Guide",
  "Horse Carriage",
  "Horseback Riding",
  "Hot Air-Balloon",
  "Hotel Accommodation + Airport Transfers",
  "Hotel Cash Payment",
  "Hotel Portages",
  "hotel Tips",
  "Ibex Trail - Mujib Biosphere Reserve",
  "Jarjour Safari 4X4 Trail - Burqu Reserve",
  "JEEP",
  "Jeep Ride 03 Hrs.",
  "Jeep Ride 05 Hours",
  "Jeep Ride 2 Hours",
  "Jeep Ride 4 Hours",
  "Jerash visit",
  "Jerusalem One Day Tour",
  "Jerusalem package",
  "Jordan Pass",
  "Kohl experience Feynan ecolodge",
  "Large Wheelchair",
  "local guide Amman",
  "Local Guide in Jearsh (( Group ))",
  "Local Guide in Jerash (( Individual ))",
  "local guide Petra",
  "Lunch (Cash)",
  "Mar Elias Trail - The Prophet's trail (Includes Lunch Bag)",
  "Marsh Trail - Azraq Wetland Reserve",
  "Mass at St. Moses Church",
  "Medical insurance",
  "Medlab",
  "Mudflat Bike Trail - Azraq Wetland Reserve",
  "Muntamra Valley Trail - Yarmouk Forest Reserve",
  "Nawatef Trail - Dana Biosphere Reserve",
  "Oryx Safari Long Trail - Shaumari Wildlief Reserve",
  "Oryx Safari Short Trail - Shaumari Wildlief Reserve",
  "Others",
  "PCR Test",
  "Petra Balloon",
  "Petra by night",
  "portages (ARR)",
  "portages (DEP)",
  "Portages (Hotels)",
  "PROSECO",
  "QR code - PCR upon arrival",
  "Rasoun Trail - Ajoun Forest Reserve",
  "Restaurant Payment",
  "Resturants Tips",
  "Rift Vally Mountain Trek (RVMT) from Dana to Little Petra",
  "Roe Deer Trail - Ajloun Forest Reserve",
  "Rummana Mountain Trail - Dana Biosphere Reserve",
  "Sand Boarding in Wadi Rum",
  "Scuba Diving (Shore Dive)",
  "Security",
  "Shaq El Reesh Trail - Dana Biosphere Reserve",
  "Sheikh Hussein Border Luggage Fee / Free",
  "Shipment fees",
  "Silver Meet & Greet / Arrival",
  "Silver Meet & Greet / Departure",
  "Sim Card",
  "Siq Trail - Wadi Mujib",
  "Snorkeling & Boat Cruise without Lunch (3 Hours)",
  "Snorkeling Cruise with BBQ lunch (4 Hours)",
  "Snorkeling Cruise with lunch (3 Hours) - Aquamarina/ Seabreeze",
  "Snorkeling Cruise with lunch (3 Hours)/ Aladdin",
  "Spa Treatments",
  "staff deposit",
  "Standard Wheelchair",
  "Stargazing (RumSky Stargazing)",
  "Steam Train Tour-cruise",
  "Sunset Cruise for 2 Hours with Dinner - Aquamarina / Seabreeze",
  "Tea With Bedouin In Little Petra",
  "Tikram Service at airport",
  "Tips",
  "Transfer",
  "Transportaions",
  "Travco Staff Exp.",
  "Trekking (2 Hours) - Wadi Rum with Jeep Support",
  "Trekking (3 Hours) - Wadi Rum with Jeep Support",
  "TURKISH BATH",
  "UTV ROCK ADVENTURE (1 HOUR) - 2 Seats UTV",
  "UTV ROCK ADVENTURE (1 HOUR) - 4 Seats UTV",
  "UTV ROCK ADVENTURE (2 HOUR) - 2 Seats UTV",
  "UTV ROCK ADVENTURE (2 HOUR) - 4 Seats UTV",
  "UTV ROCK ADVENTURE (4 HOUR) - 2 Seats UTV",
  "UTV ROCK ADVENTURE (4 HOUR) - 4 Seats UTV",
  "UTV ROCK ADVENTURE (8 HOUR) - 2 Seats UTV",
  "UTV ROCK ADVENTURE (8 HOUR) - 4 Seats UTV",
  "Visa Fees",
  "Wadi Dana Trail - Dana Biosphere reserve to Feynan",
  "Wadi Numira",
  "Water",
  "Water Buffalo Trail - Azraq Wetland Reserve",
  "White Dome Trail - Dana Biosphere Reserve",
  "Yoga in Wadi Rum",
  "Zipline (330 Meters) - Ajloun Forest Reserve"
];

// Define extras with costs (mirrors GroupSeriesQuotationItinerary)
const extrasCosts = {
  "Guide AQB - AMMAN Transport": 14.10,
  "AlHreith Trail - Yarmouk Forest Reserve": 11.30,
  "Alshreif Mountain - Yarmouk Forest Reserve": 15.54,
  "Arqoub Romi Trail - Yarmouk Forest Reserve": 19.77,
  "Audio Guide Gear": 0.00,
  "Azraq Village Bike Trail - Azraq Wetland Reserve": 28.25,
  "Beach Access with Boat Trip/snorkeling & Lunch - Aladdin Wavs": 35.31,
  "Beach Access with Boat Trip/snorkeling & Lunch + DJ Party - Aladdin Waves": 45.20,
  "Aladdin Wavs": 0.00,
  "Bedouin Storytelling Session": 0.00,
  "Beer Testing": 0.00,
  "Biscuit House Experience - Ajloun Forest Reserve": 8.47,
  "Breakfast": 0.00,
  "Burqu Castle Trail - Burqu Reserve": 14.12,
  "Burqu Dame Trail (Sunset)- Burqu Reserve": 14.12,
  "Burqu desert safari Alhadallat Safari 4X4 Trail - Burqu Reserve": 169.49,
  "Cake": 0.00,
  "Calligraphy": 7.06,
  "Calligraphy House Experience - Ajloun Forest Reserve": 7.06,
  "Camel in Wadi Rum": 21.19,
  "canapes & Drink": 35.31,
  "Cardamom Coffee": 9.89,
  "Commission": 0.00,
  "Conference/MICE": 0.00,
  "Dana Village Trail - Dana Biosphere Reserve": 11.30,
  "Dead Sea Swim & Lunch(Holiday inn)": 19.77,
  "Departure Tax": 14.12,
  "Diesel Train Tour(Private)": 1694.92,
  "Dinner(Hikayet Sitti)": 8.47,
  "Dinner Local family house(Mohammad Falahat)": 11.30,
  "Discover Scuba Diving with Sindibad": 0.00,
  "Discovery Glass Bottom Boat with BBQ Lunch with Sindibad Aqaba": 35.31,
  "Discovery Glass Bottom Boat without lunch with Sindibad Aqaba": 21.19,
  "Driver fees": 0.00,
  "Driver Overnight": 21.19,
  "Driver Tips": 0.00,
  "Electric car in Petra (One Way)": 0.00,
  "Entrance only (Beach)": 0.00,
  "Entrance Ticket to Saraya Aqaba": 21.19,
  "Extra Service (Details at the Notes)": 0.00,
  "Ferry Boat": 0.00,
  "Flight Ticket": 0.00,
  "Flower Bouquet": 0.00,
  "Fuel": 0.00,
  "Gift": 0.00,
  "Glass Bottom Boat Trip with BBQ Lunch (3 hour) - Aquamarina / Seabreeze": 28.25,
  "Glass Bottom Boat Trip with Lunch (4 hour) - Aladdin Waves": 28.25,
  "Glass Bottom Boat Trip without lunch - Aquamarina / Seabreeze": 0.00,
  "Golf Course (18 Holes)": 84.75,
  "Golf Course (9 Holes)": 42.37,
  "Guide Commission": 0.00,
  "Guide Fees": 0.00,
  "Guide Overnight": 0.00,
  "Guide Tip": 0.00,
  "Henna Fantasia - Jordan Folklore Night Show": 19.77,
  "Henna Workshop": 0.00,
  "Hiking Guide": 0.00,
  "Horse Carriage": 0.00,
  "Horseback Riding": 0.00,
  "Hot Air-Balloon (Rum Sky)": 190.67,
  "Hotel Accommodation + Airport Transfers": 0.00,
  "Hotel Cash Payment": 0.00,
  "Hotel Portages": 0.00,
  "hotel Tips": 0.00,
  "Ibex Trail - Mujib Biosphere Reserve": 28.25,
  "Jarjour Safari 4X4 Trail - Burqu Reserve (Per 4 PAX)": 84.75,
  "JEEP": 0.00,
  "Jeep Ride 03 Hrs.(Per 6 PAX)": 70.62,
  "Jeep Ride 05 Hours(Per 6 PAX": 0.00,
  "Jeep Ride 2 Hours(Per 6 PAX)": 50.00,
  "Jeep Ride 4 Hours(Per 6 PAX)": 95.00,
  "Jerash visit": 0.00,
  "Jerusalem One Day Tour": 0.00,
  "Jerusalem package": 0.00,
  "Jordan Pass": 0.00,
  "Kohl experience Feynan ecolodge": 0.00,
  "Large Wheelchair": 3.00,
  "local guide Amman": 0.00,
  "Local Guide in Jearsh (( Group ))": 0.00,
  "Local Guide in Jerash (( Individual ))": 0.00,
  "local guide Petra": 0.00,
  "Lunch (Cash)": 0.00,
  "Mar Elias Trail - The Prophet's trail (Includes Lunch Bag)": 28.25,
  "Marsh Trail - Azraq Wetland Reserve": 12.00,
  "Mass at St. Moses Church": 5.00,
  "Medical insurance": 0.00,
  "Medlab": 0.00,
  "Mudflat Bike Trail - Azraq Wetland Reserve": 15.55,
  "Muntamra Valley Trail - Yarmouk Forest Reserve": 15.55,
  "Nawatef Trail - Dana Biosphere Reserve": 15.55,
  "Oryx Safari Long Trail - Shaumari Wildlief Reserve": 24.00,
  "Oryx Safari Short Trail - Shaumari Wildlief Reserve": 18.36,
  "Others": 0.00,
  "PCR Test": 0.00,
  "Petra Balloon": 32.14,
  "Petra by night": 43.00,
  "portages (ARR)": 0.00,
  "portages (DEP)": 0.00,
  "Portages (Hotels)": 0.00,
  "PROSECO": 11.30,
  "QR code - PCR upon arrival": 0.00,
  "Rasoun Trail - Ajoun Forest Reserve": 20.00,
  "Restaurant Payment": 0.00,
  "Resturants Tips": 0.00,
  "Rift Vally Mountain Trek (RVMT) from Dana to Little Petra": 122.88,
  "Roe Deer Trail - Ajloun Forest Reserve": 11.30,
  "Rummana Mountain Trail - Dana Biosphere Reserve": 11.30,
  "Sand Boarding in Wadi Rum": 0.00,
  "Scuba Diving (Shore Dive)": 0.00,
  "Security": 0.00,
  "Shaq El Reesh Trail - Dana Biosphere Reserve(Min 6 PAX)": 14.12,
  "Sheikh Hussein Border Luggage Fee / Free": 0.00,
  "Shipment fees": 0.00,
  "Silver Meet & Greet / Arrival": 0.00,
  "Silver Meet & Greet / Departure": 0.00,
  "Sim Card": 0.00,
  "Siq Trail - Wadi Mujib(2 Hours)": 28.25,
  "Snorkeling & Boat Cruise without Lunch (3 Hours)": 0.00,
  "Snorkeling Cruise with BBQ lunch (4 Hours)": 21.19,
  "Snorkeling Cruise with lunch (3 Hours) - Aquamarina/ Seabreeze": 22.60,
  "Snorkeling Cruise with lunch (3 Hours)/ Aladdin": 21.19,
  "Spa Treatments": 0.00,
  "staff deposit": 0.00,
  "Standard Wheelchair": 0.00,
  "Stargazing (RumSky Stargazing)": 24.00,
  "Steam Train Tour-cruise(Per Group)": 1977.40,
  "Sunset Cruise for 2 Hours with Dinner - Aquamarina / Seabreeze": 24.00,
  "Tea With Bedouin In Little Petra": 3.00,
  "Tikram Service at airport": 0.00,
  "Tips": 0.00,
  "Transfer": 0.00,
  "Transportaions": 0.00,
  "Travco Staff Exp.": 0.00,
  "Trekking (2 Hours) - Wadi Rum with Jeep Support": 0.00,
  "Trekking (3 Hours) - Wadi Rum with Jeep Support": 0.00,
  "TURKISH BATH": 28.25,
  "UTV ROCK ADVENTURE (1 HOUR) - 2 Seats UTV": 70.62,
  "UTV ROCK ADVENTURE (1 HOUR) - 4 Seats UTV": 113.00,
  "UTV ROCK ADVENTURE (2 HOUR) - 2 Seats UTV": 127.12,
  "UTV ROCK ADVENTURE (2 HOUR) - 4 Seats UTV": 204.80,
  "UTV ROCK ADVENTURE (4 HOUR) - 2 Seats UTV": 183.62,
  "UTV ROCK ADVENTURE (4 HOUR) - 4 Seats UTV": 283.00,
  "UTV ROCK ADVENTURE (8 HOUR) - 2 Seats UTV": 339.00,
  "UTV ROCK ADVENTURE (8 HOUR) - 4 Seats UTV": 536.72,
  "Visa Fees": 56.50,
  "Wadi Dana Trail - Dana Biosphere reserve to Feynan(RSCN)": 24.00,
  "Wadi Numira": 0.00,
  "Water": 0.00,
  "Water Buffalo Trail - Azraq Wetland Reserve": 14.12,
  "White Dome Trail - Dana Biosphere Reserve": 14.12,
  "Yoga in Wadi Rum": 0.00,
  "Zipline (330 Meters) - Ajloun Forest Reserve": 28.25,
  "Airport Transfer": 0.00,
  "VIP Service": 0.00,
  "Special Guide": 0.00,
  "Photography Service": 0.00,
  "Luxury Transportation": 0.00,
  "Private Access": 0.00,
  "Special Meal": 0.00,
  "Cultural Experience": 0.00,
  "Adventure Activity": 0.00,
  "Wellness Service": 0.00,
  "Shopping Tour": 0.00,
  "Custom Request": 0.00
};

// Use the imported JOD_TO_USD_RATE
const JOD_TO_USD = JOD_TO_USD_RATE;

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
 
const initialAccommodation = {
  city: "",
  stars: "",
  hotelName: "",
  season: "", // Added separate season field
  dblRate: "",
  hbRate: "",
  sglRate: "",
  sglSupp: "",
  isManualRate: false,
  nights: 1,
  board: "B/B",
};

function QuotationItinerary({ paxRanges = [], arrivalDate, departureDate, onDataChange, agentId, transportationDiscount = 0, initialData = {} }) {
  console.log("QuotationItinerary rendering with props:", {
    paxRanges,
    arrivalDate,
    departureDate,
    agentId,
    transportationDiscount,
    initialDataKeys: Object.keys(initialData)
  });
  
  if (initialData && Object.keys(initialData).length > 0) {
    console.log("Initial data first key:", Object.keys(initialData)[0]);
    const firstKey = Object.keys(initialData)[0];
    console.log("Initial data first item:", initialData[firstKey]);
  }
  
  const [rows, setRows] = useState([]);
  const [fees, setFees] = useState([]);
  const [jeepServices, setJeepServices] = useState([]);
  const [hotelRates, setHotelRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [transportRates, setTransportRates] = useState({});
  const [guideRates, setGuideRates] = useState({ Local: {}, Private: {} });
  const [profitMargin, setProfitMargin] = useState(0.10);
  const [seasonalityData, setSeasonalityData] = useState({});
  
  // Store Jerash guide options per pax range with a more explicit structure
  const [jerashGuideOptions, setJerashGuideOptions] = useState(() => {
    // Initialize with empty objects for each pax range if available
    const initialOptions = {};
    if (paxRanges && paxRanges.length > 0) {
      paxRanges.forEach(range => {
        initialOptions[String(range.value)] = { isFIT: false, isGroup: false };
      });
    }
    
    // If we have initial data with Jerash guide options, use them
    if (initialData && Object.keys(initialData).length > 0) {
      const firstPaxKey = Object.keys(initialData)[0];
      const firstPaxData = initialData[firstPaxKey];
      
      if (firstPaxData && firstPaxData.costs && firstPaxData.costs.jerashGuideOptions) {
        console.log("Found Jerash guide options in initial data:", firstPaxData.costs.jerashGuideOptions);
        initialOptions[String(firstPaxKey)] = firstPaxData.costs.jerashGuideOptions;
      }
    }
    
    return initialOptions;
  });
  
  const [options, setOptions] = useState(() => {
    // Check if we have initial data with options
    if (initialData && Object.keys(initialData).length > 0) {
      const firstPaxKey = Object.keys(initialData)[0];
      const firstPaxData = initialData[firstPaxKey];
      
      console.log("Initializing options with data:", firstPaxData);
      
      // Check if we have options data in the expected format
      if (firstPaxData && firstPaxData.options && Array.isArray(firstPaxData.options)) {
        console.log("Found options data:", firstPaxData.options);
        
        return firstPaxData.options.map(option => ({
          accommodations: option.accommodations || [{...initialAccommodation}]
        }));
      }
      
      // Alternative format: check if the data itself contains accommodations
      // This handles the case where options might be structured differently
      if (firstPaxData.accommodations || (firstPaxData.options && firstPaxData.options.accommodations)) {
        const accommodations = firstPaxData.accommodations || firstPaxData.options.accommodations;
        console.log("Found accommodations directly:", accommodations);
        return [{ accommodations: Array.isArray(accommodations) ? accommodations : [{...initialAccommodation}] }];
      }
    }
    
    // Default options if no initial data
    return [1, 2, 3].map(() => ({ accommodations: [{...initialAccommodation}] }));
  });
  const [calculationResults, setCalculationResults] = useState({});
  const [currentPaxRange, setCurrentPaxRange] = useState(paxRanges[0]?.value || '');
  const [guideData, setGuideData] = useState({});
  const [useSpecialRates, setUseSpecialRates] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jerashExtraCost, setJerashExtraCost] = useState(14.10);
  // Use the imported transformedRestaurantData instead of hardcoded data
  const [restaurantData, setRestaurantData] = useState(transformedRestaurantData || []);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(-1);
  const [waterIncluded, setWaterIncluded] = useState(false);
  const [determinedSeasons, setDeterminedSeasons] = useState({});

  // Map of all locations in itineraries to restaurant regions
  const locationToRegionMap = {
    'Amman': 'Amman',
    'Amman City Tour': 'Amman',
    'Amman QAIA': 'Amman', // Queen Alia International Airport
    'QAIA': 'Amman',
    'Arrival QAIA': 'Amman', // Arrival at Queen Alia International Airport
    'Departure QAIA': 'Amman', // Departure from Queen Alia International Airport
    'Jerash': 'Jerash',
    'Madaba': 'Madaba',
    'Mount Nebo': 'Mount Nebo',
    'Nebo': 'Mount Nebo',
    'Petra': 'Petra',
    'Petra second day visit': 'Petra',
    'Wadi Rum': 'Wadi Rum',
    'Dead Sea': 'Dead Sea',
    'Aqaba': 'Aqaba',
    'Ajloun': 'Ajloun',
    'Kerak': 'Kerak',
    'Um Qais': 'Um Qais',
    'Baptism Site': 'Baptism',
    'Bethany': 'Baptism',
    'Shobak': 'Petra',
    'EL DEIR / MONASTERY': 'Petra',
    'El Deir/ Monastery': 'Petra',
    'Petra by night': 'Petra',
    'Dana': 'Dana',
    'Little Petra': 'Petra',
    'Desert Castles': 'Amman',
    // Overnight (O/N) locations
    'Amman O/N': 'Amman',
    'Petra O/N': 'Petra',
    'Wadi Rum O/N': 'Wadi Rum',
    'Dead Sea O/N': 'Dead Sea',
    'Aqaba O/N': 'Aqaba',
    'Salt': 'Amman',
    'Um Al Rassas': 'Madaba',
    'Makawir': 'Madaba',
    'Anjara': 'Jerash',
    'Mar Elias': 'Jerash',
    'Pella': 'Jerash',
    'Irbid': 'Jerash',
    'Mujib': 'Dead Sea',
    // Free day options
    'Free day in Amman': 'Amman',
    'Free day in Petra': 'Petra',
    'Free day in Dead Sea': 'Dead Sea',
    'Free day in Aqaba': 'Aqaba',
    'Free day in Wadi Rum': 'Wadi Rum',
    'Free day': 'Amman', // Default region
    'Leisure day in Amman': 'Amman',
    'Leisure day in Petra': 'Petra',
    'Leisure day in Dead Sea': 'Dead Sea',
    'Leisure day in Aqaba': 'Aqaba',
    'Leisure day in Wadi Rum': 'Wadi Rum',
    'Leisure day': 'Amman', // Default region
    'Day at leisure in Amman': 'Amman',
    'Day at leisure in Petra': 'Petra',
    'Day at leisure in Dead Sea': 'Dead Sea',
    'Day at leisure in Aqaba': 'Aqaba',
    'Day at leisure in Wadi Rum': 'Wadi Rum',
    'Day at leisure': 'Amman', // Default region
    'Rest day in Amman': 'Amman',
    'Rest day in Petra': 'Petra',
    'Rest day in Dead Sea': 'Dead Sea',
    'Rest day in Aqaba': 'Aqaba',
    'Rest day in Wadi Rum': 'Wadi Rum',
    'Rest day': 'Amman', // Default region
    // Additional locations in Jordan
    'Feynan': 'Dana', // Feynan Ecolodge area in Dana Biosphere Reserve
    'Feynan O/N': 'Dana', // Overnight at Feynan Ecolodge
    'Wadi Dana': 'Dana', // The valley in Dana Biosphere Reserve
    'Dibeen Forest': 'Jerash', // Pine forest nature reserve near Jerash
    'Azraq Wetland': 'Azraq', // Eastern desert wetland reserve
    'Azraq Castle': 'Azraq', // Desert castle in eastern Jordan
    'Karak Castle': 'Kerak', // Alternative spelling for Kerak Castle
    'Iraq Al-Amir': 'Amman', // Hellenistic ruins west of Amman
    'Umm Ar-Rasas': 'Madaba', // Alternative spelling for Um Al Rassas
    'Ajlun Castle': 'Ajloun', // Alternative spelling for Ajloun Castle
    'Umm Qais': 'Um Qais', // Alternative spelling for Um Qais
    'Qasr Amra': 'Amman', // Desert castle east of Amman
    'Qasr Kharana': 'Amman', // Desert castle east of Amman
    'Qasr Al-Hallabat': 'Amman', // Desert castle east of Amman
    'Hammamat Ma\'in': 'Dead Sea', // Hot springs near the Dead Sea
    'Ma\'in Hot Springs': 'Dead Sea', // Alternative name for Hammamat Ma'in
    'Wadi Mujib': 'Dead Sea', // The valley of Mujib Nature Reserve
    'Lot\'s Cave': 'Dead Sea', // Archaeological site near the Dead Sea
    'Tala Bay': 'Aqaba', // Resort area in Aqaba
    'South Beach': 'Aqaba', // Beach area in Aqaba
    'Royal Diving Center': 'Aqaba', // Diving site in Aqaba
    'Japanese Garden': 'Aqaba', // Diving site in Aqaba
    'Rainbow Street': 'Amman', // Popular street in Amman
    'Citadel': 'Amman', // Historical site in Amman
    'Roman Theater': 'Amman', // Historical site in Amman
    'King Abdullah Mosque': 'Amman', // Religious site in Amman
    'Royal Automobile Museum': 'Amman', // Museum in Amman
    'Jordan Museum': 'Amman', // Museum in Amman
    'Amman Panoramic Tour': 'Amman', // Sightseeing tour in Amman
    'Downtown Amman': 'Amman', // City center of Amman
    'Jabal Amman': 'Amman', // District in Amman
    'Abdali': 'Amman', // Modern district in Amman
    'Sweimeh': 'Dead Sea', // Area on the Dead Sea
    'Sowayma': 'Dead Sea', // Area on the Dead Sea
    'Wadi Araba': 'Aqaba', // Desert valley between Dead Sea and Aqaba
    'Ras Al-Naqab': 'Aqaba', // Mountain area near Aqaba
    'Diseh': 'Wadi Rum', // Village near Wadi Rum
    'Seven Pillars of Wisdom': 'Wadi Rum', // Rock formation in Wadi Rum
    'Burdah Rock Bridge': 'Wadi Rum', // Natural arch in Wadi Rum
    'Um Fruth Rock Bridge': 'Wadi Rum', // Natural arch in Wadi Rum
    'Lawrence Spring': 'Wadi Rum', // Spring in Wadi Rum
    'Khazali Canyon': 'Wadi Rum', // Canyon in Wadi Rum
    'Siq al-Barid': 'Petra', // Another name for Little Petra
    'Al-Khazneh': 'Petra', // The Treasury in Petra
    'Royal Tombs': 'Petra', // Area in Petra
    'Street of Facades': 'Petra', // Area in Petra
    'Colonnaded Street': 'Petra', // Area in Petra
    'Great Temple': 'Petra', // Structure in Petra
    'Byzantine Church': 'Petra', // Structure in Petra
    'High Place of Sacrifice': 'Petra', // Site in Petra
    'Monastery Trail': 'Petra', // Hiking trail in Petra
    'Wadi Musa': 'Petra', // Town adjacent to Petra
    'Mount Aaron': 'Petra', // Mountain near Petra
    'Sela': 'Petra', // Ancient city near Petra
    'Tafilah': 'Dana', // City in southern Jordan
    'Showbak': 'Petra', // Alternative spelling for Shobak
    'Montreal Castle': 'Petra', // Another name for Shobak Castle
    'Rabba': 'Kerak', // Town in Kerak Governorate
    'Mazar Islamic Complex': 'Kerak', // Religious site in Kerak
    'Mukawir': 'Madaba', // Alternative spelling for Makawir
    'Machaerus': 'Madaba', // Roman fortress at Makawir
    'Mount Nebo Viewpoint': 'Mount Nebo', // Specific viewpoint at Mount Nebo
    'Moses Memorial Church': 'Mount Nebo', // Church at Mount Nebo
    'Madaba Archaeological Park': 'Madaba', // Archaeological site in Madaba
    'Apostles Church': 'Madaba', // Church in Madaba
    'Hippolytus Hall': 'Madaba', // Archaeological site in Madaba
    'Madaba Mosaic Map': 'Madaba', // Famous mosaic in Madaba
    'Hisban': 'Madaba', // Archaeological site near Madaba
    'Tell Hesban': 'Madaba', // Archaeological site near Madaba
    'Jerash Archaeological Park': 'Jerash', // Main site in Jerash
    'Hadrian\'s Arch': 'Jerash', // Structure in Jerash
    'Hippodrome': 'Jerash', // Structure in Jerash
    'Oval Plaza': 'Jerash', // Area in Jerash
    'Temple of Artemis': 'Jerash', // Structure in Jerash
    'South Theater': 'Jerash', // Structure in Jerash
    'Nymphaeum': 'Jerash', // Structure in Jerash
    'Cardo Maximus': 'Jerash', // Street in Jerash
    'Ajloun Forest Reserve': 'Ajloun', // Nature reserve in Ajloun
    'Ajloun Highland Trail': 'Ajloun', // Hiking trail in Ajloun
    'Tal Mar Elias': 'Ajloun', // Alternative spelling for Mar Elias
    'Listib': 'Ajloun', // Village in Ajloun
    'Rasun': 'Ajloun', // Village in Ajloun
    'Orjan': 'Ajloun', // Village in Ajloun
    'Tabaqat Fahl': 'Jerash', // Another name for Pella
    'Jordan Valley Panorama': 'Jerash', // Viewpoint near Pella
    'Deir Alla': 'Jerash', // Archaeological site in Jordan Valley
    'Umm el-Jimal': 'Jerash', // Archaeological site in northern Jordan
    'Rehab': 'Jerash', // Archaeological site in northern Jordan
    'Abila': 'Jerash', // Archaeological site in northern Jordan
    'Gadara': 'Um Qais', // Ancient name for Um Qais
    'Yarmouk River': 'Um Qais', // River near Um Qais
    'Sea of Galilee Viewpoint': 'Um Qais', // Viewpoint at Um Qais
    'West Theater': 'Um Qais', // Structure in Um Qais
    'Basilica Terrace': 'Um Qais', // Area in Um Qais
    'Ottoman Village': 'Um Qais' // Historical area in Um Qais
  };

  // Function to extract regions from itinerary description (GS-aligned)
  const extractRegionsFromItinerary = (itineraryText) => {
    if (!itineraryText) return [];
    const uniqueRegions = Array.from(new Set((restaurantData || []).map(r => r.region).filter(Boolean)));
    const lower = itineraryText.toLowerCase();
    const regions = uniqueRegions.filter(region => lower.includes(region.toLowerCase()));
    return regions.length ? regions : uniqueRegions;
  };

  // Function to load all rate data with cache-busting
  const loadRateData = useCallback(() => {
    setIsRefreshing(true);
    
    // First try to load hotel rates from localStorage
    const savedHotelRates = localStorage.getItem('hotelRates');
    let hotelRatesPromise;
    
    if (savedHotelRates) {
      try {
        const parsedData = JSON.parse(savedHotelRates);
        console.log('Using hotel rates from localStorage');
        hotelRatesPromise = Promise.resolve(parsedData);
      } catch (err) {
        console.error('Error parsing localStorage hotel rates:', err);
        // Fallback to server data
        hotelRatesPromise = fetch(`/data/hotelRates_CLEAN.json?v=${Date.now()}`).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
          return res.json();
        });
      }
    } else {
      // No localStorage data, try server
      hotelRatesPromise = fetch(`/data/hotelRates_CLEAN.json?v=${Date.now()}`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
        return res.json();
      });
    }
    
    Promise.all([
      fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch entrance fees: ${res.status}`);
        return res.json();
      }).then(data => {
        console.log("Loaded RepEnt_Fees.json:", data);
        return data;
      }),
      hotelRatesPromise,
      fetch(`/data/transportRates.json?v=${Date.now()}`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch transport rates: ${res.status}`);
        return res.json();
      }),
      // Always fetch guide rates from guidesRates.json which has the correct rate structure
      fetch(`/data/guidesRates.json?v=${Date.now()}`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch guide rates: ${res.status}`);
        return res.json();
      }),
      // Load seasonality data from localStorage first
      Promise.resolve().then(() => {
        const savedSeasonalityData = localStorage.getItem('seasonalityData');
        if (savedSeasonalityData) {
          try {
            const parsedData = JSON.parse(savedSeasonalityData);
            console.log('Using seasonality data from localStorage');
            return parsedData;
          } catch (err) {
            console.error('Error parsing localStorage seasonality data:', err);
            // Fallback to server data
            return fetch(`/data/seasonality.json?v=${Date.now()}`).then(res => {
              if (!res.ok) throw new Error(`Failed to fetch seasonality data: ${res.status}`);
              return res.json();
            }).catch(err => {
              console.error("Error loading seasonality data:", err);
              return { hotelSeasons: {} };
            });
          }
        } else {
          // No localStorage data, try server
          return fetch(`/data/seasonality.json?v=${Date.now()}`).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch seasonality data: ${res.status}`);
            return res.json();
          }).catch(err => {
            console.error("Error loading seasonality data:", err);
            return { hotelSeasons: {} };
          });
        }
      }),
      // Try to load Restaurants_2025.json first - use a direct path to ensure it's found
      fetch(`/data/Restaurants_2025.json?v=${Date.now()}`).then(res => {
        console.log("Restaurants_2025.json fetch response:", res.status, res.statusText);
        if (!res.ok) {
          // Fallback to the original restaurants_usd.json if Restaurants_2025.json is not available
          console.warn("Could not load Restaurants_2025.json, falling back to restaurants_usd.json");
          return fetch(`/data/restaurants_usd.json?v=${Date.now()}`).then(res => {
            console.log("restaurants_usd.json fetch response:", res.status, res.statusText);
            if (!res.ok) throw new Error(`Failed to fetch restaurant data: ${res.status}`);
            return res.json();
          });
        }
        return res.json();
      }).then(data => {
        // Add debugging to see what data we're getting
        console.log("Restaurant data loaded:", data);
        console.log("Restaurant data type:", typeof data);
        console.log("Restaurant data length:", data ? (Array.isArray(data) ? data.length : "not an array") : "null");
        
        // Add more detailed debugging
        console.log("RESTAURANT DATA DEBUGGING:");
        console.log("Is data null or undefined?", data == null);
        console.log("Is data an array?", Array.isArray(data));
        if (Array.isArray(data)) {
          console.log("First 3 items:", data.slice(0, 3));
          console.log("Sample restaurant names:", data.slice(0, 5).map(r => r["Restaurant Name "] || "No name"));
        }
        
        // Transform the data from Restaurants_2025.json format to the expected format
        if (data && Array.isArray(data) && data.length > 0 && data[0]["Region "] !== undefined) {
          console.log("Processing Restaurants_2025.json data, found", data.length, "restaurants");
          console.log("First restaurant data:", data[0]);
          // This is Restaurants_2025.json format
          const transformedData = [];
          
          // Keep track of the last non-null region to handle null regions
          let lastRegion = "";
          
          // Process each restaurant in the data
          data.forEach((item, index) => {
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
            
            console.log(`Processing restaurant: ${restaurant} in region: ${region}`);
            
            // Always add a lunch entry even if no price is available
            // This ensures all restaurants show up in the dropdown
            const lunchPrice = item["Lunch Price P.P"] ? item["Lunch Price P.P"].toString().trim() : "";
            
            if (lunchPrice) {
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
              } else {
                // Add with default price if parsing failed
                transformedData.push({
                  region: region,
                  restaurant,
                  itemType: "lunch",
                  priceOriginalValue: 10,
                  priceOriginalCurrency: "JOD",
                  usdPrice: 14.1
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
                usdPrice: 14.1
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
              } else {
                // Add with default price if parsing failed
                transformedData.push({
                  region: region,
                  restaurant,
                  itemType: "dinner",
                  priceOriginalValue: 15,
                  priceOriginalCurrency: "JOD",
                  usdPrice: 21.15
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
                usdPrice: 21.15
              });
            }
          });
          
          console.log("Transformed data:", transformedData.slice(0, 5));
          console.log("Total transformed restaurants:", transformedData.length);
          
          return transformedData;
        }
        
        // If it's not Restaurants_2025.json format, return the data as is
        return data;
      }).catch(err => {
        console.error("Error loading restaurant data:", err);
        return [];
      })
    ]).then(([entranceFees, hotelData, transportData, guideData, seasonalityData, restaurantsData]) => {
      // Filter out Guides from the entrance fees
      const filteredFees = entranceFees.slice(1).filter(fee => {
        const feeName = fee["Travco Jordan"] || "";
        return !feeName.toLowerCase().includes("guide");
      });
      
      // Extract Jeep services into a separate array
      const jeepServicesArray = entranceFees.slice(1).filter(fee => {
        const feeName = fee["Travco Jordan"] || "";
        return feeName.toLowerCase().includes("jeep");
      });
      
      console.log("Jeep services found:", jeepServicesArray);
      
      // Set the Jeep services state
      setJeepServices(jeepServicesArray);
      
      // Sort the filtered fees alphabetically
      const sortedFees = filteredFees.sort((a, b) =>
        a["Travco Jordan"].localeCompare(b["Travco Jordan"]));
      setFees(sortedFees);
      
      // The hotel data already has the correct structure, just ensure all fields are present
      const transformedHotelData = hotelData.map(item => {
        // Create a new object with the expected field names
        return {
          City: item.City,
          Stars: item.Stars,
          Hotel: item.Hotel,
          Season: item.Season || "Standard", // Default to "Standard" if no season is specified
          Rate_DBL: item.Rate_DBL || 0,      // Ensure Rate_DBL exists, default to 0
          Rate_SGL: item.Rate_SGL || 0,      // Ensure Rate_SGL exists, default to 0
          Rate_HB: item.Rate_HB || 0         // Ensure Rate_HB exists, default to 0
        };
      });
      
      // Group the transformed data by City, Stars, Hotel, and Season
      const groupedHotels = {};
      transformedHotelData.forEach(item => {
        const key = `${item.City}-${item.Stars}-${item.Hotel}-${item.Season}`;
        if (!groupedHotels[key]) {
          groupedHotels[key] = {
            City: item.City,
            Stars: item.Stars,
            Hotel: item.Hotel,
            Season: item.Season,
            Rate_DBL: 0,
            Rate_SGL: 0,
            Rate_HB: 0
          };
        }
        
        // Update the rates - ensure we use numeric values
        groupedHotels[key].Rate_DBL = Number(item.Rate_DBL) || 0;
        groupedHotels[key].Rate_SGL = Number(item.Rate_SGL) || 0;
        groupedHotels[key].Rate_HB = Number(item.Rate_HB) || 0;
      });
      
      // Convert the grouped data back to an array
      const processedHotels = Object.values(groupedHotels);
      
      // Sort the hotels by name
      const sortedHotels = [...processedHotels].sort((a, b) => a.Hotel.localeCompare(b.Hotel));
      
      console.log("Processed hotel rates:", sortedHotels);
      
      // Store the new rates but don't update the state yet
      const newHotelRates = sortedHotels;
      const newTransportRates = transportData;
      // Ensure guide rates have the expected structure
      const newGuideRates = guideData && typeof guideData === 'object' &&
                           guideData.Local && guideData.Private ? guideData :
                           {
                             Local: { Petra: 50, Jerash: 30, AccNights: 30 },
                             Private: {
                               English: 60, Arabic: 60, French: 60,
                               Italian: 70, Spanish: 70, German: 70,
                               Dutch: 90, Romanian: 90, AccNights: 30
                             }
                           };
      
      console.log("Guide rates loaded:", newGuideRates);
      const newSeasonalityData = seasonalityData.hotelSeasons || {};
      
      // Update the options with new rate information while preserving user selections
      setOptions(prevOptions => {
        return prevOptions.map(option => {
          return {
            ...option,
            accommodations: option.accommodations.map(accom => {
              // If no hotel is selected yet, just return the accommodation as is
              if (!accom.hotelName || !accom.city || !accom.stars || !accom.season) {
                return accom;
              }
              
              // Find the updated rate for this hotel
              const updatedRate = newHotelRates.find(h =>
                h.Hotel === accom.hotelName &&
                h.City === accom.city &&
                h.Stars == accom.stars &&
                h.Season === accom.season
              );
              
              // Find the updated special rate if applicable
              const updatedSpecialRate = specialRates.find(sr =>
                sr.Hotel === accom.hotelName &&
                sr.Season === accom.season &&
                sr.City === accom.city &&
                sr.Stars == accom.stars &&
                sr.isSpecial === true
              );
              
              // If no updated rate found, return the accommodation as is
              if (!updatedRate) {
                return accom;
              }
              
              // Create a new accommodation object with updated rates but preserved selections
              const newAccom = { ...accom };
              
              // Update the standard rate reference
              newAccom.standardRate = updatedRate;
              
              // Update the special rate reference if it exists
              if (updatedSpecialRate) {
                newAccom.specialRate = updatedSpecialRate;
                newAccom.hasSpecialRate = true;
              }
              
              // Update the rate values only when not manually overridden
              if (!newAccom.isManualRate) {
                if (newAccom.isSpecialRate && updatedSpecialRate && useSpecialRates) {
                  newAccom.dblRate = updatedSpecialRate.Rate_DBL;
                  newAccom.hbRate = updatedSpecialRate.Rate_HB;
                  newAccom.sglRate = updatedSpecialRate.Rate_SGL;
                } else {
                  newAccom.dblRate = updatedRate.Rate_DBL;
                  newAccom.hbRate = updatedRate.Rate_HB;
                  newAccom.sglRate = updatedRate.Rate_SGL;
                }
              }
              
              return newAccom;
            })
          };
        });
      });
      
      // Now update the state with the new rates
      setHotelRates(newHotelRates);
      setTransportRates(newTransportRates);
      setGuideRates(newGuideRates);
      setSeasonalityData(newSeasonalityData);
      // Use the loaded restaurant data directly
      setRestaurantData(restaurantsData || []);
      console.log("Updated restaurant data with", restaurantsData ? restaurantsData.length : 0, "restaurants");
      
      setIsRefreshing(false);
      console.log("✅ All rate data refreshed at", new Date().toLocaleTimeString());
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Rates refreshed successfully!',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }).catch(err => {
      console.error("Failed to load rate data:", err);
      setIsRefreshing(false);
      
      // Show detailed error notification
      setNotification({
        show: true,
        message: `Failed to refresh rates: ${err.message}. Please check your network connection and try again.`,
        type: 'error'
      });
      
      // Keep error notification visible longer for user to read
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    });
  }, [specialRates, useSpecialRates]);

  // Load data on initial mount
  useEffect(() => {
    loadRateData();
  }, [loadRateData]);

  // Automatic rate refreshing has been removed as per user request
  // Rates will only be refreshed manually when the user clicks the "Refresh Rates" button

  // Load special rates for the selected agent
  useEffect(() => {
    if (agentId) {
      // First try to load from localStorage
      const savedSpecialRates = localStorage.getItem(`specialRates_${agentId}`);
      if (savedSpecialRates) {
        try {
          const parsedRates = JSON.parse(savedSpecialRates);
          console.log(`Loaded ${parsedRates.length} special rates for agent ${agentId} from localStorage`);
          
          // Transform the special rates to match the expected format
          const transformedSpecialRates = parsedRates.map(rate => ({
            ...rate,
            isSpecial: true // Mark as special rate
          }));
          
          setSpecialRates(transformedSpecialRates);
          
          // Show notification about loaded special rates
          setNotification({
            show: true,
            message: `Loaded ${transformedSpecialRates.length} special rates for agent ${agentId}`,
            type: 'success'
          });
          
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
          }, 3000);
        } catch (error) {
          console.error("Error parsing special rates from localStorage:", error);
          setSpecialRates([]);
        }
      } else {
        // If not in localStorage, try to fetch from server
        console.log(`No special rates found in localStorage for agent ${agentId}, trying server...`);
        
        fetch(`/api/special-rates/${agentId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch special rates: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(`Loaded ${data.length} special rates for agent ${agentId} from server`);
            
            // Transform the special rates to match the expected format
            const transformedSpecialRates = data.map(rate => ({
              ...rate,
              isSpecial: true // Mark as special rate
            }));
            
            setSpecialRates(transformedSpecialRates);
            
            // Save to localStorage for future use
            localStorage.setItem(`specialRates_${agentId}`, JSON.stringify(data));
            
            // Show notification about loaded special rates
            setNotification({
              show: true,
              message: `Loaded ${transformedSpecialRates.length} special rates for agent ${agentId}`,
              type: 'success'
            });
            
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
          })
          .catch(error => {
            console.error("Error fetching special rates from server:", error);
            setSpecialRates([]);
            
            // Show error notification
            setNotification({
              show: true,
              message: `Failed to load special rates for agent ${agentId}`,
              type: 'error'
            });
            
            setTimeout(() => {
              setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
          });
      }
    } else {
      setSpecialRates([]);
    }
  }, [agentId]);

  const cities = useMemo(() => [...new Set(hotelRates.map(h => h.City))].sort(), [hotelRates]);
  const stars = useMemo(() => [...new Set(hotelRates.map(h => h.Stars))].sort(), [hotelRates]);

  // Get filtered hotels based on city and stars
  const getFilteredHotels = (city, stars) => {
    if (!city || !stars) return [];
    return hotelRates.filter(h => h.City === city && h.Stars == stars);
  };

  // Get unique hotel names from filtered hotels
  const getUniqueHotels = (city, stars) => {
    if (!city || !stars) return [];
    const filteredHotels = hotelRates.filter(h => h.City === city && h.Stars == stars);
    
    // Create a map to store unique hotels with their available seasons
    const uniqueHotelsMap = new Map();
    
    filteredHotels.forEach(hotel => {
      if (!uniqueHotelsMap.has(hotel.Hotel)) {
        uniqueHotelsMap.set(hotel.Hotel, {
          hotel: hotel.Hotel,
          seasons: [hotel.Season]
        });
      } else {
        const hotelData = uniqueHotelsMap.get(hotel.Hotel);
        if (!hotelData.seasons.includes(hotel.Season)) {
          hotelData.seasons.push(hotel.Season);
        }
      }
    });
    
    // Convert map to array
    return Array.from(uniqueHotelsMap.values());
  };

  const handleAccomChange = (optIdx, accomIdx, field, value) => {
    setOptions(prev =>
      prev.map((option, oIdx) => {
        if (oIdx !== optIdx) return option;
        
        return {
          ...option,
          accommodations: option.accommodations.map((accom, aIdx) => {
            if (aIdx !== accomIdx) return accom;

            const newAccom = { ...accom, [field]: value };
            // Mark manual override when user edits any rate fields
            if (['dblRate','hbRate','sglRate'].includes(field)) {
              newAccom.isManualRate = true;
            }

            if (field === 'city' || field === 'stars') {
              newAccom.hotelName = '';
              newAccom.dblRate = '';
              newAccom.sglRate = '';
              newAccom.hbRate = '';
              newAccom.sglSupp = '';
              
               // If city is Wadi Rum, automatically set board to H/B
               if (field === 'city' && String(value || '').trim().toLowerCase().startsWith('wadi rum')) {
                 newAccom.board = 'H/B';
               }
              // Enforce Wadi Rum star categories: only Deluxe and Regular
              if (field === 'city' && String(value || '').trim().toLowerCase().startsWith('wadi rum')) {
                if (!['Deluxe', 'Regular'].includes(String(newAccom.stars))) {
                  newAccom.stars = '';
                }
              }
              
              // Always determine and set the season when city or stars change
              const determinedSeason = determinedSeasons[value]?.[field === 'city' ? newAccom.stars : value];
              if (determinedSeason) {
                // Set the season field automatically
                newAccom.season = determinedSeason;
                
                // If both city and stars are selected, we can auto-select a hotel
                if (field === 'stars' && newAccom.city) {
                  // Find hotels that match the city, stars, and season
                  const matchingHotels = hotelRates.filter(
                    (h) => h.City === newAccom.city && h.Stars == value && h.Season === determinedSeason
                  );
                  
                  if (matchingHotels.length > 0) {
                    // Select the first matching hotel
                    const hotel = matchingHotels[0];
                    newAccom.hotelName = hotel.Hotel;
                    
                    // Check for special rate
                    const specialRate = specialRates.find(
                      (sr) =>
                        sr.City === newAccom.city &&
                        sr.Stars == value &&
                        sr.Hotel === hotel.Hotel &&
                        sr.Season === hotel.Season &&
                        sr.isSpecial === true
                    );
                    
                    // Apply the appropriate rate
                    if (specialRate && useSpecialRates) {
                      newAccom.dblRate = specialRate.Rate_DBL || 0;
                      newAccom.hbRate = specialRate.Rate_HB || 0;
                      newAccom.sglRate = specialRate.Rate_SGL || 0;
                      newAccom.isSpecialRate = true;
                      newAccom.specialRate = specialRate;
                      newAccom.standardRate = hotel;
                      newAccom.hasSpecialRate = true;
                    } else {
                      newAccom.dblRate = hotel.Rate_DBL || 0;
                      newAccom.hbRate = hotel.Rate_HB || 0;
                      newAccom.sglRate = hotel.Rate_SGL || 0;
                      newAccom.isSpecialRate = false;
                      newAccom.specialRate = specialRate || null;
                      newAccom.standardRate = hotel;
                      newAccom.hasSpecialRate = !!specialRate;
                    }
                    // Rates were auto-populated; clear manual override flag
                    newAccom.isManualRate = false;
                    
                    // Show notification about automatically applied season
                    setNotification({
                      show: true,
                      message: `Automatically applied ${hotel.Season} season for ${hotel.Hotel} based on dates`,
                      type: 'success'
                    });
                    
                    // Hide notification after 3 seconds
                    setTimeout(() => {
                      setNotification(prev => ({ ...prev, show: false }));
                    }, 3000);
                  }
                }
              }
            } else if (field === 'hotelName') {
              const hotelName = value;
              
              // Determine the appropriate season based on dates
              const determinedSeason = determinedSeasons[newAccom.city]?.[newAccom.stars];
              
              if (!determinedSeason) {
                console.warn(`No determined season for ${newAccom.city} with ${newAccom.stars} stars`);
                return newAccom;
              }
              
              // Set the season field
              newAccom.season = determinedSeason;
              
              // Check if there's a special rate for this hotel and season
              const specialRate = specialRates.find(sr =>
                sr.Hotel === hotelName &&
                sr.Season === determinedSeason &&
                sr.City === newAccom.city &&
                sr.Stars == newAccom.stars &&
                sr.isSpecial === true  // Make sure we're checking the isSpecial flag
              );
              
              // Log for debugging
              if (specialRate) {
                console.log(`Found special rate for ${hotelName} (${determinedSeason}) in ${newAccom.city}`);
              }
              
              // Find the standard rate
              const standardRate = hotelRates.find(h =>
                h.Hotel === hotelName &&
                h.Season === determinedSeason &&
                h.City === newAccom.city &&
                h.Stars == newAccom.stars
              );
              
              if (!standardRate) {
                console.warn(`No standard rate found for ${hotelName} (${determinedSeason}) in ${newAccom.city}`);
                console.log(`Looking for any rate for ${hotelName} in ${newAccom.city} with ${newAccom.stars} stars`);
                
                // Try to find any rate for this hotel to use as fallback
                const anyRate = hotelRates.find(h =>
                  h.Hotel === hotelName &&
                  h.City === newAccom.city &&
                  h.Stars == newAccom.stars
                );
                
                if (anyRate) {
                  console.log(`Using fallback rate with season ${anyRate.Season} for ${hotelName}`);
                  newAccom.season = anyRate.Season;
                  
                  // Store both rates for reference
                  newAccom.specialRate = null;
                  newAccom.standardRate = anyRate;
                  newAccom.hotelName = hotelName; // Store just the hotel name
                  
                  // Use standard rate
                  newAccom.dblRate = anyRate.Rate_DBL;
                  newAccom.hbRate = anyRate.Rate_HB;
                  newAccom.sglRate = anyRate.Rate_SGL;
                  newAccom.sglSupp = '';
                  newAccom.isSpecialRate = false;
                  newAccom.hasSpecialRate = false;
                  newAccom.isManualRate = false;
                  
                  // Show notification about fallback season
                  setNotification({
                    show: true,
                    message: `Using ${anyRate.Season} season for ${hotelName} as fallback`,
                    type: 'warning'
                  });
                  
                  // Hide notification after 3 seconds
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, show: false }));
                  }, 3000);
                  
                  return newAccom;
                } else {
                  console.error(`No rates found at all for ${hotelName} in ${newAccom.city} with ${newAccom.stars} stars`);
                }
              } else {
                console.log(`Found standard rate for ${hotelName} (${determinedSeason}) in ${newAccom.city}`);
              }
              
              // Store both rates for reference
              newAccom.specialRate = specialRate || null;
              newAccom.standardRate = standardRate || null;
              newAccom.hotelName = hotelName; // Store just the hotel name
              
              // If special rate exists and we're using special rates, use it
              if (specialRate && useSpecialRates) {
                console.log(`Applying special rate for ${hotelName}:`, specialRate);
                newAccom.dblRate = specialRate.Rate_DBL; // This is the B/B Rate
                newAccom.hbRate = specialRate.Rate_HB;   // This is the H/B Supplement
                newAccom.sglRate = specialRate.Rate_SGL;
                newAccom.sglSupp = ''; // This is not used anymore
                newAccom.isSpecialRate = true;
              } else if (standardRate) {
                // Use standard rate
                console.log(`Using standard rate for ${hotelName} (${determinedSeason})`);
                newAccom.dblRate = standardRate.Rate_DBL; // This is the B/B Rate
                newAccom.hbRate = standardRate.Rate_HB;   // This is the H/B Supplement
                newAccom.sglRate = standardRate.Rate_SGL;
                newAccom.sglSupp = ''; // This is not used anymore
                newAccom.isSpecialRate = false;
              }
              // Rates were auto-populated; clear manual override flag
              newAccom.isManualRate = false;
              
              // Flag to indicate if this hotel has a special rate available
              newAccom.hasSpecialRate = !!specialRate;
              
              // Show notification about automatically applied season
              setNotification({
                show: true,
                message: `Automatically applied ${determinedSeason} season for ${hotelName} based on dates`,
                type: 'success'
              });
              
              // Hide notification after 3 seconds
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
              }, 3000);
            }
            return newAccom;
          })
        };
      })
    );
  };
  
  const addAccommodation = (optIdx) => {
    setOptions(prev => {
        const newOptions = [...prev];
        newOptions[optIdx].accommodations.push({...initialAccommodation});
        return newOptions;
    });
  };

  const removeAccommodation = (optIdx, accomIdx) => {
    setOptions(prev => {
        const newOptions = [...prev];
        newOptions[optIdx].accommodations.splice(accomIdx, 1);
        return newOptions;
    });
  };

  const getRepRate = useCallback((name) => {
    const fee = fees.find(e => e["Travco Jordan"] === name);
    return fee ? Number(fee["__1"] || 0) : 0;
  }, [fees]);

  const calculateTransportTotal = useCallback((pax) => {
    const veh = getVehicleType(pax);
    let total = rows.reduce((acc, r) => {
      const svc = r.transportType?.trim();
      let dayCost = svc && transportRates[svc]?.[veh] ? transportRates[svc][veh] : 0;
      
      // Add driver accommodation cost if checked for this day (21.16 USD)
      if (r.driverAcc) {
        dayCost += 21.16;
      }
      
      return acc + dayCost;
    }, 0);
    
    // Apply transportation discount if provided
    if (transportationDiscount > 0) {
      return total * (1 - (transportationDiscount / 100));
    }
    return total;
  }, [rows, transportRates, transportationDiscount]);

  const calculateEntranceCost = useCallback(() => {
    return rows.flatMap(r => r.entrances).reduce((a, p) => a + getRepRate(p), 0);
  }, [rows, getRepRate]);

  const calculateJeepCost = useCallback(() => {
    return rows.reduce((a, r) => a + (r.jeep && r.jeepService ? getRepRate(r.jeepService) : 0), 0);
  }, [rows, getRepRate]);

  // Get restaurants by region and meal type, filtered by region and pax (GS-aligned)
  const getRestaurantsByRegionAndMeal = (regions, mealType) => {
    if (!Array.isArray(restaurantData) || restaurantData.length === 0) return [];
    const targetType = mealType?.toLowerCase().includes("dinner") ? "dinner" : "lunch";
    const paxValue = parseInt(currentPaxRange, 10);

    return restaurantData.filter(r =>
      r.itemType === targetType &&
      (regions?.length ? regions.includes(r.region) : true) &&
      (!isNaN(paxValue) ? paxValue >= (r.minPax || 1) && paxValue <= (r.maxPax || 999) : true)
    );
  };

  const calculateMealCost = useCallback(() => {
    return rows.reduce((a, r) => {
      if (!r.mealIncluded) return a;
      
      // If restaurant is selected, use its price
      if (r.mealType === "Lunch" && r.lunchRestaurant) {
        // Use the exact restaurant price without any additional calculations
        return a + (r.lunchPriceUSD || 0);
      } else if (r.mealType === "Dinner" && r.dinnerRestaurant) {
        // Use the exact restaurant price without any additional calculations
        return a + (r.dinnerPriceUSD || 0);
      } else if (r.mealType === "Lunch & Dinner") {
        let lunchPrice = 0;
        let dinnerPrice = 0;
        
        if (r.lunchRestaurant) {
          lunchPrice = r.lunchPriceUSD || 0;
        }
        
        if (r.dinnerRestaurant) {
          dinnerPrice = r.dinnerPriceUSD || 0;
        }
        
        return a + lunchPrice + dinnerPrice;
      } else {
        // No default prices if no restaurant selected
        return a;
      }
    }, 0);
  }, [rows]);

  // GS-aligned: water cost per person for the whole program = $1.50 × number of days
  const calculateWaterCost = useCallback((pax) => {
    const days = Array.isArray(rows) ? rows.length : 0;
    return 1.5 * days;
  }, [rows]);

  // GS-aligned: extras defined per day in USD; group total = sum(dayExtras) × pax, later normalized per person
  const calculateExtrasCost = useCallback((pax) => {
    const paxInt = parseInt(pax, 10) || 0;
    if (!Array.isArray(rows) || rows.length === 0 || paxInt <= 0) return 0;
    let total = 0;
    rows.forEach(r => {
      if (Array.isArray(r.extras) && r.extras.length > 0) {
        const dayExtrasSum = r.extras.reduce((sum, ex) => sum + (extrasCosts[ex] || 0), 0);
        total += dayExtrasSum * paxInt;
      }
    });
    return total;
  }, [rows]);

// Collapse consecutive "Free/Leisure day" rows for PDF/parent data without affecting UI rows
const isFreeLeisureText = useCallback((raw) => {
  if (!raw) return false;
  const s = String(raw).toLowerCase().trim();
  if (!s) return false;
  const normalized = s.replace(/\s+/g, ' ');
  return (
    /^free(?: day)?$/.test(normalized) ||
    /^leisure(?: day)?$/.test(normalized) ||
    /(^|[\s\-:])day at leisure($|[\s\-:])/.test(normalized) ||
    /(^|[\s\-:])at leisure($|[\s\-:])/.test(normalized) ||
    /^free day at leisure$/.test(normalized) ||
    /^leisure day at leisure$/.test(normalized)
  );
}, []);

const isRowEffectFree = (r) => {
  return !r?.transportType &&
         (!r?.entrances || r.entrances.length === 0) &&
         !r?.mealIncluded &&
         (!r?.extras || r.extras.length === 0) &&
         !r?.jeep &&
         !r?.guideRequired;
};

const collapseFreeLeisureRows = useCallback((rowsArg) => {
  if (!Array.isArray(rowsArg) || rowsArg.length === 0) return [];
  const out = [];
  let i = 0;
  while (i < rowsArg.length) {
    const r = rowsArg[i];
    const isFree = isFreeLeisureText(r?.itinerary) && isRowEffectFree(r);
    if (!isFree) {
      const newRow = { ...r, day: `Day ${i + 1}` };
      out.push(newRow);
      i++;
      continue;
    }
    // Group consecutive free/leisure rows
    const start = i;
    let end = i;
    while (end + 1 < rowsArg.length) {
      const next = rowsArg[end + 1];
      if (isFreeLeisureText(next?.itinerary) && isRowEffectFree(next)) {
        end++;
      } else break;
    }
    const title = (r?.itinerary && String(r.itinerary).trim()) ? r.itinerary : "Free Day at Leisure";
    const dayLabel = start === end ? `Day ${start + 1}` : `Day ${start + 1} - ${end + 1}`;
    const grouped = {
      ...r,
      day: dayLabel,
      itinerary: title,
      multiDaySpan: start !== end ? { startDay: start + 1, endDay: end + 1, length: end - start + 1, type: 'free_leisure' } : undefined
    };
    out.push(grouped);
    i = end + 1;
  }
  return out;
}, [isFreeLeisureText]);
  // Helper function to check if a row has Petra or Jerash in the itinerary
  const hasSpecialSite = useCallback((row) => {
    const itinerary = (row.itinerary || "").toLowerCase();
    return {
      hasPetra: itinerary.includes("petra"),
      hasJerash: itinerary.includes("jerash"),
      hasEither: itinerary.includes("petra") || itinerary.includes("jerash")
    };
  }, []);

  // Check if any day in the itinerary contains Jerash
  const hasJerashDay = useMemo(() => {
    const itineraries = rows.map(row => (row.itinerary || "").toLowerCase());
    const result = itineraries.some(itinerary => itinerary.includes("jerash"));
    console.log("Checking for Jerash in itinerary:", result, itineraries);
    return result;
  }, [rows]);

  // Calculate both local and private guide costs separately (updated rules)
  const calculateGuideCosts = useCallback((pax, guideType, guideLanguage) => {
    try {
      if (!guideRates || typeof guideRates !== 'object') {
        console.error("Invalid guide rates structure:", guideRates);
        return { localGuideUSD: 0, privateGuideUSD: 0 };
      }

      const localRates = guideRates.Local || {};
      const privateRates = guideRates.Private || {};

      const paxInt = parseInt(pax, 10) || 0;

      // Gather day indices for Petra and Jerash
      const jerashDayIdxs = [];
      const petraDayIdxs = [];
      rows.forEach((row, idx) => {
        const it = (row.itinerary || "").toLowerCase();
        if (it.includes("jerash")) jerashDayIdxs.push(idx);
        if (it.includes("petra")) petraDayIdxs.push(idx);
      });

      // Determine private-guide mandated days by rules
      const privateDays = new Set();

      // User-selected private guide days (always respected)
      rows.forEach((row, idx) => {
        if (row.guideRequired) privateDays.add(idx);
      });

      // Petra: 6+ PAX => private guide mandated on Petra days
      if (paxInt >= 6) {
        petraDayIdxs.forEach(idx => privateDays.add(idx));
      }

      // Jerash: 6–10 or 11+ PAX => private guide mandated on Jerash days
      if (paxInt >= 6) {
        jerashDayIdxs.forEach(idx => privateDays.add(idx));
      }

      // Compute private guide JOD total based on number of private guide days
      const lang = guideLanguage || "English";
      const perDayPrivateJod = privateRates[lang] || 0;
      let privateGuideJod = 0;

      privateDays.forEach(idx => {
        privateGuideJod += perDayPrivateJod;
        if (rows[idx]?.accNights) {
          privateGuideJod += privateRates.AccNights || 0;
        }
      });

      // Compute local guide JOD total ONLY for Jerash and Petra as per rules
      let localGuideJod = 0;

      // Petra local-guide rules
      if (paxInt <= 5) {
        // If no private on a Petra day => 50 JOD per group, per Petra day
        petraDayIdxs.forEach(idx => {
          if (!privateDays.has(idx)) {
            localGuideJod += 50;
          }
        });
      }
      // 6+ => private present; no Petra local guide needed

      // Jerash local-guide rules
      if (paxInt <= 5) {
        // If no private on a Jerash day => 30 JOD per group, per Jerash day
        jerashDayIdxs.forEach(idx => {
          if (!privateDays.has(idx)) {
            localGuideJod += 30;
          }
        });
      } else if (paxInt >= 6 && paxInt <= 10) {
        // Private guide present; no local Jerash guide needed
      } else if (paxInt >= 11) {
        // Private guide present; local guides required IN ADDITION by size
        // Number of local guides = +1 per extra 10 pax starting at 11
        // 11–20 => 1, 21–30 => 2, 31–40 => 3, ...
        const numLocalGuides = Math.ceil((paxInt - 10) / 10);
        const perJerashDayJod = numLocalGuides * 10; // JOD per group
        localGuideJod += perJerashDayJod * jerashDayIdxs.length;
      }

      const localGuideUSD = localGuideJod * JOD_TO_USD;
      const privateGuideUSD = privateGuideJod * JOD_TO_USD;

      return { localGuideUSD, privateGuideUSD };
    } catch (error) {
      console.error("Error calculating guide costs (updated rules):", error);
      return { localGuideUSD: 0, privateGuideUSD: 0 };
    }
  }, [rows, guideRates, JOD_TO_USD]);

  const calculateOptionCost = useCallback((opt, pax) => {
    if (!pax || pax <= 0) return 0;
    return opt.accommodations.reduce((totalCostForOption, accom) => {
      const nights = Number(accom.nights) || 1;
      const dblRate = Number(accom.dblRate) || 0;
      const sglRate = Number(accom.sglRate) || 0;
      const hbRate = Number(accom.hbRate) || 0;
      let costPerPerson = 0;
      switch (accom.board) {
        case "B/B": costPerPerson = dblRate; break;
        case "H/B": costPerPerson = dblRate + hbRate; break;
        case "SGL Supplement": costPerPerson = dblRate + sglRate; break;
        case "SGL + HB": costPerPerson = dblRate + sglRate + hbRate; break;
        default: costPerPerson = dblRate;
      }
      const totalCostForThisStay = costPerPerson * pax * nights;
      return totalCostForOption + totalCostForThisStay;
    }, 0);
  }, []);

  // Function to check if any day has the Guide AQB - AMMAN Transport extra
  const hasGuideAqbAmmanTransport = useCallback(() => {
    return rows.some(row =>
      row.extras && row.extras.includes("Guide AQB - AMMAN Transport")
    );
  }, [rows]);

  useEffect(() => {
    const results = {};
    paxRanges.forEach(({ value: pax, label }) => {
      const guideType = pax >= 7 ? "Private" : "Local";
      const guideLanguage = guideData[pax] || "English";
      const transportTotal = calculateTransportTotal(pax);
      
      // Check if any row has Petra or Jerash in the itinerary
      const hasSpecialSites = rows.some(row => {
        const { hasEither } = hasSpecialSite(row);
        return hasEither;
      });
      
      // Calculate both local and private guide costs
      const { localGuideUSD, privateGuideUSD } = calculateGuideCosts(pax, guideType, guideLanguage);
      
      // Add Guide AQB - AMMAN Transport cost if it exists in any day
      let additionalGuideTransportCost = 0;
      if (hasGuideAqbAmmanTransport()) {
        additionalGuideTransportCost = extrasCosts["Guide AQB - AMMAN Transport"] || 0;
      }
      
      const jeepGrossJOD = calculateJeepCost();
      const entranceGrossJOD = calculateEntranceCost();
      const jeepCount = getJeepCount(pax);
      const paxDivisor = pax || 1;
      const transportUSD = pax > 0 ? transportTotal / pax : 0;
      
      // Add information about the discount and driver accommodation
      let transportDiscountInfo = '';
      if (transportationDiscount > 0) {
        transportDiscountInfo += `(${transportationDiscount}% discount applied)`;
      }
      
      // Check if any day has driver accommodation
      const hasDriverAcc = rows.some(row => row.driverAcc);
      if (hasDriverAcc) {
        transportDiscountInfo += transportDiscountInfo ? ' + Driver Acc.' : '(Driver Acc. included)';
      }
      
      // Add water included info if checked
      if (waterIncluded) {
        const waterInfo = ' + Water Inc.';
        transportDiscountInfo += transportDiscountInfo ? waterInfo : '(Water Inc.)';
      }
      
      // Convert entrance fees from JOD to USD
      const entranceUSD = entranceGrossJOD * JOD_TO_USD;
      const jeepUSD = pax > 0 ? ((jeepGrossJOD * jeepCount * JOD_TO_USD) / pax) : 0;
      
      // Calculate per person costs
      const localGuidePerPersonUSD = pax > 0 ? (localGuideUSD / pax) : 0;
      const privateGuidePerPersonUSD = pax > 0 ? (privateGuideUSD / pax) : 0;
      // Meal costs are already in USD, no conversion needed
      const mealUSD = calculateMealCost();
      // Extras (per person, USD)
      const extrasTotalUSD = calculateExtrasCost(pax);
      const extrasPerPersonUSD = pax > 0 ? (extrasTotalUSD / pax) : 0;
      // Water per person per day
      const waterCostUSD = waterIncluded ? calculateWaterCost(pax) : 0;
      
      const meetAssistUSD = (pax === 1) ? 10 : 5;
      const tipsPortUSD = (pax === 1) ? 20 : (pax <= 3) ? 10 : 5;
      const bankCommUSD = (pax === 1) ? 20 : (pax <= 3 ? 10 : 5);
      const baseCostPerPersonUSD = transportUSD + entranceUSD + jeepUSD + localGuidePerPersonUSD + privateGuidePerPersonUSD + mealUSD + extrasPerPersonUSD + waterCostUSD + meetAssistUSD + tipsPortUSD + bankCommUSD;
      results[pax] = {
        label,
        baseCostPerPersonUSD,
        transport: transportUSD,
        transportDiscountApplied: transportationDiscount > 0,
        transportDiscountPercentage: transportationDiscount,
        transportDiscountInfo,
        entrances: entranceUSD,
        jeep: jeepUSD,
        localGuide: localGuidePerPersonUSD,
        privateGuide: privateGuidePerPersonUSD,
        meals: mealUSD,
        extras: extrasPerPersonUSD,
        water: waterCostUSD,
        waterIncluded: waterIncluded,
        meetAssist: meetAssistUSD,
        tips: tipsPortUSD,
        commission: bankCommUSD,
        optionTotals: options.map(opt => {
          const accomCostTotalForGroup = calculateOptionCost(opt, pax);
          const accomCostPerPerson = pax > 0 ? accomCostTotalForGroup / pax : 0;
          const totalOptionRateWithoutProfit = baseCostPerPersonUSD + accomCostPerPerson;
          const profit = totalOptionRateWithoutProfit * profitMargin;
          const finalPrice = totalOptionRateWithoutProfit + profit;
          return {
            price: finalPrice,
            accommodations: opt.accommodations,
          };
        })
      };
    });
    setCalculationResults(results);
  }, [rows, options, profitMargin, paxRanges, guideData, fees, hotelRates, transportRates, guideRates, calculateOptionCost, calculateGuideCosts, calculateTransportTotal, calculateEntranceCost, calculateJeepCost, calculateMealCost, calculateExtrasCost, calculateWaterCost, waterIncluded]);

  useEffect(() => {
    if (!arrivalDate || !departureDate) return;
    const start = new Date(arrivalDate), end = new Date(departureDate);
    const list = [];
    let cur = new Date(start);
    while (cur <= end) {
      list.push({
        date: cur.toISOString().split("T")[0],
        day: cur.toLocaleDateString("en-US", { weekday: "long" }),
        itinerary: "",
        transportType: "",
        entrances: [],
        guideRequired: false,
        guideLanguage: "English",
        guideType: "Private",
        accNights: false,
        driverAcc: false,
        jeep: false,
        jeepService: "",
        mealIncluded: false,
        mealType: "Lunch",
        lunchRestaurant: "",
        dinnerRestaurant: "",
        lunchPriceOriginal: 0,
        lunchPriceCurrency: "JOD",
        lunchPriceUSD: 0,
        dinnerPriceOriginal: 0,
        dinnerPriceCurrency: "JOD",
        dinnerPriceUSD: 0,
        extras: [],
        extrasInput: "",
        multiDayEnabled: false,
        multiDayDays: []
      });
      cur.setDate(cur.getDate() + 1);
    }
    
    // Check if we have initial data to populate the rows
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Initializing with existing data:", initialData);
      
      // Load Jerash guide options for all pax ranges
      const newJerashOptions = {...jerashGuideOptions};
      let hasJerashOptions = false;
      
      Object.entries(initialData).forEach(([paxKey, paxData]) => {
        if (paxData.costs && paxData.costs.jerashGuideOptions) {
          newJerashOptions[String(paxKey)] = paxData.costs.jerashGuideOptions;
          hasJerashOptions = true;
        }
      });
      
      if (hasJerashOptions) {
        setJerashGuideOptions(newJerashOptions);
      }
      
      // Get the first pax range to extract itinerary data
      const firstPaxKey = Object.keys(initialData)[0];
      const firstPaxData = initialData[firstPaxKey];
      
      console.log("First pax data structure:", firstPaxData);
      
      // Check for itinerary data in different possible locations
      let itineraryData = null;
      
      if (firstPaxData && firstPaxData.itinerary && Array.isArray(firstPaxData.itinerary)) {
        // Standard format
        itineraryData = firstPaxData.itinerary;
        console.log("Found itinerary data in standard format:", itineraryData);
      } else if (firstPaxData && firstPaxData.quotations && firstPaxData.quotations[0] &&
                 firstPaxData.quotations[0].itinerary && Array.isArray(firstPaxData.quotations[0].itinerary)) {
        // Alternative format from edit mode
        itineraryData = firstPaxData.quotations[0].itinerary;
        console.log("Found itinerary data in quotations array:", itineraryData);
      } else if (firstPaxData && Array.isArray(firstPaxData)) {
        // Another possible format where firstPaxData itself is an array
        itineraryData = firstPaxData;
        console.log("First pax data is itself an array, using as itinerary:", itineraryData);
      }
      
      if (itineraryData) {
        // Merge the existing itinerary data with our generated list
        itineraryData.forEach((itineraryItem, index) => {
          if (index < list.length) {
            // Preserve the date and day from our generated list
            const date = list[index].date;
            const day = list[index].day;
            
            // Replace the rest with the saved itinerary data
            list[index] = {
              ...itineraryItem,
              date,
              day
            };
          }
        });
      } else {
        console.log("No itinerary data found in initialData");
      }
    }
    
    setRows(list);
    
    // Determine seasons for all cities and star ratings
    const determineAllSeasons = async () => {
      try {
        // If dates are not provided, use hardcoded seasons for testing
        if (!arrivalDate || !departureDate) {
          console.warn("No dates provided, using default seasons");
          const defaultSeasons = {
            "Amman": { "Five": "Standard", "Four": "Standard", "Three": "Standard" },
            "Petra": { "Five": "Low", "Four": "Low", "Three": "Low" },
            "Aqaba": { "Five": "Low", "Four": "Low" },
            "Dead Sea": { "Five": "Low", "Four": "Low" },
            "Wadi Rum": { "Regular": "Low", "Deluxe": "Low" },
            "Madaba": { "Five": "Standard", "Four": "Standard", "Three": "Standard" }
          };
          setDeterminedSeasons(defaultSeasons);
          
          setNotification({
            show: true,
            message: 'Using default seasons. Please set arrival and departure dates for accurate seasonality.',
            type: 'warning'
          });
          
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
          }, 5000);
          
          return;
        }
        
        // Parse the arrival and departure dates
        const arrivalDateObj = new Date(arrivalDate);
        const departureDateObj = new Date(departureDate);
        
        // Create seasons object for all cities and star ratings
        const seasons = {};
        const uniqueCities = [...new Set(hotelRates.map(h => h.City))];
        const uniqueStars = [...new Set(hotelRates.map(h => h.Stars))];
        
        console.log("Determining seasons for cities:", uniqueCities);
        console.log("Determining seasons for star ratings:", uniqueStars);
        
        // First check if we have hotel-specific seasonality data in localStorage
        const savedSeasonalityData = localStorage.getItem('seasonalityData');
        let hotelSeasons = {};
        
        if (savedSeasonalityData) {
          try {
            const parsedData = JSON.parse(savedSeasonalityData);
            hotelSeasons = parsedData.hotelSeasons || {};
            console.log("Using hotel seasonality data from localStorage:", hotelSeasons);
          } catch (err) {
            console.error("Error parsing localStorage seasonality data:", err);
          }
        }
        
        // For each city and star rating, determine the season
        for (const city of uniqueCities) {
          seasons[city] = {};
          for (const stars of uniqueStars) {
            console.log(`Determining season for ${city} with ${stars} stars...`);
            
            // Find hotels that match the city and stars
            const matchingHotels = hotelRates.filter(h => h.City === city && h.Stars == stars);
            
            // Try to find a hotel with seasonality data that matches the dates
            let foundSeason = null;
            
            for (const hotel of matchingHotels) {
              const hotelName = hotel.Hotel;
              const hotelSeasonData = hotelSeasons[hotelName];
              
              if (hotelSeasonData) {
                // Check each season for this hotel
                for (const [season, dateRanges] of Object.entries(hotelSeasonData)) {
                  if (dateRanges && Array.isArray(dateRanges)) {
                    // Check each date range
                    for (const dateRange of dateRanges) {
                      if (dateRange.startDate && dateRange.endDate) {
                        const startDate = new Date(dateRange.startDate);
                        const endDate = new Date(dateRange.endDate);
                        
                        // Check if stay dates overlap with the season date range
                        if ((arrivalDateObj >= startDate && arrivalDateObj <= endDate) ||
                            (departureDateObj >= startDate && departureDateObj <= endDate) ||
                            (arrivalDateObj <= startDate && departureDateObj >= endDate)) {
                          console.log(`Found season ${season} for ${hotelName} based on date range ${dateRange.startDate} to ${dateRange.endDate}`);
                          foundSeason = season;
                          break;
                        }
                      }
                    }
                  }
                  if (foundSeason) break;
                }
              }
              if (foundSeason) break;
            }
            
            // If no season found with date ranges, use default season based on month
            if (!foundSeason) {
              const month = arrivalDateObj.getMonth() + 1; // JavaScript months are 0-indexed
              
              // Define default season based on month
              if ([5, 6, 9, 10].includes(month)) {
                foundSeason = "Low";
              } else if ([3, 4, 11].includes(month) || (month === 12 && arrivalDateObj.getDate() <= 15)) {
                // Special case for Aqaba and Dead Sea
                if (city === "Aqaba" || city === "Dead Sea") {
                  foundSeason = "Shoulder";
                } else {
                  foundSeason = "Mid";
                }
              } else if ([1, 2, 7, 8].includes(month) || (month === 12 && arrivalDateObj.getDate() > 15)) {
                foundSeason = "High";
              } else {
                foundSeason = "Regular";
              }
              
              console.log(`Using default season ${foundSeason} for ${city} with ${stars} stars based on month ${month}`);
            }
            
            seasons[city][stars] = foundSeason;
          }
        }
        
        console.log("All determined seasons:", seasons);
        setDeterminedSeasons(seasons);
        
        // Show notification about determined seasons
        setNotification({
          show: true,
          message: 'Seasons determined based on dates. Hotels will be auto-selected.',
          type: 'success'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
      } catch (error) {
        console.error("Error determining seasons:", error);
        setNotification({
          show: true,
          message: 'Error determining seasons. Using default seasons.',
          type: 'error'
        });
        
        // Use default seasons as fallback
        const defaultSeasons = {
          "Amman": { "Five": "Standard", "Four": "Standard", "Three": "Standard" },
          "Petra": { "Five": "Low", "Four": "Low", "Three": "Low" },
          "Aqaba": { "Five": "Low", "Four": "Low" },
          "Dead Sea": { "Five": "Low", "Four": "Low" },
          "Wadi Rum": { "Regular": "Low", "Deluxe": "Low" },
          "Madaba": { "Five": "Standard", "Four": "Standard", "Three": "Standard" }
        };
        setDeterminedSeasons(defaultSeasons);
        
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
      }
    };
    
    // Always determine seasons, even if we don't have all the data
    determineAllSeasons();
  }, [arrivalDate, departureDate, hotelRates]);

  useEffect(() => {
    if (paxRanges.length > 0) {
      // Only set the current pax range if it's not already in the available ranges
      if (!paxRanges.some(range => range.value === currentPaxRange)) {
        setCurrentPaxRange(paxRanges[0].value);
      }
    }
  }, [paxRanges, currentPaxRange]);

useEffect(() => {
    try {
        if (Object.keys(calculationResults).length > 0 && rows.length > 0) {
            console.log("Preparing formatted data for onDataChange...");
            
            // Check for Petra or Jerash in the itinerary
            const specialSites = rows.reduce((sites, row) => {
                const { hasPetra, hasJerash } = hasSpecialSite(row);
                if (hasPetra) sites.petra = true;
                if (hasJerash) sites.jerash = true;
                return sites;
            }, { petra: false, jerash: false });
            
            console.log("Special sites detected:", specialSites);
            
            const formattedData = Object.entries(calculationResults).map(([pax, result]) => {
                // Determine if we need a local guide for this pax range
                const paxNum = parseInt(pax, 10);
                const paxKey = String(pax);
                
                // Check if any guide is manually selected
                const anyGuideSelected = rows.some(row => row.guideRequired);
                
                // Only apply automatic local guide if no guide is manually selected
                const needsLocalGuide = !anyGuideSelected && paxNum < 7 && (specialSites.petra || specialSites.jerash);
                
                // Safely get the Jerash guide options for this pax range
                let paxJerashOptions = { isFIT: false, isGroup: false };
                if (jerashGuideOptions && typeof jerashGuideOptions === 'object' && jerashGuideOptions[paxKey]) {
                    paxJerashOptions = jerashGuideOptions[paxKey];
                }
                
                // Ensure all required properties exist in the result object
                const safeResult = {
                    label: result.label || `${paxNum} pax`,
                    entrances: result.entrances || 0,
                    transport: result.transport || 0,
                    transportDiscountApplied: result.transportDiscountApplied || false,
                    transportDiscountPercentage: result.transportDiscountPercentage || 0,
                    commission: result.commission || 0,
                    jeep: result.jeep || 0,
                    meetAssist: result.meetAssist || 0,
                    localGuide: result.localGuide || 0,
                    privateGuide: result.privateGuide || 0,
                    meals: result.meals || 0,
                    extras: result.extras || 0,
                    water: result.water || 0,
                    waterIncluded: result.waterIncluded || false,
                    baseCostPerPersonUSD: result.baseCostPerPersonUSD || 0,
                    optionTotals: result.optionTotals || []
                };
                
                return {
                    pax: paxNum,
                    paxRange: safeResult.label,
                    costs: {
                        entranceFees: safeResult.entrances,
                        transportation: safeResult.transport,
                        transportDiscountApplied: safeResult.transportDiscountApplied,
                        transportDiscountPercentage: safeResult.transportDiscountPercentage,
                        bankCommission: safeResult.commission,
                        jeeps: safeResult.jeep,
                        meetAndAssist: safeResult.meetAssist,
                        localGuide: safeResult.localGuide,
                        privateGuide: safeResult.privateGuide,
                        meals: safeResult.meals,
                        extras: safeResult.extras,
                        water: safeResult.water,
                        waterIncluded: safeResult.waterIncluded,
                        // Add flags to indicate if special sites were detected
                        hasPetra: specialSites.petra,
                        hasJerash: specialSites.jerash,
                        needsLocalGuide: needsLocalGuide,
                        anyGuideSelected: anyGuideSelected,
                        // Add Jerash guide options for this pax range
                        jerashGuideOptions: paxJerashOptions
                    },
                    costBeforeAccommodationAndProfitMargin: safeResult.baseCostPerPersonUSD,
                    options: safeResult.optionTotals.map(o => ({
                        totalCost: o.price || 0,
                        accommodations: o.accommodations || []
                    })),
                    itinerary: collapseFreeLeisureRows(rows),
                };
            });
            
            console.log("Calling onDataChange with formatted data:", formattedData);
            onDataChange(formattedData);
        }
    } catch (error) {
        console.error("Error in QuotationItinerary data formatting:", error);
        // Show notification about the error
        setNotification({
            show: true,
            message: `Error formatting quotation data: ${error.message}. Please try again.`,
            type: 'error'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    }
}, [calculationResults, rows, onDataChange, hasSpecialSite, jerashGuideOptions]);

// Add a function to handle manual updates to the calculation results
const handleManualUpdate = (paxRange, field, value) => {
  console.log(`Updating ${field} for ${paxRange} to ${value}`);
  
  setCalculationResults(prev => {
    const newResults = JSON.parse(JSON.stringify(prev)); // Deep clone to ensure all nested objects are new
    // Resolve the correct entry by matching label, fallback to key use
    const entryKey = Object.keys(newResults).find(k => newResults[k]?.label === paxRange) || String(paxRange);
    if (newResults[entryKey]) {
      // Ensure value is a number and not NaN
      const numValue = parseFloat(value) || 0;
      newResults[entryKey][field] = numValue;
      
      // Recalculate the base cost if any component was changed
      if (['transport', 'entrances', 'jeep', 'localGuide', 'privateGuide',
           'meals', 'meetAssist', 'tips', 'commission', 'extras', 'water'].includes(field)) {
        const result = newResults[entryKey];
        const newBaseCost = (result.transport || 0) +
                           (result.entrances || 0) +
                           (result.jeep || 0) +
                           (result.localGuide || 0) +
                           (result.privateGuide || 0) +
                           (result.meals || 0) +
                           (result.extras || 0) +
                           (result.water || 0) +
                           (result.meetAssist || 0) +
                           (result.tips || 0) +
                           (result.commission || 0);
        
        console.log(`Recalculated base cost: ${newBaseCost}`);
        newResults[entryKey].baseCostPerPersonUSD = newBaseCost;
        
        // Also update all option totals based on the new base cost
        if (newResults[entryKey].optionTotals) {
          const paxNum = parseInt(entryKey, 10);
          newResults[entryKey].optionTotals.forEach((option, idx) => {
            // Calculate accommodation cost per person
            const accomCost = calculateOptionCost(
              { accommodations: option.accommodations },
              paxNum
            ) / paxNum;
            
            const totalWithoutProfit = newBaseCost + accomCost;
            const profit = totalWithoutProfit * profitMargin;
            const newPrice = totalWithoutProfit + profit;
            
            console.log(`Option ${idx+1} new price: ${newPrice}`);
            option.price = newPrice;
          });
        }
      }
    }
    return newResults;
  });
};

// Add a function to handle manual updates to option totals
const handleOptionUpdate = (paxRange, optionIndex, value) => {
  console.log(`Manually updating option ${optionIndex+1} for ${paxRange} to ${value}`);
  
  setCalculationResults(prev => {
    const newResults = JSON.parse(JSON.stringify(prev)); // Deep clone
    // Resolve entry by label first
    const entryKey = Object.keys(newResults).find(k => newResults[k]?.label === paxRange) || String(paxRange);
    if (newResults[entryKey] && newResults[entryKey].optionTotals && newResults[entryKey].optionTotals[optionIndex]) {
      // Ensure value is a number and not NaN
      const numValue = parseFloat(value) || 0;
      newResults[entryKey].optionTotals[optionIndex].price = numValue;
    }
    return newResults;
  });
};

  function getVehicleType(pax) {
    if (pax <= 3) return "car";
    if (pax <= 5) return "minivan";
    if (pax <= 9) return "van10";
    if (pax <= 14) return "small";
    if (pax <= 24) return "medium";
    return "large";
  }

  function getJeepCount(pax) {
    if (pax <= 7)  return 1;
    if (pax <= 14) return 2;
    if (pax <= 19) return 4;
    if (pax <= 24) return 5;
    if (pax <= 29) return 6;
    if (pax <= 34) return 7;
    if (pax <= 39) return 8;
    if (pax <= 44) return 9;
    if (pax <= 49) return 10;
    return Math.ceil(pax/6);
  }

  function getVehicleTypeDivisor(pax) {
    return pax || 1;
  }

  function handleDayChange(i, field, val) {
    const newRows = [...rows];
    newRows[i][field] = val;
    
    if (field === 'guideLanguage') {
      setGuideData(prev => ({ ...prev, [currentPaxRange]: val }));
    }
    
    if (field === 'itinerary') {
      console.log("Itinerary changed:", val, "Checking for Jerash:", val.toLowerCase().includes("jerash"));
      // Force re-render when "Jerash" is typed or removed
      if (val.toLowerCase().includes("jerash") || newRows[i].itinerary.toLowerCase().includes("jerash")) {
        // Create a new array to ensure React detects the change
        setRows([...newRows]);
        console.log("JERASH DETECTED - FORCING RE-RENDER");
      }
      
      // Generate autocomplete suggestions
      if (val.trim()) {
        const inputText = val.trim();
        const lastWord = inputText.split(' - ').pop().trim();
        
        if (lastWord) {
          const suggestions = Object.keys(locationToRegionMap)
            .filter(location =>
              location.toLowerCase().startsWith(lastWord.toLowerCase()) &&
              location.toLowerCase() !== lastWord.toLowerCase()
            )
            .slice(0, 5); // Limit to 5 suggestions
          
          setAutocompleteSuggestions(suggestions);
          setActiveAutocompleteIndex(-1);
        } else {
          setAutocompleteSuggestions([]);
        }
      } else {
        setAutocompleteSuggestions([]);
      }
    } else {
      // Clear suggestions when interacting with other fields
      setAutocompleteSuggestions([]);
    }
    
    if (field === 'guideRequired') {
      // Force recalculation when guide required is toggled
      console.log("Guide Required changed:", val);
    }
    
    // Handle restaurant selection (GS-aligned, region + pax aware)
    if (field === 'lunchRestaurant' && val) {
      const paxValue = parseInt(currentPaxRange, 10);
      const regions = extractRegionsFromItinerary(newRows[i].itinerary || "");
      const candidates = getRestaurantsByRegionAndMeal(regions, 'lunch');
      const selectedRestaurant =
        candidates.find(r => r.restaurant === val) ||
        (restaurantData || []).find(r => r.restaurant === val && r.itemType === 'lunch');

      if (selectedRestaurant) {
        newRows[i].lunchPriceOriginal = selectedRestaurant.priceOriginalValue ?? 0;
        newRows[i].lunchPriceCurrency = selectedRestaurant.priceOriginalCurrency || 'JOD';
        newRows[i].lunchPriceUSD = Number(selectedRestaurant.usdPrice || 0);
      }
    }
    
    if (field === 'dinnerRestaurant' && val) {
      const paxValue = parseInt(currentPaxRange, 10);
      const regions = extractRegionsFromItinerary(newRows[i].itinerary || "");
      const candidates = getRestaurantsByRegionAndMeal(regions, 'dinner');
      const selectedRestaurant =
        candidates.find(r => r.restaurant === val) ||
        (restaurantData || []).find(r => r.restaurant === val && r.itemType === 'dinner');

      if (selectedRestaurant) {
        newRows[i].dinnerPriceOriginal = selectedRestaurant.priceOriginalValue ?? 0;
        newRows[i].dinnerPriceCurrency = selectedRestaurant.priceOriginalCurrency || 'JOD';
        newRows[i].dinnerPriceUSD = Number(selectedRestaurant.usdPrice || 0);
      }
    }
    
    // Reset restaurant selection if meal is unchecked
    if (field === 'mealIncluded' && !val) {
      newRows[i].lunchRestaurant = '';
      newRows[i].dinnerRestaurant = '';
      newRows[i].lunchPriceOriginal = 0;
      newRows[i].lunchPriceCurrency = 'JOD';
      newRows[i].lunchPriceUSD = 0;
      newRows[i].dinnerPriceOriginal = 0;
      newRows[i].dinnerPriceCurrency = 'JOD';
      newRows[i].dinnerPriceUSD = 0;
    }
    
    // Reset restaurant selection if meal type changes
    if (field === 'mealType') {
      if (val !== 'Lunch' && val !== 'Lunch & Dinner') {
        newRows[i].lunchRestaurant = '';
        newRows[i].lunchPriceOriginal = 0;
        newRows[i].lunchPriceCurrency = 'JOD';
        newRows[i].lunchPriceUSD = 0;
      }
      
      if (val !== 'Dinner' && val !== 'Lunch & Dinner') {
        newRows[i].dinnerRestaurant = '';
        newRows[i].dinnerPriceOriginal = 0;
        newRows[i].dinnerPriceCurrency = 'JOD';
        newRows[i].dinnerPriceUSD = 0;
      }
    }
    
    setRows(newRows);
  }

  function addRow() {
    setRows(r => [
      ...r,
      {
        date: "", day: "", itinerary: "", transportType: "",
        entrances: [], guideRequired: false, guideLanguage: "English", guideType: "Private",
        accNights: false, driverAcc: false, jeep: false, jeepService: "",
        mealIncluded: false, mealType: "Lunch",
        lunchRestaurant: "", dinnerRestaurant: "",
        lunchPriceOriginal: 0, lunchPriceCurrency: "JOD", lunchPriceUSD: 0,
        dinnerPriceOriginal: 0, dinnerPriceCurrency: "JOD", dinnerPriceUSD: 0,
        extras: [],
        extrasInput: "",
        multiDayEnabled: false,
        multiDayDays: []
      }
    ]);
  }

  function removeRow(i) {
    setRows(r => r.filter((_,idx)=>idx!==i));
  }

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Notification component
  const Notification = ({ show, message, type }) => {
    if (!show) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#004D40' : '#B71C1C',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'fadeIn 0.3s, fadeOut 0.3s 2.7s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '20px' }}>
          {type === 'success' ? '✓' : '✗'}
        </span>
        {message}
      </div>
    );
  };

  // Listen for entrance fees updates from Data Entry (localStorage + BroadcastChannel)
  const refreshEntranceFees = useCallback(() => {
    fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
      .then(res => res.json())
      .then((entranceFees) => {
        const filteredFees = (Array.isArray(entranceFees) ? entranceFees : [])
          .slice(1)
          .filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return !feeName.toLowerCase().includes("guide");
          });
        const processedFees = filteredFees
          .map(fee => ({
            ...fee,
            "__1": fee["__1"] ? String(parseFloat(fee["__1"]).toFixed(2)) : "0.00"
          }))
          .sort((a, b) => String(a["Travco Jordan"]).localeCompare(String(b["Travco Jordan"])));
        setFees(processedFees);

        // Update Jeep services list too
        const jeepServicesArray = (Array.isArray(entranceFees) ? entranceFees : [])
          .slice(1)
          .filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return feeName.toLowerCase().includes("jeep");
          });
        setJeepServices(jeepServicesArray);
      })
      .catch(err => console.error("Failed to refresh entrance fees:", err));
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'entranceFeesVersion') {
        refreshEntranceFees();
      }
    };
    window.addEventListener('storage', onStorage);

    let bc;
    try {
      bc = new BroadcastChannel('entranceFees');
      bc.onmessage = () => refreshEntranceFees();
    } catch (_) {}

    return () => {
      window.removeEventListener('storage', onStorage);
      try { bc && bc.close(); } catch (_) {}
    };
  }, [refreshEntranceFees]);

  // Live refresh of restaurant rates (Data Entry -> FIT quotations)
  // - Listens to localStorage 'restaurantRatesVersion' changes and BroadcastChannel 'restaurantRates'
  // - Refetches Restaurants_2025.json (preferred) with cache-busting, transforms, and updates restaurantData
  const refreshRestaurants = useCallback(() => {
    // Try new structured source first
    fetch(`/data/Restaurants_2025.json?v=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Restaurants_2025 not available");
        return res.json();
      })
      .then((data) => {
        const transformed = [];
        let lastRegion = "";
        data.forEach((item) => {
          const itemRegion = item["Region "];
          if (itemRegion && itemRegion.trim()) {
            lastRegion = itemRegion.trim();
          }
          const region = lastRegion || "Unknown";
          const restaurant = (item["Restaurant Name "] || "").trim();
          if (!restaurant) return;

          const processCol = (col, itemType) => {
            const raw = item[col] ? item[col].toString().trim() : "";
            if (!raw) return;
            const first = raw.split("/")[0].trim();
            const adult = first.split("-")[0].trim();
            const { value, currency } = parsePriceString(adult) || {};
            if (value && currency) {
              const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
              transformed.push({
                region,
                restaurant,
                itemType,
                priceOriginalValue: value,
                priceOriginalCurrency: currency,
                usdPrice,
              });
            }
          };

          processCol("Lunch Price P.P", "lunch");
          processCol("Dinner Price P.P", "dinner");
        });

        setRestaurantData(transformed || []);
      })
      .catch(() => {
        // Fallback to legacy USD dataset
        fetch(`/data/restaurants_usd.json?v=${Date.now()}`)
          .then((r) => r.json())
          .then((legacy) => setRestaurantData(Array.isArray(legacy) ? legacy : []))
          .catch((err) => console.error("Failed to refresh restaurant data:", err));
      });
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'restaurantRatesVersion') {
        refreshRestaurants();
      }
    };
    window.addEventListener('storage', onStorage);

    let bcRest;
    try {
      bcRest = new BroadcastChannel('restaurantRates');
      bcRest.onmessage = () => refreshRestaurants();
    } catch (_) {}

    return () => {
      window.removeEventListener('storage', onStorage);
      try { bcRest && bcRest.close(); } catch (_) {}
    };
  }, [refreshRestaurants]);

  return (
    <div style={{ color: "white", padding: 30 }}>
      <Notification {...notification} />
      <h2 style={{ fontSize: 24, marginBottom: 30 }}>
        Quotation Itinerary
        {isRefreshing && (
          <span style={{
            fontSize: 14,
            marginLeft: 15,
            backgroundColor: "#004D40",
            padding: "4px 8px",
            borderRadius: 4,
            animation: "pulse 1.5s infinite"
          }}>
            Refreshing rates...
          </span>
        )}
      </h2>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex' }}>
          {paxRanges.map(paxRange => (
            <button
              key={paxRange.value}
              onClick={() => {
                setCurrentPaxRange(paxRange.value);
                console.log(`Switched to pax range: ${paxRange.label}`);
              }}
              style={{
                padding: '10px 15px',
                borderRadius: '6px 6px 0 0',
                backgroundColor: currentPaxRange === paxRange.value ? '#1f1f1f' : '#444',
                color: '#fff',
                border: '1px solid #444',
                borderBottom: 'none',
                cursor: 'pointer',
                position: 'relative',
                zIndex: currentPaxRange === paxRange.value ? 2 : 1
              }}
            >
              {paxRange.label}
            </button>
          ))}
        </div>
        <button
          onClick={loadRateData}
          disabled={isRefreshing}
          style={{
            padding: '8px 15px',
            borderRadius: '6px',
            backgroundColor: isRefreshing ? '#555' : '#004D40',
            color: '#fff',
            border: 'none',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2px solid #fff',
            borderTopColor: 'transparent',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }}></span>
          {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
        </button>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <button onClick={addRow}
        style={{ marginBottom: 20, padding: "10px 15px", borderRadius: 6, backgroundColor: "#444", color: "#fff", border: "none" }}>
        + Add Day
      </button>
      {rows.map((row, i) => (
        <div key={i} style={sectionStyle}>
          <div style={{
            position: "absolute",
            top: "-15px",
            left: "15px",
            backgroundColor: "#004D40",
            color: "white",
            padding: "5px 12px",
            borderRadius: "15px",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            Day {i + 1}
          </div>
          <button onClick={() => removeRow(i)}
            style={{ float: "right", background: "transparent", color: "#f66", border: "none", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "10px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ backgroundColor: "#2a2a2a", border: "1px solid #444", padding: "6px 12px", borderRadius: 16, fontSize: 13, color: "#fff" }}>
                <span style={{ color: "#90CAF9", fontWeight: 600, marginRight: 6 }}>Date:</span>
                <span>{row.date || "—"}</span>
              </div>
              <div style={{ backgroundColor: "#2a2a2a", border: "1px solid #444", padding: "6px 12px", borderRadius: 16, fontSize: 13, color: "#fff" }}>
                <span style={{ color: "#A5D6A7", fontWeight: 600, marginRight: 6 }}>Day:</span>
                <span>{row.day || `Day ${i + 1}`}</span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Itinerary</label>
              <input
                type="text"
                value={row.itinerary}
                onChange={e => handleDayChange(i, "itinerary", e.target.value)}
                style={inputStyle}
                placeholder="e.g., Amman - Jerash - Petra"
                onKeyDown={e => {
                  if (autocompleteSuggestions.length > 0) {
                    // Handle arrow keys for navigation
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveAutocompleteIndex(prev =>
                        prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveAutocompleteIndex(prev => prev > 0 ? prev - 1 : 0);
                    } else if (e.key === 'Enter' && activeAutocompleteIndex >= 0) {
                      e.preventDefault();
                      // Apply the selected suggestion
                      const selectedSuggestion = autocompleteSuggestions[activeAutocompleteIndex];
                      const parts = row.itinerary.split(' - ');
                      parts[parts.length - 1] = selectedSuggestion;
                      const newValue = parts.join(' - ');
                      handleDayChange(i, "itinerary", newValue);
                      setAutocompleteSuggestions([]);
                    } else if (e.key === 'Escape') {
                      setAutocompleteSuggestions([]);
                    }
                  }
                }}
              />
              {autocompleteSuggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  maxHeight: "150px",
                  overflowY: "auto",
                  backgroundColor: "#333",
                  border: "1px solid #555",
                  borderRadius: "0 0 4px 4px",
                  zIndex: 10,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                }}>
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: index === activeAutocompleteIndex ? "#004D40" : "transparent",
                        color: "white"
                      }}
                      onClick={() => {
                        // Apply the clicked suggestion
                        const parts = row.itinerary.split(' - ');
                        parts[parts.length - 1] = suggestion;
                        const newValue = parts.join(' - ');
                        handleDayChange(i, "itinerary", newValue);
                        setAutocompleteSuggestions([]);
                      }}
                      onMouseEnter={() => setActiveAutocompleteIndex(index)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              <small style={{ color: "#aaa", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Separate locations with " - " (e.g., "Amman - Jerash - Petra")
              </small>
            </div>

            {/* Multiple days control */}
            <div style={{ marginBottom: "15px", backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #444" }}>
              <label style={{ ...labelStyle, color: "#4CAF50", fontWeight: "bold" }}>Repeat this day</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "10px" }}>
                <input
                  type="checkbox"
                  checked={row.multiDayEnabled || false}
                  onChange={e => {
                    handleDayChange(i, "multiDayEnabled", e.target.checked);
                    if (!e.target.checked) {
                      handleDayChange(i, "multiDayDays", []);
                    }
                  }}
                  style={{ transform: "scale(1.3)", marginRight: "5px" }}
                />
                <span style={{ fontSize: "14px", fontWeight: row.multiDayEnabled ? "bold" : "normal", color: row.multiDayEnabled ? "#4CAF50" : "#aaa" }}>
                  {row.multiDayEnabled ? "Enabled - Select days below" : "Disabled"}
                </span>
              </div>
              
              {row.multiDayEnabled && (
                <>
                  <div style={{ fontSize: "13px", color: "#fff", marginBottom: "8px" }}>
                    Select all days where this exact itinerary repeats:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                    {rows.slice(i + 1).map((_, idx) => {
                      const dayNumber = i + 2 + idx; // subsequent days only
                      const isSelected = (row.multiDayDays || []).includes(dayNumber);
                      
                      return (
                        <label
                          key={dayNumber}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#004D40' : '#333',
                            color: '#fff',
                            border: '1px solid #444',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const currentDays = [...(row.multiDayDays || [])];
                              if (isSelected) {
                                // Remove day if already selected
                                const newDays = currentDays.filter(d => d !== dayNumber);
                                handleDayChange(i, "multiDayDays", newDays);
                              } else {
                                // Add day if not selected
                                const newDays = [...currentDays, dayNumber].sort((a, b) => a - b);
                                handleDayChange(i, "multiDayDays", newDays);
                                
                                // Copy the current day's data to the selected day
                                const targetIdx = dayNumber - 1;
                                if (targetIdx >= 0 && targetIdx < rows.length) {
                                  const newRows = [...rows];
                                  // Copy all fields except day number and multiDay settings
                                  const { day, multiDayEnabled, multiDayDays, ...dataToCopy } = row;
                                  newRows[targetIdx] = {
                                    ...newRows[targetIdx],
                                    ...dataToCopy,
                                    // Keep the original day number
                                    day: `Day ${targetIdx + 1}`
                                  };
                                  setRows(newRows);
                                }
                              }
                            }}
                            style={{
                              marginRight: '8px',
                              transform: 'scale(1.2)'
                            }}
                          />
                          Day {dayNumber}
                        </label>
                      );
                    })}
                  </div>
                  
                  <div style={{
                    fontSize: "12px",
                    color: "#4CAF50",
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: "4px",
                    border: "1px solid rgba(76, 175, 80, 0.3)"
                  }}>
                    <strong>Note:</strong> When you select days, their content will be updated to match Day {i + 1}.
                    In the PDF, this will appear as "Day {i + 1} - {Math.max(...(row.multiDayDays || []), i + 1)}: {row.itinerary || ""}".
                  </div>
                </>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#80CBC4', margin: '10px 0 6px' }}></div>
              <label style={labelStyle}>Transportation</label>
              <select value={row.transportType}
                onChange={e => handleDayChange(i, "transportType", e.target.value)} style={inputStyle}>
                <option value="">Select</option>
                <option>Transfer</option><option>Full Day</option><option>Half Day</option>
                <option>Stopover</option><option>Cruise</option>
              </select>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#A5D6A7', margin: '10px 0 6px' }}></div>
              <label style={labelStyle}>Extra(s)</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "10px"
                }}>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        const newExtras = [...(row.extras || [])];
                        if (!newExtras.includes(e.target.value)) {
                          newExtras.push(e.target.value);
                          handleDayChange(i, "extras", newExtras);
                        }
                        e.target.value = ""; // Reset select after selection
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="">+ Add Extra</option>
                    {extrasOptions.map((extra, j) => (
                      <option key={j} value={extra}>
                        {extra} {extrasCosts[extra] ? `($${extrasCosts[extra]})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Display selected extras with remove button and cost tag */}
                  {row.extras && row.extras.length > 0 && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      marginTop: "5px"
                    }}>
                      {row.extras.map((extra, idx) => {
                        const cost = extrasCosts[extra] || 0;

                        return (
                          <div key={idx} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "5px 10px",
                            backgroundColor: "#2a2a2a",
                            borderRadius: "4px",
                            border: "1px solid #444"
                          }}>
                            <div>
                              <span style={{ fontSize: "13px" }}>{extra}</span>
                              {cost > 0 && (
                                <span style={{ fontSize: "12px", color: "#4CAF50", marginLeft: "5px" }}>(${cost})</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const newExtras = [...row.extras];
                                newExtras.splice(idx, 1);
                                handleDayChange(i, "extras", newExtras);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#f66",
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: "0 5px"
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#A5D6A7', margin: '10px 0 6px' }}></div>
              <label style={labelStyle}>Entrance(s)</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <select
                  value={row.entranceInput}
                  onChange={e => handleDayChange(i, "entranceInput", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Entrance Fee</option>
                  {fees.map((f, j) => (
                    <option key={j} value={f["Travco Jordan"]}>{f["Travco Jordan"]}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const val = row.entranceInput.trim();
                    if (
                      val &&
                      !row.entrances.includes(val)
                    ) {
                      handleDayChange(i, "entrances", [...row.entrances, val]);
                    }
                    handleDayChange(i, "entranceInput", "");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    backgroundColor: "#555",
                    color: "#fff",
                    border: "none"
                  }}
                >
                  Add
                </button>
              </div>
              <ul style={{ fontSize: 13, paddingLeft: 16, marginTop: 8 }}>
                {row.entrances.map((ent, j) => (
                  <li key={j} style={{ marginBottom: 4 }}>
                    {ent} ({getRepRate(ent)})
                    <button
                      onClick={() =>
                        handleDayChange(
                          i,
                          "entrances",
                          row.entrances.filter((_, idx) => idx !== j)
                        )
                      }
                      style={{
                        marginLeft: 8,
                        background: "transparent",
                        color: "#f66",
                        border: "none"
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
             <div style={{ fontWeight: 'bold', color: '#B39DDB', margin: '10px 0 6px' }}></div>
             <div style={checkboxRowStyle}>
               <span style={checkboxLabelTextStyle}>Guide</span>
               <input
                 type="checkbox"
                 checked={row.guideRequired}
                 onChange={e => handleDayChange(i, "guideRequired", e.target.checked)}
                 style={checkboxInputStyle}
               />
               <span style={{
                 fontSize: "12px",
                 color: row.guideRequired ? "#4CAF50" : "#aaa",
                 fontWeight: row.guideRequired ? "bold" : "normal",
                 marginLeft: 8
               }}>
                 {row.guideRequired ? "Yes - Private Guide" : "No - Local Guide Only"}
               </span>
             </div>
            </div>
            {row.guideRequired && (
              <>
                <div><label style={labelStyle}>Guide Type</label>
                  <input type="text" value={currentPaxRange >= 7 ? "Private" : "Local"} readOnly style={inputStyle} /></div>
                <div><label style={labelStyle}>Guide Language</label>
                  <select value={guideData[currentPaxRange] || 'English'}
                    onChange={e => handleDayChange(i, "guideLanguage", e.target.value)} style={inputStyle}>
                    {["English", "Arabic", "French", "Italian", "Spanish", "German", "Dutch", "Romanian"]
                      .map(l => <option key={l}>{l}</option>)}
                  </select></div>
                
                {/* Add Jerash guide options directly in the guide section when Jerash is in the itinerary */}
                {(row.itinerary || "").toLowerCase().includes("jerash") && (
                  <div style={{
                    gridColumn: "1 / -1",
                    marginTop: "10px",
                    padding: "10px 12px",
                    backgroundColor: "#2a2a2a",
                    borderRadius: "4px",
                    border: "2px solid #ff9800"
                  }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ff9800", marginBottom: "8px" }}>
                      Jerash Local Guide — Auto‑calculated
                    </div>
                    <div style={{ fontSize: "13px", color: "#fff", marginBottom: "10px" }}>
                      Local‑guide charges at Jerash are applied automatically based on your selected PAX and whether “Guide Required?” is checked for this day. No manual selection is needed here.
                    </div>
                    <div style={{ fontSize: "12px", color: "#ddd", marginBottom: "8px" }}>
                      Rules:
                      <ul style={{ margin: "6px 0 0 18px" }}>
                        <li>1–5 pax: Private guide optional. If “Guide Required?” is not checked, +30 JOD per Jerash day (group).</li>
                        <li>6–10 pax: Private guide required. No Jerash local‑guide fee.</li>
                        <li>11+ pax: Private guide required + additional local guide(s): +10 JOD per each 10‑pax segment per Jerash day (group).</li>
                      </ul>
                    </div>
                    {(() => {
                      const paxValue = parseInt(currentPaxRange, 10);
                      if (!paxValue) return null;
                      const paxLabel = paxRanges.find(p => p.value === currentPaxRange)?.label || `${paxValue} pax`;

                      let summary = "";
                      if (paxValue <= 5) {
                        summary = row.guideRequired
                          ? "Private guide selected. No Jerash local‑guide fee will be added for this day."
                          : "+30 JOD local‑guide fee will be added per Jerash day (group).";
                      } else if (paxValue <= 10) {
                        summary = "Private guide is required. No Jerash local‑guide fee will be added.";
                      } else {
                        const extraGuides = Math.ceil((paxValue - 10) / 10);
                        const jod = extraGuides * 10;
                        summary = `Private guide is required + ${extraGuides} local guide(s): +${jod} JOD per Jerash day (group).`;
                      }

                      return (
                        <div style={{
                          fontSize: "13px",
                          color: "#fff",
                          backgroundColor: "#1f1f1f",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          border: "1px solid #444"
                        }}>
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Current PAX: {paxLabel}</div>
                          <div>{summary}</div>
                          <div style={{ fontSize: "12px", color: "#aaa", marginTop: "6px" }}>
                            To include a private guide for this day, check “Guide Required?” above. Guide language is selected in the dropdown.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
            <div style={checkboxRowStyle}>
              <span style={checkboxLabelTextStyle}>Guide Acc. Nights</span>
              <input
                type="checkbox"
                checked={row.accNights}
                onChange={e => handleDayChange(i, "accNights", e.target.checked)}
                style={checkboxInputStyle}
              />
            </div>
            <div>
              <div style={checkboxRowStyle}>
                <span style={checkboxLabelTextStyle}>Driver Acc. Nights</span>
                <input
                  type="checkbox"
                  checked={row.driverAcc}
                  onChange={e => handleDayChange(i, "driverAcc", e.target.checked)}
                  style={checkboxInputStyle}
                />
              </div>
              <small style={{ color: "#aaa", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Adds 21.16 USD to Transportation
              </small>
            </div>
            <div style={checkboxRowStyle}>
              <span style={checkboxLabelTextStyle}>Jeep</span>
              <input
                type="checkbox"
                checked={row.jeep}
                onChange={e => handleDayChange(i, "jeep", e.target.checked)}
                style={checkboxInputStyle}
              />
            </div>
            {row.jeep && (
              <div><label style={labelStyle}>Jeep Service</label>
                {console.log("Rendering Jeep dropdown, jeepServices:", jeepServices)}
                <select value={row.jeepService}
                  onChange={e => handleDayChange(i, "jeepService", e.target.value)} style={inputStyle}>
                  <option value="">Select Jeep</option>
                  {jeepServices && jeepServices.length > 0 ? (
                    jeepServices.map((x, j) =>
                      <option key={j} value={x["Travco Jordan"]}>
                        {x["Travco Jordan"]} ({getRepRate(x["Travco Jordan"])})
                      </option>
                    )
                  ) : (
                    <option value="" disabled>No Jeep services available</option>
                  )}
                </select></div>
            )}
            <div style={checkboxRowStyle}>
              <span style={checkboxLabelTextStyle}>Meal</span>
              <input
                type="checkbox"
                checked={row.mealIncluded}
                onChange={e => handleDayChange(i, "mealIncluded", e.target.checked)}
                style={checkboxInputStyle}
              />
            </div>
            {row.mealIncluded && (
              <>
                <div><label style={labelStyle}>Type of Meal</label>
                  <select value={row.mealType}
                    onChange={e => handleDayChange(i, "mealType", e.target.value)} style={inputStyle}>
                    <option>Lunch</option><option>Dinner</option><option>Lunch & Dinner</option>
                  </select></div>
                
                {/* Restaurant Selection Section */}
                {(row.mealType === "Lunch" || row.mealType === "Lunch & Dinner") && (
                  <div style={{ gridColumn: "1 / -1", marginTop: "15px" }}>
                    <div style={{
                      backgroundColor: "#2a2a2a",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      border: "1px solid #444"
                    }}>
                      <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#4CAF50" }}>Lunch Restaurant</h4>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                          <label style={labelStyle}>Select Restaurant</label>
                          <select
                            value={row.lunchRestaurant}
                            onChange={e => handleDayChange(i, "lunchRestaurant", e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">Select Restaurant</option>
                            {(() => {
                              const restaurants = getRestaurantsByRegionAndMeal(extractRegionsFromItinerary(row.itinerary), 'lunch');
                              console.log("Lunch dropdown restaurants:", restaurants.length);
                              // Filter to only show lunch restaurants
                              const lunchRestaurants = restaurants.filter(r => r.itemType === 'lunch');
                              console.log("Filtered lunch restaurants:", lunchRestaurants.length);
                              return lunchRestaurants.map((restaurant, idx) => (
                                <option key={idx} value={restaurant.restaurant}>
                                  {restaurant.restaurant} ({restaurant.region})
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                        
                        {row.lunchRestaurant && (
                          <div>
                            <label style={labelStyle}>Price</label>
                            <div style={{
                              padding: "10px",
                              backgroundColor: "#333",
                              borderRadius: "6px",
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                              <span>{row.lunchPriceOriginal} {row.lunchPriceCurrency}</span>
                              <span>{row.lunchPriceUSD} USD</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {(row.mealType === "Dinner" || row.mealType === "Lunch & Dinner") && (
                  <div style={{ gridColumn: "1 / -1", marginTop: "15px" }}>
                    <div style={{
                      backgroundColor: "#2a2a2a",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #444"
                    }}>
                      <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#FF9800" }}>Dinner Restaurant</h4>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                          <label style={labelStyle}>Select Restaurant</label>
                          <select
                            value={row.dinnerRestaurant}
                            onChange={e => handleDayChange(i, "dinnerRestaurant", e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">Select Restaurant</option>
                            {(() => {
                              const restaurants = getRestaurantsByRegionAndMeal(extractRegionsFromItinerary(row.itinerary), 'dinner');
                              console.log("Dinner dropdown restaurants:", restaurants.length);
                              // Filter to only show dinner restaurants
                              const dinnerRestaurants = restaurants.filter(r => r.itemType === 'dinner');
                              console.log("Filtered dinner restaurants:", dinnerRestaurants.length);
                              return dinnerRestaurants.map((restaurant, idx) => (
                                <option key={idx} value={restaurant.restaurant}>
                                  {restaurant.restaurant} ({restaurant.region})
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                        
                        {row.dinnerRestaurant && (
                          <div>
                            <label style={labelStyle}>Price</label>
                            <div style={{
                              padding: "10px",
                              backgroundColor: "#333",
                              borderRadius: "6px",
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                              <span>{row.dinnerPriceOriginal} {row.dinnerPriceCurrency}</span>
                              <span>{row.dinnerPriceUSD} USD</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 30, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useSpecialRates}
              onChange={() => setUseSpecialRates(!useSpecialRates)}
              style={{ marginRight: 10, transform: 'scale(1.3)' }}
            />
            <span style={{ fontSize: 16 }}>
              Use special agent rates when available
            </span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={waterIncluded}
              onChange={() => setWaterIncluded(!waterIncluded)}
              style={{ marginRight: 10, transform: 'scale(1.3)' }}
            />
            <span style={{ fontSize: 16 }}>
              Water Inc. (adds $1.50 per person per day)
            </span>
          </label>
        </div>
      </div>

      <h3 style={{ marginTop:20 }}>Accommodation Options</h3>
      {options.map((opt, optIdx) => {
        const optionTotalCost = calculateOptionCost(opt, currentPaxRange);
        const optionPerPersonCost = currentPaxRange > 0 ? optionTotalCost / currentPaxRange : 0;
        return (
          <div key={optIdx} style={sectionStyle}>
            <h4>Option {optIdx + 1}:</h4>
            {opt.accommodations.map((ac, idx) => {
              const filteredHotels = getFilteredHotels(ac.city, ac.stars);
              return (
                <div key={idx} style={{ marginBottom:20, position:"relative", border: '1px solid #333', padding: 15, borderRadius: 8 }}>
                  <button onClick={() => removeAccommodation(optIdx, idx)}
                    style={{ position:"absolute", top:10, right:10, background:"transparent", color:"#f66", border:"none", fontSize:16 }}>✕</button>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16 }}>
                    <div><label style={labelStyle}>City</label>
                      <select value={ac.city} onChange={e => handleAccomChange(optIdx, idx, "city", e.target.value)} style={inputStyle}>
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select></div>
                    <div><label style={labelStyle}>Stars</label>
                      <select value={ac.stars} onChange={e => handleAccomChange(optIdx, idx, "stars", e.target.value)} style={inputStyle}>
                        <option value="">Select Stars</option>
                        {(() => {
                          const isWR = String(ac.city || '').trim().toLowerCase().startsWith('wadi rum');
                          const starOptions = isWR ? ['Deluxe', 'Regular'] : stars;
                          return starOptions.map((s) => (
                            <option key={s} value={s}>
                              {/^\d+$/.test(String(s)) ? `${s}★` : s}
                            </option>
                          ));
                        })()}
                      </select></div>
                    <div>
                      <label style={labelStyle}>Hotel</label>
                      <select
                        value={ac.hotelName}
                        onChange={e => handleAccomChange(optIdx, idx, "hotelName", e.target.value)}
                        style={{
                          ...inputStyle,
                          backgroundColor: ac.isSpecialRate ? "#004D40" :
                                          (determinedSeasons[ac.city]?.[ac.stars] &&
                                           ac.season === determinedSeasons[ac.city][ac.stars]) ?
                                          "#00695C" : "#2a2a2a"
                        }}
                      >
                        <option value="">Select Hotel</option>
                        {getUniqueHotels(ac.city, ac.stars).map(hotel => (
                          <option
                            key={hotel.hotel}
                            value={hotel.hotel}
                            style={{
                              fontWeight: 'normal',
                              backgroundColor: ''
                            }}
                          >
                            {hotel.hotel}
                          </option>
                        ))}
                      </select>
                      {/* Remove the recommendation message as seasonality is automatically applied */}
                    </div>
                    <div>
                      <label style={labelStyle}>Season</label>
                      <input
                        type="text"
                        value={ac.season}
                        readOnly
                        style={{
                          ...inputStyle,
                          backgroundColor: determinedSeasons[ac.city]?.[ac.stars] === ac.season ? "#004D40" : "#2a2a2a"
                        }}
                      />
                      {determinedSeasons[ac.city]?.[ac.stars] && (
                        <small style={{ color: "#4CAF50", fontSize: "12px", display: "block", marginTop: "4px" }}>
                          Season automatically applied based on selected dates
                        </small>
                      )}
                    </div>
                    <div><label style={labelStyle}>DBL B/B Rate</label>
                      <input
                        type="text"
                        value={ac.dblRate}
                        onChange={e => handleAccomChange(optIdx, idx, "dblRate", e.target.value)}
                        style={{
                          ...inputStyle,
                          backgroundColor: ac.isSpecialRate ? "#004D40" : "#2a2a2a"
                        }}
                      />
                      {ac.hasSpecialRate && (
                        <div style={{ marginTop: "4px" }}>
                          {ac.isSpecialRate ? (
                            <small style={{ color: "#4CAF50", fontSize: "12px", display: "block" }}>
                              Special rate applied
                            </small>
                          ) : (
                            <small style={{ color: "#FFA726", fontSize: "12px", display: "block" }}>
                              Regular rate applied (special rate available)
                            </small>
                          )}
                          <button
                            onClick={() => {
                              const newOptions = [...options];
                              const accom = newOptions[optIdx].accommodations[idx];
                              
                              // Toggle between special and standard rate
                              if (accom.isSpecialRate) {
                                // Switch to standard rate
                                accom.dblRate = accom.standardRate.Rate_DBL;
                                accom.hbRate = accom.standardRate.Rate_HB;
                                accom.sglRate = accom.standardRate.Rate_SGL;
                                accom.isSpecialRate = false;
                              } else {
                                // Switch to special rate
                                accom.dblRate = accom.specialRate.Rate_DBL;
                                accom.hbRate = accom.specialRate.Rate_HB;
                                accom.sglRate = accom.specialRate.Rate_SGL;
                                accom.isSpecialRate = true;
                              }
                              // Switching between special/regular uses database rates; clear manual override
                              accom.isManualRate = false;
                              
                              setOptions(newOptions);
                            }}
                            style={{
                              backgroundColor: ac.isSpecialRate ? "#FF9800" : "#4CAF50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              cursor: "pointer",
                              marginTop: "4px"
                            }}
                          >
                            {ac.isSpecialRate ? "Use Regular Rate" : "Use Special Rate"}
                          </button>
                        </div>
                      )}
                    </div>
                    <div><label style={labelStyle}>H/B Supp.</label>
                      <input
                        type="text"
                        value={ac.hbRate}
                        onChange={e => handleAccomChange(optIdx, idx, "hbRate", e.target.value)}
                        style={{
                          ...inputStyle,
                          backgroundColor: ac.isSpecialRate ? "#004D40" : "#2a2a2a"
                        }}
                      />
                    </div>
                    <div><label style={labelStyle}>SGL Rate</label>
                      <input
                        type="text"
                        value={ac.sglRate}
                        onChange={e => handleAccomChange(optIdx, idx, "sglRate", e.target.value)}
                        style={{
                          ...inputStyle,
                          backgroundColor: ac.isSpecialRate ? "#004D40" : "#2a2a2a"
                        }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Nights</label>
                      <input type="number" value={ac.nights} onChange={e => handleAccomChange(optIdx, idx, "nights", e.target.value)} style={inputStyle}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Board</label>
                      <select
                        value={ac.board}
                        onChange={e => handleAccomChange(optIdx, idx, "board", e.target.value)}
                        style={{
                          ...inputStyle,
                          backgroundColor: String(ac.city || '').trim().toLowerCase().startsWith('wadi rum') ? "#004D40" : "#2a2a2a"
                        }}
                        disabled={String(ac.city || '').trim().toLowerCase().startsWith('wadi rum')}
                      >
                        {String(ac.city || '').trim().toLowerCase().startsWith('wadi rum') ? (
                          <option value="H/B">H/B</option>
                        ) : (
                          <>
                            <option value="B/B">B/B</option>
                            <option value="H/B">H/B</option>
                            <option value="SGL Supplement">SGL Supplement</option>
                            <option value="SGL + HB">SGL + HB</option>
                          </>
                        )}
                      </select>
                      {String(ac.city || '').trim().toLowerCase().startsWith('wadi rum') && (
                        <small style={{ color: "#4CAF50", fontSize: "12px", display: "block", marginTop: "4px" }}>
                          Wadi Rum accommodations are always H/B
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <button onClick={() => addAccommodation(optIdx)}
              style={{ marginBottom:10, padding:"6px 12px", borderRadius:6, backgroundColor:"#444", color:"#fff", border:"none" }}>
              + Add Accommodation
            </button>
            <div style={{...statBox, marginTop: 15, backgroundColor: '#004D40', fontSize: 16, textAlign: 'right'}}>
              Subtotal Option {optIdx + 1} Per Person for {paxRanges.find(p => p.value === currentPaxRange)?.label}: {optionPerPersonCost.toFixed(2)} USD
            </div>
          </div>
        )
      })}
      <div style={{ marginTop:20 }}>
        <label style={labelStyle}>Profit Margin (%):</label>{" "}
        <input type="number" value={profitMargin*100}
          onChange={e=>setProfitMargin(Number(e.target.value)/100)}
          style={{ ...inputStyle, maxWidth:100 }}/>%
      </div>
      <h3 style={{ marginTop: 40 }}>Final Totals with Profit</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
        {Object.values(calculationResults).map((result, index) => (
          <div key={index} style={{ ...sectionStyle, backgroundColor: "#111" }}>
            <h4 style={{ borderBottom: "1px solid #444", paddingBottom: 10, marginBottom: 15 }}>
              Results for {result.label}
            </h4>
            
            {/* Cost breakdown table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #444", color: "#ccc" }}>Item</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #444", color: "#ccc" }}>Cost (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: result.transportDiscountApplied ? "rgba(76, 175, 80, 0.1)" : "transparent" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    Transportation {result.transportDiscountInfo}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.transport || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'transport', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Entrances</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.entrances || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'entrances', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Jeep</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.jeep || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'jeep', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Local Guide</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.localGuide || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'localGuide', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr style={{ backgroundColor: jerashGuideOptions[String(result.label)]?.isGroup ? "rgba(76, 175, 80, 0.1)" : "transparent" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    {rows.some(row => (row.itinerary || "").toLowerCase().includes("jerash")) && rows.some(row => row.guideRequired)
                      ? parseInt(result.label) < 11
                        ? "Private Guide (No Jerash Extra)"
                        : `Private Guide + Jerash Extra (${Math.ceil(parseInt(result.label) / 11) * 14.10} USD)`
                      : "Private Guide"}
                    {rows.some(row => row.guideRequired) &&
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                        When Guide is selected, LOCAL GUIDE is removed
                      </div>
                    }
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.privateGuide || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'privateGuide', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                {result.waterIncluded && (
                  <tr style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Water</td>
                    <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      <input
                        type="number"
                        value={result.water || 0}
                        onChange={(e) => handleManualUpdate(result.label, 'water', e.target.value)}
                        style={{
                          width: "80px",
                          padding: "4px 8px",
                          backgroundColor: "#2a2a2a",
                          color: "#fff",
                          border: "1px solid #444",
                          borderRadius: "4px",
                          textAlign: "right"
                        }}
                      />
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Meals</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.meals || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'meals', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Extras</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.extras || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'extras', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Meet & Assist</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.meetAssist || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'meetAssist', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Tips & Portage</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.tips || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'tips', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Bank Commission</td>
                  <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                    <input
                      type="number"
                      value={result.commission || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'commission', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        textAlign: "right"
                      }}
                    />
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#333" }}>
                  <td style={{ padding: "10px 12px", fontWeight: "bold" }}>Base Cost Per Person</td>
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: "bold" }}>
                    <input
                      type="number"
                      value={result.baseCostPerPersonUSD || 0}
                      onChange={(e) => handleManualUpdate(result.label, 'baseCostPerPersonUSD', e.target.value)}
                      style={{
                        width: "80px",
                        padding: "4px 8px",
                        backgroundColor: "#333",
                        color: "#fff",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        textAlign: "right",
                        fontWeight: "bold"
                      }}
                    /> USD
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Options table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #444", color: "#ccc" }}>Option</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #444", color: "#ccc" }}>Total Price (USD)</th>
                </tr>
              </thead>
              <tbody>
                {result.optionTotals.map((option, i) => (
                  <tr key={i} style={{ backgroundColor: i === 0 ? "#004D40" : "#00695C" }}>
                    <td style={{ padding: "12px", borderBottom: i === result.optionTotals.length - 1 ? "none" : "1px solid #005a4e" }}>
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>Option {i + 1}</div>
                      <div style={{ fontSize: "13px", color: "#eee", marginTop: "5px" }}>
                        Hotels: {option.accommodations.map(a => (a.hotelName ? `${a.hotelName} (${a.season})` : 'N/A')).join(' - ')}
                      </div>
                    </td>
                    <td style={{
                      textAlign: "right",
                      padding: "12px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      borderBottom: i === result.optionTotals.length - 1 ? "none" : "1px solid #005a4e"
                    }}>
                      <input
                        type="number"
                        value={option.price || 0}
                        step="0.01"
                        onChange={(e) => handleOptionUpdate(result.label, i, e.target.value)}
                        style={{
                          width: "100px",
                          padding: "4px 8px",
                          backgroundColor: i === 0 ? "#004D40" : "#00695C",
                          color: "#fff",
                          border: "1px solid #00796B",
                          borderRadius: "4px",
                          textAlign: "right",
                          fontWeight: "bold"
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle   = { fontWeight: 500, fontSize: 15, marginBottom: 4 };
const inputStyle   = { padding: 10, borderRadius: 6, border: "1px solid #444", backgroundColor: "#2a2a2a", color: "#fff", fontSize: 14, width: "100%" };
const sectionStyle = { backgroundColor: "#1f1f1f", padding: 20, marginBottom: 30, borderRadius: 12, position: "relative" };
const statBox      = { backgroundColor: "#2a2a2a", borderRadius: 10, padding: "15px 25px", fontSize: 18, fontWeight: "bold", marginTop: 15, width: "fit-content" };

// Unified checkbox row styles for consistent alignment and spacing
const checkboxRowStyle = { display: 'flex', alignItems: 'center', gap: 12 };
const checkboxLabelTextStyle = { ...labelStyle, marginBottom: 0, minWidth: 180 };
const checkboxInputStyle = { transform: 'scale(1.3)' };

export default QuotationItinerary;

