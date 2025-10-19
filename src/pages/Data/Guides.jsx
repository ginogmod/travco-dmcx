import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Data.css";

function Guides() {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const { user } = useAuth();
  
  // Check if user has permission to edit
  const canEdit = user && (user.role === "admin" || user.role === "general_manager");

  useEffect(() => {
    fetch("/data/guides.json")
      .then((res) => res.json())
      .then((data) => {
        // Sort guides by NO
        const sorted = data.sort((a, b) => a.NO - b.NO);
        setGuides(sorted);
      })
      .catch((err) => console.error("Failed to load guides data", err));
  }, []);

  const handleSave = () => {
    if (!canEdit) {
      alert("❌ You don't have permission to save changes.");
      return;
    }

    fetch("http://localhost:3001/api/saveGuides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guides),
    })
      .then((res) => {
        if (res.ok) {
          alert("✅ Guides data saved successfully!");
        } else {
          alert("❌ Failed to save guides data.");
        }
      })
      .catch((error) => {
        alert("❌ Error saving guides data: " + error.message);
      });
  };

  const handleChange = (index, field, value) => {
    if (!canEdit) {
      alert("❌ You don't have permission to edit this data.");
      return;
    }

    const updated = [...guides];
    updated[index][field] = value;
    setGuides(updated);
  };

  const handleAddGuide = () => {
    if (!canEdit) {
      alert("❌ You don't have permission to add guides.");
      return;
    }

    // Find the highest NO value to assign the next number
    const maxNo = guides.reduce((max, guide) => Math.max(max, guide.NO || 0), 0);
    
    const newGuide = {
      "NO": maxNo + 1,
      "Guide Name": "",
      "Language": "English"
    };
    
    setGuides([...guides, newGuide]);
  };

  const handleDelete = (index) => {
    if (!canEdit) {
      alert("❌ You don't have permission to delete guides.");
      return;
    }

    const updated = [...guides];
    updated.splice(index, 1);
    setGuides(updated);
  };

  // Get unique languages for the filter dropdown
  const languages = ["All", ...new Set(guides.map(guide => guide.Language))];

  // Filter guides based on search term and language filter
  const filteredGuides = guides.filter(guide => {
    const nameMatch = guide["Guide Name"].toLowerCase().includes(search.toLowerCase());
    const languageMatch = languageFilter === "All" || guide.Language === languageFilter;
    return nameMatch && languageMatch;
  });

  return (
    <div className="data-container">
      <h2>Guides</h2>
      <div className="actions">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <select 
          value={languageFilter} 
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="language-filter"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {canEdit && (
          <>
            <button onClick={handleAddGuide}>Add Guide</button>
            <button onClick={handleSave}>Save</button>
          </>
        )}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>NO</th>
            <th>Guide Name</th>
            <th>Language</th>
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredGuides.map((guide, index) => (
            <tr key={index}>
              <td>{guide.NO}</td>
              <td>
                {canEdit ? (
                  <input
                    value={guide["Guide Name"]}
                    onChange={(e) => handleChange(index, "Guide Name", e.target.value)}
                  />
                ) : (
                  guide["Guide Name"]
                )}
              </td>
              <td>
                {canEdit ? (
                  <select
                    value={guide.Language}
                    onChange={(e) => handleChange(index, "Language", e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Italy">Italy</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                ) : (
                  guide.Language
                )}
              </td>
              {canEdit && (
                <td>
                  <button onClick={() => handleDelete(index)}>❌</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Guides;