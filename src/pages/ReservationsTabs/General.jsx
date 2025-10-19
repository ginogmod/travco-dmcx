import { useState, useEffect, useRef } from 'react';

function General({ fileNo, onDataChange, onSave, initialData = {}, emptyFields = [], getHighlightedStyle, data: parentData }) {
  console.log("General component received emptyFields:", emptyFields);
  console.log("General component received initialData:", initialData);
  console.log("General component received parentData:", parentData);
  
  // Initialize with default values
  const defaultData = {
    clientName: '',
    reservationCode: '',
    nationality: '',
    groupName: '',
    agent: '',
    pax: '',
    depTax: '',
    visa: '',
    entries: '',
    tips: ''
  };
  
  // Merge initialData with default values
  const [data, setData] = useState({
    ...defaultData,
    ...initialData
  });

  // One-time hydration only; never clobber user edits after mount
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;

    // Compose incoming baseline from initialData; fallback to parentData.generalData
    let incoming = null;
    if (initialData && Object.keys(initialData).length > 0) {
      incoming = {
        clientName: initialData.clientName || '',
        reservationCode: initialData.reservationCode || '',
        nationality: initialData.nationality || '',
        groupName: initialData.groupName || '',
        agent: initialData.agent || '',
        pax: initialData.pax ?? (parentData?.ArrDep?.[0]?.pax || parentData?.ArrDep?.[1]?.pax || ''),
        depTax: initialData.depTax || '',
        visa: initialData.visa || '',
        entries: initialData.entries || '',
        tips: initialData.tips || ''
      };
    } else if (parentData && parentData.generalData && Object.keys(parentData.generalData).length > 0) {
      const generalData = parentData.generalData;
      incoming = {
        clientName: generalData.clientName || '',
        reservationCode: generalData.reservationCode || '',
        nationality: generalData.nationality || '',
        groupName: generalData.groupName || '',
        agent: generalData.agent || '',
        pax: generalData.pax || (parentData?.ArrDep?.[0]?.pax || parentData?.ArrDep?.[1]?.pax || ''),
        depTax: generalData.depTax || '',
        visa: generalData.visa || '',
        entries: generalData.entries || '',
        tips: generalData.tips || ''
      };
    }

    if (incoming) {
      setData(incoming);
    }
    hydratedRef.current = true;
  }, [initialData, parentData]);
  

  // Debounced sync to parent (avoid rapid re-hydration loops while typing)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (typeof onDataChange !== "function") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onDataChange({ generalData: data });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data, onDataChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const wrapperStyle = {
    color: 'white',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
    backgroundColor: '#1f1f1f',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #333',
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 500,
    fontSize: '15px'
  };

  const baseInputStyle = {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
  };
  
  // Function to get the appropriate style for an input field
  const getInputStyle = (fieldName) => {
    console.log("Getting style for field:", fieldName);
    
    if (getHighlightedStyle) {
      return getHighlightedStyle(baseInputStyle, fieldName);
    }
    
    // Fallback if getHighlightedStyle is not provided
    if (emptyFields.includes(fieldName)) {
      console.log("Field is empty, highlighting:", fieldName);
      return {
        ...baseInputStyle,
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255, 77, 77, 0.1)'
      };
    }
    
    return baseInputStyle;
  };

  const nationalities = [
    "Jordanian", "Italian", "American", "British", "Canadian", "French", "German",
    "Spanish", "Australian", "Egyptian", "Lebanese", "Saudi", "UAE", "Kuwaiti",
    "Moroccan", "Indian", "Chinese", "Japanese", "Korean", "Brazilian", "Turkish",
    "Palestinian", "Syrian", "Iraqi", "Tunisian", "Pakistani", "Sudanese"
  ];

  // Eligible Pax numbers derived from linked quotation ranges
  const extractEligiblePaxNumbers = () => {
    const set = new Set();
    const addRange = (min, max) => {
      const a = Number(min), b = Number(max);
      if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b >= a) {
        for (let i = a; i <= b; i++) set.add(i);
      }
    };
    const addNumber = (n) => {
      const v = Number(n);
      if (Number.isFinite(v) && v > 0) set.add(v);
    };
    const accumulateFrom = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((q) => {
        if (!q) return;
        if (q.paxRange && typeof q.paxRange === 'string') {
          const m = q.paxRange.match(/(\d+)\s*-\s*(\d+)/i);
          if (m) addRange(m[1], m[2]);
        }
        if (q.pax != null) addNumber(q.pax);
      });
    };
    const qSnap = parentData?.relatedQuotationSnapshot;
    accumulateFrom(qSnap?.quotations);
    // Fallback: sometimes options live under the offer snapshot
    const offerSnap = parentData?.relatedOfferSnapshot;
    accumulateFrom(offerSnap?.quotations);
    // If nothing found, fallback to Arr/Dep pax or a reasonable default
    if (set.size === 0) {
      if (parentData?.ArrDep?.[0]?.pax) addNumber(parentData.ArrDep[0].pax);
      if (parentData?.ArrDep?.[1]?.pax) addNumber(parentData.ArrDep[1].pax);
    }
    if (set.size === 0) {
      // Provide a conservative default list
      for (let i = 1; i <= 50; i++) set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  };
  const eligiblePaxNumbers = extractEligiblePaxNumbers();

  // Add a console log to see the current data
  console.log("General component rendering with data:", data);

  return (
    <div id="pdf-section-General" style={wrapperStyle}>
      <h2 style={{ marginBottom: '20px' }}>General – File: {fileNo}</h2>
      <div style={{ marginBottom: '10px', color: '#aaa' }}>Group Name: {data.groupName || 'Not set'}</div>
      <form style={formStyle} onSubmit={(e) => e.preventDefault()}>
        <label style={labelStyle}>
          Group Name
          <input
            type="text"
            name="groupName"
            value={data.groupName}
            onChange={handleChange}
            style={getInputStyle('groupName')}
          />
        </label>
        <label style={labelStyle}>
          Agent Name
          <input
            type="text"
            name="agent"
            value={data.agent}
            onChange={handleChange}
            style={getInputStyle('agent')}
            placeholder="Enter agent name"
          />
        </label>
        <label style={labelStyle}>
          Reservation Code
          <input
            type="text"
            name="reservationCode"
            value={data.reservationCode}
            onChange={handleChange}
            style={getInputStyle('reservationCode')}
          />
        </label>
        <label style={labelStyle}>
          Nationality
          <input
            type="text"
            name="nationality"
            value={data.nationality}
            onChange={handleChange}
            style={getInputStyle('nationality')}
            list="nationalityList"
            placeholder="Enter or select nationality"
          />
          <datalist id="nationalityList">
            {nationalities.map((nat, index) => (
              <option key={index} value={nat} />
            ))}
          </datalist>
        </label>

        <label style={labelStyle}>
          Pax
          <select
            name="pax"
            value={data.pax}
            onChange={handleChange}
            style={getInputStyle('pax')}
          >
            <option value="">Select Pax</option>
            {eligiblePaxNumbers.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ ...labelStyle, flex: 1 }}>
            Dep. Tax
            <input
              type="text"
              name="depTax"
              value={data.depTax}
              onChange={handleChange}
              style={getInputStyle('depTax')}
            />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>
            Visa
            <select
              name="visa"
              value={data.visa}
              onChange={handleChange}
              style={getInputStyle('visa')}
            >
              <option value="">Select</option>
              <option value="INCLUDED">INCLUDED</option>
            </select>
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>
            Entries
            <input
              type="text"
              name="entries"
              value={data.entries}
              onChange={handleChange}
              style={getInputStyle('entries')}
            />
          </label>
          <label style={{ ...labelStyle, flex: 1 }}>
            Tips
            <input
              type="text"
              name="tips"
              value={data.tips}
              onChange={handleChange}
              style={getInputStyle('tips')}
            />
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => onSave && onSave({ generalData: data })}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              alignSelf: 'flex-start'
            }}
          >
            Save General Data
          </button>
          
          {initialData && initialData.groupName && (
            <button
              type="button"
              onClick={() => {
                const updatedData = { ...data, groupName: initialData.groupName };
                setData(updatedData);
                onSave && onSave({ generalData: updatedData });
                alert(`Group name set to: ${initialData.groupName}`);
              }}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                alignSelf: 'flex-start'
              }}
            >
              Set Group Name
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default General;
