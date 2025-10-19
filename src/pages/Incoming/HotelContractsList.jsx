import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelContractsList.css";

function HotelContractsList() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    stars: "",
    search: ""
  });
  
  const navigate = useNavigate();

  // Load hotels data
  useEffect(() => {
    fetch("/data/hotelRates.json")
      .then((res) => res.json())
      .then((data) => {
        // Extract unique hotels (remove duplicates based on Hotel name)
        const uniqueHotels = [];
        const hotelMap = new Map();
        
        data.forEach(item => {
          if (!hotelMap.has(item.Hotel)) {
            hotelMap.set(item.Hotel, true);
            uniqueHotels.push({
              hotel: item.Hotel,
              city: item.City,
              stars: item.Stars,
              contracts: [] // This would be populated from actual contracts data
            });
          }
        });
        
        const sorted = uniqueHotels.sort((a, b) => a.hotel.localeCompare(b.hotel));
        setHotels(sorted);
        setFilteredHotels(sorted);
      })
      .catch((err) => console.error("Failed to load hotel data", err));
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let data = [...hotels];

    if (filters.city) data = data.filter(h => h.city === filters.city);
    if (filters.stars) data = data.filter(h => h.stars === parseInt(filters.stars));
    if (filters.search) {
      data = data.filter(h =>
        h.hotel.toLowerCase().includes(filters.search.toLowerCase()) ||
        h.city.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredHotels(data);
  }, [filters, hotels]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddContract = () => {
    navigate("/hotel-contracts/new");
  };

  const handleViewContracts = (hotel) => {
    // Navigate to a page showing contracts for this specific hotel
    navigate(`/hotel-contracts/hotel/${encodeURIComponent(hotel)}`);
  };

  const unique = (key) => {
    return [...new Set(hotels.map(h => h[key]).filter(Boolean))].sort();
  };

  return (
    <div className="hotel-contracts-list-container">
      <div className="header-section">
        <h1>Hotel Contracts</h1>
        <button className="add-button" onClick={handleAddContract}>
          + Add General Contract
        </button>
      </div>

      <div className="filters-section">
        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {unique("city").map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>

        <select name="stars" value={filters.stars} onChange={handleFilterChange}>
          <option value="">All Stars</option>
          {unique("stars").map((stars, index) => (
            <option key={index} value={stars}>{stars} ★</option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by hotel or city..."
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      <div className="hotels-list">
        <table>
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>City</th>
              <th>Stars</th>
              <th>Active Contracts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel, index) => (
              <tr key={index}>
                <td>{hotel.hotel}</td>
                <td>{hotel.city}</td>
                <td>{hotel.stars} ★</td>
                <td>{hotel.contracts.length}</td>
                <td>
                  <button 
                    className="view-button"
                    onClick={() => handleViewContracts(hotel.hotel)}
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

export default HotelContractsList;