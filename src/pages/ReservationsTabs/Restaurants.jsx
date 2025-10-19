import { useState, useEffect } from 'react';

function Restaurants({ fileNo, initialData, data, onSave }) {
  const [rows, setRows] = useState([
    {
      restName: '', region: '', meal: '', typeOfMeal: '', notes: '', specialRates: '',
      priceOriginalValue: 0, priceOriginalCurrency: 'JOD', usdPrice: 0,
      itinerary: '', date: '', day: '', time: '', status: '', bookedBy: '',
      pax: '', pickup: '', dropoff: '', confNo: '', invRec: false
    }
  ]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load restaurant data with structured source first (Restaurants_2025.json), fallback to legacy (restaurants_usd.json)
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
          const first = raw.split('/')[0].trim();      // handle "A / B"
          const adult = first.split('-')[0].trim();    // handle "Price - CHD ..."
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
        // Prefer structured 2025 dataset
        const r1 = await fetch(`/data/Restaurants_2025.json?v=${Date.now()}`);
        if (!r1.ok) throw new Error(`HTTP ${r1.status}`);
        const d1 = await r1.json();
        if (Array.isArray(d1) && d1.length && d1[0]['Region '] !== undefined) {
          const transformed = transformFrom2025(d1);
          setRestaurantData(transformed);
          return;
        }
        // If not expected format, fall through to legacy
        throw new Error('Unexpected Restaurants_2025.json format');
      } catch (err) {
        console.warn('Restaurants tab: falling back to restaurants_usd.json due to:', err?.message || err);
        try {
          const r2 = await fetch(`/data/restaurants_usd.json?v=${Date.now()}`);
          if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
          const d2 = await r2.json();
          setRestaurantData(Array.isArray(d2) ? d2 : []);
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

  // Load initial data if available
  useEffect(() => {
    const restaurantData = initialData || (data && data.Restaurants);
    
    if (restaurantData && Array.isArray(restaurantData) && restaurantData.length > 0) {
      // Process the initial data to ensure dates are properly formatted
      const processedData = restaurantData.map(item => {
        return {
          ...item,
          day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }) : item.day || ''
        };
      });
      setRows(processedData);
    }
  }, [initialData, data]);

  // Group restaurants by region for easier selection
  const restaurantsByRegion = restaurantData.reduce((acc, restaurant) => {
    if (!acc[restaurant.region]) {
      acc[restaurant.region] = [];
    }
    
    // Only add unique restaurant names
    if (!acc[restaurant.region].some(r => r.restaurant === restaurant.restaurant)) {
      acc[restaurant.region].push(restaurant);
    }
    
    return acc;
  }, {});

  // Helper to normalize item types across sources (e.g., "Lunch Price P.P" vs "lunch")
  const normalizeItemType = (it) => {
    if (!it) return 'experience';
    const s = String(it).toLowerCase();
    if (s.includes('lunch')) return 'lunch';
    if (s.includes('dinner')) return 'dinner';
    if (s === 'lunch' || s === 'dinner') return s;
    return 'experience';
  };

  // Helper to find the appropriate entry for a restaurant given a desired meal
  const findEntry = (restaurantName, targetMeal) => {
    const normalizedTarget = normalizeItemType(targetMeal);
    const candidates = restaurantData.filter(r => r.restaurant === restaurantName);
    if (candidates.length === 0) return null;
    const exact = candidates.find(r => normalizeItemType(r.itemType) === normalizedTarget);
    return exact || candidates[0] || null;
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === 'date') {
      const day = new Date(value).toLocaleDateString('en-US', { weekday: 'long' });
      updated[index].day = day;
    }

    // If region is selected, reset restaurant and price info
    if (field === 'region') {
      updated[index].restName = '';
      updated[index].priceOriginalValue = 0;
      updated[index].priceOriginalCurrency = 'JOD';
      updated[index].usdPrice = 0;
    }

    // When restaurant changes, set region and price based on selected meal (if any)
    if (field === 'restName' && value) {
      const entry = findEntry(value, updated[index].meal);
      if (entry) {
        updated[index].region = entry.region || updated[index].region;
        updated[index].priceOriginalValue = entry.priceOriginalValue ?? 0;
        updated[index].priceOriginalCurrency = entry.priceOriginalCurrency || 'JOD';
        updated[index].usdPrice = entry.usdPrice ?? 0;

        const nType = normalizeItemType(entry.itemType);
        const desired = nType === 'lunch' ? 'Lunch' : nType === 'dinner' ? 'Dinner' : 'Experience';
        if (!updated[index].meal || (updated[index].meal && updated[index].meal !== desired)) {
          updated[index].meal = desired;
        }
      }
    }

    // When meal changes, update price for the selected restaurant accordingly
    if (field === 'meal') {
      const restName = updated[index].restName;
      if (restName) {
        const entry = findEntry(restName, value);
        if (entry) {
          updated[index].region = entry.region || updated[index].region;
          updated[index].priceOriginalValue = entry.priceOriginalValue ?? 0;
          updated[index].priceOriginalCurrency = entry.priceOriginalCurrency || 'JOD';
          updated[index].usdPrice = entry.usdPrice ?? 0;
        }
      }
    }

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        restName: '', region: '', meal: '', typeOfMeal: '', notes: '', specialRates: '',
        priceOriginalValue: 0, priceOriginalCurrency: 'JOD', usdPrice: 0,
        itinerary: '', date: '', day: '', time: '', status: '', bookedBy: '',
        pax: '', pickup: '', dropoff: '', confNo: '', invRec: false
      }
    ]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ Restaurants: rows });
    }
  };

  const wrapperStyle = {
    color: 'white',
    padding: '30px',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const boxStyle = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 500,
    fontSize: '15px'
  };

  const inputStyle = {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    width: '100%'
  };

  const sectionGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  };

  const checkboxStyle = {
    transform: 'scale(1.2)',
    marginTop: '10px'
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

  if (loading) {
    return <div style={wrapperStyle}>Loading restaurant data...</div>;
  }

  return (
    <div style={wrapperStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>Restaurants – File: {fileNo}</h2>
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

      {rows.map((row, index) => (
        <div key={index} style={boxStyle}>
          <div style={sectionGrid}>
            <label style={labelStyle}>
              Region
              <select style={inputStyle} value={row.region} onChange={(e) => handleChange(index, 'region', e.target.value)}>
                <option value="">Select Region</option>
                {Object.keys(restaurantsByRegion).sort().map((region, idx) => (
                  <option key={idx} value={region}>{region}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Restaurant Name
              <select style={inputStyle} value={row.restName} onChange={(e) => handleChange(index, 'restName', e.target.value)}>
                <option value="">Select Restaurant</option>
                {row.region && restaurantsByRegion[row.region] ? 
                  [...new Set(restaurantsByRegion[row.region].map(r => r.restaurant))].sort().map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  )) : 
                  <option value="" disabled>Select a region first</option>
                }
              </select>
            </label>

            <label style={labelStyle}>
              Meal
              <select style={inputStyle} value={row.meal} onChange={(e) => handleChange(index, 'meal', e.target.value)}>
                <option value="">Select</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Experience</option>
              </select>
            </label>

            <label style={labelStyle}>
              Type of Meal
              <select style={inputStyle} value={row.typeOfMeal} onChange={(e) => handleChange(index, 'typeOfMeal', e.target.value)}>
                <option value="">Select</option>
                <option>Buffet</option>
                <option>Set Menu</option>
                <option>À la carte</option>
              </select>
            </label>

            <label style={labelStyle}>
              Price
              <div style={priceDisplayStyle}>
                <span>{row.priceOriginalValue} {row.priceOriginalCurrency}</span>
                <span>{row.usdPrice} USD</span>
              </div>
            </label>

            <label style={labelStyle}>
              Notes
              <select style={inputStyle} value={row.notes} onChange={(e) => handleChange(index, 'notes', e.target.value)}>
                <option value="">Select</option>
                <option>Vegetarian options</option>
                <option>Gluten-free</option>
                <option>Vegan options</option>
                <option>Halal</option>
              </select>
            </label>

            <label style={labelStyle}>
              Special Rates
              <input style={inputStyle} type="text" value={row.specialRates} onChange={(e) => handleChange(index, 'specialRates', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Itinerary
              <select style={inputStyle} value={row.itinerary} onChange={(e) => handleChange(index, 'itinerary', e.target.value)}>
                <option value="">Select</option>
                <option>Day 1 - Amman</option>
                <option>Day 2 - Petra</option>
              </select>
            </label>
          </div>

          <div style={sectionGrid}>
            <label style={labelStyle}>
              Date
              <input type="date" style={inputStyle} value={row.date} onChange={(e) => handleChange(index, 'date', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Day
              <input type="text" style={{ ...inputStyle, backgroundColor: '#333', border: 'none' }} value={row.day} readOnly />
            </label>

            <label style={labelStyle}>
              Time
              <input type="time" style={inputStyle} value={row.time} onChange={(e) => handleChange(index, 'time', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Status
              <select style={inputStyle} value={row.status} onChange={(e) => handleChange(index, 'status', e.target.value)}>
                <option value="">Select</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </label>

            <label style={labelStyle}>
              Booked By
              <select style={inputStyle} value={row.bookedBy} onChange={(e) => handleChange(index, 'bookedBy', e.target.value)}>
                <option value="">Select</option>
                <option>Agent 1</option>
                <option>Agent 2</option>
              </select>
            </label>
          </div>

          <div style={sectionGrid}>
            <label style={labelStyle}>
              Pax
              <input type="number" style={inputStyle} value={row.pax} onChange={(e) => handleChange(index, 'pax', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Pickup
              <select style={inputStyle} value={row.pickup} onChange={(e) => handleChange(index, 'pickup', e.target.value)}>
                <option value="">Select</option>
                <option>Hotel</option>
                <option>Camp</option>
              </select>
            </label>

            <label style={labelStyle}>
              Dropoff
              <select style={inputStyle} value={row.dropoff} onChange={(e) => handleChange(index, 'dropoff', e.target.value)}>
                <option value="">Select</option>
                <option>Hotel</option>
                <option>Camp</option>
              </select>
            </label>

            <label style={labelStyle}>
              Conf. No.
              <input type="text" style={inputStyle} value={row.confNo} onChange={(e) => handleChange(index, 'confNo', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Invoice Received
              <input type="checkbox" style={checkboxStyle} checked={row.invRec} onChange={(e) => handleChange(index, 'invRec', e.target.checked)} />
            </label>
          </div>

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
            Remove Restaurant
          </button>
        </div>
      ))}

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
        Add Another Restaurant
      </button>
    </div>
  );
}

export default Restaurants;
