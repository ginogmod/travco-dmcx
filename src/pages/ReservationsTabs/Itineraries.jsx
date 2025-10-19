import { useState, useEffect } from 'react';

function Itineraries({ fileNo, initialData, data, onSave }) {
  const [programType, setProgramType] = useState('tailor');
  const [rows, setRows] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load restaurant data (cache-busted) with fallback to Restaurants_2025.json
  useEffect(() => {
    const JOD_TO_USD = 1.41;

    const parsePriceString = (priceStr) => {
      if (!priceStr || typeof priceStr !== 'string') return { value: null, currency: null };
      const jodMatch = priceStr.match(/JOD\s*(\d+(?:\.\d+)?)/i);
      const usdMatch = priceStr.match(/USD\s*(\d+(?:\.\d+)?)/i);
      if (jodMatch) return { value: parseFloat(jodMatch[1]), currency: 'JOD' };
      if (usdMatch) return { value: parseFloat(usdMatch[1]), currency: 'USD' };
      const numberMatch = priceStr.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) return { value: parseFloat(numberMatch[1]), currency: 'JOD' };
      return { value: null, currency: null };
    };

    const transformFrom2025 = (data) => {
      const out = [];
      let lastRegion = '';
      (data || []).forEach(item => {
        const itemRegion = item['Region '];
        if (itemRegion && itemRegion.trim()) lastRegion = itemRegion.trim();
        const region = lastRegion || 'Unknown';
        const restaurant = (item['Restaurant Name '] || '').trim();
        if (!restaurant) return;

        const handle = (col, type) => {
          const raw = item[col] ? String(item[col]).trim() : '';
          if (!raw) return;
          const first = raw.split('/')[0].trim();
          const adult = first.split('-')[0].trim();
          const { value, currency } = parsePriceString(adult);
          if (value && currency) {
            const usdPrice = currency === 'JOD' ? Number((value * JOD_TO_USD).toFixed(2)) : Number(value.toFixed(2));
            out.push({
              region, restaurant, itemType: type,
              priceOriginalValue: value,
              priceOriginalCurrency: currency,
              usdPrice,
              sourceColumn: col
            });
          }
        };

        handle('Lunch Price P.P', 'lunch');
        handle('Dinner Price P.P', 'dinner');
      });

      return out.sort((a,b)=> a.region===b.region ? a.restaurant.localeCompare(b.restaurant) : a.region.localeCompare(b.region));
    };

    const load = async () => {
      try {
        const res = await fetch(`/data/restaurants_usd.json?v=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty restaurants_usd.json');
        setRestaurantData(data);
      } catch (err) {
        console.warn('Falling back to Restaurants_2025.json due to:', err?.message || err);
        try {
          const r2 = await fetch(`/data/Restaurants_2025.json?v=${Date.now()}`);
          if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
          const d2 = await r2.json();
          const transformed = transformFrom2025(d2);
          setRestaurantData(transformed);
        } catch (err2) {
          console.error('Error loading restaurant data:', err2);
          setRestaurantData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    // First try to use initialData (for backward compatibility)
    const itineraryData = initialData || (data && data.Itineraries);
    
    console.log("Itineraries component received data:", { initialData, data });
    console.log("Itineraries data to use:", itineraryData);
    
    if (itineraryData && Array.isArray(itineraryData) && itineraryData.length > 0) {
      console.log("Processing Itineraries data:", itineraryData);
      // Process the initial data to ensure dates are properly formatted
      const processedData = itineraryData.map(item => {
        const result = {
          ...item,
          day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }) : item.day || '',
          // Initialize meal properties if they don't exist
          lunchIncluded: item.lunchIncluded || false,
          dinnerIncluded: item.dinnerIncluded || false,
          lunchRestaurant: item.lunchRestaurant || '',
          dinnerRestaurant: item.dinnerRestaurant || '',
          // Initialize price properties
          lunchPriceOriginal: item.lunchPriceOriginal || 0,
          lunchPriceCurrency: item.lunchPriceCurrency || 'JOD',
          lunchPriceUSD: item.lunchPriceUSD || 0,
          dinnerPriceOriginal: item.dinnerPriceOriginal || 0,
          dinnerPriceCurrency: item.dinnerPriceCurrency || 'JOD',
          dinnerPriceUSD: item.dinnerPriceUSD || 0
        };
        console.log("Processed Itineraries item:", result);
        return result;
      });
      setRows(processedData);
    }
  }, [initialData, data]);

  // Map of common locations in itineraries to restaurant regions
  const locationToRegionMap = {
    'Amman': 'Amman',
    'Jerash': 'Jerash',
    'Madaba': 'Madaba',
    'Mount Nebo': 'Mount Nebo',
    'Petra': 'Petra',
    'Wadi Rum': 'Wadi Rum',
    'Dead Sea': 'Dead Sea',
    'Aqaba': 'Aqaba',
    'Ajloun': 'Ajloun',
    'Kerak': 'Kerak',
    'Um Qais': 'Um Qais'
  };

  // Function to extract regions from itinerary description
  const extractRegionsFromItinerary = (itineraryText) => {
    const regions = [];
    
    // Check for each location in the itinerary text
    Object.entries(locationToRegionMap).forEach(([location, region]) => {
      if (itineraryText.includes(location)) {
        regions.push(region);
      }
    });
    
    // If no regions found, return all regions as fallback
    return regions.length > 0 ? regions : Object.values(locationToRegionMap);
  };

  const normalizeItemType = (it) => {
    if (!it) return '';
    const s = String(it).toLowerCase();
    if (s.includes('lunch')) return 'lunch';
    if (s.includes('dinner')) return 'dinner';
    return s;
  };

  // Group restaurants by region and meal type
  const getRestaurantsByRegionAndMeal = (regions, mealType) => {
    if (!restaurantData || restaurantData.length === 0) return [];
    const target = normalizeItemType(mealType);

    return restaurantData.filter(restaurant =>
      regions.includes(restaurant.region) &&
      normalizeItemType(restaurant.itemType) === target
    );
  };

  const readyPrograms = {
    "7-Day Jordan Tour": [
      { date: '', day: '', itinerary: "Arrival – Amman Airport", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Amman – Jerash – Amman", serviceType: "Full Day", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Amman – Madaba – Mount Nebo – Petra", serviceType: "Full Day", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Petra Visit", serviceType: "Full Day", guideName: "", accNights: true, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Petra – Wadi Rum", serviceType: "Transfer", guideName: "", accNights: true, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Wadi Rum – Dead Sea", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Departure – Amman Airport", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
    ],
    "Classic 5-Day Tour": [
      { date: '', day: '', itinerary: "Arrival – Amman", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Amman – Petra", serviceType: "Full Day", guideName: "", accNights: true, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Petra Visit", serviceType: "Half Day", guideName: "", accNights: true, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Petra – Dead Sea", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
      { date: '', day: '', itinerary: "Departure", serviceType: "Transfer", guideName: "", accNights: false, lunchIncluded: false, dinnerIncluded: false },
    ]
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === 'date') {
      const day = new Date(value).toLocaleDateString('en-US', { weekday: 'long' });
      updated[index].day = day;
    }

    // If restaurant is selected, update price information
    if (field === 'lunchRestaurant' && value) {
      const selectedRestaurant = restaurantData.find(r => r.restaurant === value && normalizeItemType(r.itemType) === 'lunch');
      if (selectedRestaurant) {
        updated[index].lunchPriceOriginal = selectedRestaurant.priceOriginalValue;
        updated[index].lunchPriceCurrency = selectedRestaurant.priceOriginalCurrency;
        updated[index].lunchPriceUSD = selectedRestaurant.usdPrice;
      }
    }

    if (field === 'dinnerRestaurant' && value) {
      const selectedRestaurant = restaurantData.find(r => r.restaurant === value && normalizeItemType(r.itemType) === 'dinner');
      if (selectedRestaurant) {
        updated[index].dinnerPriceOriginal = selectedRestaurant.priceOriginalValue;
        updated[index].dinnerPriceCurrency = selectedRestaurant.priceOriginalCurrency;
        updated[index].dinnerPriceUSD = selectedRestaurant.usdPrice;
      }
    }

    // Reset restaurant selection if meal is unchecked
    if (field === 'lunchIncluded' && !value) {
      updated[index].lunchRestaurant = '';
      updated[index].lunchPriceOriginal = 0;
      updated[index].lunchPriceCurrency = 'JOD';
      updated[index].lunchPriceUSD = 0;
    }

    if (field === 'dinnerIncluded' && !value) {
      updated[index].dinnerRestaurant = '';
      updated[index].dinnerPriceOriginal = 0;
      updated[index].dinnerPriceCurrency = 'JOD';
      updated[index].dinnerPriceUSD = 0;
    }

    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { 
      date: '', 
      day: '', 
      itinerary: '', 
      serviceType: '', 
      guideName: '', 
      accNights: false,
      lunchIncluded: false,
      dinnerIncluded: false,
      lunchRestaurant: '',
      dinnerRestaurant: '',
      lunchPriceOriginal: 0,
      lunchPriceCurrency: 'JOD',
      lunchPriceUSD: 0,
      dinnerPriceOriginal: 0,
      dinnerPriceCurrency: 'JOD',
      dinnerPriceUSD: 0
    }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleProgramSelect = (e) => {
    const selected = e.target.value;
    if (selected && readyPrograms[selected]) {
      setRows(readyPrograms[selected].map(row => ({ ...row, date: '', day: '' })));
    }
  };

  const containerStyle = {
    color: 'white',
    padding: '30px',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const formBoxStyle = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  };

  const labelStyle = {
    fontWeight: 500,
    fontSize: '15px',
    marginBottom: '4px'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    width: '100%'
  };

  const checkboxStyle = {
    transform: 'scale(1.3)',
    marginTop: '10px'
  };

  const mealSectionStyle = {
    backgroundColor: '#2a2a2a',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  };

  const priceDisplayStyle = {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ Itineraries: rows });
    }
  };

  if (loading) {
    return <div style={containerStyle}>Loading restaurant data...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px' }}>Itineraries – File: {fileNo}</h2>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Save Changes
        </button>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '25px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="radio"
            name="programType"
            value="ready"
            checked={programType === 'ready'}
            onChange={() => {
              setProgramType('ready');
              setRows([]);
            }}
          />
          Ready Made Programs
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="radio"
            name="programType"
            value="tailor"
            checked={programType === 'tailor'}
            onChange={() => {
              setProgramType('tailor');
              setRows([{ 
                date: '', 
                day: '', 
                itinerary: '', 
                serviceType: '', 
                guideName: '', 
                accNights: false,
                lunchIncluded: false,
                dinnerIncluded: false,
                lunchRestaurant: '',
                dinnerRestaurant: '',
                lunchPriceOriginal: 0,
                lunchPriceCurrency: 'JOD',
                lunchPriceUSD: 0,
                dinnerPriceOriginal: 0,
                dinnerPriceCurrency: 'JOD',
                dinnerPriceUSD: 0
              }]);
            }}
          />
          Tailor Made Program
        </label>

        {programType === 'ready' && (
          <select onChange={handleProgramSelect} style={{ ...inputStyle, width: '250px' }}>
            <option value="">Select Program</option>
            {Object.keys(readyPrograms).map((prog, i) => (
              <option key={i} value={prog}>{prog}</option>
            ))}
          </select>
        )}
      </div>

      {/* Itinerary Rows */}
      {rows.map((row, index) => (
        <div key={index} style={formBoxStyle}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={row.date}
                onChange={(e) => handleChange(index, 'date', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Day</label>
              <input
                type="text"
                value={row.day}
                onChange={(e) => handleChange(index, 'day', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Itinerary</label>
              <input
                type="text"
                value={row.itinerary}
                onChange={(e) => handleChange(index, 'itinerary', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Type of Service</label>
              <select
                value={row.serviceType}
                onChange={(e) => handleChange(index, 'serviceType', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option>Amman - QAIA</option>
                <option>Aqaba - QAIA</option>
                <option>Full Day</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Guide Name</label>
              <select
                value={row.guideName}
                onChange={(e) => handleChange(index, 'guideName', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option>John Doe</option>
                <option>Ali Ahmad</option>
                <option>Layla Khoury</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Acc. Nights</label>
              <input
                type="checkbox"
                checked={row.accNights}
                onChange={(e) => handleChange(index, 'accNights', e.target.checked)}
                style={checkboxStyle}
              />
            </div>
          </div>

          {/* Meal Options */}
          <div style={mealSectionStyle}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Meal Options</h3>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Lunch Section */}
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={row.lunchIncluded}
                    onChange={(e) => handleChange(index, 'lunchIncluded', e.target.checked)}
                    style={checkboxStyle}
                  />
                  <label style={{ fontWeight: 'bold' }}>Lunch Included</label>
                </div>
                
                {row.lunchIncluded && (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Select Restaurant</label>
                      <select
                        value={row.lunchRestaurant}
                        onChange={(e) => handleChange(index, 'lunchRestaurant', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select Restaurant</option>
                        {getRestaurantsByRegionAndMeal(extractRegionsFromItinerary(row.itinerary), 'lunch')
                          .sort((a,b) => a.restaurant.localeCompare(b.restaurant))
                          .map((restaurant, idx) => (
                            <option key={idx} value={restaurant.restaurant}>
                              {restaurant.restaurant} ({restaurant.region})
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    {row.lunchRestaurant && (
                      <div style={priceDisplayStyle}>
                        <span>{row.lunchPriceOriginal} {row.lunchPriceCurrency}</span>
                        <span>{row.lunchPriceUSD} USD</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Dinner Section */}
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={row.dinnerIncluded}
                    onChange={(e) => handleChange(index, 'dinnerIncluded', e.target.checked)}
                    style={checkboxStyle}
                  />
                  <label style={{ fontWeight: 'bold' }}>Dinner Included</label>
                </div>
                
                {row.dinnerIncluded && (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={labelStyle}>Select Restaurant</label>
                      <select
                        value={row.dinnerRestaurant}
                        onChange={(e) => handleChange(index, 'dinnerRestaurant', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select Restaurant</option>
                        {getRestaurantsByRegionAndMeal(extractRegionsFromItinerary(row.itinerary), 'dinner')
                          .sort((a,b) => a.restaurant.localeCompare(b.restaurant))
                          .map((restaurant, idx) => (
                            <option key={idx} value={restaurant.restaurant}>
                              {restaurant.restaurant} ({restaurant.region})
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    {row.dinnerRestaurant && (
                      <div style={priceDisplayStyle}>
                        <span>{row.dinnerPriceOriginal} {row.dinnerPriceCurrency}</span>
                        <span>{row.dinnerPriceUSD} USD</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {programType === 'tailor' && (
            <button
              onClick={() => removeRow(index)}
              style={{
                marginTop: '15px',
                backgroundColor: '#c00',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {programType === 'tailor' && (
        <button
          onClick={addRow}
          style={{
            backgroundColor: '#0a7',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Add Row
        </button>
      )}
    </div>
  );
}

export default Itineraries;
