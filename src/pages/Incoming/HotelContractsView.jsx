import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HotelContractsList.css";

function HotelContractsView() {
  const { hotelName } = useParams();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch contracts for the specific hotel from an API
    // For now, we'll simulate with mock data
    const mockContracts = [
      {
        id: 1,
        contractSerial: "HC-2025-001",
        contractName: "Summer 2025",
        startingDate: "2025-05-01",
        endingDate: "2025-09-30",
        currency: "USD",
        status: "Active"
      },
      {
        id: 2,
        contractSerial: "HC-2025-002",
        contractName: "Winter 2025-2026",
        startingDate: "2025-11-01",
        endingDate: "2026-03-31",
        currency: "USD",
        status: "Pending"
      }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setContracts(mockContracts);
      setLoading(false);
    }, 500);
  }, [hotelName]);

  const handleBackToList = () => {
    navigate("/hotel-contracts");
  };

  const handleAddContract = () => {
    // Navigate to add a new contract for this specific hotel
    navigate(`/hotel-contracts/new?hotel=${encodeURIComponent(hotelName)}`);
  };

  const handleViewContract = (contractId) => {
    // Navigate to view a specific contract
    navigate(`/hotel-contracts/view/${contractId}`);
  };

  return (
    <div className="hotel-contracts-list-container">
      <div className="header-section">
        <div className="title-with-back">
          <button className="back-button" onClick={handleBackToList}>
            ← Back to Hotels
          </button>
          <h1>Contracts for {decodeURIComponent(hotelName)}</h1>
        </div>
        <button className="add-button" onClick={handleAddContract}>
          + Add Contract for {decodeURIComponent(hotelName)}
        </button>
      </div>

      <div className="hotels-list">
        {loading ? (
          <p>Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <div className="no-contracts">
            <p>No contracts found for this hotel.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Contract Serial</th>
                <th>Contract Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td>{contract.contractSerial}</td>
                  <td>{contract.contractName}</td>
                  <td>{new Date(contract.startingDate).toLocaleDateString()}</td>
                  <td>{new Date(contract.endingDate).toLocaleDateString()}</td>
                  <td>{contract.currency}</td>
                  <td>
                    <span className={`status-badge ${contract.status.toLowerCase()}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={() => handleViewContract(contract.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HotelContractsView;