import React, { useState, useEffect } from "react";
import "./Tabs.css";

function Occupancy({ seasons, onOccupancyChange }) {
  const [roomTypes, setRoomTypes] = useState([]);
  const [options, setOptions] = useState({
    adultOccupancy: true,
    childOccupancy: true,
    infantOccupancy: false
  });

  // Initialize room types with a default Standard room
  useEffect(() => {
    const initialRoomTypes = [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "Standard",
        occupancy: "",
        maxAdult: 2,
        maxChild: 1,
        notes: ""
      }
    ];
    
    setRoomTypes(initialRoomTypes);
  }, []);

  // Notify parent component when data changes
  useEffect(() => {
    if (onOccupancyChange && roomTypes.length > 0) {
      onOccupancyChange({
        roomTypes: roomTypes,
        options: options
      });
    }
  }, [roomTypes, options, onOccupancyChange]);

  const handleOptionChange = (option) => {
    setOptions({
      ...options,
      [option]: !options[option]
    });
  };

  const handleRoomTypeChange = (index, field, value) => {
    const updatedRoomTypes = [...roomTypes];
    
    // For numeric fields, validate input
    if (['maxAdult', 'maxChild'].includes(field)) {
      // Allow only positive integers
      if (value === '' || /^[0-9]\d*$/.test(value)) {
        updatedRoomTypes[index][field] = value === '' ? '' : parseInt(value, 10);
      } else {
        return; // Invalid input, don't update
      }
    } else {
      updatedRoomTypes[index][field] = value;
    }
    
    setRoomTypes(updatedRoomTypes);
  };

  const addRoomType = () => {
    const newRoomType = {
      id: Math.random().toString(36).substr(2, 9),
      type: "",
      occupancy: "",
      maxAdult: "",
      maxChild: "",
      notes: ""
    };
    
    setRoomTypes([...roomTypes, newRoomType]);
  };

  const removeRoomType = (index) => {
    if (roomTypes.length === 1) {
      // Don't remove the last room type, just clear it
      const clearedRoomType = {
        id: Math.random().toString(36).substr(2, 9),
        type: "",
        occupancy: "",
        maxAdult: "",
        maxChild: "",
        notes: ""
      };
      
      setRoomTypes([clearedRoomType]);
      return;
    }
    
    const updatedRoomTypes = roomTypes.filter((_, i) => i !== index);
    setRoomTypes(updatedRoomTypes);
  };

  return (
    <div className="occupancy-tab">
      <div className="rates-container">
        <div className="rates-table-container">
          <h2 className="section-title">Rooms Occupancy and Notes</h2>
          
          <table className="rates-table">
            <thead>
              <tr className="rates-header">
                <th>Room Type</th>
                <th>Occupancy</th>
                <th>Max Adl.</th>
                <th>Max Chd.</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((roomType, index) => (
                <tr key={roomType.id}>
                  <td>
                    <input
                      type="text"
                      value={roomType.type}
                      onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                      placeholder="Room Type"
                    />
                  </td>
                  <td>
                    <select
                      value={roomType.occupancy}
                      onChange={(e) => handleRoomTypeChange(index, 'occupancy', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Quad">Quad</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={roomType.maxAdult}
                      onChange={(e) => handleRoomTypeChange(index, 'maxAdult', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={roomType.maxChild}
                      onChange={(e) => handleRoomTypeChange(index, 'maxChild', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={roomType.notes}
                      onChange={(e) => handleRoomTypeChange(index, 'notes', e.target.value)}
                      placeholder="Notes"
                    />
                  </td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => removeRoomType(index)}
                      title="Remove Room Type"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="add-season-section">
            <button className="add-button" onClick={addRoomType}>
              + Add Room Type
            </button>
          </div>
        </div>
        
        <div className="rates-options">
          <h3>Occupancy Options</h3>
          
          <div className="options-section">
            <h4>Occupancy Types</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.adultOccupancy}
                onChange={() => handleOptionChange('adultOccupancy')}
              />
              Adult Occupancy
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.childOccupancy}
                onChange={() => handleOptionChange('childOccupancy')}
              />
              Child Occupancy
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.infantOccupancy}
                onChange={() => handleOptionChange('infantOccupancy')}
              />
              Infant Occupancy
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Occupancy;