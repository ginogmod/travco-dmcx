// src/pages/AddOffer.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { generateOfferPDF } from "../../assets/utils/generateOfferPDF";
import { generateOfferWord } from "../../assets/utils/generateOfferWord";
import { saveToStorage, getOneFromStorage, updateInStorage, getAllFromStorage } from "../../assets/utils/storage";
import { useNavigate } from "react-router-dom";
import DropZone from "../ReservationsTabs/DropZone";
import autoContentTranslations from "../../assets/translations/autoContent";

function AddOffer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the offer ID from URL params if in view mode
  const [isViewMode, setIsViewMode] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [offerData, setOfferData] = useState({
    fileNo: "",
    groupName: "",
    agent: "",
    nationality: "",
    dateArr: "",
    dateDep: "",
    programLength: "",
    message: "",
    itinerary: "",
    inclusions: "",
    exclusions: "",
    createdBy: "",
    signatureKey: "",
    generalNotes: "",
    isConfirmed: false,
    validityFrom: "",
    validityTo: "",
    showOption1: true,
    showOption2: true,
    showOption3: true,
    cancellationFees: "30 - 14 Days before the departure date; 60%\n13 - 07 Days before the departure date; 75%\n06-0 days; 90%",
    bookingsGuarantee: "Cut off dates for rooming lists or a deposit will be requested based on cancellation policy",
    bookingProcess: "15% Deposit is required to proceed with the booking, deposit amount will be on none-refundable basis, except in international force major conditions.\nUpon setting the programs and dates, we will proceed in booking and send the final confirmations with the hotel's names, which will be guaranteed, along with the deadline dates of the full payment which will be before the cancellation period.",
    ratesAndTaxes: "Rates are guaranteed less a change on taxes occurs or an unforseen change in the exchange rates +/- or a change in rates by the suppliers is implemented, which will affect the rates directly and accordingly we will advise the change at least 30 days prior implementing it.",
    childrenPolicy: "0-1.99 free of charge",
    checkInOutTimes: "",
    tripleRooms: "Triple rooms in Jordan consist of rollaway beds.\nRate for triple room is the rate for per persin in sharing room multiple by three pax.",
    bankAccountDetails: "Bank Account Details(Bank Charges to be paid by the sender)\nBeneficiary Name: Travco Group Holding/ Jordan\nBank Adress: UM UTHAINA Branch, Amman, Jordan.\nUSD Currency.\nAccount # US Dollars: 210-194812\nUSD IBAN#: JO81JGBA2100001948120020010000",
    mainImage: "",
    smallImage1: "",
    smallImage2: "",
    smallImage3: "",
  });
  const [emptyFields, setEmptyFields] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [ratesAndSupplements, setRatesAndSupplements] = useState([]);
  const [options, setOptions] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [quotationId, setQuotationId] = useState(null);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [isGroupSeries, setIsGroupSeries] = useState(false);
  const [validityDates, setValidityDates] = useState([]);

  // Continuation itinerary images (Page 2, 3, ...)
  // Each entry: { main, small1, small2, small3 }
  const [continuationImages, setContinuationImages] = useState([]);

  // Count itinerary days based on "Day N:" pattern
  const countDaysFromItinerary = (txt) => {
    if (!txt) return 0;
    const lines = String(txt).split("\n");
    return lines.filter(line => /^Day\s*\d+/i.test(line.trim())).length;
  };

  // When itinerary changes, resize continuation pages to groups of 3 days:
  // Page 1 = days 1..3 (uses mainImage + smallImage1..3)
  // Page 2 = days 4..6 (continuationImages[0])
  // Page 3 = days 7..9 (continuationImages[1]), etc.
  useEffect(() => {
    const days = countDaysFromItinerary(offerData.itinerary);
    const continuationPages = Math.max(0, Math.ceil(days / 3) - 1);
    setContinuationImages(prev => {
      const next = [...prev];
      // extend
      while (next.length < continuationPages) {
        next.push({ main: "", small1: "", small2: "", small3: "" });
      }
      // shrink
      if (next.length > continuationPages) next.length = continuationPages;
      return next;
    });
  }, [offerData.itinerary]);

  // Flatten continuation images into a single ordered list consumed by the PDF generator:
  // For each continuation page: [main, small1, small2, small3]
  const getFlatAdditionalImagesFromState = (pages) => {
    const out = [];
    (Array.isArray(pages) ? pages : []).forEach(p => {
      if (p?.main) out.push(p.main);
      if (p?.small1) out.push(p.small1);
      if (p?.small2) out.push(p.small2);
      if (p?.small3) out.push(p.small3);
    });
    return out;
  };

  // Render the available image options (keep in sync with the other image dropdowns)
  const renderImageOptions = () => (
    <>
      <option value="">Select Image</option>
      <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
      <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
      <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
      <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
      <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
      <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
      <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
      <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
      <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
      <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
      <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
      <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
      <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
    </>
  );

  // logo state
  const [agencyLogoDataUrl, setAgencyLogoDataUrl] = useState("");

  // Get default exclusions based on selected language
  const getDefaultExclusions = (language = "english") => {
    const lang = language.toLowerCase();
    const translations = autoContentTranslations[lang] || autoContentTranslations.english;
    return translations.defaultExclusions;
  };
  
  // Default exclusions (will be updated when language changes)
  const [defaultExclusions, setDefaultExclusions] = useState(getDefaultExclusions("english"));

  // compute auto-inclusions with language support
  const computeAutoInclusions = (dayDetails, language = "english") => {
    const lang = language.toLowerCase();
    const t = autoContentTranslations[lang] || autoContentTranslations.english;
    
    const inc = new Set();
    let mealDays = [];
    const entranceFees = new Set();

    dayDetails.forEach((row, idx) => {
      if (row.entrances && Array.isArray(row.entrances)) {
        row.entrances.forEach(site => {
          if (site) { // Ensure site is not null or undefined
            entranceFees.add(site);
          }
        });
      }
      if (row.guideRequired) {
        if (row.guideType === "Private") {
          inc.add(t.qualifiedPrivateGuide.replace("{language}", row.guideLanguage));
        } else {
          inc.add(t.qualifiedLocalGuide);
        }
      }
      if (row.transportType)
        inc.add(t.transportation);
      inc.add(t.meetAndAssist);
      inc.add(t.applicableTaxes);
      // Removed jeep service from inclusions as it's already in the quotation itinerary
      if (row.mealIncluded)
        mealDays.push(idx + 1);
    });

    if (mealDays.length)
      inc.add(t.mealsOnDays.replace("{days}", mealDays.join(", ")));
    
    // Add a consolidated entrance fees entry
    if (entranceFees.size > 0) {
      inc.add(t.entranceFees.replace("{sites}", Array.from(entranceFees).join(", ")));
    }

    return Array.from(inc);
  };

  // Check if we're in view mode and load offer data if an ID is provided
  // Helper function to find a matching quotation for an offer
  const findMatchingQuotation = async (offer) => {
    try {
      if (!offer) return null;
      
      // Get all quotations
      const allQuotations = await getAllFromStorage("quotations");
      console.log("Searching for matching quotation among", allQuotations.length, "quotations");
      
      // Try to find a matching quotation based on group name, dates, etc.
      const matchingQuotation = allQuotations.find(q =>
        (q.group === offer.groupName || q.group === offer.group) &&
        (q.arrivalDate === offer.dateArr || q.departureDate === offer.dateDep)
      );
      
      if (matchingQuotation) {
        console.log("Found matching quotation:", matchingQuotation.id);
        return matchingQuotation.id;
      }
      
      return null;
    } catch (error) {
      console.error("Error in findMatchingQuotation:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("AddOffer component mounted or id changed:", id);
    
    const loadOfferData = async () => {
      if (id) {
        try {
          const offerData = await getOneFromStorage("offers", id);
          if (offerData) {
            console.log("Loading offer from storage:", offerData);
            console.log("Offer quotationId:", offerData.quotationId);
            
            setIsViewMode(true);
            setIsConfirmed(offerData.isConfirmed || false);
            
            // Load validity dates if available
            if (offerData.validityDates && Array.isArray(offerData.validityDates)) {
              setValidityDates(offerData.validityDates);
            } else {
              setValidityDates([]);
            }
            
            setOfferData({
              fileNo: offerData.fileNo || "",
              groupName: offerData.groupName || "",
              agent: offerData.agent || "",
              nationality: offerData.nationality || "",
              dateArr: offerData.dateArr || "",
              dateDep: offerData.dateDep || "",
              programLength: offerData.programLength || "",
              message: offerData.message || "",
              itinerary: offerData.itinerary || "",
              inclusions: offerData.inclusions || "",
              exclusions: offerData.exclusions || "",
              createdBy: offerData.createdBy || "",
              signatureKey: offerData.signatureKey || "",
              generalNotes: offerData.generalNotes || "",
              isConfirmed: offerData.isConfirmed || false,
              validityFrom: offerData.validityFrom || "",
              validityTo: offerData.validityTo || "",
              showOption1: offerData.showOption1 !== undefined ? offerData.showOption1 : true,
              showOption2: offerData.showOption2 !== undefined ? offerData.showOption2 : true,
              showOption3: offerData.showOption3 !== undefined ? offerData.showOption3 : true,
              cancellationFees: offerData.cancellationFees || "30 - 14 Days before the departure date; 60%\n13 - 07 Days before the departure date; 75%\n06-0 days; 90%",
              bookingsGuarantee: offerData.bookingsGuarantee || "Cut off dates for rooming lists or a deposit will be requested based on cancellation policy",
              bookingProcess: offerData.bookingProcess || "15% Deposit is required to proceed with the booking, deposit amount will be on none-refundable basis, except in international force major conditions.\nUpon setting the programs and dates, we will proceed in booking and send the final confirmations with the hotel's names, which will be guaranteed, along with the deadline dates of the full payment which will be before the cancellation period.",
              ratesAndTaxes: offerData.ratesAndTaxes || "Rates are guaranteed less a change on taxes occurs or an unforseen change in the exchange rates +/- or a change in rates by the suppliers is implemented, which will affect the rates directly and accordingly we will advise the change at least 30 days prior implementing it.",
              childrenPolicy: offerData.childrenPolicy || "0-1.99 free of charge",
              checkInOutTimes: offerData.checkInOutTimes || "",
              tripleRooms: offerData.tripleRooms || "Triple rooms in Jordan consist of rollaway beds.\nRate for triple room is the rate for per persin in sharing room multiple by three pax.",
              bankAccountDetails: offerData.bankAccountDetails || "Bank Account Details(Bank Charges to be paid by the sender)\nBeneficiary Name: Travco Group Holding/ Jordan\nBank Adress: UM UTHAINA Branch, Amman, Jordan.\nUSD Currency.\nAccount # US Dollars: 210-194812\nUSD IBAN#: JO81JGBA2100001948120020010000",
              mainImage: offerData.mainImage || "",
              smallImage1: offerData.smallImage1 || "",
              smallImage2: offerData.smallImage2 || "",
              smallImage3: offerData.smallImage3 || "",
            });
            
            // Set quotation data and options
            if (offerData.quotations) {
              console.log("Setting quotation data from offer:", offerData.quotations.length, "quotations");
              setQuotationData(offerData.quotations);
            }
            
            if (offerData.options) {
              console.log("Setting options from offer:", offerData.options.length, "options");
              setOptions(offerData.options);
            }
            
            // Load the quotation ID if available
            if (offerData.quotationId) {
              console.log("Found quotation ID in offer:", offerData.quotationId);
              setQuotationId(offerData.quotationId);
              
              // Verify that the quotation exists
              const quotation = await getOneFromStorage("quotations", offerData.quotationId);
              if (quotation) {
                console.log("Verified quotation exists:", quotation.id);
              } else {
                console.warn("Quotation with ID", offerData.quotationId, "not found in storage");
                
                // List all quotations to debug
                const allQuotations = await getAllFromStorage("quotations");
                console.log("All quotations:", allQuotations.map(q => q.id));
              }
            } else {
              console.warn("No quotation ID found in offer:", offerData);
              
              // Try to find a matching quotation
              const matchingQuotationId = await findMatchingQuotation(offerData);
              if (matchingQuotationId) {
                console.log("Found matching quotation ID:", matchingQuotationId);
                setQuotationId(matchingQuotationId);
                
                // Update the offer with the found quotation ID
                const updatedOffer = {
                  ...offerData,
                  quotationId: matchingQuotationId
                };
                console.log("Updating offer with matching quotation ID:", updatedOffer);
                await updateInStorage("offers", id, updatedOffer);
              }
            }
            
            // Check if this is a special offer
            setIsSpecialOffer(offerData.isSpecial || false);
            setIsGroupSeries(offerData.isGroupSeries || false);
            // Load continuation images for itinerary continuation pages if saved previously
            setContinuationImages(Array.isArray(offerData.continuationImages) ? offerData.continuationImages : []);
          } else {
            console.error("Offer not found in storage:", id);
          }
        } catch (error) {
          console.error("Error loading offer:", error);
        }
      }
    };
    
    loadOfferData();
  }, [id]);

  // Prefill from router state or JSON upload
  useEffect(() => {
    console.log("Location state or view mode changed:", { isViewMode, locationState: location.state });
    
    // Only run this if we're not in view mode
    if (!isViewMode) {
      const state = location.state;
      if (state && state.quotations) {
        console.log("Setting data from location state:", state);
        setQuotationData(state.quotations);
        const first = state.quotations[0] || {};
        setOptions(state.options || []);
        const autoInc = computeAutoInclusions(first.itinerary || [], selectedLanguage);
        setIsSpecialOffer(state.isSpecial || false);
        
        // Store the quotation ID if available
        // First check for direct quotationId property (new method)
        if (state.quotationId) {
          console.log("Setting quotation ID from state.quotationId:", state.quotationId);
          setQuotationId(state.quotationId);
        }
        // Fallback to id property (old method)
        else if (state.id) {
          console.log("Setting quotation ID from state.id:", state.id);
          setQuotationId(state.id);
        } else {
          console.warn("No quotation ID found in location state");
        }
        
        setOfferData(prev => {
          const newData = {
            ...prev,
            groupName: state.group || "",
            agent: state.agent || "",
            dateArr: state.arrivalDate || "",
            dateDep: state.departureDate || "",
            programLength: state.programLength || "",
            createdBy: state.createdBy || "",
            itinerary: (first.itinerary || []).map((day, i) => `Day ${i + 1}: ${day.itinerary}`).join("\n"),
            inclusions: autoInc.join("\n"),
            exclusions: getDefaultExclusions(selectedLanguage).join("\n"),
            fileNo: `OFF-${Date.now()}`
          };
          console.log("Setting offer data from location state:", newData);
          return newData;
        });
        
        console.log("Loaded quotation data:", state);
      } else {
        console.log("No quotation data in location state, setting default file number");
        setOfferData(prev => ({ ...prev, fileNo: `OFF-${Date.now()}` }));
      }
    }
  }, [location.state, isViewMode, location.key]);

  const processQuotationData = (parsed) => {
    console.log("Processing quotation data...");
    try {
      let quotData, opts, first, topLevelData = {};

      if (Array.isArray(parsed)) { // Handles old array format
        quotData = parsed;
        first = parsed[0] || {};
        opts = first.options || [];
      } else { // Handles new object format
        quotData = parsed.quotations || [];
        first = quotData[0] || {};
        opts = parsed.options || [];
        topLevelData = parsed;
      }

      if (!quotData || quotData.length === 0) throw new Error("No quotation data found.");

      setQuotationData(quotData);
      setOptions(opts);

      const autoInc = computeAutoInclusions(first.itinerary || [], selectedLanguage);
      
      const newOfferData = {
        ...offerData,
        groupName: topLevelData.group || first.paxRange || first.group || "",
        agent: topLevelData.agent || first.agent || "",
        nationality: topLevelData.nationality || first.nationality || "",
        dateArr: topLevelData.arrivalDate || first.arrivalDate || "",
        dateDep: topLevelData.departureDate || first.departureDate || "",
        programLength: topLevelData.programLength || first.programLength || "",
        createdBy: topLevelData.createdBy || first.createdBy || "",
        itinerary: (first.itinerary || []).map((day, i) => `Day ${i + 1}: ${day.itinerary}`).join("\n"),
        inclusions: autoInc.join("\n"),
        exclusions: getDefaultExclusions(selectedLanguage).join("\n"),
      };
      
      setOfferData(newOfferData);
      
      // Check for empty fields
      const emptyFieldsList = [];
      if (!newOfferData.groupName) emptyFieldsList.push("groupName");
      if (!newOfferData.agent) emptyFieldsList.push("agent");
      if (!newOfferData.nationality) emptyFieldsList.push("nationality");
      if (!newOfferData.dateArr) emptyFieldsList.push("dateArr");
      if (!newOfferData.dateDep) emptyFieldsList.push("dateDep");
      if (!newOfferData.createdBy) emptyFieldsList.push("createdBy");
      
      setEmptyFields(emptyFieldsList);
      
      console.log("Loaded quotation data from file:", {
        topLevelData,
        first,
        groupName: topLevelData.group || first.paxRange || first.group || "",
        emptyFields: emptyFieldsList
      });
      
      return true;
    } catch (e) {
      console.error("Failed to parse quotation JSON:", e);
      alert("Invalid Quotation JSON format.");
      return false;
    }
  };

  const handleQuotationSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target.result);
        processQuotationData(parsed);
      } catch (e) {
        console.error("Failed to parse quotation JSON:", e);
        alert("Invalid Quotation JSON format.");
      }
    };
    reader.readAsText(file);
  };
  
  const handleFileDrop = (data) => {
    // Process the data and get empty fields
    const result = processQuotationData(data);
    
    // Force a re-render to ensure the UI updates with the highlighted fields
    if (result) {
      // Small delay to ensure state updates have been processed
      setTimeout(() => {
        console.log("File dropped and processed, emptyFields:", emptyFields);
        // Force update by making a harmless state change
        setOfferData(prev => ({...prev}));
      }, 100);
    }
  };

  const handleOfferChange = e => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
    
    // If this field was previously empty and now has a value, remove it from emptyFields
    if (emptyFields.includes(name) && value.trim() !== "") {
      setEmptyFields(prev => prev.filter(field => field !== name));
    }
    // If this field now becomes empty, add it to emptyFields
    else if (!emptyFields.includes(name) && value.trim() === "") {
      setEmptyFields(prev => [...prev, name]);
    }
  };

  // handle agency logo upload
  const handleAgencyLogoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAgencyLogoDataUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // **Single PDF for all pax ranges**
  const generateSinglePDF = (language = "english", customOfferData = null) => {
    if (!quotationData.length) {
      alert("Please provide a quotation first.");
      return;
    }
    
    // Use customOfferData if provided, otherwise use the current offerData state
    const dataToUse = customOfferData || offerData;
    
    generateOfferPDF({
      ...dataToUse,
      pax: null,  // ignored in multi‐range mode
      options: options,
      quotations: quotationData,
      agencyLogo: agencyLogoDataUrl,  // added logo
      isGroupSeries: isGroupSeries,   // pass Group Series flag
      validityFrom: dataToUse.validityFrom,  // pass validity dates
      validityTo: dataToUse.validityTo,
      validityDates: validityDates,   // pass additional validity dates
      language: language,  // pass selected language
      showOption1: dataToUse.showOption1,  // pass option visibility flags
      showOption2: dataToUse.showOption2,
      showOption3: dataToUse.showOption3,
      // New: page-specific images for itinerary continuation pages (page 2 = first 3, page 3 = next 3, etc.)
      additionalImages: getFlatAdditionalImagesFromState(continuationImages),
      moreImages: getFlatAdditionalImagesFromState(continuationImages)
    });
  };

  // **Single Word (DOCX) for all pax ranges**
  const generateSingleWord = (language = "english", customOfferData = null) => {
    if (!quotationData.length) {
      alert("Please provide a quotation first.");
      return;
    }

    const dataToUse = customOfferData || offerData;

    // Use the same payload shape as PDF where applicable
    generateOfferWord({
      ...dataToUse,
      pax: null,
      options: options,
      quotations: quotationData,
      agencyLogo: agencyLogoDataUrl,
      isGroupSeries: isGroupSeries,
      validityFrom: dataToUse.validityFrom,
      validityTo: dataToUse.validityTo,
      validityDates: validityDates,
      language: language,
      showOption1: dataToUse.showOption1,
      showOption2: dataToUse.showOption2,
      showOption3: dataToUse.showOption3,
      additionalImages: getFlatAdditionalImagesFromState(continuationImages),
      moreImages: getFlatAdditionalImagesFromState(continuationImages)
    });
  };
  
  // Toggle language dropdown
  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };
  
  // Handle language selection
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageDropdown(false);
    
    // Update default exclusions based on selected language
    setDefaultExclusions(getDefaultExclusions(language));
    
    // If we have quotation data, update inclusions with translated versions
    if (quotationData.length > 0) {
      const first = quotationData[0] || {};
      const autoInc = computeAutoInclusions(first.itinerary || [], language);
      const translatedExclusions = getDefaultExclusions(language);
      
      // Update the offerData state for UI
      setOfferData(prev => ({
        ...prev,
        inclusions: autoInc.join("\n"),
        exclusions: translatedExclusions.join("\n")
      }));
      
      // Create a new object with updated translations for PDF generation
      // This ensures the PDF uses the translated content immediately
      // without waiting for the state update
      const updatedOfferData = {
        ...offerData,
        inclusions: autoInc.join("\n"),
        exclusions: translatedExclusions.join("\n")
      };
      
      generateSinglePDF(language, updatedOfferData);
    } else {
      generateSinglePDF(language);
    }
  };
  

  // Handle confirm and download for creating a reservation
  const handleConfirmAndDownload = async () => {
    if (!id) return;
    
    try {
      // Get the complete offer data
      const offerData = await getOneFromStorage("offers", id);
      if (!offerData) return;
      
      // Enhance the offer data with additional fields needed for reservation
      const enhancedOfferData = {
        ...offerData,
        // Ensure these fields are properly formatted for the reservation system
        group: offerData.groupName,
        agent: offerData.agent,
        arrivalDate: offerData.dateArr,
        departureDate: offerData.dateDep,
        // Extract itinerary items as an array if it's a string
        itineraryItems: offerData.itinerary ? offerData.itinerary.split('\n').filter(i => i.trim()) : [],
        // Include program length
        programLength: offerData.programLength || '',
        // Ensure hotels data is properly structured
        hotels: offerData.quotations?.flatMap(q => q.options.flatMap(o => {
          if (o.accommodations && o.accommodations.length > 0) {
            return o.accommodations.map(acc => ({
              name: acc.hotelName || '',
              city: acc.city || '',
              checkIn: offerData.dateArr || '',
              checkOut: offerData.dateDep || '',
              roomType: acc.roomType || '',
              mealPlan: acc.board || '',
              nights: acc.nights || 0
            }));
          } else {
            return [{
              name: o.hotelName || '',
              checkIn: offerData.dateArr || '',
              checkOut: offerData.dateDep || '',
              roomType: o.roomType || '',
              mealPlan: o.mealBasis || '',
              nights: o.nights || 0
            }];
          }
        })) || []
      };
  
      // Create JSON and trigger download
      const offerJSON = JSON.stringify(enhancedOfferData, null, 2);
      const blob = new Blob([offerJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `offer-${offerData.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Navigate to new reservation page
      navigate('/reservations/new');
    } catch (error) {
      console.error("Error in handleConfirmAndDownload:", error);
      alert("An error occurred while downloading the offer. Please check the console for details.");
    }
  };

  // Generate Reservation File: navigate to reservations/new with prefilled state from this confirmed offer
  const handleGenerateReservationFile = async () => {
    if (!id) return;

    try {
      // Load full offer from storage to ensure we include quotations/options
      const offer = await getOneFromStorage("offers", id);
      if (!offer) {
        alert("Offer not found. Please try again.");
        return;
      }

      const firstQuotation = Array.isArray(offer.quotations) && offer.quotations.length ? offer.quotations[0] : {};

      const enhancedOfferData = {
        ...offer,
        group: offer.groupName || offer.group || '',
        agent: offer.agent || '',
        nationality: offer.nationality || '',
        arrivalDate: offer.dateArr || offer.arrivalDate || '',
        departureDate: offer.dateDep || offer.departureDate || '',
        programLength: offer.programLength || '',
        // Prefer structured itinerary rows -> fallback to flat string split
        itineraryItems: Array.isArray(offer.itineraryRows) && offer.itineraryRows.length
          ? offer.itineraryRows.map(r => r?.itinerary || '').filter(Boolean)
          : (offer.itinerary ? String(offer.itinerary).split('\n').filter(i => i.trim()) : []),
        quotations: offer.quotations || [],
        options: offer.options || [],
        inclusions: offer.inclusions || '',
        exclusions: offer.exclusions || '',
        pax: firstQuotation.pax || firstQuotation.paxRange || offer.pax || ''
      };

      // Build hotels list from quotations/options (works for both old and new structures)
      enhancedOfferData.hotels =
        (offer.quotations?.flatMap(q =>
          (q.options || []).flatMap(o => {
            if (o.accommodations && o.accommodations.length > 0) {
              return o.accommodations.map(acc => ({
                name: acc.hotelName || '',
                city: acc.city || '',
                checkIn: offer.dateArr || '',
                checkOut: offer.dateDep || '',
                roomType: acc.roomType || '',
                mealPlan: acc.board || '',
                nights: acc.nights || 0
              }));
            } else {
              return [{
                name: o.hotelName || '',
                checkIn: offer.dateArr || '',
                checkOut: offer.dateDep || '',
                roomType: o.roomType || '',
                mealPlan: o.mealBasis || '',
                nights: o.nights || 0
              }];
            }
          })
        )) || [];

      // Navigate with state so NewReservation can auto-populate tabs
      navigate('/reservations/new', { state: enhancedOfferData });
    } catch (error) {
      console.error("Error generating reservation file from offer:", error);
      alert("Failed to generate the reservation file. Please check the console for details.");
    }
  };

  const handleSaveOffer = async () => {
    try {
      // Create a complete offer object with all necessary data
      const completeOffer = {
        ...offerData,
        quotations: quotationData,
        options: options,
        isSpecial: isSpecialOffer,
        isConfirmed: isConfirmed,
        isGroupSeries: isGroupSeries,
        validityDates: validityDates, // Store additional validity dates
        quotationId: quotationId, // Store the original quotation ID
        showOption1: offerData.showOption1,
        showOption2: offerData.showOption2,
        showOption3: offerData.showOption3,
        // Persist continuation images so revisiting the offer keeps selections
        continuationImages: continuationImages,
        entranceFees: quotationData[0]?.itinerary?.flatMap(day => day.entrances || []) || []
      };
      
      console.log("Saving offer with quotation ID:", quotationId);
      console.log("Complete offer data:", completeOffer);
      
      const savedOffer = await saveToStorage("offers", completeOffer);
      console.log("Saved offer:", savedOffer);
      
      // Verify the offer was saved correctly
      const verifyOffer = await getOneFromStorage("offers", savedOffer.id);
      console.log("Verified saved offer:", verifyOffer);
      console.log("Verified quotationId:", verifyOffer.quotationId);
      
      navigate("/offers");
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("An error occurred while saving the offer. Please check the console for details.");
    }
  };
  
  // Function to update hotel rates
  const updateHotelRate = (paxRangeIndex, optionIndex, accomIndex, field, value) => {
    const newQuotationData = [...quotationData];
    newQuotationData[paxRangeIndex].options[optionIndex].accommodations[accomIndex][field] = value;
    setQuotationData(newQuotationData);
  };

  return (
    <div style={{ color: "white", padding: 30, fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>{isViewMode ? "View Offer" : "New Offer"}</h1>

      {/* Quotation JSON - Only show in create mode */}
      {!isViewMode && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            {quotationData.length ? "Quotation Loaded" : "Upload Quotation JSON"}
          </label>
          {!quotationData.length ? (
            <>
              <input type="file" accept="application/json" onChange={handleQuotationSelect} style={inputStyle}/>
              <DropZone onFileDrop={handleFileDrop} />
            </>
          ) : (
            <p style={{ color: "#ccc" }}>{quotationData.length} range(s) loaded</p>
          )}
        </div>
      )}

      {/* Logo Upload - Only show in create mode */}
      {!isViewMode && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Agency Logo (optional)
          </label>
          <input type="file" accept="image/*" onChange={handleAgencyLogoUpload} style={inputStyle}/>
          {agencyLogoDataUrl && (
            <div style={{ marginTop: 10 }}>
              <p style={{ color: "#ccc" }}>Preview:</p>
              <img src={agencyLogoDataUrl} alt="Agency Logo" style={{ maxWidth: '120px', borderRadius: 4 }}/>
            </div>
          )}
        </div>
      )}

      {/* Offer Form */}
      <div style={formWrapperStyle}>
        <input name="fileNo"      placeholder="File No."     value={offerData.fileNo}      onChange={handleOfferChange} style={inputStyle} readOnly/>
        <input
          name="groupName"
          placeholder="Group Name"
          value={offerData.groupName}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("groupName") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("groupName") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />
        <input
          name="agent"
          placeholder="Agent"
          value={offerData.agent}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("agent") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("agent") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />
        <input
          name="nationality"
          placeholder="Nationality"
          value={offerData.nationality}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("nationality") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("nationality") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />
        <input
          type="date"
          name="dateArr"
          value={offerData.dateArr}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("dateArr") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("dateArr") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />
        <input
          type="number"
          name="programLength"
          placeholder="Program Length (Nights)"
          value={offerData.programLength}
          onChange={handleOfferChange}
          style={inputStyle}
          readOnly={isViewMode}
          min="1"
        />
        <input
          type="date"
          name="dateDep"
          value={offerData.dateDep}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("dateDep") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("dateDep") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />
        
        
        {/* Validity Fields - Only editable if Group Series is checked */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Validity
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>From:</label>
              <input
                type="date"
                name="validityFrom"
                value={isGroupSeries ? offerData.validityFrom : offerData.dateArr}
                onChange={handleOfferChange}
                style={{
                  ...inputStyle,
                  backgroundColor: isGroupSeries ? "#2a2a2a" : "#1f1f1f",
                  opacity: isGroupSeries ? 1 : 0.7
                }}
                readOnly={!isGroupSeries || isViewMode}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>To:</label>
              <input
                type="date"
                name="validityTo"
                value={isGroupSeries ? offerData.validityTo : offerData.dateDep}
                onChange={handleOfferChange}
                style={{
                  ...inputStyle,
                  backgroundColor: isGroupSeries ? "#2a2a2a" : "#1f1f1f",
                  opacity: isGroupSeries ? 1 : 0.7
                }}
                readOnly={!isGroupSeries || isViewMode}
              />
            </div>
          </div>
          
          {/* Multiple Validity Dates Section - Only visible if Group Series is checked */}
          {isGroupSeries && (
            <div style={{ marginTop: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                  Additional Validity Dates
                </label>
                {!isViewMode && (
                  <button
                    onClick={() => {
                      setValidityDates([...validityDates, { from: "", to: "" }]);
                    }}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    + Add Date Range
                  </button>
                )}
              </div>
              
              {validityDates.map((dateRange, index) => (
                <div key={index} style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  backgroundColor: "#1f1f1f",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #333"
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>From:</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => {
                        const newDates = [...validityDates];
                        newDates[index].from = e.target.value;
                        setValidityDates(newDates);
                      }}
                      style={inputStyle}
                      readOnly={isViewMode}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>To:</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => {
                        const newDates = [...validityDates];
                        newDates[index].to = e.target.value;
                        setValidityDates(newDates);
                      }}
                      style={inputStyle}
                      readOnly={isViewMode}
                    />
                  </div>
                  {!isViewMode && (
                    <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10 }}>
                      <button
                        onClick={() => {
                          const newDates = [...validityDates];
                          newDates.splice(index, 1);
                          setValidityDates(newDates);
                        }}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "5px 10px",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          name="createdBy"
          placeholder="Created By"
          value={offerData.createdBy}
          onChange={handleOfferChange}
          style={{
            ...inputStyle,
            borderColor: emptyFields.includes("createdBy") ? "#ff4d4d" : "#444",
            backgroundColor: emptyFields.includes("createdBy") ? "rgba(255, 77, 77, 0.1)" : "#2a2a2a"
          }}
          readOnly={isViewMode}
        />

        <textarea name="message" placeholder="Message to Client" rows={3}
          value={offerData.message} onChange={handleOfferChange} style={textAreaStyle} readOnly={isViewMode}/>

        <select name="signatureKey" value={offerData.signatureKey} onChange={handleOfferChange} style={inputStyle} disabled={isViewMode}>
          <option value="">Select Signature</option>
          <option value="shatha">Shatha Barqawi</option>
          <option value="omar">Omar Abu Osbaa</option>
          <option value="osama">Osama Al Refai</option>
          <option value="aya">Aya Al Bashiti</option>
          <option value="khalil">Khalil</option>
          <option value="laith">Laith</option>
          <option value="nejmeh">Nejmeh</option>
          <option value="nermin">Nermin</option>
          <option value="yanal">Yanal</option>
        </select>

        <textarea name="itinerary" placeholder="Itinerary (one per line)" rows={4}
          value={offerData.itinerary} onChange={handleOfferChange} style={textAreaStyle} readOnly={isViewMode}/>
          
        <h3 style={{ color: "#ffc107", marginTop: 20, marginBottom: 10 }}>PDF Images</h3>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Main Image (Large)
          </label>
          <select
            name="mainImage"
            value={offerData.mainImage}
            onChange={handleOfferChange}
            style={inputStyle}
            disabled={isViewMode}
          >
            <option value="">Select Main Image</option>
            <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
            <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
            <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
            <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
            <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
            <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
            <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
            <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
            <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
            <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
          </select>
          {offerData.mainImage && (
            <div style={{ marginTop: 10 }}>
              <img
                src={offerData.mainImage}
                alt="Main Image Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Small Image 1
          </label>
          <select
            name="smallImage1"
            value={offerData.smallImage1}
            onChange={handleOfferChange}
            style={inputStyle}
            disabled={isViewMode}
          >
            <option value="">Select Small Image 1</option>
            <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
            <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
            <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
            <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
            <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
            <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
            <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
            <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
            <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
            <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
          </select>
          {offerData.smallImage1 && (
            <div style={{ marginTop: 10 }}>
              <img
                src={offerData.smallImage1}
                alt="Small Image 1 Preview"
                style={{
                  maxWidth: '150px',
                  maxHeight: '100px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Small Image 2
          </label>
          <select
            name="smallImage2"
            value={offerData.smallImage2}
            onChange={handleOfferChange}
            style={inputStyle}
            disabled={isViewMode}
          >
            <option value="">Select Small Image 2</option>
            <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
            <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
            <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
            <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
            <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
            <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
            <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
            <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
            <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
            <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
          </select>
          {offerData.smallImage2 && (
            <div style={{ marginTop: 10 }}>
              <img
                src={offerData.smallImage2}
                alt="Small Image 2 Preview"
                style={{
                  maxWidth: '150px',
                  maxHeight: '100px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
            Small Image 3
          </label>
          <select
            name="smallImage3"
            value={offerData.smallImage3}
            onChange={handleOfferChange}
            style={inputStyle}
            disabled={isViewMode}
          >
            <option value="">Select Small Image 3</option>
            <option value="/data/Travco Site Images/Petra/petra1.JPG">Petra 1</option>
            <option value="/data/Travco Site Images/Petra/petra2.JPG">Petra 2</option>
            <option value="/data/Travco Site Images/Petra/petra3.JPG">Petra 3</option>
            <option value="/data/Travco Site Images/Petra/petra4.JPG">Petra 4</option>
            <option value="/data/Travco Site Images/Petra/petra5.JPG">Petra 5</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum1.jpg">Wadi Rum 1</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum2.JPG">Wadi Rum 2</option>
            <option value="/data/Travco Site Images/Wadi Rum/wadi_rum3.JPG">Wadi Rum 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea1.jpg">Dead Sea 1</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea2.jpg">Dead Sea 2</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea3.jpg">Dead Sea 3</option>
            <option value="/data/Travco Site Images/Dead Sea/dead_sea4.jpg">Dead Sea 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba1.jpg">Aqaba 1</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba2.jpg">Aqaba 2</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba3.jpg">Aqaba 3</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba4.jpg">Aqaba 4</option>
            <option value="/data/Travco Site Images/Aqaba/aqaba5.jpg">Aqaba 5</option>
            <option value="/data/Travco Site Images/Baptism/baptism1.jpg">Baptism 1</option>
            <option value="/data/Travco Site Images/Baptism/baptism2.JPG">Baptism 2</option>
            <option value="/data/Travco Site Images/Baptism/baptism3.JPG">Baptism 3</option>
            <option value="/data/Travco Site Images/Um Qais/um_qais1.JPG">Um Qais 1</option>
            <option value="/data/Travco Site Images/Main/main1.jpg">Main 1</option>
          </select>
          {offerData.smallImage3 && (
            <div style={{ marginTop: 10 }}>
              <img
                src={offerData.smallImage3}
                alt="Small Image 3 Preview"
                style={{
                  maxWidth: '150px',
                  maxHeight: '100px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>

        {/* Itinerary Continuation Images (Page 2, Page 3, ...) */}
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <h3 style={{ color: "#ffc107", marginTop: 0, marginBottom: 10 }}>
            Itinerary Continuation Images (Page 2+)
          </h3>
          <p style={{ color: "#aaa", marginTop: 0, marginBottom: 10, fontSize: 12 }}>
            Days per page: Page 1 shows days 1–3. Page 2 shows days 4–6, Page 3 shows days 7–9, etc.
          </p>

          {continuationImages.length === 0 ? (
            <p style={{ color: "#888" }}>No continuation pages detected from the itinerary.</p>
          ) : (
            continuationImages.map((pg, idx) => {
              const pageNo = idx + 2; // Page numbering starts at 2 for continuation pages
              return (
                <div key={idx} style={{
                  marginBottom: 15,
                  backgroundColor: "#2a2a2a",
                  padding: 15,
                  borderRadius: 8,
                  border: "1px solid #444"
                }}>
                  <h4 style={{ margin: 0, marginBottom: 10, color: "#fff" }}>
                    Page {pageNo} Images
                  </h4>

                  {/* Main */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                      Main Image (Large)
                    </label>
                    <select
                      value={pg.main || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContinuationImages(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], main: val };
                          return next;
                        });
                      }}
                      style={inputStyle}
                      disabled={isViewMode}
                    >
                      {renderImageOptions()}
                    </select>
                    {pg.main && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={pg.main}
                          alt={`Page ${pageNo} Main`}
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            borderRadius: 4,
                            border: '1px solid #444',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Small 1 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                      Small Image 1
                    </label>
                    <select
                      value={pg.small1 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContinuationImages(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], small1: val };
                          return next;
                        });
                      }}
                      style={inputStyle}
                      disabled={isViewMode}
                    >
                      {renderImageOptions()}
                    </select>
                    {pg.small1 && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={pg.small1}
                          alt={`Page ${pageNo} Small 1`}
                          style={{
                            maxWidth: '150px',
                            maxHeight: '100px',
                            borderRadius: 4,
                            border: '1px solid #444',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Small 2 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                      Small Image 2
                    </label>
                    <select
                      value={pg.small2 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContinuationImages(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], small2: val };
                          return next;
                        });
                      }}
                      style={inputStyle}
                      disabled={isViewMode}
                    >
                      {renderImageOptions()}
                    </select>
                    {pg.small2 && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={pg.small2}
                          alt={`Page ${pageNo} Small 2`}
                          style={{
                            maxWidth: '150px',
                            maxHeight: '100px',
                            borderRadius: 4,
                            border: '1px solid #444',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Small 3 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: "gray", marginBottom: 8, display: "block" }}>
                      Small Image 3
                    </label>
                    <select
                      value={pg.small3 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContinuationImages(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], small3: val };
                          return next;
                        });
                      }}
                      style={inputStyle}
                      disabled={isViewMode}
                    >
                      {renderImageOptions()}
                    </select>
                    {pg.small3 && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={pg.small3}
                          alt={`Page ${pageNo} Small 3`}
                          style={{
                            maxWidth: '150px',
                            maxHeight: '100px',
                            borderRadius: 4,
                            border: '1px solid #444',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <textarea name="inclusions" placeholder="Inclusions" rows={5}
          value={offerData.inclusions} onChange={handleOfferChange} style={textAreaStyle} readOnly={isViewMode}/>

        <textarea name="exclusions" placeholder="Exclusions" rows={5}
          value={offerData.exclusions} onChange={handleOfferChange} style={textAreaStyle} readOnly={isViewMode}/>
          
        <h3 style={{ color: "#ffc107", marginTop: 20, marginBottom: 10 }}>General Notes</h3>
        
        <textarea
          name="generalNotes"
          placeholder="General Notes"
          rows={3}
          value={offerData.generalNotes}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="cancellationFees"
          placeholder="Cancellation Fees"
          rows={3}
          value={offerData.cancellationFees}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="bookingsGuarantee"
          placeholder="Bookings Guarantee"
          rows={3}
          value={offerData.bookingsGuarantee}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        
        
        <textarea
          name="bookingProcess"
          placeholder="Booking Process"
          rows={3}
          value={offerData.bookingProcess}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="ratesAndTaxes"
          placeholder="Rates & Taxes"
          rows={3}
          value={offerData.ratesAndTaxes}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="childrenPolicy"
          placeholder="Children Policy"
          rows={2}
          value={offerData.childrenPolicy}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="checkInOutTimes"
          placeholder="Check-in/Out Timing Hotels (leave empty to use hotel locations)"
          rows={3}
          value={offerData.checkInOutTimes}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="tripleRooms"
          placeholder="Triple Rooms"
          rows={3}
          value={offerData.tripleRooms}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
        
        <textarea
          name="bankAccountDetails"
          placeholder="Bank Account Details"
          rows={6}
          value={offerData.bankAccountDetails}
          onChange={handleOfferChange}
          style={textAreaStyle}
          readOnly={isViewMode}
        />
      </div>
      
      {/* Hotel Rates Section for Special Offers */}
      {isSpecialOffer && (
        <div style={{ marginTop: 30, backgroundColor: "#1f1f1f", padding: 24, borderRadius: 12, border: "1px solid #FFD700" }}>
          <h3 style={{ color: "#FFD700", marginTop: 0, marginBottom: 20 }}>Special Offer Hotel Rates</h3>
          
          {quotationData.map((paxRange, paxIndex) => (
            <div key={paxIndex} style={{ marginBottom: 30 }}>
              <h4 style={{ borderBottom: "1px solid #444", paddingBottom: 10 }}>
                PAX Range: {paxRange.paxRange}
              </h4>
              
              {paxRange.options.map((option, optIndex) => (
                <div key={optIndex} style={{ marginBottom: 20, backgroundColor: "#2a2a2a", padding: 15, borderRadius: 8 }}>
                  <h5 style={{ color: "#FFD700", marginTop: 0 }}>Option {optIndex + 1}</h5>
                  
                  {option.accommodations.map((accom, accomIndex) => (
                    <div key={accomIndex} style={{
                      marginBottom: 15,
                      backgroundColor: "#1f1f1f",
                      padding: 15,
                      borderRadius: 6,
                      border: "1px solid #444"
                    }}>
                      <p style={{ fontWeight: "bold", margin: "0 0 10px 0" }}>
                        {accom.hotelName || 'Hotel'} ({accom.city || 'City'}, {accom.stars || 'N/A'} stars)
                      </p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
                        <div>
                          <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>DBL B/B Rate:</label>
                          <input
                            type="number"
                            value={accom.dblRate || ''}
                            onChange={(e) => updateHotelRate(paxIndex, optIndex, accomIndex, 'dblRate', e.target.value)}
                            style={{
                              padding: 8,
                              borderRadius: 4,
                              border: "1px solid #444",
                              backgroundColor: "#2a2a2a",
                              color: "#fff",
                              width: "100%"
                            }}
                            readOnly={isViewMode}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>H/B Supplement:</label>
                          <input
                            type="number"
                            value={accom.hbRate || ''}
                            onChange={(e) => updateHotelRate(paxIndex, optIndex, accomIndex, 'hbRate', e.target.value)}
                            style={{
                              padding: 8,
                              borderRadius: 4,
                              border: "1px solid #444",
                              backgroundColor: "#2a2a2a",
                              color: "#fff",
                              width: "100%"
                            }}
                            readOnly={isViewMode}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>SGL Rate:</label>
                          <input
                            type="number"
                            value={accom.sglRate || ''}
                            onChange={(e) => updateHotelRate(paxIndex, optIndex, accomIndex, 'sglRate', e.target.value)}
                            style={{
                              padding: 8,
                              borderRadius: 4,
                              border: "1px solid #444",
                              backgroundColor: "#2a2a2a",
                              color: "#fff",
                              width: "100%"
                            }}
                            readOnly={isViewMode}
                          />
                        </div>
                      </div>
                      
                      {/* Special comment if exists */}
                      {accom.specialComment && (
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: 14, display: "block", marginBottom: 5 }}>Special Comment:</label>
                          <textarea
                            value={accom.specialComment || ''}
                            onChange={(e) => updateHotelRate(paxIndex, optIndex, accomIndex, 'specialComment', e.target.value)}
                            style={{
                              padding: 8,
                              borderRadius: 4,
                              border: "1px solid #444",
                              backgroundColor: "#2a2a2a",
                              color: "#FFD700",
                              width: "100%",
                              resize: "vertical",
                              minHeight: "60px"
                            }}
                            readOnly={isViewMode}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Option total cost */}
                  <div style={{ marginTop: 10, backgroundColor: "#004D40", padding: 10, borderRadius: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold" }}>Total Cost:</span>
                      <input
                        type="number"
                        value={option.totalCost || ''}
                        onChange={(e) => {
                          const newQuotationData = [...quotationData];
                          newQuotationData[paxIndex].options[optIndex].totalCost = parseFloat(e.target.value);
                          setQuotationData(newQuotationData);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: "1px solid #006064",
                          backgroundColor: "#00796B",
                          color: "#fff",
                          width: "120px",
                          fontWeight: "bold"
                        }}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Options Visibility Checkboxes */}
      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <h3 style={{ color: "#ffc107", marginBottom: 10 }}>PDF Options Visibility</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={offerData.showOption1}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption1: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span style={{ color: "white", fontWeight: "bold" }}>
              Show Option 1
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={offerData.showOption2}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption2: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span style={{ color: "white", fontWeight: "bold" }}>
              Show Option 2
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={offerData.showOption3}
              onChange={(e) => setOfferData(prev => ({ ...prev, showOption3: e.target.checked }))}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
              disabled={isViewMode}
            />
            <span style={{ color: "white", fontWeight: "bold" }}>
              Show Option 3
            </span>
          </label>
        </div>
        <p style={{ color: "#aaa", fontSize: 12, marginTop: 5 }}>
          If unchecked, the corresponding option's accommodations and supplements will not appear in the PDF.
        </p>
      </div>

      {/* Special Offer Toggle */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isSpecialOffer}
            onChange={(e) => setIsSpecialOffer(e.target.checked)}
            style={{ marginRight: 10, transform: "scale(1.2)" }}
            disabled={isViewMode}
          />
          <span style={{ color: "#FFD700", fontWeight: "bold" }}>
            This is a Special Offer (VIP)
          </span>
        </label>
      </div>
      
      {/* Confirmed Offer Toggle */}
      {isViewMode && (
        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={async (e) => {
                try {
                  const newConfirmedStatus = e.target.checked;
                  setIsConfirmed(newConfirmedStatus);
                  
                  // Update the offer in storage
                  if (id) {
                    const offerToUpdate = await getOneFromStorage("offers", id);
                    if (offerToUpdate) {
                      console.log("Updating offer confirmed status. Current quotationId:", offerToUpdate.quotationId);
                      console.log("State quotationId:", quotationId);
                      
                      // If there's no quotationId but we have one in state, use that
                      const updatedQuotationId = offerToUpdate.quotationId || quotationId;
                      console.log("Using quotationId:", updatedQuotationId);
                      
                      // Make sure we're not overwriting other fields
                      const updatedOffer = {
                        ...offerToUpdate,
                        isConfirmed: newConfirmedStatus
                      };
                      
                      // Ensure quotationId is set
                      if (updatedQuotationId) {
                        updatedOffer.quotationId = updatedQuotationId;
                      }
                      
                      console.log("Updating offer with data:", updatedOffer);
                      const result = await updateInStorage("offers", id, updatedOffer);
                      console.log("Update result:", result);
                      
                      // Verify the update
                      const verifiedOffer = await getOneFromStorage("offers", id);
                      console.log("Verified updated offer:", verifiedOffer);
                      console.log("Verified quotationId after update:", verifiedOffer.quotationId);
                    } else {
                      console.error("Offer not found for update:", id);
                    }
                  }
                } catch (error) {
                  console.error("Error updating offer confirmed status:", error);
                  alert("An error occurred while updating the offer status. Please check the console for details.");
                }
              }}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
            />
            <span style={{ color: "#28a745", fontWeight: "bold" }}>
              This is a Confirmed Offer
            </span>
          </label>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        {isViewMode ? (
          <>
            <button onClick={() => navigate("/offers")} style={buttonStyle("#6c757d")}>
              Back to Offers
            </button>
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={toggleLanguageDropdown}
                style={buttonStyle(quotationData.length > 0 ? "#ffc107" : "#6c757d", "#000")}
                disabled={!quotationData.length}
              >
                Create Single Offer PDF
              </button>
              {showLanguageDropdown && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 10,
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 6,
                  width: 200,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ padding: 10, borderBottom: "1px solid #444", color: "white", fontWeight: "bold" }}>
                    Select Language
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("english")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "english" ? "#444" : "transparent" }}
                  >
                    English
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("arabic")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "arabic" ? "#444" : "transparent" }}
                  >
                    Arabic
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("french")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "french" ? "#444" : "transparent" }}
                  >
                    French
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("german")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "german" ? "#444" : "transparent" }}
                  >
                    German
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("spanish")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "spanish" ? "#444" : "transparent" }}
                  >
                    Spanish
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => generateSingleWord(selectedLanguage)}
              style={buttonStyle(quotationData.length > 0 ? "#17a2b8" : "#6c757d")}
              disabled={!quotationData.length}
            >
              Create Single Offer DOCX
            </button>
            <button
              onClick={handleConfirmAndDownload}
              style={{...buttonStyle("#007bff"), marginLeft: '10px'}}
            >
              Download Offer JSON & Confirm Offer
            </button>
            {isConfirmed && (
              <>
                <button
                  onClick={async () => {
                    try {
                      // Get the quotation ID from the offer
                      if (id) {
                        // First check the current state
                        console.log("Current quotationId state:", quotationId);
                        
                        // Then get the offer from storage
                        const offerData = await getOneFromStorage("offers", id);
                        console.log("Offer data from storage:", offerData);
                        
                        if (!offerData) {
                          console.error("Offer not found in storage:", id);
                          alert("Offer not found. Please try again.");
                          return;
                        }
                        
                        // Check if the quotation exists
                        if (offerData.quotationId) {
                          let quotation = await getOneFromStorage("quotations", offerData.quotationId);
                          console.log("Found quotation:", quotation);
                          
                          if (quotation) {
                            console.log("Navigating to quotation view with ID:", offerData.quotationId);
                            // Navigate to the quotation view with a parameter indicating to create a new tab
                            navigate(`/quotations/view/${offerData.quotationId}?createActualRates=true`);
                          } else {
                            console.error("Quotation not found in storage:", offerData.quotationId);
                            
                            // Try to recreate the quotation from the offer data
                            if (offerData.quotations && offerData.quotations.length > 0) {
                              console.log("Attempting to recreate quotation from offer data");
                              
                              // Create a new quotation object with a new ID if the original doesn't exist
                              const newQuotationId = Date.now(); // Always create a new ID to avoid conflicts
                              const newQuotation = {
                                id: newQuotationId,
                                group: offerData.groupName,
                                agent: offerData.agent,
                                arrivalDate: offerData.dateArr,
                                departureDate: offerData.dateDep,
                                createdBy: offerData.createdBy,
                                quotations: offerData.quotations,
                                options: offerData.options || []
                              };
                              
                              // Save the new quotation
                              console.log("Saving recreated quotation:", newQuotation);
                              const savedQuotation = await saveToStorage("quotations", newQuotation);
                              console.log("Saved quotation:", savedQuotation);
                              
                              // Update the offer with the new quotation ID
                              const updatedOffer = await updateInStorage("offers", id, {
                                ...offerData,
                                quotationId: savedQuotation.id
                              });
                              console.log("Updated offer with new quotation ID:", updatedOffer);
                              
                              // Navigate to the quotation view with the new ID
                              navigate(`/quotations/view/${savedQuotation.id}?createActualRates=true`);
                            } else {
                              alert(`Quotation with ID ${offerData.quotationId} not found and could not be recreated.`);
                            }
                          }
                        } else {
                          console.error("No quotation ID found in offer:", offerData);
                          
                          // If no quotation ID but we have quotation data, create a new quotation
                          if (offerData.quotations && offerData.quotations.length > 0) {
                            console.log("Creating new quotation from offer data");
                            
                            const newQuotationId = Date.now();
                            const newQuotation = {
                              id: newQuotationId,
                              group: offerData.groupName,
                              agent: offerData.agent,
                              arrivalDate: offerData.dateArr,
                              departureDate: offerData.dateDep,
                              createdBy: offerData.createdBy,
                              quotations: offerData.quotations,
                              options: offerData.options || []
                            };
                            
                            // Save the new quotation
                            console.log("Saving new quotation:", newQuotation);
                            const savedQuotation = await saveToStorage("quotations", newQuotation);
                            console.log("Saved quotation:", savedQuotation);
                            
                            // Update the offer with the new quotation ID
                            const updatedOffer = await updateInStorage("offers", id, {
                              ...offerData,
                              quotationId: savedQuotation.id
                            });
                            console.log("Updated offer with new quotation ID:", updatedOffer);
                            
                            // Navigate to the quotation view with the new ID
                            navigate(`/quotations/view/${savedQuotation.id}?createActualRates=true`);
                          } else {
                            alert("No quotation data found in this offer. Cannot create actual rates.");
                          }
                        }
                      } else {
                        alert("Please save the offer first.");
                      }
                    } catch (error) {
                      console.error("Error in Upload Actual Rate Quotation button click:", error);
                      alert("An error occurred. Please check the console for details.");
                    }
                  }}
                  style={{...buttonStyle("#28a745"), marginLeft: '10px'}}
                >
                  Upload Actual Rate Quotation
                </button>
                <button
                  onClick={handleGenerateReservationFile}
                  style={{...buttonStyle("#17a2b8"), marginLeft: '10px'}}
                >
                  Generate Reservation File
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => alert("Excel generation from offers is not yet implemented.")}
                    style={buttonStyle("#007bff")}>
              Create Excel Sheet
            </button>
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={toggleLanguageDropdown}
                style={buttonStyle(quotationData.length > 0 ? "#ffc107" : "#6c757d", "#000")}
                disabled={!quotationData.length}
              >
                Create Single Offer PDF
              </button>
              {showLanguageDropdown && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 10,
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 6,
                  width: 200,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ padding: 10, borderBottom: "1px solid #444", color: "white", fontWeight: "bold" }}>
                    Select Language
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("english")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "english" ? "#444" : "transparent" }}
                  >
                    English
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("arabic")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "arabic" ? "#444" : "transparent" }}
                  >
                    Arabic
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("french")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "french" ? "#444" : "transparent" }}
                  >
                    French
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("german")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "german" ? "#444" : "transparent" }}
                  >
                    German
                  </div>
                  <div
                    onClick={() => handleLanguageSelect("spanish")}
                    style={{ padding: 10, cursor: "pointer", color: "white", backgroundColor: selectedLanguage === "spanish" ? "#444" : "transparent" }}
                  >
                    Spanish
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => generateSingleWord(selectedLanguage)}
              style={buttonStyle(quotationData.length > 0 ? "#17a2b8" : "#6c757d")}
              disabled={!quotationData.length}
            >
              Create Single Offer DOCX
            </button>
            <button onClick={handleSaveOffer} style={buttonStyle("#007bff")}>
              Save Offer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Styles
const inputStyle      = { padding:10, fontSize:15, borderRadius:6, border:"1px solid #444", backgroundColor:"#2a2a2a", color:"white", marginBottom:10 };
const textAreaStyle   = { ...inputStyle, resize:"vertical", width:"100%" };
const formWrapperStyle= { display:"grid", gap:16, maxWidth:800, backgroundColor:"#1f1f1f", padding:24, borderRadius:12, border:"1px solid #333" };
const buttonStyle     = (bg,color="white") => ({ backgroundColor:bg, color, padding:"10px 20px", border:"none", borderRadius:6, fontWeight:"bold", cursor:"pointer" });

export default AddOffer;
