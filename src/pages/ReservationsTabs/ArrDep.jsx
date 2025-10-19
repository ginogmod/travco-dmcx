import { useEffect, useState, useRef } from "react";

function ArrDep({ fileNo, initialData, data, onSave, emptyFields = [], getHighlightedStyle, onDataChange }) {
  console.log("ArrDep component received emptyFields:", emptyFields);
  const [rows, setRows] = useState([]);
  const hydratedRef = useRef(false);

  const emptyRow = {
    arr: false,
    dep: false,
    date: "",
    from: "",
    to: "",
    border: "",
    flight: "",
    time: "",
    pax: "",
    meetBy: "",
    driverName: "",
    notes: ""
  };

  useEffect(() => {
    if (hydratedRef.current) return;
    // First try to use initialData (for backward compatibility)
    const arrDepData = initialData || (data && data.ArrDep);
    
    console.log("ArrDep component received data:", { initialData, data });
    console.log("ArrDep data to use:", arrDepData);
    
    if (arrDepData && Array.isArray(arrDepData) && arrDepData.length > 0) {
      console.log("Loading ArrDep data:", arrDepData);
      const gp = Number(data?.generalData?.pax);
      const loaded = arrDepData.map((row) => {
        const result = { ...emptyRow, ...row };
        // If General Pax is set, mirror into Arr/Dep when row pax is unset or legacy default "1"
        if (Number.isFinite(gp) && gp > 0) {
          const cur = Number(result.pax);
          const isUnset = result.pax == null || result.pax === "" || !Number.isFinite(cur) || cur <= 0;
          const initialOne = String(result.pax) === "1";
          if (isUnset || initialOne) {
            result.pax = gp;
          }
        }
        console.log("Processed ArrDep row:", result);
        return result;
      });
      setRows(loaded);
    } else {
      console.log("No ArrDep data found, using empty rows");
      setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
    }
    hydratedRef.current = true;
  }, [initialData, data]);
 
  // Auto-sync General.pax into Arr/Dep rows without clobbering user edits
  const lastSyncedPaxRef = useRef(null);
  useEffect(() => {
    const generalPax = Number(data?.generalData?.pax);
    if (!Number.isFinite(generalPax) || generalPax <= 0) return;
 
    setRows((prev) => {
      const prevSynced = lastSyncedPaxRef.current;
      const updated = prev.map((r) => {
        const cur = Number(r?.pax);
        const isUnset = r?.pax === "" || r?.pax == null || !Number.isFinite(cur) || cur <= 0;
        const wasMirrored = prevSynced != null && String(r?.pax) === String(prevSynced);
        const initialOne = prevSynced == null && String(r?.pax) === "1"; // fix legacy default 1
        if (isUnset || wasMirrored || initialOne) {
          return { ...r, pax: generalPax };
        }
        return r;
      });
      if (typeof onDataChange === "function" && JSON.stringify(updated) !== JSON.stringify(prev)) {
        onDataChange({ ArrDep: updated });
      }
      return updated;
    });
 
    lastSyncedPaxRef.current = generalPax;
  }, [data?.generalData?.pax, onDataChange]);

  const handleChange = (index, field, value) => {
    const updated = rows.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    setRows(updated);
    if (typeof onDataChange === "function") {
      onDataChange({ ArrDep: updated });
    }
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const handleSave = () => {
    if (onSave) {
      onSave({ ArrDep: rows });
    }
  };

  const locations = ["Amman", "Aqaba", "Petra", "Wadi Rum", "Jerash", "Dead Sea", "Madaba", "Ajloun", "QAIA", "Aqaba Airport"];
  const borders = ["Allenby", "Sheikh Hussein", "Aqaba Border", "QAIA", "Aqaba Airport"];
  const flights = ["RJ 126", "RJ 130", "RJ 138", "RJ 301", "FR237", "LH692", "RJ126", "RJ130"];
  const meetByOptions = ["Firas", "suhaib", "Zaid Al Amer", "John", "Ali", "Omar"];
  const drivers = ["Driver A", "Driver B", "Driver C"];
  const notesOptions = ["VIP", "Arrival Only", "Departure Only"];

  const cellStyle = {
    border: "1px solid #555",
    padding: "12px",
    textAlign: "center",
    backgroundColor: "#1e1e1e",
    color: "white",
    fontSize: "14px",
    minWidth: "120px"
  };

  const headerStyle = {
    ...cellStyle,
    fontWeight: "bold",
    backgroundColor: "#2e2e2e"
  };

  const baseInputStyle = {
    width: '100%',
    backgroundColor: '#2a2a2a',
    color: 'white',
    border: '1px solid #444',
    padding: '4px',
    fontSize: '14px'
  };
  
  // Function to get the appropriate style for an input field
  const getInputStyle = (index, fieldName) => {
    const fieldPath = `ArrDep[${index}].${fieldName}`;
    console.log("Getting style for ArrDep field:", fieldPath);
    
    if (getHighlightedStyle) {
      return getHighlightedStyle(baseInputStyle, fieldPath);
    }
    
    // Fallback if getHighlightedStyle is not provided
    if (emptyFields.includes(fieldPath)) {
      console.log("ArrDep field is empty, highlighting:", fieldPath);
      return {
        ...baseInputStyle,
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255, 77, 77, 0.1)'
      };
    }
    
    return baseInputStyle;
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Arrival / Departure – File: {fileNo}</h2>
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
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            {["ARR", "DEP", "Date", "From", "To", "Border", "Flight", "Time", "Pax", "Meet By", "Driver Name", "Notes", "Remove"].map((col, i) => (
              <th key={i} style={headerStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td style={cellStyle}><input type="checkbox" checked={row.arr || false} onChange={e => handleChange(idx, "arr", e.target.checked)} /></td>
              <td style={cellStyle}><input type="checkbox" checked={row.dep || false} onChange={e => handleChange(idx, "dep", e.target.checked)} /></td>
              <td style={cellStyle}><input type="date" value={row.date || ''} onChange={e => handleChange(idx, "date", e.target.value)} style={getInputStyle(idx, "date")} /></td>
              <td style={cellStyle}>
                <input list={`fromList-${idx}`} value={row.from || ''} onChange={e => handleChange(idx, "from", e.target.value)} style={getInputStyle(idx, "from")} />
                <datalist id={`fromList-${idx}`}>{locations.map((loc, i) => <option key={i} value={loc} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <input list={`toList-${idx}`} value={row.to || ''} onChange={e => handleChange(idx, "to", e.target.value)} style={getInputStyle(idx, "to")} />
                <datalist id={`toList-${idx}`}>{locations.map((loc, i) => <option key={i} value={loc} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <input list={`borderList-${idx}`} value={row.border || ''} onChange={e => handleChange(idx, "border", e.target.value)} style={getInputStyle(idx, "border")} />
                <datalist id={`borderList-${idx}`}>{borders.map((b, i) => <option key={i} value={b} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <input list={`flightList-${idx}`} value={row.flight || ''} onChange={e => handleChange(idx, "flight", e.target.value)} style={getInputStyle(idx, "flight")} />
                <datalist id={`flightList-${idx}`}>{flights.map((f, i) => <option key={i} value={f} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <input type="time" value={row.time || ''} onChange={e => handleChange(idx, "time", e.target.value)} style={getInputStyle(idx, "time")} />
              </td>
              <td style={cellStyle}>
                <input type="number" value={row.pax || ''} onChange={e => handleChange(idx, "pax", e.target.value)} style={getInputStyle(idx, "pax")} />
              </td>
              <td style={cellStyle}>
                <input list={`meetByList-${idx}`} value={row.meetBy || ''} onChange={e => handleChange(idx, "meetBy", e.target.value)} style={getInputStyle(idx, "meetBy")} />
                <datalist id={`meetByList-${idx}`}>{meetByOptions.map((m, i) => <option key={i} value={m} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <input list={`driverList-${idx}`} value={row.driverName || ''} onChange={e => handleChange(idx, "driverName", e.target.value)} style={getInputStyle(idx, "driverName")} />
                <datalist id={`driverList-${idx}`}>{drivers.map((d, i) => <option key={i} value={d} />)}</datalist>
              </td>
              <td style={cellStyle}>
                <textarea
                  value={row.notes || ''}
                  onChange={e => handleChange(idx, "notes", e.target.value)}
                  style={{...getInputStyle(idx, "notes"), minHeight: '60px', resize: 'vertical'}}
                  rows="2"
                />
              </td>
              <td style={cellStyle}>
                <button onClick={() => removeRow(idx)} style={{ background: "#b33", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <button onClick={addRow} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#2e7d32", color: "white", border: "none", fontSize: "16px", borderRadius: "6px", cursor: "pointer" }}>
        + Add Row
      </button>
    </div>
  );
}

export default ArrDep;
