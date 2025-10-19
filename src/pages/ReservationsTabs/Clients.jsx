import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

function Clients({ fileNo, data }) {
  const [activeTab, setActiveTab] = useState('Rooming List');
  const [rows, setRows] = useState([
    {
      show: false,
      title: 'Mr.',
      clientName: '',
      age: 'ADL',
      room: 'SGL',
      rNo: '',
      meal: '',
      code1: '',
      code2: '',
      code3: '',
      comments: '',
      isMN: false
    }
  ]);
  
  const [manifestRows, setManifestRows] = useState([
    {
      show: false,
      clientName: '',
      passportNo: '',
      birthDate: '',
      issueDate: '',
      expiryDate: '',
      nationality: '',
      code1: '',
      code2: '',
      code3: '',
      comments: ''
    }
  ]);

  // Auto-initialize Clients rows based on Pax from General or Arr/Dep (first-load only)
  const initFromPaxRef = useRef(false);

  useEffect(() => {
    try {
      const paxRaw =
        data?.generalData?.pax ??
        data?.ArrDep?.[0]?.pax ??
        data?.ArrDep?.[1]?.pax ??
        0;
      const pax = Number(paxRaw);
      if (!Number.isFinite(pax) || pax <= 0) return;
      if (initFromPaxRef.current) return;

      // Only expand if user hasn't started filling rows
      const isDefaultRooming =
        rows.length === 1 &&
        !rows[0].clientName &&
        !rows[0].rNo &&
        !rows[0].meal &&
        !rows[0].code1 &&
        !rows[0].code2 &&
        !rows[0].code3 &&
        !rows[0].comments;

      const isDefaultManifest =
        manifestRows.length === 1 &&
        !manifestRows[0].clientName &&
        !manifestRows[0].passportNo &&
        !manifestRows[0].nationality &&
        !manifestRows[0].comments;

      if (isDefaultRooming) {
        const newRows = Array.from({ length: pax }, () => ({
          show: true,
          title: 'Mr.',
          clientName: '',
          age: 'ADL',
          room: 'SGL',
          rNo: '',
          meal: '',
          code1: '',
          code2: '',
          code3: '',
          comments: '',
          isMN: false
        }));
        setRows(newRows);
      }

      if (isDefaultManifest) {
        const nationality = data?.generalData?.nationality || '';
        const newManifest = Array.from({ length: pax }, () => ({
          show: true,
          clientName: '',
          passportNo: '',
          birthDate: '',
          issueDate: '',
          expiryDate: '',
          nationality,
          code1: '',
          code2: '',
          code3: '',
          comments: ''
        }));
        setManifestRows(newManifest);
      }

      initFromPaxRef.current = true;
    } catch {
      // ignore
    }
  }, [data?.generalData?.pax, data?.ArrDep, rows, manifestRows, data?.generalData?.nationality]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleManifestChange = (index, field, value) => {
    const updated = [...manifestRows];
    updated[index][field] = value;
    setManifestRows(updated);
  };

  const addRow = () => {
    setRows([...rows, {
      show: false,
      title: 'Mr.',
      clientName: '',
      age: 'ADL',
      room: 'SGL',
      rNo: '',
      meal: '',
      code1: '',
      code2: '',
      code3: '',
      comments: '',
      isMN: false
    }]);
  };

  const addManifestRow = () => {
    setManifestRows([...manifestRows, {
      show: false,
      clientName: '',
      passportNo: '',
      birthDate: '',
      issueDate: '',
      expiryDate: '',
      nationality: '',
      code1: '',
      code2: '',
      code3: '',
      comments: ''
    }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const removeManifestRow = (index) => {
    const updated = [...manifestRows];
    updated.splice(index, 1);
    setManifestRows(updated);
  };

  const generateManifestPDF = () => {
    try {
      // Create PDF document in portrait orientation
      const doc = new jsPDF('p', 'pt', 'a4');
        
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - 2 * margin;
      
      // Load Travco logo
      import('../../assets/logo.png').then(logoModule => {
        const logo = logoModule.default;
        
        // Add Travco logo
        doc.addImage(logo, 'PNG', margin, 30, 120, 60);
        
        // Add "Jordan" text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Jordan', margin + 60, 100);
        
        // Add company name in Arabic
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('شركة مجموعة ترافكو القابضه للسياحة والسفر / الاردن', pageWidth - margin, 120, { align: 'right' });
      
        // Add horizontal line
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.line(margin, 130, pageWidth - margin, 130);
        
        // Get data from other tabs
        const generalData = data?.generalData || {};
        const guidesData = data?.Guides || [];
        const arrDepData = data?.ArrDep || [];
        const itinerariesData = data?.Itineraries || [];
        
        // Extract arrival and departure info
        const arrivalInfo = arrDepData && arrDepData.find ? arrDepData.find(item => item && item.arr) || {} : {};
        const departureInfo = arrDepData && arrDepData.find ? arrDepData.find(item => item && item.dep) || {} : {};
        
        // Extract guide info
        const guideInfo = guidesData && guidesData.length > 0 ? guidesData[0] : {};
        
        // Client Information Box
        doc.rect(margin, 140, contentWidth, 100);
        
        // Set font for text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        // Right column of client info (in Arabic)
        doc.text(`رقم الملف : ${fileNo || '25-07-249'}`, pageWidth - margin - 10, 160, { align: 'right' });
        doc.text(`اسم المجموعة : ${generalData?.groupName || 'EN| Jordan Essentials (SIC)'}`, pageWidth - margin - 10, 180, { align: 'right' });
        doc.text(`عدد الاشخاص : ${manifestRows.length || 2}`, pageWidth - margin - 10, 200, { align: 'right' });
        
        // Left column of client info (in Arabic)
        doc.text(`رقم المكتب : 1025`, margin + 100, 160);
        doc.text(`الجنسية : ${generalData?.nationality || 'Denmark'} (${manifestRows.length || 2})`, margin + 100, 180);
        doc.text(`الدليل : ${guideInfo?.guideName || 'Fathi Sabatini'} (079792881)`, margin + 100, 200);
      
        // Arrival/Departure Information
        let yPos = 250;
        
        // Format date for display
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(/\//g, '/');
          } catch (e) {
            return dateStr;
          }
        };
        
        // Arrival info
        doc.rect(margin, yPos, contentWidth, 25);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 25, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        doc.text(`تاريخ الوصول : ${formatDate(arrivalInfo?.date) || '21/07/2025'}`, pageWidth - margin - 10, yPos + 17, { align: 'right' });
        doc.text(`${arrivalInfo?.flight || 'RJ 138'}`, pageWidth - margin - 150, yPos + 17);
        doc.text(`${arrivalInfo?.time || '21:45'}`, pageWidth - margin - 220, yPos + 17);
        doc.text(`نقطة الوصول : ${arrivalInfo?.to || 'QAIA'}`, margin + 150, yPos + 17);
        doc.text(`عدد الاشخاص : ${manifestRows.length || 2}`, margin + 10, yPos + 17);
        
        // Departure info
        yPos += 25;
        doc.rect(margin, yPos, contentWidth, 25);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 25, 'F');
        
        doc.text(`تاريخ المغادرة : ${formatDate(departureInfo?.date) || '25/07/2025'}`, pageWidth - margin - 10, yPos + 17, { align: 'right' });
        doc.text(`${departureInfo?.flight || 'RJ 117'}`, pageWidth - margin - 150, yPos + 17);
        doc.text(`${departureInfo?.time || '10:20'}`, pageWidth - margin - 220, yPos + 17);
        doc.text(`نقطة المغادرة : ${departureInfo?.from || 'QAIA'}`, margin + 150, yPos + 17);
        doc.text(`عدد الاشخاص : ${manifestRows.length || 2}`, margin + 10, yPos + 17);
      
        // Program/Itinerary Section
        yPos += 35;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`البرنامج`, pageWidth - margin, yPos, { align: 'right' });
        
        // Get itinerary data with Arabic translations
        const itineraryItems = itinerariesData.length > 0 ? itinerariesData : [
          { date: '21/07/2025', itinerary: 'الوصول الى مطار الملكة علياء والتوجه الى فندق - OLIVE HOTEL AMMAN' },
          { date: '22/07/2025', itinerary: 'مغادرة الفندق - مادبا - نيبو - المغطس - البتراء - المبيت في فندق - Silk Road Petra Hotel' },
          { date: '23/07/2025', itinerary: 'فندق - زيارة البتراء - فندق' },
          { date: '24/07/2025', itinerary: 'مغادرة الفندق - وادي رم - البحر الميت - المبيت في فندق - Dead Sea Spa Hotel' },
          { date: '25/07/2025', itinerary: 'مغادرة الفندق والتوجه الى مطار الملكة علياء للمغادرة' }
        ];
        
        // Display itinerary
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        itineraryItems.forEach(item => {
          yPos += 20;
          const dateStr = formatDate(item.date) || item.date;
          doc.text(`${dateStr} : ${item.itinerary}`, pageWidth - margin, yPos, { align: 'right' });
        });
        
        // Manifest Table
        yPos += 40;
        
        // Table headers
        const columns = ['#', 'Name', 'Nationality', 'Passport #', 'Issue Date', 'Expiry Date', 'D.O.B'];
        const colWidths = {
          '#': 30,
          'Name': 150,
          'Nationality': 80,
          'Passport #': 80,
          'Issue Date': 80,
          'Expiry Date': 80,
          'D.O.B': 80
        };
        
        // Draw table header
        let xPos = margin;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 25, 'F');
        doc.rect(margin, yPos, contentWidth, 25);
        
        // Switch to helvetica for English text in the table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        columns.forEach(col => {
          const colWidth = colWidths[col];
          doc.text(col, xPos + colWidth/2, yPos + 17, { align: 'center' });
          xPos += colWidth;
          
          // Draw vertical line
          if (col !== columns[columns.length - 1]) {
            doc.line(xPos, yPos, xPos, yPos + 25);
          }
        });
        
        // Draw table rows
        yPos += 25;
        
        // If no manifest rows, add sample data
        const rowsToDisplay = manifestRows.length > 0 ? manifestRows : [
          {
            show: true,
            clientName: 'Kicki Nikita Steffensen',
            nationality: 'Denmark',
            passportNo: '213712740',
            issueDate: '2022-04-25',
            expiryDate: '2032-04-25',
            birthDate: '1998-12-04'
          },
          {
            show: true,
            clientName: 'Mads Kobbernagel Rasmussen',
            nationality: 'Denmark',
            passportNo: '212361729',
            issueDate: '2021-06-07',
            expiryDate: '2031-06-07',
            birthDate: '1999-01-25'
          }
        ];
        
        rowsToDisplay.forEach((row, index) => {
          if (row.show) {
            // Check if we need a new page
            if (yPos > pageHeight - 50) {
              doc.addPage();
              yPos = 50;
            }
            
            // Draw row background and border
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, yPos, contentWidth, 25, 'F');
            doc.rect(margin, yPos, contentWidth, 25);
            
            // Draw row content
            xPos = margin;
            doc.setFont('helvetica', 'normal');
            
            // #
            doc.text((index + 1).toString(), xPos + colWidths['#']/2, yPos + 17, { align: 'center' });
            xPos += colWidths['#'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // Name
            doc.text(row.clientName, xPos + 5, yPos + 17);
            xPos += colWidths['Name'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // Nationality
            doc.text(row.nationality, xPos + colWidths['Nationality']/2, yPos + 17, { align: 'center' });
            xPos += colWidths['Nationality'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // Passport #
            doc.text(row.passportNo, xPos + colWidths['Passport #']/2, yPos + 17, { align: 'center' });
            xPos += colWidths['Passport #'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // Format dates for display
            const formatDate = (dateStr) => {
              if (!dateStr) return '';
              try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).replace(/\//g, '/');
              } catch (e) {
                return dateStr;
              }
            };
            
            // Issue Date
            doc.text(formatDate(row.issueDate), xPos + colWidths['Issue Date']/2, yPos + 17, { align: 'center' });
            xPos += colWidths['Issue Date'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // Expiry Date
            doc.text(formatDate(row.expiryDate), xPos + colWidths['Expiry Date']/2, yPos + 17, { align: 'center' });
            xPos += colWidths['Expiry Date'];
            doc.line(xPos, yPos, xPos, yPos + 25);
            
            // D.O.B
            doc.text(formatDate(row.birthDate), xPos + colWidths['D.O.B']/2, yPos + 17, { align: 'center' });
            
            yPos += 25;
          }
        });
        
        // Save the PDF
        doc.save(`Manifest_${fileNo || 'New'}_${Date.now()}.pdf`);
      }).catch(error => {
        console.error("Error loading logo:", error);
        alert("Error generating PDF. Please try again.");
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const tableStyle = {
    borderCollapse: 'collapse',
    color: 'white',
    minWidth: '1400px' // allows horizontal scroll
  };

  const thStyle = {
    backgroundColor: '#222',
    padding: '10px',
    border: '1px solid #444',
    fontWeight: '600',
    fontSize: '14px',
    textAlign: 'left'
  };

  const tdStyle = {
    padding: '8px',
    border: '1px solid #444',
    verticalAlign: 'middle'
  };

  const inputStyle = {
    width: '100%',
    padding: '6px',
    backgroundColor: '#1a1a1a',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '4px'
  };

  const checkboxStyle = {
    transform: 'scale(1.2)'
  };

  const tabStyle = {
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontWeight: 'normal'
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#007bff',
    fontWeight: 'bold'
  };

  const buttonStyle = {
    backgroundColor: '#0a7',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: '10px'
  };

  const downloadButtonStyle = {
    backgroundColor: '#d14',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: '30px', color: 'white' }}>
      <h2 style={{ marginBottom: '20px' }}>Clients – File: {fileNo}</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          style={activeTab === 'Rooming List' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('Rooming List')}
        >
          Rooming List
        </button>
        <button
          style={activeTab === 'Manifest' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('Manifest')}
        >
          Manifest
        </button>
      </div>

      {activeTab === 'Rooming List' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Show</th>
              <th style={thStyle}>Title</th>
              <th style={{ ...thStyle, minWidth: '200px' }}>Client Name</th>
              <th style={thStyle}>Age</th>
              <th style={thStyle}>Room</th>
              <th style={thStyle}>R No.</th>
              <th style={thStyle}>Meal</th>
              <th style={thStyle}>Code 1</th>
              <th style={thStyle}>Code 2</th>
              <th style={thStyle}>Code 3</th>
              <th style={{ ...thStyle, minWidth: '300px' }}>Comments</th>
              <th style={thStyle}>Is MN</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  <input type="checkbox" style={checkboxStyle} checked={row.show} onChange={(e) => handleChange(index, 'show', e.target.checked)} />
                </td>
                <td style={tdStyle}>
                  <select value={row.title} onChange={(e) => handleChange(index, 'title', e.target.value)} style={inputStyle}>
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                    <option>Dr.</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.clientName} onChange={(e) => handleChange(index, 'clientName', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <select value={row.age} onChange={(e) => handleChange(index, 'age', e.target.value)} style={inputStyle}>
                    <option>ADL</option>
                    <option>CHD</option>
                    <option>INF</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <select value={row.room} onChange={(e) => handleChange(index, 'room', e.target.value)} style={inputStyle}>
                    <option>SGL</option>
                    <option>DBL</option>
                    <option>TWN</option>
                    <option>TRP</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.rNo} onChange={(e) => handleChange(index, 'rNo', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.meal} onChange={(e) => handleChange(index, 'meal', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.code1} onChange={(e) => handleChange(index, 'code1', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.code2} onChange={(e) => handleChange(index, 'code2', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.code3} onChange={(e) => handleChange(index, 'code3', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={row.comments} onChange={(e) => handleChange(index, 'comments', e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="checkbox" style={checkboxStyle} checked={row.isMN} onChange={(e) => handleChange(index, 'isMN', e.target.checked)} />
                </td>
                <td style={tdStyle}>
                  <button onClick={() => removeRow(index)} style={{ background: '#c00', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          style={buttonStyle}
        >
          Add Another Client
        </button>
      </div>
      )}

      {activeTab === 'Manifest' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Show</th>
                <th style={{ ...thStyle, minWidth: '200px' }}>Client Name</th>
                <th style={thStyle}>Passport No.</th>
                <th style={thStyle}>Birth Date</th>
                <th style={thStyle}>Issue Date</th>
                <th style={thStyle}>Expiry Date</th>
                <th style={thStyle}>Nationality</th>
                <th style={thStyle}>Code 1</th>
                <th style={thStyle}>Code 2</th>
                <th style={thStyle}>Code 3</th>
                <th style={{ ...thStyle, minWidth: '300px' }}>Comments</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {manifestRows.map((row, index) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    <input type="checkbox" style={checkboxStyle} checked={row.show} onChange={(e) => handleManifestChange(index, 'show', e.target.checked)} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.clientName} onChange={(e) => handleManifestChange(index, 'clientName', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.passportNo} onChange={(e) => handleManifestChange(index, 'passportNo', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="date" value={row.birthDate} onChange={(e) => handleManifestChange(index, 'birthDate', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="date" value={row.issueDate} onChange={(e) => handleManifestChange(index, 'issueDate', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="date" value={row.expiryDate} onChange={(e) => handleManifestChange(index, 'expiryDate', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.nationality} onChange={(e) => handleManifestChange(index, 'nationality', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.code1} onChange={(e) => handleManifestChange(index, 'code1', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.code2} onChange={(e) => handleManifestChange(index, 'code2', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.code3} onChange={(e) => handleManifestChange(index, 'code3', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="text" value={row.comments} onChange={(e) => handleManifestChange(index, 'comments', e.target.value)} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => removeManifestRow(index)} style={{ background: '#c00', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', display: 'flex' }}>
            <button
              onClick={addManifestRow}
              style={buttonStyle}
            >
              Add Another Client
            </button>
            
            <button
              onClick={generateManifestPDF}
              style={downloadButtonStyle}
            >
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
