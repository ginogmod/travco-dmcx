import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFromStorage, deleteFromStorage } from "../../assets/utils/storage";

function GroupSeriesOfferList() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [filters, setFilters] = useState({
    groupName: "",
    agent: "",
    validityFrom: "",
    validityTo: "",
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const allOffers = await getAllFromStorage("offers");
        // Filter only Group Series offers
        const groupSeriesOffers = allOffers.filter(offer => offer.isGroupSeries === true);
        setOffers(groupSeriesOffers || []);
        setFilteredOffers(groupSeriesOffers || []);
      } catch (error) {
        console.error("Error fetching Group Series offers:", error);
        setOffers([]);
        setFilteredOffers([]);
      }
    };
    
    fetchOffers();
  }, []);

  useEffect(() => {
    let result = offers.filter(offer => {
      const groupMatch = !filters.groupName || (offer.groupName && offer.groupName.toLowerCase().includes(filters.groupName.toLowerCase()));
      const agentMatch = !filters.agent || (offer.agent && offer.agent.toLowerCase().includes(filters.agent.toLowerCase()));
      
      // Handle validity date filtering
      let validityMatch = true;
      if (filters.validityFrom || filters.validityTo) {
        validityMatch = false;
        // Check if the offer has validity dates
        if (offer.validityDates && Array.isArray(offer.validityDates) && offer.validityDates.length > 0) {
          // Check each validity period
          for (const validity of offer.validityDates) {
            const fromDate = new Date(validity.from);
            const toDate = new Date(validity.to);
            const filterFromDate = filters.validityFrom ? new Date(filters.validityFrom) : null;
            const filterToDate = filters.validityTo ? new Date(filters.validityTo) : null;
            
            // If only from date is specified, check if any validity period starts after or on that date
            if (filterFromDate && !filterToDate) {
              if (fromDate >= filterFromDate) {
                validityMatch = true;
                break;
              }
            }
            // If only to date is specified, check if any validity period ends before or on that date
            else if (!filterFromDate && filterToDate) {
              if (toDate <= filterToDate) {
                validityMatch = true;
                break;
              }
            }
            // If both dates are specified, check if any validity period overlaps with the filter range
            else if (filterFromDate && filterToDate) {
              if ((fromDate <= filterToDate) && (toDate >= filterFromDate)) {
                validityMatch = true;
                break;
              }
            }
          }
        }
      }
      
      return groupMatch && agentMatch && validityMatch;
    });
    setFilteredOffers(result);
  }, [filters, offers]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Group Series offer?")) {
      try {
        await deleteFromStorage("offers", id);
        // Refresh the offers list after deletion
        const updatedOffers = await getAllFromStorage("offers");
        // Ensure we're still filtering for Group Series offers only
        const groupSeriesOffers = updatedOffers.filter(offer => offer.isGroupSeries === true);
        setOffers(groupSeriesOffers || []);
        
        // Apply filters to the updated list
        let result = (groupSeriesOffers || []).filter(offer => {
          const groupMatch = !filters.groupName || (offer.groupName && offer.groupName.toLowerCase().includes(filters.groupName.toLowerCase()));
          const agentMatch = !filters.agent || (offer.agent && offer.agent.toLowerCase().includes(filters.agent.toLowerCase()));
          
          // Handle validity date filtering
          let validityMatch = true;
          if (filters.validityFrom || filters.validityTo) {
            validityMatch = false;
            // Check if the offer has validity dates
            if (offer.validityDates && Array.isArray(offer.validityDates) && offer.validityDates.length > 0) {
              // Check each validity period
              for (const validity of offer.validityDates) {
                const fromDate = new Date(validity.from);
                const toDate = new Date(validity.to);
                const filterFromDate = filters.validityFrom ? new Date(filters.validityFrom) : null;
                const filterToDate = filters.validityTo ? new Date(filters.validityTo) : null;
                
                // If only from date is specified, check if any validity period starts after or on that date
                if (filterFromDate && !filterToDate) {
                  if (fromDate >= filterFromDate) {
                    validityMatch = true;
                    break;
                  }
                }
                // If only to date is specified, check if any validity period ends before or on that date
                else if (!filterFromDate && filterToDate) {
                  if (toDate <= filterToDate) {
                    validityMatch = true;
                    break;
                  }
                }
                // If both dates are specified, check if any validity period overlaps with the filter range
                else if (filterFromDate && filterToDate) {
                  if ((fromDate <= filterToDate) && (toDate >= filterFromDate)) {
                    validityMatch = true;
                    break;
                  }
                }
              }
            }
          }
          
          return groupMatch && agentMatch && validityMatch;
        });
        setFilteredOffers(result);
      } catch (error) {
        console.error("Error deleting Group Series offer:", error);
        alert("Failed to delete Group Series offer. Please try again.");
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Format validity dates for display
  const formatValidityDates = (validityDates) => {
    if (!validityDates || !Array.isArray(validityDates) || validityDates.length === 0) {
      return "No validity dates";
    }
    
    return (
      <div>
        {validityDates.map((date, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            {date.from} to {date.to}
            {date.season && (
              <span style={{
                backgroundColor: getSeasonColor(date.season),
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                marginLeft: "5px"
              }}>
                {date.season.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get color based on season
  const getSeasonColor = (season) => {
    switch (season?.toLowerCase()) {
      case 'high':
        return "#dc3545"; // Red
      case 'mid':
        return "#fd7e14"; // Orange
      case 'low':
        return "#28a745"; // Green
      default:
        return "#6c757d"; // Gray for standard or unknown
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Group Series Offers</h1>
        <Link to="/offers/group-series-new" style={{
          ...buttonStyle,
          backgroundColor: "#28a745",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "20px" }}>+</span> New Group Series Offer
        </Link>
      </div>
      
      <div style={filterContainerStyle}>
        <input
          type="text"
          name="groupName"
          placeholder="Filter by Group Name"
          value={filters.groupName}
          onChange={handleFilterChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="agent"
          placeholder="Filter by Agent"
          value={filters.agent}
          onChange={handleFilterChange}
          style={inputStyle}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ color: "#aaa" }}>Validity From:</label>
          <input
            type="date"
            name="validityFrom"
            value={filters.validityFrom}
            onChange={handleFilterChange}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ color: "#aaa" }}>Validity To:</label>
          <input
            type="date"
            name="validityTo"
            value={filters.validityTo}
            onChange={handleFilterChange}
            style={inputStyle}
          />
        </div>
      </div>
      
      {filteredOffers.length === 0 ? (
        <div style={{
          backgroundColor: "#1f1f1f",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p>No Group Series offers found. Create a new one to get started.</p>
        </div>
      ) : (
        <div data-kb-nav="1" data-kb-axis="vertical" data-kb-wrap="true">
          {filteredOffers.map(offer => (
            <div key={offer.id} data-kb-item tabIndex={0} style={{
              ...itemStyle,
              border: offer.isSpecial ? "2px solid #FFD700" : offer.isConfirmed ? "2px solid #28a745" : "none",
              boxShadow: offer.isSpecial ? "0 0 10px rgba(255, 215, 0, 0.3)" :
                        offer.isConfirmed ? "0 0 10px rgba(40, 167, 69, 0.3)" : "none"
            }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                <h3 style={{ margin: 0 }}>{offer.groupName}</h3>
                <span style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginLeft: "10px"
                }}>
                  GROUP SERIES
                </span>
                {offer.isSpecial && (
                  <span style={{
                    backgroundColor: "#FFD700",
                    color: "#000",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginLeft: "10px"
                  }}>
                    SPECIAL OFFER
                  </span>
                )}
                {offer.isConfirmed && (
                  <span style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginLeft: offer.isSpecial ? "5px" : "10px"
                  }}>
                    CONFIRMED
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "30px" }}>
                <div>
                  <p style={{ margin: "5px 0", color: "#aaa" }}>Agent: {offer.agent}</p>
                  <p style={{ margin: "5px 0", color: "#aaa" }}>File No: {offer.fileNo}</p>
                  <p style={{ margin: "5px 0", color: "#aaa" }}>Nationality: {offer.nationality}</p>
                  <p style={{ margin: "5px 0", color: "#aaa" }}>Program Length: {offer.programLength} nights</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "5px 0", color: "#aaa", fontWeight: "bold" }}>Validity Dates:</p>
                  {formatValidityDates(offer.validityDates)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to={`/offers/group-series/${offer.id}`} style={buttonStyle} data-kb-activate>
                View Offer
              </Link>
              <button onClick={() => handleDelete(offer.id)} style={deleteButtonStyle}>
                Delete
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}

const filterContainerStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  flexWrap: "wrap"
};

const inputStyle = {
  padding: "10px",
  fontSize: "15px",
  borderRadius: "6px",
  border: "1px solid #444",
  backgroundColor: "#2a2a2a",
  color: "white",
};

const itemStyle = {
  backgroundColor: "#1f1f1f",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 15px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold"
};

const deleteButtonStyle = {
  backgroundColor: "#dc3545",
  color: "white",
  padding: "10px 15px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};

export default GroupSeriesOfferList;