// src/pages/Quotations/Quotations.jsx
import React, { useState, useCallback, useEffect, Component } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QuotationItinerary from "./QuotationItinerary";
// Fix: go up two levels from pages/Quotations into src/utils

import { saveToStorage, updateInStorage } from "../../assets/utils/storage";
// Import employees data
import employees from "../../data/employeesData";

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{
          padding: "20px",
          backgroundColor: "#ffebee",
          color: "#b71c1c",
          borderRadius: "8px",
          margin: "20px 0",
          border: "1px solid #ef9a9a"
        }}>
          <h2>Something went wrong with the Quotation Itinerary</h2>
          <p>We're sorry, but there was an error loading the quotation data. This might be due to an incompatible data format.</p>
          <details style={{ marginTop: "15px", cursor: "pointer" }}>
            <summary>View Technical Details</summary>
            <pre style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f8f8f8",
              borderRadius: "4px",
              overflow: "auto",
              color: "#333",
              fontSize: "12px"
            }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => window.location.href = "/quotations/quotations-list"}
              style={{
                padding: "10px 15px",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Return to Quotations List
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 15px",
                backgroundColor: "#757575",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}


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

function Quotations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [group, setGroup] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [programLength, setProgramLength] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [quotationDataMap, setQuotationDataMap] = useState({});
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editQuotationId, setEditQuotationId] = useState(null);
  const [transportationDiscount, setTransportationDiscount] = useState(0);
  
  // Add state for employee dropdown
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);


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

  // Filter employees based on search term
  useEffect(() => {
    if (employeeSearchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((employee) =>
        employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [employeeSearchTerm]);

  // Check for edit mode and pre-populate form fields
  useEffect(() => {
    try {
      if (location.state?.editMode && location.state?.quotationData) {
        const quotationData = location.state.quotationData;
        const itineraryData = location.state.itineraryData || [];
        const optionsData = location.state.optionsData || [];
        const fromViewPage = location.state.fromViewPage || false;
        
        console.log("Edit mode detected. Pre-populating form with quotation data:", quotationData);
        console.log("Itinerary data:", itineraryData);
        console.log("Options data:", optionsData);
        
        // Set edit mode
        setEditMode(true);
        setEditQuotationId(quotationData.id);
        
        // Pre-populate form fields
        setAgent(quotationData.agent || "");
        setAgentId(quotationData.agentId || "");
        setGroup(quotationData.group || "");
        setArrivalDate(quotationData.arrivalDate || "");
        setDepartureDate(quotationData.departureDate || "");
        setProgramLength(quotationData.programLength || "");
        setCreatedBy(quotationData.createdBy || "");


        // Extract PAX ranges from quotation data
        if (quotationData.quotations && quotationData.quotations.length > 0) {
          console.log("Processing quotations array:", quotationData.quotations);
          
          // Extract and set PAX ranges
          const ranges = [];
          quotationData.quotations.forEach(q => {
            try {
              // Extract the numeric value from the paxRange string (e.g., "2-3 pax" -> 2)
              const paxRangeStr = q.paxRange || "";
              console.log("Processing paxRange:", paxRangeStr);
              
              const match = paxRangeStr.match(/^(\d+)(?:-\d+)?\s*pax$/i);
              if (match) {
                const paxValue = parseInt(match[1], 10);
                if (!isNaN(paxValue) && !ranges.includes(paxValue)) {
                  ranges.push(paxValue);
                }
              } else if (q.pax) {
                // If paxRange string doesn't match, try using the pax number directly
                const paxValue = parseInt(q.pax, 10);
                if (!isNaN(paxValue) && !ranges.includes(paxValue)) {
                  ranges.push(paxValue);
                }
              }
            } catch (err) {
              console.error("Error processing quotation item:", err, q);
            }
          });
          
          console.log("Extracted PAX ranges:", ranges);
          if (ranges.length > 0) {
            setSelectedRanges(ranges);
          } else {
            // Fallback to default ranges if none could be extracted
            console.warn("No valid PAX ranges found, using defaults");
            setSelectedRanges([2, 4, 6]);
          }
          
          // Pre-populate quotation data map with complete data
          const newMap = {};
          quotationData.quotations.forEach(q => {
            try {
              let pax = null;
              
              // Try to extract pax from paxRange string
              if (q.paxRange) {
                const paxValue = q.paxRange.match(/^(\d+)(?:-\d+)?\s*pax$/i);
                if (paxValue) {
                  pax = parseInt(paxValue[1], 10);
                }
              }
              
              // If paxRange extraction failed, try using pax directly
              if (pax === null && q.pax) {
                pax = parseInt(q.pax, 10);
              }
              
              // Skip if we couldn't determine a valid pax value
              if (pax === null || isNaN(pax)) {
                console.warn("Skipping quotation with invalid pax:", q);
                return;
              }
              
              // Include all data from the quotation, including itinerary and options
              newMap[pax] = {
                ...q,
                // Ensure these fields are set correctly
                agent: quotationData.agent || "",
                agentId: quotationData.agentId || "",
                group: quotationData.group || "",
                arrivalDate: quotationData.arrivalDate || "",
                departureDate: quotationData.departureDate || "",
                programLength: quotationData.programLength || "",
                createdBy: quotationData.createdBy || "",
                // Ensure itinerary data is properly included
                itinerary: q.itinerary || [],
                // Include the options data if available
                options: q.options || []
              };
              
              // Log the itinerary data for debugging
              console.log(`Itinerary data for pax ${pax}:`, q.itinerary);
            } catch (err) {
              console.error("Error processing quotation for data map:", err, q);
            }
          });
          
          console.log("Pre-populated quotation data map:", newMap);
          if (Object.keys(newMap).length > 0) {
            setQuotationDataMap(newMap);
          } else {
            console.error("Failed to create quotation data map, no valid entries");
            alert("Error: Could not process quotation data. Please try again.");
          }
        } else {
          console.error("No quotations array found or it's empty:", quotationData);
          alert("Error: Invalid quotation data structure. Please try again.");
        }
        
        // Show notification about edit mode
        alert("Editing quotation: " + quotationData.group);
        
        // Don't clear location state when coming from view page
        // This ensures the data is preserved during the edit process
        if (!fromViewPage) {
          window.history.replaceState({}, document.title);
        }
      }
    } catch (error) {
      console.error("Error in edit mode initialization:", error);
      alert("Error initializing edit mode: " + error.message);
    }
  }, [location.state]);

  // Handle employee selection
  const handleEmployeeSelect = (selectedEmployee) => {
    setCreatedBy(selectedEmployee.name);
    setEmployeeSearchTerm("");
    setShowEmployeeDropdown(false);
  };

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
      };
    });
    setQuotationDataMap(newMap);
  }, [agent, agentId, group, arrivalDate, departureDate, programLength, createdBy]);

  const exportQuotation = (e) => {
    e.preventDefault();
    const dataArray = Object.values(quotationDataMap);
    const json = JSON.stringify(dataArray, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `quotation_${group.replace(/\s+/g,"_")}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    const processed = Object.values(quotationDataMap);
    navigate("/offers/new", {
      state: {
        quotations: processed,
        group,
        agent,
        agentId,
        arrivalDate,
        departureDate,
        createdBy,
        timestamp: Date.now() // Add timestamp to ensure state is always unique
      }
    });
  };

  const handleAgentSelect = (selectedAgent) => {
    setAgent(selectedAgent.Account_Name);
    setAgentId(selectedAgent.Acc_No);
    setAgentSearchTerm("");
    setShowAgentDropdown(false);
  };


  // Save into localStorage
  const saveQuotationToStorage = () => {
    const dataArray = Object.values(quotationDataMap);
    
    // Create quotation object
    const quotationObj = {
      group,
      agent,
      agentId,
      arrivalDate,
      departureDate,
      programLength,
      createdBy,
      quotations: dataArray,
      // Add timestamp for tracking changes
      updatedAt: new Date().toISOString()
    };
    
    // If in edit mode, preserve the original ID and any special properties
    if (editMode && editQuotationId) {
      // Log the data being saved
      console.log("Saving edited quotation with ID:", editQuotationId);
      
      // Preserve the original ID
      quotationObj.id = editQuotationId;
      
      // Preserve creation timestamp if it exists
      if (location.state?.quotationData?.createdAt) {
        quotationObj.createdAt = location.state.quotationData.createdAt;
      } else {
        quotationObj.createdAt = new Date().toISOString();
      }
      
      // Preserve isSpecial flag if it exists
      if (location.state?.quotationData?.isSpecial) {
        quotationObj.isSpecial = location.state.quotationData.isSpecial;
      }
      
      // Preserve isActualRates flag if it exists
      if (location.state?.quotationData?.isActualRates) {
        quotationObj.isActualRates = location.state.quotationData.isActualRates;
      }
      
      // Preserve originalQuotationId if it exists
      if (location.state?.quotationData?.originalQuotationId) {
        quotationObj.originalQuotationId = location.state.quotationData.originalQuotationId;
      }
      
      // Preserve complimentary items if they exist
      if (location.state?.quotationData?.complimentaryItems) {
        quotationObj.complimentaryItems = location.state.quotationData.complimentaryItems;
      }
      
      // Preserve special notes if they exist
      if (location.state?.quotationData?.specialNotes) {
        quotationObj.specialNotes = location.state.quotationData.specialNotes;
      }
      
      // Preserve any other important properties from the original quotation
      const preserveProperties = [
        'nationality', 'options', 'status', 'currency', 'exchangeRate',
        'specialRequests', 'terms', 'conditions', 'paymentTerms'
      ];
      
      preserveProperties.forEach(prop => {
        if (location.state?.quotationData?.[prop]) {
          quotationObj[prop] = location.state.quotationData[prop];
        }
      });
      
      // Update existing quotation
      updateInStorage("quotations", editQuotationId, quotationObj);
      console.log("Quotation updated successfully:", quotationObj);
      alert("Quotation updated!");
      
      // Navigate back to the quotation view
      navigate(`/quotations/view/${editQuotationId}`);
    } else {
      // Save new quotation
      saveToStorage("quotations", quotationObj);
      alert("Quotation saved!");
    }
  };



  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, margin: 0 }}>
          {editMode ? "Edit Quotation" : "Quotation – Automated Platform"}
        </h2>
        <button
          onClick={() => navigate("/quotation-help")}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span style={{ fontSize: "16px" }}>?</span>
          Quotation Help Sheet
        </button>
      </div>

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
          {/* Replace the simple FormField with the employee dropdown */}
          <div>
            <label style={labelStyle}>Created By</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={employeeSearchTerm}
                onChange={(e) => {
                  setEmployeeSearchTerm(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                onBlur={() => {
                  // Delay hiding dropdown to allow for click events
                  setTimeout(() => setShowEmployeeDropdown(false), 200);
                }}
                placeholder={createdBy || "Search for an employee..."}
                style={inputStyle}
              />
              {showEmployeeDropdown && filteredEmployees.length > 0 && (
                <div style={dropdownStyle}>
                  {filteredEmployees.slice(0, 10).map((employee, index) => (
                    <div
                      key={index}
                      style={dropdownItemStyle}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      {employee.name} ({employee.department})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <FormField
            label="Transportation Discount (%)"
            type="number"
            value={transportationDiscount}
            onChange={setTransportationDiscount}
          />
        </div>
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
        <ErrorBoundary>
          <QuotationItinerary
              paxRanges={selectedRanges.map(v => paxRanges.find(r => r.value === v))}
              arrivalDate={arrivalDate}
              departureDate={departureDate}
              onDataChange={handleItineraryChange}
              agentId={agentId}
              transportationDiscount={Number(transportationDiscount) || 0}
              initialData={editMode ? quotationDataMap : undefined}
            />
        </ErrorBoundary>
      )}


      {/* Actions */}
      <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
        <button type="button" onClick={exportQuotation} style={exportBtnStyle}>
          Save Quotation JSON
        </button>
        <button type="button" onClick={saveQuotationToStorage} style={exportBtnStyle}>
          💾 {editMode ? "Update Quotation" : "Save Quotation"}
        </button>
        {!editMode && (
          <button type="button" onClick={handleProceed} style={proceedBtnStyle}>
            Proceed to Add Offer
          </button>
        )}
        {editMode && (
          <button
            type="button"
            onClick={() => navigate(`/quotations/view/${editQuotationId}`)}
            style={{...buttonStyle, backgroundColor: "#6c757d"}}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate("/quotations/quotations-list")}
          style={{...buttonStyle, backgroundColor: "#6c757d"}}
        >
          Back to Quotations List
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
const exportBtnStyle  = { padding: "10px 20px", backgroundColor: "#007bff", color: "white", borderRadius: 6, border: "none", cursor: "pointer" };
const proceedBtnStyle = { padding: "10px 20px", backgroundColor: "#28a745", color: "white", borderRadius: 6, border: "none", cursor: "pointer" };
const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 15px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer"
};
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

export default Quotations;
