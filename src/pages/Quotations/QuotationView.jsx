// src/pages/QuotationView.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getOneFromStorage,
  updateInStorage,
  saveToStorage,
  getAllFromStorage
} from "../../assets/utils/storage";
import { generateOfferPDF } from "../../assets/utils/generateOfferPDF";
import { generateExcel } from "../../assets/utils/generateExcel";

export default function QuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quote, setQuote] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [activeTab, setActiveTab] = useState("original");
  const [actualRatesQuote, setActualRatesQuote] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const shouldCreateActualRates = searchParams.get('createActualRates') === 'true';
  const shouldShowActualRates = searchParams.get('showActualRates') === 'true';

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const q = await getOneFromStorage("quotations", id);
        if (!q) return navigate("/quotations/quotations-list");
        setQuote(q);
        
        // Check for actual rates quotation regardless of parameters
        const allQuotations = await getAllFromStorage("quotations");
        const existingActualRates = allQuotations.find(quotation =>
          quotation.isActualRates && quotation.originalQuotationId === Number(id)
        );
        
        console.log("Checking for actual rates quotation for ID:", id);
        console.log("Found actual rates:", existingActualRates);
        
        if (existingActualRates) {
          console.log("Setting actual rates quotation:", existingActualRates);
          setActualRatesQuote(existingActualRates);
          
          // Set active tab based on URL parameter
          if (shouldShowActualRates) {
            console.log("Setting active tab to actual rates");
            setActiveTab("actual");
            // Remove the query parameter from the URL
            navigate(`/quotations/view/${id}`, { replace: true });
          }
        } else if (shouldCreateActualRates) {
          // Create a new actual rates quotation
          console.log("Creating new actual rates quotation");
          const actualRatesCopy = JSON.parse(JSON.stringify(q));
          actualRatesCopy.id = Date.now();
          actualRatesCopy.isActualRates = true;
          actualRatesCopy.originalQuotationId = q.id;
          
          try {
            const savedCopy = await saveToStorage("quotations", actualRatesCopy);
            console.log("Saved new actual rates quotation:", savedCopy);
            setActualRatesQuote(savedCopy);
            setActiveTab("actual");
            
            // Remove the query parameter from the URL
            navigate(`/quotations/view/${id}`, { replace: true });
          } catch (saveError) {
            console.error("Error saving actual rates quotation:", saveError);
            // Still set the copy in state even if saving fails
            setActualRatesQuote(actualRatesCopy);
            setActiveTab("actual");
          }
        }
      } catch (error) {
        console.error("Error fetching quotation:", error);
        navigate("/quotations/quotations-list");
      }
    };
    
    fetchQuotation();
  }, [id, navigate, shouldCreateActualRates, shouldShowActualRates]);

  const handleExcelExport = () => {
    if (!quote) return;

    const data = quote.quotations.flatMap(paxRange => {
      const rows = [
        { Item: "Entrance Fees", Cost: Number(paxRange.costs?.entranceFees ?? 0).toFixed(2) },
        { Item: "Transportation", Cost: Number(paxRange.costs?.transportation ?? 0).toFixed(2) },
        { Item: "Jeeps", Cost: Number(paxRange.costs?.jeeps ?? 0).toFixed(2) },
        { Item: "Meet and Assist", Cost: Number(paxRange.costs?.meetAndAssist ?? 0).toFixed(2) },
        { Item: "Local Guide", Cost: Number(paxRange.costs?.localGuide ?? 0).toFixed(2) },
        { Item: "Private Guide", Cost: Number(paxRange.costs?.privateGuide ?? 0).toFixed(2) },
        { Item: "Meals", Cost: Number(paxRange.costs?.meals ?? 0).toFixed(2) },
        { Item: "Extras", Cost: Number(paxRange.costs?.extras ?? 0).toFixed(2) },
        { Item: "Water", Cost: Number(paxRange.costs?.water ?? 0).toFixed(2) },
        { Item: "Tips & Portage", Cost: Number(paxRange.costs?.tips ?? 0).toFixed(2) },
        { Item: "Bank Commission", Cost: Number(paxRange.costs?.bankCommission ?? 0).toFixed(2) },
        { Item: "Cost Before Accom and Profit Margin", Cost: Number(paxRange.costBeforeAccommodationAndProfitMargin ?? 0).toFixed(2) },
      ];

      paxRange.options.forEach((opt, i) => {
        rows.push({ Item: `Opt${i + 1} (with accom and profit margin)`, Cost: Number(opt.totalCost ?? 0).toFixed(2) });
      });

      return [
        { Item: `PAX Range: ${paxRange.paxRange}`, Cost: "" },
        ...rows,
        { Item: "", Cost: "" } // Spacer row
      ];
    });

    generateExcel(data, `${quote.group}-quotation.xlsx`);
  };

  if (!quote) return <div>Loading...</div>;

  // Function to save actual rates
  const saveActualRates = async () => {
    if (!actualRatesQuote) return;
    
    try {
      // Create a deep copy to ensure all data is preserved
      const quotationToSave = JSON.parse(JSON.stringify(actualRatesQuote));
      
      // Ensure timestamps are updated
      quotationToSave.updatedAt = new Date().toISOString();
      
      // Update the actual rates quotation in storage
      await updateInStorage("quotations", quotationToSave.id, quotationToSave);
      setSaveStatus("Actual rates saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
      
      // Update the local state with the saved data
      setActualRatesQuote(quotationToSave);
    } catch (error) {
      console.error("Error saving actual rates:", error);
      setSaveStatus("Error saving actual rates. Please try again.");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Tabs for Original vs Actual Rates */}
      {actualRatesQuote && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid #444",
            paddingBottom: 0,
            width: "100%"
          }}>
            <button
              onClick={() => setActiveTab("original")}
              style={{
                padding: "12px 24px",
                backgroundColor: activeTab === "original" ? "#007bff" : "#2a2a2a",
                color: "white",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                maxWidth: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s ease"
              }}
            >
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#007bff"
              }}></span>
              Original Quotation
            </button>
            <button
              onClick={() => setActiveTab("actual")}
              style={{
                padding: "12px 24px",
                backgroundColor: activeTab === "actual" ? "#28a745" : "#2a2a2a",
                color: "white",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                maxWidth: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s ease"
              }}
            >
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#28a745"
              }}></span>
              Actual Rates
            </button>
          </div>
          <div style={{
            backgroundColor: activeTab === "original" ? "rgba(0, 123, 255, 0.1)" : "rgba(40, 167, 69, 0.1)",
            padding: "10px 15px",
            borderRadius: "0 8px 8px 8px",
            marginBottom: "20px",
            border: `1px solid ${activeTab === "original" ? "#007bff" : "#28a745"}`,
            borderTop: "none"
          }}>
            <p style={{ margin: 0, fontWeight: "bold", color: activeTab === "original" ? "#007bff" : "#28a745" }}>
              {activeTab === "original"
                ? "You are viewing the original quotation with estimated costs."
                : "You are viewing the actual rates with final pricing."}
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#aaa" }}>
              {activeTab === "original"
                ? "Switch to the Actual Rates tab to see the final pricing."
                : "Switch to the Original Quotation tab to compare with the estimated costs."}
            </p>
          </div>
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", columnGap: "12px", rowGap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0 }}>
              {quote.group}
            </h1>
            {quote.isSpecial && (
              <span style={specialBadgeStyle}>VIP</span>
            )}
            {activeTab === "actual" && (
              <span style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold"
              }}>
                ACTUAL RATES
              </span>
            )}
          </div>
          {quote.isSpecial && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ color: "#FFD700", fontWeight: "bold", margin: 0 }}>Special Quotation</p>
            </div>
          )}
          <div style={{ marginTop: "10px", display: "flex", gap: "20px", color: "#aaa" }}>
            <div>
              <strong>Arrival:</strong> {new Date(quote.arrivalDate).toLocaleDateString()}
            </div>
            <div>
              <strong>Departure:</strong> {new Date(quote.departureDate).toLocaleDateString()}
            </div>
            {quote.programLength && (
              <div>
                <strong>Program Length:</strong> {quote.programLength} nights
              </div>
            )}
          </div>
        </div>
        <div role="toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
          <button onClick={() => navigate("/quotations/quotations-list")} style={{ ...buttonStyle, backgroundColor: "#6c757d" }}>
            ← Back to list
          </button>
          <button onClick={handleExcelExport} style={{ ...buttonStyle }}>
            Export Excel
          </button>
          <button
            onClick={() => generateOfferPDF(activeTab === "original" ? quote : actualRatesQuote)}
            style={{ ...buttonStyle, backgroundColor: "#007bff" }}
          >
            Generate PDF
          </button>
          <button
            onClick={() => {
              const currentQuote = activeTab === "original" ? quote : actualRatesQuote;
              
              // Create a new object with only the necessary fields to avoid any confusion
              const offerData = {
                quotations: currentQuote.quotations || [],
                options: currentQuote.options || [],
                group: currentQuote.group || "Unknown Group",
                agent: currentQuote.agent || "",
                nationality: currentQuote.nationality || "",
                arrivalDate: currentQuote.arrivalDate || "",
                departureDate: currentQuote.departureDate || "",
                createdBy: currentQuote.createdBy || "",
                isSpecial: currentQuote.isSpecial || false,
                // Most importantly, explicitly set the quotation ID
                quotationId: currentQuote.id,
                programLength: currentQuote.programLength
              };
              
              console.log("Creating offer from quotation with ID:", currentQuote.id);
              navigate("/offers/new", { state: offerData });
            }}
            style={{ ...buttonStyle, backgroundColor: "#17a2b8" }}
          >
            Create Offer
          </button>
          <button
            onClick={() => {
              try {
                const currentQuote = activeTab === "original" ? quote : actualRatesQuote;
                
                if (!currentQuote) {
                  console.error("No quotation data available to edit");
                  alert("Error: No quotation data available to edit");
                  return;
                }
                
                // Create a deep clone of the current quotation to ensure all data is passed
                const quotationToEdit = JSON.parse(JSON.stringify(currentQuote));
                
                // Ensure the quotation has the correct structure
                if (!quotationToEdit.quotations || !Array.isArray(quotationToEdit.quotations)) {
                  console.error("Invalid quotation structure - missing quotations array:", quotationToEdit);
                  alert("Error: Invalid quotation structure");
                  return;
                }
                
                // Log the data being passed for debugging
                console.log("Editing quotation with data:", quotationToEdit);
                console.log("Quotation ID:", quotationToEdit.id);
                console.log("Quotations array length:", quotationToEdit.quotations.length);
                
                // Prepare the state data to pass to the quotation creation page
                // Create a simplified version of the quotation data that's easier to process
                const simplifiedQuotationData = {
                  id: quotationToEdit.id,
                  group: quotationToEdit.group || "",
                  agent: quotationToEdit.agent || "",
                  agentId: quotationToEdit.agentId || "",
                  arrivalDate: quotationToEdit.arrivalDate || "",
                  departureDate: quotationToEdit.departureDate || "",
                  programLength: quotationToEdit.programLength || "",
                  createdBy: quotationToEdit.createdBy || "",
                  createdAt: quotationToEdit.createdAt || new Date().toISOString(),
                  updatedAt: quotationToEdit.updatedAt || new Date().toISOString(),
                  isSpecial: quotationToEdit.isSpecial || false,
                  isActualRates: quotationToEdit.isActualRates || false,
                  originalQuotationId: quotationToEdit.originalQuotationId || null,
                  specialNotes: quotationToEdit.specialNotes || "",
                  complimentaryItems: quotationToEdit.complimentaryItems || [],
                  // Ensure quotations array is properly structured
                  quotations: quotationToEdit.quotations.map(q => ({
                    ...q,
                    // Ensure each quotation has the necessary fields
                    pax: q.pax || 0,
                    paxRange: q.paxRange || "",
                    costs: q.costs || {},
                    costBeforeAccommodationAndProfitMargin: q.costBeforeAccommodationAndProfitMargin || 0,
                    options: (q.options || []).map(opt => ({
                      totalCost: opt.totalCost || 0,
                      accommodations: (opt.accommodations || []).map(accom => ({
                        ...accom,
                        city: accom.city || "",
                        stars: accom.stars || "",
                        hotelName: accom.hotelName || "",
                        season: accom.season || "",
                        dblRate: accom.dblRate || 0,
                        hbRate: accom.hbRate || 0,
                        sglRate: accom.sglRate || 0,
                        nights: accom.nights || 1,
                        board: accom.board || "B/B"
                      }))
                    })),
                    itinerary: q.itinerary || []
                  }))
                };
                
                const stateData = {
                  editMode: true,
                  quotationData: simplifiedQuotationData,
                  // Include the itinerary data explicitly
                  itineraryData: simplifiedQuotationData.quotations || [],
                  // Include the options data explicitly
                  optionsData: simplifiedQuotationData.options || [],
                  // Flag to indicate this is coming from the view page
                  fromViewPage: true,
                  // Include the active tab information to know which quotation is being edited
                  activeTab: activeTab,
                  // Include original quotation ID for reference if editing actual rates
                  originalQuotationId: activeTab === "actual" ? simplifiedQuotationData.originalQuotationId : null
                };
                
                console.log("Navigating to quotations page with state:", stateData);
                
                // Use replace: true to ensure the state is not lost during navigation
                navigate("/quotations/quotations", {
                  state: stateData,
                  replace: true // Replace the current entry in history to avoid navigation issues
                });
              } catch (error) {
                console.error("Error preparing quotation for editing:", error);
                alert("Error preparing quotation for editing: " + error.message);
              }
            }}
            style={{ ...buttonStyle, backgroundColor: "#ffc107", color: "#000" }}
          >
            Edit Quotation
          </button>
          {(quote.isSpecial || activeTab === "actual") && (
            <button
              onClick={async () => {
                try {
                  if (activeTab === "original") {
                    // Create a deep copy to ensure all data is preserved
                    const quotationToSave = JSON.parse(JSON.stringify(quote));
                    
                    // Ensure timestamps are updated
                    quotationToSave.updatedAt = new Date().toISOString();
                    
                    await updateInStorage("quotations", id, quotationToSave);
                    setSaveStatus("Original quotation saved successfully!");
                    
                    // Update the local state with the saved data
                    setQuote(quotationToSave);
                  } else if (actualRatesQuote) {
                    await saveActualRates();
                    // Status is set in saveActualRates function
                    return;
                  }
                  setTimeout(() => setSaveStatus(""), 3000);
                } catch (error) {
                  console.error("Error saving changes:", error);
                  setSaveStatus("Error saving changes. Please try again.");
                  setTimeout(() => setSaveStatus(""), 3000);
                }
              }}
              style={{ ...buttonStyle, backgroundColor: "#28a745" }}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
      
      {/* Save status message */}
      {saveStatus && (
        <div style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "10px 15px",
          borderRadius: "6px",
          marginBottom: "15px",
          fontWeight: "bold"
        }}>
          {saveStatus}
        </div>
      )}

      {/* Special Quotation Details */}
      {quote.isSpecial && (
        <div style={specialSectionStyle}>
          <h3 style={{ color: "#FFD700", marginTop: 0 }}>Special Quotation Details</h3>
          
          {quote.specialNotes && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 5px 0" }}>Special Notes:</h4>
              <p style={{ margin: 0, backgroundColor: "#2a2a2a", padding: "10px", borderRadius: "6px" }}>
                {quote.specialNotes}
              </p>
            </div>
          )}
          
          {quote.complimentaryItems && quote.complimentaryItems.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 5px 0" }}>Complimentary Items:</h4>
              <ul style={{ backgroundColor: "#2a2a2a", padding: "10px 10px 10px 30px", borderRadius: "6px", margin: 0 }}>
                {quote.complimentaryItems.map((item, index) => (
                  <li key={index} style={{ margin: "5px 0" }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(activeTab === "original" ? quote : actualRatesQuote)?.quotations.map((paxRange, index) => (
        <div key={index} style={{ marginBottom: 40 }}>
          <h2>PAX Range: {paxRange.paxRange}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Item</th>
                <th style={tableHeaderStyle}>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Entrance Fees</td><td style={tableCellStyle}>{Number(paxRange.costs?.entranceFees ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Transportation</td><td style={tableCellStyle}>{Number(paxRange.costs?.transportation ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Jeeps</td><td style={tableCellStyle}>{Number(paxRange.costs?.jeeps ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Meet and Assist</td><td style={tableCellStyle}>{Number(paxRange.costs?.meetAndAssist ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Local Guide</td><td style={tableCellStyle}>{Number(paxRange.costs?.localGuide ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Private Guide</td><td style={tableCellStyle}>{Number(paxRange.costs?.privateGuide ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Meals</td><td style={tableCellStyle}>{Number(paxRange.costs?.meals ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Extras</td><td style={tableCellStyle}>{Number(paxRange.costs?.extras ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Water</td><td style={tableCellStyle}>{Number(paxRange.costs?.water ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Tips & Portage</td><td style={tableCellStyle}>{Number(paxRange.costs?.tips ?? 0).toFixed(2)}</td></tr>
              <tr style={tableRowStyle}><td style={tableCellStyle}>Bank Commission</td><td style={tableCellStyle}>{Number(paxRange.costs?.bankCommission ?? 0).toFixed(2)}</td></tr>
              <tr style={{...tableRowStyle, fontWeight: 'bold' }}><td style={tableCellStyle}>Cost Before Accom and Profit Margin</td><td style={tableCellStyle}>{Number(paxRange.costBeforeAccommodationAndProfitMargin ?? 0).toFixed(2)}</td></tr>
              {paxRange.options.map((opt, i) => (
                <tr key={i} style={{
                  ...tableRowStyle, 
                  backgroundColor: quote.isSpecial ? '#2a1f1f' : '#2a2a2a',
                  color: quote.isSpecial ? '#FFD700' : 'inherit'
                }}>
                  <td style={tableCellStyle}>Opt{i + 1} (with accom and profit margin)</td>
                  <td style={tableCellStyle}>{Number(opt.totalCost ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Display hotel details for special quotations or actual rates */}
          {(quote.isSpecial || activeTab === "actual") && paxRange.options.map((option, optIdx) => {
            // Function to calculate total based on the three rate fields
            const calculateTotal = () => {
              if (activeTab !== "actual" || !actualRatesQuote) return 0;
              
              try {
                let total = 0;
                
                // Sum up the rates from all accommodations
                actualRatesQuote.quotations[index].options[optIdx].accommodations.forEach(accom => {
                  const dblRate = parseFloat(accom.dblRate) || 0;
                  const sglRate = parseFloat(accom.sglRate) || 0;
                  const hbRate = parseFloat(accom.hbRate) || 0;
                  
                  // Simple sum of the three rates
                  total += dblRate + sglRate + hbRate;
                });
                
                return total;
              } catch (error) {
                console.error("Error calculating total:", error);
                return 0;
              }
            };
            
            // Function to update option total cost
            const updateOptionTotalCost = () => {
              if (activeTab !== "actual" || !actualRatesQuote) return;
              
              try {
                const total = calculateTotal();
                
                // Update the option's total cost
                const newActualRates = JSON.parse(JSON.stringify(actualRatesQuote));
                newActualRates.quotations[index].options[optIdx].totalCost = total.toFixed(2);
                setActualRatesQuote(newActualRates);
              } catch (error) {
                console.error("Error updating option total cost:", error);
              }
            };
            
            return (
              <div key={optIdx} style={{
                marginTop: 15,
                marginBottom: 20,
                backgroundColor: "#2a1f1f",
                padding: 15,
                borderRadius: 8,
                border: "1px solid #444"
              }}>
                <h4 style={{ color: "#FFD700", margin: "0 0 10px 0" }}>Option {optIdx + 1} Hotel Details</h4>
                
                {option.accommodations.map((accom, accomIdx) => {
                  return (
                    <div key={accomIdx} style={{
                      marginBottom: 10,
                      backgroundColor: "#1f1f1f",
                      padding: 10,
                      borderRadius: 6
                    }}>
                      <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
                        {accom.hotelName || 'Hotel'} ({accom.city || 'City'}, {accom.stars || 'N/A'} stars)
                      </p>
                      
                      {/* Editable hotel rates */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 10 }}>
                        {activeTab === "actual" ? (
                          // Actual rates tab - use separate inputs with direct state access
                          <>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>DBL B/B Rate:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>SGL Rate:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3, color: "#28a745" }}>H/B Supplement:</label>
                              <input
                                type="number"
                                value={actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate || ''}
                                onChange={(e) => {
                                  // Direct state update without cloning
                                  actualRatesQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate = e.target.value;
                                  // Force re-render
                                  setActualRatesQuote({...actualRatesQuote});
                                  // Update total
                                  updateOptionTotalCost();
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "2px solid #28a745",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          // Original quotation tab
                          <>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>DBL B/B Rate:</label>
                              <input
                                type="number"
                                value={accom.dblRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].dblRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>SGL Rate:</label>
                              <input
                                type="number"
                                value={accom.sglRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].sglRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 14, display: "block", marginBottom: 3 }}>H/B Supplement:</label>
                              <input
                                type="number"
                                value={accom.hbRate || ''}
                                onChange={(e) => {
                                  const newQuote = JSON.parse(JSON.stringify(quote));
                                  newQuote.quotations[index].options[optIdx].accommodations[accomIdx].hbRate = e.target.value;
                                  setQuote(newQuote);
                                }}
                                style={{
                                  padding: 8,
                                  borderRadius: 4,
                                  border: "1px solid #444",
                                  backgroundColor: "#2a2a2a",
                                  color: "#fff",
                                  width: "100%"
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Special comment if exists */}
                      {accom.specialComment && (
                        <p style={{ margin: "10px 0 0 0", color: "#FFD700" }}>
                          <strong>Comment:</strong> {accom.specialComment}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {/* Option total cost */}
                <div style={{ marginTop: 15, backgroundColor: "#004D40", padding: 10, borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>Total Cost:</span>
                    {activeTab === "actual" ? (
                      <div style={{
                        padding: 8,
                        borderRadius: 4,
                        backgroundColor: "#00796B",
                        color: "#fff",
                        width: "120px",
                        fontWeight: "bold",
                        textAlign: "center"
                      }}>
                        {Number(option.totalCost ?? 0).toFixed(2)}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={option.totalCost || ''}
                        onChange={(e) => {
                          const newQuote = JSON.parse(JSON.stringify(quote)); // Deep clone
                          newQuote.quotations[index].options[optIdx].totalCost = e.target.value;
                          setQuote(newQuote);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: "1px solid #006064",
                          backgroundColor: "#00796B",
                          color: "#fff",
                          width: "120px",
                          fontWeight: "bold"
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={() => navigate("/quotations/quotations-list")}
          style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
        >
          Back to Quotations List
        </button>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  borderBottom: "2px solid #444",
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#1f1f1f",
  color: "white"
};

const tableRowStyle = {
  borderBottom: "1px solid #444",
};

const tableCellStyle = {
  padding: "12px",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 16px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  minHeight: "44px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  fontSize: "14px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
};

const specialBadgeStyle = {
  backgroundColor: "#FFD700",
  color: "#000",
  padding: "3px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "bold"
};

const specialSectionStyle = {
  backgroundColor: "#1f1f1f",
  border: "1px solid #FFD700",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "20px"
};
