import { useEffect, useState, useRef } from 'react';
import reservationDump from "../../data/reservationDump.json";
import HotelReservationForm from "./HotelReservationForm";
function Hotels({ fileNo, initialData, data, onSave, onDataChange, emptyFields = [], getHighlightedStyle }) {
  console.log("Hotels component received emptyFields:", emptyFields);
  const emptyHotel = {
    hotelName: '',
    checkIn: '',
    checkOut: '',
    invoiceReceived: false,
    nights: 0,
    notes: '',
    specialRates: '',
    addNotes: '',
    roomType: '',
    meal: '',
    status: '',
    bookedBy: '',
    cancelDate: '',
    pax: '',
    sgl: '',
    dbl: '',
    trp: '',
    other: '',
    confNo: '',
    ref: '',
  };

  const [hotels, setHotels] = useState([]);
  const hydratedRef = useRef(false);
  const [reservationModalIndex, setReservationModalIndex] = useState(null);
  useEffect(() => {
    if (hydratedRef.current) return;

    // Prefer Hotels from reservation; if none, start empty (no blank card)
    const hotelData = initialData || (data && data.Hotels);

    if (Array.isArray(hotelData) && hotelData.length > 0) {
      // Normalize, drop blanks, and de-duplicate
      const normalized = hotelData
        .map((h) => {
          const hotel = { ...emptyHotel, ...h };
          // Calculate nights if dates are provided
          if (hotel.checkIn && hotel.checkOut) {
            const inDate = new Date(hotel.checkIn);
            const outDate = new Date(hotel.checkOut);
            const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
            hotel.nights = Number.isFinite(diff) && diff > 0 ? Math.round(diff) : (hotel.nights || 0);
          }
          return hotel;
        })
        // Remove entries with no hotelName (prevents blank cards)
        .filter((h) => h.hotelName && String(h.hotelName).trim() !== "");

      // De-duplicate by key: hotelName + checkIn + checkOut + roomType + meal
      const seen = new Set();
      const unique = normalized.filter((h) => {
        const key = [
          h.hotelName,
          h.checkIn || "",
          h.checkOut || "",
          h.roomType || "",
          h.meal || "",
        ].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log("Loaded unique hotels:", unique);
      setHotels(unique);
    } else {
      // No prefilled hotels; do not insert an empty placeholder row
      setHotels([]);
    }

    hydratedRef.current = true;
  }, [initialData, data]);

  const handleChange = (index, field, value) => {
    setHotels((prev) => {
      const updated = prev.map((h, i) => (i === index ? { ...h, [field]: value } : h));

      if (field === 'checkIn' || field === 'checkOut') {
        const inDate = new Date(updated[index].checkIn);
        const outDate = new Date(updated[index].checkOut);
        const nights = (outDate - inDate) / (1000 * 60 * 60 * 24);
        updated[index].nights = Number.isFinite(nights) && nights > 0 ? Math.round(nights) : 0;
      }

      if (typeof onDataChange === "function") {
        onDataChange({ Hotels: updated });
      }
      return updated;
    });
  };

  const addHotel = () => {
    setHotels((prev) => {
      const next = [...prev, { ...emptyHotel }];
      if (typeof onDataChange === "function") onDataChange({ Hotels: next });
      return next;
    });
  };

  const removeHotel = (index) => {
    setHotels((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof onDataChange === "function") onDataChange({ Hotels: updated });
      return updated;
    });
  };

  // Utilities for hotel action buttons
  const duplicateHotel = (index) => {
    setHotels((prev) => {
      const source = prev[index];
      const copy = {
        ...source,
        confNo: "",
        ref: "",
        notes: (source.notes ? String(source.notes) + " " : "") + "(copy)"
      };
      const next = [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
      if (typeof onDataChange === "function") onDataChange({ Hotels: next });
      return next;
    });
  };

  const downloadText = (filename, content) => {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download", e);
      alert("Failed to download file.");
    }
  };

  const generateReservationDoc = (index) => {
    const h = hotels[index] || {};
    const payload = {
      fileNo,
      hotelName: h.hotelName || "",
      checkIn: h.checkIn || "",
      checkOut: h.checkOut || "",
      nights: h.nights || 0,
      roomType: h.roomType || "",
      meal: h.meal || "",
      pax: h.pax || "",
      sgl: h.sgl || "",
      dbl: h.dbl || "",
      trp: h.trp || "",
      other: h.other || "",
      notes: h.notes || "",
      specialRates: h.specialRates || "",
      status: h.status || "",
      bookedBy: h.bookedBy || "",
      confNo: h.confNo || "",
      ref: h.ref || ""
    };
    downloadText(`reservation_${fileNo}_${(h.hotelName || "hotel").replaceAll(" ", "_")}.json`, JSON.stringify(payload, null, 2));
  };

  const generateVoucherDoc = (index) => {
    const h = hotels[index] || {};
    const lines = [
      "Hotel Voucher",
      "-------------------------",
      `File No: ${fileNo}`,
      `Hotel: ${h.hotelName || "-"}`,
      `Check In: ${h.checkIn || "-"}`,
      `Check Out: ${h.checkOut || "-"}`,
      `Nights: ${h.nights || 0}`,
      `Room Type: ${h.roomType || "-"}`,
      `Meal Plan: ${h.meal || "-"}`,
      `PAX: ${h.pax || "-"}`,
      `SGL/DBL/TRP/Other: ${h.sgl || 0}/${h.dbl || 0}/${h.trp || 0}/${h.other || 0}`,
      `Confirmation No.: ${h.confNo || "-"}`,
      `Reference: ${h.ref || "-"}`,
      `Notes: ${h.notes || "-"}`,
      `Special Rates: ${h.specialRates || "-"}`,
    ].join("\n");
    downloadText(`voucher_${fileNo}_${(h.hotelName || "hotel").replaceAll(" ", "_")}.txt`, lines);
  };

  const generateRoomingList = (index, version = 1) => {
    const h = hotels[index] || {};
    const header = ["Room", "Guest Name", "Nationality", "Check-In", "Check-Out", "Room Type", "Notes"].join(",");
    const sampleRow = [
      "",
      "",
      "",
      h.checkIn || "",
      h.checkOut || "",
      h.roomType || "",
      ""
    ].join(",");
    const csv = [header, sampleRow].join("\n");
    downloadText(`rooming_list_${version}_${fileNo}_${(h.hotelName || "hotel").replaceAll(" ", "_")}.csv`, csv);
  };

  const formWrapper = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '40px',
    maxWidth: '100%',
  };

  const fieldGroup = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
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

  const actionBtn = (bg, color = 'white') => ({
    backgroundColor: bg,
    color,
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer'
  });
  
  // Function to get the appropriate style for an input field
  const getInputStyle = (index, fieldName) => {
    const fieldPath = `Hotels[${index}].${fieldName}`;
    console.log("Getting style for hotel field:", fieldPath);
    
    if (getHighlightedStyle) {
      return getHighlightedStyle(baseInputStyle, fieldPath);
    }
    
    // Fallback if getHighlightedStyle is not provided
    if (emptyFields.includes(fieldPath)) {
      console.log("Hotel field is empty, highlighting:", fieldPath);
      return {
        ...baseInputStyle,
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255, 77, 77, 0.1)'
      };
    }
    
    return baseInputStyle;
  };

  return (
    <div style={{ color: 'white', padding: '30px', fontFamily: 'Segoe UI, sans-serif', overflowX: 'auto' }}>
      <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>Hotels – File: {fileNo}</h2>

      {hotels.map((hotel, index) => (
        <div key={index} style={formWrapper}>
          <div style={fieldGroup}>
            <label style={labelStyle}>
              Hotel Name
              <input
                type="text"
                style={getInputStyle(index, 'hotelName')}
                value={hotel.hotelName}
                onChange={(e) => handleChange(index, 'hotelName', e.target.value)}
                placeholder="Enter hotel name"
              />
            </label>

            <label style={labelStyle}>
              Check In
              <input type="date" style={getInputStyle(index, 'checkIn')} value={hotel.checkIn} onChange={(e) => handleChange(index, 'checkIn', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Check Out
              <input type="date" style={getInputStyle(index, 'checkOut')} value={hotel.checkOut} onChange={(e) => handleChange(index, 'checkOut', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Invoice Received
              <input type="checkbox" checked={hotel.invoiceReceived} onChange={(e) => handleChange(index, 'invoiceReceived', e.target.checked)} />
            </label>

            <label style={labelStyle}>
              Nights
              <input
                type="number"
                style={baseInputStyle}
                value={hotel.nights}
                onChange={(e) => handleChange(index, 'nights', Number(e.target.value))}
              />
            </label>

            <label style={labelStyle}>
              Notes
              <input
                type="text"
                style={baseInputStyle}
                value={hotel.notes}
                onChange={(e) => handleChange(index, 'notes', e.target.value)}
                placeholder="Enter notes"
              />
            </label>

            <label style={labelStyle}>
              Special Rates
              <input type="text" style={baseInputStyle} value={hotel.specialRates} onChange={(e) => handleChange(index, 'specialRates', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Additional Notes
              <input type="text" style={baseInputStyle} value={hotel.addNotes} onChange={(e) => handleChange(index, 'addNotes', e.target.value)} />
            </label>

            <label style={labelStyle}>
              Room Type
              <input
                type="text"
                style={getInputStyle(index, 'roomType')}
                value={hotel.roomType}
                onChange={(e) => handleChange(index, 'roomType', e.target.value)}
                list="roomTypeList"
                placeholder="Enter room type"
              />
              <datalist id="roomTypeList">
                <option value="Standard" />
                <option value="Deluxe" />
                <option value="Suite" />
                <option value="Twin" />
                <option value="Double" />
                <option value="Single" />
              </datalist>
            </label>

            <label style={labelStyle}>
              Meal
              <input
                type="text"
                style={getInputStyle(index, 'meal')}
                value={hotel.meal}
                onChange={(e) => handleChange(index, 'meal', e.target.value)}
                list="mealList"
                placeholder="Enter meal plan"
              />
              <datalist id="mealList">
                <option value="BB" />
                <option value="HB" />
                <option value="FB" />
                <option value="AI" />
                <option value="RO" />
              </datalist>
            </label>

            <label style={labelStyle}>
              Status
              <input
                type="text"
                style={baseInputStyle}
                value={hotel.status}
                onChange={(e) => handleChange(index, 'status', e.target.value)}
                list="statusList"
                placeholder="Enter status"
              />
              <datalist id="statusList">
                <option value="CONF" />
                <option value="REQU" />
                <option value="PEND" />
                <option value="CANC" />
              </datalist>
            </label>

            <label style={labelStyle}>
              Booked By
              <input
                type="text"
                style={baseInputStyle}
                value={hotel.bookedBy}
                onChange={(e) => handleChange(index, 'bookedBy', e.target.value)}
                placeholder="Enter booking agent"
              />
            </label>

            <label style={labelStyle}>
              Cancel Date
              <input type="date" style={baseInputStyle} value={hotel.cancelDate} onChange={(e) => handleChange(index, 'cancelDate', e.target.value)} />
            </label>
          </div>

          <div style={{ ...fieldGroup, marginTop: '10px', borderTop: '1px dashed #444', paddingTop: '15px' }}>
            <label style={labelStyle}>Pax
              <input type="number" style={getInputStyle(index, 'pax')} value={hotel.pax} onChange={(e) => handleChange(index, 'pax', e.target.value)} />
            </label>
            <label style={labelStyle}>SGL
              <input type="number" style={baseInputStyle} value={hotel.sgl} onChange={(e) => handleChange(index, 'sgl', e.target.value)} />
            </label>
            <label style={labelStyle}>DBL
              <input type="number" style={baseInputStyle} value={hotel.dbl} onChange={(e) => handleChange(index, 'dbl', e.target.value)} />
            </label>
            <label style={labelStyle}>TRP
              <input type="number" style={baseInputStyle} value={hotel.trp} onChange={(e) => handleChange(index, 'trp', e.target.value)} />
            </label>
            <label style={labelStyle}>Other
              <input type="number" style={baseInputStyle} value={hotel.other} onChange={(e) => handleChange(index, 'other', e.target.value)} />
            </label>
            <label style={labelStyle}>Conf. No.
              <input type="text" style={baseInputStyle} value={hotel.confNo} onChange={(e) => handleChange(index, 'confNo', e.target.value)} />
            </label>
            <label style={labelStyle}>Ref
              <input type="text" style={baseInputStyle} value={hotel.ref} onChange={(e) => handleChange(index, 'ref', e.target.value)} />
            </label>
          </div>

          {/* Actions Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            <button onClick={() => setReservationModalIndex(index)} style={actionBtn('#6c757d')}>Reservation</button>
            <button onClick={() => generateVoucherDoc(index)} style={actionBtn('#6c757d')}>Voucher</button>
            <button onClick={() => generateRoomingList(index, 1)} style={actionBtn('#6c757d')}>Rooming list 1</button>
            <button onClick={() => generateRoomingList(index, 2)} style={actionBtn('#6c757d')}>Rooming list 2</button>
            <button onClick={() => generateRoomingList(index, 3)} style={actionBtn('#6c757d')}>Rooming list 3</button>
            <button onClick={() => duplicateHotel(index)} style={actionBtn('#6c757d')}>Duplicate</button>
          </div>
 
          <button
            onClick={() => removeHotel(index)}
            style={{
              marginTop: '20px',
              backgroundColor: '#c00',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Remove Hotel
          </button>
        </div>
      ))}

      <button
        onClick={addHotel}
        style={{
          backgroundColor: '#0a7',
          color: '#fff',
          padding: '12px 20px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        Add Hotel
      </button>
      
      <button
        onClick={() => onSave && onSave({ Hotels: hotels })}
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
        Save Hotels Data
      </button>

      {reservationModalIndex !== null && (
        <HotelReservationForm
          fileNo={fileNo}
          reservation={data}
          hotel={hotels[reservationModalIndex]}
          onClose={() => setReservationModalIndex(null)}
        />
      )}
    </div>
  );
}

export default Hotels;
