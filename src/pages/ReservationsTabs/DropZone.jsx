import React, { useState } from 'react';

function DropZone({ onFileDrop }) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          console.log("Parsed JSON data:", data);
          
          // Add debugging to see the structure of the JSON
          console.log("JSON structure:", Object.keys(data));
          
          // Check for empty fields before passing data to parent
          const emptyFieldsList = checkEmptyFields(data);
          console.log("Empty fields detected in handleDrop:", emptyFieldsList);
          
          // Pass both the data and empty fields to parent
          console.log("Calling onFileDrop with data:", data);
          onFileDrop(data, emptyFieldsList);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert(`Invalid JSON file: ${error.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please drop a valid JSON file.");
    }
  };

  // Function to check for empty fields in the dropped JSON
  const checkEmptyFields = (data) => {
    const emptyFields = [];
    
    console.log("Checking empty fields in data:", data);
    
    // Check common reservation fields
    if (!data.group && !data.groupName) emptyFields.push('groupName');
    if (!data.agent && !data.agentName) emptyFields.push('agent');
    if (!data.nationality) emptyFields.push('nationality');
    if (!data.arrivalDate && !data.dateArr) emptyFields.push('dateArr');
    if (!data.departureDate && !data.dateDep) emptyFields.push('dateDep');
    if (!data.pax) emptyFields.push('pax');
    
    // Check for empty hotel data
    if (data.hotels && Array.isArray(data.hotels)) {
      data.hotels.forEach((hotel, index) => {
        if (!hotel.name) emptyFields.push(`Hotels[${index}].hotelName`);
        if (!hotel.checkIn) emptyFields.push(`Hotels[${index}].checkIn`);
        if (!hotel.checkOut) emptyFields.push(`Hotels[${index}].checkOut`);
        if (!hotel.roomType) emptyFields.push(`Hotels[${index}].roomType`);
        if (!hotel.mealPlan) emptyFields.push(`Hotels[${index}].meal`);
      });
    }
    
    // Check for empty ArrDep data
    if (data.arrivalDate || data.dateArr) {
      const arrIndex = 0; // First row is typically arrival
      if (!data.arrivalFrom) emptyFields.push(`ArrDep[${arrIndex}].from`);
      if (!data.arrivalTo) emptyFields.push(`ArrDep[${arrIndex}].to`);
      if (!data.arrivalFlight) emptyFields.push(`ArrDep[${arrIndex}].flight`);
      if (!data.arrivalTime) emptyFields.push(`ArrDep[${arrIndex}].time`);
    }
    
    if (data.departureDate || data.dateDep) {
      const depIndex = 1; // Second row is typically departure
      if (!data.departureFrom) emptyFields.push(`ArrDep[${depIndex}].from`);
      if (!data.departureTo) emptyFields.push(`ArrDep[${depIndex}].to`);
      if (!data.departureFlight) emptyFields.push(`ArrDep[${depIndex}].flight`);
      if (!data.departureTime) emptyFields.push(`ArrDep[${depIndex}].time`);
    }
    
    console.log("Empty fields detected:", emptyFields);
    return emptyFields;
  };

  const dropZoneStyle = {
    border: `2px dashed ${dragging ? '#007bff' : '#aaa'}`,
    borderRadius: '10px',
    padding: '40px',
    textAlign: 'center',
    color: '#aaa',
    backgroundColor: dragging ? '#333' : '#222',
    transition: 'all 0.3s ease',
    marginTop: '20px',
    cursor: 'pointer'
  };

  return (
    <div
      style={dropZoneStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Drag and drop the confirmed reservation JSON file here.</p>
      <p style={{ fontSize: '0.8em', marginTop: '10px' }}>Empty fields will be highlighted in red</p>
    </div>
  );
}

export default DropZone;