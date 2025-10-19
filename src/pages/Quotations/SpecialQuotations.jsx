// src/pages/Quotations/SpecialQuotations.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuotationItinerary from "./QuotationItinerary";
import { saveToStorage } from "../../assets/utils/storage";

const paxRanges = [
  { label: "1 pax",     value: 1 },
  { label: "2-3 pax",   value: 2 },
  { label: "4-5 pax",   value: 4 },
  { label: "6-7 pax",   value: 6 },
  { label: "8-9 pax",   value: 8 },
  { label: "10-14 pax", value: 10 },
  { label: "15-19 pax", value: 15 },
  { label: "20-24 pax", value: 20 },
  { label: "25-29 pax", value: 25 },
  { label: "30-34 pax", value: 30 },
  { label: "35-39 pax", value: 35 },
  { label: "40-44 pax", value: 40 },
  { label: "45-49 pax", value: 45 },
];

function SpecialQuotations() {
  const navigate = useNavigate();
  const [agent, setAgent] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [group, setGroup] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [programLength, setProgramLength] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [quotationDataMap, setQuotationDataMap] = useState({});
  const [specialNotes, setSpecialNotes] = useState("");
  const [vipClient, setVipClient] = useState(false);
  const [complimentaryItems, setComplimentaryItems] = useState([]);
  const [newComplimentaryItem, setNewComplimentaryItem] = useState("");
  const [hotelComments, setHotelComments] = useState({});
  const [transportationDiscount, setTransportationDiscount] = useState(0);

  const toggleRange = (value) => {
    setSelectedRanges(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // Fetch agents data
  useEffect(() => {
    fetch("/data/TravelAgents.json")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data);
        setFilteredAgents(data);
      })
      .catch((err) => console.error("Failed to load TravelAgents.json:", err));
  }, []);

  // Filter agents based on search term
  useEffect(() => {
    if (agentSearchTerm.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter((item) =>
        (item.Account_Name || "").toLowerCase().includes(agentSearchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    }
  }, [agentSearchTerm, agents]);

  // Calculate departure date when arrival date and program length change
  useEffect(() => {
    if (arrivalDate && programLength) {
      const arrival = new Date(arrivalDate);
      const lengthInDays = parseInt(programLength, 10);
      
      if (!isNaN(lengthInDays) && lengthInDays > 0) {
        // Add program length nights to arrival date
        const departure = new Date(arrival);
        departure.setDate(arrival.getDate() + lengthInDays);
        
        // Format as YYYY-MM-DD for the input field
        const formattedDate = departure.toISOString().split('T')[0];
        setDepartureDate(formattedDate);
      }
    }
  }, [arrivalDate, programLength]);

  const handleItineraryChange = useCallback((dataArray) => {
    const newMap = {};
    dataArray.forEach(data => {
      newMap[data.pax] = {
        ...data,
        agent,
        agentId,
        group,
        arrivalDate,
        departureDate,
        programLength,
        createdBy,
        transportationDiscount,
      };
    });
    setQuotationDataMap(newMap);
  }, [agent, agentId, group, arrivalDate, departureDate, programLength, createdBy, transportationDiscount]);

  const handleAgentSelect = (selectedAgent) => {
    setAgent(selectedAgent.Account_Name);
    setAgentId(selectedAgent.Acc_No);
    setAgentSearchTerm("");
    setShowAgentDropdown(false);
  };

  const exportQuotation = (e) => {
    e.preventDefault();
    const dataArray = Object.values(quotationDataMap);
    const json = JSON.stringify(dataArray, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `special_quotation_${group.replace(/\s+/g,"_")}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    const processed = Object.values(quotationDataMap);
    navigate("/offers/new", { state: {
      quotations: processed,
      group,
      agent,
      agentId,
      arrivalDate,
      departureDate,
      createdBy,
      isSpecial: true,
      specialNotes,
      vipClient,
      complimentaryItems,
      hotelComments,
      transportationDiscount,
      timestamp: Date.now() // Add timestamp to ensure state is always unique
    }});
  };

  const addComplimentaryItem = () => {
    if (newComplimentaryItem.trim()) {
      setComplimentaryItems(prev => [...prev, newComplimentaryItem.trim()]);
      setNewComplimentaryItem("");
    }
  };

  const removeComplimentaryItem = (index) => {
    setComplimentaryItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleHotelCommentChange = (optionIndex, accommodationIndex, comment) => {
    setHotelComments(prev => ({
      ...prev,
      [`${optionIndex}-${accommodationIndex}`]: comment
    }));
  };

  // Save into localStorage with special flag
  const saveQuotationToStorage = () => {
    const dataArray = Object.values(quotationDataMap);
    
    // Add hotel comments to the quotation data
    const quotationsWithComments = dataArray.map(paxData => {
      const options = paxData.options.map((option, optIdx) => {
        const accommodations = option.accommodations.map((accom, accomIdx) => {
          const commentKey = `${optIdx}-${accomIdx}`;
          return {
            ...accom,
            specialComment: hotelComments[commentKey] || ""
          };
        });
        
        return {
          ...option,
          accommodations
        };
      });
      
      return {
        ...paxData,
        options
      };
    });
    
    saveToStorage("quotations", {
      group,
      agent,
      agentId,
      arrivalDate,
      departureDate,
      programLength,
      createdBy,
      quotations: quotationsWithComments,
      isSpecial: true,
      specialNotes,
      vipClient,
      complimentaryItems,
      hotelComments,
      transportationDiscount
    });
    alert("Special Quotation saved!");
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 30, fontSize: 28, color: "#FFD700" }}>New Special Quotation</h2>
      <p style={{ marginBottom: 20, color: "#FFD700" }}>
        Create a customized quotation for VIP clients with special adjustments and complimentary items
      </p>

      {/* General Info */}
      <div style={formBoxStyle}>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Agent</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={agentSearchTerm}
                onChange={(e) => {
                  setAgentSearchTerm(e.target.value);
                  setShowAgentDropdown(true);
                }}
                onFocus={() => setShowAgentDropdown(true)}
                placeholder={agent || "Search for an agent..."}
                style={inputStyle}
              />
              {showAgentDropdown && filteredAgents.length > 0 && (
                <div style={dropdownStyle}>
                  {filteredAgents.map((item, index) => (
                    <div
                      key={index}
                      style={dropdownItemStyle}
                      onClick={() => handleAgentSelect(item)}
                    >
                      {item.Account_Name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <FormField label="Group" value={group} onChange={setGroup} />
          <FormField label="Date of Arrival" type="date" value={arrivalDate} onChange={setArrivalDate} />
          <FormField
            label="Program Length (Nights)"
            type="number"
            value={programLength}
            onChange={setProgramLength}
            min="1"
          />
          <FormField
            label="Date of Departure"
            type="date"
            value={departureDate}
            onChange={setDepartureDate}
            readOnly={!!programLength}
            style={programLength ? {...inputStyle, backgroundColor: "#444"} : inputStyle}
          />
          <FormField label="Created By" value={createdBy} onChange={setCreatedBy} />
          <div>
            <label style={labelStyle}>VIP Client</label>
            <input 
              type="checkbox" 
              checked={vipClient} 
              onChange={e => setVipClient(e.target.checked)}
              style={{ transform: "scale(1.3)", marginTop: 10 }}
            />
          </div>
        </div>
      </div>

      {/* Special Adjustments Section */}
      <div style={{...formBoxStyle, backgroundColor: "#2a2a2a"}}>
        <h3 style={{ marginBottom: 15, color: "#FFD700" }}>Special Notes</h3>
        <div style={gridStyle}>
          <div style={{ gridColumn: "1 / -1" }}>
            <textarea
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              style={{...inputStyle, minHeight: "80px"}}
              placeholder="Add any special notes or requirements for this VIP client"
            />
          </div>
        </div>
      </div>

      {/* Transportation Discount Section */}
      <div style={{...formBoxStyle, backgroundColor: "#2a2a2a"}}>
        <h3 style={{ marginBottom: 15, color: "#FFD700" }}>Transportation Discount</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Discount Percentage (%) - Applied to Transportation Only</label>
            <input
              type="number"
              min="0"
              max="100"
              value={transportationDiscount}
              onChange={e => setTransportationDiscount(Number(e.target.value))}
              style={{...inputStyle}}
              placeholder="Enter discount percentage (e.g., 10 for 10%)"
            />
            <small style={{ color: "#4CAF50", display: "block", marginTop: 5 }}>
              This discount will only be applied to transportation costs, not other services.
            </small>
          </div>
        </div>
      </div>

      {/* Complimentary Items Section */}
      <div style={{...formBoxStyle, backgroundColor: "#2a2a2a"}}>
        <h3 style={{ marginBottom: 15, color: "#FFD700" }}>Complimentary Items</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <input
            type="text"
            value={newComplimentaryItem}
            onChange={e => setNewComplimentaryItem(e.target.value)}
            style={{...inputStyle, flex: 1}}
            placeholder="Add complimentary item (e.g., Welcome Drink, Airport Transfer)"
          />
          <button 
            onClick={addComplimentaryItem}
            style={{...buttonStyle, backgroundColor: "#FFD700", color: "#000"}}
          >
            Add Item
          </button>
        </div>
        {complimentaryItems.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {complimentaryItems.map((item, index) => (
              <li key={index} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: "#333",
                borderRadius: 6,
                marginBottom: 8
              }}>
                <span>{item}</span>
                <button 
                  onClick={() => removeComplimentaryItem(index)}
                  style={{ background: "transparent", border: "none", color: "#f66", cursor: "pointer" }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PAX Ranges */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Select PAX Ranges</legend>
        <div style={checkboxContainer}>
          {paxRanges.map(r => (
            <label key={r.value} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedRanges.includes(r.value)}
                onChange={() => toggleRange(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Itineraries */}
      {selectedRanges.length === 0 ? (
        <p style={{ fontSize: 16 }}>Choose at least one range above to generate quotations.</p>
      ) : (
        <>
          <QuotationItinerary
            paxRanges={selectedRanges.map(v => paxRanges.find(r => r.value === v))}
            arrivalDate={arrivalDate}
            departureDate={departureDate}
            onDataChange={handleItineraryChange}
            agentId={agentId}
            transportationDiscount={transportationDiscount}
          />
          
          {/* Hotel Comments Section */}
          {Object.values(quotationDataMap).length > 0 && (
            <div style={{...formBoxStyle, backgroundColor: "#2a2a2a"}}>
              <h3 style={{ marginBottom: 15, color: "#FFD700" }}>Special Hotel Comments</h3>
              <p style={{ marginBottom: 15 }}>Add special comments for each hotel option</p>
              
              {Object.values(quotationDataMap).map((paxData, paxIndex) => (
                <div key={paxIndex} style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#FFD700" }}>PAX Range: {paxData.paxRange}</h4>
                  
                  {paxData.options.map((option, optIdx) => (
                    <div key={optIdx} style={{ marginBottom: 15, padding: 10, backgroundColor: "#1f1f1f", borderRadius: 8 }}>
                      <h5>Option {optIdx + 1}</h5>
                      
                      {option.accommodations.map((accom, accomIdx) => {
                        const commentKey = `${optIdx}-${accomIdx}`;
                        return (
                          <div key={accomIdx} style={{ marginBottom: 10, padding: 10, backgroundColor: "#333", borderRadius: 6 }}>
                            <p style={{ margin: "0 0 5px 0" }}>
                              {accom.hotelName || 'Hotel'} ({accom.city || 'City'}, {accom.stars || 'N/A'} stars)
                            </p>
                            <textarea
                              value={hotelComments[commentKey] || ""}
                              onChange={e => handleHotelCommentChange(optIdx, accomIdx, e.target.value)}
                              style={{...inputStyle, minHeight: "60px"}}
                              placeholder="Add special comments for this hotel (e.g., upgraded rooms, special rates)"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
        <button type="button" onClick={exportQuotation} style={exportBtnStyle}>
          Save Special Quotation JSON
        </button>
        <button type="button" onClick={saveQuotationToStorage} style={{...exportBtnStyle, backgroundColor: "#FFD700", color: "#000"}}>
          💾 Save Special Quotation
        </button>
        <button type="button" onClick={handleProceed} style={proceedBtnStyle}>
          Proceed to Add Offer
        </button>
      </div>
    </div>
  );
}

const FormField = ({ label, type = "text", value, onChange, readOnly = false, style = inputStyle }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={style}
      readOnly={readOnly}
    />
    {readOnly && type === "date" && (
      <small style={{ color: "#aaa", fontSize: "12px", marginTop: "4px", display: "block" }}>
        Auto-calculated from arrival date and program length
      </small>
    )}
  </div>
);

const containerStyle = { color: "white", padding: 30, fontFamily: "Segoe UI, sans-serif" };
const formBoxStyle    = { backgroundColor: "#1f1f1f", border: "1px solid #444", borderRadius: 12, padding: 20, marginBottom: 30 };
const gridStyle       = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 };
const labelStyle      = { fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" };
const inputStyle      = { padding: 10, borderRadius: 6, border: "1px solid #444", backgroundColor: "#2a2a2a", color: "#fff", fontSize: 14, width: "100%" };
const fieldsetStyle   = { border: "1px solid #444", borderRadius: 8, padding: 16, marginBottom: 30 };
const legendStyle     = { color: "#aaa", fontSize: 16, marginBottom: 10 };
const checkboxContainer = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 };
const checkboxLabel   = { display: "flex", alignItems: "center", gap: 8, fontSize: 14 };
const buttonStyle     = { padding: "10px 15px", borderRadius: 6, border: "none", cursor: "pointer" };
const exportBtnStyle  = { padding: "10px 20px", backgroundColor: "#007bff", color: "white", borderRadius: 6, border: "none", cursor: "pointer" };
const proceedBtnStyle = { padding: "10px 20px", backgroundColor: "#28a745", color: "white", borderRadius: 6, border: "none", cursor: "pointer" };
const dropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  backgroundColor: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "0 0 6px 6px",
  zIndex: 10,
  maxHeight: "200px",
  overflowY: "auto"
};
const dropdownItemStyle = {
  padding: "8px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #444",
  fontSize: 14,
  color: "#fff",
  hover: {
    backgroundColor: "#3a3a3a"
  }
};

export default SpecialQuotations;