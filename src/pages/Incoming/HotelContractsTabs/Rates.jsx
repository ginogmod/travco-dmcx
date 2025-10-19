import React, { useState, useEffect } from "react";
import "./Tabs.css";

function Rates({ seasons, onRatesChange }) {
  const [ratesData, setRatesData] = useState([]);
  const [groupRatesData, setGroupRatesData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [options, setOptions] = useState({
    pricesPerRoom: false,
    roomOnlyContract: false,
    hbInclusiveContract: false,
    groupRates: false
  });
  
  // Initialize rates data based on seasons
  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const initialRatesData = seasons.map(season => ({
        seasonId: season.id || Math.random().toString(36).substr(2, 9),
        seasonName: season.name,
        days: season.days,
        rates: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "P.P",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "P.R",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          }
        ]
      }));
      setRatesData(initialRatesData);
      
      // If there's no data yet, create a default entry
      if (initialRatesData.length === 0) {
        addNewSeason();
      }
    } else {
      // If no seasons provided, create a default entry
      addNewSeason();
    }
  }, [seasons]);
  
  // Initialize group rates data when seasons change or when groupRates option is enabled
  useEffect(() => {
    if (options.groupRates && seasons && seasons.length > 0) {
      const initialGroupRatesData = seasons.map(season => ({
        seasonId: season.id || Math.random().toString(36).substr(2, 9),
        seasonName: season.name,
        days: season.days,
        rates: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "10-15 Pax",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "16-25 Pax",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          }
        ]
      }));
      setGroupRatesData(initialGroupRatesData);
      
      // If there's no data yet, create a default entry
      if (initialGroupRatesData.length === 0) {
        addNewGroupSeason();
      }
    }
  }, [seasons, options.groupRates]);
  
  // Notify parent component when rates change
  useEffect(() => {
    if (onRatesChange && ratesData.length > 0) {
      onRatesChange({
        rates: ratesData,
        groupRates: options.groupRates ? groupRatesData : [],
        options: options
      });
    }
  }, [ratesData, groupRatesData, options, onRatesChange]);

  const handleRateChange = (seasonIndex, rateTypeIndex, field, value) => {
    const updatedRatesData = [...ratesData];
    
    // Validate numeric fields
    if (['double', 'singleSup', 'thirdPerson', 'breakfast', 'lunch', 'dinner', 'allInc'].includes(field)) {
      // Allow empty string or numeric values only
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        updatedRatesData[seasonIndex].rates[rateTypeIndex][field] = value;
      } else {
        return; // Invalid input, don't update
      }
    } else {
      updatedRatesData[seasonIndex].rates[rateTypeIndex][field] = value;
    }
    
    setRatesData(updatedRatesData);
  };
  
  const handleOptionChange = (option) => {
    setOptions({
      ...options,
      [option]: !options[option]
    });
  };
  
  const addNewSeason = () => {
    const newSeason = {
      seasonId: Math.random().toString(36).substr(2, 9),
      seasonName: selectedSeason || "New Season",
      days: "0",
      rates: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "P.P",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "P.R",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        }
      ]
    };
    
    setRatesData([...ratesData, newSeason]);
    setSelectedSeason("");
  };
  
  const addRateType = (seasonIndex) => {
    const updatedRatesData = [...ratesData];
    const newRateType = {
      id: Math.random().toString(36).substr(2, 9),
      type: "Custom",
      double: "",
      singleSup: "",
      thirdPerson: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      allInc: ""
    };
    
    updatedRatesData[seasonIndex].rates.push(newRateType);
    setRatesData(updatedRatesData);
  };
  
  const removeSeason = (seasonIndex) => {
    if (ratesData.length === 1) {
      // Don't remove the last season, just clear it
      const clearedSeason = {
        seasonId: Math.random().toString(36).substr(2, 9),
        seasonName: "New Season",
        days: "0",
        rates: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "P.P",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "P.R",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          }
        ]
      };
      setRatesData([clearedSeason]);
      return;
    }
    
    const updatedRatesData = ratesData.filter((_, i) => i !== seasonIndex);
    setRatesData(updatedRatesData);
  };
  
  const removeRateType = (seasonIndex, rateTypeIndex) => {
    const updatedRatesData = [...ratesData];
    
    if (updatedRatesData[seasonIndex].rates.length === 1) {
      // Don't remove the last rate type, just clear it
      updatedRatesData[seasonIndex].rates[0] = {
        id: Math.random().toString(36).substr(2, 9),
        type: "P.P",
        double: "",
        singleSup: "",
        thirdPerson: "",
        breakfast: "",
        lunch: "",
        dinner: "",
        allInc: ""
      };
    } else {
      updatedRatesData[seasonIndex].rates = updatedRatesData[seasonIndex].rates.filter((_, i) => i !== rateTypeIndex);
    }
    
    setRatesData(updatedRatesData);
  };
  
  // Group rates functions
  const handleGroupRateChange = (seasonIndex, rateTypeIndex, field, value) => {
    const updatedGroupRatesData = [...groupRatesData];
    
    // Validate numeric fields
    if (['double', 'singleSup', 'thirdPerson', 'breakfast', 'lunch', 'dinner', 'allInc'].includes(field)) {
      // Allow empty string or numeric values only
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        updatedGroupRatesData[seasonIndex].rates[rateTypeIndex][field] = value;
      } else {
        return; // Invalid input, don't update
      }
    } else {
      updatedGroupRatesData[seasonIndex].rates[rateTypeIndex][field] = value;
    }
    
    setGroupRatesData(updatedGroupRatesData);
  };
  
  const addNewGroupSeason = () => {
    const newSeason = {
      seasonId: Math.random().toString(36).substr(2, 9),
      seasonName: selectedSeason || "New Season",
      days: "0",
      rates: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "10-15 Pax",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "16-25 Pax",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        }
      ]
    };
    
    setGroupRatesData([...groupRatesData, newSeason]);
  };
  
  const addGroupRateType = (seasonIndex) => {
    const updatedGroupRatesData = [...groupRatesData];
    const newRateType = {
      id: Math.random().toString(36).substr(2, 9),
      type: "Custom Group",
      double: "",
      singleSup: "",
      thirdPerson: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      allInc: ""
    };
    
    updatedGroupRatesData[seasonIndex].rates.push(newRateType);
    setGroupRatesData(updatedGroupRatesData);
  };
  
  const removeGroupSeason = (seasonIndex) => {
    if (groupRatesData.length === 1) {
      // Don't remove the last season, just clear it
      const clearedSeason = {
        seasonId: Math.random().toString(36).substr(2, 9),
        seasonName: "New Season",
        days: "0",
        rates: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "10-15 Pax",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            type: "16-25 Pax",
            double: "",
            singleSup: "",
            thirdPerson: "",
            breakfast: "",
            lunch: "",
            dinner: "",
            allInc: ""
          }
        ]
      };
      setGroupRatesData([clearedSeason]);
      return;
    }
    
    const updatedGroupRatesData = groupRatesData.filter((_, i) => i !== seasonIndex);
    setGroupRatesData(updatedGroupRatesData);
  };
  
  const removeGroupRateType = (seasonIndex, rateTypeIndex) => {
    const updatedGroupRatesData = [...groupRatesData];
    
    if (updatedGroupRatesData[seasonIndex].rates.length === 1) {
      // Don't remove the last rate type, just clear it
      updatedGroupRatesData[seasonIndex].rates[0] = {
        id: Math.random().toString(36).substr(2, 9),
        type: "10-15 Pax",
        double: "",
        singleSup: "",
        thirdPerson: "",
        breakfast: "",
        lunch: "",
        dinner: "",
        allInc: ""
      };
    } else {
      updatedGroupRatesData[seasonIndex].rates = updatedGroupRatesData[seasonIndex].rates.filter((_, i) => i !== rateTypeIndex);
    }
    
    setGroupRatesData(updatedGroupRatesData);
  };
  
  const handleImportSeasons = () => {
    if (!seasons || seasons.length === 0) {
      alert("No seasons available to import");
      return;
    }
    
    // Create rates data for all available seasons
    const importedRatesData = seasons.map(season => ({
      seasonId: season.id || Math.random().toString(36).substr(2, 9),
      seasonName: season.name || season.season,
      days: season.days || "0",
      rates: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "P.P",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "P.R",
          double: "",
          singleSup: "",
          thirdPerson: "",
          breakfast: "",
          lunch: "",
          dinner: "",
          allInc: ""
        }
      ]
    }));
    
    setRatesData(importedRatesData);
  };

  return (
    <div className="rates-tab">
      <div className="rates-container">
        <div className="rates-table-container">
          <h2 className="section-title">FIT Rates Configuration</h2>
          <table className="rates-table">
            <thead>
              <tr className="rates-header">
                <th colSpan={5}>FIT Rates : Standard Rooms</th>
                <th colSpan={5}>FIT Meal Rates Per Person</th>
                <th>Actions</th>
              </tr>
              <tr>
                <th>Season</th>
                <th>Days</th>
                <th>Per</th>
                <th>Double</th>
                <th>Single Sup.</th>
                <th>3rd Person</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
                <th>All Inc.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ratesData.map((seasonRate, seasonIndex) => (
                <React.Fragment key={seasonRate.seasonId}>
                  {seasonRate.rates.map((rate, rateIndex) => (
                    <tr key={rate.id}>
                      {rateIndex === 0 && (
                        <>
                          <td rowSpan={seasonRate.rates.length} className="season-cell">
                            <input
                              type="text"
                              value={seasonRate.seasonName}
                              onChange={(e) => {
                                const updatedRatesData = [...ratesData];
                                updatedRatesData[seasonIndex].seasonName = e.target.value;
                                setRatesData(updatedRatesData);
                              }}
                            />
                          </td>
                          <td rowSpan={seasonRate.rates.length} className="days-cell">
                            <input
                              type="text"
                              value={seasonRate.days}
                              onChange={(e) => {
                                // Allow only numeric values
                                if (e.target.value === '' || /^\d*$/.test(e.target.value)) {
                                  const updatedRatesData = [...ratesData];
                                  updatedRatesData[seasonIndex].days = e.target.value;
                                  setRatesData(updatedRatesData);
                                }
                              }}
                            />
                          </td>
                        </>
                      )}
                      <td>
                        <input
                          type="text"
                          value={rate.type}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "type", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.double}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "double", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.singleSup}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "singleSup", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.thirdPerson}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "thirdPerson", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.breakfast}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "breakfast", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.lunch}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "lunch", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.dinner}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "dinner", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={rate.allInc}
                          onChange={(e) => handleRateChange(seasonIndex, rateIndex, "allInc", e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          className="remove-button"
                          onClick={() => removeRateType(seasonIndex, rateIndex)}
                          title="Remove Rate Type"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="action-row">
                    <td colSpan={11}>
                      <div className="rate-actions">
                        <button
                          className="add-button small"
                          onClick={() => addRateType(seasonIndex)}
                          title="Add Rate Type"
                        >
                          + Add Rate Type
                        </button>
                        <button
                          className="remove-button small"
                          onClick={() => removeSeason(seasonIndex)}
                          title="Remove Season"
                        >
                          Remove Season
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          <div className="add-season-section">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="">Select a season</option>
              {seasons && seasons.map(season => (
                <option key={season.id || season.name} value={season.name}>
                  {season.name}
                </option>
              ))}
            </select>
            <button className="add-button" onClick={addNewSeason}>
              + Add Season
            </button>
          </div>
          
          {/* Group Rates Table - Only shown when Group Rates option is enabled */}
          {options.groupRates && (
            <>
              <h2 className="section-title">Group Rates Configuration</h2>
              <table className="rates-table group-rates-table">
                <thead>
                  <tr className="rates-header">
                    <th colSpan={5}>Group Rates : Standard Rooms</th>
                    <th colSpan={5}>Group Meal Rates Per Person</th>
                    <th>Actions</th>
                  </tr>
                  <tr>
                    <th>Season</th>
                    <th>Days</th>
                    <th>Group Size</th>
                    <th>Double</th>
                    <th>Single Sup.</th>
                    <th>3rd Person</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                    <th>All Inc.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {groupRatesData.map((seasonRate, seasonIndex) => (
                    <React.Fragment key={seasonRate.seasonId}>
                      {seasonRate.rates.map((rate, rateIndex) => (
                        <tr key={rate.id}>
                          {rateIndex === 0 && (
                            <>
                              <td rowSpan={seasonRate.rates.length} className="season-cell">
                                <input
                                  type="text"
                                  value={seasonRate.seasonName}
                                  onChange={(e) => {
                                    const updatedGroupRatesData = [...groupRatesData];
                                    updatedGroupRatesData[seasonIndex].seasonName = e.target.value;
                                    setGroupRatesData(updatedGroupRatesData);
                                  }}
                                />
                              </td>
                              <td rowSpan={seasonRate.rates.length} className="days-cell">
                                <input
                                  type="text"
                                  value={seasonRate.days}
                                  onChange={(e) => {
                                    // Allow only numeric values
                                    if (e.target.value === '' || /^\d*$/.test(e.target.value)) {
                                      const updatedGroupRatesData = [...groupRatesData];
                                      updatedGroupRatesData[seasonIndex].days = e.target.value;
                                      setGroupRatesData(updatedGroupRatesData);
                                    }
                                  }}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <input
                              type="text"
                              value={rate.type}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "type", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.double}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "double", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.singleSup}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "singleSup", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.thirdPerson}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "thirdPerson", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.breakfast}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "breakfast", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.lunch}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "lunch", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.dinner}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "dinner", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={rate.allInc}
                              onChange={(e) => handleGroupRateChange(seasonIndex, rateIndex, "allInc", e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              className="remove-button"
                              onClick={() => removeGroupRateType(seasonIndex, rateIndex)}
                              title="Remove Group Rate Type"
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="action-row">
                        <td colSpan={11}>
                          <div className="rate-actions">
                            <button
                              className="add-button small"
                              onClick={() => addGroupRateType(seasonIndex)}
                              title="Add Group Rate Type"
                            >
                              + Add Group Rate Type
                            </button>
                            <button
                              className="remove-button small"
                              onClick={() => removeGroupSeason(seasonIndex)}
                              title="Remove Group Season"
                            >
                              Remove Season
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              <div className="add-season-section">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  <option value="">Select a season</option>
                  {seasons && seasons.map(season => (
                    <option key={season.id || season.name} value={season.name}>
                      {season.name}
                    </option>
                  ))}
                </select>
                <button className="add-button" onClick={addNewGroupSeason}>
                  + Add Group Season
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="rates-options">
          <h3>Rate Options</h3>
          <button
            className="import-button"
            onClick={handleImportSeasons}
            title="Import all available seasons"
          >
            Import Seasons
          </button>
          
          <div className="options-section">
            <h4>Price Configuration</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.pricesPerRoom}
                onChange={() => handleOptionChange('pricesPerRoom')}
              />
              Enter Prices Per Room
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.groupRates}
                onChange={() => handleOptionChange('groupRates')}
              />
              Group Rates
            </label>
          </div>
          
          <div className="options-section">
            <h4>Contract Type</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.roomOnlyContract}
                onChange={() => handleOptionChange('roomOnlyContract')}
              />
              Room Only Contract
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.hbInclusiveContract}
                onChange={() => handleOptionChange('hbInclusiveContract')}
              />
              H.B Inclusive Contract
            </label>
          </div>
          
          {/* Contract Category section removed as requested */}
        </div>
      </div>
    </div>
  );
}

export default Rates;