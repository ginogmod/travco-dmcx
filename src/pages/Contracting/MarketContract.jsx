import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./Contracting.css";

// Create placeholder tab components
const Seasonality = () => <div className="tab-placeholder">Seasonality content will go here</div>;
const Rates = () => <div className="tab-placeholder">Rates content will go here</div>;
const TargetGroups = () => <div className="tab-placeholder">Target Groups content will go here</div>;
const SpecialPromotions = () => <div className="tab-placeholder">Special Promotions content will go here</div>;
const MarketingRequirements = () => <div className="tab-placeholder">Marketing Requirements content will go here</div>;
const Policies = () => <div className="tab-placeholder">Policies content will go here</div>;
const RelatedContracts = () => <div className="tab-placeholder">Related Contracts content will go here</div>;
const Attachments = () => <div className="tab-placeholder">Attachments content will go here</div>;
const Notes = () => <div className="tab-placeholder">Notes content will go here</div>;

function MarketContract() {
  const { marketName, contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefilledMarket = searchParams.get('market');
  
  const isNewContract = location.pathname === "/market-contracts/new";
  const isViewingMarketContracts = marketName !== undefined;
  const isViewingContract = contractId !== undefined;
  
  const [activeTab, setActiveTab] = useState("Seasonality");
  const [markets, setMarkets] = useState([]);
  const [marketContracts, setMarketContracts] = useState([]);
  const [formData, setFormData] = useState({
    contractSerial: "",
    marketName: "",
    contractName: "",
    description: "",
    region: "",
    startingDate: "",
    endingDate: "",
    currency: "USD",
    contractType: "standard",
    specialTerms: "",
    targetVolume: "",
    marketingBudget: ""
  });
  
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(isViewingContract);

  // Load markets data for autocomplete
  useEffect(() => {
    // Mock data for now, would fetch from API in production
    const mockMarkets = [
      "Chinese",
      "SIC",
      "German",
      "Italian",
      "French",
      "Spanish",
      "Russian"
    ];
    setMarkets(mockMarkets);
  }, []);
  
  // Load contract data if viewing a specific contract
  useEffect(() => {
    if (isViewingContract) {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock contract data
        const mockContract = {
          contractSerial: "MC-2025-001",
          marketName: "Chinese",
          contractName: "Chinese Market 2025",
          description: "Contract for Chinese market tour operators",
          region: "Asia",
          startingDate: "2025-01-01",
          endingDate: "2025-12-31",
          currency: "USD",
          contractType: "premium",
          specialTerms: "Special visa processing included",
          targetVolume: "5000",
          marketingBudget: "50000"
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
  
  // Pre-fill market name if provided in URL params
  useEffect(() => {
    if (prefilledMarket) {
      setFormData(prev => ({
        ...prev,
        marketName: decodeURIComponent(prefilledMarket)
      }));
    }
  }, [prefilledMarket]);

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
    "Target Groups": <TargetGroups />,
    "Special Promotions": <SpecialPromotions />,
    "Marketing Requirements": <MarketingRequirements />,
    "Policies": <Policies />,
    "Related Contracts": <RelatedContracts />,
    "Attachments": <Attachments />,
    "Notes": <Notes />
  };

  // Load market contracts if viewing a specific market
  useEffect(() => {
    if (isViewingMarketContracts) {
      // In a real application, this would fetch contracts for the specific market
      setMarketContracts([]);
      
      // Pre-fill the market name in the form if we're viewing a specific market
      setFormData(prev => ({
        ...prev,
        marketName: decodeURIComponent(marketName)
      }));
    }
  }, [marketName, isViewingMarketContracts]);

  const handleBackToList = () => {
    navigate("/market-contracts");
  };

  const handleSaveContract = () => {
    // Here you would save the contract data
    alert("Contract saved successfully!");
    navigate("/market-contracts");
  };

  return (
    <div className="hotel-contracts-container">
      {isLoading ? (
        <div className="loading">Loading contract data...</div>
      ) : (
        <>
          <div className="contract-header">
            <button className="back-button" onClick={handleBackToList}>
              ← Back to {isViewingContract ? "Contracts" : "Markets"}
            </button>
            <h1>
              {isNewContract ? "New Market Contract" :
               isViewingMarketContracts ? `Contracts for ${decodeURIComponent(marketName)}` :
               isViewingContract ? `Contract: ${formData.contractName}` :
               "Market Contract"}
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
            <label>Market Name</label>
            <select
              name="marketName"
              value={formData.marketName}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a market</option>
              {markets.map((market, index) => (
                <option key={index} value={market}>{market}</option>
              ))}
            </select>
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
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
            ></textarea>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            />
          </div>
          
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
        </div>
        
        <div className="form-row">
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
              <option value="CNY">CNY</option>
            </select>
          </div>
          
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Target Volume</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="targetVolume"
                value={formData.targetVolume}
                onChange={handleInputChange}
              />
              <span className="input-suffix">Pax</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Marketing Budget</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="marketingBudget"
                value={formData.marketingBudget}
                onChange={handleInputChange}
              />
              <span className="input-suffix">USD</span>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Special Terms</label>
            <textarea
              name="specialTerms"
              value={formData.specialTerms}
              onChange={handleInputChange}
              rows="2"
            ></textarea>
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

export default MarketContract;