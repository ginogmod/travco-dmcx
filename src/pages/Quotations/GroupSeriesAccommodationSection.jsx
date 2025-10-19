import React, { useState, useEffect } from "react";

function GroupSeriesAccommodationSection({ option, itineraryCities, validityDates = [] }) {
  const [rows, setRows] = useState([]);
  const [hotelRates, setHotelRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [useSpecialRates, setUseSpecialRates] = useState(true);
  const [currentValidityDate, setCurrentValidityDate] = useState(validityDates.length > 0 ? 0 : -1);
  
  // Debug log for validityDates
  useEffect(() => {
    console.log("GroupSeriesAccommodationSection received validityDates:", validityDates);
  }, [validityDates]);

  const emptyRow = {
    city: "",
    stars: "",
    hotelName: "",
    season: "",
    nights: 1,
    roomType: "DBL",
    hb: false,
    sglSupp: false,
    bbRate: 0,
    hbRate: 0,
    sglSuppRate: 0,
    rateType: "seasonality", // Default to seasonality-based rates
    flatRate: 0, // New field for flat rate option
    validityRates: validityDates.length > 0
      ? validityDates.map((_, index) => ({
          validityDateIndex: index,
          season: "Standard", // Default season
          dblRate: 0,
          hbRate: 0,
          sglRate: 0
        }))
      : []
  };

  useEffect(() => {
    fetch(`/data/hotelRates_CLEAN.json?nocache=${Date.now()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch hotel rates: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((hotelData) => {
        // Transform the hotel data to match the expected structure
        const transformedHotelData = hotelData.map(item => {
          // Create a new object with the expected field names
          const transformed = {
            City: item.City,
            Stars: item.Stars,
            Hotel: item.Hotel,
            Season: item.Season || "Standard" // Default to "Standard" if no season is specified
          };
          
          // Set the appropriate rate field based on the room type
          if (item.RoomType === "DBL") {
            transformed.Rate_DBL = item.Rate;
          } else if (item.RoomType === "SGL") {
            transformed.Rate_SGL = item.Rate;
          } else if (item.RoomType === "HB") {
            transformed.Rate_HB = item.Rate;
          }
          
          return transformed;
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
          
          // Update the rates
          if (item.Rate_DBL) groupedHotels[key].Rate_DBL = item.Rate_DBL;
          if (item.Rate_SGL) groupedHotels[key].Rate_SGL = item.Rate_SGL;
          if (item.Rate_HB) groupedHotels[key].Rate_HB = item.Rate_HB;
        });
        
        // Convert the grouped data back to an array
        const processedHotels = Object.values(groupedHotels);
        
        console.log("Processed hotel rates for GroupSeriesAccommodationSection:", processedHotels);
        setHotelRates(processedHotels);
      })
      .catch((err) => {
        console.error("Failed to load hotelRates_CLEAN.json", err);
        // Show error notification to user
        alert("Failed to load hotel rates. Please refresh the page and try again.");
      });
  }, []);

  // Load any saved special rates from localStorage
  useEffect(() => {
    const agentId = localStorage.getItem('currentAgentId');
    if (agentId) {
      const savedSpecialRates = localStorage.getItem(`specialRates_${agentId}`);
      if (savedSpecialRates) {
        setSpecialRates(JSON.parse(savedSpecialRates));
      }
    }
  }, []);

  useEffect(() => {
    const cities = [...new Set(itineraryCities)];
    const prefilled = cities.map((city) => {
      const newRow = { ...emptyRow, city };
      console.log(`Creating new row for city ${city} with validityRates:`, newRow.validityRates);
      return newRow;
    });
    setRows(prefilled);
  }, [itineraryCities]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    
    // If changing rate type, reset some fields
    if (field === 'rateType') {
      if (value === 'flat') {
        // When switching to flat rate, clear seasonality-based rates
        updated[index].bbRate = 0;
        updated[index].hbRate = 0;
        updated[index].sglSuppRate = 0;
        updated[index].season = "";
        
        // Also clear validity rates
        if (validityDates.length > 0) {
          updated[index].validityRates = validityDates.map((_, validityIndex) => ({
            validityDateIndex: validityIndex,
            season: "Standard",
            dblRate: 0,
            hbRate: 0,
            sglRate: 0
          }));
        }
      } else {
        // When switching to seasonality, clear flat rate
        updated[index].flatRate = 0;
      }
    }
    
    setRows(updated);

    const selected = updated[index];

    // Only apply match when all required fields are selected and using seasonality rate type
    if (
      selected.rateType === 'seasonality' &&
      selected.city &&
      selected.stars &&
      selected.hotelName
    ) {
      // If we have validity dates, update rates for each validity date
      if (validityDates.length > 0) {
        // Make sure validityRates array exists and has the right length
        if (!selected.validityRates || selected.validityRates.length !== validityDates.length) {
          console.log(`Initializing validityRates for row with city ${selected.city}, hotel ${selected.hotelName}`);
          selected.validityRates = validityDates.map((_, validityIndex) => ({
            validityDateIndex: validityIndex,
            season: "Standard",
            dblRate: 0,
            hbRate: 0,
            sglRate: 0
          }));
          console.log(`Initialized validityRates:`, selected.validityRates);
        }
        
        // Update rates for each validity date
        selected.validityRates.forEach((validityRate, validityIndex) => {
          const season = validityRate.season || "Standard";
          
          console.log(`Looking for rates for validity date ${validityIndex}, season: ${season}`);
          
          // Check for special rate
          const specialRate = specialRates.find(
            (sr) =>
              sr.City === selected.city &&
              sr.Stars == selected.stars &&
              sr.Hotel === selected.hotelName &&
              sr.Season === season
          );

          // Get standard rate
          const standardRate = hotelRates.find(
            (h) =>
              h.City === selected.city &&
              h.Stars === selected.stars &&
              h.Hotel === selected.hotelName &&
              h.Season === season
          );
          
          console.log(`Found rates for ${selected.city}, ${selected.stars}★, ${selected.hotelName}, ${season}:`,
            specialRate ? `Special rate: ${specialRate.Rate_DBL}/${specialRate.Rate_HB}/${specialRate.Rate_SGL}` : 'No special rate',
            standardRate ? `Standard rate: ${standardRate.Rate_DBL}/${standardRate.Rate_HB}/${standardRate.Rate_SGL}` : 'No standard rate'
          );

          // Store rates for this validity date
          if (specialRate && useSpecialRates) {
            selected.validityRates[validityIndex].dblRate = specialRate.Rate_DBL || 0;
            selected.validityRates[validityIndex].hbRate = specialRate.Rate_HB || 0;
            selected.validityRates[validityIndex].sglRate = specialRate.Rate_SGL || 0;
          } else if (standardRate) {
            selected.validityRates[validityIndex].dblRate = standardRate.Rate_DBL || 0;
            selected.validityRates[validityIndex].hbRate = standardRate.Rate_HB || 0;
            selected.validityRates[validityIndex].sglRate = standardRate.Rate_SGL || 0;
          } else {
            // If no rate found for this season, try with "Standard" season as fallback
            if (season !== "Standard") {
              const fallbackStandardRate = hotelRates.find(
                (h) =>
                  h.City === selected.city &&
                  h.Stars === selected.stars &&
                  h.Hotel === selected.hotelName &&
                  h.Season === "Standard"
              );
              
              if (fallbackStandardRate) {
                console.log(`Using fallback Standard season rate for ${season}`);
                selected.validityRates[validityIndex].dblRate = fallbackStandardRate.Rate_DBL || 0;
                selected.validityRates[validityIndex].hbRate = fallbackStandardRate.Rate_HB || 0;
                selected.validityRates[validityIndex].sglRate = fallbackStandardRate.Rate_SGL || 0;
              }
            }
          }
        });
        
        // Also update the current rates for backward compatibility
        if (currentValidityDate >= 0 && selected.validityRates[currentValidityDate]) {
          selected.bbRate = selected.validityRates[currentValidityDate].dblRate;
          selected.hbRate = selected.validityRates[currentValidityDate].hbRate;
          selected.sglSuppRate = selected.validityRates[currentValidityDate].sglRate;
          selected.season = selected.validityRates[currentValidityDate].season;
          
          console.log(`Updated current rates for backward compatibility: BB=${selected.bbRate}, HB=${selected.hbRate}, SGL=${selected.sglSuppRate}, Season=${selected.season}`);
        }
      } else {
        // Single validity date (original behavior)
        if (selected.season) {
          // Check for special rate
          const specialRate = specialRates.find(
            (sr) =>
              sr.City === selected.city &&
              sr.Stars == selected.stars &&
              sr.Hotel === selected.hotelName &&
              sr.Season === selected.season
          );

          // Get standard rate
          const standardRate = hotelRates.find(
            (h) =>
              h.City === selected.city &&
              h.Stars === selected.stars &&
              h.Hotel === selected.hotelName &&
              h.Season === selected.season
          );

          // Store both rates for reference
          updated[index].specialRate = specialRate || null;
          updated[index].standardRate = standardRate || null;
          updated[index].hasSpecialRate = !!specialRate;

          // Apply the appropriate rate
          if (specialRate && useSpecialRates) {
            updated[index].bbRate = specialRate.Rate_DBL || 0;
            updated[index].hbRate = specialRate.Rate_HB || 0;
            updated[index].sglSuppRate = specialRate.Rate_SGL || 0;
            updated[index].isSpecialRate = true;
          } else if (standardRate) {
            updated[index].bbRate = standardRate.Rate_DBL || 0;
            updated[index].hbRate = standardRate.Rate_HB || 0;
            updated[index].sglSuppRate = standardRate.Rate_SGL || 0;
            updated[index].isSpecialRate = false;
          }
        }
      }

      setRows([...updated]); // force update
    }
  };

  const unique = (key, city = "", stars = "") => {
    let filtered = hotelRates;
    if (city) filtered = filtered.filter((h) => h.City === city);
    if (stars) filtered = filtered.filter((h) => h.Stars === stars);
    let values = [...new Set(filtered.map((h) => h[key]).filter(Boolean))];

    // Special case: Wadi Rum only has camps, so only allow Deluxe and Regular in Stars
    if (key === "Stars" && city === "Wadi Rum") {
      const allowed = new Set(["Deluxe", "Regular"]);
      values = values.filter((v) => allowed.has(String(v)));
    }
    return values;
  };

  // Function to toggle between special and standard rates for a specific row
  const toggleRateType = (index) => {
    const updated = [...rows];
    const row = updated[index];
    
    if (row.isSpecialRate) {
      // Switch to standard rate
      row.bbRate = row.standardRate.Rate_DBL || 0;
      row.hbRate = row.standardRate.Rate_HB || 0;
      row.sglSuppRate = row.standardRate.Rate_SGL || 0;
      row.isSpecialRate = false;
    } else {
      // Switch to special rate
      row.bbRate = row.specialRate.Rate_DBL || 0;
      row.hbRate = row.specialRate.Rate_HB || 0;
      row.sglSuppRate = row.specialRate.Rate_SGL || 0;
      row.isSpecialRate = true;
    }
    
    setRows(updated);
  };

  return (
    <div style={{ color: "white", marginTop: "40px" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ marginRight: '20px', marginBottom: 0 }}>Group Series Accommodation – Option {option}</h3>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useSpecialRates}
            onChange={() => setUseSpecialRates(!useSpecialRates)}
            style={{ marginRight: 10, transform: 'scale(1.3)' }}
          />
          <span style={{ fontSize: 14 }}>
            Use special agent rates when available
          </span>
        </label>
      </div>

      {validityDates.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Validity Periods:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {validityDates.map((dateRange, index) => (
              <button
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
        </div>
      )}

      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #444",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "20px"
            }}
          >
            <div>
              <label>City</label>
              <input value={row.city} disabled />
            </div>

            <div>
              <label>Star Level</label>
              <select
                value={row.stars}
                onChange={(e) => handleChange(i, "stars", e.target.value)}
              >
                <option value="">Select</option>
                {unique("Stars", row.city)
                  .sort((a, b) => {
                    const an = Number(a), bn = Number(b);
                    if (!isNaN(an) && !isNaN(bn)) return bn - an;
                    return 0;
                  })
                  .map((s) => (
                    <option key={s} value={s}>
                      {typeof s === "number" || /^\d+$/.test(String(s)) ? `${s}★` : s}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>Hotel</label>
              <select
                value={row.hotelName}
                onChange={(e) => {
                  console.log(`Hotel selected: ${e.target.value} for city ${row.city}, stars ${row.stars}`);
                  console.log(`Current validityDates:`, validityDates);
                  console.log(`Current validityRates for this row:`, row.validityRates);
                  handleChange(i, "hotelName", e.target.value);
                }}
              >
                <option value="">Select</option>
                {unique("Hotel", row.city, row.stars).map((hotel) => (
                  <option key={hotel} value={hotel}>
                    {hotel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Nights</label>
              <input
                type="number"
                value={row.nights}
                min={1}
                onChange={(e) =>
                  handleChange(i, "nights", parseInt(e.target.value, 10))
                }
              />
            </div>

            <div>
              <label>Rate Type</label>
              <select
                value={row.rateType}
                onChange={(e) => handleChange(i, "rateType", e.target.value)}
                style={{
                  backgroundColor: row.rateType === "flat" ? "#004D40" : "#2a2a2a",
                  color: "white"
                }}
              >
                <option value="seasonality">Seasonality Based</option>
                <option value="flat">Flat Rate</option>
              </select>
            </div>
          </div>

          {/* Conditional rendering based on rate type */}
          {row.rateType === 'flat' ? (
            // Flat Rate Section
            <div
              style={{
                backgroundColor: "#004D40",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px"
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: "15px" }}>Flat Rate Configuration</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <label>Flat Rate (per person)</label>
                  <input
                    type="number"
                    value={row.flatRate}
                    onChange={(e) => handleChange(i, "flatRate", parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "8px", backgroundColor: "#00695C", color: "white", border: "1px solid #004D40" }}
                  />
                  <small style={{ display: "block", marginTop: "5px", color: "#aaa" }}>
                    This rate will be applied regardless of season
                  </small>
                </div>
                <div>
                  <label>Room Type</label>
                  <select
                    value={row.roomType}
                    onChange={(e) => handleChange(i, "roomType", e.target.value)}
                    style={{ width: "100%", padding: "8px", backgroundColor: "#00695C", color: "white", border: "1px solid #004D40" }}
                  >
                    <option value="DBL">DBL</option>
                    <option value="SGL">SGL</option>
                  </select>
                </div>
                <div>
                  <label>Half Board</label>
                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="checkbox"
                      checked={row.hb}
                      onChange={(e) => handleChange(i, "hb", e.target.checked)}
                      style={{ transform: "scale(1.3)" }}
                    />
                    <span style={{ marginLeft: "8px" }}>Include Half Board</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Seasonality Based Section
            <div
              style={{
                backgroundColor: "#2a2a2a",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px"
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: "15px" }}>Seasonality Based Configuration</h4>
              
              {validityDates.length > 0 ? (
                // Multiple validity dates UI
                <div>
                  <div style={{ marginBottom: "15px", borderBottom: "1px solid #444", paddingBottom: "10px" }}>
                    <h5 style={{ margin: "0 0 10px 0" }}>
                      Rates for {validityDates[currentValidityDate]?.from} to {validityDates[currentValidityDate]?.to}
                    </h5>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <div>
                      <label>Season</label>
                      <select
                        value={row.validityRates[currentValidityDate]?.season || ""}
                        onChange={(e) => {
                          const newRows = [...rows];
                          if (!newRows[i].validityRates[currentValidityDate]) {
                            newRows[i].validityRates[currentValidityDate] = {
                              validityDateIndex: currentValidityDate,
                              season: "",
                              dblRate: 0,
                              hbRate: 0,
                              sglRate: 0
                            };
                          }
                          newRows[i].validityRates[currentValidityDate].season = e.target.value;
                          
                          // Find matching rate for this season
                          if (newRows[i].city && newRows[i].stars && newRows[i].hotelName) {
                            // Check for special rate first
                            const specialRate = specialRates.find(
                              (sr) =>
                                sr.City === newRows[i].city &&
                                sr.Stars == newRows[i].stars &&
                                sr.Hotel === newRows[i].hotelName &&
                                sr.Season === e.target.value
                            );
                            
                            // Get standard rate
                            const standardRate = hotelRates.find(
                              (h) =>
                                h.City === newRows[i].city &&
                                h.Stars === newRows[i].stars &&
                                h.Hotel === newRows[i].hotelName &&
                                h.Season === e.target.value
                            );
                            
                            console.log(`Season changed to ${e.target.value}. Found rates:`,
                              specialRate ? `Special: ${specialRate.Rate_DBL}/${specialRate.Rate_HB}/${specialRate.Rate_SGL}` : 'No special rate',
                              standardRate ? `Standard: ${standardRate.Rate_DBL}/${standardRate.Rate_HB}/${standardRate.Rate_SGL}` : 'No standard rate'
                            );
                            
                            if (specialRate && useSpecialRates) {
                              newRows[i].validityRates[currentValidityDate].dblRate = specialRate.Rate_DBL || 0;
                              newRows[i].validityRates[currentValidityDate].hbRate = specialRate.Rate_HB || 0;
                              newRows[i].validityRates[currentValidityDate].sglRate = specialRate.Rate_SGL || 0;
                            } else if (standardRate) {
                              newRows[i].validityRates[currentValidityDate].dblRate = standardRate.Rate_DBL || 0;
                              newRows[i].validityRates[currentValidityDate].hbRate = standardRate.Rate_HB || 0;
                              newRows[i].validityRates[currentValidityDate].sglRate = standardRate.Rate_SGL || 0;
                            } else {
                              // If no rate found for this season, try with "Standard" season as fallback
                              if (e.target.value !== "Standard") {
                                const fallbackStandardRate = hotelRates.find(
                                  (h) =>
                                    h.City === newRows[i].city &&
                                    h.Stars === newRows[i].stars &&
                                    h.Hotel === newRows[i].hotelName &&
                                    h.Season === "Standard"
                                );
                                
                                if (fallbackStandardRate) {
                                  console.log(`Using fallback Standard season rate for ${e.target.value}`);
                                  newRows[i].validityRates[currentValidityDate].dblRate = fallbackStandardRate.Rate_DBL || 0;
                                  newRows[i].validityRates[currentValidityDate].hbRate = fallbackStandardRate.Rate_HB || 0;
                                  newRows[i].validityRates[currentValidityDate].sglRate = fallbackStandardRate.Rate_SGL || 0;
                                }
                              }
                            }
                          }
                          
                          setRows(newRows);
                        }}
                      >
                        <option value="">Select</option>
                        {unique("Season", row.city, row.stars).map((season) => (
                          <option key={season} value={season}>
                            {season}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Room</label>
                      <select
                        value={row.roomType}
                        onChange={(e) => handleChange(i, "roomType", e.target.value)}
                      >
                        <option value="DBL">DBL</option>
                        <option value="SGL">SGL</option>
                      </select>
                    </div>
                    <div>
                      <label>Half Board</label>
                      <input
                        type="checkbox"
                        checked={row.hb}
                        onChange={(e) => handleChange(i, "hb", e.target.checked)}
                        style={{ marginTop: "10px", transform: "scale(1.3)" }}
                      />
                    </div>
                    <div>
                      <label>Single Supplement</label>
                      <input
                        type="checkbox"
                        checked={row.sglSupp}
                        onChange={(e) => handleChange(i, "sglSupp", e.target.checked)}
                        style={{ marginTop: "10px", transform: "scale(1.3)" }}
                      />
                    </div>
                    <div>
                      <label>DBL B/B Rate</label>
                      <input
                        value={row.validityRates[currentValidityDate]?.dblRate || 0}
                        onChange={(e) => {
                          console.log(`Manually changing B/B Rate to ${e.target.value} for validity date ${currentValidityDate}`);
                          const newRows = [...rows];
                          if (!newRows[i].validityRates[currentValidityDate]) {
                            newRows[i].validityRates[currentValidityDate] = {
                              validityDateIndex: currentValidityDate,
                              season: row.validityRates[currentValidityDate]?.season || "Standard",
                              dblRate: 0,
                              hbRate: 0,
                              sglRate: 0
                            };
                          }
                          newRows[i].validityRates[currentValidityDate].dblRate = parseFloat(e.target.value) || 0;
                          setRows(newRows);
                        }}
                        style={{
                          backgroundColor: "#2a2a2a",
                          color: "white"
                        }}
                      />
                      <small style={{ display: "block", marginTop: "5px", color: "#aaa" }}>
                        Current value: {row.validityRates[currentValidityDate]?.dblRate || 0}
                      </small>
                    </div>
                    <div>
                      <label>HB Rate</label>
                      <input
                        value={row.validityRates[currentValidityDate]?.hbRate || 0}
                        onChange={(e) => {
                          const newRows = [...rows];
                          if (!newRows[i].validityRates[currentValidityDate]) {
                            newRows[i].validityRates[currentValidityDate] = {
                              validityDateIndex: currentValidityDate,
                              season: row.validityRates[currentValidityDate]?.season || "Standard",
                              dblRate: row.validityRates[currentValidityDate]?.dblRate || 0,
                              hbRate: 0,
                              sglRate: row.validityRates[currentValidityDate]?.sglRate || 0
                            };
                          }
                          newRows[i].validityRates[currentValidityDate].hbRate = parseFloat(e.target.value) || 0;
                          setRows(newRows);
                        }}
                        style={{
                          backgroundColor: "#2a2a2a",
                          color: "white"
                        }}
                      />
                    </div>
                    <div>
                      <label>SGL Rate</label>
                      <input
                        value={row.validityRates[currentValidityDate]?.sglRate || 0}
                        onChange={(e) => {
                          const newRows = [...rows];
                          if (!newRows[i].validityRates[currentValidityDate]) {
                            newRows[i].validityRates[currentValidityDate] = {
                              validityDateIndex: currentValidityDate,
                              season: row.validityRates[currentValidityDate]?.season || "Standard",
                              dblRate: row.validityRates[currentValidityDate]?.dblRate || 0,
                              hbRate: row.validityRates[currentValidityDate]?.hbRate || 0,
                              sglRate: 0
                            };
                          }
                          newRows[i].validityRates[currentValidityDate].sglRate = parseFloat(e.target.value) || 0;
                          setRows(newRows);
                        }}
                        style={{
                          backgroundColor: "#2a2a2a",
                          color: "white"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Single validity date UI (original)
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div>
                    <label>Season</label>
                    <select
                      value={row.season}
                      onChange={(e) => handleChange(i, "season", e.target.value)}
                    >
                      <option value="">Select</option>
                      {unique("Season", row.city, row.stars).map((season) => (
                        <option key={season} value={season}>
                          {season}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Room</label>
                    <select
                      value={row.roomType}
                      onChange={(e) => handleChange(i, "roomType", e.target.value)}
                    >
                      <option value="DBL">DBL</option>
                      <option value="SGL">SGL</option>
                    </select>
                  </div>
                  <div>
                    <label>Half Board</label>
                    <input
                      type="checkbox"
                      checked={row.hb}
                      onChange={(e) => handleChange(i, "hb", e.target.checked)}
                      style={{ marginTop: "10px", transform: "scale(1.3)" }}
                    />
                  </div>
                  <div>
                    <label>Single Supplement</label>
                    <input
                      type="checkbox"
                      checked={row.sglSupp}
                      onChange={(e) => handleChange(i, "sglSupp", e.target.checked)}
                      style={{ marginTop: "10px", transform: "scale(1.3)" }}
                    />
                  </div>
                  <div>
                    <label>B/B Rate</label>
                    <input
                      value={row.bbRate}
                      disabled
                      style={{
                        backgroundColor: row.isSpecialRate ? "#004D40" : "#2a2a2a",
                        color: "white"
                      }}
                    />
                    {row.hasSpecialRate && (
                      <div style={{ marginTop: "4px" }}>
                        {row.isSpecialRate ? (
                          <small style={{ color: "#4CAF50", fontSize: "12px", display: "block" }}>
                            Special rate applied
                          </small>
                        ) : (
                          <small style={{ color: "#FFA726", fontSize: "12px", display: "block" }}>
                            Regular rate applied (special rate available)
                          </small>
                        )}
                        <button
                          onClick={() => toggleRateType(i)}
                          style={{
                            backgroundColor: row.isSpecialRate ? "#FF9800" : "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                            marginTop: "4px"
                          }}
                        >
                          {row.isSpecialRate ? "Use Regular Rate" : "Use Special Rate"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label>HB Rate</label>
                    <input
                      value={row.hbRate}
                      disabled
                      style={{
                        backgroundColor: row.isSpecialRate ? "#004D40" : "#2a2a2a",
                        color: "white"
                      }}
                    />
                  </div>
                  <div>
                    <label>SGL Supplement</label>
                    <input
                      value={row.sglSuppRate}
                      disabled
                      style={{
                        backgroundColor: row.isSpecialRate ? "#004D40" : "#2a2a2a",
                        color: "white"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default GroupSeriesAccommodationSection;