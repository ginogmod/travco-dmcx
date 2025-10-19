import React, { useState, useEffect } from "react";
import "./Operations.css";
import { getAllFromStorage } from "../../assets/utils/storage.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Operations() {
  // Load state from localStorage on component mount
  const loadStateFromStorage = () => {
    try {
      const savedState = localStorage.getItem('operationsState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return parsedState;
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return null;
  };

  // Initialize state with saved values or defaults
  const savedState = loadStateFromStorage();
  
  // State for date range
  const [dateRange, setDateRange] = useState(savedState?.dateRange || {
    fromDate: "",
    toDate: ""
  });

  // State for group name
  const [groupName, setGroupName] = useState(savedState?.groupName || "");
  const [groupNames, setGroupNames] = useState(savedState?.groupNames || []);

  // State for active tab
  const [activeTab, setActiveTab] = useState(savedState?.activeTab || "byGroups");

  // State for filter types
  const [selectedFilterType, setSelectedFilterType] = useState(savedState?.selectedFilterType || "groupsRundown");

  // State for dynamic field based on active tab
  const [dynamicField, setDynamicField] = useState(savedState?.dynamicField || "");

  // State for general filters
  const [generalFilters, setGeneralFilters] = useState(savedState?.generalFilters || {
    reservationType: "",
    agentName: "",
    fileNo: "",
    groupCategory: "",
    groupCategory2: "",
    groupCategory3: "",
    paxMin: "",
    guarantyCode: "",
    nationality: "",
    userName: "",
    resvOwner: "",
    market: "",
    onlineBooking: false,
    hideAgentNameInReports: false,
    showCanceledFiles: false,
    showNoShowFiles: false,
    showOnlyConfirmedFiles: false
  });

  // Auth
  const { user } = useAuth() || {};

  // Results state
  const [results, setResults] = useState([]);
  const [totals, setTotals] = useState({ records: 0, pax: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      dateRange,
      groupName,
      groupNames,
      activeTab,
      selectedFilterType,
      dynamicField,
      generalFilters
    };
    
    try {
      localStorage.setItem('operationsState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [dateRange, groupName, groupNames, activeTab, selectedFilterType, dynamicField, generalFilters]);

  // Load group names on component mount
  useEffect(() => {
    // This would typically fetch from an API or local storage
    // For now, we'll use dummy data
    const dummyGroupNames = [
      "European Tour Group",
      "Asian Tour Group",
      "American Tour Group",
      "Australian Tour Group",
      "Middle Eastern Tour Group"
    ];
    setGroupNames(dummyGroupNames);
  }, []);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Handle group name change
  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDynamicField(""); // Reset dynamic field when changing tabs
  };

  // Handle dynamic field change
  const handleDynamicFieldChange = (e) => {
    setDynamicField(e.target.value);
  };
  
  // Handle filter type change
  const handleFilterTypeChange = (e) => {
    setSelectedFilterType(e.target.value);
  };

  // Handle general filter change
  const handleGeneralFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralFilters({
      ...generalFilters,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Render dynamic field based on active tab
  const renderDynamicField = () => {
    switch (activeTab) {
      case "byGroups":
        return (
          <div className="dynamic-field">
            <label>Account Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Blocked in 'By Groups'"
              disabled
              title="Account Name is blocked in this advanced search"
              list="accountNames"
            />
            <datalist id="accountNames">
              <option value="Account 1" />
              <option value="Account 2" />
              <option value="Account 3" />
            </datalist>
          </div>
        );
      case "byAgents":
        return (
          <div className="dynamic-field">
            <label>Agent Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select agent name"
            />
          </div>
        );
      case "byHotels":
        return (
          <div className="dynamic-field">
            <label>Hotel Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select hotel name"
            />
          </div>
        );
      case "byTransportation":
        return (
          <div className="dynamic-field">
            <label>Trans. Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select transportation name"
            />
          </div>
        );
      case "byRestaurants":
        return (
          <div className="dynamic-field">
            <label>Rest. Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select restaurant name"
            />
          </div>
        );
      case "byGuides":
        return (
          <div className="dynamic-field">
            <label>Guide Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select guide name"
            />
          </div>
        );
      case "byItineraries":
        return (
          <div className="dynamic-field">
            <label>Itinerary:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              disabled
              placeholder="Itinerary selection disabled"
            />
          </div>
        );
      case "byClientsList":
        return (
          <div className="dynamic-field">
            <label>Clients List:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              disabled
              placeholder="Clients list selection disabled"
            />
          </div>
        );
      case "byEntrances":
        return (
          <div className="dynamic-field">
            <label>Entrance Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select entrance name"
              list="entranceNames"
            />
            <datalist id="entranceNames">
              <option value="Petra" />
              <option value="Jerash" />
              <option value="Wadi Rum" />
              <option value="Dead Sea" />
            </datalist>
          </div>
        );
      case "byNationality":
        return (
          <div className="dynamic-field">
            <label>Nationality:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select nationality"
              list="nationalityListOps"
            />
            <datalist id="nationalityListOps">
              <option value="American" />
              <option value="European" />
              <option value="Asian" />
              <option value="Australian" />
              <option value="Middle Eastern" />
            </datalist>
          </div>
        );
      case "byExtras":
        return (
          <div className="dynamic-field">
            <label>Account Name:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Type or select account name"
              list="extraAccounts"
            />
            <datalist id="extraAccounts">
              <option value="Special Services" />
              <option value="VIP Arrangements" />
              <option value="Custom Experiences" />
            </datalist>
          </div>
        );
      case "byAllRundowns":
        return (
          <div className="dynamic-field">
            <label>Rundown Type:</label>
            <select
              value={dynamicField}
              onChange={handleDynamicFieldChange}
            >
              <option value="">Select Rundown Type</option>
              <option value="daily">Daily Rundown</option>
              <option value="weekly">Weekly Rundown</option>
              <option value="monthly">Monthly Rundown</option>
            </select>
          </div>
        );
      case "byFilesFullDetails":
        return (
          <div className="dynamic-field">
            <label>File Details:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Enter file number or name"
            />
          </div>
        );
      case "byUninvoicedGroups":
        return (
          <div className="dynamic-field">
            <label>Uninvoiced Group:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Enter group name or ID"
            />
          </div>
        );
      case "byClosedFiles":
        return (
          <div className="dynamic-field">
            <label>Closed Files:</label>
            <input
              type="text"
              value={dynamicField}
              onChange={handleDynamicFieldChange}
              placeholder="Enter file reference"
            />
          </div>
        );
      case "byNumberOfPax":
        return (
          <div className="dynamic-field">
            <label>Pax Report:</label>
            <select
              value={dynamicField}
              onChange={handleDynamicFieldChange}
            >
              <option value="">Select Report Type</option>
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="comparative">Comparative</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  // Render side filters based on active tab
  const renderSideFilters = () => {
    switch (activeTab) {
      case "byGroups":
        return (
          <div className="side-filters">
            <h3>By Groups Filters</h3>
            <div className="filter-group">
              <label>Filter Type:</label>
              <select value={selectedFilterType} onChange={handleFilterTypeChange}>
                <option value="groupsRundown">Groups Rundown</option>
                <option value="airportRundown">Airport Rundown</option>
                <option value="groupsInTown">Groups in Town</option>
                <option value="groupsMonthlyReport">Groups Monthly Report</option>
                <option value="statisticalReport">Statistical Report</option>
              </select>
            </div>
            
            {selectedFilterType === "groupsRundown" && (
              <div className="checkbox-group">
                <h4>Groups Rundown Filters:</h4>
                <div className="checkbox-item">
                  <input type="checkbox" id="byGeneralArrivalDate" />
                  <label htmlFor="byGeneralArrivalDate">By General Arrival Date</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="byGeneralDepartureDate" />
                  <label htmlFor="byGeneralDepartureDate">By General Departure Date</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="byIssueDate" />
                  <label htmlFor="byIssueDate">By Issue Date</label>
                </div>
              </div>
            )}
            
            {selectedFilterType === "airportRundown" && (
              <div className="airport-rundown-filters">
                <h4>Airport Rundown Filters:</h4>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input type="checkbox" id="arrival" />
                    <label htmlFor="arrival">Arrival</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="departure" />
                    <label htmlFor="departure">Departure</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="both" />
                    <label htmlFor="both">Both</label>
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Flight No.:</label>
                  <select>
                    <option value="">Select Flight No.</option>
                    <option value="rj301">RJ301</option>
                    <option value="rj302">RJ302</option>
                    <option value="rj303">RJ303</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Border:</label>
                  <select>
                    <option value="">Select Border</option>
                    <option value="qaia">QAIA</option>
                    <option value="aqabaAirport">Aqaba Airport</option>
                    <option value="aqabaPort">Aqaba Port</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Customer Service:</label>
                  <select>
                    <option value="">Select Customer Service</option>
                    <option value="cs1">CS1</option>
                    <option value="cs2">CS2</option>
                    <option value="cs3">CS3</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Meet By:</label>
                  <select>
                    <option value="">Select Meet By</option>
                    <option value="mb1">MB1</option>
                    <option value="mb2">MB2</option>
                    <option value="mb3">MB3</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Driver Name:</label>
                  <select>
                    <option value="">Select Driver Name</option>
                    <option value="driver1">Driver 1</option>
                    <option value="driver2">Driver 2</option>
                    <option value="driver3">Driver 3</option>
                  </select>
                </div>
                
                <h4>Additional Options:</h4>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input type="checkbox" id="exceptBorder" />
                    <label htmlFor="exceptBorder">Except Border</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="showClient" />
                    <label htmlFor="showClient">Show Client</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="allGuides" />
                    <label htmlFor="allGuides">All Guides</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="hotelConfNo" />
                    <label htmlFor="hotelConfNo">Hotel Conf. No</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="hideTrans" />
                    <label htmlFor="hideTrans">Hide Trans.</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="typeOfVehicle" />
                    <label htmlFor="typeOfVehicle">Type of Vehicle</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="driverName" />
                    <label htmlFor="driverName">Driver Name</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="transNotes" />
                    <label htmlFor="transNotes">Trans. Notes</label>
                  </div>
                </div>
              </div>
            )}
            
            {selectedFilterType === "groupsInTown" && (
              <div className="checkbox-group">
                <h4>Groups in Town Side Filters:</h4>
                <div className="checkbox-item">
                  <input type="checkbox" id="groupsInTown" />
                  <label htmlFor="groupsInTown">Groups in Town</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="groupsInTownWithDetails" />
                  <label htmlFor="groupsInTownWithDetails">Groups in Town with Details</label>
                </div>
              </div>
            )}
            
            {selectedFilterType === "groupsMonthlyReport" && (
              <div className="checkbox-group">
                <h4>Groups Monthly Report:</h4>
                <div className="checkbox-item">
                  <input type="checkbox" id="groupsMonthlyReport" />
                  <label htmlFor="groupsMonthlyReport">Groups Monthly Report</label>
                </div>
              </div>
            )}
            
            {selectedFilterType === "statisticalReport" && (
              <div className="checkbox-group">
                <h4>Statistical Report:</h4>
                <div className="checkbox-item">
                  <input type="checkbox" id="statisticalReport" />
                  <label htmlFor="statisticalReport">Statistical Report</label>
                </div>
              </div>
            )}
          </div>
        );
      case "byAgents":
        return (
          <div className="side-filters">
            <h3>By Agents Filters</h3>
            <div className="filter-group">
              <label>Region:</label>
              <select>
                <option value="">Select Region</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
                <option value="americas">Americas</option>
                <option value="middleEast">Middle East</option>
                <option value="africa">Africa</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Agent Reference:</label>
              <select>
                <option value="">Select Agent Reference</option>
                <option value="ref1">Reference 1</option>
                <option value="ref2">Reference 2</option>
                <option value="ref3">Reference 3</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Online Reference:</label>
              <select>
                <option value="">Select Online Reference</option>
                <option value="online1">Online Ref 1</option>
                <option value="online2">Online Ref 2</option>
                <option value="online3">Online Ref 3</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Complimentary:</label>
              <select>
                <option value="">Select Option</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        );
      case "byHotels":
        return (
          <div className="side-filters">
            <h3>By Hotels Filters</h3>
            <div className="filter-group">
              <label>Status:</label>
              <select>
                <option value="">Select Status</option>
                <option value="conf">Conf</option>
                <option value="requ">REQU</option>
                <option value="canc">Canc</option>
                <option value="noshow">No Show</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>City:</label>
              <select>
                <option value="">Select City</option>
                <option value="amman">Amman</option>
                <option value="petra">Petra</option>
                <option value="aqaba">Aqaba</option>
                <option value="deadsea">Dead Sea</option>
                <option value="jerash">Jerash</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Room Type:</label>
              <select>
                <option value="">Select Room Type</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="twin">Twin</option>
                <option value="triple">Triple</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Allotment:</label>
              <select>
                <option value="">Select Allotment</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        );
      case "byTransportation":
        return (
          <div className="side-filters">
            <h3>By Transportation Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="transportationsOnly" />
                <label htmlFor="transportationsOnly">Transportations Only</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="transportationsWithRouteAndFlight" />
                <label htmlFor="transportationsWithRouteAndFlight">Transportations with route and flight details</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="transportationsWithVoucherItinerariesVoucher" />
                <label htmlFor="transportationsWithVoucherItinerariesVoucher">Transportations with voucher itineraries based on voucher date</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="transportationsWithVoucherItinerariesReservation" />
                <label htmlFor="transportationsWithVoucherItinerariesReservation">Transportations with voucher itineraries based on reservation date</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="transportationsWithMainItineraries" />
                <label htmlFor="transportationsWithMainItineraries">Transportations with main itineraries</label>
              </div>
            </div>
          </div>
        );
      case "byRestaurants":
        return (
          <div className="side-filters">
            <h3>By Restaurants Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="restaurantRundown" />
                <label htmlFor="restaurantRundown">Restaurant Rundown</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="restaurantWithVoucherItineraries" />
                <label htmlFor="restaurantWithVoucherItineraries">Restaurant with voucher itineraries</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="restaurantWithMainItineraries" />
                <label htmlFor="restaurantWithMainItineraries">Restaurant with main itineraries</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>City:</label>
              <select>
                <option value="">Select City</option>
                <option value="amman">Amman</option>
                <option value="petra">Petra</option>
                <option value="aqaba">Aqaba</option>
                <option value="deadsea">Dead Sea</option>
                <option value="jerash">Jerash</option>
              </select>
            </div>
          </div>
        );
      case "byGuides":
        return (
          <div className="side-filters">
            <h3>By Guides Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="guidesOnly" />
                <label htmlFor="guidesOnly">Guides Only</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="guidesWithVoucherItineraries" />
                <label htmlFor="guidesWithVoucherItineraries">Guides with voucher itineraries</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="guidesWithMainItineraries" />
                <label htmlFor="guidesWithMainItineraries">Guides with main itineraries</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Language:</label>
              <select>
                <option value="">Select Language</option>
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="spanish">Spanish</option>
                <option value="italian">Italian</option>
                <option value="russian">Russian</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>
          </div>
        );
      case "byItineraries":
        return (
          <div className="side-filters">
            <h3>By Itineraries Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showItineraryReport" />
                <label htmlFor="showItineraryReport">Show Itinerary Report</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showItineraryWithVouchers" />
                <label htmlFor="showItineraryWithVouchers">Show Itinerary with Vouchers</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showItineraryWithoutVouchers" />
                <label htmlFor="showItineraryWithoutVouchers">Show Itinerary without Vouchers</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Itinerary Type:</label>
              <select>
                <option value="">Select Type</option>
                <option value="main">Main</option>
                <option value="voucher">Voucher</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        );
      case "byClientsList":
        return (
          <div className="side-filters">
            <h3>By Clients List Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="byArrival" />
                <label htmlFor="byArrival">By Arrival</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="byDeparture" />
                <label htmlFor="byDeparture">By Departure</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="byStayingInHotel" />
                <label htmlFor="byStayingInHotel">By Staying in Hotel</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Sort By:</label>
              <select>
                <option value="">Select Sort Option</option>
                <option value="name">Name</option>
                <option value="nationality">Nationality</option>
                <option value="roomNumber">Room Number</option>
                <option value="arrivalDate">Arrival Date</option>
                <option value="departureDate">Departure Date</option>
              </select>
            </div>
          </div>
        );
      case "byEntrances":
        return (
          <div className="side-filters">
            <h3>By Entrances Filters</h3>
            <div className="filter-group">
              <label>Entrance Type:</label>
              <select>
                <option value="">Select Type</option>
                <option value="historical">Historical</option>
                <option value="natural">Natural</option>
                <option value="cultural">Cultural</option>
              </select>
            </div>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showEntranceFees" />
                <label htmlFor="showEntranceFees">Show Entrance Fees</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showGuideServices" />
                <label htmlFor="showGuideServices">Show Guide Services</label>
              </div>
            </div>
          </div>
        );
      case "byNationality":
        return (
          <div className="side-filters">
            <h3>By Nationality Filters</h3>
            <div className="filter-group">
              <label>Nationality:</label>
              <select>
                <option value="">Select Nationality</option>
                <option value="european">European</option>
                <option value="american">American</option>
                <option value="asian">Asian</option>
                <option value="australian">Australian</option>
                <option value="middleEastern">Middle Eastern</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Report Type:</label>
              <select>
                <option value="">Select Report Type</option>
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="statistical">Statistical</option>
              </select>
            </div>
            
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showVisaRequirements" />
                <label htmlFor="showVisaRequirements">Show Visa Requirements</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showSpecialRequirements" />
                <label htmlFor="showSpecialRequirements">Show Special Requirements</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="groupByAgent" />
                <label htmlFor="groupByAgent">Group by Agent</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="includeStatistics" />
                <label htmlFor="includeStatistics">Include Statistics</label>
              </div>
            </div>
          </div>
        );
      case "byExtras":
        return (
          <div className="side-filters">
            <h3>By Extras Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="extrasRundown" />
                <label htmlFor="extrasRundown">Extras Rundown</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="extrasRundownWithDetails" />
                <label htmlFor="extrasRundownWithDetails">Extras Rundown With Details</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Service Name:</label>
              <select>
                <option value="">Select Service</option>
                <option value="specialServices">Special Services</option>
                <option value="vipServices">VIP Services</option>
                <option value="additionalActivities">Additional Activities</option>
                <option value="customExperiences">Custom Experiences</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Pick Up:</label>
              <select>
                <option value="">Select Pick Up</option>
                <option value="hotel">Hotel</option>
                <option value="airport">Airport</option>
                <option value="restaurant">Restaurant</option>
                <option value="attraction">Attraction</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Drop Off:</label>
              <select>
                <option value="">Select Drop Off</option>
                <option value="hotel">Hotel</option>
                <option value="airport">Airport</option>
                <option value="restaurant">Restaurant</option>
                <option value="attraction">Attraction</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select>
                <option value="">Select Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        );
      case "byAllRundowns":
        return (
          <div className="side-filters">
            <h3>All Rundowns Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showGroupRundowns" />
                <label htmlFor="showGroupRundowns">Group Rundowns</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showHotelRundowns" />
                <label htmlFor="showHotelRundowns">Hotel Rundowns</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showTransportRundowns" />
                <label htmlFor="showTransportRundowns">Transport Rundowns</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showGuideRundowns" />
                <label htmlFor="showGuideRundowns">Guide Rundowns</label>
              </div>
            </div>
          </div>
        );
      case "byFilesFullDetails":
        return (
          <div className="side-filters">
            <h3>Files Full Details Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showFinancialDetails" />
                <label htmlFor="showFinancialDetails">Financial Details</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showItineraryDetails" />
                <label htmlFor="showItineraryDetails">Itinerary Details</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showClientDetails" />
                <label htmlFor="showClientDetails">Client Details</label>
              </div>
            </div>
          </div>
        );
      case "byUninvoicedGroups":
        return (
          <div className="side-filters">
            <h3>Uninvoiced Groups Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="uninvoiced" />
                <label htmlFor="uninvoiced">Uninvoiced</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="invoiced" />
                <label htmlFor="invoiced">Invoiced</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="bothInvoiceStatus" />
                <label htmlFor="bothInvoiceStatus">Both</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Invoice Type:</label>
              <select>
                <option value="">Select Invoice Type</option>
                <option value="standard">Standard</option>
                <option value="proforma">Proforma</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By:</label>
              <select>
                <option value="arrivalDate">Arrival Date</option>
                <option value="departureDate">Departure Date</option>
                <option value="agentName">Agent Name</option>
                <option value="groupSize">Group Size</option>
              </select>
            </div>
          </div>
        );
      case "byClosedFiles":
        return (
          <div className="side-filters">
            <h3>Closed Files Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="closedFilesYes" />
                <label htmlFor="closedFilesYes">Yes</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="closedFilesNo" />
                <label htmlFor="closedFilesNo">No</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="closedFilesBoth" />
                <label htmlFor="closedFilesBoth">Both</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Closed Date Range:</label>
              <div className="date-field">
                <label>From:</label>
                <input type="date" id="closedDateFrom" />
              </div>
              <div className="date-field">
                <label>To:</label>
                <input type="date" id="closedDateTo" />
              </div>
            </div>
          </div>
        );
      case "byNumberOfPax":
        return (
          <div className="side-filters">
            <h3>Number of Pax Filters</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="showAsTable" />
                <label htmlFor="showAsTable">Table</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="showAsGraph" />
                <label htmlFor="showAsGraph">Graph</label>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Pax Range:</label>
              <div className="range-field">
                <label>Min:</label>
                <input type="number" id="paxRangeMin" min="1" />
              </div>
              <div className="range-field">
                <label>Max:</label>
                <input type="number" id="paxRangeMax" min="1" />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Group By:</label>
              <select>
                <option value="">Select Option</option>
                <option value="agent">Agent</option>
                <option value="nationality">Nationality</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Helpers for search
  const parseDate = (v) => (v ? new Date(v) : null);

  const overlaps = (arr, dep, from, to) => {
    if (!arr && !dep) return false;
    const start = arr || dep;
    const end = dep || arr || start;
    return (!from || end >= from) && (!to || start <= to);
  };

  const getArrDepDates = (res) => {
    const rows = res.ArrDep || res.arrDepRows || [];
    const arrRow = rows.find((r) => r.arr) || rows[0];
    const depRow = rows.find((r) => r.dep) || rows[1];

    const arrDate =
      (arrRow && arrRow.date) ||
      res.dateArr ||
      res.arrivalDate ||
      (res.generalData && res.generalData.dateArr) ||
      null;

    const depDate =
      (depRow && depRow.date) ||
      res.dateDep ||
      res.departureDate ||
      (res.generalData && res.generalData.dateDep) ||
      null;

    return { arrDate: arrDate || null, depDate: depDate || null, arrRow, depRow };
  };

  const getGroupName = (res) =>
    (res.generalData && res.generalData.groupName) ||
    res.groupName ||
    res.group ||
    "";

  const getFileNo = (res) =>
    (res.generalData && (res.generalData.fileNo || res.generalData.reservationCode)) ||
    res.fileNo ||
    res.id ||
    "";

  const getPax = (res, arrRow) => {
    const pickNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    // General tab is authoritative; fall back to Arr/Dep, then Hotels
    const fromGeneral = pickNum(res?.generalData?.pax);
    const fromArrDep = pickNum(arrRow?.pax ?? arrRow?.Pax);
    const fromHotels = pickNum(res?.Hotels?.[0]?.pax);

    const n = fromGeneral ?? fromArrDep ?? fromHotels ?? 0;
    return n;
  };

  const buildRow = (res) => {
    const { arrDate, depDate, arrRow } = getArrDepDates(res);
    const group = getGroupName(res);
    const fileNo = getFileNo(res);
    const pax = getPax(res, arrRow);
    const username = res.createdBy || (user && user.username) || "-";

    return {
      fileNo,
      groupName: group || "-",
      accountName: group || "-", // As specified: Account Name is taken from the group name
      pax,
      arrDate: arrDate || "-",
      depDate: depDate || "-",
      username
    };
  };

  // Accessor helpers for other filters
  const getAgent = (res) =>
    (res.generalData && res.generalData.agent) || res.agent || "";

  const getNationalityValue = (res) =>
    (res.generalData && res.generalData.nationality) || res.nationality || "";

  const getClientName = (res) =>
    (res.generalData && res.generalData.clientName) || res.clientName || "";

  const getHotels = (res) => res.Hotels || res.hotels || [];
  const getTransportation = (res) => res.Transportation || res.transportation || [];
  const getRestaurants = (res) => res.Restaurants || res.restaurants || [];
  const getGuides = (res) => res.Guides || res.guides || [];
  const getEntrances = (res) => res.Entrance || res.entrances || [];

  const getItinerariesList = (res) => {
    const list = res.Itineraries || [];
    if (Array.isArray(list) && list.length) return list;
    if (Array.isArray(res.itineraryItems))
      return res.itineraryItems.map((it) => ({ itinerary: it }));
    if (Array.isArray(res.itinerary))
      return res.itinerary.map((it) =>
        typeof it === "string" ? ({ itinerary: it }) : it
      );
    if (typeof res.itinerary === "string")
      return res.itinerary.split("\n").filter(Boolean).map((s) => ({ itinerary: s }));
    return [];
  };

  const str = (v) => (v || "").toString();
  const includes = (hay, needle) =>
    str(hay).toLowerCase().includes(str(needle).toLowerCase());

  // Tab-specific matchers (beyond date range which is enforced in handleSearch)
  const matchesByTab = (res) => {
    switch (activeTab) {
      case "byGroups": {
        const gf = (groupName || "").trim();
        return gf ? includes(getGroupName(res), gf) : true;
      }
      case "byAgents": {
        const af = (dynamicField || generalFilters.agentName || "").trim();
        return af ? includes(getAgent(res), af) : true;
      }
      case "byNationality": {
        const nf = (dynamicField || generalFilters.nationality || "").trim();
        return nf ? includes(getNationalityValue(res), nf) : true;
      }
      case "byClientsList": {
        const cf = (dynamicField || "").trim();
        return cf ? includes(getClientName(res), cf) : true;
      }
      case "byHotels": {
        const hf = (dynamicField || "").trim();
        const hotels = getHotels(res);
        return hf ? hotels.some((h) => includes(h?.hotelName || h?.name, hf)) : true;
      }
      case "byTransportation": {
        const tf = (dynamicField || "").trim();
        const list = getTransportation(res);
        return tf
          ? list.some(
              (t) =>
                includes(t?.transCo, tf) ||
                includes(t?.vehicleType, tf) ||
                includes(t?.driverName, tf)
            )
          : true;
      }
      case "byRestaurants": {
        const rf = (dynamicField || "").trim();
        const list = getRestaurants(res);
        return rf
          ? list.some((r) => includes(r?.restaurantName || r?.name, rf))
          : true;
      }
      case "byGuides": {
        const gf = (dynamicField || "").trim();
        const list = getGuides(res);
        return gf
          ? list.some(
              (g) =>
                includes(g?.name, gf) ||
                includes(g?.guideName, gf) ||
                includes(g?.language, gf)
            )
          : true;
      }
      case "byEntrances": {
        const ef = (dynamicField || "").trim();
        const list = getEntrances(res);
        return ef
          ? list.some(
              (e) =>
                includes(e?.entrance, ef) ||
                includes(e?.name, ef) ||
                includes(e?.site, ef)
            )
          : true;
      }
      case "byItineraries": {
        const itf = (dynamicField || "").trim();
        const list = getItinerariesList(res);
        return itf ? list.some((i) => includes(i?.itinerary, itf)) : true;
      }
      default:
        return true;
    }
  };

  const handleSearch = async () => {
    setError("");
    setLoading(true);
    try {
      const { fromDate, toDate } = dateRange;
      if (!fromDate || !toDate) {
        setResults([]);
        setTotals({ records: 0, pax: 0 });
        setError("From Date and To Date are required.");
        setLoading(false);
        return;
      }

      const from = parseDate(fromDate);
      const to = parseDate(toDate);
      const groupFilter = (groupName || "").trim().toLowerCase();

      // Load from storage (may be array or object)
      const stored = (await getAllFromStorage("reservations")) || [];
      const storedList = Array.isArray(stored) ? stored : Object.values(stored || {});

      // Load dump and merge
      let dumpList = [];
      try {
        const resp = await fetch("/data/reservationDump.json");
        if (resp.ok) {
          const dumpObj = await resp.json();
          dumpList = Object.values(dumpObj || {});
        }
      } catch {
        // ignore dump load errors
      }

      // Merge by fileNo/id to avoid duplicates
      const byKey = {};
      [...storedList, ...dumpList].forEach((r) => {
        const key = getFileNo(r) || r.id;
        if (key) byKey[key] = r;
      });
      const all = Object.values(byKey);

      // Filter
      const filtered = all.filter((res) => {
        // Always enforce date-range overlap first
        const { arrDate, depDate } = getArrDepDates(res);
        const arr = arrDate ? new Date(arrDate) : null;
        const dep = depDate ? new Date(depDate) : null;
        if (!overlaps(arr, dep, from, to)) return false;

        // Then apply tab-specific criteria
        return matchesByTab(res);
      });

      // Map to rows
      const rows = filtered.map(buildRow);

      // Totals
      const totalPax = rows.reduce((sum, r) => sum + (Number(r.pax) || 0), 0);

      setResults(rows);
      setTotals({ records: rows.length, pax: totalPax });
    } catch (e) {
      console.error("Search error:", e);
      setError("An error occurred while searching. Please try again.");
      setResults([]);
      setTotals({ records: 0, pax: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operations-container">
      <h2>Operations</h2>
      
      {/* Date Range */}
      <div className="date-range">
        <div className="date-field">
          <label>From Date:</label>
          <input
            type="date"
            name="fromDate"
            value={dateRange.fromDate}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="date-field">
          <label>To Date:</label>
          <input
            type="date"
            name="toDate"
            value={dateRange.toDate}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>
      
      {/* Group Name */}
      <div className="group-name">
        <label>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={handleGroupNameChange}
          placeholder="Type or select group name"
          list="groupNamesList"
        />
        <datalist id="groupNamesList">
          {groupNames.map((name, index) => (
            <option key={index} value={name} />
          ))}
        </datalist>
      </div>
      
      {/* Dynamic Field - Moved here as requested */}
      <div className="dynamic-field-container">
        {renderDynamicField()}
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        {/* Group 1: Main Categories */}
        <button
          className={`tab ${activeTab === "byGroups" ? "active" : ""}`}
          onClick={() => handleTabChange("byGroups")}
        >
          By Groups
        </button>
        <button
          className={`tab ${activeTab === "byAgents" ? "active" : ""}`}
          onClick={() => handleTabChange("byAgents")}
        >
          By Agents
        </button>
        <button
          className={`tab ${activeTab === "byNationality" ? "active" : ""}`}
          onClick={() => handleTabChange("byNationality")}
        >
          By Nationality
        </button>
        <button
          className={`tab ${activeTab === "byClientsList" ? "active" : ""}`}
          onClick={() => handleTabChange("byClientsList")}
        >
          By Clients List
        </button>
        
        {/* Group 2: Services */}
        <button
          className={`tab ${activeTab === "byHotels" ? "active" : ""}`}
          onClick={() => handleTabChange("byHotels")}
        >
          By Hotels
        </button>
        <button
          className={`tab ${activeTab === "byTransportation" ? "active" : ""}`}
          onClick={() => handleTabChange("byTransportation")}
        >
          By Transportation
        </button>
        <button
          className={`tab ${activeTab === "byRestaurants" ? "active" : ""}`}
          onClick={() => handleTabChange("byRestaurants")}
        >
          By Restaurants
        </button>
        <button
          className={`tab ${activeTab === "byGuides" ? "active" : ""}`}
          onClick={() => handleTabChange("byGuides")}
        >
          By Guides
        </button>
        <button
          className={`tab ${activeTab === "byEntrances" ? "active" : ""}`}
          onClick={() => handleTabChange("byEntrances")}
        >
          By Entrances
        </button>
        <button
          className={`tab ${activeTab === "byExtras" ? "active" : ""}`}
          onClick={() => handleTabChange("byExtras")}
        >
          By Extras
        </button>
        
        {/* Group 3: Reports */}
        <button
          className={`tab ${activeTab === "byItineraries" ? "active" : ""}`}
          onClick={() => handleTabChange("byItineraries")}
        >
          By Itineraries
        </button>
        <button
          className={`tab ${activeTab === "byAllRundowns" ? "active" : ""}`}
          onClick={() => handleTabChange("byAllRundowns")}
        >
          By All Rundowns
        </button>
        <button
          className={`tab ${activeTab === "byFilesFullDetails" ? "active" : ""}`}
          onClick={() => handleTabChange("byFilesFullDetails")}
        >
          By Files Full Details
        </button>
        <button
          className={`tab ${activeTab === "byUninvoicedGroups" ? "active" : ""}`}
          onClick={() => handleTabChange("byUninvoicedGroups")}
        >
          By Uninvoiced Groups
        </button>
        <button
          className={`tab ${activeTab === "byClosedFiles" ? "active" : ""}`}
          onClick={() => handleTabChange("byClosedFiles")}
        >
          By Closed Files
        </button>
        <button
          className={`tab ${activeTab === "byNumberOfPax" ? "active" : ""}`}
          onClick={() => handleTabChange("byNumberOfPax")}
        >
          By Number of Pax
        </button>
      </div>
      
      {/* General Filters */}
      <div className="general-filters">
        <h3>General Filters</h3>
        <div className="general-filters-grid">
          <div className="general-filter-item">
            <label>Reservation Type:</label>
            <select
              name="reservationType"
              value={generalFilters.reservationType}
              onChange={handleGeneralFilterChange}
            >
              <option value="">Select Type</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
          
          <div className="general-filter-item">
            <label>Agent Name:</label>
            <input
              type="text"
              name="agentName"
              value={generalFilters.agentName}
              onChange={handleGeneralFilterChange}
              placeholder="Enter agent name"
            />
          </div>
          
          <div className="general-filter-item">
            <label>File No:</label>
            <input
              type="text"
              name="fileNo"
              value={generalFilters.fileNo}
              onChange={handleGeneralFilterChange}
              placeholder="Enter file number"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Group Category:</label>
            <input
              type="text"
              name="groupCategory"
              value={generalFilters.groupCategory}
              onChange={handleGeneralFilterChange}
              placeholder="Enter group category"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Group Category 2:</label>
            <input
              type="text"
              name="groupCategory2"
              value={generalFilters.groupCategory2}
              onChange={handleGeneralFilterChange}
              placeholder="Enter group category 2"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Group Category 3:</label>
            <input
              type="text"
              name="groupCategory3"
              value={generalFilters.groupCategory3}
              onChange={handleGeneralFilterChange}
              placeholder="Enter group category 3"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Pax &gt;=</label>
            <input
              type="number"
              name="paxMin"
              value={generalFilters.paxMin}
              onChange={handleGeneralFilterChange}
              placeholder="Minimum pax"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Guaranty Code:</label>
            <input
              type="text"
              name="guarantyCode"
              value={generalFilters.guarantyCode}
              onChange={handleGeneralFilterChange}
              placeholder="Enter guaranty code"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Nationality:</label>
            <input
              type="text"
              name="nationality"
              value={generalFilters.nationality}
              onChange={handleGeneralFilterChange}
              placeholder="Enter nationality"
            />
          </div>
          
          <div className="general-filter-item">
            <label>User Name:</label>
            <input
              type="text"
              name="userName"
              value={generalFilters.userName}
              onChange={handleGeneralFilterChange}
              placeholder="Enter user name"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Resv. Owner:</label>
            <input
              type="text"
              name="resvOwner"
              value={generalFilters.resvOwner}
              onChange={handleGeneralFilterChange}
              placeholder="Enter reservation owner"
            />
          </div>
          
          <div className="general-filter-item">
            <label>Market:</label>
            <input
              type="text"
              name="market"
              value={generalFilters.market}
              onChange={handleGeneralFilterChange}
              placeholder="Enter market"
            />
          </div>
          
          <div className="general-filter-checkbox">
            <input
              type="checkbox"
              id="onlineBooking"
              name="onlineBooking"
              checked={generalFilters.onlineBooking}
              onChange={handleGeneralFilterChange}
            />
            <label htmlFor="onlineBooking">Online Booking</label>
          </div>
          
          <div className="general-filter-checkbox">
            <input
              type="checkbox"
              id="hideAgentNameInReports"
              name="hideAgentNameInReports"
              checked={generalFilters.hideAgentNameInReports}
              onChange={handleGeneralFilterChange}
            />
            <label htmlFor="hideAgentNameInReports">Hide Agent Name in Reports</label>
          </div>
          
          <div className="general-filter-checkbox">
            <input
              type="checkbox"
              id="showCanceledFiles"
              name="showCanceledFiles"
              checked={generalFilters.showCanceledFiles}
              onChange={handleGeneralFilterChange}
            />
            <label htmlFor="showCanceledFiles">Show Canceled Files</label>
          </div>
          
          <div className="general-filter-checkbox">
            <input
              type="checkbox"
              id="showNoShowFiles"
              name="showNoShowFiles"
              checked={generalFilters.showNoShowFiles}
              onChange={handleGeneralFilterChange}
            />
            <label htmlFor="showNoShowFiles">Show No-Show Files</label>
          </div>
          
          <div className="general-filter-checkbox">
            <input
              type="checkbox"
              id="showOnlyConfirmedFiles"
              name="showOnlyConfirmedFiles"
              checked={generalFilters.showOnlyConfirmedFiles}
              onChange={handleGeneralFilterChange}
            />
            <label htmlFor="showOnlyConfirmedFiles">Show Only Confirmed Files</label>
          </div>
        </div>
      </div>
      
      {/* Dynamic Section with Side Filters and Results */}
      <div className="dynamic-section">
        {renderSideFilters()}
        
        {/* Results Section - Moved here as requested */}
        <div className="results-section">
          <h3>Results</h3>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          {!error && loading && <p>Loading...</p>}
          {!error && !loading && results.length === 0 && (
            <p>No results to display. Please select filters and click Search.</p>
          )}
          {!error && !loading && results.length > 0 && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="results-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>File No.</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>Group Name</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>Account Name</th>
                      <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #444" }}>Pax</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>Arr. Date</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>Dep. Date</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #444" }}>Username</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.fileNo}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.fileNo}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.groupName}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.accountName}</td>
                        <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #333" }}>{r.pax}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.arrDate || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.depDate || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #333" }}>{r.username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "12px", display: "flex", gap: "20px", fontWeight: "bold" }}>
                <div>Total Records: {totals.records}</div>
                <div>Total Pax: {totals.pax}</div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button" onClick={handleSearch} disabled={loading}>Search</button>
        <button className="action-button preview">Preview PDF</button>
        <button className="action-button download">Download PDF</button>
        <button className="action-button print">Print</button>
      </div>
    </div>
  );
}

export default Operations;