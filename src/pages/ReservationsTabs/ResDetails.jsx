import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOneFromStorage, getAllFromStorage } from '../../assets/utils/storage';

function ResDetails({ fileNo, data, onSave, onDataChange }) {
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [derivedOfferId, setDerivedOfferId] = useState(null);
  const [derivedQuotationId, setDerivedQuotationId] = useState(null);

  // Email History state
  const [emails, setEmails] = useState(Array.isArray(data?.EmailHistory) ? data.EmailHistory : []);
  useEffect(() => {
    if (Array.isArray(data?.EmailHistory)) setEmails(data.EmailHistory);
  }, [data?.EmailHistory]);

  // Cover Page / Confirmation Letter state
  const [coverPage, setCoverPage] = useState(
    data?.CoverPage && typeof data.CoverPage === "object" ? data.CoverPage : null
  );
  const [confirmationLetter, setConfirmationLetter] = useState(
    data?.ConfirmationLetter && typeof data.ConfirmationLetter === "object" ? data.ConfirmationLetter : null
  );
  useEffect(() => {
    if (data?.CoverPage && typeof data.CoverPage === "object") setCoverPage(data.CoverPage);
  }, [data?.CoverPage]);
  useEffect(() => {
    if (data?.ConfirmationLetter && typeof data.ConfirmationLetter === "object") setConfirmationLetter(data.ConfirmationLetter);
  }, [data?.ConfirmationLetter]);

  // Updated/Attached Offers state (drag & drop JSON offers that should not replace the original)
  const [attachedOffers, setAttachedOffers] = useState(Array.isArray(data?.AttachedOffers) ? data.AttachedOffers : []);
  useEffect(() => {
    if (Array.isArray(data?.AttachedOffers)) setAttachedOffers(data.AttachedOffers);
  }, [data?.AttachedOffers]);

  // Feature flag to hide manual PDF uploads/drag-drop when generation-only is desired
  const SHOW_MANUAL_UPLOADS = false;

  // Generation progress states
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isGeneratingConfirmation, setIsGeneratingConfirmation] = useState(false);

  const offerId =
    data?.relatedOfferId ||
    data?.generalData?.offerId ||
    data?.offerId ||
    null;

  const quotationId =
    data?.relatedQuotationId ||
    data?.generalData?.quotationId ||
    data?.quotationId ||
    null;

  const offerSnapshot =
    data?.relatedOfferSnapshot ||
    data?.generalData?.offerSnapshot ||
    null;

  const quotationSnapshot =
    data?.relatedQuotationSnapshot ||
    data?.generalData?.quotationSnapshot ||
    null;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const groupName =
          data?.generalData?.groupName || data?.groupName || data?.group || '';
        const arrDate =
          data?.ArrDep?.[0]?.date || data?.arrivalDate || data?.dateArr || '';
        const depDate =
          data?.ArrDep?.[1]?.date || data?.departureDate || data?.dateDep || '';

        // Load Offer by ID/snapshot
        let loadedOffer = null;
        if (offerId) {
          try {
            loadedOffer = await getOneFromStorage('offers', offerId);
          } catch (e) {
            console.warn('Failed to load offer by id, will fallback to snapshot:', e);
          }
        }
        if (!loadedOffer && offerSnapshot) {
          loadedOffer = offerSnapshot;
        }

        // Fallback: derive Offer by group/dates if still not loaded
        if (!loadedOffer && groupName) {
          try {
            let allOffers = await getAllFromStorage('offers');
            if (!Array.isArray(allOffers) && allOffers && typeof allOffers === 'object') {
              allOffers = Object.values(allOffers);
            }
            const matches = (allOffers || []).filter((o) =>
              (String(o.groupName || '').trim().toLowerCase() === String(groupName || '').trim().toLowerCase() || String(o.group || '').trim().toLowerCase() === String(groupName || '').trim().toLowerCase())
            );
            const dateMatches = matches.filter((o) =>
              (!arrDate || o.dateArr === arrDate || o.arrivalDate === arrDate) &&
              (!depDate || o.dateDep === depDate || o.departureDate === depDate)
            );
            const candidates = dateMatches.length ? dateMatches : matches;
            if (candidates.length) {
              candidates.sort((a, b) => Number(b.id) - Number(a.id));
              const best = candidates[0];
              loadedOffer = best;
              if (mounted) setDerivedOfferId(best.id);
            }
          } catch (e) {
            console.warn('Failed to derive offer by group/date:', e);
          }
        }
        if (mounted) setOffer(loadedOffer);

        // Load Quotation by ID/snapshot
        let loadedQuotation = null;
        if (quotationId) {
          try {
            loadedQuotation = await getOneFromStorage('quotations', quotationId);
          } catch (e) {
            console.warn('Failed to load quotation by id, will fallback to snapshot:', e);
          }
        }
        if (!loadedQuotation && quotationSnapshot) {
          loadedQuotation = quotationSnapshot;
        }

        // If still not found, try loading quotation directly from the loaded offer's quotationId or build snapshot
        if (!loadedQuotation && loadedOffer && (loadedOffer.quotationId || (loadedOffer.quotations && loadedOffer.quotations.length))) {
          try {
            if (loadedOffer.quotationId) {
              const qById = await getOneFromStorage('quotations', loadedOffer.quotationId);
              if (qById) {
                loadedQuotation = qById;
                if (mounted) setDerivedQuotationId(qById.id);
              }
            }
            if (!loadedQuotation && loadedOffer.quotations && loadedOffer.quotations.length) {
              loadedQuotation = {
                id: null,
                group: loadedOffer.groupName || loadedOffer.group || '',
                agent: loadedOffer.agent || '',
                arrivalDate: loadedOffer.dateArr || loadedOffer.arrivalDate || '',
                departureDate: loadedOffer.dateDep || loadedOffer.departureDate || '',
                quotations: loadedOffer.quotations || [],
                options: loadedOffer.options || []
              };
            }
          } catch (e) {
            console.warn('Failed to load quotation using offer.quotationId:', e);
          }
        }

        // Fallback: derive Quotation by group/dates if still not loaded
        if (!loadedQuotation && groupName) {
          try {
            let allQuots = await getAllFromStorage('quotations');
            if (!Array.isArray(allQuots) && allQuots && typeof allQuots === 'object') {
              allQuots = Object.values(allQuots);
            }
            const matchesQ = (allQuots || []).filter((q) =>
              (String(q.group || '').trim().toLowerCase() === String(groupName || '').trim().toLowerCase() ||
               String(q.groupName || '').trim().toLowerCase() === String(groupName || '').trim().toLowerCase())
            );
            const dateMatchesQ = matchesQ.filter((q) =>
              (!arrDate || q.arrivalDate === arrDate) &&
              (!depDate || q.departureDate === depDate)
            );
            const candidatesQ = dateMatchesQ.length ? dateMatchesQ : matchesQ;
            if (candidatesQ.length) {
              candidatesQ.sort((a, b) => Number(b.id) - Number(a.id));
              const bestQ = candidatesQ[0];
              loadedQuotation = bestQ;
              if (mounted) setDerivedQuotationId(bestQ.id);
            }
          } catch (e) {
            console.warn('Failed to derive quotation by group/date:', e);
          }
        }
        if (mounted) setQuotation(loadedQuotation);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [offerId, quotationId, data]);

  const summaryBoxStyle = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '10px',
    padding: '18px',
    marginBottom: '20px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  };

  const cardStyle = {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '10px',
    padding: '16px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const buttonStyle = (bg = '#007bff') => ({
    backgroundColor: bg,
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  });

  const metaItem = (label, value) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ width: 140, color: '#ccc' }}>{label}</div>
      <div style={{ color: 'white' }}>{value || '-'}</div>
    </div>
  );

  const downloadJSON = (obj, filename) => {
    try {
      const json = JSON.stringify(obj, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download JSON:', e);
      alert('Failed to download JSON');
    }
  };

  const openOfferPage = () => {
    const idToOpen = offerId || derivedOfferId;
    if (!idToOpen) return;
    navigate(`/offers/${idToOpen}`);
  };

  const openQuotationPage = () => {
    const idToOpen = quotationId || derivedQuotationId;
    if (!idToOpen) return;
    navigate(`/quotations/view/${idToOpen}`);
  };

  const prettyJSON = (obj) => JSON.stringify(obj, null, 2);

  // Shared helpers
  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // --- Email History helpers ---
  const parseEmlHeaders = (raw = "") => {
    // Very lightweight parser for common headers
    const lines = String(raw).split(/\r?\n/);
    const headers = {};
    for (const line of lines) {
      if (/^subject:/i.test(line)) headers.subject = line.replace(/^subject:\s*/i, "").trim();
      else if (/^from:/i.test(line)) headers.from = line.replace(/^from:\s*/i, "").trim();
      else if (/^to:/i.test(line)) headers.to = line.replace(/^to:\s*/i, "").trim();
      else if (/^date:/i.test(line)) headers.date = line.replace(/^date:\s*/i, "").trim();
      // Stop parsing headers on first empty line
      if (line.trim() === "") break;
    }
    return headers;
  };

  // --- Attached Offer helpers (drag & drop JSON that should not replace original offer) ---
  const addAttachedOffersFromFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const additions = [];
    for (const file of files) {
      const name = file?.name || "";
      const isJSON =
        name.toLowerCase().endsWith(".json") ||
        (file.type && /json/i.test(file.type));

      if (!isJSON) continue;

      try {
        const text = await readFileAsText(file);
        const parsed = JSON.parse(text);
        additions.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          fileName: name,
          size: file.size || text.length,
          uploadedAt: new Date().toISOString(),
          relatedOfferId: parsed?.id || parsed?.offerId || null,
          offer: parsed
        });
      } catch (e) {
        console.warn("Failed reading attached offer JSON:", name, e);
        alert(`Failed to read ${name}. Please ensure it's a valid offer JSON.`);
      }
    }

    if (additions.length) {
      const updated = [...attachedOffers, ...additions];
      setAttachedOffers(updated);
      if (typeof onDataChange === "function") onDataChange({ AttachedOffers: updated });
    }
  };

  const handleAttachOfferDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      await addAttachedOffersFromFiles(dt.files);
    }
  };

  const handleAttachOfferInput = async (e) => {
    await addAttachedOffersFromFiles(e.target.files);
    e.target.value = "";
  };

  const removeAttachedOffer = (id) => {
    const updated = (attachedOffers || []).filter(o => o.id !== id);
    setAttachedOffers(updated);
    if (typeof onDataChange === "function") onDataChange({ AttachedOffers: updated });
  };

  const downloadAttachedOffer = (item) => {
    try {
      const blob = new Blob([JSON.stringify(item?.offer || {}, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item?.fileName || `attached-offer-${item?.relatedOfferId || item?.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download attached offer:", e);
      alert("Failed to download attached offer JSON");
    }
  };

  const saveAttachedOffers = () => {
    if (typeof onSave === "function") onSave({ AttachedOffers: attachedOffers });
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const readAsText = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsText(file);
      });

    const additions = [];
    for (const file of files) {
      const name = file.name || "";
      const isEML =
        name.toLowerCase().endsWith(".eml") ||
        (file.type && file.type.toLowerCase() === "message/rfc822") ||
        file.type === "";

      if (!isEML) continue;

      try {
        const raw = await readAsText(file);
        const headers = parseEmlHeaders(raw);
        additions.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          fileName: name,
          size: file.size || raw.length,
          uploadedAt: new Date().toISOString(),
          subject: headers.subject || "",
          from: headers.from || "",
          to: headers.to || "",
          mailDate: headers.date || "",
          raw // store raw text to preserve content
        });
      } catch (e) {
        console.warn("Failed to read EML file:", name, e);
      }
    }

    if (additions.length) {
      const updated = [...emails, ...additions];
      setEmails(updated);
      if (typeof onDataChange === "function") onDataChange({ EmailHistory: updated });
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      await handleFiles(dt.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInput = async (e) => {
    await handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeEmail = (id) => {
    const updated = emails.filter((m) => m.id !== id);
    setEmails(updated);
    if (typeof onDataChange === "function") onDataChange({ EmailHistory: updated });
  };

  const downloadEmail = (item) => {
    try {
      const blob = new Blob([item.raw || ""], { type: "message/rfc822" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName || `email-${item.id}.eml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download EML:", e);
      alert("Failed to download EML");
    }
  };

  const persistEmails = () => {
    if (typeof onSave === "function") onSave({ EmailHistory: emails });
  };

  // --- Cover Page helpers (PDF) ---
  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/pdf$/i.test(file.name) && file.type !== "application/pdf") {
      alert("Please choose a PDF for Cover Page.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      const obj = {
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };
      setCoverPage(obj);
      if (typeof onDataChange === "function") onDataChange({ CoverPage: obj });
    } finally {
      e.target.value = "";
    }
  };

  const handleCoverDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!/pdf$/i.test(file.name) && file.type !== "application/pdf") {
      alert("Please drop a PDF for Cover Page.");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const obj = {
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      dataUrl
    };
    setCoverPage(obj);
    if (typeof onDataChange === "function") onDataChange({ CoverPage: obj });
  };

  const removeCover = () => {
    setCoverPage(null);
    if (typeof onDataChange === "function") onDataChange({ CoverPage: null });
  };

  const downloadCover = () => {
    if (!coverPage?.dataUrl) return;
    const a = document.createElement("a");
    a.href = coverPage.dataUrl;
    a.download = coverPage.fileName || "cover_page.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveCover = () => {
    if (typeof onSave === "function") onSave({ CoverPage: coverPage });
  };

  // Generate Cover Page PDF from reservation data (summary tables)
  const generateCoverFromReservation = async () => {
    setIsGeneratingCover(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 36;
      let y = margin + 20;

      const res = data || {};
      const gd = res.generalData || {};
      const arrDep = Array.isArray(res.ArrDep) ? res.ArrDep : [];
      const hotels = Array.isArray(res.Hotels) ? res.Hotels : [];
      const itins = Array.isArray(res.Itineraries) ? res.Itineraries : [];
      const incs = Array.isArray(res.Inclusions) ? res.Inclusions : [];

      // Header box
      doc.setDrawColor(120);
      doc.setFillColor(240);
      doc.roundedRect(margin, margin, pageWidth - margin * 2, 95, 6, 6, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("RESERVATION COVER PAGE", pageWidth / 2, margin + 22, { align: "center" });

      doc.setFontSize(11);

      // Left column
      const Lx = margin + 12;
      const Rx = pageWidth / 2 + 12;
      const line = 18;

      const safe = (v) => (v === undefined || v === null ? "" : String(v));

      doc.text("File No :", Lx, margin + 44);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.fileNo || res.id || fileNo || ""), Lx + 70, margin + 44);

      doc.setFont("helvetica", "bold");
      doc.text("Group Name :", Lx, margin + 44 + line);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.groupName || res.groupName || res.group || ""), Lx + 96, margin + 44 + line);

      doc.setFont("helvetica", "bold");
      doc.text("Agent Name :", Lx, margin + 44 + line * 2);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.agent || res.agent || ""), Lx + 90, margin + 44 + line * 2);

      doc.setFont("helvetica", "bold");
      doc.text("Nationality :", Lx, margin + 44 + line * 3);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.nationality || res.nationality || ""), Lx + 86, margin + 44 + line * 3);

      // Right column
      doc.setFont("helvetica", "bold");
      doc.text("Total Pax :", Rx, margin + 44);
      doc.setFont("helvetica", "normal");
      // Prefer General pax, then Arr/Dep
      doc.text(safe(gd?.pax || arrDep?.[0]?.pax || arrDep?.[1]?.pax || res.pax || ""), Rx + 74, margin + 44);

      doc.setFont("helvetica", "bold");
      doc.text("Arrival Date :", Rx, margin + 44 + line);
      doc.setFont("helvetica", "normal");
      doc.text(safe(arrDep?.[0]?.date || gd.arrivalDate || ""), Rx + 94, margin + 44 + line);

      doc.setFont("helvetica", "bold");
      doc.text("Departure Date :", Rx, margin + 44 + line * 2);
      doc.setFont("helvetica", "normal");
      doc.text(safe(arrDep?.[1]?.date || gd.departureDate || ""), Rx + 114, margin + 44 + line * 2);

      y = margin + 120;

      const drawSectionHeader = (title) => {
        doc.setFont("helvetica", "bold");
        doc.setFillColor(220);
        doc.rect(margin, y - 16, pageWidth - margin * 2, 20, "F");
        doc.text(title, pageWidth / 2, y - 2, { align: "center" });
        doc.setFont("helvetica", "normal");
        y += 16;
      };

      // Arr/Dep table
      if (arrDep.length) {
        drawSectionHeader("ARRIVAL & DEPARTURE");
        const colX = [margin, margin + 65, margin + 140, margin + 220, margin + 300, margin + 380, margin + 460, margin + 520];
        const headers = ["Arr/Dep", "Date", "From", "To", "Border", "Flight", "Time", "Pax"];
        doc.setFont("helvetica", "bold");
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        y += 14;
        doc.setFont("helvetica", "normal");
        arrDep.slice(0, 6).forEach((r) => {
          const typ = r.arr ? "Arrival" : r.dep ? "Departure" : "";
          const vals = [typ, r.date || "", r.from || "", r.to || "", r.border || "", r.flight || "", r.time || "", String(r.pax || "")];
          vals.forEach((v, i) => doc.text(safe(v), colX[i], y));
          y += 14;
          if (y > pageHeight - 80) { doc.addPage(); y = margin + 20; }
        });
      }

      // Hotels table
      if (hotels.length) {
        y += 10;
        drawSectionHeader("HOTELS");
        const colX = [margin, margin + 90, margin + 200, margin + 330, margin + 380, margin + 440, margin + 510];
        const headers = ["Check In", "Check Out", "Hotel Name", "Meal", "Room", "SGL", "DBL"];
        doc.setFont("helvetica", "bold");
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        y += 14;
        doc.setFont("helvetica", "normal");
        hotels.slice(0, 12).forEach((h) => {
          const vals = [
            h.checkIn || "", h.checkOut || "", h.hotelName || "", h.meal || "", h.roomType || "",
            String(h.sgl || 0), String(h.dbl || 0)
          ];
          vals.forEach((v, i) => doc.text(safe(v), colX[i], y));
          y += 14;
          if (y > pageHeight - 80) { doc.addPage(); y = margin + 20; }
        });
      }

      // Itinerary table
      if (itins.length) {
        y += 10;
        drawSectionHeader("ITINERARY");
        const colX = [margin, margin + 90, margin + 140];
        const headers = ["Date", "Day", "Itinerary Description"];
        doc.setFont("helvetica", "bold");
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        y += 14;
        doc.setFont("helvetica", "normal");
        const maxWidth = pageWidth - margin * 2 - 160;
        itins.slice(0, 20).forEach((it) => {
          doc.text(safe(it.date || ""), colX[0], y);
          doc.text(safe(it.day || ""), colX[1], y);
          const lines = doc.splitTextToSize(safe(it.itinerary || ""), maxWidth);
          doc.text(lines, colX[2], y);
          y += Math.max(14, lines.length * 12);
          if (y > pageHeight - 100) { doc.addPage(); y = margin + 20; }
        });
      }

      // Inclusions list
      if (incs.length) {
        y += 10;
        drawSectionHeader("INCLUSIONS");
        let idx = 1;
        incs.slice(0, 12).forEach((i) => {
          if (i.yes) {
            const lineText = `${idx}. ${safe(i.inclusion || "")}`;
            doc.text(lineText, margin + 10, y);
            y += 14;
            idx++;
            if (y > pageHeight - 80) { doc.addPage(); y = margin + 20; }
          }
        });
      }

      // Footer with page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 16, { align: "center" });
      }

      const dataUrl = doc.output("dataurlstring");
      const obj = {
        fileName: `${safe(gd.fileNo || res.id || fileNo || "reservation")}_cover.pdf`,
        size: dataUrl.length,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };
      setCoverPage(obj);
      if (typeof onDataChange === "function") onDataChange({ CoverPage: obj });
    } catch (e) {
      console.error("Failed generating cover page:", e);
      alert("Failed to generate Cover Page");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // --- Confirmation Letter helpers (PDF) ---
  const handleConfirmationSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/pdf$/i.test(file.name) && file.type !== "application/pdf") {
      alert("Please choose a PDF for Confirmation Letter.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      const obj = {
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };
      setConfirmationLetter(obj);
      if (typeof onDataChange === "function") onDataChange({ ConfirmationLetter: obj });
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirmationDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!/pdf$/i.test(file.name) && file.type !== "application/pdf") {
      alert("Please drop a PDF for Confirmation Letter.");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const obj = {
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      dataUrl
    };
    setConfirmationLetter(obj);
    if (typeof onDataChange === "function") onDataChange({ ConfirmationLetter: obj });
  };

  const removeConfirmation = () => {
    setConfirmationLetter(null);
    if (typeof onDataChange === "function") onDataChange({ ConfirmationLetter: null });
  };

  const downloadConfirmation = () => {
    if (!confirmationLetter?.dataUrl) return;
    const a = document.createElement("a");
    a.href = confirmationLetter.dataUrl;
    a.download = confirmationLetter.fileName || "confirmation_letter.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveConfirmation = () => {
    if (typeof onSave === "function") onSave({ ConfirmationLetter: confirmationLetter });
  };

  // Generate Confirmation Letter PDF from reservation data (summary)
  const generateConfirmationFromReservation = async () => {
    setIsGeneratingConfirmation(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 36;
      let y = margin + 20;

      const res = data || {};
      const gd = res.generalData || {};
      const arrDep = Array.isArray(res.ArrDep) ? res.ArrDep : [];
      const hotels = Array.isArray(res.Hotels) ? res.Hotels : [];
      const itins = Array.isArray(res.Itineraries) ? res.Itineraries : [];

      const safe = (v) => (v === undefined || v === null ? "" : String(v));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CONFIRMATION LETTER", pageWidth / 2, y, { align: "center" });
      y += 24;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("File No.:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.fileNo || res.id || fileNo || ""), margin + 70, y);
      y += 16;

      doc.setFont("helvetica", "bold");
      doc.text("Client Name:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.clientName || ""), margin + 90, y);
      y += 16;

      doc.setFont("helvetica", "bold");
      doc.text("Agent:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(safe(gd.agent || ""), margin + 50, y);
      y += 16;

      doc.setFont("helvetica", "bold");
      doc.text("Arrival / Departure:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${safe(arrDep?.[0]?.date || "")}  -  ${safe(arrDep?.[1]?.date || "")}`, margin + 130, y);
      y += 20;

      const drawLine = () => { doc.setDrawColor(180); doc.line(margin, y, pageWidth - margin, y); y += 10; };

      // Services overview
      doc.setFont("helvetica", "bold");
      doc.text("Services Summary", margin, y); y += 14; drawLine();
      doc.setFont("helvetica", "normal");
      doc.text(`Meet & Assist: ${arrDep?.[0]?.notes ? "Yes" : "As per program"}`, margin, y); y += 14;
      doc.text(`Vehicles: ${Array.isArray(res.Transportation) ? res.Transportation.length : 0}`, margin, y); y += 14;
      doc.text(`Guides: ${Array.isArray(res.Guides) ? res.Guides.length : 0}`, margin, y); y += 14;
      doc.text(`Entrance Tickets: ${Array.isArray(res.Entrance) ? res.Entrance.length : 0}`, margin, y); y += 18;

      // Hotel confirmations
      if (hotels.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Hotel Confirmations", margin, y); y += 14; drawLine();
        doc.setFont("helvetica", "normal");
        hotels.slice(0, 10).forEach((h, idx) => {
          const line = `${idx + 1}. ${safe(h.hotelName || "-")}  (${safe(h.checkIn || "")} - ${safe(h.checkOut || "")})  Meal: ${safe(h.meal || "-")}`;
          doc.text(line, margin, y);
          y += 14;
          if (y > pageHeight - 80) { doc.addPage(); y = margin + 20; }
        });
      }

      // Program highlights
      if (itins.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Program Highlights", margin, y); y += 14; drawLine();
        doc.setFont("helvetica", "normal");
        itins.slice(0, 12).forEach((it, idx) => {
          const when = `${safe(it.date || "")} ${it.day ? "(" + it.day + ")" : ""}`;
          const lines = doc.splitTextToSize(`${idx + 1}. ${when}: ${safe(it.itinerary || "")}`, pageWidth - margin * 2);
          doc.text(lines, margin, y);
          y += Math.max(14, lines.length * 12);
          if (y > pageHeight - 80) { doc.addPage(); y = margin + 20; }
        });
      }

      const dataUrl = doc.output("dataurlstring");
      const obj = {
        fileName: `${safe(gd.fileNo || res.id || fileNo || "reservation")}_confirmation_letter.pdf`,
        size: dataUrl.length,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };
      setConfirmationLetter(obj);
      if (typeof onDataChange === "function") onDataChange({ ConfirmationLetter: obj });
    } catch (e) {
      console.error("Failed generating confirmation letter:", e);
      alert("Failed to generate Confirmation Letter");
    } finally {
      setIsGeneratingConfirmation(false);
    }
  };

  return (
    <div style={{ color: 'white', padding: '10px' }}>
      <div style={summaryBoxStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Reservation Details</h2>
        <div style={gridStyle}>
          <div>
            {metaItem('File No.', fileNo)}
            {metaItem('Group', data?.generalData?.groupName)}
            {metaItem('Agent', data?.generalData?.agent)}
            {metaItem('Nationality', data?.generalData?.nationality)}
          </div>
          <div>
            {metaItem('Arrival Date', data?.ArrDep?.[0]?.date)}
            {metaItem('Departure Date', data?.ArrDep?.[1]?.date)}
            {metaItem('Pax', data?.generalData?.pax || data?.ArrDep?.[0]?.pax || data?.ArrDep?.[1]?.pax)}
          </div>
          <div>
            {metaItem('Offer ID', offerId || derivedOfferId || (offer && offer.id) || 'Not linked')}
            {metaItem('Quotation ID', quotationId || derivedQuotationId || (quotation && quotation.id) || 'Not linked')}
          </div>
        </div>
  
      </div>

      <div style={gridStyle}>
        {/* Offer viewer */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h3 style={{ margin: 0 }}>Offer</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={buttonStyle('#17a2b8')}
                disabled={!(offerId || derivedOfferId)}
                onClick={openOfferPage}
                title={(offerId || derivedOfferId) ? `Open Offer ${offerId || derivedOfferId}` : 'No Offer linked'}
              >
                Open Offer
              </button>
              <button
                style={buttonStyle('#6c757d')}
                disabled={!offer}
                onClick={() => downloadJSON(offer, `offer-${(offerId || derivedOfferId || fileNo)}.json`)}
              >
                Download JSON
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading offer...</p>
          ) : offer ? (
            <details style={{ background: '#111', borderRadius: 8, border: '1px solid #333' }}>
              <summary style={{ cursor: 'pointer', padding: '8px 12px', color: '#ccc' }}>
                Offer Data {(offerId || derivedOfferId) ? `(ID: ${offerId || derivedOfferId})` : '(Snapshot)'}
              </summary>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
{prettyJSON(offer)}
              </pre>
            </details>
          ) : (
            <p style={{ color: '#ccc' }}>
              No Offer found for this reservation. If this reservation was created from a confirmed offer,
              ensure the Offer is saved and linked.
            </p>
          )}

          {/* Updated/Attached Offers */}
          <div style={{ marginTop: 16, borderTop: '1px solid #333', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, color: '#fff' }}>Updated/Attached Offers</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="attach-offer-input"
                  type="file"
                  accept="application/json,.json"
                  onChange={handleAttachOfferInput}
                  style={{ display: 'none' }}
                />
                <label htmlFor="attach-offer-input" style={{ cursor: 'pointer', ...buttonStyle('#6c757d') }}>
                  Choose JSON
                </label>
                <button onClick={saveAttachedOffers} style={buttonStyle('#007bff')}>
                  Save Attached Offers
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleAttachOfferDrop}
              style={{
                border: '2px dashed #555',
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
                color: '#bbb',
                backgroundColor: '#161616',
                marginBottom: 12
              }}
            >
              Drag & Drop updated offer JSON here (will not replace the original)
            </div>

            {(!attachedOffers || attachedOffers.length === 0) ? (
              <p style={{ color: '#ccc', margin: 0 }}>No updated offers attached.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {attachedOffers.map((o, idx) => (
                  <details
                    key={o.id}
                    style={{ background: '#111', borderRadius: 8, border: '1px solid #333' }}
                    open={false}
                  >
                    <summary style={{ cursor: 'pointer', padding: '8px 12px', color: '#ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        Updated Offer {idx + 1} {o.relatedOfferId ? `(ID: ${o.relatedOfferId})` : ''}
                        {o.fileName ? ` — ${o.fileName}` : ''}
                      </span>
                      <span style={{ display: 'inline-flex', gap: 8 }}>
                        <button style={buttonStyle('#6c757d')} onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadAttachedOffer(o); }}>
                          Download JSON
                        </button>
                        <button style={buttonStyle('#dc3545')} onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeAttachedOffer(o.id); }}>
                          Remove
                        </button>
                      </span>
                    </summary>
                    <pre
                      style={{
                        margin: 0,
                        padding: 12,
                        overflowX: 'auto',
                        whiteSpace: 'pre',
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
{prettyJSON(o?.offer)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quotation viewer */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h3 style={{ margin: 0 }}>Quotation</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={buttonStyle('#ffc107')}
                disabled={!(quotationId || derivedQuotationId)}
                onClick={openQuotationPage}
                title={(quotationId || derivedQuotationId) ? `Open Quotation ${quotationId || derivedQuotationId}` : 'No Quotation linked'}
              >
                Open Quotation
              </button>
              <button
                style={buttonStyle('#6c757d')}
                disabled={!quotation}
                onClick={() => downloadJSON(quotation, `quotation-${(quotationId || derivedQuotationId || fileNo)}.json`)}
              >
                Download JSON
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading quotation...</p>
          ) : quotation ? (
            <details style={{ background: '#111', borderRadius: 8, border: '1px solid #333' }}>
              <summary style={{ cursor: 'pointer', padding: '8px 12px', color: '#ccc' }}>
                Quotation Data {(quotationId || derivedQuotationId) ? `(ID: ${quotationId || derivedQuotationId})` : '(Snapshot)'}
              </summary>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
{prettyJSON(quotation)}
              </pre>
            </details>
          ) : (
            <p style={{ color: '#ccc' }}>
              No Quotation found for this reservation. If this reservation was created from an offer linked to a quotation,
              ensure the quotation is saved and linked.
            </p>
          )}
        </div>
      </div>

      {/* Email History */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Email History</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="file"
              accept=".eml"
              multiple
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="eml-input"
            />
            <label htmlFor="eml-input" style={{ cursor: 'pointer', ...buttonStyle('#6c757d') }}>
              Choose .eml
            </label>
            <button onClick={persistEmails} style={buttonStyle('#007bff')}>
              Save Email History
            </button>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: '2px dashed #555',
            borderRadius: 10,
            padding: 20,
            textAlign: 'center',
            color: '#bbb',
            backgroundColor: '#161616',
            marginBottom: 16
          }}
        >
          Drag & Drop .eml files here
        </div>

        {emails.length === 0 ? (
          <p style={{ color: '#ccc', margin: 0 }}>No emails uploaded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emails.map((m) => (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: 12,
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                  gap: 10,
                  alignItems: 'center'
                }}
              >
                <div style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>Subject:</strong> {m.subject || '-'}
                </div>
                <div style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>From:</strong> {m.from || '-'}
                </div>
                <div style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>To:</strong> {m.to || '-'}
                </div>
                <div style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>Date:</strong> {m.mailDate || '-'}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button style={buttonStyle('#6c757d')} onClick={() => downloadEmail(m)}>Download</button>
                  <button style={buttonStyle('#dc3545')} onClick={() => removeEmail(m.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cover Page */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Cover Page</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="cover-upload"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleCoverSelect}
              style={{ display: 'none' }}
            />
            <button onClick={generateCoverFromReservation} disabled={isGeneratingCover} style={{ padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6 }}>
              {coverPage ? (isGeneratingCover ? 'Generating...' : 'Regenerate from Reservation') : (isGeneratingCover ? 'Generating...' : 'Generate from Reservation')}
            </button>
            {SHOW_MANUAL_UPLOADS && (
              <label htmlFor="cover-upload" style={{ cursor: 'pointer', padding: '8px 12px', background: '#6c757d', color: '#fff', borderRadius: 6 }}>
                Choose PDF
              </label>
            )}
            <button onClick={saveCover} style={{ padding: '8px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6 }}>
              Save Cover Page
            </button>
          </div>
        </div>

        {SHOW_MANUAL_UPLOADS && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCoverDrop}
            style={{
              border: '2px dashed #555',
              borderRadius: 10,
              padding: 20,
              textAlign: 'center',
              color: '#bbb',
              backgroundColor: '#161616',
              marginBottom: 16
            }}
          >
            Drag & Drop Cover Page PDF here
          </div>
        )}

        {!coverPage ? (
          <p style={{ color: '#ccc', margin: 0 }}>Not generated yet.</p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#fff' }}>
              <div><strong>File:</strong> {coverPage.fileName}</div>
              <div><strong>Size:</strong> {Math.round((coverPage.size || 0) / 1024)} KB</div>
              <div><strong>Uploaded:</strong> {new Date(coverPage.uploadedAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={downloadCover} style={{ padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6 }}>Download</button>
              <button onClick={removeCover} style={{ padding: '8px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6 }}>Remove</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Letter */}
      <div style={{ ...cardStyle, marginTop: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Confirmation Letter</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="confirmation-upload"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleConfirmationSelect}
              style={{ display: 'none' }}
            />
            <button onClick={generateConfirmationFromReservation} disabled={isGeneratingConfirmation} style={{ padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6 }}>
              {confirmationLetter ? (isGeneratingConfirmation ? 'Generating...' : 'Regenerate from Reservation') : (isGeneratingConfirmation ? 'Generating...' : 'Generate from Reservation')}
            </button>
            {SHOW_MANUAL_UPLOADS && (
              <label htmlFor="confirmation-upload" style={{ cursor: 'pointer', padding: '8px 12px', background: '#6c757d', color: '#fff', borderRadius: 6 }}>
                Choose PDF
              </label>
            )}
            <button onClick={saveConfirmation} style={{ padding: '8px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6 }}>
              Save Confirmation Letter
            </button>
          </div>
        </div>

        {SHOW_MANUAL_UPLOADS && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleConfirmationDrop}
            style={{
              border: '2px dashed #555',
              borderRadius: 10,
              padding: 20,
              textAlign: 'center',
              color: '#bbb',
              backgroundColor: '#161616',
              marginBottom: 16
            }}
          >
            Drag & Drop Confirmation Letter PDF here
          </div>
        )}

        {!confirmationLetter ? (
          <p style={{ color: '#ccc', margin: 0 }}>Not generated yet.</p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#fff' }}>
              <div><strong>File:</strong> {confirmationLetter.fileName}</div>
              <div><strong>Size:</strong> {Math.round((confirmationLetter.size || 0) / 1024)} KB</div>
              <div><strong>Uploaded:</strong> {new Date(confirmationLetter.uploadedAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={downloadConfirmation} style={{ padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6 }}>Download</button>
              <button onClick={removeConfirmation} style={{ padding: '8px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6 }}>Remove</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResDetails;