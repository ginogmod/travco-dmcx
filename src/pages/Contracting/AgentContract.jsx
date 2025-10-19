import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./Contracting.css";

// Create placeholder tab components
const Seasonality = () => <div className="tab-placeholder">Seasonality content will go here</div>;
const Rates = () => <div className="tab-placeholder">Rates content will go here</div>;
const Commissions = () => <div className="tab-placeholder">Commissions content will go here</div>;
const SpecialPromotions = () => <div className="tab-placeholder">Special Promotions content will go here</div>;
const Policies = () => <div className="tab-placeholder">Policies content will go here</div>;
const RelatedContracts = () => <div className="tab-placeholder">Related Contracts content will go here</div>;
const Attachments = () => <div className="tab-placeholder">Attachments content will go here</div>;
const Notes = () => <div className="tab-placeholder">Notes content will go here</div>;

function AgentContract() {
  const { agentName, contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefilledAgent = searchParams.get('agent');
  
  const isNewContract = location.pathname === "/agent-contracts/new";
  const isViewingAgentContracts = agentName !== undefined;
  const isViewingContract = contractId !== undefined;
  
  const [activeTab, setActiveTab] = useState("Seasonality");
  const [agents, setAgents] = useState([]);
  const [agentContracts, setAgentContracts] = useState([]);
  const [formData, setFormData] = useState({
    contractSerial: "",
    agentName: "",
    contractName: "",
    country: "",
    contactPerson: "",
    email: "",
    phone: "",
    startingDate: "",
    endingDate: "",
    currency: "USD",
    contractType: "standard",
    commissionRate: "",
    paymentTerms: ""
  });
  
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(isViewingContract);

  // Load agents data for autocomplete
  useEffect(() => {
    // Mock data for now, would fetch from API in production
    const mockAgents = [
      "Jordan Tours",
      "European Travels",
      "Asian Explorers",
      "American Adventures",
      "Italian Voyages"
    ];
    setAgents(mockAgents);
  }, []);
  
  // Load contract data if viewing a specific contract
  useEffect(() => {
    if (isViewingContract) {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock contract data
        const mockContract = {
          contractSerial: "AC-2025-001",
          agentName: "Jordan Tours",
          contractName: "Annual 2025",
          country: "Jordan",
          contactPerson: "Ahmad Khalid",
          email: "ahmad@jordantours.com",
          phone: "+962 79 123 4567",
          startingDate: "2025-01-01",
          endingDate: "2025-12-31",
          currency: "USD",
          contractType: "standard",
          commissionRate: "15",
          paymentTerms: "30 days"
        };
        
        // Mock seasons data
        const mockSeasons = [
          {
            id: 1,
            name: "High Season",
            startDate: "2025-06-15",
            endDate: "2025-08-31",
            days: "78"
          },
          {
            id: 2,
            name: "Low Season",
            startDate: "2025-01-01",
            endDate: "2025-06-14",
            days: "165"
          },
          {
            id: 3,
            name: "Low Season",
            startDate: "2025-09-01",
            endDate: "2025-12-31",
            days: "122"
          }
        ];
        
        setFormData(mockContract);
        setSeasons(mockSeasons);
        setIsLoading(false);
      }, 500);
    }
  }, [contractId, isViewingContract]);
  
  // Pre-fill agent name if provided in URL params
  useEffect(() => {
    if (prefilledAgent) {
      setFormData(prev => ({
        ...prev,
        agentName: decodeURIComponent(prefilledAgent)
      }));
    }
  }, [prefilledAgent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSeasonsChange = (updatedSeasons) => {
    setSeasons(updatedSeasons);
  };

  const tabs = {
    "Seasonality": <Seasonality />,
    "Rates": <Rates />,
    "Commissions": <Commissions />,
    "Special Promotions": <SpecialPromotions />,
    "Policies": <Policies />,
    "Related Contracts": <RelatedContracts />,
    "Attachments": <Attachments />,
    "Notes": <Notes />
  };

  // Load agent contracts if viewing a specific agent
  useEffect(() => {
    if (isViewingAgentContracts) {
      // In a real application, this would fetch contracts for the specific agent
      setAgentContracts([]);
      
      // Pre-fill the agent name in the form if we're viewing a specific agent
      setFormData(prev => ({
        ...prev,
        agentName: decodeURIComponent(agentName)
      }));
    }
  }, [agentName, isViewingAgentContracts]);

  const handleBackToList = () => {
    navigate("/agent-contracts");
  };

  const handleSaveContract = () => {
    // Here you would save the contract data
    alert("Contract saved successfully!");
    navigate("/agent-contracts");
  };

  return (
    <div className="hotel-contracts-container">
      {isLoading ? (
        <div className="loading">Loading contract data...</div>
      ) : (
        <>
          <div className="contract-header">
            <button className="back-button" onClick={handleBackToList}>
              ← Back to {isViewingContract ? "Contracts" : "Agents"}
            </button>
            <h1>
              {isNewContract ? "New Agent Contract" :
               isViewingAgentContracts ? `Contracts for ${decodeURIComponent(agentName)}` :
               isViewingContract ? `Contract: ${formData.contractName}` :
               "Agent Contract"}
            </h1>
          </div>
        </>
      )}
      
      {/* Form Fields */}
      <div className="contract-form">
        <div className="form-row">
          <div className="form-group">
            <label>Contract Serial</label>
            <input
              type="text"
              name="contractSerial"
              value={formData.contractSerial}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Agent Name</label>
            <input
              type="text"
              name="agentName"
              value={formData.agentName}
              onChange={handleInputChange}
              list="agentsList"
              placeholder="Select or type agent name"
            />
            <datalist id="agentsList">
              {agents.map((agent, index) => (
                <option key={index} value={agent} />
              ))}
            </datalist>
          </div>
          
          <div className="form-group">
            <label>Contract Name</label>
            <input
              type="text"
              name="contractName"
              value={formData.contractName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Starting Date</label>
            <input
              type="date"
              name="startingDate"
              value={formData.startingDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Ending Date</label>
            <input
              type="date"
              name="endingDate"
              value={formData.endingDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value="USD">USD</option>
              <option value="JOD">JOD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Contract Type</label>
            <select
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Commission Rate</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleInputChange}
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Payment Terms</label>
            <input
              type="text"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        {Object.keys(tabs).map(tabName => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={activeTab === tabName ? "active-tab" : ""}
          >
            {tabName}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {tabs[activeTab]}
      </div>
      
      {!isLoading && (
        <div className="action-buttons">
          <button className="save-button" onClick={handleSaveContract}>
            {isViewingContract ? "Update Contract" : "Save Contract"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AgentContract;