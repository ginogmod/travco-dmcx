import { useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../../data/TRSNew.json"; // Replace with correct relative path if needed

function Transportation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 10;

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
    navigate(`/crm/transportation/${accNo}`);
  };

  const handleAddNew = () => {
    navigate(`/crm/transportation/new`);
  };

  const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    search: { padding: "8px 14px", borderRadius: "6px", width: "250px", backgroundColor: "#1f1f1f", border: "1px solid #444", color: "white" },
    button: { backgroundColor: "#444", color: "white", padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", backgroundColor: "#1f1f1f", color: "white" },
    th: { borderBottom: "1px solid #444", padding: "12px", textAlign: "left", backgroundColor: "#222" },
    td: { borderBottom: "1px solid #333", padding: "10px" },
    pagination: { marginTop: "20px", display: "flex", gap: "12px", alignItems: "center" }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Transportation Companies</h2>

      <div style={styles.header}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />
        <button style={styles.button} onClick={handleAddNew}>+ Add New</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Account No</th>
            <th style={styles.th}>Account Name</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Address</th>
            <th style={styles.th}>Stars</th>
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
              <td style={styles.td}>{item.Stars || "-"}</td>
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

export default Transportation;
