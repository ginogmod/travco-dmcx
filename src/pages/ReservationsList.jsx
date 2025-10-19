import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFromStorage, deleteFromStorage } from "../assets/utils/storage";

function ReservationsList() {
  const [reservations, setReservations] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 50;

  const [filters, setFilters] = useState({
    fileNo: "",
    agent: "",
    nationality: "",
    hotel: "",
    dateFrom: "",
    dateTo: ""
  });

  // Track reservation status (e.g., cancelled) persisted by detail page
  const [statusMap, setStatusMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reservationStatus") || "{}"); } catch (_) { return {}; }
  });

  const navigate = useNavigate();

  // Listen for cross-tab / in-app updates to reservation status (e.g. cancellation)
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("reservationStatus");
      bc.onmessage = (ev) => {
        const { id, status } = ev.data || {};
        if (!id || !status) return;
        setStatusMap(prev => ({ ...prev, [id]: status }));
        // Also enrich current state item to reflect new status immediately
        setReservations(prev => {
          const cur = { ...(prev || {}) };
          if (cur[id]) {
            cur[id] = {
              ...cur[id],
              status,
              generalData: { ...(cur[id].generalData || {}), status }
            };
          }
          return cur;
        });
      };
    } catch (_) {}
    return () => { try { bc && bc.close(); } catch (_) {} };
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Get reservations from storage (server or localStorage)
        const storedReservations = await getAllFromStorage("reservations") || [];
        
        // Convert array to object with fileNo as key if needed
        let reservationsObj = {};
        if (Array.isArray(storedReservations)) {
          storedReservations.forEach(res => {
            if (res.fileNo) {
              reservationsObj[res.fileNo] = res;
            }
          });
        } else {
          reservationsObj = storedReservations;
        }
        
        // Try to fetch the dump file as fallback/additional data
        try {
          const response = await fetch("/data/reservationDump.json");
          const fileDump = await response.json();
          const merged = { ...fileDump, ...reservationsObj };
          setReservations(merged);
        } catch (err) {
          console.error("Failed to load reservationDump.json:", err);
          setReservations(reservationsObj);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
        
        // Fallback to direct localStorage if everything else fails
        try {
          const saved = JSON.parse(localStorage.getItem("reservations") || "{}");
          setReservations(saved);
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
          setReservations({});
        }
      }
    };
    
    fetchReservations();
  }, []);

  const deleteReservation = async (fileNo) => {
    if (!window.confirm(`Delete reservation ${fileNo}?`)) return;
    
    try {
      // Try to delete using the storage utility first
      await deleteFromStorage("reservations", fileNo);
      
      // Update the local state
      const updated = { ...reservations };
      delete updated[fileNo];
      setReservations(updated);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      
      // Fallback to direct localStorage manipulation
      try {
        const updated = { ...reservations };
        delete updated[fileNo];
        localStorage.setItem("reservations", JSON.stringify(updated));
        setReservations(updated);
      } catch (localError) {
        console.error("Error updating localStorage:", localError);
        alert("Failed to delete reservation. Please try again.");
      }
    }
  };

  const matchesFilters = (fileNo, data) => {
    const general = data.generalData || data.General || {};
    const hotels = data.hotels || data.Hotels || [];
    const arrDep = data.arrDepRows || data.ArrDep || [];

    if (filters.fileNo && !fileNo.toLowerCase().includes(filters.fileNo.toLowerCase()))
      return false;

    if (filters.agent && general.agent !== filters.agent) return false;

    if (filters.nationality && general.nationality !== filters.nationality) return false;

    if (filters.hotel) {
      const foundHotel = hotels.find(h => h.hotelName === filters.hotel);
      if (!foundHotel) return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const allDates = arrDep.map(row => row.date).filter(Boolean);
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const to = filters.dateTo ? new Date(filters.dateTo) : null;
      const match = allDates.some(d => {
        const date = new Date(d);
        return (!from || date >= from) && (!to || date <= to);
      });
      if (!match) return false;
    }

    return true;
  };

  const filtered = Object.entries(reservations).filter(([fileNo, data]) =>
    matchesFilters(fileNo, data)
  );

  const pageCount = Math.ceil(filtered.length / perPage);
  const currentData = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const uniqueHotels = Array.from(
    new Set(
      Object.values(reservations)
        .flatMap((r) => (r.hotels || r.Hotels || []).map((h) => h.hotelName))
        .filter(Boolean)
    )
  );

  return (
    <div style={{ color: "white", padding: "30px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "36px" }}>Reservations</h1>
        <button onClick={() => navigate('/reservations/new')} style={buttonStyle("#007bff")}>New Reservation</button>
      </div>

      {/* FILTER PANEL */}
      <div
        style={{
          backgroundColor: "#1c1c1e",
          border: "1px solid #444",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
        }}
      >
        <input type="text" placeholder="Search File No" value={filters.fileNo} onChange={(e) => setFilters({ ...filters, fileNo: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Agent Name" value={filters.agent} onChange={(e) => setFilters({ ...filters, agent: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Nationality" value={filters.nationality} onChange={(e) => setFilters({ ...filters, nationality: e.target.value })} style={inputStyle} />
        <select value={filters.hotel} onChange={(e) => setFilters({ ...filters, hotel: e.target.value })} style={inputStyle}>
          <option value="">Filter by Hotel</option>
          {uniqueHotels.map((hotel, i) => (
            <option key={i} value={hotel}>{hotel}</option>
          ))}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} style={inputStyle} />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} style={inputStyle} />
      </div>

      {currentData.length === 0 ? (
        <p>No matching reservations.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }} data-kb-nav="1" data-kb-axis="vertical" data-kb-wrap="true">
          {currentData.map(([fileNo, data]) => {
            const general = data.generalData || data.General || {};
            const status = String(data.status || general?.status || statusMap[fileNo] || "").toLowerCase();
            const isCancelled = status === "cancelled";
            return (
              <div key={fileNo} data-kb-item tabIndex={0} style={{
                backgroundColor: "#1f1f1f",
                padding: "18px 24px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: isCancelled ? "2px solid #dc3545" : "1px solid #444",
                boxShadow: isCancelled ? "0 0 10px rgba(220, 53, 69, 0.3)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{fileNo}</span>
                    {isCancelled && (
                      <span style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase"
                      }}>
                        Cancelled
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "14px", marginTop: "4px", opacity: 0.8 }}>
                    Group: {general.groupName || "-"} | Agent: {general.agent || "-"} | Nationality: {general.nationality || "-"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => navigate(`/reservations/${fileNo}`)} style={buttonStyle("#28a745")} data-kb-activate>View</button>
                  <button onClick={() => deleteReservation(fileNo)} style={buttonStyle("#dc3545")}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "16px" }}>
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={buttonStyle("#666")}>
          Previous
        </button>
        <span style={{ alignSelf: "center", fontSize: "16px" }}>Page {currentPage} of {pageCount}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))} disabled={currentPage === pageCount} style={buttonStyle("#666")}>
          Next
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  backgroundColor: "#2a2a2a",
  color: "#fff",
  border: "1px solid #444",
  fontSize: "14px",
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "14px",
});

export default ReservationsList;
