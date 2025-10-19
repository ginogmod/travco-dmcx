import React, { useState, useEffect } from "react";
import "./Tabs.css";

function HigherRooms({ seasons, onHigherRoomsChange }) {
  const [higherRoomsData, setHigherRoomsData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [options, setOptions] = useState({
    pricesPerRoom: false
  });

  // Initialize higher rooms data
  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const initialHigherRoomsData = [
        {
          id: Math.random().toString(36).substr(2, 9),
          roomType: "Superior",
          season: "",
          per: "Per",
          single: "",
          double: "",
          triple: "",
          freeBB: false,
          supplement: {
            value: "",
            isPercentage: false
          }
        }
      ];
      
      setHigherRoomsData(initialHigherRoomsData);
    } else {
      // If no seasons provided, create a default entry
      const defaultData = [
        {
          id: Math.random().toString(36).substr(2, 9),
          roomType: "Superior",
          season: "",
          per: "Per",
          single: "",
          double: "",
          triple: "",
          freeBB: false,
          supplement: {
            value: "",
            isPercentage: false
          }
        }
      ];
      
      setHigherRoomsData(defaultData);
    }
  }, [seasons]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onHigherRoomsChange && higherRoomsData.length > 0) {
      onHigherRoomsChange({
        higherRooms: higherRoomsData,
        options: options
      });
    }
  }, [higherRoomsData, options, onHigherRoomsChange]);

  const handleOptionChange = (option) => {
    setOptions({
      ...options,
      [option]: !options[option]
    });
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRoomsData = [...higherRoomsData];
    
    // Handle checkbox for freeBB
    if (field === 'freeBB') {
      updatedRoomsData[index][field] = !updatedRoomsData[index][field];
    } 
    // Handle supplement object
    else if (field === 'supplementValue') {
      // Allow empty string or numeric values only
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        updatedRoomsData[index].supplement.value = value;
      } else {
        return; // Invalid input, don't update
      }
    } 
    else if (field === 'supplementIsPercentage') {
      updatedRoomsData[index].supplement.isPercentage = !updatedRoomsData[index].supplement.isPercentage;
    }
    // Handle other fields
    else {
      // For numeric fields, validate input
      if (['single', 'double', 'triple'].includes(field)) {
        // Allow empty string or numeric values only
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
          updatedRoomsData[index][field] = value;
        } else {
          return; // Invalid input, don't update
        }
      } else {
        updatedRoomsData[index][field] = value;
      }
    }
    
    setHigherRoomsData(updatedRoomsData);
  };

  const addRoomType = () => {
    const newRoomType = {
      id: Math.random().toString(36).substr(2, 9),
      roomType: "",
      season: selectedSeason || "",
      per: "Per",
      single: "",
      double: "",
      triple: "",
      freeBB: false,
      supplement: {
        value: "",
        isPercentage: false
      }
    };
    
    setHigherRoomsData([...higherRoomsData, newRoomType]);
    setSelectedSeason("");
  };

  const removeRoomType = (index) => {
    if (higherRoomsData.length === 1) {
      // Don't remove the last room type, just clear it
      const clearedRoomType = {
        id: Math.random().toString(36).substr(2, 9),
        roomType: "",
        season: "",
        per: "Per",
        single: "",
        double: "",
        triple: "",
        freeBB: false,
        supplement: {
          value: "",
          isPercentage: false
        }
      };
      
      setHigherRoomsData([clearedRoomType]);
      return;
    }
    
    const updatedRoomsData = higherRoomsData.filter((_, i) => i !== index);
    setHigherRoomsData(updatedRoomsData);
  };

  return (
    <div className="higher-rooms-tab">
      <div className="rates-container">
        <div className="rates-table-container">
          <h2 className="section-title">Higher Categories Rooms Per Room</h2>
          
          <div className="checkbox-container" style={{ marginBottom: '15px' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.pricesPerRoom}
                onChange={() => handleOptionChange('pricesPerRoom')}
              />
              Enter Prices Per Room
            </label>
          </div>
          
          <table className="rates-table">
            <thead>
              <tr className="rates-header">
                <th>Room Type</th>
                <th>Season</th>
                <th>Per</th>
                <th>Single</th>
                <th>Double</th>
                <th>Triple</th>
                <th>Free B.B</th>
                <th>Supp.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {higherRoomsData.map((room, index) => (
                <tr key={room.id}>
                  <td>
                    <input
                      type="text"
                      value={room.roomType}
                      onChange={(e) => handleRoomChange(index, 'roomType', e.target.value)}
                      placeholder="Room Type"
                    />
                  </td>
                  <td>
                    <select
                      value={room.season}
                      onChange={(e) => handleRoomChange(index, 'season', e.target.value)}
                    >
                      <option value="">All Seasons</option>
                      {seasons && seasons.map(season => (
                        <option key={season.id || season.name} value={season.name}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={room.per}
                      onChange={(e) => handleRoomChange(index, 'per', e.target.value)}
                    >
                      <option value="Per">Per</option>
                      <option value="Supp.">Supp.</option>
                      <option value="Total">Total</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={room.single}
                      onChange={(e) => handleRoomChange(index, 'single', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={room.double}
                      onChange={(e) => handleRoomChange(index, 'double', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={room.triple}
                      onChange={(e) => handleRoomChange(index, 'triple', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={room.freeBB}
                      onChange={() => handleRoomChange(index, 'freeBB')}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={room.supplement.value}
                        onChange={(e) => handleRoomChange(index, 'supplementValue', e.target.value)}
                        placeholder="0.00"
                        style={{ width: '60%' }}
                      />
                      <select
                        value={room.supplement.isPercentage ? "%" : "$"}
                        onChange={() => handleRoomChange(index, 'supplementIsPercentage')}
                        style={{ width: '40%', marginLeft: '5px' }}
                      >
                        <option value="$">$</option>
                        <option value="%">%</option>
                      </select>
                    </div>
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
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">All Seasons</option>
              {seasons && seasons.map(season => (
                <option key={season.id || season.name} value={season.name}>
                  {season.name}
                </option>
              ))}
            </select>
            <button className="add-button" onClick={addRoomType}>
              + Add Room Type
            </button>
          </div>
        </div>
        
        <div className="rates-options">
          <h3>Higher Room Options</h3>
          
          <div className="options-section">
            <h4>Room Categories</h4>
            <p>Common higher room categories:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
              <li>• Superior</li>
              <li>• Deluxe</li>
              <li>• Junior Suite</li>
              <li>• Executive</li>
              <li>• Family Room</li>
              <li>• Suite</li>
            </ul>
            <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#aaa' }}>
              Click "Add Room Type" to add these categories to your contract.
            </p>
          </div>
          
          <div className="options-section">
            <h4>Pricing Guide</h4>
            <p style={{ fontSize: '0.9em', color: '#aaa' }}>
              • "Per" - Base price for the room<br />
              • "Supp." - Supplement over standard room<br />
              • "Total" - Total price including all supplements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HigherRooms;