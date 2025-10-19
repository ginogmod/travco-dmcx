import { Link } from "react-router-dom";
import OfferList from "./OfferList";

function Offers() {
  const containerStyle = {
    color: "white",
    padding: "30px",
    fontFamily: "Segoe UI, sans-serif",
  };

  const headerStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "20px"
  };

  const buttonStyle = {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    fontWeight: "bold",
    fontSize: "15px",
    border: "none",
    borderRadius: "6px",
    textDecoration: "none"
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Offers</h1>
      <Link to="/offers/new" style={buttonStyle}>+ Add New Offer</Link>
      <hr style={{ margin: "30px 0", borderColor: "#444" }} />
      <OfferList />
    </div>
  );
}

export default Offers;
