import React, { useState, useEffect } from "react";
import "./Tabs.css";

function SpecialPromotions({ seasons = [], onPromotionsChange }) {
  const [promotions, setPromotions] = useState([]);
  const [promotionsNotes, setPromotionsNotes] = useState("");

  // Initialize with a default empty promotion row
  useEffect(() => {
    const initialPromotions = [
      {
        id: Math.random().toString(36).substr(2, 9),
        season: "",
        fromDate: "",
        toDate: "",
        days: "",
        salesFromDate: "",
        salesToDate: "",
        minStay: "",
        alert: "",
        notes: ""
      }
    ];
    
    setPromotions(initialPromotions);
  }, []);

  // Notify parent component when data changes
  useEffect(() => {
    if (onPromotionsChange && promotions.length > 0) {
      onPromotionsChange({
        promotions: promotions,
        promotionsNotes: promotionsNotes
      });
    }
  }, [promotions, promotionsNotes, onPromotionsChange]);

  const handlePromotionChange = (index, field, value) => {
    const updatedPromotions = [...promotions];
    updatedPromotions[index][field] = value;

    // Calculate days if from and to dates are provided
    if (field === 'fromDate' || field === 'toDate') {
      const fromDate = field === 'fromDate' ? value : updatedPromotions[index].fromDate;
      const toDate = field === 'toDate' ? value : updatedPromotions[index].toDate;
      
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
        updatedPromotions[index].days = days > 0 ? days : 0;
      }
    }
    
    setPromotions(updatedPromotions);
  };

  const addPromotion = () => {
    const newPromotion = {
      id: Math.random().toString(36).substr(2, 9),
      season: "",
      fromDate: "",
      toDate: "",
      days: "",
      salesFromDate: "",
      salesToDate: "",
      minStay: "",
      alert: "",
      notes: ""
    };
    
    setPromotions([...promotions, newPromotion]);
  };

  const removePromotion = (index) => {
    if (promotions.length === 1) {
      // Don't remove the last promotion, just clear it
      const clearedPromotion = {
        id: Math.random().toString(36).substr(2, 9),
        season: "",
        fromDate: "",
        toDate: "",
        days: "",
        salesFromDate: "",
        salesToDate: "",
        minStay: "",
        alert: "",
        notes: ""
      };
      
      setPromotions([clearedPromotion]);
      return;
    }
    
    const updatedPromotions = promotions.filter((_, i) => i !== index);
    setPromotions(updatedPromotions);
  };

  return (
    <div className="special-promotions-tab">
      <div className="rates-container">
        <div className="rates-table-container">
          <h2 className="section-title">Seasonality</h2>
          
          <table className="rates-table">
            <thead>
              <tr className="rates-header">
                <th>Season</th>
                <th colSpan="2">Accommodation Date</th>
                <th>Days</th>
                <th colSpan="2">Sales Date</th>
                <th>Min. Stay</th>
                <th>Alert</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
              <tr className="rates-header">
                <th></th>
                <th>From Date</th>
                <th>To Date</th>
                <th></th>
                <th>From Date</th>
                <th>To Date</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion, index) => (
                <tr key={promotion.id}>
                  <td>
                    <input
                      type="text"
                      value={promotion.season}
                      onChange={(e) => handlePromotionChange(index, 'season', e.target.value)}
                      placeholder="Season"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={promotion.fromDate}
                      onChange={(e) => handlePromotionChange(index, 'fromDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={promotion.toDate}
                      onChange={(e) => handlePromotionChange(index, 'toDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={promotion.days}
                      onChange={(e) => handlePromotionChange(index, 'days', e.target.value)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={promotion.salesFromDate}
                      onChange={(e) => handlePromotionChange(index, 'salesFromDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={promotion.salesToDate}
                      onChange={(e) => handlePromotionChange(index, 'salesToDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={promotion.minStay}
                      onChange={(e) => handlePromotionChange(index, 'minStay', e.target.value)}
                      placeholder="Min Stay"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={promotion.alert}
                      onChange={(e) => handlePromotionChange(index, 'alert', e.target.value)}
                      placeholder="Alert"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={promotion.notes}
                      onChange={(e) => handlePromotionChange(index, 'notes', e.target.value)}
                      placeholder="Notes"
                    />
                  </td>
                  <td>
                    <button 
                      className="remove-button"
                      onClick={() => removePromotion(index)}
                      title="Remove Promotion"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="add-season-section">
            <button className="add-button" onClick={addPromotion}>
              + Add Promotion
            </button>
          </div>

          <h2 className="section-title">Special Promotions Notes</h2>
          <textarea
            className="supplements-notes"
            value={promotionsNotes}
            onChange={(e) => setPromotionsNotes(e.target.value)}
            placeholder="Enter any additional notes about special promotions here..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2a2a2a',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '4px',
              marginBottom: '20px'
            }}
          />
        </div>
        
        <div className="rates-options">
          <h3>Promotions Options</h3>
          
          <div className="options-section">
            <h4>Common Promotions</h4>
            <button
              className="import-button"
              onClick={() => {
                const commonPromotions = [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    season: "High Season",
                    fromDate: "",
                    toDate: "",
                    days: "",
                    salesFromDate: "",
                    salesToDate: "",
                    minStay: "3",
                    alert: "",
                    notes: "Early booking discount"
                  }
                ];
                setPromotions([...promotions, ...commonPromotions]);
              }}
            >
              Add Early Booking
            </button>
          </div>
          
          <div className="options-section">
            <h4>Display Options</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={true}
                readOnly
              />
              Show All Promotions
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={true}
                readOnly
              />
              Group by Season
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialPromotions;