import React from 'react';

const statBox = {
  backgroundColor: "#2a2a2a",
  borderRadius: 8,
  padding: "12px 20px",
  fontSize: 16,
  fontWeight: "bold",
  marginTop: 5,
  width: "100%",
  display: "flex",
  justifyContent: "space-between"
};

const CostRow = ({ label, value, highlighted = false }) => (
  <div style={{
    ...statBox,
    backgroundColor: highlighted ? "#004D40" : "#2a2a2a",
  }}>
    <span>{label}:</span>
    <span>{(typeof value === 'number' || (!isNaN(value) && value !== null && value !== ''))
      ? Number(value).toFixed(2)
      : value} USD</span>
  </div>
);

export default CostRow;