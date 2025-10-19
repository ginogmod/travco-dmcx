import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TravelAgents() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/data/TravelAgents.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load TravelAgents.json:", err));
  }, []);

  const filteredData = data.filter((item) =>
    (item.Account_Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Tel || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetails = (accNo) => {
    navigate(`/crm/travel-agents/${accNo}`);
  };

  const styles = {
    container: {
      padding: "30px",
      color: "white",
      fontFamily: "Segoe UI, sans-serif"
    },
    search: {
      padding: "10px 14px",
      marginBottom: "20px",
      backgroundColor: "#1f1f1f",
      color: "white",
      border: "1px solid #555",
      borderRadius: "6px",
      width: "300px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#1f1f1f",
      color: "white"
    },
    th: {
      padding: "12px",
      borderBottom: "1px solid #444",
      backgroundColor: "#222",
      textAlign: "left"
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #333"
    },
    button: {
      backgroundColor: "#444",
      color: "white",
      padding: "6px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    },
    pagination: {
      marginTop: "20px",
      display: "flex",
      gap: "12px",
      alignItems: "center"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>Travel Agents</h2>

      <input
        type="text"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        style={styles.search}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Account No</th>
            <th style={styles.th}>Account Name</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Address</th>
            <th style={styles.th}>Details</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}>{item.Acc_No}</td>
              <td style={styles.td}>{item.Account_Name}</td>
              <td style={styles.td}>{item.Tel || item.Mobile || "-"}</td>
              <td style={styles.td}>{item.Email || "-"}</td>
              <td style={styles.td}>{item.Contact || "-"}</td>
              <td style={styles.td}>{item.Address || "-"}</td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => handleDetails(item.Acc_No)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button
          style={styles.button}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          style={styles.button}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TravelAgents;
