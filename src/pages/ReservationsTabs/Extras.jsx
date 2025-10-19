import { useState } from 'react';

function Extras({ fileNo }) {
  const [rows, setRows] = useState([
    {
      serviceName: '',
      supplier: '',
      notes: '',
      specialRates: '',
      itinerary: '',
      classification: '',
      date: '',
      day: '',
      time: '',
      status: '',
      pax: '',
      pickup: '',
      dropoff: '',
      invRec: false
    }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === 'date') {
      const dayName = new Date(value).toLocaleDateString('en-US', { weekday: 'long' });
      updated[index].day = dayName;
    }

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        serviceName: '',
        supplier: '',
        notes: '',
        specialRates: '',
        itinerary: '',
        classification: '',
        date: '',
        day: '',
        time: '',
        status: '',
        pax: '',
        pickup: '',
        dropoff: '',
        invRec: false
      }
    ]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Extras – File: {fileNo}</h2>
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            backgroundColor: '#1f1f1f',
            borderRadius: '10px',
            padding: '25px',
            marginBottom: '40px',
            border: '2px solid #888',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}
          >
            <div>
              <label>Service Name</label>
              <select
                value={row.serviceName}
                onChange={(e) => handleChange(index, 'serviceName', e.target.value)}
                style={dropdownStyle}
              >
                <option value="">Select</option>
                <option value="Camel Ride">Camel Ride</option>
                <option value="Cooking Class">Cooking Class</option>
              </select>
            </div>
            <div>
              <label>Supplier</label>
              <input
                type="text"
                value={row.supplier}
                onChange={(e) => handleChange(index, 'supplier', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Notes</label>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => handleChange(index, 'notes', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Special Rates</label>
              <input
                type="text"
                value={row.specialRates}
                onChange={(e) => handleChange(index, 'specialRates', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Itinerary</label>
              <input
                type="text"
                value={row.itinerary}
                onChange={(e) => handleChange(index, 'itinerary', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Classification</label>
              <input
                type="text"
                value={row.classification}
                onChange={(e) => handleChange(index, 'classification', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Date</label>
              <input
                type="date"
                value={row.date}
                onChange={(e) => handleChange(index, 'date', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Day</label>
              <input
                type="text"
                value={row.day}
                readOnly
                style={inputStyle}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={row.time}
                onChange={(e) => handleChange(index, 'time', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Status</label>
              <select
                value={row.status}
                onChange={(e) => handleChange(index, 'status', e.target.value)}
                style={dropdownStyle}
              >
                <option value="">Select</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label>Pax</label>
              <input
                type="number"
                value={row.pax}
                onChange={(e) => handleChange(index, 'pax', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Pickup</label>
              <select
                value={row.pickup}
                onChange={(e) => handleChange(index, 'pickup', e.target.value)}
                style={dropdownStyle}
              >
                <option value="">Select</option>
                <option value="Hotel">Hotel</option>
                <option value="Camp">Camp</option>
              </select>
            </div>
            <div>
              <label>Drop Off</label>
              <select
                value={row.dropoff}
                onChange={(e) => handleChange(index, 'dropoff', e.target.value)}
                style={dropdownStyle}
              >
                <option value="">Select</option>
                <option value="Airport">Airport</option>
                <option value="Border">Border</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Invoice Received</label>
              <input
                type="checkbox"
                checked={row.invRec}
                onChange={(e) => handleChange(index, 'invRec', e.target.checked)}
              />
            </div>
          </div>

          <button
            onClick={() => removeRow(index)}
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '12px',
              marginTop: '20px',
              border: 'none',
              borderRadius: '6px',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            Remove Extra
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        Add Another Extra
      </button>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #555',
  backgroundColor: '#2a2a2a',
  color: 'white'
};

const dropdownStyle = {
  ...inputStyle,
  appearance: 'none'
};

export default Extras;
