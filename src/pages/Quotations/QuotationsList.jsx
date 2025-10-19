import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllFromStorage, deleteFromStorage } from "../../assets/utils/storage";
import { generateExcel } from "../../assets/utils/generateExcel";

export default function QuotationsList() {
  const [quotations, setQuotations] = useState([]);
  const [confirmedOffers, setConfirmedOffers] = useState({});
  const [actualRatesQuotations, setActualRatesQuotations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all quotations
        const quotationsData = await getAllFromStorage("quotations");
        
        // Filter out actual rates quotations and group series quotations from the main list
        const originalQuotations = quotationsData.filter(q => !q.isActualRates && !q.isGroupSeries);
        setQuotations(originalQuotations || []);
        
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
        
        // Find actual rates quotations
        const actualRatesMap = {};
        quotationsData.forEach(quotation => {
          if (quotation.isActualRates && quotation.originalQuotationId) {
            actualRatesMap[quotation.originalQuotationId] = quotation;
          }
        });
        
        setActualRatesQuotations(actualRatesMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setQuotations([]);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await deleteFromStorage("quotations", id);
        // Refresh the quotations list after deletion
        const updatedQuotations = await getAllFromStorage("quotations");
        // Filter out actual rates quotations and group series quotations
        const filteredQuotations = updatedQuotations.filter(q => !q.isActualRates && !q.isGroupSeries);
        setQuotations(filteredQuotations || []);
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
    }));
    generateExcel(dataToExport, "quotations.xlsx");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Saved Quotations</h1>
      </div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Link to="/quotations/quotations" style={buttonStyle}>
          Add New Quotation
        </Link>
        <Link to="/quotations/special-quotations" style={specialButtonStyle}>
          Add Special Quotation
        </Link>
      </div>
      {quotations.map(quote => {
        const hasConfirmedOffer = confirmedOffers[quote.id];
        const hasActualRates = actualRatesQuotations[quote.id];
        
        return (
          <div key={quote.id} style={{
            ...itemStyle,
            backgroundColor: quote.isSpecial ? "#2a1f1f" : "#1f1f1f",
            borderLeft: quote.isSpecial ? "4px solid #FFD700" :
                       hasConfirmedOffer ? "4px solid #28a745" : "none",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ margin: 0 }}>{quote.group}</h3>
                {quote.isSpecial && (
                  <span style={specialBadgeStyle}>VIP</span>
                )}
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
                {hasConfirmedOffer && hasActualRates && (
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
              <p style={{ margin: 0, color: "#aaa" }}>{new Date(quote.createdAt).toLocaleString()}</p>
              {quote.isSpecial && quote.specialNotes && (
                <p style={{ margin: "5px 0 0 0", color: "#FFD700", fontSize: "14px" }}>
                  <strong>Notes:</strong> {quote.specialNotes}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to={hasConfirmedOffer && hasActualRates
                  ? `/quotations/view/${quote.id}?showActualRates=true`
                  : `/quotations/view/${quote.id}`}
                style={quote.isSpecial ? specialButtonStyle : buttonStyle}
              >
                View Quotation
              </Link>
              <button onClick={() => handleDelete(quote.id)} style={deleteButtonStyle}>
                Delete
              </button>
            </div>
          </div>
        );
      })}
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

const specialBadgeStyle = {
  backgroundColor: "#FFD700",
  color: "#000",
  padding: "3px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "bold"
};

const specialButtonStyle = {
  backgroundColor: "#FFD700",
  color: "#000",
  padding: "10px 15px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold"
};
