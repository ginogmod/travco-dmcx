import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SpecialHotelRates.css";

function AgentHotelRates() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [hotelRates, setHotelRates] = useState([]);
  const [specialRates, setSpecialRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [showOnlySpecial, setShowOnlySpecial] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [editValues, setEditValues] = useState({
    Rate_DBL: "",
    Rate_SGL: "",
    Rate_HB: ""
  });
  const [filters, setFilters] = useState({
    city: "",
    stars: "",
    season: "",
    search: ""
  });

  // Fetch agent data
  useEffect(() => {
    fetch("/data/TravelAgents.json")
      .then((res) => res.json())
      .then((data) => {
        const foundAgent = data.find(a => a.Acc_No === agentId);
        if (foundAgent) {
          setAgent(foundAgent);
        } else {
          // If agent not found, create a fallback agent with the ID
          setAgent({
            Acc_No: agentId,
            Account_Name: `Agent ${agentId}`,
            Contact: "Not available",
            Email: "Not available",
            Tel: "Not available"
          });
          console.warn(`Agent with ID ${agentId} not found, using fallback data`);
        }
      })
      .catch((err) => {
        console.error("Failed to load agent data:", err);
        // Create a fallback agent in case of error
        setAgent({
          Acc_No: agentId,
          Account_Name: `Agent ${agentId}`,
          Contact: "Not available",
          Email: "Not available",
          Tel: "Not available"
        });
      });
  }, [agentId]);

  // Fetch hotel rates
  useEffect(() => {
    fetch("/data/hotelRates.json")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.Hotel.localeCompare(b.Hotel));
        setHotelRates(sorted);
        
        // Load any saved special rates for this agent from localStorage
        const savedSpecialRates = localStorage.getItem(`specialRates_${agentId}`);
        if (savedSpecialRates) {
          setSpecialRates(JSON.parse(savedSpecialRates));
        } else {
          setSpecialRates([]);
        }
      })
      .catch((err) => console.error("Failed to load hotel rates:", err));
  }, [agentId]);

  // Apply filters and combine regular and special rates
  useEffect(() => {
    // Create a map of special rates by hotel and season for quick lookup
    const specialRatesMap = new Map();
    specialRates.forEach(rate => {
      const key = `${rate.Hotel}-${rate.Season}`;
      specialRatesMap.set(key, rate);
    });
    
    // Start with all hotel rates
    let allRates = hotelRates.map(rate => {
      const key = `${rate.Hotel}-${rate.Season}`;
      const specialRate = specialRatesMap.get(key);
      
      if (specialRate) {
        return { ...specialRate };
      } else {
        return { ...rate, isSpecial: false };
      }
    });
    
    // Apply filters
    if (filters.city) {
      allRates = allRates.filter(r => r.City === filters.city);
    }
    
    if (filters.stars) {
      allRates = allRates.filter(r => r.Stars === parseInt(filters.stars));
    }
    
    if (filters.season) {
      allRates = allRates.filter(r => r.Season === filters.season);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      allRates = allRates.filter(r =>
        r.Hotel.toLowerCase().includes(searchTerm) ||
        r.City.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply special rates filter if needed
    if (showOnlySpecial) {
      allRates = allRates.filter(r => r.isSpecial);
    }
    
    setFilteredRates(allRates);
  }, [hotelRates, specialRates, filters, showOnlySpecial]);

  // Function to start editing a rate
  const startEditing = (rate) => {
    // Create a unique identifier for the rate
    const rateId = `${rate.Hotel}-${rate.Season}`;
    setEditingRate(rateId);
    
    // Set initial edit values to current rate values
    setEditValues({
      Rate_DBL: rate.Rate_DBL,
      Rate_SGL: rate.Rate_SGL,
      Rate_HB: rate.Rate_HB
    });
  };
  
  // Function to save edited rate
  const saveEditedRate = (rate) => {
    // Create a copy of the rate with isSpecial flag and edited values
    const specialRate = {
      ...rate,
      isSpecial: true,
      Rate_DBL: parseFloat(editValues.Rate_DBL) || rate.Rate_DBL,
      Rate_SGL: parseFloat(editValues.Rate_SGL) || rate.Rate_SGL,
      Rate_HB: parseFloat(editValues.Rate_HB) || rate.Rate_HB
    };
    
    // Add to special rates
    const updatedSpecialRates = [...specialRates.filter(sr =>
      !(sr.Hotel === rate.Hotel && sr.Season === rate.Season)
    ), specialRate];
    
    setSpecialRates(updatedSpecialRates);
    
    // Save to localStorage
    localStorage.setItem(`specialRates_${agentId}`, JSON.stringify(updatedSpecialRates));
    
    // Clear editing state
    setEditingRate(null);
  };
  
  // Function to handle input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: value
    });
  };
  
  // Function to add a special rate
  const addSpecialRate = (rate) => {
    startEditing(rate);
  };

  // Function to remove a special rate
  const removeSpecialRate = (rate) => {
    const updatedSpecialRates = specialRates.filter(sr =>
      !(sr.Hotel === rate.Hotel && sr.Season === rate.Season)
    );
    
    setSpecialRates(updatedSpecialRates);
    
    // Save to localStorage
    localStorage.setItem(`specialRates_${agentId}`, JSON.stringify(updatedSpecialRates));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const unique = (key) => {
    return [...new Set(hotelRates.map(h => h[key]).filter(Boolean))].sort();
  };

  if (!agent) {
    return <div className="loading">Loading agent data...</div>;
  }

  return (
    <div className="hotel-rates-container">
      <h2>Hotel Rates for {agent.Account_Name}</h2>
      <p>Account No: {agent.Acc_No}</p>
      <p>Contact: {agent.Contact || "N/A"}</p>
      <p>Email: {agent.Email || "N/A"}</p>
      <p>Phone: {agent.Tel || agent.Mobile || "N/A"}</p>

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

        <div className="special-rates-filter">
          <label>
            <input
              type="checkbox"
              checked={showOnlySpecial}
              onChange={() => setShowOnlySpecial(!showOnlySpecial)}
            />
            Show only special rates
          </label>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRates.map((rate, index) => {
            const isSpecial = rate.isSpecial;
            const key = `${rate.Hotel}-${rate.Season}`;
            
            return (
              <tr
                key={`${key}-${index}`}
                className={isSpecial ? "special-rate" : ""}
              >
                <td>{rate.City}</td>
                <td>{rate.Stars}</td>
                <td>{rate.Hotel}</td>
                <td>{rate.Season}</td>
                <td>
                  {editingRate === `${rate.Hotel}-${rate.Season}` ? (
                    <input
                      type="number"
                      name="Rate_DBL"
                      value={editValues.Rate_DBL}
                      onChange={handleEditChange}
                      style={{ width: "60px" }}
                    />
                  ) : (
                    rate.Rate_DBL
                  )}
                </td>
                <td>
                  {editingRate === `${rate.Hotel}-${rate.Season}` ? (
                    <input
                      type="number"
                      name="Rate_SGL"
                      value={editValues.Rate_SGL}
                      onChange={handleEditChange}
                      style={{ width: "60px" }}
                    />
                  ) : (
                    rate.Rate_SGL
                  )}
                </td>
                <td>
                  {editingRate === `${rate.Hotel}-${rate.Season}` ? (
                    <input
                      type="number"
                      name="Rate_HB"
                      value={editValues.Rate_HB}
                      onChange={handleEditChange}
                      style={{ width: "60px" }}
                    />
                  ) : (
                    rate.Rate_HB
                  )}
                </td>
                <td>
                  {editingRate === `${rate.Hotel}-${rate.Season}` ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => saveEditedRate(rate)}
                        style={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRate(null)}
                        style={{
                          backgroundColor: "#ccc",
                          color: "black",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : isSpecial ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => startEditing(rate)}
                        style={{
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeSpecialRate(rate)}
                        style={{
                          backgroundColor: "#ff4444",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addSpecialRate(rate)}
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Add Special
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AgentHotelRates;