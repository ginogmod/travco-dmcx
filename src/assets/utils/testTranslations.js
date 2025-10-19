// src/assets/utils/testTranslations.js
import { generateOfferPDF } from './generateOfferPDF';
import translations from '../translations';

/**
 * Test utility to generate PDFs in all available languages
 * This can be used to verify that translations are working correctly
 * 
 * @param {Object} testData - Sample data for PDF generation
 */
export function testAllLanguages(testData = null) {
  // Default test data if none provided
  const defaultTestData = {
    groupName: "Translation Test Group",
    agent: "Test Travel Agency",
    dateArr: new Date().toISOString().split('T')[0],
    dateDep: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    message: "This is a test message to verify translations are working correctly.",
    itinerary: "Day 1: Arrival - Amman\nDay 2: Amman - Petra\nDay 3: Petra - Wadi Rum\nDay 4: Wadi Rum - Dead Sea\nDay 5: Dead Sea - Departure",
    inclusions: "Airport transfers\nAccommodation\nBreakfast daily\nEnglish speaking guide\nEntrance fees",
    exclusions: "International flights\nVisa fees\nPersonal expenses\nTips\nTravel insurance",
    signatureKey: "shatha",
    options: [
      {
        accommodations: [
          {
            hotelName: "Test Hotel Amman",
            city: "Amman",
            stars: 5,
            nights: 1,
            category: "Luxury",
            dblRate: 100,
            sglRate: 150,
            hbRate: 25
          },
          {
            hotelName: "Test Hotel Petra",
            city: "Petra",
            stars: 4,
            nights: 1,
            category: "Superior",
            dblRate: 120,
            sglRate: 180,
            hbRate: 30
          }
        ],
        sglSupp: 110,
        hbSupp: 28
      }
    ],
    quotations: [
      {
        pax: 2,
        options: [
          {
            totalCost: 500
          }
        ]
      },
      {
        pax: 4,
        options: [
          {
            totalCost: 450
          }
        ]
      }
    ]
  };

  // Use provided test data or default
  const data = testData || defaultTestData;
  
  // Get all available languages
  const languages = Object.keys(translations);
  
  console.log(`Testing PDF generation in ${languages.length} languages...`);
  
  // Generate a PDF for each language
  languages.forEach(language => {
    console.log(`Generating PDF in ${language}...`);
    try {
      generateOfferPDF({
        ...data,
        language
      });
      console.log(`✅ Successfully generated PDF in ${language}`);
    } catch (error) {
      console.error(`❌ Error generating PDF in ${language}:`, error);
    }
  });
  
  console.log('PDF generation test completed. Check your downloads folder for the generated PDFs.');
}

// Example usage:
// import { testAllLanguages } from './testTranslations';
// testAllLanguages();