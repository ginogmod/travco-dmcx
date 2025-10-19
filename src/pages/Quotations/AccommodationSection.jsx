import { useState, useEffect } from "react";

function AccommodationSection({ option, itineraryCities }) {
  const [rows, setRows] = useState([]);
  const [hotelRates, setHotelRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [useSpecialRates, setUseSpecialRates] = useState(true);

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
        
        console.log("Processed hotel rates for AccommodationSection:", processedHotels);
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
    const prefilled = cities.map((city) => ({ ...emptyRow, city }));
    setRows(prefilled);
  }, [itineraryCities]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);

    const selected = updated[index];

    // Only apply match when all required fields are selected
    if (
      selected.city &&
      selected.stars &&
      selected.hotelName &&
      selected.season
    ) {
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
        <h3 style={{ marginRight: '20px', marginBottom: 0 }}>Accommodation – Option {option}</h3>
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
                onChange={(e) =>
                  handleChange(i, "hotelName", e.target.value)
                }
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
              />
            </div>

            <div>
              <label>Single Supplement</label>
              <input
                type="checkbox"
                checked={row.sglSupp}
                onChange={(e) => handleChange(i, "sglSupp", e.target.checked)}
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
        </div>
      ))}
    </div>
  );
}

export default AccommodationSection;
