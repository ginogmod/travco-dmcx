import React, { useState, useEffect } from "react";
import "./Tabs.css";

function Supplements({ seasons, onSupplementsChange }) {
  const [supplements, setSupplements] = useState([]);
  const [supplementsNotes, setSupplementsNotes] = useState("");

  // Initialize with a default empty supplement row
  useEffect(() => {
    const initialSupplements = [
      {
        id: Math.random().toString(36).substr(2, 9),
        fromDate: "",
        toDate: "",
        days: "",
        name: "",
        adultRate: "",
        child2to6Rate: "",
        child6to12Rate: "",
        isOptional: false,
        isPerPerson: true,
        isPerRoom: false,
        alert: "",
        notes: ""
      }
    ];
    
    setSupplements(initialSupplements);
  }, []);

  // Notify parent component when data changes
  useEffect(() => {
    if (onSupplementsChange && supplements.length > 0) {
      onSupplementsChange({
        supplements: supplements,
        supplementsNotes: supplementsNotes
      });
    }
  }, [supplements, supplementsNotes, onSupplementsChange]);

  const handleSupplementChange = (index, field, value) => {
    const updatedSupplements = [...supplements];
    
    // For checkbox fields, toggle the boolean value
    if (['isOptional', 'isPerPerson', 'isPerRoom'].includes(field)) {
      updatedSupplements[index][field] = !updatedSupplements[index][field];
    }
    // For numeric fields, validate input
    else if (['adultRate', 'child2to6Rate', 'child6to12Rate'].includes(field)) {
      // Allow only positive numbers with up to 2 decimal places
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        updatedSupplements[index][field] = value;
      } else {
        return; // Invalid input, don't update
      }
    }
    // For days field, validate as integer
    else if (field === 'days') {
      // Allow only positive integers
      if (value === '' || /^[0-9]\d*$/.test(value)) {
        updatedSupplements[index][field] = value;
      } else {
        return; // Invalid input, don't update
      }
    }
    else {
      updatedSupplements[index][field] = value;
    }
    
    setSupplements(updatedSupplements);
  };

  const addSupplement = () => {
    const newSupplement = {
      id: Math.random().toString(36).substr(2, 9),
      fromDate: "",
      toDate: "",
      days: "",
      name: "",
      adultRate: "",
      child2to6Rate: "",
      child6to12Rate: "",
      isOptional: false,
      isPerPerson: true,
      isPerRoom: false,
      alert: "",
      notes: ""
    };
    
    setSupplements([...supplements, newSupplement]);
  };

  const removeSupplement = (index) => {
    if (supplements.length === 1) {
      // Don't remove the last supplement, just clear it
      const clearedSupplement = {
        id: Math.random().toString(36).substr(2, 9),
        fromDate: "",
        toDate: "",
        days: "",
        name: "",
        adultRate: "",
        child2to6Rate: "",
        child6to12Rate: "",
        isOptional: false,
        isPerPerson: true,
        isPerRoom: false,
        alert: "",
        notes: ""
      };
      
      setSupplements([clearedSupplement]);
      return;
    }
    
    const updatedSupplements = supplements.filter((_, i) => i !== index);
    setSupplements(updatedSupplements);
  };

  return (
    <div className="supplements-tab">
      <div className="rates-container">
        <div className="rates-table-container">
          <h2 className="section-title">Supplements</h2>
          
          <table className="rates-table">
            <thead>
              <tr className="rates-header">
                <th colSpan="2">Accommodation Date</th>
                <th rowSpan="2">Days</th>
                <th rowSpan="2">Name</th>
                <th colSpan="3">Supplements</th>
                <th rowSpan="2">Optional</th>
                <th rowSpan="2">Per Person</th>
                <th rowSpan="2">Per Room</th>
                <th rowSpan="2">Alert</th>
                <th rowSpan="2">Notes</th>
                <th rowSpan="2">Actions</th>
              </tr>
              <tr className="rates-header">
                <th>From Date</th>
                <th>To Date</th>
                <th>Adult</th>
                <th>Child 2-6</th>
                <th>Child 6-12</th>
              </tr>
            </thead>
            <tbody>
              {supplements.map((supplement, index) => (
                <tr key={supplement.id}>
                  <td>
                    <input
                      type="date"
                      value={supplement.fromDate}
                      onChange={(e) => handleSupplementChange(index, 'fromDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={supplement.toDate}
                      onChange={(e) => handleSupplementChange(index, 'toDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.days}
                      onChange={(e) => handleSupplementChange(index, 'days', e.target.value)}
                      placeholder="Days"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.name}
                      onChange={(e) => handleSupplementChange(index, 'name', e.target.value)}
                      placeholder="Supplement Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.adultRate}
                      onChange={(e) => handleSupplementChange(index, 'adultRate', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.child2to6Rate}
                      onChange={(e) => handleSupplementChange(index, 'child2to6Rate', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.child6to12Rate}
                      onChange={(e) => handleSupplementChange(index, 'child6to12Rate', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={supplement.isOptional}
                      onChange={() => handleSupplementChange(index, 'isOptional')}
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={supplement.isPerPerson}
                      onChange={() => handleSupplementChange(index, 'isPerPerson')}
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={supplement.isPerRoom}
                      onChange={() => handleSupplementChange(index, 'isPerRoom')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.alert}
                      onChange={(e) => handleSupplementChange(index, 'alert', e.target.value)}
                      placeholder="Alert"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={supplement.notes}
                      onChange={(e) => handleSupplementChange(index, 'notes', e.target.value)}
                      placeholder="Notes"
                    />
                  </td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => removeSupplement(index)}
                      title="Remove Supplement"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="add-season-section">
            <button className="add-button" onClick={addSupplement}>
              + Add Supplement
            </button>
          </div>

          <h2 className="section-title">Supplements Notes</h2>
          <textarea
            className="supplements-notes"
            value={supplementsNotes}
            onChange={(e) => setSupplementsNotes(e.target.value)}
            placeholder="Enter any additional notes about supplements here..."
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
          <h3>Supplements Options</h3>
          
          <div className="options-section">
            <h4>Common Supplements</h4>
            <button
              className="import-button"
              onClick={() => {
                const commonSupplements = [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    fromDate: "",
                    toDate: "",
                    days: "",
                    name: "Gala Dinner",
                    adultRate: "",
                    child2to6Rate: "",
                    child6to12Rate: "",
                    isOptional: true,
                    isPerPerson: true,
                    isPerRoom: false,
                    alert: "",
                    notes: "New Year's Eve"
                  }
                ];
                setSupplements([...supplements, ...commonSupplements]);
              }}
            >
              Add Gala Dinner
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
              Show All Supplements
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={true}
                readOnly
              />
              Group by Date Range
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Supplements;