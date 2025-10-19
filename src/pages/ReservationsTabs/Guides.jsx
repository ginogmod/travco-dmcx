import { useState, useEffect } from 'react';

function Guides({ fileNo, initialData }) {
  const [rows, setRows] = useState([
    {
      guideName: '', language: '', notes: '', specialRates: '',
      fromDate: '', toDate: '', status: '', days: '', overnight: '', invRec: false
    }
  ]);

  useEffect(() => {
    console.log("Guides component received initialData:", initialData);
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      console.log("Setting Guides data:", initialData);
      setRows(initialData);
    }
  }, [initialData]);

  const availableGuides = ['John Doe', 'Ali Ahmad', 'Layla Khoury'];
  const availableLanguages = ['English', 'Arabic', 'French', 'Spanish', 'German'];

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, {
      guideName: '', language: '', notes: '', specialRates: '',
      fromDate: '', toDate: '', status: '', days: '', overnight: '', invRec: false
    }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const wrapperStyle = {
    color: 'white',
    padding: '30px',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const boxStyle = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 500,
    fontSize: '15px'
  };

  const inputStyle = {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    width: '100%'
  };

  const checkboxStyle = {
    transform: 'scale(1.2)',
    marginTop: '10px'
  };

  const sectionGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  };

  return (
    <div style={wrapperStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>Guides – File: {fileNo}</h2>

      {rows.map((row, index) => (
        <div key={index} style={boxStyle}>
          <div style={sectionGrid}>
            <label style={labelStyle}>
              Guide Name
              <input
                list={`guides-${index}`}
                style={inputStyle}
                value={row.guideName}
                onChange={(e) => handleChange(index, 'guideName', e.target.value)}
              />
              <datalist id={`guides-${index}`}>
                {availableGuides.map((name, i) => (
                  <option key={i} value={name} />
                ))}
              </datalist>
            </label>

            <label style={labelStyle}>
              Language
              <select
                style={inputStyle}
                value={row.language}
                onChange={(e) => handleChange(index, 'language', e.target.value)}
              >
                <option value="">Select</option>
                {availableLanguages.map((lang, i) => (
                  <option key={i} value={lang}>{lang}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Notes
              <input type="text" style={inputStyle} value={row.notes} onChange={(e) => handleChange(index, 'notes', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Special Rates
              <input type="text" style={inputStyle} value={row.specialRates} onChange={(e) => handleChange(index, 'specialRates', e.target.value)} />
            </label>
          </div>

          <div style={sectionGrid}>
            <label style={labelStyle}>
              From Date
              <input type="date" style={inputStyle} value={row.fromDate} onChange={(e) => handleChange(index, 'fromDate', e.target.value)} />
            </label>

            <label style={labelStyle}>
              To Date
              <input type="date" style={inputStyle} value={row.toDate} onChange={(e) => handleChange(index, 'toDate', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Status
              <select style={inputStyle} value={row.status} onChange={(e) => handleChange(index, 'status', e.target.value)}>
                <option value="">Select</option>
                <option>Confirmed</option>
                <option>Pending</option>
              </select>
            </label>

            <label style={labelStyle}>
              Days
              <input type="number" style={inputStyle} value={row.days} onChange={(e) => handleChange(index, 'days', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Overnight
              <input type="number" style={inputStyle} value={row.overnight} onChange={(e) => handleChange(index, 'overnight', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Invoice Received
              <input type="checkbox" style={checkboxStyle} checked={row.invRec} onChange={(e) => handleChange(index, 'invRec', e.target.checked)} />
            </label>
          </div>

          <button
            onClick={() => removeRow(index)}
            style={{
              marginTop: '15px',
              backgroundColor: '#c00',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: 'fit-content'
            }}
          >
            Remove Guide
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        style={{
          backgroundColor: '#0a7',
          color: 'white',
          padding: '12px 20px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        Add Another Guide
      </button>
    </div>
  );
}

export default Guides;
