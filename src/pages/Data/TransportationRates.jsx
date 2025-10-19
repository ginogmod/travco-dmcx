import React, { useEffect, useState } from "react";
import "./Data.css";

function TransportationRates() {
  const [rates, setRates] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', success: true });

  useEffect(() => {
    fetch("/data/transportRates.json")
      .then((res) => res.json())
      .then(setRates)
      .catch((err) => console.error("Failed to load transportation rates", err));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus({ show: false, message: '', success: true });
    
    // First save to the server API
    fetch("http://localhost:3001/api/saveTransportationRates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rates),
    })
      .then((res) => {
        if (!res.ok) {
          setSaveStatus({
            show: true,
            message: 'Failed to save transportation rates to server',
            success: false
          });
          setIsSaving(false);
          return;
        }
        
        // Also update the local JSON file directly to ensure immediate updates
        return fetch("/data/transportRates.json", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rates),
        });
      })
      .then((res) => {
        setIsSaving(false);
        if (res && !res.ok) {
          setSaveStatus({
            show: true,
            message: 'Saved to server but failed to update local file',
            success: false
          });
        } else if (res) {
          setSaveStatus({
            show: true,
            message: 'Transportation rates updated successfully! Changes will be reflected in quotations.',
            success: true
          });
          
          // Hide the status message after 5 seconds
          setTimeout(() => {
            setSaveStatus(prev => ({ ...prev, show: false }));
          }, 5000);
        }
      })
      .catch((error) => {
        setIsSaving(false);
        setSaveStatus({
          show: true,
          message: `Error saving transportation rates: ${error.message}`,
          success: false
        });
      });
  };

  const handleChange = (service, vehicle, value) => {
    setRates(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [vehicle]: Number(value),
      },
    }));
  };

  const vehicleTypes = ["car", "minivan", "unionvan", "van10", "small", "medium", "large"];
  const serviceTypes = ["Full Day", "Half Day", "Stopover", "Cruise", "Transfer"];

  return (
    <div className="data-container">
      <h2>
        Transportation Rates
        {isSaving && (
          <span style={{
            fontSize: 14,
            marginLeft: 15,
            backgroundColor: "#004D40",
            padding: "4px 8px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #fff',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}></span>
            Saving changes...
          </span>
        )}
      </h2>
      
      {saveStatus.show && (
        <div style={{
          padding: "10px 15px",
          marginBottom: "20px",
          borderRadius: "4px",
          backgroundColor: saveStatus.success ? "#004D40" : "#B71C1C",
          color: "white"
        }}>
          {saveStatus.message}
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="actions">
        <button onClick={handleSave}>Save</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            {vehicleTypes.map(v => <th key={v}>{v}</th>)}
          </tr>
        </thead>
        <tbody>
          {serviceTypes.map(service => (
            <tr key={service}>
              <td>{service}</td>
              {vehicleTypes.map(vehicle => (
                <td key={vehicle}>
                  <input
                    type="number"
                    value={rates[service]?.[vehicle] || 0}
                    onChange={(e) => handleChange(service, vehicle, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransportationRates;