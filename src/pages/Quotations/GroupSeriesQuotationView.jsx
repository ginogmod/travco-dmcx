// src/pages/Quotations/GroupSeriesQuotationView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getOneFromStorage,
  updateInStorage,
  saveToStorage,
  getAllFromStorage
} from "../../assets/utils/storage";
import { generateGSOfferPDF } from "../../assets/utils/generateGSOfferPDF";
import { generateExcel } from "../../assets/utils/generateExcel";

// Optional Activities cost map (USD) mirrored from GroupSeriesQuotationItinerary for consistent presentation
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

// Styles
const tableHeaderStyle = {
  borderBottom: "2px solid #444",
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#1f1f1f",
  color: "white"
};

const tableRowStyle = {
  borderBottom: "1px solid #444",
};

const tableCellStyle = {
  padding: "12px",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 15px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer"
};

export default function GroupSeriesQuotationView() {
  const params = useParams();
  const id = params.id;
  console.log("GroupSeriesQuotationView - Received params:", params);
  console.log("GroupSeriesQuotationView - Extracted ID:", id, "Type:", typeof id);
  const navigate = useNavigate();
  const location = useLocation();
  const [quote, setQuote] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [activeTab, setActiveTab] = useState("original");
  const [actualRatesQuote, setActualRatesQuote] = useState(null);
  // Entrance fees for optional activities breakdown
  const [fees, setFees] = useState([]);
  const searchParams = new URLSearchParams(location.search);
  const shouldCreateActualRates = searchParams.get('createActualRates') === 'true';
  const shouldShowActualRates = searchParams.get('showActualRates') === 'true';

  useEffect(() => {
    // Load entrance fees for optional activities presentation
    fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // First row is header - skip it
          setFees(data.slice(1));
        } else {
          setFees([]);
        }
      })
      .catch(err => {
        console.error("Failed to load entrance fees for optional activities:", err);
        setFees([]);
      });
  }, []);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        // Ensure ID is properly formatted
        const quotationId = id?.toString();
        console.log("Fetching quotation with ID:", quotationId);
        
        if (!quotationId) {
          console.error("Invalid quotation ID:", id);
          return navigate("/quotations/group-series-list");
        }
        
        // Try to fetch by ID
        let q = await getOneFromStorage("quotations", quotationId);
        console.log("Fetched quotation result:", q);
        
        // If not found, try to fetch all quotations and find by ID
        if (!q) {
          console.log("Quotation not found directly, trying alternative approach");
          const allQuotations = await getAllFromStorage("quotations");
          console.log("All quotations:", allQuotations.length);
          
          // Try to find the quotation by ID
          q = allQuotations.find(quotation =>
            quotation.id?.toString() === quotationId ||
            quotation.id === parseInt(quotationId)
          );
          
          console.log("Found quotation by alternative approach:", q);
        }
        
        if (!q) {
          console.error("Quotation not found in storage with ID:", quotationId);
          return navigate("/quotations/group-series-list");
        }
        
        // Verify this is a Group Series quotation
        if (!q.isGroupSeries) {
          console.warn("This is not a Group Series quotation, redirecting to standard view");
          return navigate(`/quotations/view/${id}`);
        }
        
        // Debug the structure of the quotation
        console.log("Group Series Quotation Structure:", JSON.stringify(q, null, 2));
        console.log("Quotations array:", q.quotations);
        console.log("Options:", q.options);
        console.log("Optionals:", q.optionals);
        console.log("Seasons:", q.seasons);
        
        setQuote(q);
        
        // Check for actual rates quotation regardless of parameters
        const allQuotations = await getAllFromStorage("quotations");
        const existingActualRates = allQuotations.find(quotation =>
          quotation.isActualRates && quotation.originalQuotationId === Number(id)
        );
        
        console.log("Checking for actual rates quotation for ID:", id);
        console.log("Found actual rates:", existingActualRates);
        
        if (existingActualRates) {
          console.log("Setting actual rates quotation:", existingActualRates);
          setActualRatesQuote(existingActualRates);
          
          // Set active tab based on URL parameter
          if (shouldShowActualRates) {
            console.log("Setting active tab to actual rates");
            setActiveTab("actual");
            // Remove the query parameter from the URL
            navigate(`/quotations/group-series-view/${id}`, { replace: true });
          }
        } else if (shouldCreateActualRates) {
          // Create a new actual rates quotation
          console.log("Creating new actual rates quotation");
          const actualRatesCopy = JSON.parse(JSON.stringify(q));
          actualRatesCopy.id = Date.now();
          actualRatesCopy.isActualRates = true;
          actualRatesCopy.originalQuotationId = q.id;
          
          try {
            const savedCopy = await saveToStorage("quotations", actualRatesCopy);
            console.log("Saved new actual rates quotation:", savedCopy);
            setActualRatesQuote(savedCopy);
            setActiveTab("actual");
            
            // Remove the query parameter from the URL
            navigate(`/quotations/group-series-view/${id}`, { replace: true });
          } catch (saveError) {
            console.error("Error saving actual rates quotation:", saveError);
            // Still set the copy in state even if saving fails
            setActualRatesQuote(actualRatesCopy);
            setActiveTab("actual");
          }
        }
      } catch (error) {
        console.error("Error fetching quotation:", error);
        navigate("/quotations/group-series-list");
      }
    };
    
    fetchQuotation();
  }, [id, navigate, shouldCreateActualRates, shouldShowActualRates]);

  const handleExcelExport = () => {
    if (!quote) return;

    const currentQuote = activeTab === "original" ? quote : actualRatesQuote;
    
    if (!currentQuote.quotations || !Array.isArray(currentQuote.quotations)) {
      console.error("Invalid quotation structure - missing quotations array");
      alert("Error: Cannot export Excel due to invalid data structure");
      return;
    }

    const data = currentQuote.quotations.flatMap(paxRange => {
      const rows = [
        { Item: "Entrance Fees", Cost: parseFloat(paxRange.costs?.entranceFees || 0).toFixed(2) },
        { Item: "Transportation", Cost: parseFloat(paxRange.costs?.transportation || 0).toFixed(2) },
        { Item: "Bank Commission", Cost: parseFloat(paxRange.costs?.bankCommission || 0).toFixed(2) },
        { Item: "Jeeps", Cost: parseFloat(paxRange.costs?.jeeps || 0).toFixed(2) },
        { Item: "Meet and Assist", Cost: parseFloat(paxRange.costs?.meetAndAssist || 0).toFixed(2) },
        { Item: "Guide", Cost: parseFloat(paxRange.costs?.privateGuide || 0).toFixed(2) },
        { Item: "Local Guide", Cost: parseFloat(paxRange.costs?.localGuide || 0).toFixed(2) },
        { Item: "Meals", Cost: parseFloat(paxRange.costs?.meals || 0).toFixed(2) },
        { Item: "Tips & Portages", Cost: parseFloat(paxRange.costs?.tips || 0).toFixed(2) },
        { Item: "Cost Before Accom and Profit Margin", Cost: parseFloat(paxRange.costBeforeAccommodationAndProfitMargin || 0).toFixed(2) },
      ];

      if (paxRange.options && Array.isArray(paxRange.options)) {
        paxRange.options.forEach((opt, i) => {
          rows.push({
            Item: `Option ${i + 1} (with accom and profit margin)`,
            Cost: parseFloat(opt.totalCost || 0).toFixed(2),
            Details: opt.accommodations?.map(accom => accom.hotelName).join(' → ') || 'No hotels'
          });
        });
      }

      return [
        { Item: `PAX Range: ${paxRange.paxRange || 'Unknown'}`, Cost: "" },
        ...rows,
        { Item: "", Cost: "" } // Spacer row
      ];
    });

    generateExcel(data, `${currentQuote.group || 'group-series'}-quotation.xlsx`);
  };

  if (!quote) return <div>Loading...</div>;
  
  // Debug what data we have available
  console.log("Rendering with quote data:", quote);
  console.log("Quote structure:", {
    hasQuotations: Boolean(quote.quotations),
    quotationsLength: quote.quotations?.length,
    hasOptions: Boolean(quote.options),
    optionsLength: quote.options?.length,
    hasOptionals: Boolean(quote.optionals),
    optionalsLength: quote.optionals?.length,
    hasSeasons: Boolean(quote.seasons),
    seasonsLength: quote.seasons?.length,
    hasItinerary: Boolean(quote.itinerary),
    itineraryLength: quote.itinerary?.length
  });

  // Function to save actual rates
  const saveActualRates = async () => {
    if (!actualRatesQuote) return;
    
    try {
      // Create a deep copy to ensure all data is preserved
      const quotationToSave = JSON.parse(JSON.stringify(actualRatesQuote));
      
      // Ensure timestamps are updated
      quotationToSave.updatedAt = new Date().toISOString();
      
      // Update the actual rates quotation in storage
      await updateInStorage("quotations", quotationToSave.id, quotationToSave);
      setSaveStatus("Actual rates saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
      
      // Update the local state with the saved data
      setActualRatesQuote(quotationToSave);
    } catch (error) {
      console.error("Error saving actual rates:", error);
      setSaveStatus("Error saving actual rates. Please try again.");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  // Format validity dates for display
  const formatValidityDates = (validityDates) => {
    if (!validityDates || !Array.isArray(validityDates) || validityDates.length === 0) {
      return "No validity dates";
    }
    
    return validityDates.map((date, index) => (
      <div key={index} style={{ marginBottom: "5px" }}>
        {date.from} to {date.to}
      </div>
    ));
  };

  // Helper function to render itinerary if it exists
  const renderItinerary = () => {
    if (!quote.itinerary || !Array.isArray(quote.itinerary) || quote.itinerary.length === 0) {
      return null;
    }
    
    return (
      <div style={{ marginBottom: 20, backgroundColor: "#1f1f1f", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#007bff", marginTop: 0 }}>Itinerary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Day</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Transportation</th>
              <th style={tableHeaderStyle}>Meals</th>
              <th style={tableHeaderStyle}>Entrances</th>
            </tr>
          </thead>
          <tbody>
            {quote.itinerary.map((day, index) => (
              <tr key={index} style={tableRowStyle}>
                <td style={tableCellStyle}>{day.day}</td>
                <td style={tableCellStyle}>{day.itinerary || "No description"}</td>
                <td style={tableCellStyle}>{day.transportType || "None"}</td>
                <td style={tableCellStyle}>
                  {day.mealIncluded ? (day.mealType || "Included") : "Not included"}
                </td>
                <td style={tableCellStyle}>
                  {day.entrances && day.entrances.length > 0
                    ? day.entrances.join(", ")
                    : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helpers for Optional Activities breakdown
  const getEntranceFeeAmount = (name) => {
    const fee = fees.find(f => f["Travco Jordan"] === name);
    if (!fee || !fee["__1"]) return 0;
    const n = parseFloat(fee["__1"]);
    return isNaN(n) ? 0 : n;
  };

  const calculateOptionalActivitySubtotal = (activity) => {
    let subtotal = 0;
    const breakdown = { extras: 0, entrances: 0, experiences: 0 };

    // Extras from predefined price map
    if (Array.isArray(activity.extras)) {
      activity.extras.forEach(extraName => {
        const cost = extrasCosts[extraName] || 0;
        subtotal += cost;
        breakdown.extras += cost;
      });
    }

    // Entrances from RepEnt_Fees.json
    if (Array.isArray(activity.entrances)) {
      activity.entrances.forEach(entrance => {
        const fee = getEntranceFeeAmount(entrance);
        subtotal += fee;
        breakdown.entrances += fee;
      });
    }

    // Experiences free-text with optional "cost: $X" inline
    if (typeof activity.experiences === 'string' && activity.experiences.toLowerCase().includes('cost:')) {
      try {
        const m = activity.experiences.match(/cost:\s*\$?(\d+(?:\.\d+)?)/i);
        if (m && m[1]) {
          const v = parseFloat(m[1]);
          if (!isNaN(v)) {
            subtotal += v;
            breakdown.experiences += v;
          }
        }
      } catch (_) {}
    }

    return { total: subtotal, breakdown };
  };

  // Helper function to render optional activities if they exist (supports Original/Actual tabs)
  const renderOptionalActivities = () => {
    const current = activeTab === "original" ? quote : (actualRatesQuote || quote);
    if (!current || !current.optionalActivities || Object.keys(current.optionalActivities).length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: 20, backgroundColor: "#1f1f1f", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#e53935", marginTop: 0 }}>Optional Activities (Not Included in Cost)</h3>

        {Object.entries(current.optionalActivities).map(([dayIndex, activities]) => {
          const idx = parseInt(dayIndex, 10);
          const dayInfo = current.itinerary?.[idx];
          return (
            <div key={dayIndex} style={{ marginBottom: 15, borderBottom: "1px solid #444", paddingBottom: 15 }}>
              <h4 style={{ color: "#e53935", marginTop: 0 }}>
                {dayInfo ? dayInfo.day : `Day ${idx + 1}`}
              </h4>

              {activities.map((activity, actIndex) => {
                const subtotal = calculateOptionalActivitySubtotal(activity);
                return (
                  <div key={actIndex} style={{
                    backgroundColor: "#2a2a2a",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 10
                  }}>
                    <h5 style={{ margin: "0 0 10px 0" }}>{activity.activityName || "Unnamed Activity"}</h5>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: '#aaa', margin: '6px 0 10px 0' }}>
                      {activity.city && (
                        <span><strong style={{ color: '#ccc' }}>City:</strong> {activity.city}</span>
                      )}
                      {(activity.durationHours || activity.durationHours === 0) && (
                        <span>
                          <strong style={{ color: '#ccc' }}>Duration:</strong> {activity.durationHours} hour{Number(activity.durationHours) === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
                      {activity.entrances && activity.entrances.length > 0 && (
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <p style={{ fontWeight: "bold", margin: "0 0 5px 0", fontSize: 14 }}>Entrances:</p>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {activity.entrances.map((entrance, i) => (
                              <li key={i} style={{ fontSize: 14 }}>
                                {entrance}
                                <span style={{ color: "#e53935", marginLeft: 6 }}>
                                  JOD {getEntranceFeeAmount(entrance).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activity.extras && activity.extras.length > 0 && (
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <p style={{ fontWeight: "bold", margin: "0 0 5px 0", fontSize: 14 }}>Extras:</p>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {activity.extras.map((extra, i) => (
                              <li key={i} style={{ fontSize: 14 }}>
                                {extra}
                                {extrasCosts[extra] > 0 && (
                                  <span style={{ color: "#e53935", marginLeft: 6 }}>
                                    ${Number(extrasCosts[extra]).toFixed(2)}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activity.experiences && (
                        <div style={{ flex: 2, minWidth: "300px" }}>
                          <p style={{ fontWeight: "bold", margin: "0 0 5px 0", fontSize: 14 }}>Experience:</p>
                          <p style={{ margin: 0, fontSize: 14 }}>{activity.experiences}</p>
                        </div>
                      )}
                    </div>

                    {/* Detailed subtotal */}
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #444" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: '#aaa' }}>Extras:</span>
                        <span style={{ fontSize: 14, color: '#e53935' }}>
                          ${subtotal.breakdown.extras.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: '#aaa' }}>Entrances:</span>
                        <span style={{ fontSize: 14, color: '#e53935' }}>
                          JOD {subtotal.breakdown.entrances.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: '#aaa' }}>Experiences:</span>
                        <span style={{ fontSize: 14, color: '#e53935' }}>
                          ${subtotal.breakdown.experiences.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: '1px dashed #444',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ fontSize: 15, color: '#fff' }}>Activity Subtotal (per person):</span>
                        <span style={{ color: '#e53935', fontSize: 16 }}>
                          ${subtotal.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper function to render optionals if they exist
  const renderOptionals = () => {
    if (!quote.optionals || !Array.isArray(quote.optionals) || quote.optionals.length === 0) {
      return null;
    }
    
    return (
      <div style={{ marginBottom: 20, backgroundColor: "#1f1f1f", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#FFD700", marginTop: 0 }}>Optional Items</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Item</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Price</th>
            </tr>
          </thead>
          <tbody>
            {quote.optionals.map((optional, index) => (
              <tr key={index} style={tableRowStyle}>
                <td style={tableCellStyle}>{optional.name || "Optional Item"}</td>
                <td style={tableCellStyle}>{optional.description || "No description"}</td>
                <td style={tableCellStyle}>${parseFloat(optional.price || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper function to render calculation results if they exist
  const renderCalculationResults = () => {
    if (!quote.calculationResults || Object.keys(quote.calculationResults).length === 0) {
      return null;
    }
    
    return (
      <div style={{ marginBottom: 20, backgroundColor: "#1f1f1f", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#4CAF50", marginTop: 0 }}>Cost Breakdown by PAX Range</h3>
        
        {Object.entries(quote.calculationResults).map(([paxRange, results]) => {
          // Skip non-object entries or entries without base costs
          if (typeof results !== 'object' || !results) return null;
          
          // Find the PAX range label
          const paxValue = parseInt(paxRange);
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
          const range = PAX_RANGES.find(r => r.value === paxValue);
          const paxLabel = range ? range.label : `${paxValue} pax`;
          
          return (
            <div key={paxRange} style={{ marginBottom: 20, borderBottom: "1px solid #444", paddingBottom: 15 }}>
              <h4 style={{ color: "#4CAF50", marginTop: 0 }}>
                {paxLabel}
              </h4>
              
              {/* Base costs table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 15 }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Item</th>
                    <th style={tableHeaderStyle}>Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.transport && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Transportation</td>
                      <td style={tableCellStyle}>${parseFloat(results.transport).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.entrances && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Entrances</td>
                      <td style={tableCellStyle}>${parseFloat(results.entrances).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.jeep && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Jeep</td>
                      <td style={tableCellStyle}>${parseFloat(results.jeep).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.localGuide && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Local Guide</td>
                      <td style={tableCellStyle}>${parseFloat(results.localGuide).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.privateGuide && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Private Guide</td>
                      <td style={tableCellStyle}>${parseFloat(results.privateGuide).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.water && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Water</td>
                      <td style={tableCellStyle}>${parseFloat(results.water).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.meals && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Meals</td>
                      <td style={tableCellStyle}>${parseFloat(results.meals).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.meetAssist && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Meet & Assist</td>
                      <td style={tableCellStyle}>${parseFloat(results.meetAssist).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.extras && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Extras</td>
                      <td style={tableCellStyle}>${parseFloat(results.extras).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.tips && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Tips & Portages</td>
                      <td style={tableCellStyle}>${parseFloat(results.tips).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.commission && (
                    <tr style={tableRowStyle}>
                      <td style={tableCellStyle}>Bank Commission</td>
                      <td style={tableCellStyle}>${parseFloat(results.commission).toFixed(2)}</td>
                    </tr>
                  )}
                  {results.baseCostPerPersonUSD && (
                    <tr style={{...tableRowStyle, fontWeight: 'bold', backgroundColor: '#2a2a2a'}}>
                      <td style={tableCellStyle}>Base Cost Per Person</td>
                      <td style={tableCellStyle}>${parseFloat(results.baseCostPerPersonUSD).toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Options table */}
              <h5 style={{ marginTop: 15, marginBottom: 10 }}>Options</h5>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Option</th>
                    <th style={tableHeaderStyle}>Total Price (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results)
                    .filter(([key, value]) => !isNaN(parseInt(key)) && typeof value === 'object')
                    .map(([optIdx, optionData]) => {
                      return Object.entries(optionData).map(([validityIdx, data]) => {
                        if (!data || typeof data !== 'object') return null;
                        
                        // Get validity date if available
                        const validityDate = quote.validityDates && quote.validityDates[parseInt(validityIdx)];
                        const validityLabel = validityDate
                          ? `${validityDate.from} to ${validityDate.to}`
                          : `Validity Period ${parseInt(validityIdx) + 1}`;
                        
                        // Compute totals using corrected rule:
                        // (Base Per Person + Accommodation Subtotal Per Person) × (1 + Profit Margin)
                        const paxInt = parseInt(paxRange, 10) || 0;
                        const basePerPerson = parseFloat(results.baseCostPerPersonUSD || 0) || 0;
                        const accomGroup = (data && data.subtotals && data.subtotals.accommodationCosts) ? data.subtotals.accommodationCosts : 0;
                        const accomPerPerson = paxInt > 0 ? (accomGroup / paxInt) : 0;
                        const margin = (typeof quote.profitMargin === "number" ? quote.profitMargin : 0.10);
                        const perPersonSubtotal = basePerPerson + accomPerPerson;
                        const totalPerPersonWithProfit = perPersonSubtotal * (1 + margin);
                        const groupTotalWithProfit = totalPerPersonWithProfit * paxInt;

                        return (
                          <tr key={`${optIdx}-${validityIdx}`} style={{...tableRowStyle, backgroundColor: '#004D40'}}>
                            <td style={tableCellStyle}>
                              <div>Option {parseInt(optIdx) + 1}</div>
                              {validityDate && (
                                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                                  {validityLabel}
                                </div>
                              )}
                            </td>
                            <td style={{...tableCellStyle, fontWeight: 'bold', color: '#4CAF50'}}>
                              ${groupTotalWithProfit.toFixed(2)}
                              <div style={{ fontSize: 12, color: '#ccc', fontWeight: 'normal', marginTop: 4 }}>
                                ${totalPerPersonWithProfit.toFixed(2)} per person
                              </div>
                              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                                Base ${basePerPerson.toFixed(2)} + Accom ${accomPerPerson.toFixed(2)} = ${perPersonSubtotal.toFixed(2)} • +{(margin * 100).toFixed(0)}%
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper function to render seasons if they exist
  const renderSeasons = () => {
    if (!quote.seasons || !Array.isArray(quote.seasons) || quote.seasons.length === 0) {
      return null;
    }
    
    return (
      <div style={{ marginBottom: 20, backgroundColor: "#1f1f1f", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#FFD700", marginTop: 0 }}>Seasons</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Season</th>
              <th style={tableHeaderStyle}>From</th>
              <th style={tableHeaderStyle}>To</th>
            </tr>
          </thead>
          <tbody>
            {quote.seasons.map((season, index) => (
              <tr key={index} style={tableRowStyle}>
                <td style={tableCellStyle}>{season.name || "Season"}</td>
                <td style={tableCellStyle}>{season.from || "N/A"}</td>
                <td style={tableCellStyle}>{season.to || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper function to render final totals if they exist
  const renderFinalTotals = () => {
    if (!quote.finalTotals && !quote.totalCost) {
      return null;
    }
    
    const totals = quote.finalTotals || {};
    const totalCost = quote.totalCost || 0;
    
    return (
      <div style={{ marginBottom: 20, backgroundColor: "#004D40", padding: 15, borderRadius: 8 }}>
        <h3 style={{ color: "#FFFFFF", marginTop: 0 }}>Final Totals</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{...tableHeaderStyle, backgroundColor: "#00695C"}}>Item</th>
              <th style={{...tableHeaderStyle, backgroundColor: "#00695C"}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(totals).map(([key, value], index) => (
              <tr key={index} style={{...tableRowStyle, backgroundColor: "#00796B"}}>
                <td style={tableCellStyle}>{key}</td>
                <td style={tableCellStyle}>${parseFloat(value || 0).toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{...tableRowStyle, backgroundColor: "#00796B", fontWeight: "bold"}}>
              <td style={tableCellStyle}>Total Cost</td>
              <td style={tableCellStyle}>${parseFloat(totalCost || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Tabs for Original vs Actual Rates */}
      {actualRatesQuote && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid #444",
            paddingBottom: 0,
            width: "100%"
          }}>
            <button
              onClick={() => setActiveTab("original")}
              style={{
                padding: "12px 24px",
                backgroundColor: activeTab === "original" ? "#007bff" : "#2a2a2a",
                color: "white",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                maxWidth: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s ease"
              }}
            >
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#007bff"
              }}></span>
              Original Quotation
            </button>
            <button
              onClick={() => setActiveTab("actual")}
              style={{
                padding: "12px 24px",
                backgroundColor: activeTab === "actual" ? "#28a745" : "#2a2a2a",
                color: "white",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                maxWidth: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s ease"
              }}
            >
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#28a745"
              }}></span>
              Actual Rates
            </button>
          </div>
          <div style={{
            backgroundColor: activeTab === "original" ? "rgba(0, 123, 255, 0.1)" : "rgba(40, 167, 69, 0.1)",
            padding: "10px 15px",
            borderRadius: "0 8px 8px 8px",
            marginBottom: "20px",
            border: `1px solid ${activeTab === "original" ? "#007bff" : "#28a745"}`,
            borderTop: "none"
          }}>
            <p style={{ margin: 0, fontWeight: "bold", color: activeTab === "original" ? "#007bff" : "#28a745" }}>
              {activeTab === "original"
                ? "You are viewing the original quotation with estimated costs."
                : "You are viewing the actual rates with final pricing."}
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#aaa" }}>
              {activeTab === "original"
                ? "Switch to the Actual Rates tab to see the final pricing."
                : "Switch to the Original Quotation tab to compare with the estimated costs."}
            </p>
          </div>
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0 }}>
              {quote.group}
            </h1>
            <span style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "3px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              GROUP SERIES
            </span>
            {activeTab === "actual" && (
              <span style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold"
              }}>
                ACTUAL RATES
              </span>
            )}
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "20px", color: "#aaa" }}>
            <div>
              <strong>Program Length:</strong> {quote.programLength} nights
            </div>
            <div>
              <strong>Agent:</strong> {quote.agent}
            </div>
          </div>
          
          {/* Validity Dates Section */}
          <div style={{ marginTop: "15px", backgroundColor: "#1f1f1f", padding: "10px", borderRadius: "6px" }}>
            <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>Validity Dates:</p>
            {formatValidityDates(quote.validityDates)}
          </div>
        </div>
        <div>
          <button onClick={() => navigate("/quotations/group-series-list")} style={{ ...buttonStyle, backgroundColor: "#6c757d" }}>
            ← Back to list
          </button>
          <button onClick={handleExcelExport} style={{ ...buttonStyle, marginLeft: 10 }}>
            Download as Excel
          </button>
          <button
            onClick={() => {
              const currentQuote = activeTab === "original" ? quote : actualRatesQuote;

              // Prepare itinerary array (structured) for day labels
              const itinArr = Array.isArray(currentQuote?.itinerary)
                ? currentQuote.itinerary
                : (currentQuote?.quotations && currentQuote.quotations[0]?.itinerary) || [];

              // Build Optional Activities table rows to match the PDF layout
              const optionalActivitiesTable = [];
              try {
                const source = currentQuote?.optionalActivities || {};

                // Collect PAX range labels from quotations for per-person presentation
                const paxLabels = (Array.isArray(currentQuote?.quotations) ? currentQuote.quotations : [])
                  .map(q => q.paxRange || (q.pax ? `${q.pax} PAX` : ""))
                  .filter(Boolean);

                Object.entries(source).forEach(([dayIndex, activities]) => {
                  const di = parseInt(dayIndex, 10);
                  const dayLabel = Array.isArray(itinArr) && itinArr[di]?.day ? itinArr[di].day : `Day ${di + 1}`;
                  (activities || []).forEach((act) => {
                    const subtotal = calculateOptionalActivitySubtotal(act);
                    const usd = Number(subtotal.total || 0);
                    const jod = usd > 0 ? usd / 1.41 : 0; // Convert USD -> JOD using 1.41 rate

                    // Prepare per-PAX-range cost lines (per person) for PDF
                    const paxCosts = paxLabels.map(label => ({
                      label,
                      usd: Number(usd).toFixed(2),
                      jod: Number(jod).toFixed(2)
                    }));

                    optionalActivitiesTable.push({
                      city: act.city || "",
                      activity: act.activityName || "Activity",
                      // legacy single-value fields (kept for backward compatibility)
                      costUSD: usd.toFixed(2),
                      costJOD: jod.toFixed(2),
                      // new multi-PAX per-person costs
                      paxCosts,
                      day: dayLabel,
                      duration:
                        (act.durationHours || act.durationHours === 0)
                          ? `${act.durationHours} hour${Number(act.durationHours) === 1 ? "" : "s"}`
                          : "",
                      description: typeof act.experiences === "string" ? act.experiences : ""
                    });
                  });
                });
              } catch (e) {
                console.error("Failed to prepare optionalActivitiesTable:", e);
              }

              // Build a payload aligned with Group Series PDF signature
              // Provide structured itinerary rows so the PDF can render "Selected Restaurants"
              // Build itinerary rows prioritizing the active quote; if it lacks restaurant selections,
              // fall back to the ORIGINAL quote's itinerary rows (common when working on the "Actual" tab).
              const primaryItin =
                Array.isArray(currentQuote?.itinerary) && currentQuote.itinerary.length > 0
                  ? currentQuote.itinerary
                  : (Array.isArray(currentQuote?.quotations) && currentQuote.quotations.length > 0 && Array.isArray(currentQuote.quotations[0]?.itinerary))
                    ? currentQuote.quotations[0].itinerary
                    : [];

              const hasRestaurantsInRows = (arr) =>
                Array.isArray(arr) && arr.some(r =>
                  (r && r.lunchRestaurant && String(r.lunchRestaurant).trim().length > 0) ||
                  (r && r.dinnerRestaurant && String(r.dinnerRestaurant).trim().length > 0)
                );

              let itineraryRowsForPDF = primaryItin;

              if (!hasRestaurantsInRows(itineraryRowsForPDF)) {
                const originalItin =
                  Array.isArray(quote?.itinerary) && quote.itinerary.length > 0
                    ? quote.itinerary
                    : (Array.isArray(quote?.quotations) && quote.quotations.length > 0 && Array.isArray(quote.quotations[0]?.itinerary))
                      ? quote.quotations[0].itinerary
                      : [];
                if (hasRestaurantsInRows(originalItin)) {
                  itineraryRowsForPDF = originalItin;
                }
              }

              const payload = {
                groupName: currentQuote?.group || "",
                agent: currentQuote?.agent || "",
                quotations: currentQuote?.quotations || [],
                options: currentQuote?.options || [],
                isGroupSeries: true,
                validityDates: currentQuote?.validityDates || [],
                // Pass optional small images for PDF
                smallImage1: currentQuote?.smallImage1 || "",
                smallImage2: currentQuote?.smallImage2 || "",
                smallImage3: currentQuote?.smallImage3 || "",
                // Provide structured itinerary rows (includes meal selections from the creator)
                itineraryRows: itineraryRowsForPDF,
                // Keep itinerary as flattened text for the itinerary page
                itinerary: Array.isArray(currentQuote?.itinerary)
                  ? currentQuote.itinerary.map((day, i) => `Day ${i + 1}: ${day?.itinerary || ""}`).join("\n")
                  : "",
                // New: drive GS Optional Activities table in the PDF
                optionalActivitiesTable
              };

              generateGSOfferPDF(payload);
            }}
            style={{ ...buttonStyle, backgroundColor: "#007bff", marginLeft: 10 }}
          >
            Generate PDF
          </button>
          <button
            onClick={() => {
              const currentQuote = activeTab === "original" ? quote : actualRatesQuote;
              
              // Create a new object with only the necessary fields to avoid any confusion
              const offerData = {
                quotations: currentQuote.quotations || [],
                options: currentQuote.options || [],
                group: currentQuote.group || "Unknown Group",
                agent: currentQuote.agent || "",
                nationality: currentQuote.nationality || "",
                arrivalDate: currentQuote.arrivalDate || "",
                departureDate: currentQuote.departureDate || "",
                createdBy: currentQuote.createdBy || "",
                isGroupSeries: true, // Explicitly set this flag for Group Series offers
                quotationId: currentQuote.id,
                programLength: currentQuote.programLength,
                validityDates: currentQuote.validityDates || [],
                // Include small images so offers can embed them too
                smallImage1: currentQuote?.smallImage1 || "",
                smallImage2: currentQuote?.smallImage2 || "",
                smallImage3: currentQuote?.smallImage3 || "",
                // Pass detailed program data so the offer can auto-populate like FIT flow
                itinerary: Array.isArray(currentQuote.itinerary)
                  ? currentQuote.itinerary
                  : (currentQuote.quotations && currentQuote.quotations[0]?.itinerary) || [],
                optionalActivities: currentQuote.optionalActivities || {},
                calculationResults: currentQuote.calculationResults || {}
              };
              
              console.log("Creating Group Series offer from quotation with ID:", currentQuote.id);
              navigate("/offers/group-series-new", { state: offerData });
            }}
            style={{ ...buttonStyle, backgroundColor: "#17a2b8", marginLeft: 10 }}
          >
            Create Group Series Offer
          </button>
          {activeTab === "actual" && (
            <button
              onClick={async () => {
                try {
                  await saveActualRates();
                  // Status is set in saveActualRates function
                  return;
                } catch (error) {
                  console.error("Error saving changes:", error);
                  setSaveStatus("Error saving changes. Please try again.");
                  setTimeout(() => setSaveStatus(""), 3000);
                }
              }}
              style={{ ...buttonStyle, backgroundColor: "#28a745", marginLeft: 10 }}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
      
      {/* Save status message */}
      {saveStatus && (
        <div style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "10px 15px",
          borderRadius: "6px",
          marginBottom: "15px",
          fontWeight: "bold"
        }}>
          {saveStatus}
        </div>
      )}
      
      {/* Render Itinerary */}
      {renderItinerary()}
      
      {/* Render Optional Activities */}
      {renderOptionalActivities()}
      
      {/* Render Calculation Results */}
      {renderCalculationResults()}
      
      {/* Render Optionals */}
      {renderOptionals()}
      
      {/* Render Seasons */}
      {renderSeasons()}
      
      {/* Render Final Totals */}
      {renderFinalTotals()}

      {/* Check if quotations exist and display a message if not */}
      {(!quote.quotations || quote.quotations.length === 0) && (
        <div style={{
          padding: "20px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "6px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <h3>No quotation data available</h3>
          <p>This Group Series Quotation doesn't contain any PAX range data.</p>
        </div>
      )}
      
      {/* Map through quotations if they exist */}
      {(activeTab === "original" ? quote : actualRatesQuote)?.quotations?.map((paxRange, index) => (
        <div key={index} style={{ marginBottom: 40 }}>
          <h2>PAX Range: {paxRange.paxRange}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Item</th>
                <th style={tableHeaderStyle}>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Entrance Fees</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.entranceFees || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Transportation</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.transportation || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Bank Commission</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.bankCommission || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Jeeps</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.jeeps || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Meet and Assist</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.meetAndAssist || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Guide</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.privateGuide || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Local Guide</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.localGuide || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Meals</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.meals || 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Tips & Portages</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.tips || 0).toFixed(2)}</td></tr>
              {paxRange.costs?.water > 0 && (
                <tr style={tableRowStyle}><td style={tableCellStyle}>Water</td><td style={tableCellStyle}>${parseFloat(paxRange.costs?.water || 0).toFixed(2)}</td></tr>
              )}
              <tr style={{...tableRowStyle, fontWeight: 'bold' }}><td style={tableCellStyle}>Cost Before Accom and Profit Margin</td><td style={tableCellStyle}>${parseFloat(paxRange.costBeforeAccommodationAndProfitMargin || 0).toFixed(2)}</td></tr>
              {paxRange.options?.map((opt, i) => (
                <tr key={i} style={{
                  ...tableRowStyle,
                  backgroundColor: '#2a2a2a',
                }}>
                  <td style={tableCellStyle}>
                    <div>Option {i + 1} (with accom and profit margin)</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                      {opt.accommodations?.map((accom, j) => (
                        <span key={j}>
                          {accom.hotelName ? `${accom.hotelName} (${accom.city}, ${accom.stars}★)` : 'No hotel'}
                          {j < opt.accommodations.length - 1 ? ' → ' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={tableCellStyle}>${parseFloat(opt.totalCost || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Display detailed hotel information for each option */}
          {paxRange.options?.map((option, optIdx) => {
            // Function to calculate accommodation total with board logic × pax × nights
            const calculateTotal = () => {
              if (activeTab !== "actual" || !actualRatesQuote) return 0;

              try {
                // Determine pax for this quotation row
                let paxCount = 0;
                if (typeof paxRange?.pax === "number") {
                  paxCount = paxRange.pax;
                } else {
                  const m = String(paxRange?.paxRange || "").match(/\d+/);
                  paxCount = m ? parseInt(m[0], 10) : 0;
                }

                let total = 0;

                // Sum accommodation costs using board logic and nights
                actualRatesQuote.quotations[index].options[optIdx].accommodations.forEach((accom) => {
                  const nights = Number(accom.nights) || 1;
                  const board = accom.board || "B/B";

                  const dblRate = parseFloat(accom.dblRate) || 0;
                  const sglRate = parseFloat(accom.sglRate) || 0;
                  const hbRate  = parseFloat(accom.hbRate)  || 0;

                  let perPersonPerNight = 0;
                  switch (board) {
                    case "B/B":
                      perPersonPerNight = dblRate;
                      break;
                    case "H/B":
                      perPersonPerNight = dblRate + hbRate;
                      break;
                    case "SGL Supplement":
                      perPersonPerNight = dblRate + sglRate;
                      break;
                    case "SGL + HB":
                      perPersonPerNight = dblRate + sglRate + hbRate;
                      break;
                    default:
                      perPersonPerNight = dblRate;
                  }

                  const perPersonForStay = perPersonPerNight * nights;
                  total += perPersonForStay * (paxCount || 0);
                });

                return total;
              } catch (error) {
                console.error("Error calculating total:", error);
                return 0;
              }
            };
            
            // Function to update option total cost
            const updateOptionTotalCost = () => {
              if (activeTab !== "actual" || !actualRatesQuote) return;
              
              try {
                const total = calculateTotal();
                
                // Update the option's total cost
                const newActualRates = JSON.parse(JSON.stringify(actualRatesQuote));
                newActualRates.quotations[index].options[optIdx].totalCost = total.toFixed(2);
                setActualRatesQuote(newActualRates);
              } catch (error) {
                console.error("Error updating option total cost:", error);
              }
            };
            
            return (
              <div key={optIdx} style={{
                marginTop: 15,
                marginBottom: 20,
                backgroundColor: "#2a1f1f",
                padding: 15,
                borderRadius: 8,
                border: "1px solid #444"
              }}>
                <h4 style={{ color: "#FFD700", margin: "0 0 10px 0" }}>Option {optIdx + 1} Hotel Details</h4>
                
                {option.accommodations?.map((accom, accomIdx) => {
                  return (
                    <div key={accomIdx} style={{
                      marginBottom: 10,
                      backgroundColor: "#1f1f1f",
                      padding: 10,
                      borderRadius: 6
                    }}>
                      <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
                        {accom.hotelName || 'Hotel'} ({accom.city || 'City'}, {accom.stars || 'N/A'} stars)
                      </p>
                      
                      {/* Editable hotel rates */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 10 }}>
                        {activeTab === "actual" ? (
                          // Actual rates tab - use separate inputs with direct state access
                          <>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>DBL B/B Rate:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>SGL Rate:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>H/B Supplement:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          // Original quotation tab
                          <>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>DBL B/B Rate:</label>
                              <input
                                type="number"
                                value={accom.dblRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>SGL Rate:</label>
                              <input
                                type="number"
                                value={accom.sglRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>H/B Supplement:</label>
                              <input
                                type="number"
                                value={accom.hbRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Display validity rates if they exist */}
                      {accom.validityRates && accom.validityRates.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ fontWeight: "bold", margin: "10px 0 5px 0", color: "#FFD700" }}>Validity Rates:</p>
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 5 }}>
                            <thead>
                              <tr>
                                <th style={{...tableHeaderStyle, fontSize: '12px'}}>From</th>
                                <th style={{...tableHeaderStyle, fontSize: '12px'}}>To</th>
                                <th style={{...tableHeaderStyle, fontSize: '12px'}}>DBL Rate</th>
                                <th style={{...tableHeaderStyle, fontSize: '12px'}}>SGL Rate</th>
                                <th style={{...tableHeaderStyle, fontSize: '12px'}}>H/B Supplement</th>
                              </tr>
                            </thead>
                            <tbody>
                              {accom.validityRates.map((rate, rateIdx) => (
                                <tr key={rateIdx} style={tableRowStyle}>
                                  <td style={{...tableCellStyle, fontSize: '12px'}}>{rate.from}</td>
                                  <td style={{...tableCellStyle, fontSize: '12px'}}>{rate.to}</td>
                                  <td style={{...tableCellStyle, fontSize: '12px'}}>${parseFloat(rate.dblRate || 0).toFixed(2)}</td>
                                  <td style={{...tableCellStyle, fontSize: '12px'}}>${parseFloat(rate.sglRate || 0).toFixed(2)}</td>
                                  <td style={{...tableCellStyle, fontSize: '12px'}}>${parseFloat(rate.hbRate || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {/* Special comment if exists */}
                      {accom.specialComment && (
                        <p style={{ margin: "10px 0 0 0", color: "#FFD700" }}>
                          <strong>Comment:</strong> {accom.specialComment}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {/* Option total cost */}
                <div style={{ marginTop: 15, backgroundColor: "#004D40", padding: 10, borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>Total Cost:</span>
                    {activeTab === "actual" ? (
                      <div style={{
                        padding: 8,
                        borderRadius: 4,
                        backgroundColor: "#00796B",
                        color: "#fff",
                        width: "120px",
                        fontWeight: "bold",
                        textAlign: "center"
                      }}>
                        ${parseFloat(option.totalCost || 0).toFixed(2)}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={option.totalCost || ''}
                        onChange={(e) => {
                          const newQuote = JSON.parse(JSON.stringify(quote)); // Deep clone
                          newQuote.quotations[index].options[optIdx].totalCost = e.target.value;
                          setQuote(newQuote);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: "1px solid #006064",
                          backgroundColor: "#00796B",
                          color: "#fff",
                          width: "120px",
                          fontWeight: "bold"
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}