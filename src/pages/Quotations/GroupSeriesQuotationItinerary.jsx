import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import CostRow from "./CostRow";
import { determineSeason } from "../../assets/utils/seasonalityUtils";
import { transformedRestaurantData, JOD_TO_USD_RATE as RESTAURANT_JOD_TO_USD } from "../../assets/utils/restaurantData";
import { getTranslatedQuickHint } from "../../assets/utils/getTranslatedQuickHint";
import AdditionalLocations from "../../assets/templates/AdditionalLocations.json";

// Define extras options for dropdown
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

// Define extras with costs
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
const JOD_TO_USD = 1.41;

// Helper function to parse price strings like "JOD 09.00" or "USD 22.00"
// Normalize Decap CMS "data" wrapper (supports either { data: <json> } or raw JSON)
const normalizeCMS = (j) => {
  try {
    // If file is a string containing JSON, parse it
    if (typeof j === 'string') {
      try { return JSON.parse(j); } catch { return j; }
    }
    if (j && typeof j === 'object') {
      // Common wrappers from CMS widgets
      if ('data' in j) {
        const d = j.data;
        if (typeof d === 'string') { try { return JSON.parse(d); } catch { return d; } }
        return d;
      }
      if ('body' in j) {
        const b = j.body;
        if (typeof b === 'string') { try { return JSON.parse(b); } catch { return b; } }
        return b;
      }
      if ('Body' in j) {
        const B = j.Body;
        if (typeof B === 'string') { try { return JSON.parse(B); } catch { return B; } }
        return B;
      }
    }
    return j;
  } catch {
    return j;
  }
};
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

// Define PAX ranges
const PAX_RANGES = [
  { value: 1, label: '1 pax' },
  { value: 2, label: '2-3 pax' },
  { value: 4, label: '4-5 pax' },
  { value: 6, label: '6-7 pax' },
  { value: 8, label: '8-9 pax' },
  { value: 10, label: '10-14 pax' },
  { value: 15, label: '15-19 pax' },
  { value: 20, label: '20-24 pax' },
  { value: 25, label: '25-29 pax' },
  { value: 30, label: '30-34 pax' },
  { value: 35, label: '35-39 pax' },
  { value: 40, label: '40-44 pax' },
  { value: 45, label: '45-49 pax' }
];
 
 
const initialAccommodation = {
  city: "",
  stars: "",
  hotelName: "",
  season: "", // Added separate season field
  dblRate: "",
  hbRate: "",
  sglRate: "",
  sglSupp: "",
  nights: 1,
  board: "B/B",
  flatRate: {
    dblRate: "",
    hbRate: "",
    sglRate: ""
  }
};

