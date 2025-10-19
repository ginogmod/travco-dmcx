import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { saveToStorage, getOneFromStorage, updateInStorage } from "../../assets/utils/storage";
import GroupSeriesQuotationItinerary from "./GroupSeriesQuotationItinerary";

function GroupSeriesQuotationCreator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [group, setGroup] = useState("");
  const [agent, setAgent] = useState("");
  const [agentId, setAgentId] = useState("");
  const [programLength, setProgramLength] = useState(1); // Number of nights in the program
  const [paxRanges, setPaxRanges] = useState([
    { value: 2, label: "2 pax" },
    { value: 4, label: "4 pax" },
    { value: 6, label: "6 pax" },
    { value: 8, label: "8 pax" },
    { value: 10, label: "10 pax" },
    { value: 15, label: "15 pax" },
    { value: 20, label: "20 pax" },
    { value: 25, label: "25 pax" },
    { value: 30, label: "30 pax" },
  ]);
  const [transportationDiscount, setTransportationDiscount] = useState(0);
  const [quotationData, setQuotationData] = useState({});
  const [validityDates, setValidityDates] = useState([{ from: "", to: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Agent dropdown state (dropdown at top, remove manual inputs below)
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  // Add a validity date range
  const addValidityDate = () => {
    setValidityDates(prev => [...prev, { from: "", to: "" }]);
  };

  // Remove a validity date range
  const removeValidityDate = (index) => {
    setValidityDates(prev => prev.filter((_, i) => i !== index));
  };

  // Update a validity date range
  const updateValidityDate = (index, field, value) => {
    setValidityDates(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Check for edit mode data from location state or URL parameters
  useEffect(() => {
    const checkForEditMode = async () => {
      console.log("Checking for edit mode...");
      
      // First check location state (from React Router navigation)
      if (location.state && location.state.editMode) {
        console.log("Edit mode detected from location state:", location.state);
        handleEditMode(location.state);
        return;
      }
      
      // Then check URL parameters (from direct navigation)
      const searchParams = new URLSearchParams(location.search);
      const editParam = searchParams.get('edit');
      const idParam = searchParams.get('id');
      
      if (editParam === 'true' && idParam) {
        console.log("Edit mode detected from URL parameters. ID:", idParam);
        
        // Check sessionStorage for state data
        const storedState = sessionStorage.getItem('groupSeriesEditState');
        if (storedState) {
          try {
            const parsedState = JSON.parse(storedState);
            console.log("Found stored state in sessionStorage:", parsedState);
            handleEditMode(parsedState);
            
            // Clear the sessionStorage after using it
            sessionStorage.removeItem('groupSeriesEditState');
            return;
          } catch (error) {
            console.error("Error parsing stored state:", error);
          }
        }
        
        // If no state in sessionStorage, fetch the quotation directly
        try {
          console.log("Fetching quotation data for ID:", idParam);
          const quotation = await getOneFromStorage("quotations", idParam);
          
          if (quotation) {
            console.log("Fetched quotation for editing:", quotation);
            
            // Create a state object similar to what would be passed via location.state
            const stateData = {
              editMode: true,
              id: idParam,
              quotationData: quotation,
              itineraryData: quotation.itinerary || [],
              fromListPage: true
            };
            
            handleEditMode(stateData);
          } else {
            console.error("Quotation not found for ID:", idParam);
            alert("Error: Quotation not found for editing.");
          }
        } catch (error) {
          console.error("Error fetching quotation for editing:", error);
          alert("Error loading quotation for editing: " + error.message);
        }
      }
    };
    
    checkForEditMode();
  }, [location.state, location.search]);
  
  // Load agents for dropdown
  useEffect(() => {
    fetch("/data/TravelAgents.json")
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data) ? data.filter(Boolean) : [];
        setAgents(safe);
        setFilteredAgents(safe);
      })
      .catch((err) => {
        console.error("Failed to load TravelAgents.json:", err);
        setAgents([]);
        setFilteredAgents([]);
      });
  }, []);

  // Filter agent list by search term
  useEffect(() => {
    if (!agentSearchTerm || agentSearchTerm.trim() === "") {
      setFilteredAgents((Array.isArray(agents) ? agents : []).filter(Boolean));
      return;
    }
    const term = String(agentSearchTerm).toLowerCase();
    setFilteredAgents(
      (Array.isArray(agents) ? agents : []).filter((a) => {
        const name = String(a?.Account_Name ?? "").toLowerCase();
        const accNo = String(a?.Acc_No ?? "").toLowerCase();
        return name.includes(term) || accNo.includes(term);
      })
    );
  }, [agentSearchTerm, agents]);
  // Helper function to handle edit mode setup
  const handleEditMode = (stateData) => {
    console.log("Setting up edit mode with data:", stateData);
    setIsEditMode(true);
    
    // Set the ID for updating instead of creating new
    if (stateData.id) {
      setEditId(stateData.id);
    } else if (stateData.quotationData && stateData.quotationData.id) {
      setEditId(stateData.quotationData.id);
    }
    
    // Populate form with existing data
    const quotationData = stateData.quotationData || {};
    console.log("Quotation data for form population:", quotationData);
    
    // Set basic fields
    setGroup(quotationData.group || "");
    setAgent(quotationData.agent || "");
    setAgentId(quotationData.agentId || "");
    
    // Set program length with explicit logging
    const programLengthValue = quotationData.programLength || 1;
    console.log("Setting program length to:", programLengthValue);
    setProgramLength(programLengthValue);
    
    // Set validity dates
    if (quotationData.validityDates && Array.isArray(quotationData.validityDates)) {
      console.log("Setting validity dates:", quotationData.validityDates);
      setValidityDates(quotationData.validityDates);
    }

    
    // Create a clean itineraryData object with all necessary properties
    let itineraryData = {
      // Start with a clean slate
      itinerary: [],
      quotations: [],
      options: [],
      optionals: [],
      optionalActivities: {},
      calculationResults: {}
    };
    
    try {
      // 1. First, populate itinerary array (day-by-day data)
      if (stateData.itineraryData && Array.isArray(stateData.itineraryData) && stateData.itineraryData.length > 0) {
        console.log("Using itineraryData from state:", stateData.itineraryData);
        itineraryData.itinerary = JSON.parse(JSON.stringify(stateData.itineraryData));
      } else if (quotationData.itinerary && Array.isArray(quotationData.itinerary) && quotationData.itinerary.length > 0) {
        console.log("Using itinerary from quotationData:", quotationData.itinerary);
        itineraryData.itinerary = JSON.parse(JSON.stringify(quotationData.itinerary));
      }
      
      // 2. Populate quotations array (pax range data)
      if (quotationData.quotations && Array.isArray(quotationData.quotations) && quotationData.quotations.length > 0) {
        console.log("Using quotations from quotationData:", quotationData.quotations);
        itineraryData.quotations = JSON.parse(JSON.stringify(quotationData.quotations));
      }
      
      // 3. Populate options array (accommodation options)
      if (quotationData.options && Array.isArray(quotationData.options) && quotationData.options.length > 0) {
        console.log("Using options from quotationData:", quotationData.options);
        itineraryData.options = JSON.parse(JSON.stringify(quotationData.options));
      }
      
      // 4. Populate optionals array
      if (quotationData.optionals && Array.isArray(quotationData.optionals)) {
        console.log("Using optionals from quotationData:", quotationData.optionals);
        itineraryData.optionals = JSON.parse(JSON.stringify(quotationData.optionals));
      }
      
      // 5. Populate optionalActivities object
      if (quotationData.optionalActivities && typeof quotationData.optionalActivities === 'object') {
        console.log("Using optionalActivities from quotationData:", quotationData.optionalActivities);
        itineraryData.optionalActivities = JSON.parse(JSON.stringify(quotationData.optionalActivities));
      }
      
      // 6. Populate calculationResults object
      if (quotationData.calculationResults && typeof quotationData.calculationResults === 'object') {
        console.log("Using calculationResults from quotationData:", quotationData.calculationResults);
        itineraryData.calculationResults = JSON.parse(JSON.stringify(quotationData.calculationResults));
      }
      
      // Log a warning if we still don't have any itinerary data
      if (itineraryData.itinerary.length === 0 && itineraryData.quotations.length === 0) {
        console.warn("No valid itinerary or quotations data found in:", stateData);
      }
    } catch (error) {
      console.error("Error preparing itinerary data:", error);
      // If an error occurs, log it but continue with whatever data we have
      console.log("Continuing with partial data due to error");
    }
    
    // Add any other properties from quotationData that might be needed
    if (quotationData.transportationDiscount !== undefined) {
      itineraryData.transportationDiscount = quotationData.transportationDiscount;
      console.log("Including transportation discount:", quotationData.transportationDiscount);
      setTransportationDiscount(quotationData.transportationDiscount);
    }
    
    // Ensure all arrays and objects are properly initialized
    if (!Array.isArray(itineraryData.itinerary)) itineraryData.itinerary = [];
    if (!Array.isArray(itineraryData.quotations)) itineraryData.quotations = [];
    if (!Array.isArray(itineraryData.options)) itineraryData.options = [];
    if (!Array.isArray(itineraryData.optionals)) itineraryData.optionals = [];
    if (typeof itineraryData.optionalActivities !== 'object') itineraryData.optionalActivities = {};
    if (typeof itineraryData.calculationResults !== 'object') itineraryData.calculationResults = {};
    
    // Ensure rate display mode is present for initialization of the itinerary component
    if (typeof itineraryData.rateDisplayMode === "undefined") {
      itineraryData.rateDisplayMode = quotationData.rateDisplayMode || "bySeasonAuto";
    }
    console.log("Setting quotation data for itinerary component:", itineraryData);
    setQuotationData(itineraryData);
    
    console.log("Edit mode setup complete with data:", {
      id: stateData.id || (stateData.quotationData && stateData.quotationData.id),
      group: quotationData.group || "",
      agent: quotationData.agent || "",
      agentId: quotationData.agentId || "",
      programLength: programLengthValue,
      validityDates: quotationData.validityDates || [],
      itineraryData
    });
  };

  const handleQuotationDataChange = (data) => {
    setQuotationData(data);
  };

  // Helper function for deep merging objects
  const deepMerge = (target, source) => {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
    
    // If either target or source is not an object, return source
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
    
    // Create a new object to avoid modifying the original target
    const output = { ...target };
    
    // Iterate through source properties
    Object.keys(source).forEach(key => {
      // If the property is an object in both target and source, recursively merge
      if (isObject(source[key]) && isObject(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // If the property is an array in both, use the source array
        // This is a simple approach - more complex merging could be implemented if needed
        output[key] = source[key];
      } else {
        // Otherwise, use the source property
        output[key] = source[key];
      }
    });
    
    return output;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);


    try {
      if (isEditMode && editId) {
        // Update existing quotation
        console.log("Updating existing quotation with ID:", editId);
        
        // Get the existing quotation first
        const existingQuotation = await getOneFromStorage("quotations", editId);
        if (!existingQuotation) {
          throw new Error("Quotation not found for updating");
        }
        
        console.log("Existing quotation:", existingQuotation);
        console.log("New quotation data:", quotationData);
        
        // Create base updated quotation with simple fields
        const baseUpdatedQuotation = {
          ...existingQuotation,
          group,
          agent,
          agentId,
          programLength,
          validityDates,
          updatedAt: new Date().toISOString(),
          isGroupSeries: true
        };
        
        // Deep merge the existing quotation with the new data
        const updatedQuotation = deepMerge(baseUpdatedQuotation, quotationData);
        
        console.log("Merged quotation:", updatedQuotation);
        
        // Update in storage
        await updateInStorage("quotations", editId, updatedQuotation);
        console.log("Successfully updated quotation:", editId);
      } else {
        // Create new quotation
        const id = uuidv4();
        const quotation = {
          id,
          group,
          agent,
          agentId,
          programLength,
          validityDates,
          createdBy: localStorage.getItem("username") || "Unknown",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isGroupSeries: true,
          ...quotationData
        };
        
        await saveToStorage("quotations", quotation);
        console.log("Successfully created new quotation:", id);
      }
      
      // Navigate back to the list
      navigate("/quotations/group-series-list");
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Failed to save quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>{isEditMode ? "Edit Group Series Quotation" : "Group Series Quotation Creator"}</h1>

      {/* Agent Dropdown at top */}
      <div style={{ margin: "10px 0 20px 0", display: "flex", gap: "15px", alignItems: "center" }}>
        <div style={{ position: "relative", width: "320px" }}>
          <div
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #444",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              fontSize: 14,
              width: "100%",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>{agent || "Select an agent..."}</span>
            <span style={{ marginLeft: 8 }}>▼</span>
          </div>
          {showAgentDropdown && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "0 0 6px 6px",
              zIndex: 10,
              maxHeight: "260px",
              overflowY: "auto"
            }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #444" }}>
                <input
                  value={agentSearchTerm}
                  onChange={(e) => setAgentSearchTerm(e.target.value)}
                  placeholder="Search agent..."
                  style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid #555", background: "#1f1f1f", color: "#fff" }}
                />
              </div>
              {((filteredAgents || []).filter(Boolean)).map((item, index) => (
                <div
                  key={`${item?.Acc_No ?? index}-${index}`}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #444",
                    fontSize: 14,
                    color: "#fff",
                    backgroundColor: index % 2 === 0 ? "#333" : "#2a2a2a"
                  }}
                  onClick={() => {
                    setAgent(item?.Account_Name || "");
                    setAgentId(item?.Acc_No || "");
                    setAgentSearchTerm("");
                    setShowAgentDropdown(false);
                  }}
                >
                  {(item?.Account_Name || "Unknown Agent")} {(item?.Acc_No ? `(${item.Acc_No})` : "")}
                </div>
              ))}
            </div>
          )}
        </div>
        {agentId && (
          <div style={{ fontSize: 13, color: "#aaa" }}>
            Selected Agent ID: <span style={{ color: "#4CAF50" }}>{agentId}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label>Group Name</label>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", backgroundColor: "#2a2a2a", color: "white", border: "1px solid #444" }}
            />
          </div>
          {/* Agent selection moved to the top dropdown */}
          {/* Agent ID selection moved to the top dropdown */}
          <div>
            <label>Transportation Discount (%)</label>
            <input
              type="number"
              value={transportationDiscount}
              onChange={(e) => setTransportationDiscount(Number(e.target.value))}
              min="0"
              max="100"
              style={{ width: "100%", padding: "10px", backgroundColor: "#2a2a2a", color: "white", border: "1px solid #444" }}
            />
          </div>
          <div>
            <label>Program Length (Nights)</label>
            <input
              type="number"
              min="1"
              value={programLength}
              onChange={(e) => setProgramLength(parseInt(e.target.value) || 1)}
              required
              style={{ width: "100%", padding: "10px", backgroundColor: "#2a2a2a", color: "white", border: "1px solid #444" }}
            />
            <small style={{ color: "#aaa", fontSize: "12px", marginTop: "4px", display: "block" }}>
              Number of nights in the program (determines the number of days)
            </small>
          </div>
        </div>

        {/* Group Series Validity Dates Section */}
        <div style={{ marginBottom: "30px", backgroundColor: "#1f1f1f", padding: "20px", borderRadius: "8px" }}>
          <h3>Group Series Validity Dates</h3>
          <p style={{ color: "#aaa", marginBottom: "15px" }}>
            Add multiple validity date ranges for this group series quotation
          </p>
          
          {validityDates.map((dateRange, index) => (
            <div key={index} style={{ 
              display: "flex", 
              gap: "15px", 
              marginBottom: "15px", 
              alignItems: "center",
              backgroundColor: "#2a2a2a",
              padding: "15px",
              borderRadius: "6px"
            }}>
              <div style={{ flex: 1 }}>
                <label>From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => updateValidityDate(index, "from", e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", backgroundColor: "#333", color: "white", border: "1px solid #444" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => updateValidityDate(index, "to", e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", backgroundColor: "#333", color: "white", border: "1px solid #444" }}
                />
              </div>
              {validityDates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeValidityDate(index)}
                  style={{ 
                    backgroundColor: "#d32f2f", 
                    color: "white", 
                    border: "none", 
                    padding: "10px 15px", 
                    borderRadius: "4px",
                    marginTop: "20px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addValidityDate}
            style={{ 
              backgroundColor: "#4caf50", 
              color: "white", 
              border: "none", 
              padding: "10px 15px", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add Another Validity Period
          </button>
        </div>

        {programLength > 0 && (
          <>
            {/* Debug output to see what data is being passed */}
            <div style={{ display: "none" }}>
              {console.log("Passing quotationData to GroupSeriesQuotationItinerary:", JSON.stringify(quotationData, null, 2))}
            </div>
            <GroupSeriesQuotationItinerary
              paxRanges={paxRanges}
              programLength={programLength} // Pass program length instead of dates
              validityDates={validityDates} // Pass validity dates
              onDataChange={handleQuotationDataChange}
              agentId={agentId}
              transportationDiscount={transportationDiscount}
              initialData={quotationData} // Pass quotationData as initialData // Force re-render when data changes
            />
          </>
        )}


        <div style={{ marginTop: "30px", display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Common button style */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                width: "120px",
                textAlign: "center"
              }}
            >
              {isSubmitting ? "Saving..." : (isEditMode ? "Update" : "Save")}
            </button>
            
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                // Create a data object to pass to the Group Series Offer page
                const groupSeriesOfferData = {
                  isGroupSeries: true,
                  quotations: quotationData.quotations || [],
                  options: quotationData.options || [],
                  group: group,
                  agent: agent,
                  agentId: agentId,
                  programLength: programLength,
                  createdBy: localStorage.getItem("username") || "Unknown",
                  validityDates: validityDates,
                  // Persist the rate display mode so the offer page can respect it if needed
                  rateDisplayMode: quotationData.rateDisplayMode || "bySeasonAuto",
                  // Include detailed program data to auto-populate offer fields
                  itinerary: quotationData.itinerary || [],
                  optionalActivities: quotationData.optionalActivities || {},
                  calculationResults: quotationData.calculationResults || {},
                  // Include any other necessary data
                  optionals: quotationData.optionals || []
                };
                
                // Navigate to the Group Series Offer page with the data
                navigate("/offers/group-series-new", { state: groupSeriesOfferData });
              }}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                width: "120px",
                textAlign: "center"
              }}
            >
              To Offer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default GroupSeriesQuotationCreator;