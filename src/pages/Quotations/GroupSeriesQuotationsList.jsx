import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFromStorage, deleteFromStorage } from "../../assets/utils/storage";
import { generateExcel } from "../../assets/utils/generateExcel";

export default function GroupSeriesQuotationsList() {
  const [quotations, setQuotations] = useState([]);
  const [confirmedOffers, setConfirmedOffers] = useState({});
  const [actualRatesQuotations, setActualRatesQuotations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all quotations
        const quotationsData = await getAllFromStorage("quotations");
        
        // Filter only Group Series quotations and exclude actual rates quotations
        const groupSeriesQuotations = quotationsData.filter(q =>
          q.isGroupSeries && !q.isActualRates
        );
        
        console.log("Found Group Series quotations:", groupSeriesQuotations.length);
        setQuotations(groupSeriesQuotations || []);
        
        // Fetch all offers to check which ones are confirmed
        const offersData = await getAllFromStorage("offers");
        const confirmedOffersMap = {};
        
        // Create a map of quotationId -> confirmedOffer
        offersData.forEach(offer => {
          if (offer.isConfirmed && offer.quotationId) {
            confirmedOffersMap[offer.quotationId] = offer;
          }
        });
        
        setConfirmedOffers(confirmedOffersMap);
        
        // Find actual rates quotations for Group Series
        const actualRatesMap = {};
        quotationsData.forEach(quotation => {
          if (quotation.isActualRates && quotation.originalQuotationId && quotation.isGroupSeries) {
            actualRatesMap[quotation.originalQuotationId] = quotation;
          }
        });
        
        console.log("Found actual rates quotations:", Object.keys(actualRatesMap).length);
        setActualRatesQuotations(actualRatesMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setQuotations([]);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this group series quotation?")) {
      try {
        await deleteFromStorage("quotations", id);
        
        // Refresh the quotations list after deletion
        const updatedQuotations = await getAllFromStorage("quotations");
        
        // Filter only Group Series quotations and exclude actual rates
        const groupSeriesQuotations = updatedQuotations.filter(q =>
          q.isGroupSeries && !q.isActualRates
        );
        
        setQuotations(groupSeriesQuotations || []);
        
        // Also delete any actual rates quotation associated with this one
        const actualRatesId = Object.entries(actualRatesQuotations)
          .find(([originalId]) => String(originalId) === String(id))?.[1]?.id;
          
        if (actualRatesId) {
          console.log("Also deleting associated actual rates quotation:", actualRatesId);
          await deleteFromStorage("quotations", actualRatesId);
        }
        
        // Refresh the actual rates map from latest storage after any deletions
        const latestQuotations = await getAllFromStorage("quotations");
        const actualRatesMap = {};
        latestQuotations.forEach(quotation => {
          if (quotation.isActualRates && quotation.originalQuotationId && quotation.isGroupSeries) {
            actualRatesMap[quotation.originalQuotationId] = quotation;
          }
        });
        
        setActualRatesQuotations(actualRatesMap);
      } catch (error) {
        console.error("Error deleting quotation:", error);
        alert("Failed to delete quotation. Please try again.");
      }
    }
  };

  const handleDownload = () => {
    const dataToExport = quotations.map(q => ({
      "Group Name": q.group || "N/A",
      "Created At": new Date(q.createdAt).toLocaleString(),
      "ID": q.id,
      "Validity Dates": q.validityDates ? q.validityDates.map(d => `${d.from} to ${d.to}`).join(", ") : "N/A"
    }));
    generateExcel(dataToExport, "group_series_quotations.xlsx");
  };

  const formatValidityDates = (validityDates) => {
    if (!validityDates || !Array.isArray(validityDates) || validityDates.length === 0) {
      return "No validity dates";
    }
    
    return validityDates.map((date, index) => (
      <div key={index} style={{ marginBottom: "5px" }}>
        {date.from} to {date.to}
      </div>
    ));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Group Series Quotations</h1>
        <button 
          onClick={handleDownload}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 15px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Export to Excel
        </button>
      </div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Link to="/quotations/group-series-creator" style={buttonStyle}>
          Add New Group Series Quotation
        </Link>
      </div>
      {quotations.length === 0 ? (
        <div style={{ padding: "20px", backgroundColor: "#1f1f1f", borderRadius: "8px", textAlign: "center" }}>
          <p>No group series quotations found. Create your first one!</p>
        </div>
      ) : (
        quotations.map(quote => {
          // Debug the quotation object
          console.log("Rendering quotation:", quote);
          console.log("Quotation ID:", quote.id, "Type:", typeof quote.id);
          
          const hasConfirmedOffer = confirmedOffers[quote.id];
          const hasActualRates = actualRatesQuotations[quote.id];
          
          return (
            <div key={quote.id} style={{
              ...itemStyle,
              borderLeft: hasConfirmedOffer ? "4px solid #28a745" : "4px solid #007bff",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ margin: 0 }}>{quote.group}</h3>
                  <span style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    GROUP SERIES
                  </span>
                  {hasConfirmedOffer && (
                    <span style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      CONFIRMED
                    </span>
                  )}
                  {hasActualRates && (
                    <span style={{
                      backgroundColor: "#17a2b8",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginLeft: "5px"
                    }}>
                      HAS ACTUAL RATES
                    </span>
                  )}
                </div>
                <p style={{ margin: "5px 0", color: "#aaa" }}>{new Date(quote.createdAt).toLocaleString()}</p>
                <div style={{ margin: "10px 0", padding: "10px", backgroundColor: "#2a2a2a", borderRadius: "4px" }}>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>Validity Dates:</p>
                  {formatValidityDates(quote.validityDates)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {/* Debug the URL and use a fallback navigation */}
                {(() => {
                  const url = hasConfirmedOffer && hasActualRates
                    ? `/quotations/group-series-view/${quote.id}?showActualRates=true`
                    : `/quotations/group-series-view/${quote.id}`;
                  console.log("Generated URL:", url);
                  return (
                    <Link
                      to={url}
                      style={buttonStyle}
                      onClick={(e) => {
                        console.log("Link clicked with URL:", url);
                        // Add a direct navigation as a fallback
                        if (quote.id) {
                          console.log("Using direct navigation as fallback");
                          e.preventDefault();
                          window.location.href = url;
                        }
                      }}
                    >
                      View Quotation
                    </Link>
                  );
                })()}
                <Link
                  to="/quotations/group-series-creator"
                  style={{...buttonStyle, backgroundColor: "#ffc107", color: "#000"}}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Edit button clicked for quotation:", quote.id);
                    
                    // Prepare the state data to pass to the quotation creation page
                    const stateData = {
                      editMode: true,
                      id: quote.id,
                      quotationData: quote,
                      // Include the itinerary data explicitly
                      itineraryData: quote.itinerary || [],
                      // Include any other necessary data
                      fromListPage: true
                    };
                    
                    console.log("Navigating to group series creator with state:", stateData);
                    
                    // Use direct navigation with state as a fallback
                    // This ensures the state is properly passed even if React Router has issues
                    window.location.href = `/quotations/group-series-creator?id=${quote.id}&edit=true`;
                    
                    // Store the state in sessionStorage for retrieval in the creator page
                    sessionStorage.setItem('groupSeriesEditState', JSON.stringify(stateData));
                  }}
                >
                  Edit Quotation
                </Link>
                <button onClick={() => handleDelete(quote.id)} style={deleteButtonStyle}>
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

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