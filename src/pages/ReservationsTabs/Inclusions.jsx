import { useState, useEffect } from 'react';

function Inclusions({ fileNo, initialData, data, onSave }) {
  const [rows, setRows] = useState([
    { yes: false, no: false, inclusion: 'Entrance Tickets' }
  ]);

  useEffect(() => {
    console.log("Inclusions component received data:", { initialData, data });
    
    // First check if initialData is already in the correct format (array of objects with yes/no/inclusion)
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      if (typeof initialData[0] === 'object' && 'inclusion' in initialData[0]) {
        // Data is already in the correct format
        console.log("Using pre-formatted inclusions data:", initialData);
        setRows(initialData);
      } else if (typeof initialData[0] === 'string') {
        // Convert string array to inclusion objects
        console.log("Converting string array to inclusion objects");
        const loaded = initialData.map(inclusion => ({
          yes: true,
          no: false,
          inclusion: inclusion
        }));
        setRows(loaded);
      }
    } else if (data && data.Inclusions && Array.isArray(data.Inclusions) && data.Inclusions.length > 0) {
      // Try to get data from the parent data object
      console.log("Using inclusions from parent data object");
      if (typeof data.Inclusions[0] === 'object' && 'inclusion' in data.Inclusions[0]) {
        // Data is already in the correct format
        setRows(data.Inclusions);
      } else if (typeof data.Inclusions[0] === 'string') {
        // Convert string array to inclusion objects
        const loaded = data.Inclusions.map(inclusion => ({
          yes: true,
          no: false,
          inclusion: inclusion
        }));
        setRows(loaded);
      }
    }
  }, [initialData, data]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    if (field === 'yes') {
      updated[index].yes = value;
      updated[index].no = !value;
    } else if (field === 'no') {
      updated[index].no = value;
      updated[index].yes = !value;
    } else {
      updated[index][field] = value;
    }
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { yes: false, no: false, inclusion: '' }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ Inclusions: rows });
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Inclusions – File: {fileNo}</h2>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Save Changes
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
            <th style={thStyle}>Yes</th>
            <th style={thStyle}>No</th>
            <th style={thStyle}>Inclusion</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} style={{ backgroundColor: '#1f1f1f', borderBottom: '1px solid #444' }}>
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={row.yes}
                  onChange={(e) => handleChange(index, 'yes', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={row.no}
                  onChange={(e) => handleChange(index, 'no', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={row.inclusion}
                  onChange={(e) => handleChange(index, 'inclusion', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter inclusion"
                  list="inclusionsList"
                />
                <datalist id="inclusionsList">
                  <option value="Entrance Tickets" />
                  <option value="Lunch Included" />
                  <option value="Guide Included" />
                  <option value="Drinks Included" />
                  <option value="Transportation" />
                  <option value="Accommodation" />
                  <option value="Breakfast" />
                  <option value="Dinner" />
                </datalist>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => removeRow(index)}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '14px'
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addRow}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        Add Inclusion
      </button>
    </div>
  );
}

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #555',
  fontWeight: 'bold',
  color: '#fff'
};

const tdStyle = {
  padding: '12px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #555',
  backgroundColor: '#2a2a2a',
  color: 'white',
  fontSize: '14px'
};

export default Inclusions;
