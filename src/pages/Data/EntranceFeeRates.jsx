import React, { useEffect, useState } from "react";
import "./Data.css";

function EntranceFeeRates() {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', success: true });
  // Header row required by RepEnt_Fees.json consumers (kept in file as first row)
  const HEADER_ROW = { "Travco Jordan": "EntFeesName", "": "CityID", "__1": "Adl_Rate", "__2": "Chd_Rate" };

  useEffect(() => {
    fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.slice(1).sort((a, b) => a["Travco Jordan"].localeCompare(b["Travco Jordan"]));
        setFees(sorted);
      })
      .catch((err) => console.error("Failed to load entrance fees", err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ show: false, message: '', success: true });

    try {
      // Sanitize rows and include the mandatory header row
      const sanitized = fees.map(f => ({
        "Travco Jordan": String(f["Travco Jordan"] || "").trim(),
        "": f[""] ?? "",
        "__1": isNaN(parseFloat(f["__1"])) ? 0 : parseFloat(f["__1"]),
        "__2": isNaN(parseFloat(f["__2"])) ? 0 : parseFloat(f["__2"])
      }));
      const payload = [HEADER_ROW, ...sanitized];

      const makeReq = (url) =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: "RepEnt_Fees.json", content: payload }),
        });

      // Try same-origin first (works when a proxy is configured)
      let res = null;
      try {
        res = await makeReq("/api/save-file");
      } catch (_) {
        res = null;
      }

      // If same-origin fails or returns 404/405, fall back to backend URL directly
      if (!res || !res.ok) {
        if (!res || res.status === 404 || res.status === 405) {
          try {
            res = await makeReq("http://localhost:3001/api/save-file");
          } catch (_) {
            // keep res as is to fail below
          }
        }
      }

      if (!res || !res.ok) {
        const status = res ? res.status : "no-response";
        throw new Error(`Failed to save entrance fees to server (${status})`);
      }

      await res.text();

      // Bump version so other tabs/components can detect changes
      try { localStorage.setItem('entranceFeesVersion', String(Date.now())); } catch (_) {}
      try { const bc = new BroadcastChannel('entranceFees'); bc.postMessage('updated'); bc.close(); } catch (_bc) {}

      // Reload from disk (cache-busted) so all UIs immediately see latest data
      try {
        const fresh = await fetch(`/data/RepEnt_Fees.json?v=${Date.now()}`).then(r => r.json());
        const sorted = Array.isArray(fresh)
          ? fresh.slice(1).sort((a, b) =>
              String(a["Travco Jordan"]).localeCompare(String(b["Travco Jordan"]))
            )
          : [];
        setFees(sorted);
      } catch (_) {
        // ignore refresh errors
      }

      setSaveStatus({
        show: true,
        message: 'Entrance fees updated successfully! Changes will be reflected in quotations.',
        success: true
      });
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      setSaveStatus({
        show: true,
        message: `Error saving entrance fees: ${error.message}`,
        success: false
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...fees];
    if (field === "__1" || field === "__2") {
      const num = value === "" ? "" : parseFloat(value);
      updated[index][field] = Number.isNaN(num) ? "" : num;
    } else {
      updated[index][field] = value;
    }
    setFees(updated);
  };

  const handleAddRow = () => {
    const newRow = { "Travco Jordan": "", "": "", "__1": 0, "__2": 0 };
    setFees([newRow, ...fees]);
  };

  const handleDelete = (index) => {
    const updated = [...fees];
    updated.splice(index, 1);
    setFees(updated);
  };

  const filteredFees = fees.filter(fee =>
    String(fee["Travco Jordan"] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-container">
      <h2>
        Entrance Fee Rates
        {isSaving && (
          <span style={{
            fontSize: 14,
            marginLeft: 15,
            backgroundColor: "#004D40",
            padding: "4px 8px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #fff',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}></span>
            Saving changes...
          </span>
        )}
      </h2>
      
      {saveStatus.show && (
        <div style={{
          padding: "10px 15px",
          marginBottom: "20px",
          borderRadius: "4px",
          backgroundColor: saveStatus.success ? "#004D40" : "#B71C1C",
          color: "white"
        }}>
          {saveStatus.message}
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="actions">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <button onClick={handleAddRow}>Add Fee</button>
        <button onClick={handleSave}>Save</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Entrance Fee Name</th>
            <th>Adult Rate</th>
            <th>Child Rate</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredFees.map((fee, index) => (
            <tr key={index}>
              <td>
                <input
                  value={fee["Travco Jordan"]}
                  onChange={(e) => handleChange(index, "Travco Jordan", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={fee["__1"]}
                  onChange={(e) => handleChange(index, "__1", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={fee["__2"]}
                  onChange={(e) => handleChange(index, "__2", e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(index)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EntranceFeeRates;