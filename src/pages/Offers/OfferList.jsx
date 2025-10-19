import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFromStorage, deleteFromStorage } from "../../assets/utils/storage";

function OfferList() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [filters, setFilters] = useState({
    groupName: "",
    agent: "",
    dateArr: "",
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const allOffers = await getAllFromStorage("offers");
        // Filter out Group Series offers
        const regularOffers = allOffers.filter(offer => !offer.isGroupSeries);
        setOffers(regularOffers || []);
        setFilteredOffers(regularOffers || []);
      } catch (error) {
        console.error("Error fetching offers:", error);
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
      const dateMatch = !filters.dateArr || offer.dateArr === filters.dateArr;
      return groupMatch && agentMatch && dateMatch;
    });
    setFilteredOffers(result);
  }, [filters, offers]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteFromStorage("offers", id);
        // Refresh the offers list after deletion
        const updatedOffers = await getAllFromStorage("offers");
        // Filter out Group Series offers
        const regularOffers = updatedOffers.filter(offer => !offer.isGroupSeries);
        setOffers(regularOffers || []);
        // Apply filters to the updated list
        let result = (updatedOffers || []).filter(offer => {
          const groupMatch = !filters.groupName || (offer.groupName && offer.groupName.toLowerCase().includes(filters.groupName.toLowerCase()));
          const agentMatch = !filters.agent || (offer.agent && offer.agent.toLowerCase().includes(filters.agent.toLowerCase()));
          const dateMatch = !filters.dateArr || offer.dateArr === filters.dateArr;
          return groupMatch && agentMatch && dateMatch;
        });
        setFilteredOffers(result);
      } catch (error) {
        console.error("Error deleting offer:", error);
        alert("Failed to delete offer. Please try again.");
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
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
        <input
          type="date"
          name="dateArr"
          value={filters.dateArr}
          onChange={handleFilterChange}
          style={inputStyle}
        />
      </div>
      {filteredOffers.length > 0 && (
        <div data-kb-nav="1" data-kb-axis="vertical" data-kb-wrap="true">
          {filteredOffers.map(offer => (
            <div key={offer.id} data-kb-item tabIndex={0} style={{
              ...itemStyle,
              border: offer.isSpecial ? "2px solid #FFD700" : offer.isConfirmed ? "2px solid #28a745" : "none",
              boxShadow: offer.isSpecial ? "0 0 10px rgba(255, 215, 0, 0.3)" :
                        offer.isConfirmed ? "0 0 10px rgba(40, 167, 69, 0.3)" : "none"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <h3 style={{ margin: 0 }}>{offer.groupName}</h3>
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
                <p style={{ margin: 0, color: "#aaa" }}>Agent: {offer.agent}</p>
                <p style={{ margin: 0, color: "#aaa" }}>File No: {offer.fileNo}</p>
                <p style={{ margin: 0, color: "#aaa" }}>Arrival: {offer.dateArr}</p>
                <p style={{ margin: 0, color: "#aaa" }}>Departure: {offer.dateDep}</p>
                <p style={{ margin: 0, color: "#aaa" }}>Nationality: {offer.nationality}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link to={`/offers/${offer.id}`} style={buttonStyle} data-kb-activate>
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
  alignItems: "center"
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

export default OfferList;