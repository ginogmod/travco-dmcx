import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Contracting.css";
import HotelContractsList from "../Incoming/HotelContractsList";

// Create AgentContractsList component similar to HotelContractsList
function AgentContractsList() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    search: ""
  });
  
  const navigate = useNavigate();

  // Load agents data
  React.useEffect(() => {
    // Mock data for now, would fetch from API in production
    const mockAgents = [
      { agent: "Jordan Tours", country: "Jordan", contracts: [] },
      { agent: "European Travels", country: "Germany", contracts: [] },
      { agent: "Asian Explorers", country: "China", contracts: [] },
      { agent: "American Adventures", country: "USA", contracts: [] },
      { agent: "Italian Voyages", country: "Italy", contracts: [] }
    ];
    
    const sorted = mockAgents.sort((a, b) => a.agent.localeCompare(b.agent));
    setAgents(sorted);
    setFilteredAgents(sorted);
  }, []);

  // Apply filters when they change
  React.useEffect(() => {
    let data = [...agents];

    if (filters.country) data = data.filter(a => a.country === filters.country);
    if (filters.search) {
      data = data.filter(a =>
        a.agent.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.country.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredAgents(data);
  }, [filters, agents]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddContract = () => {
    navigate("/agent-contracts/new");
  };

  const handleViewContracts = (agent) => {
    navigate(`/agent-contracts/agent/${encodeURIComponent(agent)}`);
  };

  const unique = (key) => {
    return [...new Set(agents.map(a => a[key]).filter(Boolean))].sort();
  };

  return (
    <div className="hotel-contracts-list-container">
      <div className="header-section">
        <h1>Agent Contracts</h1>
        <button className="add-button" onClick={handleAddContract}>
          + Add Agent Contract
        </button>
      </div>

      <div className="filters-section">
        <select name="country" value={filters.country} onChange={handleFilterChange}>
          <option value="">All Countries</option>
          {unique("country").map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by agent or country..."
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      <div className="hotels-list">
        <table>
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Country</th>
              <th>Active Contracts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent, index) => (
              <tr key={index}>
                <td>{agent.agent}</td>
                <td>{agent.country}</td>
                <td>{agent.contracts.length}</td>
                <td>
                  <button 
                    className="view-button"
                    onClick={() => handleViewContracts(agent.agent)}
                  >
                    View Contracts
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Create MarketContractsList component similar to HotelContractsList
function MarketContractsList() {
  const [markets, setMarkets] = useState([]);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [filters, setFilters] = useState({
    region: "",
    search: ""
  });
  
  const navigate = useNavigate();

  // Load markets data
  React.useEffect(() => {
    // Mock data for now, would fetch from API in production
    const mockMarkets = [
      { market: "Chinese", region: "Asia", contracts: [] },
      { market: "SIC", region: "Global", contracts: [] },
      { market: "German", region: "Europe", contracts: [] },
      { market: "Italian", region: "Europe", contracts: [] },
      { market: "French", region: "Europe", contracts: [] }
    ];
    
    const sorted = mockMarkets.sort((a, b) => a.market.localeCompare(b.market));
    setMarkets(sorted);
    setFilteredMarkets(sorted);
  }, []);

  // Apply filters when they change
  React.useEffect(() => {
    let data = [...markets];

    if (filters.region) data = data.filter(m => m.region === filters.region);
    if (filters.search) {
      data = data.filter(m =>
        m.market.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.region.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredMarkets(data);
  }, [filters, markets]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddContract = () => {
    navigate("/market-contracts/new");
  };

  const handleViewContracts = (market) => {
    navigate(`/market-contracts/market/${encodeURIComponent(market)}`);
  };

  const unique = (key) => {
    return [...new Set(markets.map(m => m[key]).filter(Boolean))].sort();
  };

  return (
    <div className="hotel-contracts-list-container">
      <div className="header-section">
        <h1>Market Contracts</h1>
        <button className="add-button" onClick={handleAddContract}>
          + Add Market Contract
        </button>
      </div>

      <div className="filters-section">
        <select name="region" value={filters.region} onChange={handleFilterChange}>
          <option value="">All Regions</option>
          {unique("region").map((region, index) => (
            <option key={index} value={region}>{region}</option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by market or region..."
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      <div className="hotels-list">
        <table>
          <thead>
            <tr>
              <th>Market Name</th>
              <th>Region</th>
              <th>Active Contracts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarkets.map((market, index) => (
              <tr key={index}>
                <td>{market.market}</td>
                <td>{market.region}</td>
                <td>{market.contracts.length}</td>
                <td>
                  <button 
                    className="view-button"
                    onClick={() => handleViewContracts(market.market)}
                  >
                    View Contracts
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractingList() {
  const [activeTab, setActiveTab] = useState("hotels");
  
  return (
    <div className="contracting-container">
      <div className="tabs">
        <button 
          className={activeTab === "hotels" ? "active" : ""} 
          onClick={() => setActiveTab("hotels")}
        >
          Hotels
        </button>
        <button 
          className={activeTab === "agents" ? "active" : ""} 
          onClick={() => setActiveTab("agents")}
        >
          Agents
        </button>
        <button 
          className={activeTab === "markets" ? "active" : ""} 
          onClick={() => setActiveTab("markets")}
        >
          Markets
        </button>
      </div>
      
      {/* Hotels Tab Content */}
      {activeTab === "hotels" && <HotelContractsList />}
      
      {/* Agents Tab Content */}
      {activeTab === "agents" && <AgentContractsList />}
      
      {/* Markets Tab Content */}
      {activeTab === "markets" && <MarketContractsList />}
    </div>
  );
}

export default ContractingList;