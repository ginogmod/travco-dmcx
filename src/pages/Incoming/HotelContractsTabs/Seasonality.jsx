import { useState, useEffect } from "react";

function Seasonality({ seasons = [], onSeasonsChange, missingDays, totalSeasonDays, totalContractDays }) {
  const [localSeasons, setLocalSeasons] = useState([
    {
      season: "",
      fromDate: "",
      toDate: "",
      days: 0,
      rDays: 0,
      alert: "",
      notes: ""
    }
  ]);

  useEffect(() => {
    if (seasons.length > 0) {
      setLocalSeasons(seasons);
    }
  }, [seasons]);

  const handleChange = (index, field, value) => {
    const updatedSeasons = [...localSeasons];
    updatedSeasons[index][field] = value;

    // Calculate days if from and to dates are provided
    if (field === 'fromDate' || field === 'toDate') {
      const fromDate = field === 'fromDate' ? value : updatedSeasons[index].fromDate;
      const toDate = field === 'toDate' ? value : updatedSeasons[index].toDate;
      
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
        updatedSeasons[index].days = days > 0 ? days : 0;
      }
    }

    setLocalSeasons(updatedSeasons);
    onSeasonsChange(updatedSeasons);
  };

  const addSeason = () => {
    const newSeason = {
      season: "",
      fromDate: "",
      toDate: "",
      days: 0,
      rDays: 0,
      alert: "",
      notes: ""
    };
    const updatedSeasons = [...localSeasons, newSeason];
    setLocalSeasons(updatedSeasons);
    onSeasonsChange(updatedSeasons);
  };

  const removeSeason = (index) => {
    if (localSeasons.length === 1) {
      // Don't remove the last row, just clear it
      const clearedSeason = {
        season: "",
        fromDate: "",
        toDate: "",
        days: 0,
        rDays: 0,
        alert: "",
        notes: ""
      };
      setLocalSeasons([clearedSeason]);
      onSeasonsChange([clearedSeason]);
      return;
    }
    
    const updatedSeasons = localSeasons.filter((_, i) => i !== index);
    setLocalSeasons(updatedSeasons);
    onSeasonsChange(updatedSeasons);
  };

  return (
    <div className="seasonality-tab">
      <h2>Seasonality</h2>
      
      <div className="table-container">
        <table className="editable-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Days</th>
              <th>R.Days</th>
              <th>Alert</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localSeasons.map((season, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={season.season}
                    onChange={(e) => handleChange(index, "season", e.target.value)}
                    placeholder="Enter season"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={season.fromDate}
                    onChange={(e) => handleChange(index, "fromDate", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={season.toDate}
                    onChange={(e) => handleChange(index, "toDate", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={season.days}
                    onChange={(e) => handleChange(index, "days", e.target.value)}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={season.rDays}
                    onChange={(e) => handleChange(index, "rDays", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={season.alert}
                    onChange={(e) => handleChange(index, "alert", e.target.value)}
                    placeholder="Alert"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={season.notes}
                    onChange={(e) => handleChange(index, "notes", e.target.value)}
                    placeholder="Notes"
                  />
                </td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => removeSeason(index)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="action-buttons">
        <button className="add-button" onClick={addSeason}>
          Add Season
        </button>
      </div>
      
      <div className="summary-section">
        <div className="summary-field">
          <label>Missing Days</label>
          <div className="value">{missingDays}</div>
        </div>
        
        <div className="summary-field">
          <label>Total Seasons Days</label>
          <div className="value">{totalSeasonDays}</div>
        </div>
        
        <div className="summary-field">
          <label>Total Contract Days</label>
          <div className="value">{totalContractDays}</div>
        </div>
      </div>
    </div>
  );
}

export default Seasonality;