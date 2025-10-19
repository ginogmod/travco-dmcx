import { useState } from 'react';

function Reminders({ fileNo }) {
  const [rows, setRows] = useState([
    { type: '', date: '', notes: '', to: '', issuedBy: '', done: false }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { type: '', date: '', notes: '', to: '', issuedBy: '', done: false }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Reminders – File: {fileNo}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
            <th style={thStyle}>Reminder Type</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Notes</th>
            <th style={thStyle}>Reminder To</th>
            <th style={thStyle}>Issued By</th>
            <th style={thStyle}>Done</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} style={{ backgroundColor: '#1f1f1f', borderBottom: '1px solid #444' }}>
              <td style={tdStyle}>
                <select
                  value={row.type}
                  onChange={(e) => handleChange(index, 'type', e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="">Select</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Call Client">Call Client</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                </select>
              </td>
              <td style={tdStyle}>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleChange(index, 'date', e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={row.notes}
                  onChange={(e) => handleChange(index, 'notes', e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <select
                  value={row.to}
                  onChange={(e) => handleChange(index, 'to', e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="">Select</option>
                  <option value="Luigi">Luigi</option>
                  <option value="Ahmad">Ahmad</option>
                  <option value="Yazan">Yazan</option>
                </select>
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={row.issuedBy}
                  onChange={(e) => handleChange(index, 'issuedBy', e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="checkbox"
                  checked={row.done}
                  onChange={(e) => handleChange(index, 'done', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
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
        Add Reminder
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
  padding: '12px',
  verticalAlign: 'middle'
};

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

export default Reminders;