export default function GroupSeriesQuotationItinerary({ paxRanges = [], programLength = 1, validityDates = [], onDataChange, agentId, transportationDiscount = 0, initialData = {} }) {
  console.log("GroupSeriesQuotationItinerary rendering with props:", {
    paxRanges,
    programLength,
    validityDates,
    agentId,
    transportationDiscount,
    initialDataKeys: Object.keys(initialData)
  });
  
  // Log the full initialData structure for debugging
  console.log("FULL INITIAL DATA:", JSON.stringify(initialData, null, 2));
  
  // Initialize state with initialData if available
  const [rows, setRows] = useState(() => {
    console.log("Checking initialData for itinerary:", initialData);
    
    // First try to get itinerary from initialData
    if (initialData && initialData.itinerary && Array.isArray(initialData.itinerary) && initialData.itinerary.length > 0) {
      console.log("Initializing rows with initialData.itinerary:", initialData.itinerary);
      return JSON.parse(JSON.stringify(initialData.itinerary)); // Deep clone to avoid reference issues
    }
    
    // If no itinerary in initialData, check if there's a quotations array with itinerary
    if (initialData && initialData.quotations && Array.isArray(initialData.quotations) && initialData.quotations.length > 0) {
      // Try to find itinerary in the first quotation
      const firstQuotation = initialData.quotations[0];
      if (firstQuotation && firstQuotation.itinerary && Array.isArray(firstQuotation.itinerary) && firstQuotation.itinerary.length > 0) {
        console.log("Initializing rows with itinerary from first quotation:", firstQuotation.itinerary);
        return JSON.parse(JSON.stringify(firstQuotation.itinerary));
      }
    }
    
    console.log("No itinerary found in initialData, returning empty array");
    return [];
  });
  
  // Store entrance fees with a default value to prevent $0 display
  const [fees, setFees] = useState([
    {
      "Travco Jordan": "Petra",
      "__1": "50.00"
    },
    {
      "Travco Jordan": "Jerash",
      "__1": "14.00"
    },
    {
      "Travco Jordan": "Wadi Rum",
      "__1": "7.00"
    }
  ]);
  
  // Flag to track if fees have been loaded from server
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [jeepServices, setJeepServices] = useState([]);
  const [hotelRates, setHotelRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [transportRates, setTransportRates] = useState({});
  const [guideRates, setGuideRates] = useState({ Local: {}, Private: {} });
  const [profitMargin, setProfitMargin] = useState(0.10);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(-1);
  
  // Initialize optionalActivities with initialData if available
  const [optionalActivities, setOptionalActivities] = useState(() => {
    if (initialData && initialData.optionalActivities && typeof initialData.optionalActivities === 'object') {
      console.log("Initializing optionalActivities with initialData:", initialData.optionalActivities);
      return JSON.parse(JSON.stringify(initialData.optionalActivities)); // Deep clone to avoid reference issues
    }
    return {};
  });

  // Hydration guard to populate from initialData once it becomes available (edit mode)
  const hasHydratedFromInitialData = useRef(false);

  useEffect(() => {
    // Only hydrate once per mount when a non-empty initialData arrives
    if (hasHydratedFromInitialData.current) return;

    try {
      if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
        console.log("Hydrating GroupSeriesQuotationItinerary from initialData...");

        // Itinerary (rows)
        if (Array.isArray(initialData.itinerary) && initialData.itinerary.length > 0) {
          const clonedRows = JSON.parse(JSON.stringify(initialData.itinerary));
          setRows(clonedRows);
          console.log("Hydrated rows from initialData.itinerary:", clonedRows.length);
        } else if (initialData.quotations && Array.isArray(initialData.quotations) && initialData.quotations[0]?.itinerary) {
          const clonedRows = JSON.parse(JSON.stringify(initialData.quotations[0].itinerary));
          setRows(clonedRows);
          console.log("Hydrated rows from initialData.quotations[0].itinerary:", clonedRows.length);
        }

        // Options (accommodation cards)
        if (Array.isArray(initialData.options) && initialData.options.length > 0) {
          const clonedOptions = JSON.parse(JSON.stringify(initialData.options));
          setOptions(clonedOptions);
          console.log("Hydrated options from initialData.options:", clonedOptions.length);
        } else if (initialData.quotations && Array.isArray(initialData.quotations) && initialData.quotations[0]?.options) {
          const clonedOptions = JSON.parse(JSON.stringify(initialData.quotations[0].options));
          setOptions(clonedOptions);
          console.log("Hydrated options from initialData.quotations[0].options:", clonedOptions.length);
        }

        // Optional Activities
        if (initialData.optionalActivities && typeof initialData.optionalActivities === 'object') {
          const clonedOptionals = JSON.parse(JSON.stringify(initialData.optionalActivities));
          setOptionalActivities(clonedOptionals);
          console.log("Hydrated optionalActivities:", Object.keys(clonedOptionals).length);
        }

        // Calculation Results (used to prefill totals UI until recalculation runs)
        if (initialData.calculationResults && typeof initialData.calculationResults === 'object') {
          const clonedCalc = JSON.parse(JSON.stringify(initialData.calculationResults));
          setCalculationResults(clonedCalc);
          console.log("Hydrated calculationResults");
        }

        // Hydrate selectedPaxRanges from initialData or infer from calculationResults
        try {
          let hydratedPaxRanges = [];
          if (initialData && Array.isArray(initialData.selectedPaxRanges) && initialData.selectedPaxRanges.length > 0) {
            hydratedPaxRanges = initialData.selectedPaxRanges.map(v => parseInt(v, 10) || v);
          } else if (initialData && initialData.calculationResults && typeof initialData.calculationResults === 'object') {
            hydratedPaxRanges = Object.keys(initialData.calculationResults)
              .filter(k => /^\d+$/.test(k))
              .map(k => parseInt(k, 10))
              .sort((a, b) => a - b);
          }
          if (hydratedPaxRanges.length > 0) {
            setSelectedPaxRanges(hydratedPaxRanges);
            console.log("Hydrated selectedPaxRanges from initialData:", hydratedPaxRanges);
          }
        } catch (e) {
          console.warn("Unable to hydrate selectedPaxRanges from initialData:", e);
        }

        hasHydratedFromInitialData.current = true;
      }
    } catch (e) {
      console.error("Error hydrating from initialData in GroupSeriesQuotationItinerary:", e);
    }
  }, [initialData]);
  
  // Agent dropdown states
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(agentId || "");
  
  // Store Jerash guide options per pax range with a more explicit structure
  const [jerashGuideOptions, setJerashGuideOptions] = useState(() => {
    // Initialize with empty objects for each pax range
    const initialOptions = {};
    // Initialize options for each PAX range
    PAX_RANGES.forEach(range => {
      initialOptions[String(range.value)] = { isFIT: false, isGroup: false };
    });
    
    return initialOptions;
  });
  
  const [options, setOptions] = useState(() => {
    console.log("Checking initialData for options:", initialData);
    
    // First try to get options directly from initialData
    if (initialData && initialData.options && Array.isArray(initialData.options) && initialData.options.length > 0) {
      console.log("Initializing options with initialData.options:", initialData.options);
      // Deep clone and ensure rate values are preserved as strings to avoid conversion issues
      const clonedOptions = JSON.parse(JSON.stringify(initialData.options));
      
      // Process each option to ensure rate values are preserved correctly
      clonedOptions.forEach(option => {
        if (option.accommodations && Array.isArray(option.accommodations)) {
          option.accommodations.forEach(accom => {
            // Ensure flatRate values are preserved
            if (accom.flatRate) {
              // Preserve original string values if they exist
              if (typeof accom.flatRate.dblRate === 'string' && accom.flatRate.dblRate !== '') {
                accom.flatRate.dblRate = accom.flatRate.dblRate;
              }
              if (typeof accom.flatRate.sglRate === 'string' && accom.flatRate.sglRate !== '') {
                accom.flatRate.sglRate = accom.flatRate.sglRate;
              }
              if (typeof accom.flatRate.hbRate === 'string' && accom.flatRate.hbRate !== '') {
                accom.flatRate.hbRate = accom.flatRate.hbRate;
              }
            }
            
            // Ensure validityRates values are preserved
            if (accom.validityRates && Array.isArray(accom.validityRates)) {
              accom.validityRates.forEach(rate => {
                // Preserve original string values if they exist
                if (typeof rate.dblRate === 'string' && rate.dblRate !== '') {
                  rate.dblRate = rate.dblRate;
                }
                if (typeof rate.sglRate === 'string' && rate.sglRate !== '') {
                  rate.sglRate = rate.sglRate;
                }
                if (typeof rate.hbRate === 'string' && rate.hbRate !== '') {
                  rate.hbRate = rate.hbRate;
                }
              });
            }
          });
        }
      });
      
      console.log("Processed options with preserved rate values:", clonedOptions);
      return clonedOptions;
    }
    
    // If no options in initialData, check if there's a quotations array with options
    if (initialData && initialData.quotations && Array.isArray(initialData.quotations) && initialData.quotations.length > 0) {
      // Try to find options in the first quotation
      const firstQuotation = initialData.quotations[0];
      if (firstQuotation && firstQuotation.options && Array.isArray(firstQuotation.options) && firstQuotation.options.length > 0) {
        console.log("Initializing options with options from first quotation:", firstQuotation.options);
        
        // Deep clone and ensure rate values are preserved as strings to avoid conversion issues
        const clonedOptions = JSON.parse(JSON.stringify(firstQuotation.options));
        
        // Process each option to ensure rate values are preserved correctly
        clonedOptions.forEach(option => {
          if (option.accommodations && Array.isArray(option.accommodations)) {
            option.accommodations.forEach(accom => {
              // Ensure flatRate values are preserved
              if (accom.flatRate) {
                // Preserve original string values if they exist
                if (typeof accom.flatRate.dblRate === 'string' && accom.flatRate.dblRate !== '') {
                  accom.flatRate.dblRate = accom.flatRate.dblRate;
                }
                if (typeof accom.flatRate.sglRate === 'string' && accom.flatRate.sglRate !== '') {
                  accom.flatRate.sglRate = accom.flatRate.sglRate;
                }
                if (typeof accom.flatRate.hbRate === 'string' && accom.flatRate.hbRate !== '') {
                  accom.flatRate.hbRate = accom.flatRate.hbRate;
                }
              }
              
              // Ensure validityRates values are preserved
              if (accom.validityRates && Array.isArray(accom.validityRates)) {
                accom.validityRates.forEach(rate => {
                  // Preserve original string values if they exist
                  if (typeof rate.dblRate === 'string' && rate.dblRate !== '') {
                    rate.dblRate = rate.dblRate;
                  }
                  if (typeof rate.sglRate === 'string' && rate.sglRate !== '') {
                    rate.sglRate = rate.sglRate;
                  }
                  if (typeof rate.hbRate === 'string' && rate.hbRate !== '') {
                    rate.hbRate = rate.hbRate;
                  }
                });
              }
            });
          }
        });
        
        console.log("Processed options from quotation with preserved rate values:", clonedOptions);
        return clonedOptions;
      }
    }
    
    console.log("No options found in initialData, creating default options");
    // Otherwise, create default options with accommodations that have rates for each validity date
    return [1, 2, 3].map(() => ({
      accommodations: [{
        ...initialAccommodation,
        // Add rates for each validity date
        validityRates: validityDates.length > 0
          ? validityDates.map((_, index) => ({
              validityDateIndex: index,
              season: "Standard", // Default season
              dblRate: 0,
              hbRate: 0,
              sglRate: 0
            }))
          : [],
        // Initialize flat rate
        flatRate: {
          dblRate: 0,
          hbRate: 0,
          sglRate: 0
        }
      }]
    }));
  });
  // Initialize calculationResults with initialData if available
  const [calculationResults, setCalculationResults] = useState(() => {
    if (initialData && initialData.calculationResults && typeof initialData.calculationResults === 'object') {
      console.log("Initializing calculationResults with initialData:", initialData.calculationResults);
      return JSON.parse(JSON.stringify(initialData.calculationResults)); // Deep clone to avoid reference issues
    }
    return {};
  });
  const [selectedPaxRanges, setSelectedPaxRanges] = useState(() => {
    try {
      // 1) Prefer explicit selection saved with the quotation
      if (initialData && Array.isArray(initialData.selectedPaxRanges) && initialData.selectedPaxRanges.length > 0) {
        return initialData.selectedPaxRanges.map(v => parseInt(v, 10) || v);
      }
      // 2) Otherwise infer from saved calculationResults keys (which are pax values as strings)
      if (initialData && initialData.calculationResults && typeof initialData.calculationResults === 'object') {
        const keys = Object.keys(initialData.calculationResults)
          .filter(k => /^\d+$/.test(k))
          .map(k => parseInt(k, 10))
          .filter(Boolean);
        if (keys.length > 0) return keys;
      }
    } catch (_) {}
    // 3) Fallback to first provided paxRanges prop
    return paxRanges.length > 0 ? [paxRanges[0]?.value] : [];
  });
  const [currentValidityDate, setCurrentValidityDate] = useState(validityDates.length > 0 ? 0 : -1); // Index of selected validity date
  const [guideData, setGuideData] = useState({});
  const [useSpecialRates, setUseSpecialRates] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [restaurantData, setRestaurantData] = useState(transformedRestaurantData || []);
  const [waterIncluded, setWaterIncluded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Add a state to force recalculation
  const [jerashExtraCost, setJerashExtraCost] = useState(14.10);
  const [rateDisplayMode, setRateDisplayMode] = useState(() => (initialData && initialData.rateDisplayMode) || 'bySeasonAuto'); // 'bySeasonAuto' | 'bySeasonManual' | 'byFlatRate'

  // Hydrate rate display mode once from initialData to avoid oscillation
  const rateModeHydratedRef = useRef(false);
  useEffect(() => {
    try {
      const incoming = initialData && initialData.rateDisplayMode;
      // Only hydrate once and only when a truthy incoming value exists
      if (!rateModeHydratedRef.current && incoming) {
        setRateDisplayMode(incoming);
        rateModeHydratedRef.current = true;
      }
    } catch (_) {}
    // Do not depend on local rateDisplayMode to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData && initialData.rateDisplayMode]);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Debounce function to prevent rapid state updates causing infinite loops
  const debouncedForceUpdate = useCallback((source = 'general', timeout = 300) => {
    console.log(`Debounced force update called from ${source} - will update in ${timeout}ms`);
    clearTimeout(window.forceUpdateTimer);
    window.forceUpdateTimer = setTimeout(() => {
      console.log(`Executing debounced force update from ${source}`);
      setForceUpdate(prev => prev + 1);
    }, timeout);
  }, []);
  
  // Special debounce for entrance fees with longer timeout
  const debouncedEntranceUpdate = useCallback(() => {
    console.log("Entrance fees debounce called - using longer timeout (500ms)");
    debouncedForceUpdate('entrance_fees', 500);
  }, [debouncedForceUpdate]);

  // Function to load hotel rates from localStorage or fallback to JSON file
  const loadHotelRates = useCallback((source = 'standard') => {
    console.log(`🏨 Loading hotel rates...`);
    
    // First try to load from localStorage (this is where HotelRatesEntry.jsx saves rates)
    const savedHotelRates = localStorage.getItem('hotelRates');
    
    if (savedHotelRates) {
      try {
        const parsedData = JSON.parse(savedHotelRates);
        console.log(`Loaded ${parsedData.length} hotel rates from localStorage`);
        console.log("Sample rate:", parsedData.length > 0 ? parsedData[0] : "No rates found");
        
        // Ensure all rate values are properly converted to numbers
        const processedData = parsedData.map(rate => ({
          ...rate,
          Rate_DBL: parseFloat(rate.Rate_DBL || rate.DBL || rate.dbl || rate.DblRate || 0),
          Rate_SGL: parseFloat(rate.Rate_SGL || rate.SGL || rate.sgl || rate.SglRate || 0),
          Rate_HB: parseFloat(rate.Rate_HB || rate.HB || rate.hb || rate.HbRate || 0)
        }));
        
        console.log("Processed rates with numeric values:", processedData.length > 0 ? processedData[0] : "No rates found");
        setHotelRates(processedData);
        
        // Show success notification
        setNotification({
          show: true,
          message: `Hotel rates loaded successfully from localStorage!`,
          type: 'success'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
        
        // Use debounced force update to prevent rapid recalculations
        console.log("Hotel rates loaded, scheduling debounced recalculation");
        debouncedForceUpdate();
        return;
      } catch (err) {
        console.error("Error parsing hotel rates from localStorage:", err);
      }
    }
    
    // Fallback to JSON file if localStorage failed
    const ratesFile = 'hotelRates.json';
    
    // Fetch hotel rates with cache-busting
    fetch(`/data/${ratesFile}?v=${Date.now()}`)
      .then(res => res.json())
      .then(raw => {
        const hotelData = normalizeCMS(raw);
        console.log(`Loaded ${Array.isArray(hotelData) ? hotelData.length : 0} hotel rates from ${ratesFile}`);
        console.log("Sample rate:", Array.isArray(hotelData) && hotelData.length > 0 ? hotelData[0] : "No rates found");
        
        // Ensure all rate values are properly converted to numbers
        const processedData = (Array.isArray(hotelData) ? hotelData : []).map(rate => ({
          ...rate,
          Rate_DBL: parseFloat(rate.Rate_DBL || rate.DBL || rate.dbl || rate.DblRate || 0),
          Rate_SGL: parseFloat(rate.Rate_SGL || rate.SGL || rate.sgl || rate.SglRate || 0),
          Rate_HB: parseFloat(rate.Rate_HB || rate.HB || rate.hb || rate.HbRate || 0)
        }));
        
        console.log("Processed rates with numeric values:", processedData.length > 0 ? processedData[0] : "No rates found");
        setHotelRates(processedData);
        
        // Show success notification
        setNotification({
          show: true,
          message: `Hotel rates loaded successfully from ${source} source!`,
          type: 'success'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
        
        // Use debounced force update to prevent rapid recalculations
        console.log("Hotel rates loaded from file, scheduling debounced recalculation");
        debouncedForceUpdate();
      })
      .catch(err => {
        console.error(`Failed to load hotel rates from ${ratesFile}:`, err);
        
        // Show error notification
        setNotification({
          show: true,
          message: `Failed to load hotel rates: ${err.message}. Please try again.`,
          type: 'error'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
      });
  }, []);

  // Function to load all rate data with cache-busting
  const loadRateData = useCallback(() => {
    setIsRefreshing(true);
    
    // Fetch data from server
    // First try to load hotel rates from localStorage
    const savedHotelRates = localStorage.getItem('hotelRates');
    let hotelRatesPromise;
    
    if (savedHotelRates) {
      try {
        const parsedData = JSON.parse(savedHotelRates);
        console.log('Using hotel rates from localStorage');
        hotelRatesPromise = Promise.resolve(parsedData);
      } catch (err) {
        console.error("Error parsing hotel rates from localStorage:", err);
        // Fallback to server data
        hotelRatesPromise = fetch(`/data/hotelRates.json?v=${Date.now()}`).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
          return res.json();
        });
      }
    } else {
      // No localStorage data, try server
      hotelRatesPromise = fetch(`/data/hotelRates.json?v=${Date.now()}`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
        return res.json();
      });
    }
    
    Promise.all([
      // Fetch entrance fees with better error handling
      fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch entrance fees: ${res.status}`);
          return res.json();
        })
        .catch(err => {
          console.error("Error fetching entrance fees:", err);
          // Return a minimal set of entrance fees as fallback
          return [
            { "Travco Jordan": "Header" },
            { "Travco Jordan": "Petra", "__1": "50.00" },
            { "Travco Jordan": "Jerash", "__1": "14.00" },
            { "Travco Jordan": "Wadi Rum", "__1": "7.00" }
          ];
        }),
      hotelRatesPromise,
      fetch(`/data/transportRates.json?v=${Date.now()}`).then(res => res.json()),
      fetch(`/data/guidesRates.json?v=${Date.now()}`).then(res => res.json()),
      fetch(`/data/Restaurants_2025.json?v=${Date.now()}`)
        .then(res => {
          if (!res.ok) throw new Error("Restaurants_2025 not available");
          return res.json();
        })
        .then(data => {
          const transformed = [];
          let lastRegion = "";
          data.forEach(item => {
            const itemRegion = item["Region "];
            if (itemRegion && itemRegion.trim()) lastRegion = itemRegion.trim();
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
          return transformed;
        })
        .catch(() =>
          fetch(`/data/restaurants_usd.json?v=${Date.now()}`)
            .then(r => r.json())
            .catch(() => [])
        )
    ]).then(([entranceFees, hotelData, transportData, guideData, restaurantsData]) => {
      // Normalize possible CMS-wrapped payloads
      const hotelDataNorm = normalizeCMS(hotelData);
      const transportDataNorm = normalizeCMS(transportData);
      const guideDataNorm = normalizeCMS(guideData);
      const restaurantsDataNorm = normalizeCMS(restaurantsData);

      // Process data and update state
      console.log(`Loaded ${Array.isArray(hotelDataNorm) ? hotelDataNorm.length : 0} hotel rates during full refresh`);
      
      // Ensure all rate values are properly converted to numbers
      const processedHotelData = (Array.isArray(hotelDataNorm) ? hotelDataNorm : []).map(rate => ({
        ...rate,
        Rate_DBL: parseFloat(rate.Rate_DBL || rate.DBL || rate.dbl || rate.DblRate || 0),
        Rate_SGL: parseFloat(rate.Rate_SGL || rate.SGL || rate.sgl || rate.SglRate || 0),
        Rate_HB: parseFloat(rate.Rate_HB || rate.HB || rate.hb || rate.HbRate || 0)
      }));
      
      console.log("Processed hotel rates with numeric values:", processedHotelData.length > 0 ? processedHotelData[0] : "No rates found");
      setHotelRates(processedHotelData);
      setTransportRates(transportDataNorm || {});
      setGuideRates(guideDataNorm || { Local: {}, Private: {} });
      setRestaurantData(Array.isArray(restaurantsDataNorm) ? restaurantsDataNorm : []);
      
      try {
        // Process entrance fees with better error handling
        if (!entranceFees || !Array.isArray(entranceFees) || entranceFees.length <= 1) {
          console.error("Invalid entrance fees data:", entranceFees);
          // Don't update fees state if data is invalid
        } else {
          const filteredFees = entranceFees.slice(1).filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return !feeName.toLowerCase().includes("guide");
          });
          
          console.log(`Processed ${filteredFees.length} entrance fees`);
          if (filteredFees.length > 0) {
            console.log("Sample entrance fee:", filteredFees[0]);
            
            // Ensure all fees have a numeric value
            const processedFees = filteredFees.map(fee => ({
              ...fee,
              "__1": fee["__1"] ? String(parseFloat(fee["__1"]).toFixed(2)) : "0.00"
            }));
            
            setFees(processedFees);
            setFeesLoaded(true);
          }
          
          // Extract Jeep services
          const jeepServicesArray = entranceFees.slice(1).filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return feeName.toLowerCase().includes("jeep");
          });
          
          console.log(`Processed ${jeepServicesArray.length} jeep services`);
          setJeepServices(jeepServicesArray);
        }
      } catch (error) {
        console.error("Error processing entrance fees:", error);
      }
      
      setIsRefreshing(false);
      
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
      
      // Show error notification
      setNotification({
        show: true,
        message: `Failed to refresh rates: ${err.message}. Please try again.`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    });
  }, []);

  // Load essential data on mount, but keep rate refreshing manual
  useEffect(() => {
    console.log("Loading essential data on component mount...");
    
    // Load agents data
    fetch("/data/TravelAgents.json")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data);
        setFilteredAgents(data);
        console.log("Agents data loaded successfully");
      })
      .catch((err) => console.error("Failed to load TravelAgents.json:", err));
    
    // Load essential data like entrance fees and hotel rates
    // First try to load hotel rates from localStorage
    const savedHotelRates = localStorage.getItem('hotelRates');
    let hotelRatesPromise;
    
    if (savedHotelRates) {
      try {
        const parsedData = JSON.parse(savedHotelRates);
        console.log('Using hotel rates from localStorage for initial load');
        hotelRatesPromise = Promise.resolve(parsedData);
      } catch (err) {
        console.error("Error parsing hotel rates from localStorage:", err);
        // Fallback to server data
        hotelRatesPromise = fetch(`/data/hotelRates.json`).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
          return res.json();
        });
      }
    } else {
      // No localStorage data, try server
      hotelRatesPromise = fetch(`/data/hotelRates.json`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch hotel rates: ${res.status}`);
        return res.json();
      });
    }
    
    Promise.all([
      // Fetch entrance fees with better error handling
      fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch entrance fees: ${res.status}`);
          return res.json();
        })
        .catch(err => {
          console.error("Error fetching entrance fees:", err);
          // Return a minimal set of entrance fees as fallback
          return [
            { "Travco Jordan": "Header" },
            { "Travco Jordan": "Petra", "__1": "50.00" },
            { "Travco Jordan": "Jerash", "__1": "14.00" },
            { "Travco Jordan": "Wadi Rum", "__1": "7.00" }
          ];
        }),
      hotelRatesPromise,
      // Ensure transport and guide rates are available on initial load (to calculate transport and guide costs)
      fetch(`/data/transportRates.json`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch transport rates: ${res.status}`);
        return res.json();
      }).catch(err => {
        console.error("Error fetching transport rates:", err);
        return {};
      }),
      fetch(`/data/guidesRates.json`).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch guide rates: ${res.status}`);
        return res.json();
      }).catch(err => {
        console.error("Error fetching guide rates:", err);
        return { Local: {}, Private: {} };
      })
    ]).then(([entranceFees, hotelData, transportData, guideData]) => {
      // Process data and update state
      console.log(`Loaded ${hotelData.length} hotel rates during initial load`);
      
      // Ensure all rate values are properly converted to numbers
      const processedHotelData = hotelData.map(rate => ({
        ...rate,
        Rate_DBL: parseFloat(rate.Rate_DBL || rate.DBL || rate.dbl || rate.DblRate || 0),
        Rate_SGL: parseFloat(rate.Rate_SGL || rate.SGL || rate.sgl || rate.SglRate || 0),
        Rate_HB: parseFloat(rate.Rate_HB || rate.HB || rate.hb || rate.HbRate || 0)
      }));
      
      console.log("Processed hotel rates with numeric values:", processedHotelData.length > 0 ? processedHotelData[0] : "No rates found");
      setHotelRates(processedHotelData);
      // Make transport and guide rates available for calculations immediately
      setTransportRates(transportDataNorm || {});
      setGuideRates(guideDataNorm || { Local: {}, Private: {} });
      
      try {
        // Process entrance fees with better error handling
        if (!entranceFees || !Array.isArray(entranceFees) || entranceFees.length <= 1) {
          console.error("Invalid entrance fees data:", entranceFees);
          // Don't update fees state if data is invalid
        } else {
          const filteredFees = entranceFees.slice(1).filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return !feeName.toLowerCase().includes("guide");
          });
          
          console.log(`Initial load: Processed ${filteredFees.length} entrance fees`);
          if (filteredFees.length > 0) {
            console.log("Sample entrance fee:", filteredFees[0]);
            
            // Ensure all fees have a numeric value
            const processedFees = filteredFees.map(fee => ({
              ...fee,
              "__1": fee["__1"] ? String(parseFloat(fee["__1"]).toFixed(2)) : "0.00"
            }));
            
            setFees(processedFees);
            setFeesLoaded(true);
          }
          
          // Extract Jeep services
          const jeepServicesArray = entranceFees.slice(1).filter(fee => {
            const feeName = fee["Travco Jordan"] || "";
            return feeName.toLowerCase().includes("jeep");
          });
          
          console.log(`Initial load: Processed ${jeepServicesArray.length} jeep services`);
          setJeepServices(jeepServicesArray);
        }
      } catch (error) {
        console.error("Error processing entrance fees:", error);
      }
      
      console.log("Essential data loaded successfully");
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Essential data loaded successfully.',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }).catch(err => {
      console.error("Failed to load essential data:", err);
      
      // Show error notification
      setNotification({
        show: true,
        message: `Failed to load essential data: ${err.message}. Please try refreshing rates manually.`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    });
  }, []);
// Live refresh of entrance fees (Data Entry -> GS quotations)
// - Listens to localStorage 'entranceFeesVersion' changes and BroadcastChannel 'entranceFees'
// - Refetches RepEnt_Fees.json with cache-busting and updates both fees and jeep services
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

      const processedFees = filteredFees.map(fee => ({
        ...fee,
        "__1": fee["__1"] ? String(parseFloat(fee["__1"]).toFixed(2)) : "0.00"
      }));

      setFees(processedFees);

      // Update Jeep services as well
      const jeepServicesArray = (Array.isArray(entranceFees) ? entranceFees : [])
        .slice(1)
        .filter(fee => {
          const feeName = fee["Travco Jordan"] || "";
          return feeName.toLowerCase().includes("jeep");
        });
      setJeepServices(jeepServicesArray);

      // Schedule recalculation with the longer debounce used for entrance changes
      try { debouncedEntranceUpdate(); } catch (_) {}
    })
    .catch(err => console.error("Failed to refresh entrance fees:", err));
}, [debouncedEntranceUpdate]);

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

// Live refresh of restaurant rates (Data Entry -> GS quotations)
// - Listens to localStorage 'restaurantRatesVersion' changes and BroadcastChannel 'restaurantRates'
// - Refetches Restaurants_2025.json (preferred) with cache-busting, transforms, and updates restaurantData
const refreshRestaurants = useCallback(() => {
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
  
  // Filter agents based on search term (null-safe)
  useEffect(() => {
    const term = String(agentSearchTerm ?? "").trim().toLowerCase();
    const src = Array.isArray(agents) ? agents : [];
    if (!term) {
      setFilteredAgents(src.filter(Boolean));
      return;
    }
    const filtered = src.filter((item) => {
      const name = String(item?.Account_Name ?? "").toLowerCase();
      const accNo = String(item?.Acc_No ?? "").toLowerCase();
      return name.includes(term) || accNo.includes(term);
    });
    setFilteredAgents(filtered);
  }, [agentSearchTerm, agents]);
  
  // Initialize agent name from agentId when agents data is loaded
  useEffect(() => {
    if (agentId && agents.length > 0 && !selectedAgent) {
      const matchingAgent = agents.find(agent => agent.Acc_No === agentId);
      if (matchingAgent) {
        setSelectedAgent(matchingAgent.Account_Name);
      }
    }
  }, [agentId, agents, selectedAgent]);
  
  // Handle agent selection
  const handleAgentSelect = (selectedAgent) => {
    setSelectedAgent(selectedAgent.Account_Name);
    setSelectedAgentId(selectedAgent.Acc_No);
    setAgentSearchTerm("");
    setShowAgentDropdown(false);
    
    // Update parent component with the selected agent
    if (onDataChange) {
      // Get the current calculation results to pass along with the agent info
      const updatedData = {
        itinerary: collapsedRows,
        options: options,
        calculationResults: calculationResults,
        agent: selectedAgent.Account_Name,
        agentId: selectedAgent.Acc_No
      };
      
      onDataChange(updatedData);
    }
  };

  // Helper to generate a new empty day row
  const createEmptyDayRow = (index) => ({
    day: `Day ${index + 1}`,
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
    // Multi-day repeat controls
    multiDayEnabled: false,
    multiDayDays: []
  });

  // Sync day cards with Program Length (nights)
  // Nights imply days = nights + 1 (arrival day). Keep existing data, add/remove as needed.
  useEffect(() => {
    const desiredDays = Math.max(1, Number(programLength || 0) + 1);

    console.log("Synchronizing itinerary rows to desired days:", { programLength, desiredDays });

    // Adjust rows length while preserving existing data
    setRows((prev) => {
      let newRows = Array.isArray(prev) ? [...prev] : [];

      if (newRows.length < desiredDays) {
        for (let i = newRows.length; i < desiredDays; i++) {
          newRows.push(createEmptyDayRow(i));
        }
      } else if (newRows.length > desiredDays) {
        newRows = newRows.slice(0, desiredDays);
      }

      // Renumber day labels to ensure sequence
      newRows = newRows.map((r, idx) => ({ ...r, day: `Day ${idx + 1}` }));

      console.log("Rows synchronized. Current days:", newRows.map(r => r.day));
      return newRows;
    });

    // Clean up optional activities when shortening
    setOptionalActivities((prev) => {
      if (!prev || typeof prev !== 'object') return {};
      const cleaned = {};
      Object.keys(prev).forEach((k) => {
        const idx = parseInt(k, 10);
        if (!isNaN(idx) && idx < desiredDays) cleaned[idx] = prev[k];
      });
      return cleaned;
    });

    // Recalculate totals as rows length affects tips, water, etc.
    debouncedForceUpdate('program_length_change');
  }, [programLength, debouncedForceUpdate]);

  // Function to determine season based on date
  const determineSeasonFromDate = useCallback((date) => {
    if (!date) return "Standard";
    
    const month = new Date(date).getMonth() + 1; // JavaScript months are 0-indexed
    
    // Define default season based on month
    if ([5, 6, 9, 10].includes(month)) {
      return "Low";
    } else if ([3, 4, 11].includes(month) || (month === 12 && new Date(date).getDate() <= 15)) {
      return "Mid";
    } else if ([1, 2, 7, 8].includes(month) || (month === 12 && new Date(date).getDate() > 15)) {
      return "High";
    } else {
      return "Standard";
    }
  }, []);
  
  // Determine season for current validity date
  const currentSeason = useMemo(() => {
    if (validityDates.length === 0 || currentValidityDate < 0) return "Standard";
    const dateRange = validityDates[currentValidityDate];
    return determineSeasonFromDate(dateRange.from);
  }, [validityDates, currentValidityDate, determineSeasonFromDate]);
  
  // Cities and stars for hotel selection
  const cities = useMemo(() => [...new Set(hotelRates.map(h => h.City))].sort(), [hotelRates]);
  const stars = useMemo(() => [...new Set(hotelRates.map(h => h.Stars))].sort(), [hotelRates]);

  // QuickHint dropdown options for itinerary segments
  const quickHintOptions = useMemo(() => {
    try {
      const qh = getTranslatedQuickHint('english') || {};
      return Object.keys(qh).sort();
    } catch (err) {
      console.error("QuickHint load error:", err);
      return [];
    }
  }, []);

  // AdditionalLocations.json options
  const addlLocationOptions = useMemo(() => {
    try {
      const raw = AdditionalLocations;
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw
          .map(x => typeof x === 'string' ? x : (x?.name || x?.label || x?.value || ''))
          .filter(Boolean);
      }
      if (typeof raw === 'object') {
        return Object.keys(raw);
      }
      return [];
    } catch (err) {
      console.error("AdditionalLocations load error:", err);
      return [];
    }
  }, []);

  // Merge QuickHint + AdditionalLocations, unique + sorted
  const itinerarySegmentOptions = useMemo(() => {
    const set = new Set([...(quickHintOptions || []), ...(addlLocationOptions || [])]);
    return Array.from(set).sort();
  }, [quickHintOptions, addlLocationOptions]);
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

  // Function to find hotel rates based on hotel, city, stars, and season
  const findHotelRates = useCallback((city, stars, hotelName, season) => {
    console.log(`Finding rates for: City=${city}, Stars=${stars}, Hotel=${hotelName}, Season=${season}`);
    
    // Debug log to track all parameters
    console.log("Parameters:", { city, stars, hotelName, season });
    
    if (!city || !stars || !hotelName || !season) {
      console.log("Missing required parameters for rate lookup");
      
      // Show error notification
      setNotification({
        show: true,
        message: `Missing required parameters for rate lookup: City=${city}, Stars=${stars}, Hotel=${hotelName}, Season=${season}`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return null;
    }
    
    // Log the number of hotel rates available and the first rate to see its structure
    console.log(`Total hotel rates available: ${hotelRates.length}`);
    console.log(`Hotel rates array type: ${typeof hotelRates}, isArray: ${Array.isArray(hotelRates)}`);
    
    if (hotelRates.length === 0) {
      console.log("❌ No hotel rates available. Try refreshing rates.");
      
      // Show error notification
      setNotification({
        show: true,
        message: 'No hotel rates available. Please refresh rates or load rates first.',
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return null;
    }
    
    console.log("First hotel rate structure:", JSON.stringify(hotelRates[0], null, 2));
    
    // Log all available rates for this hotel to help debug
    const allRatesForHotel = hotelRates.filter(rate =>
      rate.City === city &&
      rate.Stars == stars &&
      rate.Hotel === hotelName
    );
    console.log(`Found ${allRatesForHotel.length} rates for ${hotelName} in ${city} (${stars}★)`);
    
    if (allRatesForHotel.length === 0) {
      console.log("❌ No rates found for this hotel. Check hotel name, city, and stars.");
      console.log("Search parameters:", { city, stars, hotelName, season });
      
      // Log some sample rates to help debug
      const sampleRates = hotelRates.slice(0, 5);
      console.log("Sample rates from database:", sampleRates);
      
      // Try to find any hotels in this city with these stars
      const hotelsInCityWithStars = hotelRates.filter(rate =>
        rate.City === city && rate.Stars == stars
      );
      console.log(`Found ${hotelsInCityWithStars.length} hotels in ${city} with ${stars}★`);
      
      if (hotelsInCityWithStars.length > 0) {
        const hotelNames = [...new Set(hotelsInCityWithStars.map(rate => rate.Hotel))];
        console.log("Available hotels:", hotelNames);
      }
      
      // Show error notification
      setNotification({
        show: true,
        message: `No rates found for ${hotelName} in ${city} (${stars}★). Please check hotel details.`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return null;
    }
    
    if (allRatesForHotel.length > 0) {
      console.log("Available rates:", allRatesForHotel);
      
      // Log all seasons available for this hotel
      const availableSeasons = [...new Set(allRatesForHotel.map(rate => rate.Season))];
      console.log(`Available seasons for ${hotelName}: ${availableSeasons.join(', ')}`);
      
      // Log the season we're looking for
      console.log(`Looking for season: ${season}`);
    }
    
    // Find matching hotel rate - case insensitive for season
    const matchingRate = hotelRates.find(rate =>
      rate.City === city &&
      rate.Stars == stars &&
      rate.Hotel === hotelName &&
      (rate.Season.toLowerCase() === season.toLowerCase() ||
       rate.Season.toLowerCase().includes(season.toLowerCase()) ||
       season.toLowerCase().includes(rate.Season.toLowerCase()))
    );
    
    // Log the search criteria and result
    console.log("Season matching criteria:", {
      exactMatch: allRatesForHotel.some(rate => rate.Season.toLowerCase() === season.toLowerCase()),
      seasonIncludes: allRatesForHotel.some(rate => rate.Season.toLowerCase().includes(season.toLowerCase())),
      rateIncludes: allRatesForHotel.some(rate => season.toLowerCase().includes(rate.Season.toLowerCase()))
    });
    
    if (matchingRate) {
      console.log("✅ Found exact matching rate:", matchingRate);
      
      // Use the standardized Rate_DBL, Rate_SGL, Rate_HB fields that we normalized in loadHotelRates
      const dblRate = matchingRate.Rate_DBL || 0;
      const sglRate = matchingRate.Rate_SGL || 0;
      const hbRate = matchingRate.Rate_HB || 0;
      
      console.log(`DBL: ${dblRate}, SGL: ${sglRate}, HB: ${hbRate}`);
      
      // Ensure we're returning numeric values
      const result = {
        dblRate: parseFloat(dblRate) || 0,
        sglRate: parseFloat(sglRate) || 0,
        hbRate: parseFloat(hbRate) || 0
      };
      
      console.log("Returning rates:", result);
      
      // Show success notification
      setNotification({
        show: true,
        message: `Found rates for ${hotelName} in ${city} (${stars}★) for ${season} season.`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return result;
    } else {
      console.log("❌ No exact match found for the specified season");
    }
    
    // If no exact match, try to find a rate with the same hotel but different season
    const anySeasonRate = hotelRates.find(rate =>
      rate.City === city &&
      rate.Stars == stars &&
      rate.Hotel === hotelName
    );
    
    if (anySeasonRate) {
      console.log("⚠️ Found rate with different season:", anySeasonRate);
      console.log(`Using Season: ${anySeasonRate.Season} instead of ${season}`);
      
      // Use the standardized Rate_DBL, Rate_SGL, Rate_HB fields that we normalized in loadHotelRates
      const dblRate = anySeasonRate.Rate_DBL || 0;
      const sglRate = anySeasonRate.Rate_SGL || 0;
      const hbRate = anySeasonRate.Rate_HB || 0;
      
      console.log(`DBL: ${dblRate}, SGL: ${sglRate}, HB: ${hbRate}`);
      
      // Ensure we're returning numeric values
      const result = {
        dblRate: parseFloat(dblRate) || 0,
        sglRate: parseFloat(sglRate) || 0,
        hbRate: parseFloat(hbRate) || 0
      };
      
      console.log("Returning rates with fallback season:", result);
      
      // Show warning notification
      setNotification({
        show: true,
        message: `Using rates from ${anySeasonRate.Season} season for ${hotelName} (no exact match for ${season}).`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return result;
    } else {
      console.log("❌ No rates found for this hotel at all");
      
      // Show error notification
      setNotification({
        show: true,
        message: `No rates found for ${hotelName}. Please enter rates manually.`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      
      // As a fallback, return default rates
      const defaultRates = {
        dblRate: 0,
        sglRate: 0,
        hbRate: 0
      };
      
      console.log("Returning default rates:", defaultRates);
      return defaultRates;
    }
  }, [hotelRates, setNotification]);

  // Function to update rates based on automatically determined season
  const updateRatesForSeason = (optIdx, accomIdx, validityDateIndex, autoSeason, hotelName, city, stars) => {
    console.log(`🔄 updateRatesForSeason called for option ${optIdx}, accom ${accomIdx}, validity ${validityDateIndex}`);
    console.log(`Parameters: season=${autoSeason}, hotel=${hotelName}, city=${city}, stars=${stars}`);
    console.log(`🔄 Updating rates for auto-determined season ${autoSeason} for option ${optIdx}, accommodation ${accomIdx}, validity date ${validityDateIndex}`);
    
    // Show notification that rates are being updated
    setNotification({
      show: true,
      message: `Updating rates for ${autoSeason} season (auto-determined)...`,
      type: 'success'
    });
    
    // Try to find rates for this hotel and season
    console.log(`🔍 Looking up rates for: City=${city}, Stars=${stars}, Hotel=${hotelName}, Season=${autoSeason}`);
    if (!city || !stars || !hotelName) {
      console.error("❌ Missing required parameters for updateRatesForSeason");
      console.error("Parameters received:", { city, stars, hotelName, autoSeason });
      setNotification({
        show: true,
        message: 'Missing required parameters for rate lookup. Please check city, stars, and hotel selection.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      return false;
    }
    
    console.log(`Finding rates for ${city}, ${stars}★, ${hotelName}, season ${autoSeason}`);
    const rates = findHotelRates(city, stars, hotelName, autoSeason);
    console.log("Rates found:", rates);
    
    if (rates) {
      console.log(`✅ Found rates for auto-determined season: DBL=${rates.dblRate}, SGL=${rates.sglRate}, HB=${rates.hbRate}`);
      
      setOptions(prev => {
        const newOptions = JSON.parse(JSON.stringify(prev)); // Deep clone
        const accom = newOptions[optIdx]?.accommodations[accomIdx];
        
        if (!accom) {
          console.error("❌ Invalid option or accommodation index");
          return prev;
        }
        
        // Ensure validityRates exists and is an array
        if (!Array.isArray(accom.validityRates)) {
          accom.validityRates = [];
        }
        
        // Ensure the validityRates array has an entry for this index
        while (accom.validityRates.length <= validityDateIndex) {
          accom.validityRates.push({
            validityDateIndex: accom.validityRates.length,
            season: autoSeason,
            dblRate: "",
            hbRate: "",
            sglRate: ""
          });
        }
        
        // Update rates for this validity date
        // Ensure we're using numeric values by explicitly parsing
        const dblRate = parseFloat(rates.dblRate) || 0;
        const sglRate = parseFloat(rates.sglRate) || 0;
        const hbRate = parseFloat(rates.hbRate) || 0;
        
        accom.validityRates[validityDateIndex] = {
          ...accom.validityRates[validityDateIndex],
          season: autoSeason, // Use auto-determined season
          dblRate: dblRate,
          sglRate: sglRate,
          hbRate: hbRate
        };
        
        console.log(`Updated rates for validity date ${validityDateIndex} with numeric values:`, {
          dblRate,
          sglRate,
          hbRate
        });
        
        console.log(`✅ Updated rates for validity date ${validityDateIndex}:`, accom.validityRates[validityDateIndex]);
        
        // Also update the flat rate if in "By Season (Automatic)" mode
        if (rateDisplayMode === 'bySeasonAuto') {
          if (!accom.flatRate) {
            accom.flatRate = {};
          }
          
          // Ensure we're using numeric values for flat rate too
          accom.flatRate = {
            dblRate: parseFloat(rates.dblRate) || 0,
            sglRate: parseFloat(rates.sglRate) || 0,
            hbRate: parseFloat(rates.hbRate) || 0
          };
          
          console.log("✅ Updated flat rate with auto-determined season:", accom.flatRate);
        }
        
        return newOptions;
      });
      
      // Show success notification
      setNotification({
        show: true,
        message: `Rates updated for ${autoSeason} season (auto-determined)`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      
      // Use debounced force update to prevent rapid recalculations
      console.log("Rates updated, scheduling debounced recalculation");
      debouncedForceUpdate();
      
      return true;
    } else {
      console.log(`❌ No rates found for auto-determined season ${autoSeason}`);
      
      // Try with a different season as fallback
      const fallbackSeasons = ["Standard", "Low", "Mid", "High"].filter(s => s !== autoSeason);
      let fallbackRates = null;
      let fallbackSeason = null;
      
      for (const testSeason of fallbackSeasons) {
        console.log(`🔄 Trying fallback season: ${testSeason}`);
        const testRates = findHotelRates(city, stars, hotelName, testSeason);
        
        if (testRates) {
          fallbackRates = testRates;
          fallbackSeason = testSeason;
          break;
        }
      }
      
      if (fallbackRates && fallbackSeason) {
        console.log(`✅ Found rates with fallback season ${fallbackSeason}:`, fallbackRates);
        
        setOptions(prev => {
          const newOptions = JSON.parse(JSON.stringify(prev)); // Deep clone
          const accom = newOptions[optIdx]?.accommodations[accomIdx];
          
          if (!accom) {
            console.error("❌ Invalid option or accommodation index");
            return prev;
          }
          
          // Ensure validityRates exists and is an array
          if (!Array.isArray(accom.validityRates)) {
            accom.validityRates = [];
          }
          
          // Ensure the validityRates array has an entry for this index
          while (accom.validityRates.length <= validityDateIndex) {
            accom.validityRates.push({
              validityDateIndex: accom.validityRates.length,
              season: fallbackSeason,
              dblRate: "",
              hbRate: "",
              sglRate: ""
            });
          }
          
          // Update rates for this validity date with fallback season rates
          // Ensure we're using numeric values by explicitly parsing
          const dblRate = parseFloat(fallbackRates.dblRate) || 0;
          const sglRate = parseFloat(fallbackRates.sglRate) || 0;
          const hbRate = parseFloat(fallbackRates.hbRate) || 0;
          
          accom.validityRates[validityDateIndex] = {
            ...accom.validityRates[validityDateIndex],
            season: fallbackSeason, // Use fallback season
            dblRate: dblRate,
            sglRate: sglRate,
            hbRate: hbRate
          };
          
          console.log(`Updated rates with fallback season ${fallbackSeason} for validity date ${validityDateIndex} with numeric values:`, {
            dblRate,
            sglRate,
            hbRate
          });
          
          console.log(`✅ Updated rates with fallback season for validity date ${validityDateIndex}:`, accom.validityRates[validityDateIndex]);
          
          // Also update the flat rate if in "By Season (Automatic)" mode
          if (rateDisplayMode === 'bySeasonAuto') {
            if (!accom.flatRate) {
              accom.flatRate = {};
            }
            
            // Ensure we're using numeric values for flat rate too
            accom.flatRate = {
              dblRate: parseFloat(fallbackRates.dblRate) || 0,
              sglRate: parseFloat(fallbackRates.sglRate) || 0,
              hbRate: parseFloat(fallbackRates.hbRate) || 0
            };
            
            console.log("✅ Updated flat rate with fallback season:", accom.flatRate);
          }
          
          return newOptions;
        });
        
        // Show warning notification
        setNotification({
          show: true,
          message: `No rates found for auto-determined ${autoSeason} season. Using ${fallbackSeason} season rates instead.`,
          type: 'warning'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
        
        // Use debounced force update to prevent rapid recalculations
        console.log("Rates updated with fallback season, scheduling debounced recalculation");
        debouncedForceUpdate();
        
        return true;
      } else {
        console.log(`❌ No rates found for any season`);
        
        // Show error notification
        setNotification({
          show: true,
          message: `No rates found for auto-determined ${autoSeason} season or any other season. Please check hotel selection or enter rates manually.`,
          type: 'error'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
        
        return false;
      }
    }
  };

  // Auto-populate hotel rates by season for each validity period when in By Season (Automatic) mode
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (rateDisplayMode !== 'bySeasonAuto') return;
      if (!Array.isArray(validityDates) || validityDates.length === 0) return;

      try {
        // Deep clone current options
        const newOptions = JSON.parse(JSON.stringify(options));
        let changed = false;

        for (let optIdx = 0; optIdx < newOptions.length; optIdx++) {
          const opt = newOptions[optIdx];
          if (!opt || !Array.isArray(opt.accommodations)) continue;

          for (let aIdx = 0; aIdx < opt.accommodations.length; aIdx++) {
            const accom = opt.accommodations[aIdx];
            if (!accom || !accom.city || !accom.stars || !accom.hotelName) continue;

            if (!Array.isArray(accom.validityRates)) {
              accom.validityRates = [];
              changed = true;
            }

            // Ensure validityRates length matches validity windows
            if (accom.validityRates.length !== validityDates.length) {
              accom.validityRates = validityDates.map((_, i) => ({
                validityDateIndex: i,
                season: "Standard",
                dblRate: 0,
                hbRate: 0,
                sglRate: 0
              }));
              changed = true;
            }

            for (let vIdx = 0; vIdx < validityDates.length; vIdx++) {
              const dateRange = validityDates[vIdx];

              // Prefer hotel-specific seasonality (HotelRatesEntry) via determineSeason, fallback to month heuristic
              let season = "Standard";
              try {
                season = await determineSeason(dateRange.from, dateRange.to, accom.hotelName);
              } catch (_) {
                season = determineSeasonFromDate(dateRange.from);
              }

              // Lookup rates from hotelRates dataset
              const rates = findHotelRates(accom.city, accom.stars, accom.hotelName, season) || { dblRate: 0, hbRate: 0, sglRate: 0 };
              const current = accom.validityRates[vIdx] || {};

              const next = {
                validityDateIndex: vIdx,
                season,
                dblRate: parseFloat(rates.dblRate) || 0,
                hbRate: parseFloat(rates.hbRate) || 0,
                sglRate: parseFloat(rates.sglRate) || 0
              };

              // Only write if something changed to avoid render loops
              if (
                current.season !== next.season ||
                (parseFloat(current.dblRate) || 0) !== next.dblRate ||
                (parseFloat(current.hbRate) || 0) !== next.hbRate ||
                (parseFloat(current.sglRate) || 0) !== next.sglRate
              ) {
                accom.validityRates[vIdx] = next;
                changed = true;
              }
            }
          }
        }

        if (!cancelled && changed) {
          setOptions(newOptions);
          debouncedForceUpdate('auto_populate_by_season');
          setNotification({
            show: true,
            message: 'Rates auto-populated by season from Hotel Rates for all validity periods.',
            type: 'success'
          });
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
          }, 2500);
        }
      } catch (err) {
        console.error('Auto population by season failed:', err);
      }
    };

    run();
    return () => { cancelled = true; };
    // Re-run when validity windows change, or rate dataset is refreshed, or when switching into auto mode
  }, [rateDisplayMode, validityDates, hotelRates, options]);
  // Handle accommodation changes
  const handleAccomChange = (optIdx, accomIdx, field, value, validityDateIndex = -1) => {
    console.log(`Accommodation change: option=${optIdx}, accom=${accomIdx}, field=${field}, value=${value}, validityIndex=${validityDateIndex}`);
    
    // Season is now auto-determined, so we don't need to handle manual season changes
    
    setOptions(prev =>
      prev.map((option, oIdx) => {
        if (oIdx !== optIdx) return option;
        
        return {
          ...option,
          accommodations: option.accommodations.map((accom, aIdx) => {
            if (aIdx !== accomIdx) return accom;

            // If updating a field for a specific validity date
            if (validityDateIndex >= 0) {
              const newValidityRates = [...accom.validityRates];
              newValidityRates[validityDateIndex] = {
                ...newValidityRates[validityDateIndex],
                [field]: value
              };
              
              return {
                ...accom,
                validityRates: newValidityRates
              };
            }
            
            // If updating a general field (not specific to a validity date)
            const newAccom = { ...accom, [field]: value };

            if (field === 'city' || field === 'stars') {
              newAccom.hotelName = '';
              
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
              
              // Update seasons for all validity dates - always determine automatically
              if (validityDates.length > 0) {
                newAccom.validityRates = validityDates.map((dateRange, idx) => {
                  const autoSeason = determineSeasonFromDate(dateRange.from);
                  console.log(`Auto-determining season for ${dateRange.from}: ${autoSeason}`);
                  return {
                    validityDateIndex: idx,
                    season: autoSeason,
                    dblRate: "",
                    hbRate: "",
                    sglRate: ""
                  };
                });
              }
            } else if (field === 'hotelName') {
              console.log(`🏨 Hotel changed to ${value} for accommodation ${accomIdx} in option ${optIdx}`);
              
              if (rateDisplayMode === 'bySeasonAuto') {
                setNotification({
                  show: true,
                  message: 'Hotel selected. Auto-populating rates by season for all validity periods...',
                  type: 'success'
                });
                return newAccom;
              }
              // Don't auto-populate rates when hotel is selected
              // Instead, show a notification that manual rate refresh is needed
              setNotification({
                show: true,
                message: 'Hotel selected. Rates are not auto-loaded; enter rates manually or ensure hotel rate data is available.',
                type: 'info'
              });
              
              // Don't automatically populate rates for validity dates
              if (validityDates.length > 0 && accom.city && accom.stars) {
                console.log(`Hotel selected but not auto-populating rates. Manual refresh required.`);
                
                // Ensure validityRates exists and is an array
                const existingValidityRates = Array.isArray(accom.validityRates) ? accom.validityRates : [];
                const newValidityRates = [...existingValidityRates];
                let ratesFound = false;
                let ratesPopulated = 0;
                
                try {
                  // Make sure newValidityRates has an entry for each validity date
                  while (newValidityRates.length < validityDates.length) {
                    newValidityRates.push({
                      validityDateIndex: newValidityRates.length,
                      season: "Standard",
                      dblRate: "",
                      hbRate: "",
                      sglRate: ""
                    });
                  }
                  
                  // Initialize flat rate object if it doesn't exist
                  if (!newAccom.flatRate) {
                    newAccom.flatRate = {
                      dblRate: "",
                      hbRate: "",
                      sglRate: ""
                    };
                  }
                  
                  // Create a copy of validityDates to avoid async issues
                  const validityDatesCopy = [...validityDates];
                  
                  // Process each validity date sequentially with a small delay to avoid race conditions
                  const processValidityDates = async () => {
                    for (let idx = 0; idx < validityDatesCopy.length; idx++) {
                      const dateRange = validityDatesCopy[idx];
                      
                      // Update notification to show progress
                      setNotification({
                        show: true,
                        message: `Populating rates: ${idx + 1}/${validityDatesCopy.length} validity periods...`,
                        type: 'success'
                      });
                      
                      // Ensure this index exists in newValidityRates
                      if (!newValidityRates[idx]) {
                        newValidityRates[idx] = {
                          validityDateIndex: idx,
                          season: "Standard",
                          dblRate: "",
                          hbRate: "",
                          sglRate: ""
                        };
                      }
                      
                      // Determine season using hotel-specific seasonality when available
                      let season = "Standard";
                      try {
                        season = await determineSeason(dateRange.from, dateRange.to, value);
                        console.log(`Automatically determined season for hotel ${value} and dates ${dateRange.from} to ${dateRange.to}: ${season}`);
                      } catch (err) {
                        console.warn("determineSeason failed, falling back to month-based heuristic", err);
                        season = determineSeasonFromDate(dateRange.from);
                      }
                        
                      console.log(`🔍 Looking up rates for validity date ${idx}, season: ${season}`);
                      
                      // Try to find rates for this hotel and auto-determined season
                      console.log(`Looking up rates for hotel ${value} with auto-determined season ${season}`);
                      
                      // IMPORTANT: Use the current accom values, not the ones from the closure
                      // This ensures we're using the most up-to-date values
                      // IMPORTANT: Use the current accom values, not the ones from the closure
                      // This ensures we're using the most up-to-date values
                      const rates = findHotelRates(accom.city, accom.stars, value, season);
                      console.log(`Rates found for ${value}, season ${season}:`, rates);
                      
                      // Debug log to verify rate values
                      if (rates) {
                        console.log(`Rate values (before conversion): DBL=${rates.dblRate}, SGL=${rates.sglRate}, HB=${rates.hbRate}`);
                        console.log(`Rate values (after conversion): DBL=${parseFloat(rates.dblRate) || 0}, SGL=${parseFloat(rates.sglRate) || 0}, HB=${parseFloat(rates.hbRate) || 0}`);
                      }
                      
                      if (rates) {
                        console.log(`✅ Found rates for validity date ${idx}:`, rates);
                        ratesPopulated++;
                        
                        // Preserve original string values if they exist
                        const dblRate = rates.dblRate !== undefined ? rates.dblRate : "";
                        const sglRate = rates.sglRate !== undefined ? rates.sglRate : "";
                        const hbRate = rates.hbRate !== undefined ? rates.hbRate : "";
                        
                        newValidityRates[idx] = {
                          ...newValidityRates[idx],
                          validityDateIndex: idx,
                          season: season, // Ensure season is set
                          dblRate: dblRate,
                          sglRate: sglRate,
                          hbRate: hbRate
                        };
                        
                        console.log(`Updated rates for validity date ${idx} with numeric values:`, {
                          dblRate,
                          sglRate,
                          hbRate
                        });
                        
                        console.log(`Updated rates for validity date ${idx}:`, newValidityRates[idx]);
                        console.log(`DBL: ${rates.dblRate}, SGL: ${rates.sglRate}, HB: ${rates.hbRate}`);
                        
                        // If this is the first validity date with rates, use it to populate the flat rate
                        if (ratesFound === false) {
                          // Ensure we're using numeric values for flat rate too
                          newAccom.flatRate = {
                            dblRate: rates.dblRate !== undefined ? rates.dblRate : "",
                            sglRate: rates.sglRate !== undefined ? rates.sglRate : "",
                            hbRate: rates.hbRate !== undefined ? rates.hbRate : ""
                          };
                          console.log("Updated flat rate:", newAccom.flatRate);
                        }
                        
                        ratesFound = true;
                      } else {
                        console.log(`⚠️ No rates found for validity date ${idx}, season: ${season}`);
                        
                        // Try with a different season as fallback
                        const fallbackSeasons = ["Standard", "Low", "Mid", "High"].filter(s => s !== season);
                        let fallbackRates = null;
                        
                        for (const fallbackSeason of fallbackSeasons) {
                          console.log(`🔄 Trying fallback season: ${fallbackSeason}`);
                          fallbackRates = findHotelRates(accom.city, accom.stars, value, fallbackSeason);
                          
                          if (fallbackRates) {
                            console.log(`✅ Found rates with fallback season ${fallbackSeason}:`, fallbackRates);
                            ratesPopulated++;
                            
                            // Preserve original string values if they exist
                            const dblRate = fallbackRates.dblRate !== undefined ? fallbackRates.dblRate : "";
                            const sglRate = fallbackRates.sglRate !== undefined ? fallbackRates.sglRate : "";
                            const hbRate = fallbackRates.hbRate !== undefined ? fallbackRates.hbRate : "";
                            
                            newValidityRates[idx] = {
                              ...newValidityRates[idx],
                              validityDateIndex: idx,
                              season: fallbackSeason, // Use the fallback season that worked
                              dblRate: dblRate,
                              sglRate: sglRate,
                              hbRate: hbRate
                            };
                            
                            console.log(`Updated rates with fallback season ${fallbackSeason} for validity date ${idx} with numeric values:`, {
                              dblRate,
                              sglRate,
                              hbRate
                            });
                            
                            console.log(`Updated rates with fallback season ${fallbackSeason} for validity date ${idx}:`, newValidityRates[idx]);
                            
                            // If this is the first validity date with rates, use it to populate the flat rate
                            if (ratesFound === false) {
                              // Ensure we're using numeric values for flat rate too
                              newAccom.flatRate = {
                                dblRate: fallbackRates.dblRate !== undefined ? fallbackRates.dblRate : "",
                                sglRate: fallbackRates.sglRate !== undefined ? fallbackRates.sglRate : "",
                                hbRate: fallbackRates.hbRate !== undefined ? fallbackRates.hbRate : ""
                              };
                              console.log("Updated flat rate with fallback season:", newAccom.flatRate);
                            }
                            
                            ratesFound = true;
                            break;
                          }
                        }
                        
                        if (!fallbackRates) {
                          console.log(`❌ No rates found for any season for validity date ${idx}`);
                          // Ensure we have a valid object even when no rates are found
                          newValidityRates[idx] = {
                            ...newValidityRates[idx],
                            validityDateIndex: idx,
                            season: season
                          };
                        }
                      }
                      
                      // Small delay to avoid race conditions
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // After processing all validity dates, update the state
                    setOptions(currentOptions => {
                      console.log("Updating options state with processed validity rates");
                      const updatedOptions = JSON.parse(JSON.stringify(currentOptions)); // Deep clone to ensure state update
                      if (updatedOptions[optIdx] && updatedOptions[optIdx].accommodations[accomIdx]) {
                        // Preserve original values without forced conversion to numbers
                        const preservedValidityRates = newValidityRates.map(rate => ({
                          ...rate,
                          dblRate: rate.dblRate !== undefined ? rate.dblRate : "",
                          sglRate: rate.sglRate !== undefined ? rate.sglRate : "",
                          hbRate: rate.hbRate !== undefined ? rate.hbRate : ""
                        }));
                        
                        updatedOptions[optIdx].accommodations[accomIdx].validityRates = preservedValidityRates;
                        updatedOptions[optIdx].accommodations[accomIdx].flatRate = {
                          dblRate: newAccom.flatRate.dblRate !== undefined ? newAccom.flatRate.dblRate : "",
                          sglRate: newAccom.flatRate.sglRate !== undefined ? newAccom.flatRate.sglRate : "",
                          hbRate: newAccom.flatRate.hbRate !== undefined ? newAccom.flatRate.hbRate : ""
                        };
                        console.log("Updated validity rates:", updatedOptions[optIdx].accommodations[accomIdx].validityRates);
                        
                        // Log each validity rate to verify rates are populated
                        newValidityRates.forEach((rate, idx) => {
                          console.log(`Validity rate ${idx}:`, rate);
                          console.log(`DBL: ${rate.dblRate}, SGL: ${rate.sglRate}, HB: ${rate.hbRate}`);
                        });
                      }
                      return updatedOptions;
                    });
                    
                    // Use debounced force update to prevent rapid recalculations
                    console.log("Validity rates updated, scheduling debounced recalculation");
                    debouncedForceUpdate();
                    
                    if (ratesFound) {
                      console.log(`✅ Successfully populated rates for ${ratesPopulated} out of ${validityDatesCopy.length} validity dates`);
                      
                      // Show success notification
                      setNotification({
                        show: true,
                        message: `Rates populated for ${ratesPopulated} out of ${validityDatesCopy.length} validity periods!`,
                        type: 'success'
                      });
                      
                      // Hide notification after 3 seconds
                      setTimeout(() => {
                        setNotification(prev => ({ ...prev, show: false }));
                      }, 3000);
                      
                      // Use debounced force update to prevent rapid recalculations
                      console.log("Hotel selected and rates updated, scheduling debounced recalculation");
                      debouncedForceUpdate();
                    } else {
                      console.log("❌ Failed to populate any rates");
                      
                      // Show error notification
                      setNotification({
                        show: true,
                        message: 'No rates found for this hotel. Please try another hotel or enter rates manually.',
                        type: 'error'
                      });
                      
                      // Hide notification after 5 seconds
                      setTimeout(() => {
                        setNotification(prev => ({ ...prev, show: false }));
                      }, 5000);
                    }
                  };
                  
                  // Start processing validity dates
                  processValidityDates().catch(error => {
                    console.error("Error in processValidityDates:", error);
                    setNotification({
                      show: true,
                      message: `Error processing validity dates: ${error.message}`,
                      type: 'error'
                    });
                    
                    setTimeout(() => {
                      setNotification(prev => ({ ...prev, show: false }));
                    }, 5000);
                  });
                  
                  // Set the validityRates immediately to show progress
                  newAccom.validityRates = [...newValidityRates]; // Use spread operator to create a new array
                  
                  // Log the current state of validityRates for debugging
                  console.log("Initial validityRates set:", newAccom.validityRates);
                } catch (error) {
                  console.error("Error while populating rates:", error);
                  // Ensure we have a valid validityRates array even if an error occurs
                  newAccom.validityRates = validityDates.map((_, index) => ({
                    validityDateIndex: index,
                    season: "Standard",
                    dblRate: "",
                    hbRate: "",
                    sglRate: ""
                  }));
                  
                  // Show error notification
                  setNotification({
                    show: true,
                    message: `Error populating rates: ${error.message}. Please try again.`,
                    type: 'error'
                  });
                  
                  // Hide notification after 5 seconds
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, show: false }));
                  }, 5000);
                }
              } else if (!validityDates.length) {
                console.log("⚠️ No validity dates defined, skipping rate population");
                setNotification({
                  show: true,
                  message: 'No validity dates defined. Please add validity dates first.',
                  type: 'warning'
                });
                
                setTimeout(() => {
                  setNotification(prev => ({ ...prev, show: false }));
                }, 3000);
              } else if (!accom.city || !accom.stars) {
                console.log("⚠️ Missing city or stars, skipping rate population");
                setNotification({
                  show: true,
                  message: 'Please select city and stars before selecting a hotel.',
                  type: 'warning'
                });
                
                setTimeout(() => {
                  setNotification(prev => ({ ...prev, show: false }));
                }, 3000);
              }
            }
            
            return newAccom;
          })
        };
      })
    );
  };
  
  // Add accommodation to an option
  const addAccommodation = (optIdx) => {
    setOptions(prev => {
      const newOptions = [...prev];
      
      // Create new accommodation with rates for each validity date
      const newAccom = {
        ...initialAccommodation,
        validityRates: validityDates.length > 0
          ? validityDates.map((dateRange, index) => ({
              validityDateIndex: index,
              season: determineSeasonFromDate(dateRange.from),
              dblRate: "",
              hbRate: "",
              sglRate: ""
            }))
          : [],
        flatRate: {
          dblRate: "",
          hbRate: "",
          sglRate: ""
        }
      };
      
      newOptions[optIdx].accommodations.push(newAccom);
      return newOptions;
    });
  };

  // Remove accommodation from an option
  const removeAccommodation = (optIdx, accomIdx) => {
    setOptions(prev => {
      const newOptions = [...prev];
      newOptions[optIdx].accommodations.splice(accomIdx, 1);
      return newOptions;
    });
  };

  // Determine vehicle type based on pax count
  const getVehicleType = useCallback((pax) => {
    if (pax <= 2) return "Sedan";
    if (pax <= 6) return "Van";
    if (pax <= 14) return "Minibus";
    if (pax <= 24) return "Midibus";
    if (pax <= 35) return "Bus 35";
    if (pax <= 45) return "Bus 45";
    return "Bus 50";
  }, []);

  // Calculate number of jeeps needed based on pax count
  const getJeepCount = useCallback((pax) => {
    // Each jeep can accommodate up to 5 passengers
    return Math.ceil(pax / 5);
  }, []);

  // Calculate transport costs
  const calculateTransportTotal = useCallback((pax) => {
    console.log(`Calculating transport total for ${pax} pax`);
    const veh = getVehicleType(pax);
    console.log(`Vehicle type: ${veh}`);
    console.log(`Transport rates:`, transportRates);
    
    // Check if transportRates is properly loaded
    if (!transportRates || Object.keys(transportRates).length === 0) {
      console.error("Transport rates not loaded or empty. Please check transportRates.json");
      return 0;
    }
    
    let total = rows.reduce((acc, r) => {
      const svc = r.transportType?.trim();
      console.log(`Service: ${svc}, Vehicle: ${veh}`);
      
      let dayCost = 0;
      if (svc && transportRates[svc] && transportRates[svc][veh]) {
        dayCost = parseFloat(transportRates[svc][veh]) || 0;
        console.log(`Found rate for ${svc} with ${veh}: ${dayCost}`);
      } else {
        console.log(`No rate found for ${svc} with ${veh}`);
        // If specific vehicle type not found, try to use a fallback vehicle type
        if (svc && transportRates[svc]) {
          const availableVehicles = Object.keys(transportRates[svc]);
          if (availableVehicles.length > 0) {
            // Use the first available vehicle as fallback
            const fallbackVeh = availableVehicles[0];
            dayCost = parseFloat(transportRates[svc][fallbackVeh]) || 0;
            console.log(`Using fallback vehicle ${fallbackVeh}: ${dayCost}`);
          }
        }
      }
      
      // Add driver accommodation cost if checked for this day (21.16 USD)
      if (r.driverAcc) {
        dayCost += 21.16;
        console.log(`Added driver accommodation cost: ${dayCost}`);
      }
      
      console.log(`Day cost: ${dayCost}`);
      return acc + dayCost;
    }, 0);
    
    console.log(`Total before discount: ${total}`);
    
    // Apply transportation discount if provided
    if (transportationDiscount > 0) {
      const discountedTotal = total * (1 - (transportationDiscount / 100));
      console.log(`Applied ${transportationDiscount}% discount: ${discountedTotal}`);
      return discountedTotal;
    }
    
    console.log(`Final transport total: ${total}`);
    return total;
  }, [rows, transportRates, transportationDiscount, getVehicleType]);

  // Calculate entrance fees cost with better error handling and fallbacks
  const calculateEntranceCost = useCallback(() => {
    console.log("Calculating entrance costs with fees:", fees.length);
    
    // Get all selected entrances from all rows
    const allEntrances = rows.flatMap(r => r.entrances || []);
    console.log(`Total selected entrances: ${allEntrances.length}`, allEntrances);
    
    if (allEntrances.length === 0) {
      console.log("No entrances selected, returning 0");
      return 0;
    }
    
    // Calculate the total cost with better error handling
    let entranceCost = 0;
    let entrancesFound = 0;
    
    allEntrances.forEach(entranceName => {
      // Find the fee for this entrance
      const fee = fees.find(e => e["Travco Jordan"] === entranceName);
      
      if (fee && fee["__1"]) {
        try {
          const feeAmount = parseFloat(fee["__1"]);
          if (!isNaN(feeAmount)) {
            entranceCost += feeAmount;
            entrancesFound++;
            console.log(`Found fee for ${entranceName}: $${feeAmount.toFixed(2)}`);
          } else {
            console.warn(`Invalid fee amount for ${entranceName}: ${fee["__1"]}`);
            // Try to use a hardcoded fallback for common entrances
            if (entranceName === "Petra") {
              entranceCost += 50;
              console.log("Using fallback fee for Petra: $50.00");
            } else if (entranceName === "Jerash") {
              entranceCost += 14;
              console.log("Using fallback fee for Jerash: $14.00");
            } else if (entranceName === "Wadi Rum") {
              entranceCost += 7;
              console.log("Using fallback fee for Wadi Rum: $7.00");
            }
          }
        } catch (error) {
          console.error(`Error processing fee for ${entranceName}:`, error);
        }
      } else {
        console.warn(`No fee found for entrance: ${entranceName}`);
        // Try to use a hardcoded fallback for common entrances
        if (entranceName === "Petra") {
          entranceCost += 50;
          console.log("Using fallback fee for Petra: $50.00");
        } else if (entranceName === "Jerash") {
          entranceCost += 14;
          console.log("Using fallback fee for Jerash: $14.00");
        } else if (entranceName === "Wadi Rum") {
          entranceCost += 7;
          console.log("Using fallback fee for Wadi Rum: $7.00");
        }
      }
    });
    
    console.log(`Total entrance cost: $${entranceCost.toFixed(2)} (found ${entrancesFound} of ${allEntrances.length} entrances)`);
    return entranceCost;
  }, [rows, fees]);

  // Calculate jeep service cost
  const calculateJeepCost = useCallback((pax) => {
    return rows.reduce((a, r) => {
      if (r.jeep && r.jeepService) {
        const fee = fees.find(e => e["Travco Jordan"] === r.jeepService);
        if (fee) {
          const baseFee = Number(fee["__1"] || 0);
          const jeepCount = getJeepCount(pax);
          return a + (baseFee * jeepCount);
        }
      }
      return a;
    }, 0);
  }, [rows, fees, getJeepCount]);

  // Restaurant helpers and meal cost (region- and pax-aware)
  const getRestaurantsByRegionAndMeal = useCallback((regions, mealType, paxValue) => {
    if (!Array.isArray(restaurantData) || restaurantData.length === 0) return [];
    const targetType = mealType?.toLowerCase().includes("dinner") ? "dinner" : "lunch";
    const pax = parseInt(paxValue || selectedPaxRanges?.[0] || 0, 10);

    return restaurantData.filter(r =>
      r.itemType === targetType &&
      (regions?.length ? regions.includes(r.region) : true) &&
      (!pax || (pax >= (r.minPax || 1) && pax <= (r.maxPax || 999)))
    );
  }, [restaurantData, selectedPaxRanges]);

  const extractRegionsFromItinerary = useCallback((itineraryText) => {
    if (!itineraryText) return [];
    const uniqueRegions = Array.from(new Set((restaurantData || []).map(r => r.region).filter(Boolean)));
    const lower = itineraryText.toLowerCase();
    const regions = uniqueRegions.filter(region => lower.includes(region.toLowerCase()));
    return regions.length ? regions : uniqueRegions;
  }, [restaurantData]);

  // Calculate meal costs - use exact restaurant prices only (no defaults)
  const calculateMealCost = useCallback(() => {
    return rows.reduce((a, r) => {
      if (!r.mealIncluded) return a;

      if (r.mealType === "Lunch" && r.lunchRestaurant) {
        return a + (Number(r.lunchPriceUSD) || 0);
      } else if (r.mealType === "Dinner" && r.dinnerRestaurant) {
        return a + (Number(r.dinnerPriceUSD) || 0);
      } else if (r.mealType === "Lunch & Dinner") {
        const lunchPrice = r.lunchRestaurant ? (Number(r.lunchPriceUSD) || 0) : 0;
        const dinnerPrice = r.dinnerRestaurant ? (Number(r.dinnerPriceUSD) || 0) : 0;
        return a + lunchPrice + dinnerPrice;
      }
      return a;
    }, 0);
  }, [rows]);

  // Calculate extras cost
  const calculateExtrasCost = useCallback((pax) => {
    return rows.reduce((a, r) => {
      if (!r.extras || r.extras.length === 0) return a;
      
      let dayExtrasTotal = 0;
      r.extras.forEach(extraName => {
        const extraCost = extrasCosts[extraName] || 0;
        if (extraCost > 0) {
          dayExtrasTotal += extraCost * pax;
        }
      });
      
      return a + dayExtrasTotal;
    }, 0);
  }, [rows, extrasCosts]);

  // Function to check if any day has the Guide AQB - AMMAN Transport extra
  const hasGuideAqbAmmanTransport = useCallback(() => {
    return rows.some(row =>
      row.extras && row.extras.includes("Guide AQB - AMMAN Transport")
    );
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

      // Identify Jerash and Petra days
      const jerashDayIdxs = [];
      const petraDayIdxs = [];
      rows.forEach((row, idx) => {
        const it = (row.itinerary || "").toLowerCase();
        if (it.includes("jerash")) jerashDayIdxs.push(idx);
        if (it.includes("petra")) petraDayIdxs.push(idx);
      });

      // Determine private-guide mandated days by rule
      const privateDays = new Set();

      // User-selected private guide days
      rows.forEach((row, idx) => {
        if (row.guideRequired) privateDays.add(idx);
      });

      // Petra: 6+ PAX => private guide present on Petra days
      if (paxInt >= 6) {
        petraDayIdxs.forEach(idx => privateDays.add(idx));
      }

      // Jerash: 6–10 and 11+ PAX => private guide present on Jerash days
      if (paxInt >= 6) {
        jerashDayIdxs.forEach(idx => privateDays.add(idx));
      }

      // Private guide JOD total based on count of private days
      const lang = guideLanguage || "English";
      const perDayPrivateJod = privateRates[lang] || 0;
      let privateGuideJod = 0;

      privateDays.forEach(idx => {
        privateGuideJod += perDayPrivateJod;
        if (rows[idx]?.accNights) {
          privateGuideJod += privateRates.AccNights || 0;
        }
      });

      // Local guide JOD total applies ONLY to Petra/Jerash, per day
      let localGuideJod = 0;

      // Petra rules
      if (paxInt <= 5) {
        // Private optional, not required; if no private day on Petra, use 1 local guide (50 JOD per group per visit)
        petraDayIdxs.forEach(idx => {
          if (!privateDays.has(idx)) {
            localGuideJod += 50;
          }
        });
      }
      // 6+ => private present; no Petra local guide needed

      // Jerash rules
      if (paxInt <= 5) {
        // Private optional; if no private day on Jerash, use 1 local guide (30 JOD per group per visit)
        jerashDayIdxs.forEach(idx => {
          if (!privateDays.has(idx)) {
            localGuideJod += 30;
          }
        });
      } else if (paxInt >= 6 && paxInt <= 10) {
        // Private present; no local guide needed
      } else if (paxInt >= 11) {
        // Private present; additional local guides required by size:
        // 11–20: 1 (10 JOD), 21–30: 2 (20 JOD), 31–40: 3 (30 JOD), etc.
        const numLocalGuides = Math.ceil((paxInt - 10) / 10);
        const perJerashDayJod = numLocalGuides * 10;
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

  // Calculate tips and portages based on program length and pax count
  const calculateTipsAndPortages = useCallback((pax) => {
    // Fixed per-person, once per program
    const p = parseInt(pax, 10) || 0;
    if (p <= 0) return 0;
    if (p === 1) return 20;
    if (p <= 3) return 10;
    return 5; // 4+ pax
  }, []);
  
  // Calculate bank commission
  const calculateBankCommission = useCallback((pax) => {
    // Same tiers as tips/portages, fixed per-person once per program
    const p = parseInt(pax, 10) || 0;
    if (p <= 0) return 0;
    if (p === 1) return 20;
    if (p <= 3) return 10;
    return 5; // 4+ pax
  }, []);
  
  // Calculate water cost
  const calculateWaterCost = useCallback((pax) => {
    // Flat water cost per person for the whole program
    const programNights = rows.length > 0 ? Math.max(0, rows.length - 1) : 0;
    const perPerson = programNights <= 7 ? 3 : 4; // USD per person (once per program)
    const totalWaterCost = (parseInt(pax, 10) || 0) * perPerson;
    console.log(`Water Cost: ${pax} pax × $${perPerson} per person (program nights: ${programNights}) = ${totalWaterCost} USD`);
    return totalWaterCost;
  }, [rows]);

  // Calculate option cost
  const calculateOptionCost = useCallback((opt, pax, validityDateIndex = 0) => {
    console.log(`\n🧮 CALCULATING COST for validity date ${validityDateIndex}, pax: ${pax}, mode: ${rateDisplayMode}`);
    console.log(`Option accommodations:`, opt.accommodations);
    
    if (!pax || pax <= 0) {
      console.log("❌ Invalid pax count, returning 0");
      return 0;
    }
    
    let totalOptionCost = 0;
    let baseCostsTotal = 0;
    let accommodationCostsTotal = 0;
    
    console.log(`Starting calculation with totalOptionCost = ${totalOptionCost}`);
    
    try {
      // Calculate base costs that apply to all options
      const transportTotal = calculateTransportTotal(pax);
      // Convert entrance fees from JOD to USD per person
      const entrancePerPerson = calculateEntranceCost() * JOD_TO_USD;
      const jeepTotal = calculateJeepCost(pax);
      const mealPerPerson = calculateMealCost();
      const extrasTotal = calculateExtrasCost(pax);
      const selectedLang = guideData[String(pax)] || guideData[String(selectedPaxRanges?.[0])] || "English";
      const { localGuideUSD, privateGuideUSD } = calculateGuideCosts(pax, "Private", selectedLang);
      const tipsTotal = calculateTipsAndPortages(pax);
      const waterTotal = waterIncluded ? calculateWaterCost(pax) : 0;
      
      // Convert group totals to per-person amounts where applicable
      const transportPerPerson = pax > 0 ? transportTotal / pax : 0;
      const jeepPerPerson = pax > 0 ? jeepTotal / pax : 0;
      const extrasPerPerson = pax > 0 ? extrasTotal / pax : 0;
      const localGuidePerPerson = pax > 0 ? localGuideUSD / pax : 0;
      const privateGuidePerPerson = pax > 0 ? privateGuideUSD / pax : 0;
      const tipsPerPerson = pax > 0 ? tipsTotal / pax : 0;
      const waterPerPerson = pax > 0 ? waterTotal / pax : 0;
      
      // Build per-person base costs
      const baseCosts = transportPerPerson + entrancePerPerson + jeepPerPerson + mealPerPerson + extrasPerPerson +
                        localGuidePerPerson + privateGuidePerPerson + tipsPerPerson +
                        (waterIncluded ? waterPerPerson : 0);
      
      console.log(`Base costs breakdown:
        - Transport (total): ${transportTotal.toFixed(2)}
        - Transport (per person): ${transportPerPerson.toFixed(2)}
        - Entrances (per person): ${entrancePerPerson.toFixed(2)}
        - Jeep (per person): ${jeepPerPerson.toFixed(2)}
        - Meals (per person): ${mealPerPerson.toFixed(2)}
        - Extras (per person): ${extrasPerPerson.toFixed(2)}
        - Local Guide (per person): ${localGuidePerPerson.toFixed(2)}
        - Private Guide (per person): ${privateGuidePerPerson.toFixed(2)}
        - Tips & Portages (per person): ${tipsPerPerson.toFixed(2)}
        - Water (per person): ${waterIncluded ? waterPerPerson.toFixed(2) : "0.00"}
        Total Base Costs (per person): ${baseCosts.toFixed(2)}
      `);
      
            // Store base costs separately - we'll add accommodation costs later
            // baseCosts represents PER-PERSON base costs; keep a copy for return value
            baseCostsTotal = baseCosts;
      
      // Initialize accommodation costs
      let totalAccommodationCost = 0;
      
      // Log the number of accommodations being calculated
      console.log(`📋 Processing ${opt.accommodations?.length || 0} accommodations for this option`);
      
      // Ensure accommodations is an array
      const accommodations = Array.isArray(opt.accommodations) ? opt.accommodations : [];
      
      accommodations.forEach((accom, accomIndex) => {
        if (!accom) {
          console.log(`Skipping undefined accommodation at index ${accomIndex}`);
          return;
        }
        
        console.log(`\n🏨 Accommodation ${accomIndex + 1}: ${accom.hotelName || 'Unnamed'}`);
        
        const nights = Number(accom.nights) || 1;
        console.log(`Nights: ${nights}`);
        
        let dblRate, sglRate, hbRate, season;
        
        // Determine which rates to use based on the rate display mode
        if (rateDisplayMode === 'byFlatRate' && accom.flatRate) {
          // Use flat rates for all validity dates
          console.log(`Using flat rates for all validity dates`);
          
          // Ensure we're using numeric values with explicit parsing and debug logging
          dblRate = parseFloat(accom.flatRate.dblRate) || 0;
          sglRate = parseFloat(accom.flatRate.sglRate) || 0;
          hbRate = parseFloat(accom.flatRate.hbRate) || 0;
          season = "Flat Rate";
          
          console.log(`Parsed flat rate values:`, {
            dblRate,
            sglRate,
            hbRate,
            originalDblRate: accom.flatRate.dblRate,
            originalSglRate: accom.flatRate.sglRate,
            originalHbRate: accom.flatRate.hbRate
          });
        } else {
          // Use rates specific to the validity date
          // Ensure validityRates exists and is an array
          const validityRates = Array.isArray(accom.validityRates) ? accom.validityRates : [];
          
          console.log(`Validity rates for accommodation ${accomIndex}:`, validityRates);
          
          // Get rates for the specified validity date with safety checks
          const validityRate = validityRates.length > validityDateIndex && validityRates[validityDateIndex]
            ? validityRates[validityDateIndex]
            : { season: "Standard", dblRate: 0, hbRate: 0, sglRate: 0 };
            
          console.log(`Using validity rate for index ${validityDateIndex}:`, validityRate);
          
          // Get the season from the validity rate
          season = validityRate.season || "Standard";
          
          // Use the rates from the validity rate with proper number conversion
          // Use the original values without forced conversion to numbers
          dblRate = validityRate.dblRate !== undefined ? validityRate.dblRate : "";
          sglRate = validityRate.sglRate !== undefined ? validityRate.sglRate : "";
          hbRate = validityRate.hbRate !== undefined ? validityRate.hbRate : "";
          
          console.log(`Using rates for validity date ${validityDateIndex}, season: ${season}`);
          console.log(`Parsed rate values for validity date ${validityDateIndex}:`, {
            dblRate,
            sglRate,
            hbRate,
            originalDblRate: validityRate.dblRate,
            originalSglRate: validityRate.sglRate,
            originalHbRate: validityRate.hbRate
          });
        }
      
      // Log detailed rate information
      console.log(`📊 Rate details for ${accom.city || 'Unknown City'}, ${accom.stars || 'Unknown Stars'}★, Season: ${season}`);
      console.log(`  - DBL B/B Rate: ${dblRate}`);
      console.log(`  - SGL Rate: ${sglRate}`);
      console.log(`  - H/B Supplement: ${hbRate}`);
      console.log(`  - Board Type: ${accom.board}`);
      
      let costPerPerson = 0;
      switch (accom.board) {
        case "B/B":
          costPerPerson = parseFloat(dblRate) || 0;
          console.log(`  - Using B/B rate: ${dblRate}`);
          break;
        case "H/B":
          costPerPerson = (parseFloat(dblRate) || 0) + (parseFloat(hbRate) || 0);
          console.log(`  - Using H/B rate: ${dblRate} + ${hbRate} = ${dblRate + hbRate}`);
          break;
        case "SGL Supplement":
          costPerPerson = (parseFloat(dblRate) || 0) + (parseFloat(sglRate) || 0);
          console.log(`  - Using SGL Supplement: ${dblRate} + ${sglRate} = ${dblRate + sglRate}`);
          break;
        case "SGL + HB":
          costPerPerson = (parseFloat(dblRate) || 0) + (parseFloat(sglRate) || 0) + (parseFloat(hbRate) || 0);
          console.log(`  - Using SGL + HB: ${dblRate} + ${sglRate} + ${hbRate} = ${dblRate + sglRate + hbRate}`);
          break;
        default:
          costPerPerson = parseFloat(dblRate) || 0;
          console.log(`  - Using default rate (DBL): ${dblRate}`);
      }
      
      console.log(`💰 Cost per person: ${costPerPerson}`);
      
      const totalCostForThisStay = costPerPerson * pax * nights;
      console.log(`💵 Total cost for this stay: ${costPerPerson} × ${pax} pax × ${nights} nights = ${totalCostForThisStay}`);
      
      // Add to accommodation costs total
      accommodationCostsTotal += totalCostForThisStay;
      
      // Add to overall option cost
      totalOptionCost += totalCostForThisStay;
    });
    
    // Add base costs to total option cost
    totalOptionCost += baseCostsTotal * pax;
    
    console.log(`🏁 TOTAL OPTION COST BREAKDOWN:`);
    console.log(`  - Base Costs: ${baseCostsTotal} per person × ${pax} pax = ${baseCostsTotal * pax}`);
    console.log(`  - Accommodation Costs: ${accommodationCostsTotal}`);
    console.log(`  - Total: ${totalOptionCost}\n`);
    
    // Return an object with detailed breakdown
    return {
      totalCost: totalOptionCost,
      baseCosts: baseCostsTotal * pax,
      accommodationCosts: accommodationCostsTotal,
      baseCostsPerPerson: baseCostsTotal
    };
    
    } catch (error) {
      console.error("Error calculating option cost:", error);
      return {
        totalCost: 0,
        baseCosts: 0,
        accommodationCosts: 0,
        baseCostsPerPerson: 0
      };
    }
  }, [rateDisplayMode, calculateTransportTotal, calculateEntranceCost, calculateJeepCost,
      calculateMealCost, calculateExtrasCost, calculateGuideCosts, calculateTipsAndPortages,
      calculateWaterCost, waterIncluded, guideData, selectedPaxRanges]);

  // Helper function to check if a row has Petra or Jerash in the itinerary
  const hasSpecialSite = useCallback((row) => {
    const itinerary = (row.itinerary || "").toLowerCase();
    return {
      hasPetra: itinerary.includes("petra"),
      hasJerash: itinerary.includes("jerash"),
      hasEither: itinerary.includes("petra") || itinerary.includes("jerash")
    };
  }, []);
  
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

const collapsedRows = useMemo(() => collapseFreeLeisureRows(rows), [rows, collapseFreeLeisureRows]);
  // Handle manual updates to cost breakdown values
  const handleManualUpdate = useCallback((paxKey, field, value) => {
    setCalculationResults(prev => {
      const newResults = { ...prev };
      // Ensure paxKey is treated as a string
      const paxKeyStr = String(paxKey);
      
      if (!newResults[paxKeyStr]) {
        newResults[paxKeyStr] = {};
      }
      
      newResults[paxKeyStr] = {
        ...newResults[paxKeyStr],
        [field]: parseFloat(value) || 0
      };
      
      // Recalculate base cost per person
      const result = newResults[paxKeyStr];
      const pax = parseInt(paxKeyStr);
      
      // For transportation, we need to divide by pax since it's a group cost
      const transportPerPerson = pax > 0 ? (result.transport || 0) / pax : 0;
      
      const baseCost = (
        transportPerPerson + // Transportation is now per person
        (result.entrances || 0) +
        (result.extras || 0) +
        (result.jeep || 0) +
        (result.localGuide || 0) +
        (result.privateGuide || 0) +
        (waterIncluded ? (result.water || 0) : 0) +
        (result.meals || 0) +
        (result.meetAssist || 0) +
        (result.tips || 0) +
        (result.commission || 0)
      );
      
      // Store both the total transport cost and the per-person transport cost
      newResults[paxKeyStr].transportPerPerson = transportPerPerson;
      newResults[paxKeyStr].baseCostPerPersonUSD = baseCost;
      
      return newResults;
    });
  }, [waterIncluded]);
  
  // Handle updates to option costs
  const handleOptionUpdate = useCallback((paxKey, optIdx, validityIdx, value) => {
    // Create a copy of the calculation results
    setCalculationResults(prev => {
      const newResults = { ...prev };
      
      // Ensure paxKey exists in the results
      if (!newResults[paxKey]) {
        newResults[paxKey] = {};
      }
      
      // Ensure the option and validity indices exist
      if (!newResults[paxKey][optIdx]) {
        newResults[paxKey][optIdx] = {};
      }
      
      if (!newResults[paxKey][optIdx][validityIdx]) {
        newResults[paxKey][optIdx][validityIdx] = {};
      }
      
      // Update the per person cost
      newResults[paxKey][optIdx][validityIdx] = {
        ...newResults[paxKey][optIdx][validityIdx],
        perPersonCost: parseFloat(value) || 0
      };
      
      // Calculate the total cost
      const pax = parseInt(paxKey);
      const perPersonCost = parseFloat(value) || 0;
      newResults[paxKey][optIdx][validityIdx].totalCost = pax * perPersonCost;
      
      return newResults;
    });
  }, []);

  // Check if any day in the itinerary contains Jerash
  const hasJerashDay = useMemo(() => {
    const itineraries = rows.map(row => (row.itinerary || "").toLowerCase());
    const result = itineraries.some(itinerary => itinerary.includes("jerash"));
    console.log("Checking for Jerash in itinerary:", result, itineraries);
    return result;
  }, [rows]);

  // Helper to append a segment to itinerary based on ' - ' separator
  const appendItinerarySegment = (rowIndex, segment) => {
    if (!segment) return;
    setRows(prev => {
      const newRows = [...prev];
      const current = String(newRows[rowIndex]?.itinerary || "").trim();
      let updated = "";
      if (!current) {
        updated = segment;
      } else if (/-\s*$/.test(current)) {
        // already ends with '-', normalize spaces
        updated = current.replace(/\s*-\s*$/, " - ") + segment;
      } else {
        updated = current + " - " + segment;
      }
      newRows[rowIndex].itinerary = updated;
      return newRows;
    });
  };

  // Handle day changes
  function handleDayChange(i, field, val) {
    const newRows = [...rows];
    newRows[i][field] = val;
    
    if (field === 'guideLanguage') {
      // Update guide language for all selected pax ranges
      setGuideData(prev => {
        const newGuideData = { ...prev };
        // Make sure we're using strings for object keys
        selectedPaxRanges.forEach(paxRange => {
          newGuideData[String(paxRange)] = val;
        });
        return newGuideData;
      });
    }
    
    if (field === 'guideRequired') {
      console.log(`Guide checkbox changed for day ${i}: ${val}`);
      
      // If guide is required, ensure the guide type is set correctly
      if (val) {
        newRows[i].guideType = "Private"; // Set to Private when checked
      }
      
      // Use debounced force update to prevent rapid recalculations
      console.log("Guide checkbox changed, scheduling debounced recalculation");
      debouncedForceUpdate();
    }
    
    if (field === 'itinerary') {
      console.log("Itinerary changed:", val);
      
      // Generate autocomplete suggestions using QuickHint + restaurant regions
      if (val.trim()) {
        const inputText = val.trim();
        const lastWord = inputText.split(' - ').pop().trim();
        
        if (lastWord) {
          const lastLower = lastWord.toLowerCase();
          // Load QuickHint dictionary (english merged with AdditionalLocations)
          let qh = {};
          try {
            qh = getTranslatedQuickHint('english') || {};
          } catch (err) {
            console.error("QuickHint load error:", err);
          }
          const qhKeys = Object.keys(qh);
          const regionNames = Array.from(new Set((restaurantData || []).map(r => r.region).filter(Boolean)));
          const addl = Array.isArray(addlLocationOptions) ? addlLocationOptions : [];
          const candidates = Array.from(new Set([...qhKeys, ...addl, ...regionNames]));
          
          const suggestions = candidates
            .filter(loc => loc.toLowerCase().startsWith(lastLower) && loc.toLowerCase() !== lastLower)
            .slice(0, 5);
          
          console.log("Generated suggestions (QuickHint + regions):", suggestions);
          
          setAutocompleteSuggestions(suggestions);
          setActiveAutocompleteIndex(-1);
        } else {
          setAutocompleteSuggestions([]);
        }
      } else {
        setAutocompleteSuggestions([]);
      }
    }

    // Restaurant selection handling
    if (field === 'lunchRestaurant' && val) {
      const paxValue = parseInt(String(selectedPaxRanges?.[0] || 0), 10);
      const regions = extractRegionsFromItinerary(newRows[i].itinerary || "");
      const candidates = getRestaurantsByRegionAndMeal(regions, 'lunch', paxValue);
      const selected = candidates.find(r => r.restaurant === val) ||
                       (restaurantData || []).find(r => r.restaurant === val && r.itemType === 'lunch');
      if (selected) {
        newRows[i].lunchPriceOriginal = selected.priceOriginalValue ?? 0;
        newRows[i].lunchPriceCurrency = selected.priceOriginalCurrency || 'JOD';
        newRows[i].lunchPriceUSD = Number(selected.usdPrice || 0);
      }
    }

    if (field === 'dinnerRestaurant' && val) {
      const paxValue = parseInt(String(selectedPaxRanges?.[0] || 0), 10);
      const regions = extractRegionsFromItinerary(newRows[i].itinerary || "");
      const candidates = getRestaurantsByRegionAndMeal(regions, 'dinner', paxValue);
      const selected = candidates.find(r => r.restaurant === val) ||
                       (restaurantData || []).find(r => r.restaurant === val && r.itemType === 'dinner');
      if (selected) {
        newRows[i].dinnerPriceOriginal = selected.priceOriginalValue ?? 0;
        newRows[i].dinnerPriceCurrency = selected.priceOriginalCurrency || 'JOD';
        newRows[i].dinnerPriceUSD = Number(selected.usdPrice || 0);
      }
    }

    // Reset restaurant selections if toggled off or meal type changed
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

  // Add a new day
  function addRow() {
    setRows(r => [
      ...r,
      {
        day: `Day ${r.length + 1}`,
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
        // Multi-day repeat controls
        multiDayEnabled: false,
        multiDayDays: []
      }
    ]);
  }
  
  // Function to add an optional activity to a specific day
  function addOptionalActivity(dayIndex) {
    setOptionalActivities(prev => {
      const newOptionalActivities = { ...prev };
      if (!newOptionalActivities[dayIndex]) {
        newOptionalActivities[dayIndex] = [];
      }
      
      newOptionalActivities[dayIndex].push({
        activityName: "",
        city: "",
        durationHours: "",
        extras: [],
        entrances: [],
        experiences: []
      });
      
      return newOptionalActivities;
    });
  }
  
  // Function to remove an optional activity from a specific day
  function removeOptionalActivity(dayIndex, activityIndex) {
    setOptionalActivities(prev => {
      const newOptionalActivities = { ...prev };
      if (newOptionalActivities[dayIndex] && newOptionalActivities[dayIndex].length > activityIndex) {
        newOptionalActivities[dayIndex].splice(activityIndex, 1);
        
        // If there are no more optional activities for this day, remove the day entry
        if (newOptionalActivities[dayIndex].length === 0) {
          delete newOptionalActivities[dayIndex];
        }
      }
      return newOptionalActivities;
    });
  }
  
  // Function to update an optional activity
  function updateOptionalActivity(dayIndex, activityIndex, field, value) {
    setOptionalActivities(prev => {
      const newOptionalActivities = { ...prev };
      if (newOptionalActivities[dayIndex] && newOptionalActivities[dayIndex].length > activityIndex) {
        newOptionalActivities[dayIndex][activityIndex] = {
          ...newOptionalActivities[dayIndex][activityIndex],
          [field]: value
        };
      }
      return newOptionalActivities;
    });
  }
  
  // Function to calculate the subtotal for an optional activity
  function calculateOptionalActivitySubtotal(activity) {
    let subtotal = 0;
    let breakdown = {
      extras: 0,
      entrances: 0,
      experiences: 0
    };
    
    // Calculate cost from extras
    if (activity.extras && activity.extras.length > 0) {
      activity.extras.forEach(extraName => {
        const extraCost = extrasCosts[extraName] || 0;
        console.log(`Adding extra cost for ${extraName}: $${extraCost}`);
        subtotal += extraCost;
        breakdown.extras += extraCost;
      });
    }
    
    // Calculate cost from entrances
    if (activity.entrances && activity.entrances.length > 0) {
      activity.entrances.forEach(entrance => {
        const fee = fees.find(f => f["Travco Jordan"] === entrance);
        const cost = fee ? parseFloat(fee["__1"]) || 0 : 0;
        console.log(`Adding entrance cost for ${entrance}: $${cost}`);
        subtotal += cost;
        breakdown.entrances += cost;
      });
    }
    
    // Add any additional costs from experiences if needed
    if (activity.experiences && typeof activity.experiences === 'string' && activity.experiences.includes('cost:')) {
      try {
        // Try to extract cost information from experiences text
        const costMatch = activity.experiences.match(/cost:\s*\$?(\d+(\.\d+)?)/i);
        if (costMatch && costMatch[1]) {
          const experienceCost = parseFloat(costMatch[1]);
          if (!isNaN(experienceCost)) {
            console.log(`Adding experience cost: $${experienceCost}`);
            subtotal += experienceCost;
            breakdown.experiences += experienceCost;
          }
        }
      } catch (error) {
        console.error("Error parsing experience cost:", error);
      }
    }
    
    console.log(`Total optional activity subtotal: $${subtotal}`);
    console.log(`Breakdown: Extras: $${breakdown.extras}, Entrances: $${breakdown.entrances}, Experiences: $${breakdown.experiences}`);
    
    return {
      total: subtotal,
      breakdown: breakdown
    };
  }

  // Remove a day
  function removeRow(i) {
    setRows(prev => {
      const filtered = prev.filter((_, idx) => idx !== i);
      // Renumber labels after removal
      return filtered.map((row, idx) => ({ ...row, day: `Day ${idx + 1}` }));
    });

    // Reindex optional activities to keep them aligned with day indices
    setOptionalActivities(prev => {
      if (!prev || typeof prev !== 'object') return {};
      const updated = {};
      Object.keys(prev).forEach(k => {
        const idx = parseInt(k, 10);
        if (isNaN(idx) || idx === i) return;
        const newIndex = idx > i ? idx - 1 : idx;
        updated[newIndex] = prev[k];
      });
      return updated;
    });

    // Force recalculation after structural change
    debouncedForceUpdate('remove_day');
  }

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
        zIndex: 1000
      }}>
        <span style={{ fontSize: '20px' }}>
          {type === 'success' ? '✓' : '✗'}
        </span>
        {message}
      </div>
    );
  };

  // Styles
  const labelStyle = { fontWeight: 500, fontSize: 15, marginBottom: 4 };
  const inputStyle = { padding: 10, borderRadius: 6, border: "1px solid #444", backgroundColor: "#2a2a2a", color: "#fff", fontSize: 14, width: "100%" };
  const sectionStyle = { backgroundColor: "#1f1f1f", padding: 20, marginBottom: 30, borderRadius: 12, position: "relative" };

  // Unified checkbox row styles for consistent alignment and spacing
  const checkboxRowStyle = { display: 'flex', alignItems: 'center', gap: 12 };
  const checkboxLabelTextStyle = { ...labelStyle, marginBottom: 0, minWidth: 180 };
  const checkboxInputStyle = { transform: 'scale(1.3)' };

  // Force recalculation of costs when options, validityDates, or forceUpdate changes
  useEffect(() => {
    console.log("🔄 Recalculating costs due to options, validityDates, or forceUpdate change");
    
    try {
      // Create a temporary copy of the calculation results
      const newResults = {};
      
      // Calculate costs for each selected pax range
      selectedPaxRanges.forEach(paxRange => {
        // Ensure paxRange is treated as a string for object keys
        const paxRangeStr = String(paxRange);
        
        if (!newResults[paxRangeStr]) {
          newResults[paxRangeStr] = {};
        }
        
        const pax = parseInt(paxRangeStr);
        
        // Calculate additional costs that apply to all options
        const tipsAndPortages = calculateTipsAndPortages(pax);
        const waterPerPersonCalc = waterIncluded ? ((pax > 0 ? calculateWaterCost(pax) / pax : 0)) : 0;
        const transportCost = calculateTransportTotal(pax);
        const jeepCost = calculateJeepCost(pax);
        const mealCost = calculateMealCost();
        
        // Store these values in the results
        newResults[paxRangeStr].tips = tipsAndPortages;
        newResults[paxRangeStr].water = waterPerPersonCalc;
        newResults[paxRangeStr].transport = transportCost;
        newResults[paxRangeStr].jeep = jeepCost;
        newResults[paxRangeStr].meals = mealCost;
        
        // Calculate guide costs
        const selectedLang = guideData[paxRangeStr] || guideData[String(selectedPaxRanges?.[0])] || "English";
        const { localGuideUSD, privateGuideUSD } = calculateGuideCosts(pax, "Private", selectedLang);
        // Store per-person values for guide costs to ensure final totals display per person
        const localGuidePerPersonVal = pax > 0 ? localGuideUSD / pax : 0;
        const privateGuidePerPersonVal = pax > 0 ? privateGuideUSD / pax : 0;
        newResults[paxRangeStr].localGuide = localGuidePerPersonVal;
        newResults[paxRangeStr].privateGuide = privateGuidePerPersonVal;
        
        // Calculate entrance fees (store as USD per person)
        const totalEntranceFeesJOD = calculateEntranceCost();
        const totalEntranceFeesUSD = totalEntranceFeesJOD * JOD_TO_USD;
        newResults[paxRangeStr].entrances = totalEntranceFeesUSD;
        console.log(`Total entrance fees: ${totalEntranceFeesUSD} USD (converted from JOD ${totalEntranceFeesJOD.toFixed(2)})`);
        
        // Calculate extras
        const totalExtras = calculateExtrasCost(pax);
        newResults[paxRangeStr].extras = totalExtras;
        console.log(`Total extras: ${totalExtras} USD`);
        
        // Calculate costs for each option and validity date
        options.forEach((opt, optIdx) => {
          if (!newResults[paxRangeStr][optIdx]) {
            newResults[paxRangeStr][optIdx] = {};
          }
          
          validityDates.forEach((_, validityIdx) => {
            try {
              console.log(`Calculating cost for pax ${paxRangeStr}, option ${optIdx}, validity ${validityIdx}`);
              
              // Calculate option cost with improved function
              const costResult = calculateOptionCost(opt, pax, validityIdx);
              console.log(`Calculated option cost:`, costResult);
              
              // Extract the total cost from the result
              const totalCost = costResult.totalCost || 0;
              
              // Calculate bank commission based on the option cost
              // Bank commission per person (same tiers as tips)
              const commissionPerPersonCalc = calculateBankCommission(pax);
              newResults[paxRangeStr].commission = commissionPerPersonCalc;
              
              // Ensure the option index exists
              if (!newResults[paxRangeStr][optIdx]) {
                newResults[paxRangeStr][optIdx] = {};
              }
              
              // Store both total cost and per person cost
              const perPersonCost = pax > 0 ? (costResult.accommodationCosts / pax) + costResult.baseCostsPerPerson : 0;
              
              newResults[paxRangeStr][optIdx][validityIdx] = {
                totalCost: totalCost,
                perPersonCost: perPersonCost,
                // Add subtotal breakdown for better transparency
                subtotals: {
                  baseCosts: costResult.baseCosts || 0,
                  accommodationCosts: costResult.accommodationCosts || 0,
                  baseCostsPerPerson: costResult.baseCostsPerPerson || 0
                }
              };
              
              console.log(`Updated results for pax ${paxRangeStr}, option ${optIdx}, validity ${validityIdx}:`,
                newResults[paxRangeStr][optIdx][validityIdx]);
            } catch (error) {
              console.error(`Error calculating cost for pax ${paxRange}, option ${optIdx}, validity ${validityIdx}:`, error);
              newResults[paxRange][optIdx][validityIdx] = {
                totalCost: 0,
                perPersonCost: 0,
                subtotals: {
                  baseCosts: 0,
                  accommodationCosts: 0,
                  baseCostsPerPerson: 0
                }
              };
            }
          });
        });
        
        // Calculate base cost per person
        // Group-level items must be divided by pax to get per-person amounts
        const transportPerPerson = pax > 0 ? (newResults[paxRangeStr].transport || 0) / pax : 0;
        const jeepPerPerson       = pax > 0 ? (newResults[paxRangeStr].jeep || 0) / pax : 0;
        const extrasPerPerson     = pax > 0 ? (newResults[paxRangeStr].extras || 0) / pax : 0;
        // local/private guide already stored per person
        const localGuidePerPerson = newResults[paxRangeStr].localGuide || 0;
        const privateGuidePerPerson = newResults[paxRangeStr].privateGuide || 0;
        // tips/commission already stored per person
        const tipsPerPerson       = newResults[paxRangeStr].tips || 0;
        const commissionPerPerson = newResults[paxRangeStr].commission || 0;
        const meetAssistPerPerson = pax > 0 ? (newResults[paxRangeStr].meetAssist || 0) / pax : 0;
        const waterPerPerson      = waterIncluded ? (newResults[paxRangeStr].water || 0) : 0;

        // Per-person items (already per person): entrances, meals
        const baseCost = (
          transportPerPerson +
          (newResults[paxRangeStr].entrances || 0) +
          jeepPerPerson +
          extrasPerPerson +
          localGuidePerPerson +
          privateGuidePerPerson +
          waterPerPerson +
          (newResults[paxRangeStr].meals || 0) +
          meetAssistPerPerson +
          tipsPerPerson +
          commissionPerPerson
        );

        // Store both the total transport cost and the per-person transport cost
        newResults[paxRangeStr].transportPerPerson = transportPerPerson;
        newResults[paxRangeStr].baseCostPerPersonUSD = baseCost;
      });
      
      // Update the calculation results
      setCalculationResults(newResults);
      
      console.log("✅ Calculation results updated successfully:", newResults);
    } catch (error) {
      console.error("Error in recalculation effect:", error);
    }
  }, [options, validityDates, forceUpdate, selectedPaxRanges, calculateOptionCost, rateDisplayMode,
      calculateTipsAndPortages, calculateWaterCost, calculateBankCommission, calculateGuideCosts,
      calculateTransportTotal, calculateJeepCost, calculateMealCost, calculateExtrasCost,
      guideData, waterIncluded]);
  
  // Update parent component with data
  useEffect(() => {
    if (rows.length > 0) {
      // Create a copy of the calculation results to include in the data
      const calculationResultsCopy = JSON.parse(JSON.stringify(calculationResults));
      
      onDataChange({
        rateDisplayMode,
        itinerary: collapsedRows,
        options: options.map((opt, optIdx) => {
          // Include the calculated costs for each option
          const optionCosts = {};
          
          // Add costs for each pax range and validity date
          selectedPaxRanges.forEach(paxRange => {
            if (calculationResultsCopy[paxRange] && calculationResultsCopy[paxRange][optIdx]) {
              optionCosts[paxRange] = calculationResultsCopy[paxRange][optIdx];
            }
          });
          
          return {
            accommodations: opt.accommodations,
            costs: optionCosts
          };
        }),
        validityDates: validityDates,
        calculationResults: calculationResultsCopy,
        optionalActivities: optionalActivities,
        // Persist which PAX ranges are selected so edit mode can restore them
        selectedPaxRanges: selectedPaxRanges.map(p => parseInt(p, 10) || p),
        profitMargin: profitMargin
      });
    }
  }, [rows, options, validityDates, calculationResults, selectedPaxRanges, onDataChange]);

  return (
    <div
      style={{ color: "white", padding: 30 }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Notification {...notification} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>
          Group Series Quotation Itinerary
          {isRefreshing && (
            <span style={{
              fontSize: 14,
              marginLeft: 15,
              backgroundColor: "#004D40",
              padding: "4px 8px",
              borderRadius: 4
            }}>
              Refreshing rates...
            </span>
          )}
        </h2>
        
        {/* Agent Dropdown integrated in the header */}
        <div style={{ position: "relative", width: "300px" }}>
          <div
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #444",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              fontSize: 14,
              width: "100%",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>{selectedAgent || "Select an agent..."}</span>
            <span style={{ marginLeft: 8 }}>▼</span>
          </div>
          {showAgentDropdown && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "0 0 6px 6px",
              zIndex: 10,
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {(Array.isArray(agents) ? agents : []).filter(Boolean).map((item, index) => (
                <div
                  key={`${item?.Acc_No ?? index}-${index}`}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #444",
                    fontSize: 14,
                    color: "#fff",
                    backgroundColor: index % 2 === 0 ? "#333" : "#2a2a2a"
                  }}
                  onClick={() => handleAgentSelect(item)}
                >
                  {item?.Account_Name || "Unknown Agent"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '15px', backgroundColor: '#1f1f1f' }}>
            <div style={{ color: '#fff', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
              Select PAX Ranges
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PAX_RANGES.map(paxRange => (
                <label
                  key={paxRange.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: selectedPaxRanges.includes(paxRange.value) ? '#004D40' : '#333',
                    color: '#fff',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPaxRanges.includes(paxRange.value)}
                    onChange={() => {
                      setSelectedPaxRanges(prev => {
                        // If already selected, remove it
                        if (prev.includes(paxRange.value)) {
                          // Don't allow deselecting the last pax range
                          if (prev.length === 1) {
                            return prev;
                          }
                          return prev.filter(value => value !== paxRange.value);
                        }
                        // Otherwise add it
                        return [...prev, paxRange.value];
                      });
                      console.log(`Toggled pax range: ${paxRange.label}`);
                    }}
                    style={{
                      marginRight: '8px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  {paxRange.label}
                </label>
              ))}
            </div>
          </div>
          
          {validityDates.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              <span style={{ color: '#aaa', marginRight: '10px' }}>Validity Period:</span>
              {validityDates.map((dateRange, index) => (
                <button type="button"
                  key={index}
                  onClick={() => setCurrentValidityDate(index)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: currentValidityDate === index ? '#004D40' : '#333',
                    color: '#fff',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {dateRange.from} to {dateRange.to}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Rates controls removed per user request */}
      </div>
      
      <button type="button" 
        onClick={addRow}
        style={{ marginBottom: 20, padding: "10px 15px", borderRadius: 6, backgroundColor: "#444", color: "#fff", border: "none" }}
      >
        + Add Day
      </button>
      
      {/* Days section */}
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
            fontSize: "14px"
          }}>
            {row.day}
          </div>
          <button type="button" 
            onClick={() => removeRow(i)}
            style={{ float: "right", background: "transparent", color: "#f66", border: "none", fontSize: 16 }}
          >
            ✕
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "10px" }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#90CAF9', margin: '0 0 6px' }}></div>
              <label style={labelStyle}>Itinerary</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={row.itinerary}
                  onChange={e => handleDayChange(i, "itinerary", e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: autocompleteSuggestions.length > 0 && i === rows.findIndex(r => r.itinerary === row.itinerary) ? '#4CAF50' : '#444'
                  }}
                  placeholder="e.g., Amman - Jerash - Petra"
                />
                {autocompleteSuggestions.length > 0 && i === rows.findIndex(r => r.itinerary === row.itinerary) && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    backgroundColor: "#333",
                    border: "1px solid #555",
                    borderRadius: "0 0 6px 6px",
                    zIndex: 10,
                    maxHeight: "200px",
                    overflowY: "auto"
                  }}>
                    {autocompleteSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const currentText = row.itinerary;
                          const lastDashIndex = currentText.lastIndexOf(" - ");
                          const prefix = lastDashIndex >= 0 ? currentText.substring(0, lastDashIndex + 3) : "";
                          const newText = prefix + suggestion;
                          handleDayChange(i, "itinerary", newText);
                          setAutocompleteSuggestions([]);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor: idx === activeAutocompleteIndex ? "#004D40" : "transparent",
                          color: "#fff",
                          borderBottom: idx < autocompleteSuggestions.length - 1 ? "1px solid #444" : "none"
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <div>
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
              <div style={{ fontWeight: 'bold', color: '#80CBC4', margin: '10px 0 6px' }}></div>
<label style={labelStyle}>Transportation</label>
              <select
                value={row.transportType}
                onChange={e => handleDayChange(i, "transportType", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option>Transfer</option>
                <option>Full Day</option>
                <option>Half Day</option>
                <option>Stopover</option>
                <option>Cruise</option>
              </select>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#A5D6A7', margin: '10px 0 6px' }}></div>
              <label style={labelStyle}>Entrance(s)</label>
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
                        const newEntrances = [...(row.entrances || [])];
                        if (!newEntrances.includes(e.target.value)) {
                          newEntrances.push(e.target.value);
                          handleDayChange(i, "entrances", newEntrances);
                          // Use special entrance fees debounce with longer timeout
                          console.log("Entrance fees changed, scheduling debounced recalculation with longer timeout");
                          debouncedEntranceUpdate();
                        }
                        e.target.value = ""; // Reset select after selection
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="">+ Add Entrance Fee</option>
                    {fees && fees.length > 0 ? (
                      fees.map((fee, j) => {
                        const feeName = fee["Travco Jordan"] || "Unknown";
                        const feeAmount = fee["__1"] ? parseFloat(fee["__1"]) : 0;
                        return (
                          <option key={j} value={feeName}>
                            {feeName} (JOD {feeAmount.toFixed(2)})
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No entrance fees available</option>
                    )}
                  </select>
                  
                  {/* Display selected entrances with remove button */}
                  {row.entrances && row.entrances.length > 0 && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      marginTop: "5px"
                    }}>
                      {row.entrances.map((entrance, idx) => {
                        const fee = fees.find(f => f["Travco Jordan"] === entrance);
                        const cost = fee && fee["__1"] ? parseFloat(fee["__1"]).toFixed(2) : "0.00";
                        
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
                              <span style={{ fontSize: "13px" }}>{entrance}</span>
                              <span style={{ fontSize: "12px", color: "#4CAF50", marginLeft: "5px" }}>(JOD {cost})</span>
                            </div>
                            <button type="button"
                              onClick={() => {
                                const newEntrances = [...row.entrances];
                                newEntrances.splice(idx, 1);
                                handleDayChange(i, "entrances", newEntrances);
                                // Use special entrance fees debounce with longer timeout
                                console.log("Entrance removed, scheduling debounced recalculation with longer timeout");
                                debouncedEntranceUpdate();
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
              <div style={{ fontWeight: 'bold', color: '#B39DDB', margin: '10px 0 6px' }}></div>
              <div style={checkboxRowStyle}>
                <span style={checkboxLabelTextStyle}>Guide</span>
                <input
                  type="checkbox"
                  checked={row.guideRequired}
                  onChange={e => {
                    console.log(`Guide checkbox changed to: ${e.target.checked}`);
                    handleDayChange(i, "guideRequired", e.target.checked);
                    console.log("Guide checkbox changed, scheduling debounced recalculation");
                    debouncedForceUpdate();
                  }}
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
                <div>
                  <label style={labelStyle}>Guide Type</label>
                  <input
                    type="text"
                    value="Private"
                    readOnly
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Guide Language</label>
                  <select
                    value={guideData[String(selectedPaxRanges[0])] || 'English'}
                    onChange={e => handleDayChange(i, "guideLanguage", e.target.value)}
                    style={inputStyle}
                  >
                    {["English", "Arabic", "French", "Italian", "Spanish", "German", "Dutch", "Romanian"]
                      .map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                
                {/* Jerash guidance panel (auto-calculated) */}
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
                      const paxValue = parseInt(String(selectedPaxRanges?.[0] || 0), 10);
                      if (!paxValue) return null;
                      const paxDef = PAX_RANGES.find(p => p.value === paxValue);
                      const paxLabel = paxDef ? paxDef.label : `${paxValue} pax`;

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
              <div>
                <label style={labelStyle}>Jeep Service</label>
                <select
                  value={row.jeepService}
                  onChange={e => handleDayChange(i, "jeepService", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Jeep</option>
                  {jeepServices && jeepServices.length > 0 ? (
                    jeepServices.map((x, j) =>
                      <option key={j} value={x["Travco Jordan"]}>
                        {x["Travco Jordan"]}
                      </option>
                    )
                  ) : (
                    <option value="" disabled>No Jeep services available</option>
                  )}
                </select>
              </div>
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
                <div>
                  <label style={labelStyle}>Type of Meal</label>
                  <select
                    value={row.mealType}
                    onChange={e => handleDayChange(i, "mealType", e.target.value)}
                    style={inputStyle}
                  >
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Lunch & Dinner</option>
                  </select>
                </div>

                {(row.mealType === "Lunch" || row.mealType === "Lunch & Dinner") && (
                  <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                    <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #444" }}>
                      <h4 style={{ margin: 0, marginBottom: "10px", color: "#4CAF50" }}>Lunch Restaurant</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={labelStyle}>Select Restaurant</label>
                          <select
                            value={row.lunchRestaurant || ""}
                            onChange={e => handleDayChange(i, "lunchRestaurant", e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">Select Restaurant</option>
                            {(() => {
                              const paxValue = parseInt(String(selectedPaxRanges?.[0] || 0), 10);
                              const regions = extractRegionsFromItinerary(row.itinerary || "");
                              const restaurants = getRestaurantsByRegionAndMeal(regions, 'lunch', paxValue);
                              return restaurants
                                .filter(r => r.itemType === 'lunch')
                                .map((restaurant, idx) => (
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
                  <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                    <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #444" }}>
                      <h4 style={{ margin: 0, marginBottom: "10px", color: "#FF9800" }}>Dinner Restaurant</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={labelStyle}>Select Restaurant</label>
                          <select
                            value={row.dinnerRestaurant || ""}
                            onChange={e => handleDayChange(i, "dinnerRestaurant", e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">Select Restaurant</option>
                            {(() => {
                              const paxValue = parseInt(String(selectedPaxRanges?.[0] || 0), 10);
                              const regions = extractRegionsFromItinerary(row.itinerary || "");
                              const restaurants = getRestaurantsByRegionAndMeal(regions, 'dinner', paxValue);
                              return restaurants
                                .filter(r => r.itemType === 'dinner')
                                .map((restaurant, idx) => (
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
                          // Use debounced force update to prevent rapid recalculations
                          console.log("Extras changed, scheduling debounced recalculation");
                          debouncedForceUpdate();
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
                  
                  {/* Display selected extras with remove button */}
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
                            <button type="button"
                              onClick={() => {
                                const newExtras = [...row.extras];
                                newExtras.splice(idx, 1);
                                handleDayChange(i, "extras", newExtras);
                                // Use debounced force update to prevent rapid recalculations
                                console.log("Extra removed, scheduling debounced recalculation");
                                debouncedForceUpdate();
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
          </div>
          
          {/* Add Optional Activity Button */}
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button type="button"
              onClick={() => addOptionalActivity(i)}
              style={{
                padding: '8px 15px',
                backgroundColor: '#e53935',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                margin: '0 auto'
              }}
            >
              <span style={{ marginRight: '5px' }}>+</span> Add Optional Activity
            </button>
          </div>
          
          {/* Optional Activities Section */}
          {optionalActivities[i] && optionalActivities[i].length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <div style={{
                backgroundColor: '#e53935',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '4px 4px 0 0',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Optional Activities (Not Included in Cost)</span>
              </div>
              
              {optionalActivities[i].map((activity, activityIndex) => (
                <div key={activityIndex} style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #e53935',
                  borderRadius: '0 0 4px 4px',
                  padding: '15px',
                  marginBottom: activityIndex < optionalActivities[i].length - 1 ? '10px' : '0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, color: '#e53935', fontWeight: 'bold', fontSize: '16px' }}>Activity Name</label>
                      <input
                        type="text"
                        value={activity.activityName || ""}
                        onChange={e => updateOptionalActivity(i, activityIndex, 'activityName', e.target.value)}
                        placeholder="Enter activity name..."
                        style={{
                          ...inputStyle,
                          borderColor: '#e53935',
                          backgroundColor: '#1f1f1f',
                          borderWidth: '2px'
                        }}
                      />
                    </div>
                    <button type="button"
                      onClick={() => removeOptionalActivity(i, activityIndex)}
                      style={{
                        background: 'transparent',
                        color: '#f66',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        alignSelf: 'flex-start',
                        marginTop: '25px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* City */}
                    <div>
                      <label style={labelStyle}>City</label>
                      <select
                        value={activity.city || ""}
                        onChange={e => updateOptionalActivity(i, activityIndex, 'city', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select City</option>
                        {cities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration (hours) */}
                    <div>
                      <label style={labelStyle}>Duration (hours)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={activity.durationHours ?? ""}
                        onChange={e => {
                          const val = e.target.value;
                          const num = val === "" ? "" : Math.max(0, parseFloat(val) || 0);
                          updateOptionalActivity(i, activityIndex, 'durationHours', num);
                        }}
                        style={inputStyle}
                        placeholder="e.g., 2 or 2.5"
                      />
                    </div>

                    {/* Extra(s) */}
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#A5D6A7', margin: '10px 0 6px' }}>Extras</div>
              <label style={labelStyle}>Extra(s)</label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginBottom: '10px'
                        }}>
                          <select
                            value=""
                            onChange={e => {
                              if (e.target.value) {
                                const newExtras = [...(activity.extras || [])];
                                if (!newExtras.includes(e.target.value)) {
                                  newExtras.push(e.target.value);
                                  updateOptionalActivity(i, activityIndex, 'extras', newExtras);
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
                          
                          {/* Display selected extras with remove button */}
                          {activity.extras && activity.extras.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                              marginTop: '5px'
                            }}>
                              {activity.extras.map((extra, idx) => {
                                const cost = extrasCosts[extra] || 0;
                                
                                return (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    backgroundColor: '#1f1f1f',
                                    borderRadius: '4px',
                                    border: '1px solid #444'
                                  }}>
                                    <div>
                                      <span style={{ fontSize: '13px' }}>{extra}</span>
                                      {cost > 0 && (
                                        <span style={{ fontSize: '12px', color: '#e53935', marginLeft: '5px' }}>(${cost})</span>
                                      )}
                                    </div>
                                    <button type="button"
                                      onClick={() => {
                                        const newExtras = [...activity.extras];
                                        newExtras.splice(idx, 1);
                                        updateOptionalActivity(i, activityIndex, 'extras', newExtras);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f66',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '0 5px'
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
                    
                    {/* Entrance(s) */}
                    <div>
                      <label style={labelStyle}>Entrance(s)</label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginBottom: '10px'
                        }}>
                          <select
                            value=""
                            onChange={e => {
                              if (e.target.value) {
                                const newEntrances = [...(activity.entrances || [])];
                                if (!newEntrances.includes(e.target.value)) {
                                  newEntrances.push(e.target.value);
                                  updateOptionalActivity(i, activityIndex, 'entrances', newEntrances);
                                }
                                e.target.value = ""; // Reset select after selection
                              }
                            }}
                            style={inputStyle}
                          >
                            <option value="">+ Add Entrance</option>
                            {fees && fees.length > 0 ? (
                              fees.map((fee, j) => {
                                const feeName = fee["Travco Jordan"] || "Unknown";
                                const feeAmount = fee["__1"] ? parseFloat(fee["__1"]) : 0;
                                return (
                                  <option key={j} value={feeName}>
                                    {feeName} (JOD {feeAmount.toFixed(2)})
                                  </option>
                                );
                              })
                            ) : (
                              <option value="" disabled>No entrance fees available</option>
                            )}
                          </select>
                          
                          {/* Display selected entrances with remove button */}
                          {activity.entrances && activity.entrances.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                              marginTop: '5px'
                            }}>
                              {activity.entrances.map((entrance, idx) => {
                                const fee = fees.find(f => f["Travco Jordan"] === entrance);
                                const cost = fee && fee["__1"] ? parseFloat(fee["__1"]).toFixed(2) : "0.00";
                                
                                return (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    backgroundColor: '#1f1f1f',
                                    borderRadius: '4px',
                                    border: '1px solid #444'
                                  }}>
                                    <div>
                                      <span style={{ fontSize: '13px' }}>{entrance}</span>
                                      <span style={{ fontSize: '12px', color: '#e53935', marginLeft: '5px' }}>(JOD {cost})</span>
                                    </div>
                                    <button type="button"
                                      onClick={() => {
                                        const newEntrances = [...activity.entrances];
                                        newEntrances.splice(idx, 1);
                                        updateOptionalActivity(i, activityIndex, 'entrances', newEntrances);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f66',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '0 5px'
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
                    
                    {/* Experience(s) */}
                    <div>
                      <label style={labelStyle}>Experience(s)</label>
                      <textarea
                        value={activity.experiences || ""}
                        onChange={e => updateOptionalActivity(i, activityIndex, 'experiences', e.target.value)}
                        style={{
                          ...inputStyle,
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                        placeholder="Describe the experience..."
                      />
                    </div>
                  </div>
                  {/* Activity Subtotal - Detailed */}
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '10px',
                    borderTop: '1px solid #444'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#aaa' }}>
                        Extras:
                      </span>
                      <span style={{ fontSize: '14px', color: '#e53935' }}>
                        ${calculateOptionalActivitySubtotal(activity).breakdown.extras.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#aaa' }}>
                        Entrances:
                      </span>
                      <span style={{ fontSize: '14px', color: '#e53935' }}>
                        JOD {calculateOptionalActivitySubtotal(activity).breakdown.entrances.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#aaa' }}>
                        Experiences:
                      </span>
                      <span style={{ fontSize: '14px', color: '#e53935' }}>
                        ${calculateOptionalActivitySubtotal(activity).breakdown.experiences.toFixed(2)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px dashed #444',
                      fontWeight: 'bold'
                    }}>
                      <span style={{ fontSize: '15px', color: '#fff' }}>
                        Activity Subtotal (per person):
                      </span>
                      <span style={{
                        fontWeight: 'bold',
                        color: '#e53935',
                        fontSize: '16px'
                      }}>
                        ${calculateOptionalActivitySubtotal(activity).total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Accommodation Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <h3 style={{ margin: 0 }}>
          Accommodation Options
        </h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: 10, color: '#aaa' }}>Rate Display Mode:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* By Season (Automatic) */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: rateDisplayMode === 'bySeasonAuto' ? '#004D40' : '#333',
                color: '#fff',
                border: '1px solid #444',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <input
                type="radio"
                name="rateDisplayMode"
                checked={rateDisplayMode === 'bySeasonAuto'}
                onChange={() => {
                  setRateDisplayMode('bySeasonAuto');
                  setNotification({
                    show: true,
                    message: 'Switched to By Season (Automatic). Season is derived from validity dates.',
                    type: 'success'
                  });
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, show: false }));
                  }, 3000);
                }}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              By Season (Automatic)
            </label>

            {/* By Season (Manual) */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: rateDisplayMode === 'bySeasonManual' ? '#004D40' : '#333',
                color: '#fff',
                border: '1px solid #444',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <input
                type="radio"
                name="rateDisplayMode"
                checked={rateDisplayMode === 'bySeasonManual'}
                onChange={() => {
                  setRateDisplayMode('bySeasonManual');
                  setNotification({
                    show: true,
                    message: 'Switched to By Season (Manual). Select a season per validity to load hotel rates.',
                    type: 'success'
                  });
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, show: false }));
                  }, 3000);
                }}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              By Season (Manual)
            </label>

            {/* By Flat Rate */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: rateDisplayMode === 'byFlatRate' ? '#004D40' : '#333',
                color: '#fff',
                border: '1px solid #444',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <input
                type="radio"
                name="rateDisplayMode"
                checked={rateDisplayMode === 'byFlatRate'}
                onChange={() => {
                  setRateDisplayMode('byFlatRate');
                  setNotification({
                    show: true,
                    message: 'Switched to By Flat Rate mode. Edit a single rate set for all validity periods.',
                    type: 'success'
                  });
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, show: false }));
                  }, 3000);
                }}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              By Flat Rate
            </label>
          </div>
        </div>
      </div>
      {options.map((opt, optIdx) => {
        // Use calculation results from state
        const validityCosts = validityDates.map((_, validityIdx) => {
          // Get cost from calculation results or calculate it if not available
          const result = calculationResults[optIdx]?.[validityIdx];
          const perPersonCost = result?.perPersonCost || 0;
          
          return {
            validityIdx,
            totalCost: result?.totalCost || 0,
            perPersonCost: perPersonCost
          };
        });
        return (
          <div key={optIdx} style={sectionStyle}>
            <h4>Option {optIdx + 1}:</h4>
            {opt.accommodations.map((ac, idx) => (
              <div key={idx} style={{ marginBottom:20, position:"relative", border: '1px solid #333', padding: 15, borderRadius: 8 }}>
                <button type="button"
                  onClick={() => removeAccommodation(optIdx, idx)}
                  style={{ position:"absolute", top:10, right:10, background:"transparent", color:"#f66", border:"none", fontSize:16 }}
                >
                  ✕
                </button>
                
                {/* Basic accommodation info */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <select
                      value={ac.city}
                      onChange={e => handleAccomChange(optIdx, idx, "city", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Stars</label>
                    <select
                      value={ac.stars}
                      onChange={e => handleAccomChange(optIdx, idx, "stars", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select Stars</option>
                      {(() => {
                        const isWR = String(ac.city || '').trim().toLowerCase().startsWith('wadi rum');
                        const starOptions = isWR ? ['Deluxe', 'Regular'] : stars;
                        return starOptions.map((s) => (
                          <option key={s} value={s}>
                            {/^\d+$/.test(String(s)) ? `${s}★` : String(s)}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Hotel</label>
                    <select
                      value={ac.hotelName}
                      onChange={e => handleAccomChange(optIdx, idx, "hotelName", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select Hotel</option>
                      {getUniqueHotels(ac.city, ac.stars).map(hotel => (
                        <option key={hotel.hotel} value={hotel.hotel}>
                          {hotel.hotel} {hotel.seasons && hotel.seasons.length > 0 &&
                            `(${hotel.seasons.join(', ')} season${hotel.seasons.length > 1 ? 's' : ''})`}
                        </option>
                      ))}
                    </select>
                    {ac.city && ac.stars && !ac.hotelName && (
                      <div style={{ fontSize: '12px', color: '#ff9800', marginTop: '4px' }}>
                        Select a hotel to auto-populate rates for all validity periods
                      </div>
                    )}
                    {ac.hotelName && (
                      <div style={{ fontSize: '12px', color: '#FF9800', marginTop: '4px' }}>
                        Enter or verify rates for this hotel
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Nights</label>
                    <input
                      type="number"
                      value={ac.nights}
                      onChange={e => handleAccomChange(optIdx, idx, "nights", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Board</label>
                    <select
                      value={ac.board}
                      onChange={e => handleAccomChange(optIdx, idx, "board", e.target.value)}
                      style={inputStyle}
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
                  </div>
                </div>
                
                {/* Rates section */}
                {validityDates.length > 0 && (
                  <div>
                    <div style={{ marginBottom: 15 }}>
                      <h4 style={{ marginTop: 0, marginBottom: 5, borderBottom: '1px solid #444', paddingBottom: 8 }}>
                        {rateDisplayMode !== 'byFlatRate' ? 'Rates by Validity Period' : 'Flat Rates'}
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>
                        {rateDisplayMode === 'bySeasonAuto'
                          ? 'Rates auto-populated by season from Hotel Rates. Adjust if needed.'
                          : 'Rates are not auto-loaded. Enter rates manually or ensure hotel rate data is available.'}
                      </p>
                    </div>
                    
                    {rateDisplayMode !== 'byFlatRate' ? (
                      // Season modes (Automatic and Manual) - show rates for each validity period
                      validityDates.map((dateRange, validityIdx) => {
                        // Ensure validityRates exists and is an array
                        const validityRates = Array.isArray(ac.validityRates) ? ac.validityRates : [];
                        const validityRate = validityRates.length > validityIdx && validityRates[validityIdx]
                          ? validityRates[validityIdx]
                          : { season: "Standard", dblRate: "", hbRate: "", sglRate: "" };
                        
                        // Determine season for display depending on mode
                        const autoSeason = determineSeasonFromDate(dateRange.from);
                        const currentSeason = rateDisplayMode === 'bySeasonAuto'
                          ? autoSeason
                          : (validityRate.season || autoSeason);

                        // Seasons available for the selected hotel
                        const availableSeasons = (() => {
                          if (!ac.hotelName || !ac.city || !ac.stars) return ['Standard', 'Low', 'Mid', 'High'];
                          const set = new Set(
                            hotelRates
                              .filter(r => r.City === ac.city && r.Stars == ac.stars && r.Hotel === ac.hotelName)
                              .map(r => r.Season)
                          );
                          // Ensure current season is present to avoid uncontrolled select value
                          if (currentSeason && !set.has(currentSeason)) set.add(currentSeason);
                          return Array.from(set);
                        })();

                        return (
                          <div key={validityIdx} style={{
                            marginBottom: 15,
                            padding: 15,
                            backgroundColor: '#2a2a2a',
                            borderRadius: 8,
                            border: '1px solid #444'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <h5 style={{ margin: 0, color: '#4CAF50' }}>
                                {dateRange.from} to {dateRange.to}
                              </h5>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ marginRight: 8, fontSize: 14 }}>Season:</label>
                                {rateDisplayMode === 'bySeasonAuto' ? (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ padding: '5px 10px', backgroundColor: '#004D40', color: 'white', borderRadius: '4px' }}>
                                      {currentSeason}
                                    </span>
                                    <span style={{ marginLeft: 8, fontSize: 12, color: '#4CAF50', fontWeight: 'bold' }}>
                                      (Auto-determined from date)
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    value={currentSeason}
                                    onChange={async (e) => {
                                      const chosenSeason = e.target.value;
                                      // Load rates for chosen season for this hotel
                                      const rates = ac.city && ac.stars && ac.hotelName
                                        ? findHotelRates(ac.city, ac.stars, ac.hotelName, chosenSeason)
                                        : null;

                                      setOptions(prev => {
                                        const newOptions = JSON.parse(JSON.stringify(prev));
                                        const accom = newOptions[optIdx]?.accommodations[idx];
                                        if (!accom) return prev;

                                        if (!Array.isArray(accom.validityRates)) {
                                          accom.validityRates = [];
                                        }
                                        while (accom.validityRates.length <= validityIdx) {
                                          accom.validityRates.push({
                                            validityDateIndex: accom.validityRates.length,
                                            season: chosenSeason,
                                            dblRate: "",
                                            hbRate: "",
                                            sglRate: ""
                                          });
                                        }
                                        accom.validityRates[validityIdx] = {
                                          ...accom.validityRates[validityIdx],
                                          season: chosenSeason,
                                          dblRate: rates && rates.dblRate !== undefined ? rates.dblRate : accom.validityRates[validityIdx]?.dblRate || "",
                                          hbRate: rates && rates.hbRate !== undefined ? rates.hbRate : accom.validityRates[validityIdx]?.hbRate || "",
                                          sglRate: rates && rates.sglRate !== undefined ? rates.sglRate : accom.validityRates[validityIdx]?.sglRate || ""
                                        };
                                        return newOptions;
                                      });

                                      debouncedForceUpdate();
                                    }}
                                    style={inputStyle}
                                    disabled={!ac.hotelName}
                                    title={!ac.hotelName ? 'Select City, Stars and Hotel first' : undefined}
                                  >
                                    {availableSeasons.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
                              <div>
                                <label style={labelStyle}>
                                  DBL B/B Rate
                                  {validityRate.dblRate && (
                                    <span style={{ marginLeft: 5, fontSize: 12, color: '#4CAF50' }}>
                                      ✓
                                    </span>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  value={validityRate.dblRate || ""}
                                  onChange={e => handleAccomChange(optIdx, idx, "dblRate", e.target.value, validityIdx)}
                                  style={{
                                    ...inputStyle,
                                    borderColor: validityRate.dblRate ? '#4CAF50' : '#444',
                                    backgroundColor: validityRate.dblRate ? '#1a3a2a' : '#2a2a2a'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>
                                  H/B Supp.
                                  {validityRate.hbRate && (
                                    <span style={{ marginLeft: 5, fontSize: 12, color: '#4CAF50' }}>
                                      ✓
                                    </span>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  value={validityRate.hbRate || ""}
                                  onChange={e => handleAccomChange(optIdx, idx, "hbRate", e.target.value, validityIdx)}
                                  style={{
                                    ...inputStyle,
                                    borderColor: validityRate.hbRate ? '#4CAF50' : '#444',
                                    backgroundColor: validityRate.hbRate ? '#1a3a2a' : '#2a2a2a'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>
                                  SGL Rate
                                  {validityRate.sglRate && (
                                    <span style={{ marginLeft: 5, fontSize: 12, color: '#4CAF50' }}>
                                      ✓
                                    </span>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  value={validityRate.sglRate || ""}
                                  onChange={e => handleAccomChange(optIdx, idx, "sglRate", e.target.value, validityIdx)}
                                  style={{
                                    ...inputStyle,
                                    borderColor: validityRate.sglRate ? '#4CAF50' : '#444',
                                    backgroundColor: validityRate.sglRate ? '#1a3a2a' : '#2a2a2a'
                                  }}
                                />
                              </div>

                              {/* Manual mode: Show High Season Supp or Low Season Reduction */}
                              {rateDisplayMode === 'bySeasonManual' && ac.hotelName && ac.city && ac.stars && (() => {
                                const hotelRatesForHotel = hotelRates.filter(r =>
                                  r.City === ac.city && r.Stars == ac.stars && r.Hotel === ac.hotelName
                                );
                                const highRate = hotelRatesForHotel.find(r => (r.Season || '').toLowerCase().includes('high'));
                                const lowRate  = hotelRatesForHotel.find(r => (r.Season || '').toLowerCase().includes('low'));
                                const diff = (highRate && lowRate)
                                  ? ((parseFloat(highRate.Rate_DBL) || 0) - (parseFloat(lowRate.Rate_DBL) || 0))
                                  : null;
                                const cs = (currentSeason || '').toLowerCase();

                                if (diff === null) {
                                  return (
                                    <div>
                                      <label style={labelStyle}>Season Difference</label>
                                      <div style={{
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #444",
                                        backgroundColor: "#333",
                                        color: "#fff",
                                        fontSize: 14
                                      }}>
                                        N/A
                                      </div>
                                    </div>
                                  );
                                }

                                if (cs.includes('low')) {
                                  return (
                                    <div>
                                      <label style={labelStyle}>High Season Supp.</label>
                                      <input
                                        type="text"
                                        value={diff.toFixed(2)}
                                        readOnly
                                        style={{ ...inputStyle, backgroundColor: "#333", borderColor: "#4CAF50" }}
                                      />
                                    </div>
                                  );
                                }

                                if (cs.includes('high')) {
                                  return (
                                    <div>
                                      <label style={labelStyle}>Low Season Reduction</label>
                                      <input
                                        type="text"
                                        value={(-diff).toFixed(2)}
                                        readOnly
                                        style={{ ...inputStyle, backgroundColor: "#333", borderColor: "#FF9800", color: "#FFCC80" }}
                                      />
                                    </div>
                                  );
                                }

                                return null;
                              })()}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // By Flat Rate mode - show a single set of rates for all validity periods
                      <div style={{
                        marginBottom: 15,
                        padding: 15,
                        backgroundColor: '#2a2a2a',
                        borderRadius: 8,
                        border: '1px solid #444'
                      }}>
                        <div style={{ marginBottom: 10 }}>
                          <h5 style={{ margin: 0, color: '#4CAF50' }}>
                            Flat Rate for All Validity Periods
                          </h5>
                          <p style={{ fontSize: 13, color: '#aaa', margin: '5px 0' }}>
                            These rates are editable and will apply to all validity periods
                          </p>
                          <p style={{ fontSize: 13, color: '#ff9800', margin: '5px 0', fontWeight: 'bold' }}>
                            Enter your custom rates below to override the season-based rates
                          </p>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
                          <div>
                            <label style={labelStyle}>
                              DBL B/B Rate <span style={{ color: '#4CAF50', fontSize: '12px' }}>(Editable ✏️)</span>
                            </label>
                            <input
                              type="text"
                              value={ac.flatRate?.dblRate || ""}
                              onChange={e => {
                                // Update flat rate for all validity periods
                                const newValue = e.target.value;
                                setOptions(prev => {
                                  const newOptions = [...prev];
                                  const option = newOptions[optIdx];
                                  const accom = option.accommodations[idx];
                                  
                                  // Ensure flatRate object exists
                                  if (!accom.flatRate) {
                                    accom.flatRate = { dblRate: "", hbRate: "", sglRate: "" };
                                  }
                                  
                                  // Update the flat rate
                                  accom.flatRate.dblRate = newValue;
                                  
                                  // Update all validity rates with this value
                                  if (Array.isArray(accom.validityRates)) {
                                    accom.validityRates.forEach(rate => {
                                      rate.dblRate = newValue;
                                    });
                                  }
                                  
                                  return newOptions;
                                });
                                
                                // Use debounced force update to prevent rapid recalculations
                                console.log("Flat rate updated, scheduling debounced recalculation");
                                debouncedForceUpdate();
                              }}
                              style={{
                                ...inputStyle,
                                backgroundColor: '#1a3a2a',
                                borderColor: '#4CAF50',
                                borderWidth: '2px'
                              }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>
                              H/B Supp. <span style={{ color: '#4CAF50', fontSize: '12px' }}>(Editable ✏️)</span>
                            </label>
                            <input
                              type="text"
                              value={ac.flatRate?.hbRate || ""}
                              onChange={e => {
                                // Update flat rate for all validity periods
                                const newValue = e.target.value;
                                setOptions(prev => {
                                  const newOptions = [...prev];
                                  const option = newOptions[optIdx];
                                  const accom = option.accommodations[idx];
                                  
                                  // Ensure flatRate object exists
                                  if (!accom.flatRate) {
                                    accom.flatRate = { dblRate: "", hbRate: "", sglRate: "" };
                                  }
                                  
                                  // Update the flat rate
                                  accom.flatRate.hbRate = newValue;
                                  
                                  // Update all validity rates with this value
                                  if (Array.isArray(accom.validityRates)) {
                                    accom.validityRates.forEach(rate => {
                                      rate.hbRate = newValue;
                                    });
                                  }
                                  
                                  return newOptions;
                                });
                                
                                // Use debounced force update to prevent rapid recalculations
                                console.log("Flat rate updated, scheduling debounced recalculation");
                                debouncedForceUpdate();
                              }}
                              style={{
                                ...inputStyle,
                                backgroundColor: '#1a3a2a',
                                borderColor: '#4CAF50',
                                borderWidth: '2px'
                              }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>
                              SGL Rate <span style={{ color: '#4CAF50', fontSize: '12px' }}>(Editable ✏️)</span>
                            </label>
                            <input
                              type="text"
                              value={ac.flatRate?.sglRate || ""}
                              onChange={e => {
                                // Update flat rate for all validity periods
                                const newValue = e.target.value;
                                setOptions(prev => {
                                  const newOptions = [...prev];
                                  const option = newOptions[optIdx];
                                  const accom = option.accommodations[idx];
                                  
                                  // Ensure flatRate object exists
                                  if (!accom.flatRate) {
                                    accom.flatRate = { dblRate: "", hbRate: "", sglRate: "" };
                                  }
                                  
                                  // Update the flat rate
                                  accom.flatRate.sglRate = newValue;
                                  
                                  // Update all validity rates with this value
                                  if (Array.isArray(accom.validityRates)) {
                                    accom.validityRates.forEach(rate => {
                                      rate.sglRate = newValue;
                                    });
                                  }
                                  
                                  return newOptions;
                                });
                                
                                // Use debounced force update to prevent rapid recalculations
                                console.log("Flat rate updated, scheduling debounced recalculation");
                                debouncedForceUpdate();
                              }}
                              style={{
                                ...inputStyle,
                                backgroundColor: '#1a3a2a',
                                borderColor: '#4CAF50',
                                borderWidth: '2px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button type="button" 
              onClick={() => addAccommodation(optIdx)}
              style={{ marginBottom:10, padding:"6px 12px", borderRadius:6, backgroundColor:"#444", color:"#fff", border:"none" }}
            >
              + Add Accommodation
            </button>
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', marginTop: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: 8 }}>
                  Subtotal Option {optIdx + 1} for {selectedPaxRanges.length > 1
                    ? `${selectedPaxRanges.length} Selected Pax Ranges`
                    : (() => {
                        // Find the matching pax range from our defined ranges
                        const paxValue = parseInt(selectedPaxRanges[0]);
                        const ranges = [
                          { value: 1, label: '1 pax' },
                          { value: 2, label: '2-3 pax' },
                          { value: 4, label: '4-5 pax' },
                          { value: 6, label: '6-7 pax' },
                          { value: 8, label: '8-9 pax' },
                          { value: 10, label: '10-14 pax' },
                          { value: 15, label: '15-19 pax' },
                          { value: 20, label: '20-24 pax' },
                          { value: 25, label: '25-29 pax' },
                          { value: 30, label: '30-34 pax' },
                          { value: 35, label: '35-39 pax' },
                          { value: 40, label: '40-44 pax' },
                          { value: 45, label: '45-49 pax' }
                        ];
                        const range = ranges.find(r => r.value === paxValue);
                        return range ? range.label : `${paxValue} pax`;
                      })()}
                </h4>
                {forceUpdate > 0 && (
                  <div style={{
                    fontSize: 12,
                    color: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid #4CAF50'
                  }}>
                    Calculations updated
                  </div>
                )}
              </div>
              
              {validityDates.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {validityCosts.map(cost => {
                    // Ensure the validity date exists
                    const validityDate = validityDates[cost.validityIdx];
                    if (!validityDate) return null;
                    
                    // Get the result for this validity date
                    const result = calculationResults[selectedPaxRanges[0]]?.[optIdx]?.[cost.validityIdx];
                    const subtotals = result?.subtotals || { baseCosts: 0, accommodationCosts: 0, baseCostsPerPerson: 0 };
                    
                    // Compute accommodation breakdown for this validity index
                    const paxCount = parseInt(selectedPaxRanges[0]) || 0;
                    const acBreakdown = (opt.accommodations || []).map((accom, aIdx) => {
                      const nights = Number(accom.nights) || 1;
                      let dblRate = 0, sglRate = 0, hbRate = 0, seasonUsed = "Standard";
                      if (rateDisplayMode === 'byFlatRate' && accom.flatRate) {
                        dblRate = parseFloat(accom.flatRate.dblRate) || 0;
                        sglRate = parseFloat(accom.flatRate.sglRate) || 0;
                        hbRate = parseFloat(accom.flatRate.hbRate) || 0;
                        seasonUsed = "Flat Rate";
                      } else {
                        const vr = Array.isArray(accom.validityRates) && accom.validityRates[cost.validityIdx]
                          ? accom.validityRates[cost.validityIdx] : { season: "Standard", dblRate: 0, sglRate: 0, hbRate: 0 };
                        seasonUsed = vr.season || "Standard";
                        dblRate = parseFloat(vr.dblRate) || 0;
                        sglRate = parseFloat(vr.sglRate) || 0;
                        hbRate = parseFloat(vr.hbRate) || 0;
                      }
                      const board = accom.board || "B/B";
                      let perPersonPerNight = 0;
                      if (board === "B/B") {
                        perPersonPerNight = dblRate;
                      } else if (board === "H/B") {
                        perPersonPerNight = dblRate + hbRate;
                      } else if (board === "SGL Supplement") {
                        perPersonPerNight = dblRate + sglRate;
                      } else if (board === "SGL + HB") {
                        perPersonPerNight = dblRate + sglRate + hbRate;
                      } else {
                        perPersonPerNight = dblRate;
                      }
                      const perPersonForStay = perPersonPerNight * nights;
                      const totalForStay = perPersonForStay * paxCount;
                      return {
                        hotelName: accom.hotelName || `Accommodation ${aIdx + 1}`,
                        city: accom.city || "",
                        stars: accom.stars || "",
                        board,
                        nights,
                        season: seasonUsed,
                        dblRate,
                        sglRate,
                        hbRate,
                        perPersonPerNight,
                        perPersonForStay,
                        totalForStay
                      };
                    });
                    const accomPerPersonComputed = acBreakdown.reduce((sum, b) => sum + (b.perPersonForStay || 0), 0);
                    const baseCostsPerPerson = subtotals.baseCostsPerPerson || 0;
                    const totalWithProfitPerPerson = (accomPerPersonComputed + baseCostsPerPerson) * (1 + profitMargin);
                    
                    return (
                      <div key={cost.validityIdx} style={{
                        backgroundColor: '#2a2a2a',
                        padding: '15px',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          fontWeight: 'bold',
                          borderBottom: '1px solid #444',
                          paddingBottom: '5px'
                        }}>
                          <span>
                            {validityDate.from} to {validityDate.to}:
                          </span>
                          <span style={{ color: '#4CAF50' }}>
                            Subtotal and Profit Details
                          </span>
                        </div>
                        
                        {/* Show subtotal and total with profit */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#aaa', fontSize: '14px' }}>Accommodation Subtotal:</span>
                            <span style={{ color: '#fff', fontSize: '14px' }}>${(accomPerPersonComputed || 0).toFixed(2)} per person</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '5px',
                            paddingTop: '5px',
                            borderTop: '1px dashed #444',
                            fontWeight: 'bold'
                          }}>
                            <span style={{ color: '#fff', fontSize: '14px' }}>Total with {(profitMargin * 100).toFixed(0)}% profit:</span>
                            <span style={{ color: '#fff', fontSize: '15px' }}>${(totalWithProfitPerPerson || 0).toFixed(2)} per person</span>
                          </div>
                        </div>
                        
                        {/* Hotel-by-hotel breakdown */}
                        <div style={{ marginTop: '10px', backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '4px', padding: '10px' }}>
                          <div style={{ fontWeight: 'bold', color: '#ccc', marginBottom: '8px' }}>Accommodation Breakdown</div>
                          {acBreakdown.length === 0 ? (
                            <div style={{ color: '#aaa' }}>No accommodations added.</div>
                          ) : (
                            acBreakdown.map((b, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '6px 0',
                                  borderBottom: idx < acBreakdown.length - 1 ? '1px dashed #333' : 'none'
                                }}
                              >
                                <div style={{ color: '#ddd', fontSize: '13px' }}>
                                  {b.hotelName} {b.city ? `(${b.city})` : ''}{b.stars ? `, ${b.stars}★` : ''} • {b.board} • {b.nights} night{b.nights > 1 ? 's' : ''} • {b.season}
                                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>
                                    Rate used: DBL {b.dblRate.toFixed(2)}
                                    {b.board.includes('HB') ? ` + HB ${b.hbRate.toFixed(2)}` : ''}
                                    {b.board.includes('SGL') ? ` + SGL ${b.sglRate.toFixed(2)}` : ''} per night
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#fff', fontSize: '13px' }}>${b.perPersonForStay.toFixed(2)} per person</div>
                                  <div style={{ fontSize: '11px', color: '#aaa' }}>${b.perPersonPerNight.toFixed(2)} × {b.nights}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'right', fontSize: 16 }}>
                  No validity dates defined
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      <div style={{ marginTop:20 }}>
        <label style={labelStyle}>Profit Margin (%):</label>{" "}
        <input
          type="number"
          value={profitMargin*100}
          onChange={e=>setProfitMargin(Number(e.target.value)/100)}
          style={{ ...inputStyle, maxWidth:100 }}
        />%
      </div>
      
      <div style={{ marginTop:20 }}>
        <label style={labelStyle}>Water Included?</label>{" "}
        <input
          type="checkbox"
          checked={waterIncluded}
          onChange={e=>setWaterIncluded(e.target.checked)}
          style={{ transform: "scale(1.3)", marginLeft: 10 }}
        />
        <small style={{ color: "#aaa", fontSize: "11px", marginLeft: "10px" }}>
          Adds flat water cost per person: $3 (≤7 nights) or $4 (&gt;7 nights)
        </small>
      </div>
      
      <h3 style={{ marginTop: 40 }}>Final Totals with Profit</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
        {selectedPaxRanges.map(paxKey => {
          const result = calculationResults[paxKey] || {};
          // Use our defined PAX ranges to get the label
          const paxValue = parseInt(paxKey);
          const paxRange = PAX_RANGES.find(r => r.value === paxValue);
          const paxLabel = paxRange ? paxRange.label : `${paxValue} pax`;
          
          return (
            <div key={paxKey} style={{ ...sectionStyle, backgroundColor: "#111" }}>
              <h4 style={{ borderBottom: "1px solid #444", paddingBottom: 10, marginBottom: 15 }}>
                Results for {paxLabel}
                <span style={{ backgroundColor: "#004D40", color: "white", padding: "3px 8px", borderRadius: "4px", marginLeft: "8px", fontSize: "14px" }}>
                  {(() => {
                    // Find the matching pax range from our defined ranges
                    const paxValue = parseInt(paxKey);
                    const ranges = [
                      { value: 1, label: '1 pax' },
                      { value: 2, label: '2-3 pax' },
                      { value: 4, label: '4-5 pax' },
                      { value: 6, label: '6-7 pax' },
                      { value: 8, label: '8-9 pax' },
                      { value: 10, label: '10-14 pax' },
                      { value: 15, label: '15-19 pax' },
                      { value: 20, label: '20-24 pax' },
                      { value: 25, label: '25-29 pax' },
                      { value: 30, label: '30-34 pax' },
                      { value: 35, label: '35-39 pax' },
                      { value: 40, label: '40-44 pax' },
                      { value: 45, label: '45-49 pax' }
                    ];
                    const range = ranges.find(r => r.value === paxValue);
                    return range ? range.label : `${paxValue} pax`;
                  })()}
                </span>
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
                    <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid " + "#333" }}>
                      <input
                        type="number"
                        value={result.transportPerPerson || 0}
                        onChange={(e) => {
                          const paxInt = parseInt(paxKey, 10) || 0;
                          const perPerson = parseFloat(e.target.value) || 0;
                          const groupTotal = paxInt > 0 ? perPerson * paxInt : perPerson;
                          handleManualUpdate(paxKey, 'transport', groupTotal);
                        }}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'entrances', e.target.value)}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'jeep', e.target.value)}
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
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>Local Guide (per person)</td>
                    <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      <input
                        type="number"
                        value={result.localGuide || 0}
                        onChange={(e) => handleManualUpdate(paxKey, 'localGuide', e.target.value)}
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
                  <tr style={{ backgroundColor: "transparent" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      {"Private Guide (per person)"}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'privateGuide', e.target.value)}
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
                  {waterIncluded && (
                    <tr style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                        Water
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                          $3 per person (≤7 nights), $4 per person (&gt;7 nights)
                        </div>
                        <div style={{ fontSize: "11px", color: "#4CAF50", marginTop: "2px", fontWeight: "bold" }}>
                          Auto-calculated: ${(() => { const programNights = rows.length > 0 ? Math.max(0, rows.length - 1) : 0; const perPerson = programNights <= 7 ? 3 : 4; return perPerson; })().toFixed(2)}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                        <input
                          type="number"
                          value={result.water || 0}
                          onChange={(e) => handleManualUpdate(paxKey, 'water', e.target.value)}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'meals', e.target.value)}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'meetAssist', e.target.value)}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'extras', e.target.value)}
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
                  <tr style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      Tips & Portage
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                        Per person, once per program
                      </div>
                      <div style={{ fontSize: "11px", color: "#4CAF50", marginTop: "2px", fontWeight: "bold" }}>
                        Auto-calculated: ${(calculateTipsAndPortages(parseInt(paxKey))).toFixed(2)} per person
                      </div>
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      <input
                        type="number"
                        value={result.tips || 0}
                        onChange={(e) => handleManualUpdate(paxKey, 'tips', e.target.value)}
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
                  <tr style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      Bank Commission
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                        Per person, once per program (same tiers as Tips & Portage)
                      </div>
                      <div style={{ fontSize: "11px", color: "#4CAF50", marginTop: "2px", fontWeight: "bold" }}>
                        Auto-calculated: ${(calculateBankCommission(parseInt(paxKey))).toFixed(2)} per person
                      </div>
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333" }}>
                      <input
                        type="number"
                        value={result.commission || 0}
                        onChange={(e) => handleManualUpdate(paxKey, 'commission', e.target.value)}
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
                        onChange={(e) => handleManualUpdate(paxKey, 'baseCostPerPersonUSD', e.target.value)}
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
                  {validityDates.length > 0 ? (
                    // For each validity date, show the option costs
                    validityDates.map((dateRange, validityIdx) => {
                      return (
                        <React.Fragment key={validityIdx}>
                          <tr style={{ backgroundColor: "#444" }}>
                            <td colSpan="2" style={{ padding: "8px 12px", fontWeight: "bold", color: "#fff" }}>
                              {dateRange.from} to {dateRange.to}
                            </td>
                          </tr>
                          {options.map((opt, optIdx) => {
                            const optionResult = result[optIdx]?.[validityIdx];
                            const paxInt = parseInt(paxKey, 10) || 0;
                            // Base per person (already computed in results)
                            const basePerPerson = result.baseCostPerPersonUSD || 0;
                            // Accommodation subtotal per person from stored subtotals
                            const accomPerPerson = paxInt > 0 ? ((optionResult?.subtotals?.accommodationCosts || 0) / paxInt) : 0;
                            // Subtotal before profit = base + accommodation
                            const perPersonSubtotal = basePerPerson + accomPerPerson;
                            // Apply profit margin
                            const totalWithProfit = perPersonSubtotal * (1 + profitMargin);
                            
                            return (
                              <tr key={`${validityIdx}-${optIdx}`} style={{ backgroundColor: optIdx === 0 ? "#004D40" : "#00695C" }}>
                                <td style={{ padding: "12px", borderBottom: optIdx === options.length - 1 ? "none" : "1px solid #005a4e" }}>
                                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>Option {optIdx + 1}</div>
                                  <div style={{ fontSize: "13px", color: "#eee", marginTop: "5px" }}>
                                    Hotels: {opt.accommodations.map(a => (a.hotelName ? `${a.hotelName}` : 'N/A')).join(' - ')}
                                  </div>
                                </td>
                                <td style={{
                                  textAlign: "right",
                                  padding: "12px",
                                  fontWeight: "bold",
                                  fontSize: "16px",
                                  borderBottom: optIdx === options.length - 1 ? "none" : "1px solid #005a4e"
                                }}>
                                  <input
                                    type="number"
                                    value={totalWithProfit.toFixed(2)}
                                    step="0.01"
                                    onChange={(e) => handleOptionUpdate(paxKey, optIdx, validityIdx, e.target.value)}
                                    style={{
                                      width: "100px",
                                      padding: "4px 8px",
                                      backgroundColor: optIdx === 0 ? "#004D40" : "#00695C",
                                      color: "#fff",
                                      border: "1px solid #00796B",
                                      borderRadius: "4px",
                                      textAlign: "right",
                                      fontWeight: "bold"
                                    }}
                                  />
                                  <div style={{ marginTop: 6, fontSize: 12, color: "#e0f2f1" }}>
                                    Base ${basePerPerson.toFixed(2)} + Accom ${accomPerPerson.toFixed(2)} = ${perPersonSubtotal.toFixed(2)} • +{(profitMargin * 100).toFixed(0)}% ⇒ ${totalWithProfit.toFixed(2)}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    // If no validity dates, show the option costs directly
                    options.map((opt, i) => {
                      const paxInt = parseInt(paxKey);
                      const optionCostResult = calculateOptionCost(opt, paxInt);
                      const perPersonCost = paxInt > 0
                        ? ((optionCostResult.accommodationCosts || 0) / paxInt) + (optionCostResult.baseCostsPerPerson || 0)
                        : 0;
                      // Apply profit margin to per-person total
                      const totalWithProfit = perPersonCost * (1 + profitMargin);
                      
                      return (
                        <tr key={i} style={{ backgroundColor: i === 0 ? "#004D40" : "#00695C" }}>
                          <td style={{ padding: "12px", borderBottom: i === options.length - 1 ? "none" : "1px solid #005a4e" }}>
                            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Option {i + 1}</div>
                            <div style={{ fontSize: "13px", color: "#eee", marginTop: "5px" }}>
                              Hotels: {opt.accommodations.map(a => (a.hotelName ? `${a.hotelName}` : 'N/A')).join(' - ')}
                            </div>
                          </td>
                          <td style={{
                            textAlign: "right",
                            padding: "12px",
                            fontWeight: "bold",
                            fontSize: "16px",
                            borderBottom: i === options.length - 1 ? "none" : "1px solid #005a4e"
                          }}>
                            <input
                              type="number"
                              value={totalWithProfit.toFixed(2)}
                              step="0.01"
                              onChange={(e) => handleOptionUpdate(paxKey, i, -1, e.target.value)}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
