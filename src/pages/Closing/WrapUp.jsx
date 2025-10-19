import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import travcoLogo from '/travco_logo_for_pdf.png';
import { getAllFromStorage } from '../../assets/utils/storage';

const WrapUp = () => {
  const [reservationFile, setReservationFile] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [presentation1File, setPresentation1File] = useState(null);
  const [presentation2File, setPresentation2File] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservations, setReservations] = useState({});
  const [selectedReservation, setSelectedReservation] = useState('');
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const presentation1InputRef = useRef(null);
  const presentation2InputRef = useRef(null);

  // Fetch all reservations on component mount
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const storedReservations = await getAllFromStorage("reservations") || {};
        setReservations(storedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        
        // Fallback to direct localStorage
        try {
          const saved = JSON.parse(localStorage.getItem("reservations") || "{}");
          setReservations(saved);
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
          setReservations({});
        }
      }
    };
    
    fetchReservations();
  }, []);

  const handleReservationUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      setSuccess('');
      return;
    }

    setReservationFile(file);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setReservationData(data);
        setSuccess('Reservation file loaded successfully');
      } catch (err) {
        setError('Invalid JSON file');
        setReservationData(null);
        setSuccess('');
      }
    };
    reader.readAsText(file);
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setSuccess('');
      return;
    }

    setPdfFile(file);
    setError('');
    setSuccess('PDF file loaded successfully');
  };

  const handlePresentation1Upload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPresentation1File(file);
    setError('');
    setSuccess('Presentation 1 file loaded successfully');
  };

  const handlePresentation2Upload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPresentation2File(file);
    setError('');
    setSuccess('Presentation 2 file loaded successfully');
  };

  const handleReservationSelect = (e) => {
    const fileNo = e.target.value;
    setSelectedReservation(fileNo);
    
    if (fileNo && reservations[fileNo]) {
      setReservationData(reservations[fileNo]);
      setSuccess('Reservation loaded from system');
    } else {
      setReservationData(null);
    }
  };

  const saveReservationAsJson = () => {
    if (!selectedReservation || !reservations[selectedReservation]) {
      setError('Please select a reservation to save');
      setSuccess('');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const reservationToSave = reservations[selectedReservation];
      
      // Create a JSON blob
      const jsonBlob = new Blob(
        [JSON.stringify(reservationToSave, null, 2)], 
        { type: 'application/json' }
      );
      
      // Create a download link
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReservation}_full.json`;
      a.click();
      
      setSuccess('Reservation saved as JSON file');
      setIsSaving(false);
    } catch (err) {
      console.error('Error saving reservation as JSON:', err);
      setError('Error saving reservation: ' + err.message);
      setIsSaving(false);
    }
  };

  const generateCoverPage = async () => {
    if (!reservationData) {
      setError('Please upload a valid reservation file first or select a reservation from the system');
      setSuccess('');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let yPosition = 150;

      // Add Travco logo at the top left
      doc.addImage(travcoLogo, 'PNG', margin, 30, 150, 75);

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RESERVATION COVER PAGE', pageWidth / 2, 60, { align: 'center' });

      // Extract data from the reservation
      const generalData = reservationData.generalData || {};
      const fileNo = reservationData.id || generalData.fileNo || reservationData.fileNo || '';
      const groupName = generalData.groupName || reservationData.groupName || reservationData.group || '';
      const agentName = generalData.agent || reservationData.agent || '';
      const nationality = generalData.nationality || reservationData.nationality || '';
      const clientName = generalData.clientName || reservationData.clientName || '';

      // Add header box with general information
      doc.setDrawColor(100, 100, 100);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, 120, pageWidth - (margin * 2), 120, 5, 5, 'FD');
      
      // Add general information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      
      // Left column
      doc.text('File No.:', margin + 15, yPosition);
      doc.text('Group Name:', margin + 15, yPosition + 25);
      doc.text('Agent Name:', margin + 15, yPosition + 50);
      
      // Right column
      doc.text('Nationality:', pageWidth / 2 + 15, yPosition);
      doc.text('Client Name:', pageWidth / 2 + 15, yPosition + 25);
      
      // Values
      doc.setFont('helvetica', 'normal');
      doc.text(fileNo, margin + 100, yPosition);
      doc.text(groupName, margin + 100, yPosition + 25);
      doc.text(agentName, margin + 100, yPosition + 50);
      
      doc.text(nationality, pageWidth / 2 + 100, yPosition);
      doc.text(clientName, pageWidth / 2 + 100, yPosition + 25);
      
      yPosition = 260;
      
      // Add Arrival/Departure information
      const arrDepData = reservationData.ArrDep || [];
      if (arrDepData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('ARRIVAL & DEPARTURE', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        arrDepData.forEach((item, index) => {
          const type = item.arr ? 'Arrival' : item.dep ? 'Departure' : 'Transfer';
          doc.setFont('helvetica', 'bold');
          doc.text(`${type}:`, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          
          const date = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
          const from = item.from || 'N/A';
          const to = item.to || 'N/A';
          const flight = item.flight || 'N/A';
          const time = item.time || 'N/A';
          
          doc.text(`Date: ${date}`, margin + 80, yPosition);
          doc.text(`From: ${from}`, margin + 220, yPosition);
          doc.text(`To: ${to}`, margin + 350, yPosition);
          doc.text(`Flight: ${flight}`, margin + 80, yPosition + 20);
          doc.text(`Time: ${time}`, margin + 220, yPosition + 20);
          
          yPosition += 50;
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Hotels information
      const hotelsData = reservationData.Hotels || [];
      if (hotelsData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('HOTELS', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        hotelsData.forEach((hotel, index) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`Hotel ${index + 1}:`, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          
          const hotelName = hotel.hotelName || 'N/A';
          const checkIn = hotel.checkIn ? new Date(hotel.checkIn).toLocaleDateString() : 'N/A';
          const checkOut = hotel.checkOut ? new Date(hotel.checkOut).toLocaleDateString() : 'N/A';
          const roomType = hotel.roomType || 'N/A';
          const meal = hotel.meal || 'N/A';
          
          doc.text(`Name: ${hotelName}`, margin + 80, yPosition);
          doc.text(`Check-in: ${checkIn}`, margin + 80, yPosition + 20);
          doc.text(`Check-out: ${checkOut}`, margin + 250, yPosition + 20);
          doc.text(`Room Type: ${roomType}`, margin + 80, yPosition + 40);
          doc.text(`Meal Plan: ${meal}`, margin + 250, yPosition + 40);
          
          yPosition += 70;
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Transportation information
      const transportationData = reservationData.Transportation || [];
      if (transportationData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('TRANSPORTATION', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        transportationData.forEach((transport, index) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`Transport ${index + 1}:`, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          
          const company = transport.transCo || 'N/A';
          const vehicleType = transport.vehicleType || 'N/A';
          const fromDate = transport.fromDate ? new Date(transport.fromDate).toLocaleDateString() : 'N/A';
          const toDate = transport.toDate ? new Date(transport.toDate).toLocaleDateString() : 'N/A';
          
          doc.text(`Company: ${company}`, margin + 100, yPosition);
          doc.text(`Vehicle: ${vehicleType}`, margin + 300, yPosition);
          doc.text(`From: ${fromDate}`, margin + 100, yPosition + 20);
          doc.text(`To: ${toDate}`, margin + 300, yPosition + 20);
          
          yPosition += 50;
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Guides information
      const guidesData = reservationData.Guides || [];
      if (guidesData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('GUIDES', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        guidesData.forEach((guide, index) => {
          const guideName = guide.guideName || 'N/A';
          const language = guide.language || 'N/A';
          const fromDate = guide.fromDate ? new Date(guide.fromDate).toLocaleDateString() : 'N/A';
          const toDate = guide.toDate ? new Date(guide.toDate).toLocaleDateString() : 'N/A';
          
          doc.text(`Guide ${index + 1}: ${guideName}`, margin, yPosition);
          doc.text(`Language: ${language}`, margin + 250, yPosition);
          doc.text(`From: ${fromDate}`, margin, yPosition + 20);
          doc.text(`To: ${toDate}`, margin + 250, yPosition + 20);
          
          yPosition += 50;
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Entrance information
      const entranceData = reservationData.Entrance || [];
      if (entranceData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('ENTRANCE TICKETS', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        entranceData.forEach((entrance, index) => {
          const entranceName = entrance.entrance || 'N/A';
          const date = entrance.date ? new Date(entrance.date).toLocaleDateString() : 'N/A';
          const pax = entrance.pax || 'N/A';
          
          doc.text(`Entrance ${index + 1}: ${entranceName}`, margin, yPosition);
          doc.text(`Date: ${date}`, margin + 250, yPosition);
          doc.text(`Pax: ${pax}`, margin + 400, yPosition);
          
          yPosition += 25;
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Itineraries information
      const itinerariesData = reservationData.Itineraries || [];
      if (itinerariesData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('ITINERARY', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        itinerariesData.forEach((item, index) => {
          const date = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
          const day = item.day || '';
          const itinerary = item.itinerary || 'N/A';
          
          doc.text(`Day ${index + 1}: ${date} (${day})`, margin, yPosition);
          
          // Handle long itinerary text with wrapping
          const maxWidth = pageWidth - (margin * 2) - 20;
          const lines = doc.splitTextToSize(itinerary, maxWidth);
          doc.text(lines, margin + 20, yPosition + 20);
          
          yPosition += 30 + (lines.length * 12);
          
          // Add a page break if we're near the bottom
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }
      
      // Add Inclusions information
      const inclusionsData = reservationData.Inclusions || [];
      if (inclusionsData.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 15, pageWidth - (margin * 2), 20, 'F');
        doc.text('INCLUSIONS', pageWidth / 2, yPosition, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        yPosition += 30;
        
        inclusionsData.forEach((item, index) => {
          if (item.yes) {
            const inclusion = item.inclusion || '';
            doc.text(`• ${inclusion}`, margin + 20, yPosition);
            yPosition += 20;
            
            // Add a page break if we're near the bottom
            if (yPosition > pageHeight - 100) {
              doc.addPage();
              yPosition = 50;
            }
          }
        });
      }
      
      // Add footer with page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 20);
      }
      
      // Create a blob from the PDF
      const pdfBlob = doc.output('blob');
      
      // Create a ZIP file containing the PDF
      const zip = new JSZip();
      zip.file(`${reservationData.groupName || reservationData.group || 'reservation'}_cover.pdf`, pdfBlob);
      
      // If we have a full reservation JSON, add it to the ZIP
      if (selectedReservation && reservations[selectedReservation]) {
        const jsonBlob = new Blob(
          [JSON.stringify(reservations[selectedReservation], null, 2)],
          { type: 'application/json' }
        );
        zip.file(`${selectedReservation}_full.json`, jsonBlob);
      }
      
      // Add presentation files to the ZIP if they exist
      if (presentation1File) {
        zip.file(`presentation1_${presentation1File.name}`, presentation1File);
      }
      
      if (presentation2File) {
        zip.file(`presentation2_${presentation2File.name}`, presentation2File);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link for the ZIP file
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${reservationData.groupName || reservationData.group || 'reservation'}_package.zip`;
      a.click();
      
      setIsGenerating(false);
      setSuccess('Cover page and ZIP package generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error generating PDF: ' + err.message);
      setIsGenerating(false);
      setSuccess('');
    }
  };

  const analyzeReservation = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first');
      setSuccess('');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuccess('');

    try {
      // In a real implementation, this would call an AI service to analyze the PDF
      // For now, we'll simulate the AI response based on the file name
      
      setTimeout(() => {
        const fileName = pdfFile.name;
        let destination = 'Jordan';
        
        if (fileName.toLowerCase().includes('petra')) {
          destination = 'Petra, Jordan';
        } else if (fileName.toLowerCase().includes('dead')) {
          destination = 'Dead Sea, Jordan';
        } else if (fileName.toLowerCase().includes('wadi')) {
          destination = 'Wadi Rum, Jordan';
        }
        
        const emailTemplate = `
Subject: Your Upcoming Trip to ${destination}

Dear Valued Client,

Thank you for choosing Travco Jordan for your upcoming trip to ${destination}. We are pleased to confirm your reservation and have attached all the necessary documents for your journey.

Your trip details:
- Arrival: [Arrival Date from PDF]
- Departure: [Departure Date from PDF]
- Number of Travelers: [Pax Count from PDF]

Please find attached your complete travel package, which includes your itinerary, vouchers, and other important information.

If you have any questions or need any assistance before or during your trip, please don't hesitate to contact us.

We look forward to welcoming you to Jordan and providing you with an unforgettable experience.

Best regards,
Travco Jordan Team
`;
        
        setEmailContent(emailTemplate);
        setIsAnalyzing(false);
        setSuccess('Email generated successfully');
      }, 2000);
    } catch (err) {
      console.error('Error analyzing PDF:', err);
      setError('Error analyzing PDF: ' + err.message);
      setIsAnalyzing(false);
      setSuccess('');
    }
  };

  // Styles
  const containerStyle = {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    color: 'white',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const headerStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    textAlign: 'center',
    color: 'white',
    borderBottom: '2px solid #333',
    paddingBottom: '15px'
  };

  const alertStyle = {
    padding: '12px 16px',
    marginBottom: '20px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const errorAlertStyle = {
    ...alertStyle,
    backgroundColor: '#2c0b0e',
    borderLeft: '4px solid #dc3545',
    color: '#f8d7da'
  };

  const successAlertStyle = {
    ...alertStyle,
    backgroundColor: '#0a2b0a',
    borderLeft: '4px solid #28a745',
    color: '#d4edda'
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '30px'
  };

  const cardStyle = {
    backgroundColor: '#1f1f1f',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #333'
  };

  const cardHeaderStyle = {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#aaa'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '14px',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px top 50%',
    backgroundSize: '12px auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '12px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white'
  };

  const infoButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6f42c1',
    color: 'white'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#343a40',
    color: '#6c757d',
    cursor: 'not-allowed'
  };

  const detailsBoxStyle = {
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '20px'
  };

  const detailsHeaderStyle = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: 'white'
  };

  const detailsRowStyle = {
    display: 'flex',
    marginBottom: '8px'
  };

  const detailsLabelStyle = {
    fontWeight: '600',
    width: '100px',
    color: '#aaa'
  };

  const detailsValueStyle = {
    flex: '1',
    color: 'white'
  };

  const emailContentStyle = {
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '20px',
    whiteSpace: 'pre-line',
    color: '#ddd',
    fontFamily: 'monospace',
    fontSize: '14px',
    maxHeight: '300px',
    overflowY: 'auto'
  };

  const copyButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#343a40',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Reservation Wrap Up</h1>
      
      {error && (
        <div style={errorAlertStyle}>
          <div style={{ marginRight: '10px' }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div style={successAlertStyle}>
          <div style={{ marginRight: '10px' }}>✅</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Success</div>
            <div>{success}</div>
          </div>
        </div>
      )}
      
      <div style={gridContainerStyle}>
        {/* Left Column - Reservation Management */}
        <div style={cardStyle}>
          <h2 style={cardHeaderStyle}>
            <span style={{ color: '#007bff', marginRight: '8px' }}>📋</span>
            Reservation Management
          </h2>
          
          {/* Select Existing Reservation */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Existing Reservation</label>
            <select 
              value={selectedReservation} 
              onChange={handleReservationSelect}
              style={selectStyle}
            >
              <option value="">-- Select a Reservation --</option>
              {Object.keys(reservations).map(fileNo => (
                <option key={fileNo} value={fileNo}>
                  {fileNo} - {reservations[fileNo]?.generalData?.groupName || 'Unnamed'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Upload Reservation File */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Upload Reservation File (JSON)</label>
            <input
              type="file"
              accept=".json"
              onChange={handleReservationUpload}
              ref={fileInputRef}
              style={inputStyle}
            />
          </div>
          
          {/* Save as JSON Button */}
          <button
            onClick={saveReservationAsJson}
            disabled={!selectedReservation || isSaving}
            style={!selectedReservation || isSaving ? disabledButtonStyle : infoButtonStyle}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Reservation as JSON'}
          </button>
          
          {/* Generate Cover Page Button */}
          <button
            onClick={generateCoverPage}
            disabled={!reservationData || isGenerating}
            style={!reservationData || isGenerating ? disabledButtonStyle : primaryButtonStyle}
          >
            {isGenerating ? '🔄 Generating...' : '📄 Generate Cover Page & ZIP'}
          </button>
          
          {/* Reservation Details */}
          {reservationData && (
            <div style={detailsBoxStyle}>
              <h3 style={detailsHeaderStyle}>Reservation Details:</h3>
              
              <div style={detailsRowStyle}>
                <div style={detailsLabelStyle}>Group:</div>
                <div style={detailsValueStyle}>
                  {reservationData.groupName || reservationData.group || 
                   (reservationData.generalData ? reservationData.generalData.groupName : '-')}
                </div>
              </div>
              
              <div style={detailsRowStyle}>
                <div style={detailsLabelStyle}>Agent:</div>
                <div style={detailsValueStyle}>
                  {reservationData.agent || 
                   (reservationData.generalData ? reservationData.generalData.agent : '-')}
                </div>
              </div>
              
              <div style={detailsRowStyle}>
                <div style={detailsLabelStyle}>Nationality:</div>
                <div style={detailsValueStyle}>
                  {reservationData.nationality || 
                   (reservationData.generalData ? reservationData.generalData.nationality : '-')}
                </div>
              </div>
              
              <div style={detailsRowStyle}>
                <div style={detailsLabelStyle}>Pax:</div>
                <div style={detailsValueStyle}>{reservationData.pax || '-'}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - AI Email Generator */}
        <div style={cardStyle}>
          <h2 style={cardHeaderStyle}>
            <span style={{ color: '#28a745', marginRight: '8px' }}>✉️</span>
            AI Email Generator
          </h2>
          
          {/* Upload PDF */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Upload Cover Page (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              ref={pdfInputRef}
              style={inputStyle}
            />
          </div>
          
          {/* Upload Presentation 1 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Upload Presentation 1</label>
            <input
              type="file"
              onChange={handlePresentation1Upload}
              ref={presentation1InputRef}
              style={inputStyle}
            />
          </div>
          
          {/* Upload Presentation 2 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Upload Presentation 2</label>
            <input
              type="file"
              onChange={handlePresentation2Upload}
              ref={presentation2InputRef}
              style={inputStyle}
            />
          </div>
          
          {/* Generate Email Button */}
          <button
            onClick={analyzeReservation}
            disabled={!pdfFile || isAnalyzing}
            style={!pdfFile || isAnalyzing ? disabledButtonStyle : successButtonStyle}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🤖 Generate Email'}
          </button>
          
          {/* Email Content */}
          {emailContent && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={detailsHeaderStyle}>Generated Email:</h3>
              <div style={emailContentStyle}>
                {emailContent}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(emailContent);
                  alert('Email content copied to clipboard!');
                }}
                style={copyButtonStyle}
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrapUp;