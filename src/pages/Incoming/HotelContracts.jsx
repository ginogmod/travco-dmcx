import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Seasonality from "./HotelContractsTabs/Seasonality";
import Rates from "./HotelContractsTabs/Rates";
import HigherRooms from "./HotelContractsTabs/HigherRooms";
import Occupancy from "./HotelContractsTabs/Occupancy";
import Supplements from "./HotelContractsTabs/Supplements";
import SpecialPromotions from "./HotelContractsTabs/SpecialPromotions";
import EarlyBird from "./HotelContractsTabs/EarlyBird";
import StayPay from "./HotelContractsTabs/StayPay";
import WeekDays from "./HotelContractsTabs/WeekDays";
import Policies from "./HotelContractsTabs/Policies";
import RelatedContracts from "./HotelContractsTabs/RelatedContracts";
import Attachments from "./HotelContractsTabs/Attachments";
import Notes from "./HotelContractsTabs/Notes";
import "./HotelContracts.css";

function HotelContracts() {
  const { hotelName, contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefilledHotel = searchParams.get('hotel');
  
  const isNewContract = location.pathname === "/hotel-contracts/new";
  const isViewingHotelContracts = hotelName !== undefined;
  const isViewingContract = contractId !== undefined;
  
  const [activeTab, setActiveTab] = useState("Seasonality");
  const [hotels, setHotels] = useState([]);
  const [hotelContracts, setHotelContracts] = useState([]);
  const [formData, setFormData] = useState({
    contractSerial: "",
    hotelName: "",
    contractName: "",
    startingDate: "",
    endingDate: "",
    currency: "USD",
    groupRate: "",
    filterBySeason: "",
    camp: false,
    profitPerPerson: "",
    profitInTarrif: "",
    serviceTax: "",
    salesTax: ""
  });
  
  const [seasons, setSeasons] = useState([]);
  const [uniqueSeasons, setUniqueSeasons] = useState([]);
  const [supplementsData, setSupplementsData] = useState({});
  const [promotionsData, setPromotionsData] = useState({});
  const [isLoading, setIsLoading] = useState(isViewingContract);

  // Load hotels data for autocomplete
  useEffect(() => {
    fetch("/data/hotelRates.json")
      .then((res) => res.json())
      .then((data) => {
        // Extract unique hotel names
        const uniqueHotels = [...new Set(data.map(item => item.Hotel))].sort();
        setHotels(uniqueHotels);
        
        // Extract unique seasons for the filter
        const allSeasons = [...new Set(data.map(item => item.Season))].filter(Boolean).sort();
        setUniqueSeasons(allSeasons);
      })
      .catch((err) => console.error("Failed to load hotel data", err));
  }, []);
  
  // Load contract data if viewing a specific contract
  useEffect(() => {
    if (isViewingContract) {
      // In a real application, this would fetch the specific contract data
      // For now, we'll simulate with mock data
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock contract data
        const mockContract = {
          contractSerial: "HC-2025-001",
          hotelName: "Marriott Hotel",
          contractName: "Summer 2025",
          startingDate: "2025-05-01",
          endingDate: "2025-09-30",
          currency: "USD",
          groupRate: "10",
          filterBySeason: "",
          camp: false,
          profitPerPerson: "15",
          profitInTarrif: "10",
          serviceTax: "5",
          salesTax: "16"
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
            name: "Shoulder Season",
            startDate: "2025-05-01",
            endDate: "2025-06-14",
            days: "45"
          },
          {
            id: 3,
            name: "Shoulder Season",
            startDate: "2025-09-01",
            endDate: "2025-09-30",
            days: "30"
          }
        ];
        
        setFormData(mockContract);
        setSeasons(mockSeasons);
        setIsLoading(false);
      }, 500);
    }
  }, [contractId, isViewingContract]);
  
  // Pre-fill hotel name if provided in URL params
  useEffect(() => {
    if (prefilledHotel) {
      setFormData(prev => ({
        ...prev,
        hotelName: decodeURIComponent(prefilledHotel)
      }));
    }
  }, [prefilledHotel]);

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

  const handleSupplementsChange = (updatedSupplements) => {
    setSupplementsData(updatedSupplements);
  };

  const handlePromotionsChange = (updatedPromotions) => {
    setPromotionsData(updatedPromotions);
  };

  const calculateTotalDays = () => {
    let total = 0;
    seasons.forEach(season => {
      total += parseInt(season.days || 0, 10);
    });
    return total;
  };

  const calculateMissingDays = () => {
    if (!formData.startingDate || !formData.endingDate) return 0;
    
    const startDate = new Date(formData.startingDate);
    const endDate = new Date(formData.endingDate);
    
    // Calculate total contract days
    const totalContractDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate total season days
    const totalSeasonDays = calculateTotalDays();
    
    // Calculate missing days
    return Math.max(0, totalContractDays - totalSeasonDays);
  };

  const tabs = {
    "Seasonality": <Seasonality
                      seasons={seasons}
                      onSeasonsChange={handleSeasonsChange}
                      missingDays={calculateMissingDays()}
                      totalSeasonDays={calculateTotalDays()}
                      totalContractDays={formData.startingDate && formData.endingDate ?
                        Math.round((new Date(formData.endingDate) - new Date(formData.startingDate)) / (1000 * 60 * 60 * 24)) + 1 : 0}
                    />,
    "Rates": <Rates
                seasons={seasons}
             />,
    "Higher Rooms": <HigherRooms />,
    "Occupancy": <Occupancy seasons={seasons} />,
    "Supplements": <Supplements seasons={seasons} onSupplementsChange={handleSupplementsChange} />,
    "Special Promotions": <SpecialPromotions seasons={seasons} onPromotionsChange={handlePromotionsChange} />,
    "Early Bird": <EarlyBird />,
    "Stay Pay": <StayPay />,
    "Week Days": <WeekDays />,
    "Policies": <Policies />,
    "Related Contracts": <RelatedContracts />,
    "Attachments": <Attachments />,
    "Notes": <Notes />
  };

  // Load hotel contracts if viewing a specific hotel
  useEffect(() => {
    if (isViewingHotelContracts) {
      // In a real application, this would fetch contracts for the specific hotel
      // For now, we'll just simulate with empty data
      setHotelContracts([]);
      
      // Pre-fill the hotel name in the form if we're viewing a specific hotel
      setFormData(prev => ({
        ...prev,
        hotelName: decodeURIComponent(hotelName)
      }));
    }
  }, [hotelName, isViewingHotelContracts]);

  const handleBackToList = () => {
    navigate("/hotel-contracts");
  };

  const handleSaveContract = () => {
    // Here you would save the contract data
    // For now, just navigate back to the list
    alert("Contract saved successfully!");
    navigate("/hotel-contracts");
  };

  return (
    <div className="hotel-contracts-container">
      {isLoading ? (
        <div className="loading">Loading contract data...</div>
      ) : (
        <>
          <div className="contract-header">
            <button className="back-button" onClick={handleBackToList}>
              ← Back to {isViewingContract ? "Contracts" : "Hotels"}
            </button>
            <h1>
              {isNewContract ? "New Hotel Contract" :
               isViewingHotelContracts ? `Contracts for ${decodeURIComponent(hotelName)}` :
               isViewingContract ? `Contract: ${formData.contractName}` :
               "Hotel Contract"}
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
            <label>Hotel Name</label>
            <input
              type="text"
              name="hotelName"
              value={formData.hotelName}
              onChange={handleInputChange}
              list="hotelsList"
              placeholder="Select or type hotel name"
            />
            <datalist id="hotelsList">
              {hotels.map((hotel, index) => (
                <option key={index} value={hotel} />
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
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Group Rate</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="groupRate"
                value={formData.groupRate}
                onChange={handleInputChange}
              />
              <span className="input-suffix">Pax</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Filter By Season</label>
            <select
              name="filterBySeason"
              value={formData.filterBySeason}
              onChange={handleInputChange}
            >
              <option value="">All Seasons</option>
              {uniqueSeasons.map((season, index) => (
                <option key={index} value={season}>{season}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="camp"
                checked={formData.camp}
                onChange={handleInputChange}
              />
              Camp
            </label>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Profit Per Person</label>
            <input
              type="number"
              name="profitPerPerson"
              value={formData.profitPerPerson}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Profit in Tarrif</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="profitInTarrif"
                value={formData.profitInTarrif}
                onChange={handleInputChange}
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Service Tax</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="serviceTax"
                value={formData.serviceTax}
                onChange={handleInputChange}
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Sales Tax</label>
            <div className="input-with-suffix">
              <input
                type="number"
                name="salesTax"
                value={formData.salesTax}
                onChange={handleInputChange}
              />
              <span className="input-suffix">%</span>
            </div>
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

export default HotelContracts;