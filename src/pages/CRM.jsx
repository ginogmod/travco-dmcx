// src/pages/CRM.jsx
import React from "react";

function CRM() {
  return (
    <div style={{ color: "white", padding: "40px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Customer Relationship Management</h1>
      <div style={{
        backgroundColor: "#1f1f1f",
        padding: "30px",
        borderRadius: "12px",
        border: "1px solid #333"
      }}>
        <p style={{ fontSize: "16px", color: "#ccc" }}>Welcome to your CRM dashboard.</p>
        <ul style={{ marginTop: "20px", lineHeight: "2" }}>
          <li>📁 View and manage clients</li>
          <li>✍️ Track communications</li>
          <li>📅 Schedule follow-ups</li>
          <li>📊 View client analytics</li>
        </ul>
      </div>
    </div>
  );
}

export default CRM;
