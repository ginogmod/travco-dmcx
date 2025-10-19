import { useState, useEffect } from 'react';
import baseCompanies from '../../data/TRSNew.json';

function Transportation({ fileNo, initialData, data, onSave }) {
  // Load transportation company names from editable dataset if available; fallback to bundled list
  const [transportCompanies, setTransportCompanies] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/data/trs_companies.json?v=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const names = Array.isArray(json) ? json.map(c => c.Account_Name).filter(Boolean) : [];
        if (!cancelled) setTransportCompanies(names.sort());
      } catch (_) {
        const names = baseCompanies.map(c => c.Account_Name).filter(Boolean);
        if (!cancelled) setTransportCompanies(names.sort());
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const emptyRow = {
    transCo: '', vehicleType: '', driverName: '', notes: '', specialRates: '',
    fromDate: '', toDate: '', status: '', pax: '', confNo: '',
    pickup: '', dropoff: '', invRec: false, resvNo: ''
  };

  const [rows, setRows] = useState([emptyRow]);

  useEffect(() => {
    // First try to use initialData (for backward compatibility)
    const transportData = initialData || (data && data.Transportation);
    
    if (transportData && Array.isArray(transportData) && transportData.length > 0) {
      const loaded = transportData.map((t) => ({ ...emptyRow, ...t }));
      setRows(loaded);
    }
  }, [initialData, data, emptyRow]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { ...emptyRow }]);
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

  const handleSave = () => {
    if (onSave) {
      onSave({ Transportation: rows });
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px' }}>Transportation – File: {fileNo}</h2>
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

      {rows.map((row, index) => (
        <div key={index} style={boxStyle}>
          <div style={sectionGrid}>
            <label style={labelStyle}>
              Transport Co. Name
              <input
                list={`transCo-${index}`}
                style={inputStyle}
                value={row.transCo}
                onChange={(e) => handleChange(index, 'transCo', e.target.value)}
                placeholder="Type or select company"
              />
              <datalist id={`transCo-${index}`}>
                {transportCompanies.map((company, i) => (
                  <option key={i} value={company} />
                ))}
              </datalist>
            </label>

            <label style={labelStyle}>
              Type of Vehicle
              <select style={inputStyle} value={row.vehicleType} onChange={(e) => handleChange(index, 'vehicleType', e.target.value)}>
                <option value="">Select</option>
                <option>Bus</option>
                <option>Van</option>
                <option>SUV</option>
              </select>
            </label>

            <label style={labelStyle}>
              Driver Name
              <select style={inputStyle} value={row.driverName} onChange={(e) => handleChange(index, 'driverName', e.target.value)}>
                <option value="">Select</option>
                <option>Mohammad</option>
                <option>Omar</option>
              </select>
            </label>

            <label style={labelStyle}>
              Notes
              <select style={inputStyle} value={row.notes} onChange={(e) => handleChange(index, 'notes', e.target.value)}>
                <option value="">Select</option>
                <option>New vehicle</option>
                <option>English-speaking driver</option>
              </select>
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
          </div>

          <div style={sectionGrid}>
            <label style={labelStyle}>
              Pax
              <input type="number" style={inputStyle} value={row.pax} onChange={(e) => handleChange(index, 'pax', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Conf. No.
              <input type="text" style={inputStyle} value={row.confNo} onChange={(e) => handleChange(index, 'confNo', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Pickup
              <select style={inputStyle} value={row.pickup} onChange={(e) => handleChange(index, 'pickup', e.target.value)}>
                <option value="">Select</option>
                <option>Hotel</option>
                <option>Camp</option>
              </select>
            </label>

            <label style={labelStyle}>
              Drop Off
              <select style={inputStyle} value={row.dropoff} onChange={(e) => handleChange(index, 'dropoff', e.target.value)}>
                <option value="">Select</option>
                <option>Hotel</option>
                <option>Camp</option>
              </select>
            </label>

            <label style={labelStyle}>
              Invoice Received
              <input type="checkbox" style={checkboxStyle} checked={row.invRec} onChange={(e) => handleChange(index, 'invRec', e.target.checked)} />
            </label>

            <label style={labelStyle}>
              Resv. No.
              <input type="text" style={inputStyle} value={row.resvNo} onChange={(e) => handleChange(index, 'resvNo', e.target.value)} />
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
            Remove Transportation
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
        Add Another Transportation
      </button>
    </div>
  );
}

export default Transportation;
