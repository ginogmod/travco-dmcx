import { useState } from 'react';

function Attach({ fileNo }) {
  const [rows, setRows] = useState([
    { subject: '', file: null }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { subject: '', file: null }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Attachments – File: {fileNo}</h2>
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
              <label>Attachment Subject</label>
              <input
                type="text"
                value={row.subject}
                onChange={(e) => handleChange(index, 'subject', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label>Attachment File</label>
              <input
                type="file"
                onChange={(e) => handleChange(index, 'file', e.target.files[0])}
                style={{
                  ...inputStyle,
                  padding: '6px',
                  color: 'white',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #555'
                }}
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
            Remove Attachment
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
        Add Another Attachment
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

export default Attach;
