import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reservationDump from "../data/reservationDump.json";
import "./Reservations.css";
import { getOneFromStorage } from "../assets/utils/storage";

// Import all the reservation tabs
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
import ResDetails from "./ReservationsTabs/ResDetails";

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

function Reservations() {
  const { fileNo } = useParams();
  const [reservation, setReservation] = useState(null);
  const [activeTab, setActiveTab] = useState("RES Details");
  const [emptyFields, setEmptyFields] = useState([]);
  // Track external/cross-tab status (e.g., cancellation) to reflect badge reliably
  const [externalStatus, setExternalStatus] = useState(() => {
    try {
      const map = JSON.parse(localStorage.getItem("reservationStatus") || "{}");
      return map[fileNo] || "";
    } catch (_) { return ""; }
  });

  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("reservationStatus");
      bc.onmessage = (ev) => {
        const { id, status } = ev.data || {};
        if (!id || !status) return;
        const curId = fileNo || reservation?.id;
        if (id === curId) setExternalStatus(status);
      };
    } catch (_) {}
    return () => { try { bc && bc.close(); } catch (_) {} };
  }, [fileNo, reservation?.id]);

  const isCancelled = String(
    reservation?.status || reservation?.generalData?.status || externalStatus || ""
  ).toLowerCase() === "cancelled";

  useEffect(() => {
    // First check if we have data in reservationDump
    if (reservationDump[fileNo]) {
      // Check if there's saved data in localStorage
      const saved = JSON.parse(localStorage.getItem("reservations") || "{}");
      if (saved[fileNo]) {
        // Merge saved data over dump data
        setReservation({ ...reservationDump[fileNo], ...saved[fileNo] });
      } else {
        // Use dump data directly
        setReservation(reservationDump[fileNo]);
      }
    } else {
      // No dump data, check localStorage only
      const saved = JSON.parse(localStorage.getItem("reservations") || "{}");
      if (saved[fileNo]) {
        setReservation(saved[fileNo]);
      }
    }
  }, [fileNo]);

  const handleFileDrop = (data, emptyFieldsList = []) => {
    const newFileNo = `RES-${Date.now()}`;
    
    console.log("Received data in handleFileDrop:", data);
    console.log("Received empty fields:", emptyFieldsList);
    console.log("Data structure:", Object.keys(data));
    
    // Extract quotation data if available
    const quotation = data.quotations && data.quotations.length > 0 ? data.quotations[0] : null;
    console.log("First quotation:", quotation);
    
    // Log specific fields we're trying to extract
    console.log("Group name fields:", {
      group: data.group,
      groupName: data.groupName,
      quotationGroup: quotation ? quotation.group : null
    });
    
    console.log("ArrDep fields:", {
      arrivalDate: data.arrivalDate || (quotation ? quotation.arrivalDate : null),
      dateArr: data.dateArr,
      departureDate: data.departureDate || (quotation ? quotation.departureDate : null),
      dateDep: data.dateDep
    });
    
    // Set empty fields state
    setEmptyFields(emptyFieldsList);
    
    // Parse hotels data
    const hotelsData = data.hotels?.map(hotel => ({
      hotelName: hotel.name || '',
      checkIn: hotel.checkIn || '',
      checkOut: hotel.checkOut || '',
      nights: hotel.nights || 0,
      roomType: hotel.roomType || '',
      meal: hotel.mealPlan || '',
      pax: hotel.pax || '',
      sgl: hotel.sgl || '',
      dbl: hotel.dbl || '',
      trp: hotel.trp || '',
      invoiceReceived: false,
      notes: '',
      specialRates: '',
      addNotes: '',
      status: '',
      bookedBy: '',
      cancelDate: '',
      other: '',
      confNo: '',
      ref: ''
    })) || [];

    // Parse entrance data
    let entranceData = [];
    
    // First check if there are entrances in the traditional format
    if (data.entrances && Array.isArray(data.entrances)) {
      entranceData = data.entrances.map(entrance => ({
        date: entrance.date || '',
        day: entrance.date ? new Date(entrance.date).toLocaleDateString('en-US', { weekday: 'long' }) : '',
        entrance: entrance.name || '',
        itinerary: entrance.name || '',
        pax: entrance.pax || data.pax || '',
        time: '',
        notes: '',
        invRec: false
      }));
    }
    // Then check if there are entrances in the quotation itinerary format
    else if (data.quotations && Array.isArray(data.quotations) && data.quotations.length > 0) {
      const quotation = data.quotations[0];
      if (quotation.itinerary && Array.isArray(quotation.itinerary)) {
        // Extract entrances from each day in the itinerary
        quotation.itinerary.forEach(day => {
          if (day.entrances && Array.isArray(day.entrances)) {
            day.entrances.forEach(entranceName => {
              if (entranceName) {
                entranceData.push({
                  date: day.date || '',
                  day: day.day || (day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }) : ''),
                  entrance: entranceName,
                  itinerary: day.itinerary || '',
                  pax: data.pax || quotation.pax || '',
                  time: '',
                  notes: '',
                  invRec: false
                });
              }
            });
          }
        });
      }
    }

    // Also merge in entrances parsed from inclusions text (e.g., "Entrance fees to: Jerash, Petra One Day Visit - Regular")
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

      // Helpers
      const detectLocationFromText = (text = '') => {
        const s = String(text).toLowerCase();
        const candidates = ["Amman","Jerash","Madaba","Mount Nebo","Petra","Wadi Rum","Dead Sea","Aqaba","Ajloun","Kerak","Um Qais","Roman Theater","Citadel"];
        for (const loc of candidates) {
          if (s.includes(loc.toLowerCase())) {
            // Normalize composite Amman city tour POIs to Amman
            if (/roman theater|citadel/i.test(loc) || /amman/i.test(s)) return "Amman";
            return loc;
          }
        }
        // Heuristics
        if (s.includes("city tour")) return "Amman";
        return '';
      };

      const findDateForLocation = (loc) => {
        // Prefer quotation itinerary if available
        if (data?.quotations?.[0]?.itinerary && Array.isArray(data.quotations[0].itinerary)) {
          const hit = data.quotations[0].itinerary.find(it => String(it.itinerary || '').toLowerCase().includes(String(loc).toLowerCase()));
          if (hit) {
            const d = hit.date || '';
            const day = hit.day || (d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long' }) : '');
            return { date: d, day };
          }
        }
        // Fallback: if top-level itinerary array exists
        if (Array.isArray(data?.itinerary)) {
          const hit = data.itinerary.find(it => String(it.itinerary || it.description || '').toLowerCase().includes(String(loc).toLowerCase()));
          if (hit) {
            const d = hit.date || '';
            const day = d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long' }) : '';
            return { date: d, day };
          }
        }
        return { date: '', day: '' };
      };

      const existingLower = new Set(entranceData.map(r => String(r.entrance).toLowerCase()));
      parsedNames.forEach((entrName) => {
        if (existingLower.has(String(entrName).toLowerCase())) return;
        const loc = detectLocationFromText(entrName) || entrName;
        const { date, day } = findDateForLocation(loc);
        entranceData.push({
          date,
          day,
          time: '',
          notes: '',
          entrance: entrName,
          itinerary: loc,
          pax: data?.pax || data?.quotations?.[0]?.pax || '',
          invRec: false
        });
      });
    } catch (e) {
      console.warn("Failed to parse entrances from inclusions text", e);
    }

    // Parse guides data from main data or from quotations
    let guidesData = [];
    
    // First try to get guides from the main data
    if (data.guides && Array.isArray(data.guides) && data.guides.length > 0) {
      guidesData = data.guides.map(guide => ({
        guideName: guide.name || '',
        language: guide.language || '',
        fromDate: guide.fromDate || guide.date || '',
        toDate: guide.toDate || guide.date || '',
        notes: guide.notes || '',
        specialRates: guide.specialRates || '',
        status: guide.status || '',
        days: guide.days || '',
        overnight: guide.overnight || guide.accNights || '',
        invRec: guide.invRec || false
      }));
    }
    // If no guides in main data, try to extract from quotations
    else if (data.quotations && data.quotations.length > 0 && data.quotations[0].itinerary) {
      // Extract guide info from the first quotation's itinerary
      const quotation = data.quotations[0];
      const guideEntries = quotation.itinerary.filter(item => item.guideRequired);
      
      if (guideEntries.length > 0) {
        // Create a guide entry based on the first guide-required itinerary item
        const firstGuideEntry = guideEntries[0];
        guidesData = [{
          guideName: '',
          language: firstGuideEntry.guideLanguage || '',
          fromDate: firstGuideEntry.date || quotation.arrivalDate || '',
          toDate: quotation.departureDate || '',
          notes: '',
          specialRates: '',
          status: '',
          days: guideEntries.length.toString(),
          overnight: '0',
          invRec: false
        }];
      }
    }
    
    console.log("Processed guides data:", guidesData);

    // Parse itineraries data from main data or from quotations
    let itinerariesData = [];
    
    // First try to get itinerary from the main data
    if (data.itinerary && Array.isArray(data.itinerary) && data.itinerary.length > 0) {
      itinerariesData = data.itinerary.map(item => {
        // Ensure date is properly formatted
        const date = item.date || '';
        // Calculate day from date if available
        const day = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) : item.day || '';
        
        return {
          date: date,
          day: day,
          itinerary: item.description || item.itinerary || '',
          serviceType: item.serviceType || '',
          guideName: item.guideName || '',
          accNights: item.accNights || false
        };
      });
    }
    // If no itinerary in main data, try to extract from quotations
    else if (data.quotations && data.quotations.length > 0 && data.quotations[0].itinerary) {
      // Extract itinerary from the first quotation
      const quotation = data.quotations[0];
      itinerariesData = quotation.itinerary.map(item => {
        // Ensure date is properly formatted
        const date = item.date || '';
        // Calculate day from date if available
        const day = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) : item.day || '';
        
        return {
          date: date,
          day: day,
          itinerary: item.itinerary || '',
          serviceType: item.transportType || '',
          guideName: item.guideRequired ? 'Guide Required' : '',
          accNights: item.accNights || false
        };
      });
    }
    
    console.log("Processed itineraries data:", itinerariesData);

    // Extract group name from quotation if available
    let groupName = data.group || data.groupName || '';
    if (!groupName && data.quotations && data.quotations.length > 0) {
      groupName = data.quotations[0].group || data.quotations[0].groupName || '';
    }
    
    // If we still don't have a group name, try to extract it from other fields
    if (!groupName) {
      if (data.id) {
        groupName = `Group ${data.id}`;
      } else if (data.fileNo) {
        groupName = `Group ${data.fileNo}`;
      } else {
        groupName = `New Group ${new Date().toISOString().slice(0, 10)}`;
      }
    }
    
    console.log("Final group name to use:", groupName);
    
    // Extract agent name from quotation if available
    let agentName = data.agent || data.agentName || '';
    if (!agentName && data.quotations && data.quotations.length > 0) {
      agentName = data.quotations[0].agent || '';
    }
    console.log("Final agent name to use:", agentName);
    
    // Create the general data object
    const generalData = {
      groupName: groupName,
      agent: agentName,
      nationality: data.nationality || '',
      reservationCode: data.reservationCode || data.bookingReference || '',
      clientName: data.clientName || '',
      depTax: '',
      visa: '',
      entries: '',
      tips: ''
    };
    
    console.log("Created generalData object:", generalData);
    
    const newReservation = {
      id: newFileNo,
      generalData: generalData,
      ArrDep: [
        {
          arr: true,
          dep: false,
          date: data.arrivalDate || data.dateArr || (data.quotations && data.quotations.length > 0 ? data.quotations[0].arrivalDate : '') || '',
          from: data.arrivalFrom || data.from || '',
          to: data.arrivalTo || data.to || 'Amman',
          border: data.arrivalBorder || data.border || '',
          flight: data.arrivalFlight || data.flight || '',
          time: data.arrivalTime || data.time || '',
          pax: data.pax || (data.quotations && data.quotations.length > 0 ? data.quotations[0].pax : '') || '',
          meetBy: data.meetBy || data.meetby || '',
          driverName: data.driverName || data.driver || '',
          notes: data.arrivalNotes || data.notes || ''
        },
        {
          arr: false,
          dep: true,
          date: data.departureDate || data.dateDep || (data.quotations && data.quotations.length > 0 ? data.quotations[0].departureDate : '') || '',
          from: data.departureFrom || data.from || 'Amman',
          to: data.departureTo || data.to || '',
          border: data.departureBorder || data.border || '',
          flight: data.departureFlight || data.flight || '',
          time: data.departureTime || data.time || '',
          pax: data.pax || (data.quotations && data.quotations.length > 0 ? data.quotations[0].pax : '') || '',
          meetBy: data.meetBy || data.meetby || '',
          driverName: data.driverName || data.driver || '',
          notes: data.departureNotes || data.notes || ''
        }
      ],
      Hotels: hotelsData,
      Entrance: entranceData,
      Guides: guidesData,
      Itineraries: itinerariesData,
      pax: data.pax,
      inclusions: data.inclusions,
      exclusions: data.exclusions,
    };
    console.log("Setting reservation with new data:", newReservation);
    setReservation(newReservation);
    
    // Force a re-render to ensure the UI updates with the highlighted fields
    setTimeout(() => {
      console.log("File dropped and processed, emptyFields:", emptyFieldsList);
      // Force update by making a harmless state change
      setReservation(prev => {
        console.log("Forcing update with current data:", prev);
        return {...prev};
      });
      
      // Double check that the General tab data is correct
      console.log("After force update, generalData:", newReservation.generalData);
    }, 100);
    
    // Switch to General tab after processing
    setActiveTab("General");
  };
  
  // Helper function to check if a field should be highlighted
  const shouldHighlightField = (fieldPath) => {
    console.log("Checking if field should be highlighted:", fieldPath, "Empty fields:", emptyFields);
    return emptyFields.includes(fieldPath);
  };
  
  // Style generator for input fields that might need highlighting
  const getHighlightedStyle = (baseStyle, fieldPath) => {
    if (shouldHighlightField(fieldPath)) {
      console.log("Highlighting field:", fieldPath);
      return {
        ...baseStyle,
        borderColor: "#ff4d4d",
        backgroundColor: "rgba(255, 77, 77, 0.1)"
      };
    }
    return baseStyle;
  };

  const handleSave = (tabData) => {
    const updatedReservation = { ...reservation, ...tabData };
    setReservation(updatedReservation);
    const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
    allReservations[fileNo || reservation.id] = updatedReservation;
    localStorage.setItem("reservations", JSON.stringify(allReservations));
    alert(`${activeTab} data saved!`);
  };
  
  // Function to save the entire reservation and download as JSON
  const saveFullReservation = () => {
    if (!reservation) {
      alert("No reservation data to save.");
      return;
    }
    
    const reservationId = fileNo || reservation.id;
    
    // Make sure the reservation has the current fileNo
    const reservationToSave = {
      ...reservation,
      id: reservationId,
      generalData: {
        ...(reservation.generalData || {}),
        fileNo: reservationId,
        reservationCode: reservationId
      }
    };
    
    // Save to localStorage
    const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
    allReservations[reservationId] = reservationToSave;
    localStorage.setItem("reservations", JSON.stringify(allReservations));
    
    // Create JSON and trigger download
    const reservationJSON = JSON.stringify(reservationToSave, null, 2);
    const blob = new Blob([reservationJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservation-${reservationId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Reservation ${reservationId} saved and downloaded!`);
  };

  const cancelReservation = () => {
    if (!reservation) {
      alert("No reservation loaded.");
      return;
    }
    const reservationId = fileNo || reservation.id;
    if (!window.confirm(`Mark reservation ${reservationId} as CANCELLED?`)) return;

    const updatedReservation = {
      ...reservation,
      status: "cancelled",
      generalData: {
        ...(reservation.generalData || {}),
        status: "cancelled",
      },
    };

    setReservation(updatedReservation);

    // Persist to localStorage object store keyed by fileNo/id
    const allReservations = JSON.parse(localStorage.getItem("reservations") || "{}");
    allReservations[reservationId] = updatedReservation;
    localStorage.setItem("reservations", JSON.stringify(allReservations));

    // Maintain a lightweight status map to avoid server overwrites on list fetch
    try {
      const statusMap = JSON.parse(localStorage.getItem("reservationStatus") || "{}");
      statusMap[reservationId] = "cancelled";
      localStorage.setItem("reservationStatus", JSON.stringify(statusMap));
      // Broadcast to other tabs if open
      try { const bc = new BroadcastChannel("reservationStatus"); bc.postMessage({ id: reservationId, status: "cancelled" }); bc.close(); } catch (_) {}
    } catch (_) {}

    alert(`Reservation ${reservationId} marked as CANCELLED`);
  };

  const dataURLtoBlob = (dataurl) => {
    if (!dataurl) return null;
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };
  
  // Download bundle: ZIP with Quotation.xlsx, Offer.pdf, Emails.eml, CoverPage.pdf, ConfirmationLetter.pdf
  const downloadReservationBundle = async () => {
    try {
      if (!reservation) {
        alert("No reservation loaded.");
        return;
      }
  
      // Lazy-import heavy libs to avoid loading issues and reduce initial bundle impact
      const [{ jsPDF }, jszipModule, fileSaverModule, XLSX] = await Promise.all([
        import("jspdf"),
        import("jszip"),
        import("file-saver"),
        import("xlsx"),
      ]);
      const JSZip = jszipModule.default || jszipModule;
      const { saveAs } = fileSaverModule;
  
      // Local helpers that use the dynamically imported libs
      const createOfferPdfBlob = (offerLike) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        let y = 60;
  
        const get = (obj, ...keys) => {
          for (const k of keys) {
            if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
          }
          return "";
        };
  
        const group = get(offerLike, "groupName") || get(offerLike, "group") || "";
        const agent = get(offerLike, "agent") || "";
        const arr = get(offerLike, "dateArr") || get(offerLike, "arrivalDate") || "";
        const dep = get(offerLike, "dateDep") || get(offerLike, "departureDate") || "";
        const nationality = get(offerLike, "nationality") || "";
  
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Offer Summary", pageWidth / 2, y, { align: "center" });
        y += 30;
  
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Group:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(group), margin + 120, y);
        y += 18;
  
        doc.setFont("helvetica", "bold");
        doc.text("Agent:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(agent), margin + 120, y);
        y += 18;
  
        doc.setFont("helvetica", "bold");
        doc.text("Arrival:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(arr), margin + 120, y);
  
        doc.setFont("helvetica", "bold");
        doc.text("Departure:", margin + 280, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(dep), margin + 360, y);
        y += 18;
  
        doc.setFont("helvetica", "bold");
        doc.text("Nationality:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(nationality), margin + 120, y);
        y += 28;
  
        const accommodations = [];
        (Array.isArray(offerLike?.quotations) ? offerLike.quotations : []).forEach((q) => {
          (Array.isArray(q?.options) ? q.options : []).forEach((o) => {
            if (Array.isArray(o?.accommodations)) accommodations.push(...o.accommodations);
          });
        });
  
        if (accommodations.length) {
          doc.setFont("helvetica", "bold");
          doc.text("Accommodations:", margin, y);
          y += 14;
          doc.setFont("helvetica", "normal");
          accommodations.slice(0, 20).forEach((acc, idx) => {
            const line = `${idx + 1}. ${acc.hotelName || "-"} — ${acc.roomType || "-"} — ${acc.board || "-"} — ${acc.nights || 0} night(s)`;
            doc.text(line, margin + 10, y);
            y += 14;
          });
        }
  
        return doc.output("blob");
      };
  
      const createQuotationPdfBlob = (quotationLike) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        let y = 60;

        const get = (obj, ...keys) => { for (const k of keys) { if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; } return ""; };
        const group = get(quotationLike, "group") || get(quotationLike, "groupName") || "";
        const agent = get(quotationLike, "agent") || "";
        const arr = get(quotationLike, "arrivalDate") || "";
        const dep = get(quotationLike, "departureDate") || "";
        const pax = get(quotationLike, "pax") || "";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Quotation", pageWidth / 2, y, { align: "center" });
        y += 30;

        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Group:", margin, y); doc.setFont("helvetica", "normal"); doc.text(String(group), margin + 120, y); y += 18;
        doc.setFont("helvetica", "bold"); doc.text("Agent:", margin, y); doc.setFont("helvetica", "normal"); doc.text(String(agent), margin + 120, y); y += 18;
        doc.setFont("helvetica", "bold"); doc.text("Arrival:", margin, y); doc.setFont("helvetica", "normal"); doc.text(String(arr), margin + 120, y);
        doc.setFont("helvetica", "bold"); doc.text("Departure:", margin + 280, y); doc.setFont("helvetica", "normal"); doc.text(String(dep), margin + 360, y); y += 18;
        doc.setFont("helvetica", "bold"); doc.text("Pax:", margin, y); doc.setFont("helvetica", "normal"); doc.text(String(pax), margin + 120, y); y += 24;

        // Itinerary section
        const itinerary = Array.isArray(quotationLike?.itinerary) ? quotationLike.itinerary : [];
        if (itinerary.length) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Itinerary", margin, y); y += 16;
          doc.setFont("helvetica", "normal"); doc.setFontSize(10);
          const maxWidth = pageWidth - margin * 2;
          itinerary.slice(0, 40).forEach((item, idx) => {
            const date = item.date || "";
            const line = `${idx + 1}. ${date ? date + " - " : ""}${item.itinerary || item.description || ""}`;
            const lines = doc.splitTextToSize(line, maxWidth);
            doc.text(lines, margin, y);
            y += Math.max(14, lines.length * 12);
            if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = 40; }
          });
        }

        return doc.output("blob");
      };
  
      const createQuotationExcelBlob = (quotationLike) => {
        const rows = [];
        if (Array.isArray(quotationLike?.itinerary)) {
          quotationLike.itinerary.forEach((item, idx) => {
            rows.push({
              Day: idx + 1,
              Date: item.date || "",
              Itinerary: item.itinerary || item.description || "",
              Transport: item.transportType || "",
              GuideRequired: item.guideRequired ? "Yes" : "No",
            });
          });
        } else if (Array.isArray(quotationLike?.quotations)) {
          quotationLike.quotations.forEach((pq) => {
            rows.push({
              PaxRange: pq.paxRange || "",
              Arrival: pq.arrivalDate || "",
              Departure: pq.departureDate || "",
              Options: Array.isArray(pq.options) ? pq.options.length : 0,
            });
          });
        } else {
          rows.push({
            Group: quotationLike?.group || quotationLike?.groupName || "",
            Arrival: quotationLike?.arrivalDate || "",
            Departure: quotationLike?.departureDate || "",
            Pax: quotationLike?.pax || "",
          });
        }
  
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Quotation");
        const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        return new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      };
  
      const resvId = (reservation.id || "RES") + "";
      const group = reservation?.generalData?.groupName || reservation?.groupName || reservation?.group || "reservation";
      const zip = new JSZip();
  
      // Load Offer, Quotation via IDs or snapshots
      let offer = null;
      let quotation = null;
  
      const offerId = reservation.relatedOfferId || reservation.generalData?.offerId;
      const quotationId = reservation.relatedQuotationId || reservation.generalData?.quotationId;
  
      if (offerId) {
        offer = await getOneFromStorage("offers", offerId);
      }
      if (!offer) {
        offer = reservation.relatedOfferSnapshot || null;
      }
  
      if (quotationId) {
        quotation = await getOneFromStorage("quotations", quotationId);
      }
      if (!quotation) {
        quotation = reservation.relatedQuotationSnapshot || null;
      }
  
      // Quotation as Excel
      if (quotation) {
        const qBlob = createQuotationExcelBlob(quotation);
        zip.file(`${group}_quotation.xlsx`, qBlob);
        const qpBlob = createQuotationPdfBlob(quotation);
        zip.file(`${group}_quotation.pdf`, qpBlob);
      }
  
      // Offer as PDF (simple summary)
      if (offer) {
        const oBlob = createOfferPdfBlob(offer);
        zip.file(`${group}_offer.pdf`, oBlob);
      }
  
      // Emails as .eml
      if (Array.isArray(reservation.EmailHistory) && reservation.EmailHistory.length) {
        reservation.EmailHistory.forEach((m, idx) => {
          const fileName = m.fileName?.toString().trim() || `email_${idx + 1}.eml`;
          const raw = m.raw || "";
          zip.file(fileName, new Blob([raw], { type: "message/rfc822" }));
        });
      }
  
      // Cover Page PDF (uploaded base64)
      if (reservation.CoverPage?.dataUrl) {
        const blob = dataURLtoBlob(reservation.CoverPage.dataUrl);
        if (blob) zip.file(`${group}_cover.pdf`, blob);
      }
  
      // Confirmation Letter PDF (uploaded base64)
      if (reservation.ConfirmationLetter?.dataUrl) {
        const blob = dataURLtoBlob(reservation.ConfirmationLetter.dataUrl);
        if (blob) zip.file(`${group}_confirmation_letter.pdf`, blob);
      }
  
      // Fallback: include reservation JSON manifest
      const manifest = new Blob([JSON.stringify(reservation, null, 2)], { type: "application/json" });
      zip.file(`${resvId}_reservation.json`, manifest);
  
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${group}_reservation_bundle.zip`);
    } catch (e) {
      console.error("Failed to build reservation bundle:", e);
      alert("Failed to download reservation bundle.");
    }
  };
  
  const handleDataChange = (tabData) => {
    // This function is for real-time data syncing without saving to localStorage
    const updatedReservation = { ...reservation, ...tabData };
    setReservation(updatedReservation);
  };

  const ActiveComponent = tabs[activeTab];

  // Map tab names to data keys in the reservation object
  const getTabData = () => {
    if (!reservation) return null;
    
    console.log("Getting tab data for:", activeTab);
    console.log("Reservation data:", reservation);
    
    const tabDataMap = {
      "General": reservation.generalData,
      "Hotels": reservation.Hotels,
      "Transportation": reservation.Transportation,
      "Itineraries": reservation.Itineraries,
      "Inclusions": reservation.Inclusions,
      "Arr/Dep": reservation.ArrDep,
      "Entrance": reservation.Entrance,
      "Guides": reservation.Guides,
      "Restaurants": reservation.Restaurants,
      "Extras": reservation.Extras,
      "Clients": reservation.Clients,
      "Attach": reservation.Attach,
      "Reminder": reservation.Reminder,
      "Log": reservation.Log
    };
    
    const result = tabDataMap[activeTab] || null;
    
    // Add extra debugging for General tab
    if (activeTab === "General") {
      console.log("General tab data:", result);
      console.log("Group name in general data:", result ? result.groupName : "No group name");
      console.log("Agent name in general data:", result ? result.agent : "No agent name");
    }
    
    console.log("Tab data for", activeTab, ":", result);
    return result;
  };

  return (
    <div style={{ color: "white", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
          Reservation: {fileNo || reservation?.id}
          {isCancelled && (
            <span style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 0 8px rgba(220,53,69,0.35)",
              border: "1px solid rgba(220,53,69,0.6)"
            }}>
              Cancelled
            </span>
          )}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {reservation && reservation.generalData && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>{reservation.generalData.groupName}</div>
              <div style={{ fontSize: "14px", color: "#ccc" }}>{reservation.generalData.agent}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
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
            <button
              onClick={downloadReservationBundle}
              style={{
                backgroundColor: "#6f42c1",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              title="Download a ZIP with Quotation.xlsx, Quotation.pdf, Offer.pdf, Emails (.eml), Cover/Confirmation PDFs"
            >
              Download Reservation
            </button>
            <button
              onClick={cancelReservation}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              title="Mark this reservation as CANCELLED"
            >
              Cancel Reservation
            </button>
          </div>
        </div>
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

      {activeTab === "General" && reservation ? (
        <General
          initialData={reservation.generalData}
          onSave={handleSave}
          onDataChange={handleDataChange}
          fileNo={fileNo || reservation?.id}
          emptyFields={emptyFields}
          getHighlightedStyle={getHighlightedStyle}
          data={reservation}
        />
      ) : (
        <ActiveComponent
          initialData={getTabData()}
          onSave={handleSave}
          onDataChange={handleDataChange}
          onFileDrop={handleFileDrop}
          fileNo={fileNo || reservation?.id}
          data={reservation}
          emptyFields={emptyFields}
          getHighlightedStyle={getHighlightedStyle}
        />
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

export default Reservations;
