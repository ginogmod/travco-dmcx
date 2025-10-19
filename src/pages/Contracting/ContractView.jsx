import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Contracting.css";

function ContractView() {
  const { type, id, contractFile } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch the contract data from an API
    // For now, we'll simulate loading the contract
    setLoading(true);
    
    setTimeout(() => {
      // Mock contract data
      const mockContract = {
        id: id,
        file: contractFile,
        type: type,
        name: type === 'hotel' ? 'Grand Hyatt' : type === 'agent' ? 'Jordan Tours' : 'Chinese Market',
        date: '2025-01-15',
        validUntil: '2026-01-14',
        content: 'This is a sample contract content. In a real application, this would be the actual contract document or a preview of it.'
      };
      
      setContract(mockContract);
      setLoading(false);
    }, 1000);
  }, [type, id, contractFile]);

  const handleBack = () => {
    navigate('/contracting');
  };

  if (loading) {
    return (
      <div className="contract-view-container">
        <h2>Loading Contract...</h2>
      </div>
    );
  }

  return (
    <div className="contract-view-container">
      <div className="contract-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Contracts
        </button>
        <h2>Contract: {contract.file}</h2>
      </div>
      
      <div className="contract-details">
        <div className="detail-row">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{contract.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{contract.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Valid Until:</span>
          <span className="detail-value">{contract.validUntil}</span>
        </div>
      </div>
      
      <div className="contract-content">
        <h3>Contract Content</h3>
        <div className="content-preview">
          {contract.content}
        </div>
      </div>
      
      <div className="contract-actions">
        <button className="action-button">Download PDF</button>
        <button className="action-button">Print Contract</button>
        <button className="action-button">Share Contract</button>
      </div>
    </div>
  );
}

export default ContractView;