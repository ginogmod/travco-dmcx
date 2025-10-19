import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Reservations.css";

// Import all the reservation tabs
import ResDetails from "./ReservationsTabs/ResDetails";
import General from "./ReservationsTabs/General";
import ArrDep from "./ReservationsTabs/ArrDep";
import Hotels from "./ReservationsTabs/Hotels";
import Transportation from "./ReservationsTabs/Transportation";
import Guides from "./ReservationsTabs/Guides";
import Entrance from "./ReservationsTabs/Entrance";
import Restaurants from "./ReservationsTabs/Restaurants";
import Extras from "./ReservationsTabs/Extras";
import Itineraries from "./ReservationsTabs/Itineraries";
import Inclusions from "./ReservationsTabs/Inclusions";
import Clients from "./ReservationsTabs/Clients";
import Attach from "./ReservationsTabs/Attach";
import Reminder from "./ReservationsTabs/Reminder";
import Log from "./ReservationsTabs/Log";

const tabs = {
  "RES Details": ResDetails,
  General,
  "Arr/Dep": ArrDep,
  Hotels,
  Transportation,
  Guides,
  Entrance,
  Restaurants,
  Extras,
  Itineraries,
  Inclusions,
  Clients,
  Attach,
  Reminder,
  Log,
};

function NewReservation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reservation, setReservation] = useState({});
  const [activeTab, setActiveTab] = useState("RES Details");
  const [fileNo, setFileNo] = useState(`RES-${Date.now()}`);
  const [emptyFields, setEmptyFields] = useState([]);

  // Helper: compute empty fields from the constructed reservation object
  const computeEmptyFieldsFromReservation = (resv) => {
    const ef = [];
    const hasVal = (v) => v !== undefined && v !== null && String(v).trim() !== "";

    // General tab
    const gd = resv.generalData || {};
    if (!hasVal(gd.groupName)) ef.push("groupName");
    if (!hasVal(gd.agent)) ef.push("agent");
    if (!hasVal(gd.nationality)) ef.push("nationality");

    // Arr/Dep tab
    if (Array.isArray(resv.ArrDep)) {
      const arrFields = ["from", "to", "flight", "time"];
      resv.ArrDep.forEach((row, idx) => {
        arrFields.forEach((f) => {
          if (!hasVal(row?.[f])) ef.push(`ArrDep[${idx}].${f}`);
        });
      });
    }

    // Hotels tab
    if (Array.isArray(resv.Hotels)) {
      resv.Hotels.forEach((h, i) => {
        if (!hasVal(h.hotelName)) ef.push(`Hotels[${i}].hotelName`);
        if (!hasVal(h.checkIn)) ef.push(`Hotels[${i}].checkIn`);
        if (!hasVal(h.checkOut)) ef.push(`Hotels[${i}].checkOut`);
        if (!hasVal(h.roomType)) ef.push(`Hotels[${i}].roomType`);
        if (!hasVal(h.meal)) ef.push(`Hotels[${i}].meal`);
      });
    }

    return ef;
  };

  // Subtle red highlight style helper used by tabs when provided
  const getHighlightedStyle = (baseInputStyle, fieldPath) => {
    if (emptyFields.includes(fieldPath)) {
      return {
        ...baseInputStyle,
        borderColor: "#c45858",
        backgroundColor: "rgba(196, 88, 88, 0.12)",
      };
    }
    return baseInputStyle;
  };

  // Prefill from navigation state (coming from Confirmed Offer -> Generate Reservation File)
  useEffect(() => {
    if (location && location.state && Object.keys(location.state).length) {
      try {
        handleFileDrop(location.state);
      } catch (e) {
        console.error('Failed to prefill reservation from navigation state:', e);
      }
    }
  }, [location.state]);

  // Helper: extract itinerary locations for Entrance tab suggestions
  const KNOWN_LOCATIONS = ["Amman", "Jerash", "Madaba", "Mount Nebo", "Petra", "Wadi Rum", "Dead Sea", "Aqaba", "Ajloun", "Kerak", "Um Qais"];
  const computeItineraryLocations = (itins = []) => {
    try {
      const set = new Set();
      (Array.isArray(itins) ? itins : []).forEach((row) => {
        const txt = String(row?.itinerary || "").toLowerCase();
        KNOWN_LOCATIONS.forEach((loc) => {
          if (txt.includes(loc.toLowerCase())) set.add(loc);
        });
      });
      const arr = Array.from(set);
      return arr.length ? arr : KNOWN_LOCATIONS;
    } catch {
      return KNOWN_LOCATIONS;
    }
  };



  const handleFileDrop = (data, precomputedEmptyFields = []) => {
    console.log("Handling file drop with data:", data);
    
    // Generate a new file number if not already set
    const newFileNo = fileNo || `RES-${Date.now()}`;
    setFileNo(newFileNo);
    
    // Extract pax from the first quotation if available
    const firstQuotation = data.quotations && data.quotations.length > 0 ? data.quotations[0] : {};
    const paxCount = data.pax || firstQuotation.pax || '';
    
    // Check if we have hotels data in the enhanced format
    const hotels = Array.isArray(data.hotels) && data.hotels.length > 0
      ? data.hotels
          .map(hotel => ({
            hotelName: hotel.name || '',
            checkIn: hotel.checkIn || data.arrivalDate || data.dateArr || '',
            checkOut: hotel.checkOut || data.departureDate || data.dateDep || '',
            roomType: hotel.roomType || '',
            meal: hotel.mealPlan || '',
            nights: hotel.nights || 0,
            notes: '',
            specialRates: '',
            addNotes: '',
            status: '',
            bookedBy: '',
            cancelDate: '',
            pax: paxCount,
            sgl: '',
            dbl: '',
            trp: '',
            other: '',
            confNo: '',
            ref: '',
            invoiceReceived: false
          }))
          .filter(h => h.hotelName)
      : (() => {
          // Derive hotels from a single primary option only (avoid multiplying across all options/quotations)
          const firstQuotation = Array.isArray(data.quotations) && data.quotations.length > 0 ? data.quotations[0] : null;
          const options = Array.isArray(firstQuotation?.options) ? firstQuotation.options : [];
          const primaryOption = options.find(o => Array.isArray(o.accommodations) && o.accommodations.length > 0) || null;
          const accs = Array.isArray(primaryOption?.accommodations) ? primaryOption.accommodations : [];
          if (accs.length > 0) {
            return accs.map(acc => ({
              hotelName: acc.hotelName || '',
              checkIn: data.arrivalDate || data.dateArr || '',
              checkOut: data.departureDate || data.dateDep || '',
              roomType: acc.roomType || '',
              meal: acc.board || acc.mealPlan || '',
              nights: acc.nights || 0,
              notes: '',
              specialRates: '',
              addNotes: '',
              status: '',
              bookedBy: '',
              cancelDate: '',
              pax: paxCount,
              sgl: '',
              dbl: '',
              trp: '',
              other: '',
              confNo: '',
              ref: '',
              invoiceReceived: false
            })).filter(h => h.hotelName);
          }
          // Legacy fallback: top-level options shape
          const topOptions = Array.isArray(data.options) ? data.options : [];
          const topPrimary = topOptions.find(o => Array.isArray(o.accommodations) && o.accommodations.length > 0) || null;
          const topAccs = Array.isArray(topPrimary?.accommodations) ? topPrimary.accommodations : [];
          return topAccs.map(acc => ({
            hotelName: acc.hotelName || '',
            checkIn: data.arrivalDate || data.dateArr || '',
            checkOut: data.departureDate || data.dateDep || '',
            roomType: acc.roomType || '',
            meal: acc.board || acc.mealPlan || '',
            nights: acc.nights || 0,
            notes: '',
            specialRates: '',
            addNotes: '',
            status: '',
            bookedBy: '',
            cancelDate: '',
            pax: paxCount,
            sgl: '',
            dbl: '',
            trp: '',
            other: '',
            confNo: '',
            ref: '',
            invoiceReceived: false
          })).filter(h => h.hotelName);
        })();
    
        // Check for itinerary items in the enhanced format and prefill date/day from arrivalDate
        const baseArrDate = data.arrivalDate || data.dateArr || '';
        const startDateObj = baseArrDate ? new Date(baseArrDate) : null;
    
        let itineraries = [];
        if (data.itineraryItems && Array.isArray(data.itineraryItems)) {
          itineraries = data.itineraryItems.map((item, idx) => {
            const dateStr = startDateObj ? new Date(startDateObj.getTime() + idx * 86400000).toISOString().slice(0, 10) : '';
            const dayStr = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }) : '';
            return {
              date: dateStr,
              day: dayStr,
              itinerary: item,
              serviceType: '',
              guideName: '',
              accNights: false,
              lunchIncluded: false,
              dinnerIncluded: false,
              lunchRestaurant: '',
              dinnerRestaurant: '',
              lunchPriceOriginal: 0,
              lunchPriceCurrency: 'JOD',
              lunchPriceUSD: 0,
              dinnerPriceOriginal: 0,
              dinnerPriceCurrency: 'JOD',
              dinnerPriceUSD: 0
            };
          });
        } else {
          const lines = data.itinerary?.split('\n').filter(i => i.trim()) || [];
          itineraries = lines.map((txt, idx) => {
            const dateStr = startDateObj ? new Date(startDateObj.getTime() + idx * 86400000).toISOString().slice(0, 10) : '';
            const dayStr = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }) : '';
            return {
              date: dateStr,
              day: dayStr,
              itinerary: String(txt).trim(),
              serviceType: '',
              guideName: '',
              accNights: false,
              lunchIncluded: false,
              dinnerIncluded: false,
              lunchRestaurant: '',
              dinnerRestaurant: '',
              lunchPriceOriginal: 0,
              lunchPriceCurrency: 'JOD',
              lunchPriceUSD: 0,
              dinnerPriceOriginal: 0,
              dinnerPriceCurrency: 'JOD',
              dinnerPriceUSD: 0
            };
          });
        }
    
                // Prefill Entrance rows with priority:
                // 1) From quotation itinerary explicit entrances if present
                // 2) Fallback: derive from itinerary text (Petra, Jerash, Wadi Rum)
                const detectLocationFromText = (text = '') => {
                  const s = String(text).toLowerCase();
                  const candidates = ["Amman","Jerash","Madaba","Mount Nebo","Petra","Wadi Rum","Dead Sea","Aqaba","Ajloun","Kerak","Um Qais"];
                  for (const loc of candidates) {
                    if (s.includes(loc.toLowerCase())) return loc;
                  }
                  return '';
                };

                let entranceRows = [];

                // Try explicit entrances from the first quotation's itinerary (if available)
                if (Array.isArray(data?.quotations) && data.quotations.length > 0 && Array.isArray(data.quotations[0]?.itinerary)) {
                  const qItin = data.quotations[0].itinerary;
                  const fromQ = [];
                  qItin.forEach(day => {
                    if (Array.isArray(day?.entrances) && day.entrances.length) {
                      day.entrances.forEach((entranceName) => {
                        if (!entranceName) return;
                        const dateStr = day.date || '';
                        const dayStr = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }) : (day.day || '');
                        const loc = detectLocationFromText(day.itinerary || entranceName) || entranceName;
                        fromQ.push({
                          date: dateStr,
                          day: dayStr,
                          time: '',
                          notes: '',
                          entrance: entranceName,
                          itinerary: loc,
                          pax: paxCount || data.pax || firstQuotation.pax || '',
                          invRec: false
                        });
                      });
                    }
                  });
                  if (fromQ.length) {
                    entranceRows = fromQ;
                  }
                }

                // Fallback to deriving from computed itineraries array
                if (!entranceRows.length && Array.isArray(itineraries)) {
                  const fallback = itineraries
                    .map((row) => {
                      const entranceName = detectLocationFromText(row.itinerary);
                      if (!entranceName) return null;
                      return {
                        date: row.date || '',
                        day: row.day || (row.date ? new Date(row.date).toLocaleDateString('en-US', { weekday: 'long' }) : ''),
                        time: '',
                        notes: '',
                        entrance: entranceName,
                        itinerary: entranceName,
                        pax: paxCount || '',
                        invRec: false
                      };
                    })
                    .filter(Boolean);
                  entranceRows = fallback;
                }
        
        // Process inclusions for the Inclusions tab
        const inclusionsArray = data.inclusions?.split('\n').filter(i => i.trim()) || [];
        const formattedInclusions = inclusionsArray.map(inclusion => ({
          yes: true,
          no: false,
          inclusion: inclusion
        }));
    
        // Merge extra Entrance rows parsed from inclusions text (e.g., "Entrance fees to: Jerash, Petra One Day Visit - Regular, Amman City Tour (Amman Citadel + Roman Theater)")
        try {
          const inclusionsText = String(data?.inclusions || "");
          const lines = inclusionsText.split(/\r?\n/);
          const parsedNames = [];
          lines.forEach((ln) => {
            const m = ln.match(/Entrance\s*fees\s*to\s*:\s*(.+)/i);
            if (m && m[1]) {
              m[1].split(/,| and /i).forEach((part) => {
                const name = String(part).trim();
                if (name) parsedNames.push(name);
              });
            }
          });
    
          // Helper: find a date/day for a location by scanning quotation itinerary first, then computed itineraries
          const findDateForLocation = (loc) => {
            // Prefer quotation itinerary if available
            if (Array.isArray(data?.quotations?.[0]?.itinerary)) {
              const hit = data.quotations[0].itinerary.find(it =>
                String(it.itinerary || '').toLowerCase().includes(String(loc).toLowerCase())
              );
              if (hit) {
                const d = hit.date || '';
                const day = hit.day || (d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long' }) : '');
                return { date: d, day };
              }
            }
            // Fallback: search the computed itineraries list we built above
            if (Array.isArray(itineraries)) {
              const hit = itineraries.find(it =>
                String(it.itinerary || '').toLowerCase().includes(String(loc).toLowerCase())
              );
              if (hit) {
                const d = hit.date || '';
                const day = hit.day || (d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long' }) : '');
                return { date: d, day };
              }
            }
            return { date: '', day: '' };
          };
    
          const existingLower = new Set((entranceRows || []).map(r => String(r.entrance).toLowerCase()));
          parsedNames.forEach((entrName) => {
            if (existingLower.has(String(entrName).toLowerCase())) return;
            const loc = detectLocationFromText ? (detectLocationFromText(entrName) || entrName) : entrName;
            const { date, day } = findDateForLocation(loc);
            entranceRows.push({
              date,
              day,
              time: '',
              notes: '',
              entrance: entrName,
              itinerary: loc,
              pax: paxCount || data?.pax || firstQuotation?.pax || '',
              invRec: false
            });
          });
        } catch (e) {
          console.warn("Failed to parse/merge entrances from inclusions text", e);
        }
    
    // Create the new reservation object with properly formatted data
    const newReservation = {
      id: newFileNo,

      // Links back to the originating Offer/Quotation (used by RES Details tab)
      relatedOfferId: data.id || data.offerId || null,
      relatedQuotationId: data.quotationId || null,

      // Lightweight snapshots so viewers still work even if IDs are missing
      relatedOfferSnapshot: data || null,
      relatedQuotationSnapshot: (data.quotationId ? null : {
        id: data.quotationId || null,
        group: data.group || data.groupName || '',
        agent: data.agent || '',
        arrivalDate: data.arrivalDate || data.dateArr || '',
        departureDate: data.departureDate || data.dateDep || '',
        quotations: data.quotations || [],
        options: data.options || []
      }),

      generalData: {
        groupName: data.groupName || data.group || '',
        agent: data.agent || '',
        nationality: data.nationality || '',
        clientName: '',  // This field doesn't exist in offer data
        reservationCode: newFileNo,
        fileNo: newFileNo, // Ensure fileNo is set in generalData
        depTax: '',
        visa: '',
        entries: '',
        tips: '',
        // Convenience duplicates for easy access in viewers
        offerId: data.id || data.offerId || null,
        quotationId: data.quotationId || null
      },
      ArrDep: [
        {
          arr: true,
          dep: false,
          date: data.arrivalDate || data.dateArr || '',
          from: '',
          to: '',
          border: '',
          flight: '',
          time: '',
          pax: paxCount,
          meetBy: '',
          driverName: '',
          notes: ''
        },
        {
          arr: false,
          dep: true,
          date: data.departureDate || data.dateDep || '',
          from: '',
          to: '',
          border: '',
          flight: '',
          time: '',
          pax: paxCount,
          meetBy: '',
          driverName: '',
          notes: ''
        }
      ],
      Hotels: hotels,
      Transportation: data.transportation?.map(t => ({
        transCo: '',
        vehicleType: t.vehicleType || '',
        driverName: '',
        notes: '',
        specialRates: '',
        fromDate: data.arrivalDate || data.dateArr || '',
        toDate: data.departureDate || data.dateDep || '',
        status: '',
        pax: paxCount,
        confNo: '',
        pickup: '',
        dropoff: '',
        invRec: false,
        resvNo: ''
      })) || [],
      Restaurants: [], // Initialize empty restaurants array
      Itineraries: itineraries,
      Inclusions: formattedInclusions, // Use the formatted inclusions for the Inclusions tab
      Exclusions: data.exclusions?.split('\n').filter(i => i.trim()) || [],
      Entrance: entranceRows,
      EmailHistory: data.EmailHistory || []
    };

    // Determine which fields are still empty and should be subtly highlighted
    const computedEF = computeEmptyFieldsFromReservation(newReservation);
    const mergedEF = Array.from(new Set([...(precomputedEmptyFields || []), ...computedEF]));
    setEmptyFields(mergedEF);

    // Update the reservation state
    setReservation(newReservation);
    
    // Save to localStorage
    const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
    allReservations[newFileNo] = newReservation;
    localStorage.setItem("reservations", JSON.stringify(allReservations));
    alert(`Reservation ${newFileNo} created from offer!`);
    navigate(`/reservations/${newFileNo}`);
  };

  // Generic change handler passed to tabs (e.g., General) for live syncing
  // Also persists to localStorage so Reports/Operations can see updated pax immediately
  const handleDataChange = (partial) => {
    const updated = { ...reservation, ...partial };

    // If generalData provided, normalize fileNo fields
    const currentFileNo =
      updated?.generalData?.fileNo ||
      reservation?.generalData?.fileNo ||
      fileNo;

    const normalized = {
      ...updated,
      id: currentFileNo || fileNo,
      generalData: {
        ...(updated.generalData || reservation.generalData || {}),
        fileNo: currentFileNo || fileNo,
        reservationCode: currentFileNo || fileNo,
      },
    };

    setReservation(normalized);

    try {
      if (currentFileNo) {
        const all = JSON.parse(localStorage.getItem("reservations") || "{}");
        all[currentFileNo] = {
          ...(all[currentFileNo] || {}),
          ...normalized,
        };
        localStorage.setItem("reservations", JSON.stringify(all));
      }
    } catch (e) {
      console.warn("Failed to persist live reservation changes:", e);
    }
  };

  const handleSave = (tabData) => {
    const updatedReservation = { ...reservation, ...tabData };
    setReservation(updatedReservation);

    if (Object.keys(tabData)[0] === 'generalData') {
        const tabFileNo = tabData.generalData.fileNo;
        if (!tabFileNo) {
            alert("File No. is required to save the reservation.");
            return;
        }
        setFileNo(tabFileNo);
        const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
        allReservations[tabFileNo] = updatedReservation;
        localStorage.setItem("reservations", JSON.stringify(allReservations));
        alert(`Reservation ${tabFileNo} saved!`);
        navigate(`/reservations/${tabFileNo}`);
    }
  };
  
  // Function to save the entire reservation
  const saveFullReservation = () => {
    if (!fileNo) {
      alert("File No. is required to save the reservation.");
      return;
    }
    
    // Make sure the reservation has the current fileNo
    const reservationToSave = {
      ...reservation,
      id: fileNo,
      generalData: {
        ...(reservation.generalData || {}),
        fileNo: fileNo,
        reservationCode: fileNo
      }
    };
    
    // Save to localStorage
    const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
    allReservations[fileNo] = reservationToSave;
    localStorage.setItem("reservations", JSON.stringify(allReservations));
    
    // Create JSON and trigger download
    const reservationJSON = JSON.stringify(reservationToSave, null, 2);
    const blob = new Blob([reservationJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservation-${fileNo}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Reservation ${fileNo} saved and downloaded!`);
  };

  const ActiveComponent = tabs[activeTab];

  return (
    <div style={{ color: "white", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px" }}>New Reservation</h1>
        <button
          onClick={saveFullReservation}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Save Full Reservation
        </button>
      </div>
      
      <div className="tab-container">
        {Object.keys(tabs).map(tabName => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            style={getTabStyle(tabName, activeTab)}
          >
            {tabName}
          </button>
        ))}
      </div>

      {ActiveComponent ? (
        <ActiveComponent
          data={reservation}
          initialData={activeTab === "General" ? reservation.generalData :
                      activeTab === "Arr/Dep" ? reservation.ArrDep :
                      activeTab === "Inclusions" ? reservation.Inclusions :
                      activeTab === "Restaurants" ? reservation.Restaurants :
                      reservation[activeTab]}
          onSave={handleSave}
          onDataChange={handleDataChange}
          onFileDrop={handleFileDrop}
          fileNo={fileNo}
          emptyFields={emptyFields}
          getHighlightedStyle={getHighlightedStyle}
          itineraryLocations={computeItineraryLocations(reservation?.Itineraries)}
        />
      ) : (
        <p>Loading tab...</p>
      )}
    </div>
  );
}

const getTabStyle = (tabName, activeTab) => ({
  display: "inline-block",
  padding: "10px 20px",
  border: "none",
  backgroundColor: tabName === activeTab ? "#007bff" : "transparent",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: tabName === activeTab ? "bold" : "normal",
  borderBottom: tabName === activeTab ? "3px solid #007bff" : "3px solid transparent",
  marginBottom: "-2px"
});

export default NewReservation;