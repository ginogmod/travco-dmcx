import React, { useEffect, useState } from "react";
import "./HotelRatesEntry.css";

function HotelRatesEntry() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    stars: "",
    season: "",
    search: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', success: true });
  const [seasonalityData, setSeasonalityData] = useState({}); // Added missing state variable
  const [hotelSeasonalityData, setHotelSeasonalityData] = useState({});
  const [showSeasonalityModal, setShowSeasonalityModal] = useState(false); // Added missing state variable
  const [showHotelSeasonalityModal, setShowHotelSeasonalityModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentSeasonality, setCurrentSeasonality] = useState({ // Added missing state variable
    city: "",
    stars: "",
    season: "",
    startDate: "",
    endDate: ""
  });
  const [currentHotelSeasonality, setCurrentHotelSeasonality] = useState({
    hotelName: "",
    season: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    // Load hotel rates from localStorage first
    const savedHotelRates = localStorage.getItem('hotelRates');
    if (savedHotelRates) {
      try {
        const parsedData = JSON.parse(savedHotelRates);
        const sorted = [...parsedData].sort((a, b) =>
          a.Hotel.localeCompare(b.Hotel)
        );
        setHotels(sorted);
        setFilteredHotels(sorted);
        console.log('Loaded hotel rates from localStorage');
      } catch (err) {
        console.error('Error parsing localStorage hotel rates:', err);
        // Fallback to server data
        loadHotelRatesFromServer();
      }
    } else {
      // No localStorage data, try server
      loadHotelRatesFromServer();
    }
    
    // Load seasonality data from localStorage first
    const savedSeasonalityData = localStorage.getItem('seasonalityData');
    if (savedSeasonalityData) {
      try {
        const parsedData = JSON.parse(savedSeasonalityData);
        setHotelSeasonalityData(parsedData.hotelSeasons || {});
        console.log('Loaded seasonality data from localStorage');
      } catch (err) {
        console.error('Error parsing localStorage seasonality data:', err);
        // Fallback to server data
        loadSeasonalityFromServer();
      }
    } else {
      // No localStorage data, try server
      loadSeasonalityFromServer();
    }
  }, []);

  const applyFilters = () => {
    let data = [...hotels];

    if (filters.city) data = data.filter(h => h.City === filters.city);
    if (filters.stars) data = data.filter(h => h.Stars === filters.stars);
    if (filters.season) data = data.filter(h => h.Season === filters.season);
    if (filters.search)
      data = data.filter(h =>
        h.Hotel.toLowerCase().includes(filters.search.toLowerCase()) ||
        h.City.toLowerCase().includes(filters.search.toLowerCase())
      );

    setFilteredHotels(data);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, hotels]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Function to load hotel rates from server
  const loadHotelRatesFromServer = () => {
    fetch("/data/hotelRates.json")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) =>
          a.Hotel.localeCompare(b.Hotel)
        );
        setHotels(sorted);
        setFilteredHotels(sorted);
        // Also save to localStorage
        localStorage.setItem('hotelRates', JSON.stringify(sorted));
        console.log('Loaded and saved hotel rates from server');
      })
      .catch((err) => {
        console.error("Failed to load hotel data from server", err);
        setHotels([]);
        setFilteredHotels([]);
      });
  };

  const handleChange = (index, field, value) => {
    const updated = [...filteredHotels];
    updated[index][field] = value;
    setFilteredHotels(updated);

    const globalIndex = hotels.findIndex(h => h.Hotel === updated[index].Hotel && h.Season === updated[index].Season);
    const globalUpdated = [...hotels];
    globalUpdated[globalIndex][field] = value;
    setHotels(globalUpdated);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('hotelRates', JSON.stringify(globalUpdated));
      console.log('Hotel rates saved to localStorage after change');
    } catch (err) {
      console.warn('Failed to save hotel rates to localStorage:', err);
    }
  };

  const handleRateChange = (index, rateType, value) => {
    handleChange(index, `Rate_${rateType}`, value);
  };

  const handleAddRow = () => {
    const newRow = {
      City: "",
      Stars: "",
      Hotel: "",
      Season: "",
      Rate_DBL: "",
      Rate_SGL: "",
      Rate_HB: ""
    };
    const updatedHotels = [newRow, ...hotels];
    setHotels(updatedHotels);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('hotelRates', JSON.stringify(updatedHotels));
      console.log('Hotel rates saved to localStorage after adding row');
    } catch (err) {
      console.warn('Failed to save hotel rates to localStorage:', err);
    }
  };

  const handleDelete = (index) => {
    const toDelete = filteredHotels[index];
    const updatedHotels = hotels.filter(
      h =>
        !(
          h.City === toDelete.City &&
          h.Hotel === toDelete.Hotel &&
          h.Season === toDelete.Season
        )
    );
    setHotels(updatedHotels);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('hotelRates', JSON.stringify(updatedHotels));
      console.log('Hotel rates saved to localStorage after deleting row');
    } catch (err) {
      console.warn('Failed to save hotel rates to localStorage:', err);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus({ show: false, message: '', success: true });
    
    // Save to localStorage as a fallback
    try {
      localStorage.setItem('hotelRates', JSON.stringify(hotels));
      localStorage.setItem('seasonalityData', JSON.stringify({
        hotelSeasons: hotelSeasonalityData
      }));
      console.log('Data saved to localStorage as fallback');
    } catch (err) {
      console.warn('Failed to save data to localStorage:', err);
    }
    
    // Save hotel rates
    const saveHotelRates = () => {
      return fetch("/data/hotelRates.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotels),
      })
      .then(res => {
        if (!res.ok) {
          return fetch("/api/saveHotelRates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hotels),
          });
        }
        return res;
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to save hotel rates");
        }
        return "Hotel rates saved successfully";
      });
    };
    
    // Save seasonality data
    const saveSeasonalityData = () => {
      return fetch("/data/seasonality.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSeasons: hotelSeasonalityData
        }),
      })
      .then(res => {
        if (!res.ok) {
          return fetch("/api/saveSeasonality", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelSeasons: hotelSeasonalityData
            }),
          });
        }
        return res;
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to save seasonality data");
        }
        return "Seasonality data saved successfully";
      });
    };
    
    // Execute both save operations
    Promise.all([saveHotelRates(), saveSeasonalityData()])
      .then(results => {
        setIsSaving(false);
        console.log("Data updated successfully:", results);
        setSaveStatus({
          show: true,
          message: 'Hotel rates and seasonality data updated successfully! Changes will be reflected in quotations.',
          success: true
        });
        
        // Hide the status message after 5 seconds
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, show: false }));
        }, 5000);
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        setIsSaving(false);
        setSaveStatus({
          show: true,
          message: `Error saving data: ${error.message}. Data is saved locally and will be available in this session.`,
          success: false
        });
        
        // Hide the status message after 8 seconds (longer for error)
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, show: false }));
        }, 8000);
      });
  };

  // Removed automatic debounced saving


  const unique = (key) =>
    [...new Set(hotels.map(h => h[key]).filter(Boolean))].sort();
    
  // Function to open city-based seasonality modal
  const openSeasonalityModal = (hotel) => {
    setCurrentSeasonality({
      city: hotel.City,
      stars: hotel.Stars,
      season: hotel.Season,
      startDate: getSeasonalityStartDate(hotel.City, hotel.Stars, hotel.Season) || "",
      endDate: getSeasonalityEndDate(hotel.City, hotel.Stars, hotel.Season) || ""
    });
    setShowSeasonalityModal(true);
  };
  
  // Function to open hotel-specific seasonality modal
  const openHotelSeasonalityModal = (hotel) => {
    // Get the date range for this hotel and season
    const dateRanges = hotelSeasonalityData[hotel.Hotel]?.[hotel.Season] || [];
    
    // Use the first date range if available, otherwise use empty strings
    const startDate = dateRanges.length > 0 ? dateRanges[0].startDate || "" : "";
    const endDate = dateRanges.length > 0 ? dateRanges[0].endDate || "" : "";
    
    setCurrentHotelSeasonality({
      hotelName: hotel.Hotel,
      season: hotel.Season,
      startDate: startDate,
      endDate: endDate
    });
    setShowHotelSeasonalityModal(true);
  };
  
  // Function to load seasonality data from server
  const loadSeasonalityFromServer = () => {
    fetch("/data/seasonality.json")
      .then((res) => res.json())
      .then((data) => {
        setHotelSeasonalityData(data.hotelSeasons || {});
        // Also save to localStorage
        localStorage.setItem('seasonalityData', JSON.stringify({
          hotelSeasons: data.hotelSeasons || {}
        }));
        console.log('Loaded and saved seasonality data from server');
      })
      .catch((err) => {
        console.error("Failed to load seasonality data from server", err);
        // Initialize with empty objects if file doesn't exist
        setHotelSeasonalityData({});
      });
  };

  
  // Function to save hotel-specific seasonality data
  const saveHotelSeasonality = () => {
    const { hotelName, season, startDate, endDate } = currentHotelSeasonality;
    
    // Create the structure if it doesn't exist
    if (!hotelSeasonalityData[hotelName]) {
      hotelSeasonalityData[hotelName] = {};
    }
    
    // Generate a unique rateId based on hotel name and season
    const rateId = `${hotelName.toLowerCase().replace(/\s+/g, '_')}_${season.toLowerCase()}_${Date.now() % 1000}`;
    
    // Set a single date range for this hotel and season
    hotelSeasonalityData[hotelName][season] = [{
      startDate,
      endDate,
      rateId
    }];
    
    // Update state
    const updatedHotelSeasonalityData = {...hotelSeasonalityData};
    setHotelSeasonalityData(updatedHotelSeasonalityData);
    setShowHotelSeasonalityModal(false);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('seasonalityData', JSON.stringify({
        citySeasons: seasonalityData || {},
        hotelSeasons: updatedHotelSeasonalityData
      }));
      console.log('Hotel-specific seasonality data saved to localStorage');
      
      // Show success message
      setSaveStatus({
        show: true,
        message: `Hotel-specific seasonality dates for ${hotelName} ${season} season saved successfully!`,
        success: true
      });
      
      // Hide the status message after 5 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    } catch (err) {
      console.error('Failed to save hotel-specific seasonality data to localStorage:', err);
      setSaveStatus({
        show: true,
        message: `Error saving hotel-specific seasonality data: ${err.message}`,
        success: false
      });
    }
    
    // Try to save to server in the background
    fetch("/data/seasonality.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citySeasons: seasonalityData || {},
        hotelSeasons: updatedHotelSeasonalityData
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      console.log('Hotel-specific seasonality data also saved to server');
    })
    .catch(error => {
      console.warn("Could not save to server, but data is saved in localStorage:", error);
    });
  };
  
  // Function to export all data as a JSON file
  const exportSeasonalityData = () => {
    const data = {
      citySeasons: seasonalityData || {},
      hotelSeasons: hotelSeasonalityData || {},
      hotelRates: hotels
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `hotel_data_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowExportModal(false);
    
    setSaveStatus({
      show: true,
      message: 'Hotel and seasonality data exported successfully!',
      success: true
    });
    
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Function to import data from a JSON file
  const importSeasonalityData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let importedItems = [];
        
        // Import seasonality data if available
        if (data && (data.citySeasons || data.hotelSeasons)) {
          if (data.citySeasons) {
            setSeasonalityData(data.citySeasons);
          }
          if (data.hotelSeasons) {
            setHotelSeasonalityData(data.hotelSeasons);
          }
          localStorage.setItem('seasonalityData', JSON.stringify({
            citySeasons: data.citySeasons || {},
            hotelSeasons: data.hotelSeasons || {}
          }));
          importedItems.push('seasonality data');
        }
        
        // Import hotel rates if available
        if (data && data.hotelRates && Array.isArray(data.hotelRates)) {
          const sorted = [...data.hotelRates].sort((a, b) => a.Hotel.localeCompare(b.Hotel));
          setHotels(sorted);
          setFilteredHotels(sorted);
          localStorage.setItem('hotelRates', JSON.stringify(sorted));
          importedItems.push('hotel rates');
        }
        
        if (importedItems.length > 0) {
          setSaveStatus({
            show: true,
            message: `Imported ${importedItems.join(' and ')} successfully!`,
            success: true
          });
          
          setTimeout(() => {
            setSaveStatus(prev => ({ ...prev, show: false }));
          }, 5000);
        } else {
          throw new Error('No valid data found in the imported file');
        }
      } catch (err) {
        console.error('Error importing data:', err);
        setSaveStatus({
          show: true,
          message: `Error importing data: ${err.message}`,
          success: false
        });
      }
    };
    reader.readAsText(file);
  };
  
  // Helper functions to get city seasonality dates
  const getSeasonalityStartDate = (city, stars, season) => {
    return seasonalityData[city]?.[stars]?.[season]?.[0] || "";
  };
  
  const getSeasonalityEndDate = (city, stars, season) => {
    return seasonalityData[city]?.[stars]?.[season]?.[1] || "";
  };
  
  // Helper functions to get hotel-specific seasonality dates
  const getHotelSeasonalityStartDate = (hotelName, season) => {
    const dateRanges = hotelSeasonalityData[hotelName]?.[season];
    if (dateRanges && dateRanges.length > 0) {
      // Return the start date of the first date range
      return dateRanges[0].startDate || "";
    }
    return "";
  };
  
  const getHotelSeasonalityEndDate = (hotelName, season) => {
    const dateRanges = hotelSeasonalityData[hotelName]?.[season];
    if (dateRanges && dateRanges.length > 0) {
      // Return the end date of the first date range
      return dateRanges[0].endDate || "";
    }
    return "";
  };

  return (
    <div className="hotel-rates-container">
      <h2>
        Hotel Rates Entry (with Seasonality Management)
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
        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {unique("City").map(c => <option key={c}>{c}</option>)}
        </select>

        <select name="stars" value={filters.stars} onChange={handleFilterChange}>
          <option value="">All Stars</option>
          {unique("Stars").map(s => <option key={s}>{s}</option>)}
        </select>

        <select name="season" value={filters.season} onChange={handleFilterChange}>
          <option value="">All Seasons</option>
          {unique("Season").map(s => <option key={s}>{s}</option>)}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by hotel or city..."
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      <div className="button-group">
        <button onClick={handleAddRow}>Add Hotel</button>
        <button
          className="save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                marginRight: '8px',
                borderRadius: '50%',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }}></span>
              Saving...
            </>
          ) : (
            'Save Hotel Rates'
          )}
        </button>
        
        <div style={{ marginLeft: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              backgroundColor: '#004D40',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export/Import Data
          </button>
        </div>
      </div>

      <table className="hotel-rates-table">
        <thead>
          <tr>
            <th>City</th>
            <th>Stars</th>
            <th>Hotel</th>
            <th>Season</th>
            <th>Rate DBL</th>
            <th>Rate SGL</th>
            <th>Rate HB</th>
            <th>Seasonality</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredHotels.map((hotel, index) => (
            <tr key={`${hotel.Hotel}-${hotel.Season}-${index}`}>
              <td><input value={hotel.City} onChange={(e) => handleChange(index, "City", e.target.value)} /></td>
              <td><input value={hotel.Stars} onChange={(e) => handleChange(index, "Stars", e.target.value)} /></td>
              <td><input value={hotel.Hotel} onChange={(e) => handleChange(index, "Hotel", e.target.value)} /></td>
              <td><input value={hotel.Season} onChange={(e) => handleChange(index, "Season", e.target.value)} /></td>
              <td><input value={hotel.Rate_DBL} onChange={(e) => handleRateChange(index, "DBL", e.target.value)} /></td>
              <td><input value={hotel.Rate_SGL} onChange={(e) => handleRateChange(index, "SGL", e.target.value)} /></td>
              <td><input value={hotel.Rate_HB} onChange={(e) => handleRateChange(index, "HB", e.target.value)} /></td>
              <td>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => openSeasonalityModal(hotel)}
                    style={{
                      backgroundColor: getSeasonalityStartDate(hotel.City, hotel.Stars, hotel.Season) ? "#004D40" : "#555",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {getSeasonalityStartDate(hotel.City, hotel.Stars, hotel.Season) ? "Edit City" : "Set City"}
                  </button>
                  <button
                    onClick={() => openHotelSeasonalityModal(hotel)}
                    style={{
                      backgroundColor: getHotelSeasonalityStartDate(hotel.Hotel, hotel.Season) ? "#004D40" : "#555",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {getHotelSeasonalityStartDate(hotel.Hotel, hotel.Season) ? "Edit Date Range" : "Set Date Range"}
                  </button>
                </div>
              </td>
              <td><button onClick={() => handleDelete(index)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Seasonality Modal */}
      {showSeasonalityModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#1f1f1f",
            padding: "20px",
            borderRadius: "8px",
            width: "500px",
            maxWidth: "90%"
          }}>
            <h3 style={{ marginTop: 0 }}>
              Set Seasonality Dates for {currentSeasonality.city} {currentSeasonality.stars}★ {currentSeasonality.season} Season
            </h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Start Date:</label>
              <input
                type="date"
                value={currentSeasonality.startDate}
                onChange={(e) => setCurrentSeasonality({...currentSeasonality, startDate: e.target.value})}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  width: "100%"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>End Date:</label>
              <input
                type="date"
                value={currentSeasonality.endDate}
                onChange={(e) => setCurrentSeasonality({...currentSeasonality, endDate: e.target.value})}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  width: "100%"
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowSeasonalityModal(false)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#555",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Simple placeholder function since we're focusing on hotel-specific seasonality
                  setShowSeasonalityModal(false);
                  setSaveStatus({
                    show: true,
                    message: 'City-based seasonality is deprecated. Please use hotel-specific seasonality instead.',
                    success: true
                  });
                  setTimeout(() => {
                    setSaveStatus(prev => ({ ...prev, show: false }));
                  }, 5000);
                }}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#004D40",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Save Dates
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hotel-specific Seasonality Modal */}
      {showHotelSeasonalityModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#1f1f1f",
            padding: "20px",
            borderRadius: "8px",
            width: "500px",
            maxWidth: "90%"
          }}>
            <h3 style={{ marginTop: 0 }}>
              Set Date Range for {currentHotelSeasonality.hotelName} {currentHotelSeasonality.season} Season
            </h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Start Date:</label>
              <input
                type="date"
                value={currentHotelSeasonality.startDate}
                onChange={(e) => setCurrentHotelSeasonality({...currentHotelSeasonality, startDate: e.target.value})}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  width: "100%"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>End Date:</label>
              <input
                type="date"
                value={currentHotelSeasonality.endDate}
                onChange={(e) => setCurrentHotelSeasonality({...currentHotelSeasonality, endDate: e.target.value})}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  width: "100%"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#4CAF50", fontWeight: "bold" }}>
                When quotation dates fall within this date range, rates for this season will be automatically applied.
              </p>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowHotelSeasonalityModal(false)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#555",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveHotelSeasonality}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#004D40",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Save Date Range
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export/Import Modal */}
      {showExportModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#1f1f1f",
            padding: "20px",
            borderRadius: "8px",
            width: "500px",
            maxWidth: "90%"
          }}>
            <h3 style={{ marginTop: 0 }}>Export/Import Hotel & Seasonality Data</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <p>Export your hotel rates and seasonality data to a JSON file for backup or transfer to another system.</p>
              <button
                onClick={exportSeasonalityData}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#004D40",
                  color: "#fff",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                Export All Data
              </button>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <p>Import hotel rates and seasonality data from a JSON file.</p>
              <input
                type="file"
                accept=".json"
                onChange={importSeasonalityData}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  width: "100%",
                  marginBottom: "10px"
                }}
              />
              <small style={{ color: "#aaa", display: "block" }}>
                Note: The file should contain hotel rates and/or seasonality data in the correct format.
              </small>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#555",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelRatesEntry;
