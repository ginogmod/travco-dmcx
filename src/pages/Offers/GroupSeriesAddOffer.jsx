// src/pages/Offers/GroupSeriesAddOffer.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { generateGSOfferPDF } from "../../assets/utils/generateGSOfferPDF";
import { generateOfferWord } from "../../assets/utils/generateOfferWord";
import { saveToStorage, getOneFromStorage, updateInStorage, getAllFromStorage } from "../../assets/utils/storage";
import autoContentTranslations from "../../assets/translations/autoContent";

function GroupSeriesAddOffer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isViewMode, setIsViewMode] = useState(false);
  const [offerData, setOfferData] = useState({
    fileNo: `OFF-${Date.now()}`,
    groupName: "",
    agent: "",
    nationality: "",
    dateArr: "",
    dateDep: "",
    programLength: "",
    message: "",
    itinerary: "",
    inclusions: "",
    exclusions: "",
    createdBy: "",
    signatureKey: "",
    // PDF images (select from dropdown like AddOffer.jsx)
    mainImage: "",
    smallImage1: "",
    smallImage2: "",
    smallImage3: "",
    // Options visibility checkboxes for PDF
    showOption1: true,
    showOption2: true,
    showOption3: true
  });
  const [quotationData, setQuotationData] = useState([]);
  const [options, setOptions] = useState([]);
  const [validityDates, setValidityDates] = useState([]);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [optionals, setOptionals] = useState([]);
  // Carry forward calculated results from Group Series quotation to build Rates Per Person table
  const [calcResults, setCalcResults] = useState({});

  // Continuation itinerary images (Page 2, 3, ...)
  // Each entry: { main, small1, small2, small3 }
  const [continuationImages, setContinuationImages] = useState([]);

  // Preserve structured itinerary rows (with multi-day metadata) if provided via navigation or stored offer
  const [structuredItineraryRows, setStructuredItineraryRows] = useState([]);
  const [quotationId, setQuotationId] = useState(null);

  // Count itinerary days based on "Day N:" pattern
  const countDaysFromItinerary = (txt) => {
    if (!txt) return 0;
    const lines = String(txt).split("\n");
    return lines.filter(line => /^Day\s*\d+/i.test(line.trim())).length;
  };

  // Resize continuation pages when itinerary changes (3 days per page):
  // Page 1 = days 1..3 (uses mainImage + smallImage1..3)
  // Page 2 = days 4..6 (continuationImages[0]), Page 3 = days 7..9 (continuationImages[1]), etc.
  useEffect(() => {
    const days = countDaysFromItinerary(offerData.itinerary);
    const continuationPages = Math.max(0, Math.ceil(days / 3) - 1);
    setContinuationImages(prev => {
      const next = [...prev];
      while (next.length < continuationPages) {
        next.push({ main: "", small1: "", small2: "", small3: "" });
      }
      if (next.length > continuationPages) next.length = continuationPages;
      return next;
    });
  }, [offerData.itinerary]);

  // Flatten continuation images into a single ordered list consumed by the PDF generator:
  // For each continuation page: [main, small1, small2, small3]
  const getFlatAdditionalImagesFromState = (pages) => {
    const out = [];
    (Array.isArray(pages) ? pages : []).forEach(p => {
      if (p?.main) out.push(p.main);
      if (p?.small1) out.push(p.small1);
      if (p?.small2) out.push(p.small2);
      if (p?.small3) out.push(p.small3);
    });
    return out;
  };

  // Options list for selects (keep in sync with AddOffer.jsx)
  const renderImageOptions = () => (
    <>
      <option value="">Select Image</option>
      <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
      <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
      <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
      <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
      <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
      <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
      <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
      <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
      <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
      <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
    </>
  );

  // Entrance fees for computing optional activity subtotals (fallback defaults)
  const [fees, setFees] = useState([
    { "Travco Jordan": "Petra", "__1": "50.00" },
    { "Travco Jordan": "Jerash", "__1": "14.00" },
    { "Travco Jordan": "Wadi Rum", "__1": "7.00" }
  ]);

  // Load entrance fees once with fallbacks and basic sanitization
  useEffect(() => {
    fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
      .then(res => res.json())
      .then((entranceFees) => {
        if (Array.isArray(entranceFees) && entranceFees.length > 1) {
          const filtered = entranceFees
            .slice(1)
            .filter(fee => {
              const name = fee["Travco Jordan"] || "";
              return !name.toLowerCase().includes("guide");
            })
            .map(fee => ({
              ...fee,
              "__1": fee["__1"] ? String(parseFloat(fee["__1"]).toFixed(2)) : "0.00"
            }));
          if (filtered.length) setFees(filtered);
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, []);

  // Extras costs mirror (subset) used to compute per-person optional totals on Offer page
  // Note: values are USD per person where applicable
  const EXTRAS_COSTS = {
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

  const getEntranceFeeUSD = (name) => {
    if (!name) return 0;
    const fee = fees.find(f => f["Travco Jordan"] === name);
    if (fee && fee["__1"]) {
      const n = parseFloat(fee["__1"]);
      return isNaN(n) ? 0 : n;
    }
    // fallbacks for common sites
    if (name === "Petra") return 50;
    if (name === "Jerash") return 14;
    if (name === "Wadi Rum") return 7;
    return 0;
  };

  const extractExperienceCost = (text) => {
    if (!text || typeof text !== "string") return 0;
    const m = text.match(/cost:\s*\$?(\d+(?:\.\d+)?)/i);
    return m ? parseFloat(m[1]) || 0 : 0;
  };

  // Compute per-person subtotal for a single optional activity
  const calculateOptionalActivitySubtotal = (activity) => {
    try {
      let subtotal = 0;
      // extras
      if (Array.isArray(activity?.extras)) {
        activity.extras.forEach(extraName => {
          subtotal += EXTRAS_COSTS[extraName] || 0;
        });
      }
      // entrances
      if (Array.isArray(activity?.entrances)) {
        activity.entrances.forEach(entranceName => {
          subtotal += getEntranceFeeUSD(entranceName);
        });
      }
      // experiences free text "cost: $X"
      subtotal += extractExperienceCost(activity?.experiences);
      return parseFloat((subtotal || 0).toFixed(2));
    } catch {
      return 0;
    }
  };

  // Normalization helpers for optionals
  const normalizeOptional = (item = {}) => {
    // Already structured
    if (typeof item === "object" && (
      "activityName" in item || "day" in item || "extras" in item || "entrances" in item || "experiences" in item
    )) {
      return {
        activityName: item.activityName || item.description || "",
        day: item.day || "",
        extras: Array.isArray(item.extras) ? item.extras : [],
        entrances: Array.isArray(item.entrances) ? item.entrances : [],
        experiences: item.experiences || "",
        price: item.price ?? ""
      };
    }

    // Description-only or string fallback
    const desc = typeof item === "string" ? item : (item.description || "");
    let activityName = desc || "";
    let day = "";
    // Try to parse "Day N: ..." prefix
    const m = /^Day\s+(\d+):\s*(.*)$/i.exec(desc || "");
    if (m) {
      day = m[1];
      activityName = m[2] || "";
    }
    return {
      activityName,
      day,
      extras: [],
      entrances: [],
      experiences: "",
      price: item.price ?? ""
    };
  };

  const normalizeOptionals = (list) => Array.isArray(list) ? list.map(normalizeOptional) : [];

  // Helpers: defaults and auto inclusions similar to AddOffer
  const getDefaultExclusions = (language = "english") => {
    const lang = language.toLowerCase();
    const translations = autoContentTranslations[lang] || autoContentTranslations.english;
    return translations.defaultExclusions;
  };

  const computeAutoInclusions = (dayDetails, language = "english") => {
    const lang = language.toLowerCase();
    const t = autoContentTranslations[lang] || autoContentTranslations.english;

    const inc = new Set();
    let mealDays = [];
    const entranceFees = new Set();

    (dayDetails || []).forEach((row, idx) => {
      if (row && Array.isArray(row.entrances)) {
        row.entrances.forEach(site => {
          if (site) entranceFees.add(site);
        });
      }
      if (row?.guideRequired) {
        if (row.guideType === "Private") {
          inc.add(t.qualifiedPrivateGuide.replace("{language}", row.guideLanguage || "English"));
        } else {
          inc.add(t.qualifiedLocalGuide);
        }
      }
      if (row?.transportType) inc.add(t.transportation);
      inc.add(t.meetAndAssist);
      inc.add(t.applicableTaxes);
      if (row?.mealIncluded) mealDays.push(idx + 1);
    });

    if (mealDays.length)
      inc.add(t.mealsOnDays.replace("{days}", mealDays.join(", ")));

    if (entranceFees.size > 0) {
      inc.add(t.entranceFees.replace("{sites}", Array.from(entranceFees).join(", ")));
    }

    return Array.from(inc);
  };
// Helper: find a matching Group Series quotation for a given offer payload
const findMatchingQuotation = async (offer) => {
  try {
    const allQuotations = await getAllFromStorage("quotations");
    const gs = (allQuotations || []).filter(q => q && q.isGroupSeries);

    if (!gs.length) return null;

    // 1) Direct by quotationId if present
    if (offer?.quotationId) {
      const found = gs.find(q => String(q.id) === String(offer.quotationId));
      if (found) return found.id;
    }

    // 2) Match by group name
    const groupName = offer?.groupName || offer?.group || "";
    let candidates = groupName ? gs.filter(q => (q.group || "") === groupName) : gs.slice();

    // 3) If validity periods provided, try overlap
    const ranges = Array.isArray(offer?.validityDates) ? offer.validityDates : [];
    const overlaps = (a, b) => {
      try {
        const aFrom = new Date(a.from); const aTo = new Date(a.to);
        const bFrom = new Date(b.from); const bTo = new Date(b.to);
        return (aFrom <= bTo) && (aTo >= bFrom);
      } catch { return false; }
    };

    if (ranges.length) {
      const byValidity = candidates.find(q =>
        Array.isArray(q.validityDates) &&
        q.validityDates.some(qr => ranges.some(r => overlaps(r, qr)))
      );
      if (byValidity) return byValidity.id;
    }

    // 4) Fallback to first candidate
    return candidates.length ? candidates[0].id : null;
  } catch (e) {
    console.error("findMatchingQuotation failed:", e);
    return null;
  }
};

  // Load offer data if in view mode
  useEffect(() => {
    const loadOfferData = async () => {
      if (id) {
        try {
          const offerData = await getOneFromStorage("offers", id);
          if (offerData) {
            // Verify this is a Group Series offer
            if (!offerData.isGroupSeries) {
              console.warn("This is not a Group Series offer, redirecting to standard view");
              return navigate(`/offers/${id}`);
            }
            
            setIsViewMode(true);
            setOfferData({
              fileNo: offerData.fileNo || "",
              groupName: offerData.groupName || "",
              agent: offerData.agent || "",
              nationality: offerData.nationality || "",
              dateArr: offerData.dateArr || "",
              dateDep: offerData.dateDep || "",
              programLength: offerData.programLength || "",
              message: offerData.message || "",
              itinerary: offerData.itinerary || "",
              inclusions: offerData.inclusions || "",
              exclusions: offerData.exclusions || "",
              createdBy: offerData.createdBy || "",
              signatureKey: offerData.signatureKey || "",
              // images persisted on offer
              mainImage: offerData.mainImage || "",
              smallImage1: offerData.smallImage1 || "",
              smallImage2: offerData.smallImage2 || "",
              smallImage3: offerData.smallImage3 || "",
              // options visibility if stored on offer
              showOption1: typeof offerData.showOption1 === "boolean" ? offerData.showOption1 : true,
              showOption2: typeof offerData.showOption2 === "boolean" ? offerData.showOption2 : true,
              showOption3: typeof offerData.showOption3 === "boolean" ? offerData.showOption3 : true
            });
            
            // Set quotation data and options
            if (offerData.quotations) {
              setQuotationData(offerData.quotations);
              
              // Extract optionals from quotations if available
              const extractedOptionals = offerData.quotations.flatMap(q =>
                q.options?.flatMap(opt =>
                  opt.optionals || []
                )
              ).filter(Boolean);
              
              setOptionals(normalizeOptionals(extractedOptionals));
            }
            
            if (offerData.options) {
              setOptions(offerData.options);
            }
            
            // Also check for direct optionals property
            if (offerData.optionals && Array.isArray(offerData.optionals)) {
              setOptionals(normalizeOptionals(offerData.optionals));
            }
            
            // Load validity dates if available
            if (offerData.validityDates && Array.isArray(offerData.validityDates)) {
              setValidityDates(offerData.validityDates);
            } else {
              setValidityDates([]);
            }
            
            // Check if this is a special offer
            setIsSpecialOffer(offerData.isSpecial || false);
            // Carry calculation results (pax -> option -> validity -> costs) for Rates table
            if (offerData.calculationResults && typeof offerData.calculationResults === "object") {
              setCalcResults(offerData.calculationResults);
            }
            // Load continuation images for itinerary continuation pages if saved previously
            setContinuationImages(Array.isArray(offerData.continuationImages) ? offerData.continuationImages : []);

            // Capture structured itinerary rows if present on stored offer (preserves multi-day metadata)
            try {
              if (Array.isArray(offerData.quotations) && offerData.quotations[0]?.itinerary) {
                setStructuredItineraryRows(offerData.quotations[0].itinerary);
              } else if (Array.isArray(offerData.itineraryRows) && offerData.itineraryRows.length > 0) {
                setStructuredItineraryRows(offerData.itineraryRows);
              }
            } catch (_) {}
          }
        } catch (error) {
          console.error("Error loading offer:", error);
        }
      }
    };
    
    loadOfferData();
  }, [id, navigate]);

  // Prefill from router state
  useEffect(() => {
    if (!isViewMode && location.state) {
      const state = location.state;
      
      // Respect view mode when coming from OfferView (read-only with Generate PDF)
      if (state.viewMode === true) {
        setIsViewMode(true);
      }
      
      // Check if this is a Group Series quotation
      if (state.isGroupSeries) {
        // Set quotation data
        if (state.quotations) {
          setQuotationData(state.quotations);
          
          // Extract optionals from quotations if available
          const extractedOptionals = state.quotations.flatMap(q =>
            q.options?.flatMap(opt =>
              opt.optionals || []
            )
          ).filter(Boolean);
          
          setOptionals(normalizeOptionals(extractedOptionals));
        }
        
        // Set options
        setOptions(state.options || []);
        
        // Also check for direct optionals property
        if (state.optionals && Array.isArray(state.optionals)) {
          setOptionals(normalizeOptionals(state.optionals));
        }
        // Map per-day optionalActivities from Group Series quotation into flat optionals list for the Offer UI
        if (state.optionalActivities && typeof state.optionalActivities === "object" && Object.keys(state.optionalActivities).length > 0) {
          try {
            const mappedFromOptionalActivities = [];
            Object.entries(state.optionalActivities).forEach(([dayIndex, activities]) => {
              const dayNum = Number.parseInt(dayIndex, 10);
              const displayDay = Number.isNaN(dayNum) ? dayIndex : (dayNum + 1);
              (Array.isArray(activities) ? activities : []).forEach((act) => {
                const parts = [];
                if (act?.activityName) parts.push(act.activityName);
                if (Array.isArray(act?.extras) && act.extras.length) parts.push(`Extras: ${act.extras.join(", ")}`);
                if (Array.isArray(act?.entrances) && act.entrances.length) parts.push(`Entrances: ${act.entrances.join(", ")}`);
                if (act?.experiences) parts.push(`Experience: ${act.experiences}`);
                const description = `Day ${displayDay}: ${parts.join(" | ")}`.trim();
                const price = calculateOptionalActivitySubtotal(act);

                // Try to capture city and duration from quotation activity
                const cityFromAct = act?.city || act?.location || "";
                let cityFromItin = "";
                try {
                  if (Array.isArray(state.itinerary) && state.itinerary.length > 0) {
                    const idx = Number.isNaN(dayNum) ? null : dayNum;
                    const dayObj = typeof idx === "number" ? state.itinerary[idx] : null;
                    if (dayObj && typeof dayObj === "object") {
                      cityFromItin = dayObj.city || dayObj.location || "";
                    }
                  }
                } catch (_) {}
                const duration =
                  (act?.durationHours ?? act?.duration ?? act?.time ?? act?.hours ?? act?.length ?? "");

                mappedFromOptionalActivities.push({
                  activityName: act?.activityName || (description.replace(/^Day\s+\d+:\s*/i, "") || ""),
                  day: displayDay,
                  extras: Array.isArray(act?.extras) ? act.extras : [],
                  entrances: Array.isArray(act?.entrances) ? act.entrances : [],
                  experiences: act?.experiences || "",
                  price,
                  city: cityFromAct || cityFromItin || "",
                  duration
                });
              });
            });

            if (mappedFromOptionalActivities.length) {
              // Only override if there are no existing optionals already set from other sources
              setOptionals((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : mappedFromOptionalActivities));
            }
          } catch (e) {
            console.error("Failed to map optionalActivities into optionals:", e);
          }
        }
        
        // Set validity dates
        if (state.validityDates && Array.isArray(state.validityDates)) {
          setValidityDates(state.validityDates);
        } else {
          // Initialize with a single validity date from arrival/departure
          setValidityDates([
            { from: state.arrivalDate || "", to: state.departureDate || "" }
          ]);
        }
        // Carry calculation results (pax -> option -> validity -> costs) for Rates table
        if (state.calculationResults && typeof state.calculationResults === "object") {
          setCalcResults(state.calculationResults);
        }
        // Set offer data with all available fields (basic mapping)
        setOfferData(prev => ({
          ...prev,
          groupName: state.group || "",
          agent: state.agent || "",
          nationality: state.nationality || "",
          dateArr: state.arrivalDate || "",
          dateDep: state.departureDate || "",
          programLength: state.programLength || "",
          createdBy: state.createdBy || "",
          signatureKey: state.signatureKey || prev.signatureKey || "",
          // Include any additional fields that might be passed from AddOffer / Quotation View
          message: state.message || prev.message,
          itinerary: Array.isArray(state.itinerary)
            ? state.itinerary.map((day, i) => `Day ${i + 1}: ${day.itinerary || ""}`).join("\n")
            : (state.itinerary || prev.itinerary),
          inclusions: state.inclusions || prev.inclusions,
          exclusions: state.exclusions || prev.exclusions,
          // PDF images (prefer those coming from the offer creation flow)
          mainImage: state.mainImage || prev.mainImage || "",
          smallImage1: state.smallImage1 || prev.smallImage1 || "",
          smallImage2: state.smallImage2 || prev.smallImage2 || "",
          smallImage3: state.smallImage3 || prev.smallImage3 || "",
          // Options visibility propagated from state when available
          showOption1: typeof state.showOption1 === "boolean" ? state.showOption1 : (typeof prev.showOption1 === "boolean" ? prev.showOption1 : true),
          showOption2: typeof state.showOption2 === "boolean" ? state.showOption2 : (typeof prev.showOption2 === "boolean" ? prev.showOption2 : true),
          showOption3: typeof state.showOption3 === "boolean" ? state.showOption3 : (typeof prev.showOption3 === "boolean" ? prev.showOption3 : true)
        }));

        // Preserve structured itinerary rows when coming from Group Series quotation (multi-day metadata)
       try {
          if (Array.isArray(state.itinerary) && state.itinerary.length > 0) {
            setStructuredItineraryRows(state.itinerary);
          } else if (Array.isArray(state.quotations) && state.quotations[0]?.itinerary) {
            setStructuredItineraryRows(state.quotations[0].itinerary);
          }
        } catch (_) {}


        // Auto-compute inclusions/exclusions from itinerary if not provided
        try {
          const itineraryArray =
            (Array.isArray(state.itinerary) && state.itinerary.length > 0)
              ? state.itinerary
              : (state.quotations && state.quotations[0]?.itinerary
                  ? state.quotations[0].itinerary
                  : []);

          if (itineraryArray.length > 0) {
            const autoInc = computeAutoInclusions(itineraryArray, "english");
            const defaultEx = getDefaultExclusions("english");
            setOfferData(prev => ({
              ...prev,
              inclusions: prev.inclusions && prev.inclusions.trim().length > 0
                ? prev.inclusions
                : autoInc.join("\n"),
              exclusions: prev.exclusions && prev.exclusions.trim().length > 0
                ? prev.exclusions
                : defaultEx.join("\n"),
            }));
          }
        } catch (e) {
          console.error("Error computing auto inclusions/exclusions:", e);
        }
        
        // Check if this is a special offer
        if (state.isSpecial !== undefined) {
          setIsSpecialOffer(state.isSpecial);
        }
      } else {
        // Redirect to standard offer creation
        navigate("/offers/new", { state });
      }
    }
  }, [location.state, isViewMode, navigate]);

  const handleOfferChange = e => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };


  const handleSaveOffer = async () => {
    try {
      // Validate required fields
      if (!offerData.groupName || !offerData.agent) {
        alert("Please fill in all required fields (Group Name and Agent at minimum).");
        return;
      }
      
      // Create a complete offer object with all necessary data
      const completeOffer = {
        ...offerData,
        quotations: quotationData,
        options: options,
        isSpecial: isSpecialOffer,
        isGroupSeries: true, // Explicitly set Group Series flag
        validityDates: validityDates, // Store validity dates
        quotationId: quotationId, // Link back to source quotation if available
        // Use the optionals state which may have been modified by the user
        optionals: optionals,
        // Persist continuation images so revisiting the offer keeps selections
        continuationImages: continuationImages,
        // Ensure we have all the necessary fields for the offer
        showOption1: typeof offerData.showOption1 === "boolean" ? offerData.showOption1 : true,
        showOption2: typeof offerData.showOption2 === "boolean" ? offerData.showOption2 : true,
        showOption3: typeof offerData.showOption3 === "boolean" ? offerData.showOption3 : true
      };
      
      // Save the offer to storage
      const savedOffer = await saveToStorage("offers", completeOffer);
      console.log("Saved Group Series offer:", savedOffer);
      
      // Navigate to the Group Series offers list
      navigate("/offers/group-series-list");
    } catch (error) {
      console.error("Error saving Group Series offer:", error);
      alert("An error occurred while saving the offer.");
    }
  };

  const generatePDF = () => {
    // Always attempt to generate; fall back to safe defaults if some parts are missing
    try {
      const quotationsArr = Array.isArray(quotationData) ? quotationData : [];
      const optionsArr = Array.isArray(options) ? options : [];
      const optionalsArr = Array.isArray(optionals) ? optionals : [];
  
      // Build itineraryRows for PDF generator with preference for structured rows
      // Priority:
      //   1) structuredItineraryRows (preserves multi-day metadata)
      //   2) quotations[0].itinerary if present
      //   3) Parse the flat itinerary string as a last resort
      let itineraryRows = [];
      if (Array.isArray(structuredItineraryRows) && structuredItineraryRows.length > 0) {
        itineraryRows = structuredItineraryRows;
      } else if (quotationsArr.length > 0 && Array.isArray(quotationsArr[0]?.itinerary)) {
        itineraryRows = quotationsArr[0].itinerary;
      } else if (typeof offerData.itinerary === "string" && offerData.itinerary.trim()) {
        const lines = offerData.itinerary.split("\n").map(s => s.trim()).filter(Boolean);
        itineraryRows = lines.map((line, i) => {
          const m = /^Day\s*\d+\s*:\s*(.*)$/i.exec(line);
          return {
            day: `Day ${i + 1}`,
            itinerary: m ? m[1] : line,
            transportType: "",
            mealIncluded: false,
            lunchRestaurant: "",
            dinnerRestaurant: "",
            guideRequired: false,
            guideLanguage: "English"
          };
        });
      }
  
      // Build Optional Activities table in GS layout (City | Activity | Cost per person | Day | Duration)
      // from the local optionals[] we maintain on the Offer page.
      // If quotations include multiple pax ranges, replicate per-range costs into paxCosts lines.
      const paxLabels = quotationsArr
        .map(q => (q?.paxRange ? String(q.paxRange) : (q?.pax ? `${q.pax} PAX` : "")))
        .filter(Boolean);
      const USD_TO_JOD_RATE = 1.41; // keep in sync with view logic

      // Simple city detector from free text as last resort
      const detectCityFromText = (txt = "") => {
        const s = String(txt).toLowerCase();
        if (s.includes("amman")) return "Amman";
        if (s.includes("petra")) return "Petra";
        if (s.includes("aqaba")) return "Aqaba";
        if (s.includes("jerash")) return "Jerash";
        if (s.includes("madaba")) return "Madaba";
        if (s.includes("dead sea")) return "Dead Sea";
        if (s.includes("wadi rum") || s.includes("rum")) return "Wadi Rum";
        if (s.includes("um qais") || s.includes("umm qais")) return "Um Qais";
        return "";
      };

      const optionalActivitiesTable = optionalsArr.map(item => {
        // Cost per person fallback: use explicit price or compute from components
        const computedUsd =
          item && item.price !== "" && !Number.isNaN(Number(item.price)) && Number(item.price) > 0
            ? Number(item.price)
            : calculateOptionalActivitySubtotal(item);
        const usd = Number.isFinite(computedUsd) ? computedUsd : 0;
        const jod = usd > 0 ? +(usd / USD_TO_JOD_RATE).toFixed(2) : 0;

        // Determine the day index for itinerary-based fallbacks
        const dayIdx = item?.day ? (Number(item.day) - 1) : -1;
        const dayItin =
          Array.isArray(itineraryRows) && dayIdx >= 0 && dayIdx < itineraryRows.length
            ? itineraryRows[dayIdx]
            : null;

        const city =
          item?.city ||
          item?.location ||
          (dayItin && (dayItin.city || detectCityFromText(dayItin.itinerary))) ||
          detectCityFromText(item?.activityName);

        const durationRaw = (item?.durationHours ?? item?.duration ?? item?.time ?? item?.hours ?? item?.length ?? "");
        const duration = typeof durationRaw === "number" && durationRaw !== 0 ? `${durationRaw} hrs` : String(durationRaw || "");

        const paxCosts = paxLabels.length
          ? paxLabels.map(label => ({
              label,
              usd: usd.toFixed(2),
              jod: jod.toFixed(2)
            }))
          : [];

        return {
          city: city || "",
          activity: item?.activityName || "Activity",
          costUSD: usd ? usd.toFixed(2) : "",
          costJOD: jod ? jod.toFixed(2) : "",
          paxCosts,                // preferred multi-line per pax range
          day: item?.day ? `Day ${item.day}` : "",
          duration,
          description: typeof item?.experiences === "string" ? item.experiences : ""
        };
      });
  
      // Build a prebuilt Rates Per Person table based on calculation results coming from Group Series quotation
      // Shape expected (english keys): [{ PAX: '10-14 PAX', 'Option 1': 'USD 999.00', ... }]
      const paxRangesDef = [
        { min: 1,  max: 1,  label: "1 PAX"     },
        { min: 2,  max: 3,  label: "2-3 PAX"   },
        { min: 4,  max: 5,  label: "4-5 PAX"   },
        { min: 6,  max: 7,  label: "6-7 PAX"   },
        { min: 8,  max: 9,  label: "8-9 PAX"   },
        { min: 10, max: 14, label: "10-14 PAX" },
        { min: 15, max: 19, label: "15-19 PAX" },
        { min: 20, max: 24, label: "20-24 PAX" },
        { min: 25, max: 29, label: "25-29 PAX" },
        { min: 30, max: 34, label: "30-34 PAX" },
        { min: 35, max: 39, label: "35-39 PAX" },
        { min: 40, max: 44, label: "40-44 PAX" },
        { min: 45, max: 49, label: "45-49 PAX" }
      ];
      const getPaxLabelLocal = (n) => {
        const num = Number(n);
        if (!Number.isFinite(num) || num <= 0) return "";
        const r = paxRangesDef.find(r => num >= r.min && num <= r.max);
        return r ? r.label : `${num} PAX`;
      };
      const profitMargin = (location?.state && typeof location.state.profitMargin === "number")
        ? location.state.profitMargin
        : 0.10;
      const validityIdx = Array.isArray(validityDates) && validityDates.length > 0 ? 0 : -1;
      const showOpt1 = optionsArr.length >= 1;
      const showOpt2 = optionsArr.length >= 2;
      const showOpt3 = optionsArr.length >= 3;

      let ratesPerPersonTable = [];
      try {
        const keys = Object.keys(calcResults || {}).sort((a,b) => Number(a) - Number(b));
        ratesPerPersonTable = keys.map(pk => {
          const paxNum = Number(pk);
          const label = getPaxLabelLocal(paxNum) || `${paxNum} PAX`;
          const base = Number(calcResults?.[pk]?.baseCostPerPersonUSD) || 0;
          const row = { PAX: label };
          // Option columns with visibility
          const idxList = [0,1,2];
          idxList.forEach((idx) => {
            const visible = (idx === 0 && showOpt1) || (idx === 1 && showOpt2) || (idx === 2 && showOpt3);
            if (!visible) return;
            const optBlock = calcResults?.[pk]?.[idx] || {};
            const per = validityIdx >= 0
              ? Number(optBlock?.[validityIdx]?.perPersonCost) || 0
              : Number(optBlock?.[-1]?.perPersonCost) || 0;
            const totalPer = (base + per) * (1 + profitMargin);
            row[`Option ${idx + 1}`] = totalPer > 0 ? `USD ${totalPer.toFixed(2)}` : "-";
          });
          return row;
        }).filter(r => r && r.PAX);
      } catch (_) {
        ratesPerPersonTable = [];
      }

      // Compute High Season Supplement / Low Season Reduction so the PDF uses the values shown in Accommodation Options
      const loadHotelRatesFromLS = () => {
        try {
          if (typeof localStorage === "undefined") return [];
          const raw = localStorage.getItem("hotelRates");
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed.map(r => ({
            City: r.City,
            Stars: String(r.Stars),
            Hotel: r.Hotel,
            Season: r.Season || r.season || "",
            Rate_DBL: parseFloat(r.Rate_DBL || r.DBL || r.dbl || r.DblRate || 0)
          })) : [];
        } catch (_) { return []; }
      };
      const hotelRatesLS = loadHotelRatesFromLS();

      const getHighLowForHotel = (city, stars, hotel) => {
        try {
          const list = hotelRatesLS.filter(r =>
            r && r.City === city && String(r.Stars) === String(stars) && r.Hotel === hotel
          );
          let high = null, low = null;
          list.forEach(r => {
            const s = String(r.Season || "").toLowerCase();
            const dbl = Number(r.Rate_DBL) || 0;
            if (!(dbl > 0)) return;
            if (s.includes("high")) high = (high == null) ? dbl : Math.max(high, dbl);
            if (s.includes("low"))  low  = (low  == null) ? dbl : Math.min(low,  dbl);
          });
          return { high, low };
        } catch (_) { return { high: null, low: null }; }
      };

      const seasonFlagsByOption = (optionsArr || []).map(opt => {
        let hasLow = false, hasHigh = false;
        const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
        accs.forEach(acc => {
          const vrs = Array.isArray(acc?.validityRates) ? acc.validityRates : [];
          vrs.forEach(vr => {
            const s = String(vr?.season || vr?.Season || "").toLowerCase();
            if (s.includes("low")) hasLow = true;
            if (s.includes("high")) hasHigh = true;
          });
        });
        return { hasLow, hasHigh };
      });

      const seasonDiffsByOption = (optionsArr || []).map(opt => {
        let sum = 0;
        const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
        accs.forEach(acc => {
          const { high, low } = getHighLowForHotel(acc?.city, acc?.stars, acc?.hotelName);
          if (high != null && low != null && high > low) sum += (high - low);
        });
        return Number.isFinite(sum) && sum > 0 ? sum : 0;
      });

      const highSeasonSuppByOption = seasonDiffsByOption.map((d, i) =>
        (d > 0 && seasonFlagsByOption[i]?.hasLow) ? d : 0
      );
      const lowSeasonReductionByOption = seasonDiffsByOption.map((d, i) =>
        (d > 0 && seasonFlagsByOption[i]?.hasHigh) ? d : 0
      );

      const payload = {
        ...offerData,
        options: optionsArr,
        quotations: quotationsArr,
        isGroupSeries: true,
        // Respect option visibility selections for PDF rendering
        showOption1: typeof offerData.showOption1 === "boolean" ? offerData.showOption1 : true,
        showOption2: typeof offerData.showOption2 === "boolean" ? offerData.showOption2 : true,
        showOption3: typeof offerData.showOption3 === "boolean" ? offerData.showOption3 : true,
        validityDates: Array.isArray(validityDates) ? validityDates : [],
        // Keep raw optionals for legacy fallback paths in the generator
        optionals: optionalsArr,
        // Provide GS-optimized optional activities table for the PDF renderer
        optionalActivitiesTable,
        // Provide structured itinerary rows to enable Restaurants & Transport/Guide tables
        itineraryRows,
        // Provide prebuilt Rates Per Person table (english keys); GS wrapper will localize and prefer this
        ratesPerPersonTable,
        // Page-specific images for itinerary continuation pages (page 2 = first 3, page 3 = next 3, etc.)
        additionalImages: getFlatAdditionalImagesFromState(continuationImages),
        moreImages: getFlatAdditionalImagesFromState(continuationImages),
        // Explicit arrays so base generator populates the two extra rows without showing "-"
        highSeasonSuppByOption,
        lowSeasonReductionByOption,
        isSpecial: !!isSpecialOffer
      };
  
      generateGSOfferPDF(payload);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
      alert("Failed to generate PDF. Please check your data and try again.");
    }
  };

  // Generate DOCX (Word) using the same payload logic
  const generateWord = () => {
    try {
      const quotationsArr = Array.isArray(quotationData) ? quotationData : [];
      const optionsArr = Array.isArray(options) ? options : [];
      const optionalsArr = Array.isArray(optionals) ? optionals : [];

      // Prefer structured itinerary rows if available
      let itineraryRows = [];
      if (Array.isArray(structuredItineraryRows) && structuredItineraryRows.length > 0) {
        itineraryRows = structuredItineraryRows;
      } else if (quotationsArr.length > 0 && Array.isArray(quotationsArr[0]?.itinerary)) {
        itineraryRows = quotationsArr[0].itinerary;
      } else if (typeof offerData.itinerary === "string" && offerData.itinerary.trim()) {
        const lines = offerData.itinerary.split("\n").map(s => s.trim()).filter(Boolean);
        itineraryRows = lines.map((line, i) => {
          const m = /^Day\s*\d+\s*:\s*(.*)$/i.exec(line);
          return {
            day: `Day ${i + 1}`,
            itinerary: m ? m[1] : line
          };
        });
      }

      // Build Rates Per Person table for Word (mirrors PDF logic)
      const paxRangesDef = [
        { min: 1,  max: 1,  label: "1 PAX"     },
        { min: 2,  max: 3,  label: "2-3 PAX"   },
        { min: 4,  max: 5,  label: "4-5 PAX"   },
        { min: 6,  max: 7,  label: "6-7 PAX"   },
        { min: 8,  max: 9,  label: "8-9 PAX"   },
        { min: 10, max: 14, label: "10-14 PAX" },
        { min: 15, max: 19, label: "15-19 PAX" },
        { min: 20, max: 24, label: "20-24 PAX" },
        { min: 25, max: 29, label: "25-29 PAX" },
        { min: 30, max: 34, label: "30-34 PAX" },
        { min: 35, max: 39, label: "35-39 PAX" },
        { min: 40, max: 44, label: "40-44 PAX" },
        { min: 45, max: 49, label: "45-49 PAX" }
      ];
      const getPaxLabelLocal = (n) => {
        const num = Number(n);
        if (!Number.isFinite(num) || num <= 0) return "";
        const r = paxRangesDef.find(r => num >= r.min && num <= r.max);
        return r ? r.label : `${num} PAX`;
      };
      const profitMargin = (location?.state && typeof location.state.profitMargin === "number")
        ? location.state.profitMargin
        : 0.10;
      const validityIdx = Array.isArray(validityDates) && validityDates.length > 0 ? 0 : -1;

      let ratesPerPersonTable = [];
      try {
        const keys = Object.keys(calcResults || {}).sort((a,b) => Number(a) - Number(b));
        ratesPerPersonTable = keys.map(pk => {
          const paxNum = Number(pk);
          const label = getPaxLabelLocal(paxNum) || `${paxNum} PAX`;
          const base = Number(calcResults?.[pk]?.baseCostPerPersonUSD) || 0;
          const row = { PAX: label };
          [0,1,2].forEach((idx) => {
            const optBlock = calcResults?.[pk]?.[idx] || {};
            const per = validityIdx >= 0
              ? Number(optBlock?.[validityIdx]?.perPersonCost) || 0
              : Number(optBlock?.[-1]?.perPersonCost) || 0;
            const totalPer = (base + per) * (1 + profitMargin);
            row[`Option ${idx + 1}`] = totalPer > 0 ? `USD ${totalPer.toFixed(2)}` : "-";
          });
          return row;
        }).filter(r => r && r.PAX);
      } catch (_) {
        ratesPerPersonTable = [];
      }

      // Compute High Season Supplement / Low Season Reduction (mirrors PDF)
      const loadHotelRatesFromLS = () => {
        try {
          if (typeof localStorage === "undefined") return [];
          const raw = localStorage.getItem("hotelRates");
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed.map(r => ({
            City: r.City,
            Stars: String(r.Stars),
            Hotel: r.Hotel,
            Season: r.Season || r.season || "",
            Rate_DBL: parseFloat(r.Rate_DBL || r.DBL || r.dbl || r.DblRate || 0)
          })) : [];
        } catch (_) { return []; }
      };
      const hotelRatesLS = loadHotelRatesFromLS();

      const getHighLowForHotel = (city, stars, hotel) => {
        try {
          const list = hotelRatesLS.filter(r =>
            r && r.City === city && String(r.Stars) === String(stars) && r.Hotel === hotel
          );
          let high = null, low = null;
          list.forEach(r => {
            const s = String(r.Season || "").toLowerCase();
            const dbl = Number(r.Rate_DBL) || 0;
            if (!(dbl > 0)) return;
            if (s.includes("high")) high = (high == null) ? dbl : Math.max(high, dbl);
            if (s.includes("low"))  low  = (low  == null) ? dbl : Math.min(low,  dbl);
          });
          return { high, low };
        } catch (_) { return { high: null, low: null }; }
      };

      const seasonFlagsByOption = (optionsArr || []).map(opt => {
        let hasLow = false, hasHigh = false;
        const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
        accs.forEach(acc => {
          const vrs = Array.isArray(acc?.validityRates) ? acc.validityRates : [];
          vrs.forEach(vr => {
            const s = String(vr?.season || vr?.Season || "").toLowerCase();
            if (s.includes("low")) hasLow = true;
            if (s.includes("high")) hasHigh = true;
          });
        });
        return { hasLow, hasHigh };
      });

      const seasonDiffsByOption = (optionsArr || []).map(opt => {
        let sum = 0;
        const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
        accs.forEach(acc => {
          const { high, low } = getHighLowForHotel(acc?.city, acc?.stars, acc?.hotelName);
          if (high != null && low != null && high > low) sum += (high - low);
        });
        return Number.isFinite(sum) && sum > 0 ? sum : 0;
      });

      const highSeasonSuppByOption = seasonDiffsByOption.map((d, i) =>
        (d > 0 && seasonFlagsByOption[i]?.hasLow) ? d : 0
      );
      const lowSeasonReductionByOption = seasonDiffsByOption.map((d, i) =>
        (d > 0 && seasonFlagsByOption[i]?.hasHigh) ? d : 0
      );

      const payload = {
        ...offerData,
        options: optionsArr,
        quotations: quotationsArr,
        isGroupSeries: true,
        showOption1: typeof offerData.showOption1 === "boolean" ? offerData.showOption1 : true,
        showOption2: typeof offerData.showOption2 === "boolean" ? offerData.showOption2 : true,
        showOption3: typeof offerData.showOption3 === "boolean" ? offerData.showOption3 : true,
        validityDates: Array.isArray(validityDates) ? validityDates : [],
        optionals: optionalsArr,
        itineraryRows,
        // Prebuilt tables for Word renderer
        ratesPerPersonTable,
        highSeasonSuppByOption,
        lowSeasonReductionByOption,
        // Use continuation images the same way as PDF
        additionalImages: getFlatAdditionalImagesFromState(continuationImages),
        moreImages: getFlatAdditionalImagesFromState(continuationImages)
      };

      generateOfferWord(payload);
    } catch (e) {
      console.error("Failed to generate DOCX:", e);
      alert("Failed to generate DOCX. Please check your data and try again.");
    }
  };

  // Styles
  const inputStyle = { 
    padding: 10, 
    fontSize: 15, 
    borderRadius: 6, 
    border: "1px solid #444", 
    backgroundColor: "#2a2a2a", 
    color: "white", 
    marginBottom: 10 
  };
  
  const textAreaStyle = { 
    padding: 10, 
    fontSize: 15, 
    borderRadius: 6, 
    border: "1px solid #444", 
    backgroundColor: "#2a2a2a", 
    color: "white", 
    marginBottom: 10,
    resize: "vertical", 
    width: "100%" 
  };
  
  const buttonStyle = { 
    backgroundColor: "#007bff", 
    color: "white", 
    padding: "10px 20px", 
    border: "none", 
    borderRadius: 6, 
    fontWeight: "bold", 
    cursor: "pointer",
    marginRight: 10
  };
  
  const cancelButtonStyle = { 
    backgroundColor: "#6c757d", 
    color: "white", 
    padding: "10px 20px", 
    border: "none", 
    borderRadius: 6, 
    fontWeight: "bold", 
    cursor: "pointer" 
  };

  return (
    <div style={{ color: "white", padding: 30, fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        {isViewMode ? "View Group Series Offer" : "New Group Series Offer"}
      </h1>


      {/* Offer Form */}
      <div style={{ display: "grid", gap: 16, maxWidth: 800, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
        <input 
          name="fileNo" 
          placeholder="File No." 
          value={offerData.fileNo} 
          onChange={handleOfferChange} 
          style={inputStyle} 
          readOnly
        />
        
        <input
          name="groupName"
          placeholder="Group Name"
          value={offerData.groupName}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
        />
        
        <input
          name="agent"
          placeholder="Agent"
          value={offerData.agent}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
        />
        
        <input
          name="nationality"
          placeholder="Nationality"
          value={offerData.nationality}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
        />
        
        
        <input
          type="number"
          name="programLength"
          placeholder="Program Length (Nights)"
          value={offerData.programLength}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
          min="1"
        />
        
        {/* Validity Dates Section */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Validity Dates
          </label>
          
          {validityDates.map((dateRange, index) => (
            <div key={index} style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              backgroundColor: "#1f1f1f",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #333"
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>From:</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    const newDates = [...validityDates];
                    newDates[index].from = e.target.value;
                    setValidityDates(newDates);
                  }}
                  style={inputStyle}
                  readOnly={isViewMode}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>To:</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    const newDates = [...validityDates];
                    newDates[index].to = e.target.value;
                    setValidityDates(newDates);
                  }}
                  style={inputStyle}
                  readOnly={isViewMode}
                />
              </div>
              {!isViewMode && (
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10 }}>
                  <button
                    onClick={() => {
                      const newDates = [...validityDates];
                      newDates.splice(index, 1);
                      setValidityDates(newDates);
                    }}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {!isViewMode && (
            <button
              onClick={() => {
                setValidityDates([...validityDates, { from: "", to: "" }]);
              }}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "5px 10px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                marginTop: 10
              }}
            >
              + Add Date Range
            </button>
          )}
        </div>
        
        <input
          name="createdBy"
          placeholder="Created By"
          value={offerData.createdBy}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
        />

        <textarea 
          name="itinerary" 
          placeholder="Itinerary (one per line)" 
          rows={4}
          value={offerData.itinerary} 
          onChange={handleOfferChange} 
          style={textAreaStyle} 
          readOnly={isViewMode}
        />

        <textarea 
          name="inclusions" 
          placeholder="Inclusions" 
          rows={5}
          value={offerData.inclusions} 
          onChange={handleOfferChange} 
          style={textAreaStyle} 
          readOnly={isViewMode}
        />

        <textarea
          name="exclusions"
          placeholder="Exclusions"
          rows={5}
          value={offerData.exclusions}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />

        {/* Initial Message to Client */}
        <div style={{ marginTop: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Initial Message to Client
          </label>
          <textarea
            name="message"
            placeholder="Write your opening message to the client. This appears on the first page."
            rows={5}
            value={offerData.message}
            onChange={handleOfferChange}
            style={textAreaStyle}
            readOnly={isViewMode}
          />
        </div>

        {/* Signature Selection */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <div>
            <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
              Signature (appears under the message on the first page)
            </label>
            <select
              name="signatureKey"
              value={offerData.signatureKey || ""}
              onChange={handleOfferChange}
              style={inputStyle}
              disabled={isViewMode}
            >
              <option value="">Select Signature</option>
              <option value="shatha">Shatha</option>
              <option value="omar">Omar</option>
              <option value="osama">Osama</option>
              <option value="aya">Aya</option>
              <option value="khalil">Khalil</option>
              <option value="laith">Laith</option>
              <option value="nejmeh">Nejmeh</option>
              <option value="nermin">Nermin</option>
              <option value="yanal">Yanal</option>
            </select>
          </div>
        </div>
     </div>

     {/* PDF Images (select from dropdown like AddOffer.jsx) */}
     <div style={{ marginTop: 20, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
       <h3 style={{ color: "#ffc107", marginTop: 0, marginBottom: 10 }}>PDF Images</h3>

       <div style={{ marginBottom: 10 }}>
         <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
           Main Image (Large)
         </label>
         <select
           name="mainImage"
           value={offerData.mainImage}
           onChange={handleOfferChange}
           style={inputStyle}
           disabled={isViewMode}
         >
           <option value="">Select Main Image</option>
           <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
           <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
           <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
           <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
           <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
           <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
           <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
           <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
           <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
           <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
         </select>
         {offerData.mainImage && (
           <div style={{ marginTop: 10 }}>
             <img
               src={offerData.mainImage}
               alt="Main Image Preview"
               style={{
                 maxWidth: '200px',
                 maxHeight: '150px',
                 borderRadius: 4,
                 border: '1px solid #444',
                 objectFit: 'cover'
               }}
             />
           </div>
         )}
       </div>

       <div style={{ marginBottom: 10 }}>
         <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
           Small Image 1
         </label>
         <select
           name="smallImage1"
           value={offerData.smallImage1}
           onChange={handleOfferChange}
           style={inputStyle}
           disabled={isViewMode}
         >
           <option value="">Select Small Image 1</option>
           <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
           <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
           <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
           <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
           <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
           <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
           <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
           <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
           <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
           <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
         </select>
         {offerData.smallImage1 && (
           <div style={{ marginTop: 10 }}>
             <img
               src={offerData.smallImage1}
               alt="Small Image 1 Preview"
               style={{
                 maxWidth: '150px',
                 maxHeight: '100px',
                 borderRadius: 4,
                 border: '1px solid #444',
                 objectFit: 'cover'
               }}
             />
           </div>
         )}
       </div>

       <div style={{ marginBottom: 10 }}>
         <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
           Small Image 2
         </label>
         <select
           name="smallImage2"
           value={offerData.smallImage2}
           onChange={handleOfferChange}
           style={inputStyle}
           disabled={isViewMode}
         >
           <option value="">Select Small Image 2</option>
           <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
           <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
           <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
           <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
           <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
           <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
           <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
           <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
           <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
           <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
         </select>
         {offerData.smallImage2 && (
           <div style={{ marginTop: 10 }}>
             <img
               src={offerData.smallImage2}
               alt="Small Image 2 Preview"
               style={{
                 maxWidth: '150px',
                 maxHeight: '100px',
                 borderRadius: 4,
                 border: '1px solid #444',
                 objectFit: 'cover'
               }}
             />
           </div>
         )}
       </div>

       <div style={{ marginBottom: 10 }}>
         <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
           Small Image 3
         </label>
         <select
           name="smallImage3"
           value={offerData.smallImage3}
           onChange={handleOfferChange}
           style={inputStyle}
           disabled={isViewMode}
         >
           <option value="">Select Small Image 3</option>
           <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
           <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
           <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
           <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
           <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
           <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
           <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
           <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
           <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
           <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
           <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
           <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
           <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
         </select>
         {offerData.smallImage3 && (
           <div style={{ marginTop: 10 }}>
             <img
               src={offerData.smallImage3}
               alt="Small Image 3 Preview"
               style={{
                 maxWidth: '150px',
                 maxHeight: '100px',
                 borderRadius: 4,
                 border: '1px solid #444',
                 objectFit: 'cover'
               }}
             />
           </div>
         )}
       </div>
     </div>

     {/* Itinerary Continuation Images (Page 2, Page 3, ...) */}
     <div style={{ marginTop: 20, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
       <h3 style={{ color: "#ffc107", marginTop: 0, marginBottom: 10 }}>Itinerary Continuation Images (Page 2+)</h3>
       <p style={{ color: "#aaa", marginTop: 0, marginBottom: 10, fontSize: 12 }}>
         Days per page: Page 1 shows days 1–3. Page 2 shows days 4–6, Page 3 shows days 7–9, etc.
       </p>
       {continuationImages.length === 0 ? (
         <p style={{ color: "#888" }}>No continuation pages detected from the itinerary.</p>
       ) : (
         continuationImages.map((pg, idx) => {
           const pageNo = idx + 2;
           return (
             <div key={idx} style={{
               marginBottom: 15,
               backgroundColor: "#2a2a2a",
               padding: 15,
               borderRadius: 8,
               border: "1px solid #444"
             }}>
               <h4 style={{ margin: 0, marginBottom: 10, color: "#fff" }}>Page {pageNo} Images</h4>

               {/* Main */}
               <div style={{ marginBottom: 10 }}>
                 <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                   Main Image (Large)
                 </label>
                 <select
                   value={pg.main || ""}
                   onChange={(e) => {
                     const val = e.target.value;
                     setContinuationImages(prev => {
                       const next = [...prev];
                       next[idx] = { ...next[idx], main: val };
                       return next;
                     });
                   }}
                   style={inputStyle}
                   disabled={isViewMode}
                 >
                   {renderImageOptions()}
                 </select>
                 {pg.main && (
                   <div style={{ marginTop: 10 }}>
                     <img
                       src={pg.main}
                       alt={`Page ${pageNo} Main`}
                       style={{
                         maxWidth: '200px',
                         maxHeight: '150px',
                         borderRadius: 4,
                         border: '1px solid #444',
                         objectFit: 'cover'
                       }}
                     />
                   </div>
                 )}
               </div>

               {/* Small 1 */}
               <div style={{ marginBottom: 10 }}>
                 <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                   Small Image 1
                 </label>
                 <select
                   value={pg.small1 || ""}
                   onChange={(e) => {
                     const val = e.target.value;
                     setContinuationImages(prev => {
                       const next = [...prev];
                       next[idx] = { ...next[idx], small1: val };
                       return next;
                     });
                   }}
                   style={inputStyle}
                   disabled={isViewMode}
                 >
                   {renderImageOptions()}
                 </select>
                 {pg.small1 && (
                   <div style={{ marginTop: 10 }}>
                     <img
                       src={pg.small1}
                       alt={`Page ${pageNo} Small 1`}
                       style={{
                         maxWidth: '150px',
                         maxHeight: '100px',
                         borderRadius: 4,
                         border: '1px solid #444',
                         objectFit: 'cover'
                       }}
                     />
                   </div>
                 )}
               </div>

               {/* Small 2 */}
               <div style={{ marginBottom: 10 }}>
                 <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                   Small Image 2
                 </label>
                 <select
                   value={pg.small2 || ""}
                   onChange={(e) => {
                     const val = e.target.value;
                     setContinuationImages(prev => {
                       const next = [...prev];
                       next[idx] = { ...next[idx], small2: val };
                       return next;
                     });
                   }}
                   style={inputStyle}
                   disabled={isViewMode}
                 >
                   {renderImageOptions()}
                 </select>
                 {pg.small2 && (
                   <div style={{ marginTop: 10 }}>
                     <img
                       src={pg.small2}
                       alt={`Page ${pageNo} Small 2`}
                       style={{
                         maxWidth: '150px',
                         maxHeight: '100px',
                         borderRadius: 4,
                         border: '1px solid #444',
                         objectFit: 'cover'
                       }}
                     />
                   </div>
                 )}
               </div>

               {/* Small 3 */}
               <div style={{ marginBottom: 10 }}>
                 <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                   Small Image 3
                 </label>
                 <select
                   value={pg.small3 || ""}
                   onChange={(e) => {
                     const val = e.target.value;
                     setContinuationImages(prev => {
                       const next = [...prev];
                       next[idx] = { ...next[idx], small3: val };
                       return next;
                     });
                   }}
                   style={inputStyle}
                   disabled={isViewMode}
                 >
                   {renderImageOptions()}
                 </select>
                 {pg.small3 && (
                   <div style={{ marginTop: 10 }}>
                     <img
                       src={pg.small3}
                       alt={`Page ${pageNo} Small 3`}
                       style={{
                         maxWidth: '150px',
                         maxHeight: '100px',
                         borderRadius: 4,
                         border: '1px solid #444',
                         objectFit: 'cover'
                       }}
                     />
                   </div>
                 )}
               </div>
             </div>
           );
         })
       )}
     </div>

     {/* Optionals Section */}
      <div style={{ marginTop: 20, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
        <h3 style={{ color: "#ffc107", marginBottom: 15 }}>Optionals</h3>
        
        {optionals.length > 0 ? (
          <div>
            {optionals.map((optional, index) => (
              <div key={index} style={{
                marginBottom: 15,
                backgroundColor: "#2a2a2a",
                padding: 15,
                borderRadius: 8,
                border: "1px solid #444"
              }}>
                {/* Top row: Activity Name and Day */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Activity Name:</label>
                    <input
                      type="text"
                      value={optional.activityName || ""}
                      onChange={(e) => {
                        const newOptionals = [...optionals];
                        newOptionals[index] = { ...newOptionals[index], activityName: e.target.value };
                        setOptionals(newOptionals);
                      }}
                      style={inputStyle}
                      readOnly={isViewMode}
                      placeholder="Enter activity name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Day:</label>
                    <input
                      type="number"
                      min="1"
                      value={optional.day || ""}
                      onChange={(e) => {
                        const newOptionals = [...optionals];
                        newOptionals[index] = { ...newOptionals[index], day: e.target.value };
                        setOptionals(newOptionals);
                      }}
                      style={inputStyle}
                      readOnly={isViewMode}
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>

                {/* Extras field */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Extras:</label>
                  <input
                    type="text"
                    value={(Array.isArray(optional.extras) ? optional.extras : []).join(", ")}
                    onChange={(e) => {
                      const value = e.target.value || "";
                      const extrasArr = value.split(",").map(s => s.trim()).filter(Boolean);
                      const newOptionals = [...optionals];
                      newOptionals[index] = { ...newOptionals[index], extras: extrasArr };
                      setOptionals(newOptionals);
                    }}
                    style={inputStyle}
                    readOnly={isViewMode}
                    placeholder="Comma-separated (e.g., Jeep Ride 2 Hours, Camel in Wadi Rum)"
                  />
                </div>

                {/* Entrances field */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Entrances:</label>
                  <input
                    type="text"
                    value={(Array.isArray(optional.entrances) ? optional.entrances : []).join(", ")}
                    onChange={(e) => {
                      const value = e.target.value || "";
                      const entrancesArr = value.split(",").map(s => s.trim()).filter(Boolean);
                      const newOptionals = [...optionals];
                      newOptionals[index] = { ...newOptionals[index], entrances: entrancesArr };
                      setOptionals(newOptionals);
                    }}
                    style={inputStyle}
                    readOnly={isViewMode}
                    placeholder="Comma-separated (e.g., Petra, Wadi Rum)"
                  />
                </div>

                {/* Experience (description) */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Experience (Description):</label>
                  <textarea
                    value={optional.experiences || ""}
                    onChange={(e) => {
                      const newOptionals = [...optionals];
                      newOptionals[index] = { ...newOptionals[index], experiences: e.target.value };
                      setOptionals(newOptionals);
                    }}
                    style={{ ...textAreaStyle, minHeight: 80 }}
                    readOnly={isViewMode}
                    placeholder='Describe the activity. You may include "cost: $X" to auto-calc during mapping.'
                  />
                </div>

                {/* Price */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Price (per person):</label>
                    <input
                      type="number"
                      value={optional.price || ""}
                      onChange={(e) => {
                        const newOptionals = [...optionals];
                        const v = e.target.value === "" ? "" : parseFloat(e.target.value);
                        newOptionals[index] = { ...newOptionals[index], price: v };
                        setOptionals(newOptionals);
                      }}
                      style={inputStyle}
                      readOnly={isViewMode}
                      placeholder="e.g. 25.00"
                    />
                  </div>
                </div>
                
                {!isViewMode && (
                  <button
                    onClick={() => {
                      const newOptionals = [...optionals];
                      newOptionals.splice(index, 1);
                      setOptionals(newOptionals);
                    }}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Remove Optional
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#aaa" }}>No optionals available. Add optionals to enhance your offer.</p>
        )}
        
        {!isViewMode && (
          <button
            onClick={() => {
              setOptionals([...optionals, { activityName: "", day: "", extras: [], entrances: [], experiences: "", price: "" }]);
            }}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              marginTop: 10
            }}
          >
            + Add New Optional
          </button>
        )}
      </div>

      {/* Options visibility for PDF (Suggested Hotels, Rates, Supplements) */}
      <div style={{ marginTop: 20, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #333" }}>
        <h3 style={{ marginTop: 0, marginBottom: 10, color: "#fff" }}>Options to show in PDF</h3>
        <p style={{ color: "#aaa", marginTop: 0, marginBottom: 10, fontSize: 12 }}>
          Uncheck any option to hide it from Suggested Hotels, Rates per Person, and Supplements tables in the PDF.
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!offerData.showOption1}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption1: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span>Option 1</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!offerData.showOption2}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption2: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span>Option 2</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!offerData.showOption3}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption3: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span>Option 3</span>
          </label>
        </div>
      </div>
      {/* Special Offer Toggle */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isSpecialOffer}
            onChange={(e) => setIsSpecialOffer(e.target.checked)}
            style={{ marginRight: 10, transform: "scale(1.2)" }}
            disabled={isViewMode}
          />
          <span style={{ color: "#FFD700", fontWeight: "bold" }}>
            This is a Special Offer (VIP)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", marginTop: 30 }}>
        {isViewMode ? (
          <>
            <button onClick={() => navigate("/offers/group-series-list")} style={cancelButtonStyle}>
              Back to Group Series Offers
            </button>
            <button onClick={generatePDF} style={buttonStyle}>
              Generate PDF
            </button>
            <button
              onClick={generateWord}
              style={{ ...buttonStyle, backgroundColor: "#17a2b8", marginLeft: 10 }}
            >
              Generate DOCX
            </button>
            <button
              onClick={async () => {
                try {
                  const st = location.state || {};
                  // Prefer current state quotationId, then local state
                  const qid = st.quotationId || quotationId;
                  if (qid) {
                    navigate(`/quotations/group-series-view/${qid}?createActualRates=true`);
                    return;
                  }
                  // Attempt to find a matching quotation in storage
                  const matchId = await findMatchingQuotation(st);
                  if (matchId) {
                    navigate(`/quotations/group-series-view/${matchId}?createActualRates=true`);
                    return;
                  }
                  // Recreate a quotation from offer data if needed
                  if (st.quotations && st.quotations.length > 0) {
                    const newQuotation = {
                      id: Date.now(),
                      group: st.groupName || st.group || "",
                      agent: st.agent || "",
                      programLength: st.programLength || "",
                      createdBy: st.createdBy || "",
                      quotations: st.quotations,
                      options: st.options || [],
                      isGroupSeries: true,
                      validityDates: st.validityDates || []
                    };
                    const savedQuotation = await saveToStorage("quotations", newQuotation);
                    // Persist quotationId on the offer for future use
                    if (st.id) {
                      await updateInStorage("offers", st.id, { ...st, quotationId: savedQuotation.id });
                    }
                    setQuotationId(savedQuotation.id);
                    navigate(`/quotations/group-series-view/${savedQuotation.id}?createActualRates=true`);
                  } else {
                    alert("No quotation data found on this offer to create Actual Rates.");
                  }
                } catch (error) {
                  console.error("Error uploading Actual Rate Quotation:", error);
                  alert("Failed to upload Actual Rate Quotation. See console for details.");
                }
              }}
              style={{ ...buttonStyle, backgroundColor: "#28a745", marginLeft: 10 }}
            >
              Upload Actual Rate Quotation
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/offers/group-series-list")} style={cancelButtonStyle}>
              Cancel
            </button>
            <button onClick={generatePDF} style={buttonStyle}>
              Generate PDF
            </button>
            <button
              onClick={generateWord}
              style={{ ...buttonStyle, backgroundColor: "#17a2b8", marginLeft: 10 }}
            >
              Generate DOCX
            </button>
            <button onClick={handleSaveOffer} style={{...buttonStyle, backgroundColor: "#28a745"}}>
              Save Offer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GroupSeriesAddOffer;