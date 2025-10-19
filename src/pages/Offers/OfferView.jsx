import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOneFromStorage } from "../../assets/utils/storage";

// This component now simply redirects to the AddOffer component with the offer ID
function OfferView() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the offer exists
    const fetchOffer = async () => {
      try {
        const offerData = await getOneFromStorage("offers", id);
        
        if (offerData) {
          // If this is a Group Series offer, open the Group Series Offer page in view mode
          if (offerData.isGroupSeries) {
            navigate("/offers/group-series-new", {
              state: {
                ...offerData,
                isGroupSeries: true,
                viewMode: true, // instruct GS page to render in read-only mode
                quotations: offerData.quotations || [],
                options: offerData.options || [],
                validityDates: offerData.validityDates || [],
                optionals: offerData.optionals || []
              }
            });
          } else {
            // Redirect to the standard AddOffer edit route
            navigate(`/offers/edit/${id}`);
          }
        } else {
          // If offer doesn't exist, redirect back to offers list
          navigate("/offers");
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
        // If there's an error, redirect back to offers list
        navigate("/offers");
      }
    };
    
    fetchOffer();
  }, [id, navigate]);

  // This component doesn't render anything meaningful as it immediately redirects
  return <div style={{ color: "white", padding: "30px" }}>Loading offer...</div>;
}

export default OfferView;