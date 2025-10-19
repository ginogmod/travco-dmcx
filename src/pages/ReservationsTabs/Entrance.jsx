import { useState, useEffect, useRef } from 'react';

function Entrance({ fileNo, initialData, data, onSave, onDataChange, itineraryLocations = ['Amman', 'Jerash', 'Petra', 'Wadi Rum', 'Dead Sea'] }) {
  const [rows, setRows] = useState([
    {
      date: '',
      day: '',
      time: '',
      notes: '',
      entrance: '',
      itinerary: '',
      pax: '',
      invRec: false
    }
  ]);
  const [entranceFees, setEntranceFees] = useState([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!hydratedRef.current) {
      const incoming = (initialData && Array.isArray(initialData) && initialData.length > 0)
        ? initialData
        : (Array.isArray(data?.Entrance) && data.Entrance.length > 0 ? data.Entrance : null);
      if (incoming) {
        setRows(incoming.map(r => ({ ...r })));
      }
      hydratedRef.current = true;
    }

    // Fetch entrance fees data (cache-busted)
    fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
      .then(res => res.json())
      .then(dataJson => {
        // Skip the first item (header) and sort alphabetically
        const sorted = dataJson.slice(1).sort((a, b) =>
          a["Travco Jordan"].localeCompare(b["Travco Jordan"])
        );
        setEntranceFees(sorted);
      })
      .catch(err => console.error("Failed to load entrance fees", err));
  }, [initialData, data]);

  const handleChange = (index, field, value) => {
    setRows(prev => {
      const updated = prev.map((r, i) => (i === index ? { ...r, [field]: value } : r));
      if (field === 'date') {
        const dayName = new Date(value).toLocaleDateString('en-US', { weekday: 'long' });
        updated[index].day = dayName;
      }
      if (typeof onDataChange === "function") {
        onDataChange({ Entrance: updated });
      }
      return updated;
    });
  };

  const addRow = () => {
    setRows(prev => {
      const next = [...prev, {
        date: '',
        day: '',
        time: '',
        notes: '',
        entrance: '',
        itinerary: '',
        pax: '',
        invRec: false
      }];
      if (typeof onDataChange === "function") onDataChange({ Entrance: next });
      return next;
    });
  };

  const removeRow = (index) => {
    setRows(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof onDataChange === "function") onDataChange({ Entrance: updated });
      return updated;
    });
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Entrance – File: {fileNo}</h2>
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
              <label>Date</label>
              <input
                type="date"
                value={row.date}
                onChange={(e) => handleChange(index, 'date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label>Day</label>
              <input
                type="text"
                value={row.day}
                onChange={(e) => handleChange(index, 'day', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={row.time}
                onChange={(e) => handleChange(index, 'time', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label>Notes</label>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => handleChange(index, 'notes', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label>Entrance</label>
              <select
                value={row.entrance}
                onChange={(e) => handleChange(index, 'entrance', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              >
                <option value="">Select</option>
                {entranceFees.map((fee, i) => (
                  <option key={i} value={fee["Travco Jordan"]}>
                    {fee["Travco Jordan"]} ({fee["__1"] || 0})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Location</label>
              <select
                value={row.itinerary}
                onChange={(e) => handleChange(index, 'itinerary', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              >
                <option value="">Select</option>
                {itineraryLocations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Pax</label>
              <input
                type="number"
                value={row.pax}
                onChange={(e) => handleChange(index, 'pax', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              />
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
            Remove Entrance
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
        Add Another Entrance
      </button>
      
      <button
        onClick={() => onSave && onSave({ Entrance: rows })}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          marginTop: '20px',
          marginLeft: '10px'
        }}
      >
        Save Entrance Data
      </button>
    </div>
  );
}

export default Entrance;
