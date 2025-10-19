import React, { useEffect, useState } from "react";
import "./Data.css";

function RestaurantRatesEntry() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    region: "",
    mealType: "",
    search: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', success: true });

  // JOD to USD conversion rate
  const JOD_TO_USD = 1.41;

  // Helper function to parse price strings like "JOD 09.00" or "USD 22.00"
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

  useEffect(() => {
    // Load restaurant rates from Restaurants_2025.json (cache-busted)
    fetch(`/data/Restaurants_2025.json?v=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        // Transform the data to the format we need
        const transformedData = [];
        let lastRegion = "";
        
        // Process each restaurant in the data
        data.forEach((item) => {
          // If region is null, use the last non-null region
          const itemRegion = item["Region "];
          if (itemRegion && itemRegion.trim()) {
            lastRegion = itemRegion.trim();
          }
          
          const region = lastRegion || "Unknown";
          const restaurant = (item["Restaurant Name "] || "").trim();
          
          // Skip items with no restaurant name
          if (!restaurant) {
            return;
          }
          
          // Add lunch entry if available
          if (item["Lunch Price P.P"]) {
            // Extract the first price if there are multiple
            const lunchPrice = item["Lunch Price P.P"].toString().trim();
            const firstPrice = lunchPrice.split('/')[0].trim();
            // Remove child price if present
            const adultPrice = firstPrice.split('-')[0].trim();
            
            const { value, currency } = parsePriceString(adultPrice);
            
            if (value && currency) {
              const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
              
              transformedData.push({
                region: region,
                restaurant,
                itemType: "lunch",
                priceOriginalValue: value,
                priceOriginalCurrency: currency,
                usdPrice,
                sourceColumn: "Lunch Price P.P"
              });
            }
          }
          
          // Add dinner entry if available
          if (item["Dinner Price P.P"]) {
            // Extract the first price if there are multiple
            const dinnerPrice = item["Dinner Price P.P"].toString().trim();
            const firstPrice = dinnerPrice.split('/')[0].trim();
            // Remove child price if present
            const adultPrice = firstPrice.split('-')[0].trim();
            
            const { value, currency } = parsePriceString(adultPrice);
            
            if (value && currency) {
              const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
              
              transformedData.push({
                region: region,
                restaurant,
                itemType: "dinner",
                priceOriginalValue: value,
                priceOriginalCurrency: currency,
                usdPrice,
                sourceColumn: "Dinner Price P.P"
              });
            }
          }
        });
        
        const sorted = [...transformedData].sort((a, b) => {
          // Sort by region first, then by restaurant name
          if (a.region !== b.region) {
            return a.region.localeCompare(b.region);
          }
          return a.restaurant.localeCompare(b.restaurant);
        });
        
        setRestaurants(sorted);
        setFilteredRestaurants(sorted);
      })
      .catch((err) => {
        console.error("Failed to load restaurant data", err);
        setRestaurants([]);
        setFilteredRestaurants([]);
      });
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, restaurants]);

  const applyFilters = () => {
    let data = [...restaurants];

    if (filters.region) {
      data = data.filter(r => r.region === filters.region);
    }
    if (filters.mealType) {
      data = data.filter(r => r.itemType === filters.mealType);
    }
    if (filters.search) {
      data = data.filter(r =>
        r.restaurant.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.region.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredRestaurants(data);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ show: false, message: '', success: true });

    try {
      // Transform editor rows back to the Restaurants_2025.json format
      const restaurantMap = new Map();

      restaurants.forEach(item => {
        const key = `${item.region}-${item.restaurant}`;
        if (!restaurantMap.has(key)) {
          restaurantMap.set(key, {
            "Region ": item.region,
            "Restaurant Name ": item.restaurant,
            "Lunch Price P.P": null,
            "Dinner Price P.P": null
          });
        }

        const entry = restaurantMap.get(key);
        if (item.itemType === "lunch") {
          const currency = item.priceOriginalCurrency;
          const value = Number(item.priceOriginalValue || 0).toFixed(2);
          entry["Lunch Price P.P"] = `${currency} ${value}`;
        } else if (item.itemType === "dinner") {
          const currency = item.priceOriginalCurrency;
          const value = Number(item.priceOriginalValue || 0).toFixed(2);
          entry["Dinner Price P.P"] = `${currency} ${value}`;
        }
      });

      const transformedData = Array.from(restaurantMap.values());

      // Helper to call save-file endpoint (try backend first to avoid front-end dev server proxy issues)
      const saveFile = async (prefer, filename, content) => {
        const targets = [
          "http://localhost:3001",                // explicit backend (dev default)
          "http://127.0.0.1:3001",               // loopback alternative
          window?.location?.origin || ""         // current origin (works when backend serves the app)
        ];

        // If a preferred base was passed, try it first
        if (prefer && !targets.includes(prefer)) targets.unshift(prefer);

        for (const base of targets) {
          const url = base ? `${base}/api/save-file` : `/api/save-file`;
          try {
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename, content })
            });
            if (res && res.ok) return res;
          } catch (err) {
            // Suppress, will try next target
          }
        }
        return null;
      };

      // Helper to save both Restaurants datasets atomically in one API call (preferred)
      const saveRestaurantsAtomic = async (structured, normalized, prefer) => {
        const targets = [
          "http://localhost:3001",
          "http://127.0.0.1:3001",
          window?.location?.origin || ""
        ];
        if (prefer && !targets.includes(prefer)) targets.unshift(prefer);

        for (const base of targets) {
          const url = base ? `${base}/api/saveRestaurants` : `/api/saveRestaurants`;
          try {
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ structured, normalized })
            });
            if (res && res.ok) return res;
          } catch (err) {
            // try next target
          }
        }
        return null;
      };

      // Prefer atomic save (both datasets in one call), fallback to individual writes
      let r1, r2;
      const rAtomic = await saveRestaurantsAtomic(transformedData, restaurants, "http://localhost:3001");

      if (rAtomic && rAtomic.ok) {
        r1 = rAtomic;
        r2 = rAtomic;
      } else {
        // Fallback to individual writes (backend-first to avoid no-response on front-end dev origin)
        r1 = await saveFile("http://localhost:3001", "Restaurants_2025.json", transformedData);
        r2 = await saveFile("http://localhost:3001", "restaurants_usd.json", restaurants);
      }

      if (!r1 || !r1.ok || !r2 || !r2.ok) {
        const s1 = r1 ? r1.status : "no-response";
        const s2 = r2 ? r2.status : "no-response";
        throw new Error(`Failed to save restaurant files (${s1}, ${s2})`);
      }

      // Emit cross-tab update signals for quotation pages to refresh
      try { localStorage.setItem('restaurantRatesVersion', String(Date.now())); } catch (_) {}
      try { const bc = new BroadcastChannel('restaurantRates'); bc.postMessage('updated'); bc.close(); } catch (_) {}

      // Reload fresh data from disk (cache-busted), transform to editor rows and update UI immediately
      try {
        const fresh = await fetch(`/data/Restaurants_2025.json?v=${Date.now()}`).then(r => r.json());

        // Reuse the same transformation logic used on initial load
        const transformedRows = [];
        let lastRegion = "";

        fresh.forEach((item) => {
          const itemRegion = item["Region "];
          if (itemRegion && itemRegion.trim()) {
            lastRegion = itemRegion.trim();
          }
          const region = lastRegion || "Unknown";
          const restaurant = (item["Restaurant Name "] || "").trim();
          if (!restaurant) return;

          const lunchPP = item["Lunch Price P.P"] ? item["Lunch Price P.P"].toString().trim() : "";
          if (lunchPP) {
            const first = lunchPP.split("/")[0].trim();
            const adult = first.split("-")[0].trim();
            const { value, currency } = parsePriceString(adult) || {};
            if (value && currency) {
              const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
              transformedRows.push({
                region,
                restaurant,
                itemType: "lunch",
                priceOriginalValue: value,
                priceOriginalCurrency: currency,
                usdPrice,
                sourceColumn: "Lunch Price P.P"
              });
            }
          }

          const dinnerPP = item["Dinner Price P.P"] ? item["Dinner Price P.P"].toString().trim() : "";
          if (dinnerPP) {
            const first = dinnerPP.split("/")[0].trim();
            const adult = first.split("-")[0].trim();
            const { value, currency } = parsePriceString(adult) || {};
            if (value && currency) {
              const usdPrice = currency === "JOD" ? value * JOD_TO_USD : value;
              transformedRows.push({
                region,
                restaurant,
                itemType: "dinner",
                priceOriginalValue: value,
                priceOriginalCurrency: currency,
                usdPrice,
                sourceColumn: "Dinner Price P.P"
              });
            }
          }
        });

        const sorted = [...transformedRows].sort((a, b) => {
          if (a.region !== b.region) return a.region.localeCompare(b.region);
          return a.restaurant.localeCompare(b.restaurant);
        });

        setRestaurants(sorted);
        setFilteredRestaurants(sorted);
      } catch (_) {}

      setSaveStatus({
        show: true,
        message: 'Restaurant rates updated successfully! Changes will be reflected in quotations.',
        success: true
      });
      setTimeout(() => setSaveStatus(prev => ({ ...prev, show: false })), 5000);
    } catch (error) {
      setSaveStatus({
        show: true,
        message: `Error saving restaurant rates: ${error.message}`,
        success: false
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...filteredRestaurants];
    updated[index][field] = value;
    setFilteredRestaurants(updated);

    // Find the corresponding restaurant in the main array
    const mainIndex = restaurants.findIndex(r => 
      r.restaurant === updated[index].restaurant && 
      r.region === updated[index].region && 
      r.itemType === updated[index].itemType
    );

    if (mainIndex !== -1) {
      const mainUpdated = [...restaurants];
      mainUpdated[mainIndex][field] = value;
      
      // If updating price in original currency, recalculate USD price
      if (field === 'priceOriginalValue') {
        const numValue = parseFloat(value) || 0;
        const currency = mainUpdated[mainIndex].priceOriginalCurrency;
        
        // Convert to USD based on currency
        if (currency === 'JOD') {
          mainUpdated[mainIndex].usdPrice = (numValue * 1.41).toFixed(2);
        } else if (currency === 'USD') {
          mainUpdated[mainIndex].usdPrice = numValue.toFixed(2);
        }
      }
      
      // If updating currency, recalculate USD price
      if (field === 'priceOriginalCurrency') {
        const originalValue = parseFloat(mainUpdated[mainIndex].priceOriginalValue) || 0;
        
        if (value === 'JOD') {
          mainUpdated[mainIndex].usdPrice = (originalValue * 1.41).toFixed(2);
        } else if (value === 'USD') {
          mainUpdated[mainIndex].usdPrice = originalValue.toFixed(2);
        }
      }
      
      setRestaurants(mainUpdated);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      region: "",
      restaurant: "",
      itemType: "lunch", // Use "lunch" instead of "Lunch Price P.P"
      priceOriginalValue: 0,
      priceOriginalCurrency: "JOD",
      usdPrice: 0,
      sourceColumn: "Lunch Price P.P"
    };
    
    const updatedRestaurants = [newRow, ...restaurants];
    setRestaurants(updatedRestaurants);
    
    // Reset filters to show the new row
    setFilters({
      region: "",
      mealType: "",
      search: ""
    });
  };

  const handleDelete = (index) => {
    const toDelete = filteredRestaurants[index];
    const updatedRestaurants = restaurants.filter(
      r =>
        !(
          r.restaurant === toDelete.restaurant &&
          r.region === toDelete.region &&
          r.itemType === toDelete.itemType
        )
    );
    setRestaurants(updatedRestaurants);
  };

  // Get unique regions and meal types for filters
  const uniqueRegions = [...new Set(restaurants.map(r => r.region))].sort();
  const uniqueMealTypes = [...new Set(restaurants.map(r => r.itemType))].sort();

  return (
    <div className="data-container">
      <h2>
        Restaurant Rates Entry
        {isSaving && (
          <span style={{
            fontSize: 14,
            marginLeft: 15,
            backgroundColor: "#004D40",
            padding: "4px 8px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #fff',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}></span>
            Saving changes...
          </span>
        )}
      </h2>
      
      {saveStatus.show && (
        <div style={{
          padding: "10px 15px",
          marginBottom: "20px",
          borderRadius: "4px",
          backgroundColor: saveStatus.success ? "#004D40" : "#B71C1C",
          color: "white"
        }}>
          {saveStatus.message}
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="filters">
        <select 
          name="region" 
          value={filters.region} 
          onChange={handleFilterChange}
          className="search-bar"
        >
          <option value="">All Regions</option>
          {uniqueRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select 
          name="mealType" 
          value={filters.mealType} 
          onChange={handleFilterChange}
          className="search-bar"
        >
          <option value="">All Meal Types</option>
          {uniqueMealTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by restaurant or region..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-bar"
        />
      </div>

      <div className="actions">
        <button onClick={handleAddRow}>Add Restaurant</button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? "#555" : "#007bff"
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Restaurant</th>
            <th>Meal Type</th>
            <th>Original Price</th>
            <th>Currency</th>
            <th>USD Price</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredRestaurants.map((restaurant, index) => (
            <tr key={`${restaurant.restaurant}-${restaurant.region}-${restaurant.itemType}-${index}`}>
              <td>
                <input
                  value={restaurant.region}
                  onChange={(e) => handleChange(index, "region", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={restaurant.restaurant}
                  onChange={(e) => handleChange(index, "restaurant", e.target.value)}
                />
              </td>
              <td>
                <select
                  value={restaurant.itemType}
                  onChange={(e) => handleChange(index, "itemType", e.target.value)}
                >
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={restaurant.priceOriginalValue}
                  onChange={(e) => handleChange(index, "priceOriginalValue", e.target.value)}
                />
              </td>
              <td>
                <select
                  value={restaurant.priceOriginalCurrency}
                  onChange={(e) => handleChange(index, "priceOriginalCurrency", e.target.value)}
                >
                  <option value="JOD">JOD</option>
                  <option value="USD">USD</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={restaurant.usdPrice}
                  onChange={(e) => handleChange(index, "usdPrice", e.target.value)}
                  style={{ backgroundColor: "#333" }}
                  readOnly
                />
              </td>
              <td>
                <button onClick={() => handleDelete(index)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RestaurantRatesEntry;