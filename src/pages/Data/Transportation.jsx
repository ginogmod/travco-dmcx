import React, { useEffect, useMemo, useState } from "react";
import "./Data.css";
import TransportationRates from "./TransportationRates";
import baseCompanies from "../../data/TRSNew.json";

function Transportation() {
  const [activeTab, setActiveTab] = useState("companies");

  const tabsWrapper = {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid #333",
    marginBottom: "20px",
  };

  const tabBtn = (active) => ({
    padding: "10px 14px",
    backgroundColor: active ? "#1976d2" : "#1f1f1f",
    color: "white",
    border: "1px solid #333",
    borderBottom: active ? "2px solid #1976d2" : "1px solid #333",
    borderRadius: "6px 6px 0 0",
    cursor: "pointer",
  });

  return (
    <div className="data-container">
      <h2>Transportation</h2>
      <div style={tabsWrapper}>
        <button
          style={tabBtn(activeTab === "companies")}
          onClick={() => setActiveTab("companies")}
        >
          Transportation Companies
        </button>
        <button
          style={tabBtn(activeTab === "rates")}
          onClick={() => setActiveTab("rates")}
        >
          Transportation Rates
        </button>
      </div>

      {activeTab === "companies" ? <CompaniesTab /> : <TransportationRates />}
    </div>
  );
}

function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    show: false,
    message: "",
    success: true,
  });

  // Load companies: prefer editable file from public/data, fallback to bundled dataset
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/data/trs_companies.json?v=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setCompanies(sanitizeAndSort(data));
        }
      } catch (_) {
        if (!cancelled) {
          setCompanies(sanitizeAndSort(baseCompanies));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sanitizeAndSort = (arr) => {
    const safe = Array.isArray(arr) ? arr : [];
    return [...safe].map((c) => ({
      Acc_No: isFiniteNumber(c?.Acc_No) ? Number(c.Acc_No) : generateId(),
      Account_Name: toStr(c?.Account_Name),
      Tel: toStr(c?.Tel),
      Mobile: toStr(c?.Mobile),
      Fax: toStr(c?.Fax),
      Email: toStr(c?.Email),
      Contact: toStr(c?.Contact),
      Address: toStr(c?.Address),
      Stars: isFiniteNumber(c?.Stars) ? Number(c.Stars) : toStr(c?.Stars ?? ""),
    }))
    .sort((a, b) => a.Account_Name.localeCompare(b.Account_Name));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        toStr(c.Account_Name).toLowerCase().includes(q) ||
        toStr(c.Tel).toLowerCase().includes(q) ||
        toStr(c.Mobile).toLowerCase().includes(q) ||
        toStr(c.Email).toLowerCase().includes(q) ||
        toStr(c.Contact).toLowerCase().includes(q)
    );
  }, [companies, search]);

  const handleChange = (index, field, value) => {
    const idxInAll = companies.findIndex((c) => c.Acc_No === filtered[index].Acc_No);
    if (idxInAll === -1) return;
    const next = [...companies];
    if (field === "Acc_No") {
      const parsed = Number(value);
      next[idxInAll][field] = Number.isFinite(parsed) ? parsed : next[idxInAll][field];
    } else if (field === "Stars") {
      const parsed = Number(value);
      next[idxInAll][field] = value === "" ? "" : (Number.isFinite(parsed) ? parsed : next[idxInAll][field]);
    } else {
      next[idxInAll][field] = value;
    }
    setCompanies(next);
  };

  const handleAddRow = () => {
    const maxId = companies.reduce((m, c) => (Number.isFinite(c.Acc_No) ? Math.max(m, c.Acc_No) : m), 0);
    const newRow = {
      Acc_No: maxId + 1 || generateId(),
      Account_Name: "",
      Tel: "",
      Mobile: "",
      Fax: "",
      Email: "",
      Contact: "",
      Address: "",
      Stars: "",
    };
    setCompanies([newRow, ...companies]);
  };

  const handleDelete = (index) => {
    const accNo = filtered[index]?.Acc_No;
    if (accNo == null) return;
    setCompanies((prev) => prev.filter((c) => c.Acc_No !== accNo));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ show: false, message: "", success: true });

    try {
      const payload = sanitizeAndSort(companies);

      const saveFile = async (prefer, filename, content) => {
        const targets = [
          "http://localhost:3001",
          "http://127.0.0.1:3001",
          window?.location?.origin || "",
        ];
        if (prefer && !targets.includes(prefer)) targets.unshift(prefer);

        for (const base of targets) {
          const url = base ? `${base}/api/save-file` : `/api/save-file`;
          try {
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename, content }),
            });
            if (res && res.ok) return res;
          } catch (_) {
            // try next
          }
        }
        return null;
      };

      const res = await saveFile("http://localhost:3001", "trs_companies.json", payload);
      if (!res || !res.ok) {
        const status = res ? res.status : "no-response";
        throw new Error(`Failed to save trs_companies.json (${status})`);
      }

      // Reload from disk to ensure UI reflects latest file
      try {
        const fresh = await fetch(`/data/trs_companies.json?v=${Date.now()}`).then((r) => r.json());
        setCompanies(sanitizeAndSort(fresh));
      } catch (_) {
        // ignore
      }

      setSaveStatus({
        show: true,
        message: "Transportation companies saved successfully. They are now available in Reservations.",
        success: true,
      });
      setTimeout(() => setSaveStatus((s) => ({ ...s, show: false })), 5000);
    } catch (error) {
      setSaveStatus({
        show: true,
        message: `Error saving companies: ${error.message}`,
        success: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>
        Companies
        {isSaving && (
          <span
            style={{
              fontSize: 14,
              marginLeft: 15,
              backgroundColor: "#004D40",
              padding: "4px 8px",
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: "2px solid #fff",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            ></span>
            Saving changes...
          </span>
        )}
      </h3>

      {saveStatus.show && (
        <div
          style={{
            padding: "10px 15px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor: saveStatus.success ? "#004D40" : "#B71C1C",
            color: "white",
          }}
        >
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
          placeholder="Search by name, phone, email, contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <button onClick={handleAddRow}>Add Company</button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ backgroundColor: isSaving ? "#555" : "#007bff" }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 100 }}>Acc No</th>
            <th>Account Name</th>
            <th>Phone</th>
            <th>Mobile</th>
            <th>Fax</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            <th style={{ width: 80 }}>Stars</th>
            <th style={{ width: 70 }}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, index) => (
            <tr key={c.Acc_No}>
              <td>
                <input
                  type="number"
                  value={c.Acc_No}
                  onChange={(e) => handleChange(index, "Acc_No", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Account_Name}
                  onChange={(e) => handleChange(index, "Account_Name", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Tel ?? ""}
                  onChange={(e) => handleChange(index, "Tel", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Mobile ?? ""}
                  onChange={(e) => handleChange(index, "Mobile", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Fax ?? ""}
                  onChange={(e) => handleChange(index, "Fax", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Email ?? ""}
                  onChange={(e) => handleChange(index, "Email", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Contact ?? ""}
                  onChange={(e) => handleChange(index, "Contact", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={c.Address ?? ""}
                  onChange={(e) => handleChange(index, "Address", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={c.Stars ?? ""}
                  onChange={(e) => handleChange(index, "Stars", e.target.value)}
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

// Utils
function toStr(v) {
  return v == null ? "" : String(v);
}
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function generateId() {
  // fallback generator for Acc_No
  return Math.floor(Date.now() / 1000);
}

export default Transportation;