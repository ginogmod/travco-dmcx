// assets/utils/generateOfferPDF.js
import jsPDF from "jspdf";
import headerBanner from "../pdf/headerBanner.png?url";
import footerTravco from "../pdf/footerTravco.png?url";
import qaiaBackground from "../pdf/qaiaBackground.png?url";
import petraImage from "../pdf/petraImage.png?url";
import translations from "../translations";
import { getTranslatedQuickHint } from "./getTranslatedQuickHint";
import autoContentTranslations from "../translations/autoContent";

 // Signature banners
import signShatha from "../signatures/shatha.png?url";
import signOmar   from "../signatures/omar.png?url";
import signOsama  from "../signatures/osama.png?url";
import signAya    from "../signatures/aya.png?url";
import signKhalil from "../signatures/khalil.png?url";
import signLaith  from "../signatures/laith.png?url";
import signNejmeh from "../signatures/nejmeh.png?url";
import signNermin from "../signatures/nermin.png?url";
import signYanal  from "../signatures/yanal.png?url";

export async function generateOfferPDF(data) {
  const {
    groupName,
    agent,
    pax = 1,
    itinerary = [],
    ratesAndSupplements = [],
    options = [],
    quotations = [],
    message = "",
    inclusions = [],
    exclusions = [],
    signatureKey = "",
    agencyLogo,    // <-- URL or DataURL for the agency logo
    mainImage,     // <-- Main image for itinerary page
    smallImage1,   // <-- Small image 1
    smallImage2,   // <-- Small image 2
    smallImage3,   // <-- Small image 3
    additionalImages = [],  // <-- Additional photos to render on itinerary continuation pages
    moreImages = [],        // <-- Alias for additionalImages
    isGroupSeries = false,  // <-- Flag for Group Series
    validityFrom = "",      // <-- Custom validity start date for Group Series
    validityTo = "",        // <-- Custom validity end date for Group Series
    validityDates = [],     // <-- Additional validity dates for Group Series
    language = "english",   // <-- Selected language for PDF generation
    pdfQuality = "low",     // <-- PDF quality preset: 'low' | 'normal' | 'high' (default 'low' to reduce size)
    showOption1 = true,     // <-- Flag to show/hide Option 1
    showOption2 = true,     // <-- Flag to show/hide Option 2
    showOption3 = true      // <-- Flag to show/hide Option 3
  } = data;
  
  // Get translations for the selected language
  const t = translations[language] || translations.english;
  
  // Check if the language is RTL (right-to-left)
  const isRTL = t.direction === "rtl";

  // If options is empty but quotations is not, derive options from quotations
  let finalOptions = options;
  if ((!finalOptions || finalOptions.length === 0) && quotations.length > 0) {
    const firstQuote = quotations[0];
    if (firstQuote.options && firstQuote.options.length > 0) {
      finalOptions = firstQuote.options;
    }
  }

  // Process options to ensure supplements are available at the option level
  // Filter options based on visibility flags
  finalOptions = finalOptions.map((option, index) => {
    // If sglSupp and hbSupp are not defined but accommodations exist, calculate from accommodations
    if ((!option.sglSupp || !option.hbSupp) && option.accommodations && option.accommodations.length > 0) {
      // Use the first accommodation's rates as the supplement values
      // This is a simplification - in a real scenario you might want to calculate an average or use a specific logic
      const firstAccom = option.accommodations[0];
      return {
        ...option,
        sglSupp: firstAccom.sglRate || 0,
        hbSupp: firstAccom.hbRate || 0
      };
    }
    return option;
  });
  
  // Create a filtered version of options based on visibility flags
  const visibleOptions = finalOptions.filter((option, index) => {
    if (index === 0) return showOption1;
    if (index === 1) return showOption2;
    if (index === 2) return showOption3;
    return true; // Show any additional options by default
  });

  // normalize arrays
  let itinArr = Array.isArray(itinerary)
    ? itinerary
    : typeof itinerary === "string"
      ? itinerary.split("\n").filter(Boolean)
      : [];
  // Get raw inclusions array
  const rawIncArr = Array.isArray(inclusions)
    ? inclusions
    : typeof inclusions === "string"
      ? inclusions.split("\n").filter(Boolean)
      : [];
  const excArr = Array.isArray(exclusions)
    ? exclusions
    : typeof exclusions === "string"
      ? exclusions.split("\n").filter(Boolean)
      : [];
  
  // Consolidate itinerary headings if structured rows with multi-day metadata are available
  try {
    const getStructuredRows = () => {
      if (Array.isArray(data?.itineraryRows) && data.itineraryRows.length) return data.itineraryRows;
      if (Array.isArray(quotations) && quotations.length > 0 && Array.isArray(quotations[0]?.itinerary)) return quotations[0].itinerary;
      return null;
    };
    const rows = getStructuredRows();
    if (Array.isArray(rows) && rows.length > 0) {
      const suppressed = new Set(); // 1-based day numbers to suppress
      const headings = [];
      const coerceNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
        };
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i] || {};
        const dayNum = i + 1;
        if (suppressed.has(dayNum)) continue;

        const enabled = !!r.multiDayEnabled && Array.isArray(r.multiDayDays) && r.multiDayDays.length > 0;
        let labelCore = `Day ${dayNum}`;
        if (enabled) {
          const picks = Array.from(new Set((r.multiDayDays || [])
            .map(coerceNum)
            .filter((n) => n && n > dayNum && n <= rows.length)))
            .sort((a,b) => a - b);
          picks.forEach(n => suppressed.add(n));

          // Compress into ranges
          const ranges = [];
          let start = null, prev = null;
          for (const d of picks) {
            if (start === null) { start = d; prev = d; }
            else if (d === prev + 1) { prev = d; }
            else { ranges.push([start, prev]); start = d; prev = d; }
          }
          if (start !== null) ranges.push([start, prev]);

          // Prefer single contiguous block starting on next day => "Day D - last"
          if (ranges.length === 1 && ranges[0][0] === dayNum + 1) {
            labelCore = `Day ${dayNum} - ${ranges[0][1]}`;
          } else if (ranges.length > 0) {
            const parts = [String(dayNum), ...ranges.map(([a,b]) => a === b ? String(a) : `${a} - ${b}`)];
            labelCore = `Day ${parts.join(", ")}`;
          }
        }

        // Build route text
        const route = (typeof r.itinerary === "string" && r.itinerary.trim())
          ? r.itinerary.trim()
          : (() => {
              const src = Array.isArray(itinArr) && typeof itinArr[i] === "string" ? itinArr[i] : "";
              const m = src.split(":");
              return m.length > 1 ? m.slice(1).join(":").trim() : "";
            })();

        const heading = route ? `${labelCore}: ${route}` : `${labelCore}:`;
        headings.push(heading);
      }
      if (headings.length) {
        itinArr = headings;
      }
    }
  } catch (_) {}
  
  // signature lookup
  const signatureMap = {
    shatha: signShatha,
    omar:   signOmar,
    osama:  signOsama,
    aya:    signAya,
    khalil: signKhalil,
    laith:  signLaith,
    nejmeh: signNejmeh,
    nermin: signNermin,
    yanal:  signYanal,
  };

  // PAX label helper
  const paxRanges = [
    { min: 1,  max: 1,  label: "1 PAX"     },
    { min: 2,  max: 3,  label: "2-3 PAX"   },
    { min: 4,  max: 5,  label: "4-5 PAX"   },
    { min: 6,  max: 7,  label: "6-7 PAX"   },
    { min: 8,  max: 9,  label: "8-9 PAX"   },
    { min: 10, max: 14, label: "10-14 PAX" },
    { min: 15, max: 19, label: "15-19 PAX" },
    { min: 20, max: 24, label: "20-24 PAX" },
    { min: 25, max: 29, label: "25-29 PAX" },
    { min: 30, max: 34, label: "30-34 PAX" },
    { min: 35, max: 39, label: "35-39 PAX" },
    { min: 40, max: 44, label: "40-44 PAX" },
    { min: 45, max: 49, label: "45-49 PAX" },
  ];
  function getPaxLabel(n) {
    const rng = paxRanges.find(r => n >= r.min && n <= r.max);
    return rng ? rng.label : `${n} PAX`;
  }

  const profitMargin = 0.10;

  // sum fixed JOD fees
  const baseJOD = ratesAndSupplements.reduce(
    (sum, f) => sum + (Number(f.amount) || 0),
    0
  );

  // --- PDF setup ---
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    direction: isRTL ? "rtl" : "ltr", // Set RTL direction if needed
    compress: true // Enable compression to reduce file size
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const lineH = 20; // Reduced line height for smaller tables
  const footerHeight = 60; // Height reserved for footer
  
  // Set default font settings for consistency throughout the document
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Quality/compression preset for images
  const __qualityPreset = String(pdfQuality || 'normal').toLowerCase();
  // In jsPDF, 'SLOW' generally means stronger compression (smaller size), 'FAST' is lighter compression (larger size)
  const __compressionMap = { low: 'SLOW', normal: 'MEDIUM', high: 'FAST' };
  // jsPDF addImage compression hint: 'FAST' | 'MEDIUM' | 'SLOW'
  const imageCompression = __compressionMap[__qualityPreset] || 'MEDIUM';

  // Quality presets and client-side image preprocessing helpers

  // Pixels-per-point for estimating canvas output size (CSS px at 96 DPI)
  const PX_PER_PT = 96 / 72;

  // JPEG quality for canvas re-encoding
  const __jpegQMap = { low: 0.6, normal: 0.75, high: 0.9 };
  const jpegQuality = __jpegQMap[__qualityPreset] || 0.75;

  // Cache of image dimensions keyed by resultant DataURL, used by drawImageInBox
  const imageDimsCache = new Map();
  // Cache of aliases per unique image source to enable reuse without collisions
  const imageAliasCache = new Map();

  // Async helpers for client-side downscaling/re-encoding
  const loadImageEl = (src) => new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    } catch (e) { reject(e); }
  });

  /**
   * Re-encode an image as JPEG at an appropriate size for its destination box.
   * - targetWpt/targetHpt are in PDF points; we convert to px heuristically.
   * - If loading/downscaling fails, we return the original src.
   */
  const preprocessToJPEG = async (src, targetWpt, targetHpt, q = jpegQuality) => {
    try {
      if (!src || typeof src !== "string") return src;
      const img = await loadImageEl(src);
      // Slightly oversample to keep quality after PDF scaling; still compact
      const factor = (__qualityPreset === "low" ? 1.8 : (__qualityPreset === "normal" ? 2.0 : 2.5));
      const maxWpx = Math.max(1, Math.ceil(targetWpt * PX_PER_PT * factor));
      const maxHpx = Math.max(1, Math.ceil(targetHpt * PX_PER_PT * factor));
      const scale = Math.min(maxWpx / img.naturalWidth, maxHpx / img.naturalHeight, 1);
      const outW = Math.max(1, Math.floor(img.naturalWidth * scale));
      const outH = Math.max(1, Math.floor(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        try { ctx.imageSmoothingQuality = "high"; } catch (_) {}
        ctx.drawImage(img, 0, 0, outW, outH);
      }
      const dataUrl = canvas.toDataURL("image/jpeg", q);
      try { imageDimsCache.set(dataUrl, { width: outW, height: outH }); } catch (_) {}
      return dataUrl;
    } catch (_) {
      return src;
    }
  };

  // Define target boxes for itinerary images up-front so we can preprocess to those sizes
  const mainImgW = 200;
  const mainImgH = Math.max(200, Math.floor(pageH * 0.55));
  const smallImgW = 60, smallImgH = 60;
  const smallImgGap = 10;

  // Preprocess user-supplied photographic images to compact JPEGs
  let imgMain = mainImage;
  let imgSmall1 = smallImage1;
  let imgSmall2 = smallImage2;
  let imgSmall3 = smallImage3;
  try {
    if (mainImage)   imgMain   = await preprocessToJPEG(mainImage,   mainImgW,  mainImgH);
    if (smallImage1) imgSmall1 = await preprocessToJPEG(smallImage1, smallImgW, smallImgH);
    if (smallImage2) imgSmall2 = await preprocessToJPEG(smallImage2, smallImgW, smallImgH);
    if (smallImage3) imgSmall3 = await preprocessToJPEG(smallImage3, smallImgW, smallImgH);
  } catch (_) {}

  // Preprocess additional images used in itinerary continuation pages
  // Thumbnails at small size
  let procMoreImages = [];
  let procAdditionalImages = [];
  try {
    const more = Array.isArray(moreImages) ? moreImages : [];
    const addl = Array.isArray(additionalImages) ? additionalImages : [];
    procMoreImages = await Promise.all(more.map(src => preprocessToJPEG(src, smallImgW, smallImgH)));
    procAdditionalImages = await Promise.all(addl.map(src => preprocessToJPEG(src, smallImgW, smallImgH)));
  } catch (_) {}

  // Separate preprocessing for the MAIN additional image at full right-column size
  let procMoreImagesMain = [];
  let procAdditionalImagesMain = [];
  try {
    const more = Array.isArray(moreImages) ? moreImages : [];
    const addl = Array.isArray(additionalImages) ? additionalImages : [];
    procMoreImagesMain = await Promise.all(more.map(src => preprocessToJPEG(src, mainImgW, mainImgH)));
    procAdditionalImagesMain = await Promise.all(addl.map(src => preprocessToJPEG(src, mainImgW, mainImgH)));
  } catch (_) {}
  // Quality presets and client-side image preprocessing helpers


  // Helper: detect image format from DataURL or file extension
  const detectImageFormat = (img) => {
    if (!img || typeof img !== "string") return "PNG";
    const lower = img.toLowerCase();
    if (lower.startsWith("data:image/")) {
      if (lower.startsWith("data:image/png")) return "PNG";
      if (lower.startsWith("data:image/jpeg") || lower.startsWith("data:image/jpg")) return "JPEG";
      if (lower.startsWith("data:image/webp")) return "WEBP";
      // default for unknown data URLs
      return "PNG";
    }
    // Fallback by extension
    if (lower.endsWith(".png")) return "PNG";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "JPEG";
    if (lower.endsWith(".webp")) return "WEBP";
    return "PNG";
  };

  // Helper: safely add image with auto format detection and graceful fallback + compression preference + alias reuse
  const addImageSmart = (source, x, y, w, h, opts = {}) => {
    if (!source) return;
    const srcFmt = detectImageFormat(source);
    const preferJPEG = !!opts.preferJPEG;

    // Strong aliasing: hash the FULL source string to avoid collisions between different images.
    const srcStr = typeof source === "string" ? source : String(source);
    const hashStr = (s) => {
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
      }
      return (h >>> 0).toString(36);
    };
    let alias = imageAliasCache.get(srcStr);
    if (!alias) {
      alias = `img_${hashStr(srcStr)}`;
      try { imageAliasCache.set(srcStr, alias); } catch (_) {}
    }

    // Build ordered list of formats to try
    const formatsToTry = (() => {
      const order = [];
      if (preferJPEG) order.push("JPEG");
      order.push(srcFmt);
      order.push(srcFmt === "PNG" ? "WEBP" : "PNG");
      // De-duplicate while preserving order
      return Array.from(new Set(order.filter(Boolean)));
    })();

    for (const fmt of formatsToTry) {
      try {
        // Pass compression hint to jsPDF and alias for reuse
        doc.addImage(source, fmt, x, y, w, h, alias, imageCompression);
        return;
      } catch (_) {
        // try next format
      }
    }
    // Last resort: attempt original without compression hint (still with alias)
    try {
      doc.addImage(source, srcFmt, x, y, w, h, alias);
    } catch (_) {
      /* swallow to avoid breaking PDF generation */
    }
  };
// Helper: draw image into a fixed box without stretching (contain or cover)
const drawImageInBox = (source, x, y, boxW, boxH, mode = "contain", opts = {}) => {
  if (!source) return;
  // Get intrinsic image dimensions when possible
  let imgW = boxW, imgH = boxH;
  try {
    const props = doc.getImageProperties(source);
    if (props && props.width && props.height) {
      imgW = props.width;
      imgH = props.height;
    }
  } catch (_) {
    // If getImageProperties fails, try cached dimensions from preprocessing
    try {
      const cached = imageDimsCache.get(source);
      if (cached && cached.width && cached.height) {
        imgW = cached.width;
        imgH = cached.height;
      }
    } catch (__){}
    // Otherwise we'll still avoid stretching by centering within the box
  }

  // Preserve aspect ratio; allow limited upscaling so images fill their boxes
  const rawScale = mode === "cover"
    ? Math.max(boxW / imgW, boxH / imgH)
    : Math.min(boxW / imgW, boxH / imgH);
  const upscaleLimit = (opts && opts.allowUpscale === false) ? 1 : 2.5;
  const scale = Math.min(rawScale, upscaleLimit);

  const drawW = Math.min(boxW, imgW * scale);
  const drawH = Math.min(boxH, imgH * scale);

  // Center the image within the target box
  const offsetX = x + (boxW - drawW) / 2;
  const offsetY = y + (boxH - drawH) / 2;

  // Prefer JPEG for photographic content by default, allow override via opts
  const effectiveOpts = { preferJPEG: true, ...opts };

  // Delegate actual rendering to the smart adder (format fallbacks included)
  addImageSmart(source, offsetX, offsetY, drawW, drawH, effectiveOpts);
};

  // Draw header (Travco banner at top)
  const drawHeader = () => {
    addImageSmart(headerBanner, 0, 0, pageW, 100, { preferJPEG: false });
  };

  // Draw footer: Travco bottom-left + agency logo slightly lower bottom-right
  const drawFooter = () => {
    const footerY = pageH - 50;
    // Travco footer
    addImageSmart(footerTravco, 20, footerY, 80, 30, { preferJPEG: false });
    // Agency logo
    if (agencyLogo) {
      const logoW = 60;
      const logoH = 60;
      addImageSmart(
        agencyLogo,
        pageW - margin - logoW,
        footerY - 9,   // slightly lower than Travco footer
        logoW,
        logoH,
        { preferJPEG: false }
      );
    }
  };

  // Enhanced page space checking with content type awareness and section boundary handling
  const checkPageSpace = (y, buf = 100, contentType = "text", isNewSection = false, sectionHeight = 0) => {
    // Different buffer sizes based on content type
    const bufferSizes = {
      "text": 100,
      "table": 150,
      "tableRow": 30,
      "heading": 50,
      "image": 20,
      "section": 200  // Buffer for entire sections
    };
    
    // Use specific buffer or default
    const actualBuffer = contentType in bufferSizes ? bufferSizes[contentType] : buf;
    
    // Calculate available space on current page
    const availableSpace = pageH - footerHeight - y;
    
    // Force new page if this is a new section and there's not enough space for the entire section
    // or if we're close to the bottom of the page (less than 100pt remaining)
    if (isNewSection && (sectionHeight > 0 && sectionHeight > availableSpace || availableSpace < 100)) {
      doc.addPage();
      drawHeader();
      // Ensure footer is drawn on every page
      drawFooter();
      return 130; // Return starting Y position for new page
    }
    
    // Standard check if we need a new page
    if (y + actualBuffer > pageH - footerHeight) {
      doc.addPage();
      drawHeader();
      // Ensure footer is drawn on every page
      drawFooter();
      return 130; // Return starting Y position for new page
    }
    
    return y;
  };

  // --- COVER PAGE ---
  drawHeader();
  // Set consistent font family throughout the document
  doc.setFont("helvetica", "bold")
     .setFontSize(10)
     .setFillColor(200,0,0).rect(margin, 120, 180, 26, "F")
     .setTextColor(255)
     .text(groupName, margin + 10, 138)
     .setFillColor(90).rect(margin, 150, 180, 20, "F")
     .text(agent, margin + 10, 164)
     .setFont("helvetica","normal").setTextColor(0);

  let y = 250;

  // Render Initial Message (avoid splitting over pages)
  if (message) {
    // Increase initial message font size
    doc.setFontSize(14);
    const lines = doc.splitTextToSize(message, pageW - 2 * margin);
    // Adjust height estimate for larger font
    const msgHeight = lines.length * 22 + 30;
    // Ensure the whole message block fits (or start on a fresh page)
    y = checkPageSpace(y, 50, "section", true, msgHeight + 50);
    doc.text(lines, margin, y, { lineHeightFactor: 1.5 });
    // Advance Y based on larger font metrics
    y += lines.length * 22 + 20;
    // Reset default body font size
    doc.setFontSize(10);
  }

  // Render Signature directly under the message, ensuring it does not split or overlap footer
  const sigImage = signatureMap[signatureKey];
  if (sigImage) {
    const props = doc.getImageProperties(sigImage);
    // Make signature span the full content width (between margins)
    const w = (pageW - 2 * margin);
    const h = (props.height / props.width) * w;
    // Ensure the signature block fits on the current page
    y = checkPageSpace(y, 40, "image", true, h + 40);
    const xPos = margin;
    addImageSmart(sigImage, xPos, y, w, h, { preferJPEG: false });
    y += h + 10;
  }

  drawFooter();

  // --- ARRIVAL & DEPARTURE PAGE ---
  doc.addPage(); 
  drawHeader();

  doc.setFillColor(200,0,0).rect(margin, 120, 240, 24, "F");
  doc.setTextColor(255).setFont("helvetica","bold")
     .text(t.arrivalAndDeparture, margin + 10, 138);

  addImageSmart(qaiaBackground, margin, 150, pageW - 2 * margin, 100, { preferJPEG: true });

  y = 270;
  const bulletList = (label, linesArr) => {
    doc.setFont("helvetica","bold").setTextColor(0).text(label, margin, y);
    y += 14;
    doc.setFont("helvetica","normal");
    linesArr.forEach(txt => {
      y = checkPageSpace(y);
      doc.circle(margin - 6, y - 3, 2, "F");
      doc.text(doc.splitTextToSize(txt, pageW - 2 * margin - 10), margin, y + 4);
      y += 20;
    });
    y += 10;
  };

  // Custom Arrival & Departure content (page 2) as per specification
  // Keep fonts consistent and maintain neat spacing
  const drawHeading = (txt) => {
    doc.setFont("helvetica","bold").setTextColor(0);
    y = checkPageSpace(y, 40, "heading");
    doc.text(String(txt), margin, y);
    y += 18;
  };
  const drawSubHeading = (txt) => {
    doc.setFont("helvetica","bold").setTextColor(0);
    y = checkPageSpace(y, 30, "text");
    doc.text(String(txt), margin, y);
    y += 12;
  };
  const drawBulletsCustom = (arr) => {
    doc.setFont("helvetica","normal").setTextColor(0);
    (arr || []).forEach((txt) => {
      const wrap = doc.splitTextToSize(String(txt), pageW - 2 * margin - 10);
      const est = Math.max(20, 12 * wrap.length + 8);
      y = checkPageSpace(y, est, "text");
      // Bullet dot
      doc.circle(margin - 6, y - 3, 2, "F");
      doc.text(wrap, margin, y + 4);
      y += 20 + Math.max(0, (wrap.length - 1) * 10);
    });
    y += 10;
  };

  // Arrival
  drawHeading("Arrival:");
  drawSubHeading("Meet & assist Team at Queen Alia airport & procedures:");
  drawBulletsCustom([
    "Our representatives will be having a sign with your Name/Company logo.",
    "Our Representative will be waiting as soon as the clients leave the aircraft as he will collect the passports; finish the visa formalities then lead clients to the luggage before leaving Airport."
  ]);

  // Departure
  drawHeading("Departure:");
  drawSubHeading("Hotel Check out Procedures:");
  drawBulletsCustom([
    "Our representative’s team will help on the checkout desk at the Hotel if needed",
    "Set Luggage pick up time from all the rooms day before if requested",
    "Transfer luggage to the bus and check count."
  ]);

  // Airport Greetings and check out procedures
  drawHeading("Airport Greetings and check out procedures:");
  drawBulletsCustom([
    "Transfer all the luggage check at the check in point.",
    "Issue Boarding passes to the clients.",
    "Finish the passports check formalities. By Travco Meet and greet representative."
  ]);

  drawFooter();

  // --- ITINERARY + QUICKHINT PAGE ---
  doc.addPage();
  drawHeader();
  
  // Image dimensions defined earlier for preprocessing (mainImgW, mainImgH, smallImgW, smallImgH, smallImgGap)

  // Unified queue of additional images preserving order and pairing main/thumb sizes
  let addlQueue = [];
  try {
    const rawMore = Array.isArray(moreImages) ? moreImages : [];
    const rawAddl = Array.isArray(additionalImages) ? additionalImages : [];
    const seen = new Set();
    const pushItem = (rawSrc, mainArr, thumbArr, idx) => {
      const key = typeof rawSrc === "string" ? rawSrc.trim() : "";
      if (!key || seen.has(key)) return;
      seen.add(key);
      const srcMain = (Array.isArray(mainArr) && typeof mainArr[idx] === "string" && mainArr[idx]) ? mainArr[idx]
                      : (Array.isArray(thumbArr) && typeof thumbArr[idx] === "string" && thumbArr[idx]) ? thumbArr[idx]
                      : key;
      const srcThumb = (Array.isArray(thumbArr) && typeof thumbArr[idx] === "string" && thumbArr[idx]) ? thumbArr[idx]
                       : (Array.isArray(mainArr) && typeof mainArr[idx] === "string" && mainArr[idx]) ? mainArr[idx]
                       : key;
      addlQueue.push({ key, srcMain, srcThumb });
    };
    for (let i = 0; i < rawMore.length; i++) pushItem(rawMore[i], procMoreImagesMain, procMoreImages, i);
    for (let j = 0; j < rawAddl.length; j++) pushItem(rawAddl[j], procAdditionalImagesMain, procAdditionalImages, j);
  } catch (_) {}

  // Helper: draw a "More Photos" section on itinerary continuation pages (right column)
  const drawMorePhotosSection = () => {
    if (!addlQueue.length) return;
    // Title
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(200, 0, 0);
    const xMain = pageW - margin - mainImgW;
    const yTitle = 130;
    doc.text("", xMain, yTitle);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(0);

    // Main additional photo
    const yMain = 140;
    const mainItem = addlQueue.shift();
    const mainSrc = mainItem && (mainItem.srcMain || mainItem.srcThumb);
    if (mainSrc) drawImageInBox(mainSrc, xMain, yMain, mainImgW, mainImgH, "cover");

    // Thumbnails row (skip any item that matches the main key)
    const yThumb = yMain + mainImgH + 10;
    let drawn = 0;
    while (drawn < 3 && addlQueue.length) {
      if (mainItem && addlQueue[0] && addlQueue[0].key === mainItem.key) {
        addlQueue.shift();
        continue;
      }
      const item = addlQueue.shift();
      if (!item) break;
      const src = item.srcThumb || item.srcMain;
      const x = xMain + drawn * (smallImgW + smallImgGap);
      drawImageInBox(src, x, yThumb, smallImgW, smallImgH, "contain");
      drawn++;
    }
  };
  // Add main image (use selected image or default to petra)
  if (imgMain) {
    drawImageInBox(imgMain, pageW - margin - mainImgW, 140, mainImgW, mainImgH, "cover");
  } else {
    drawImageInBox(petraImage, pageW - margin - mainImgW, 140, mainImgW, mainImgH, "cover");
  }
  
  // Add small images in a row below the main image
  const smallImagesY = 140 + mainImgH + 10; // 10px gap between main and small images
  
  // Small image 1
  if (imgSmall1) {
    drawImageInBox(imgSmall1, pageW - margin - mainImgW, smallImagesY, smallImgW, smallImgH, "cover");
  }
  
  // Small image 2
  if (imgSmall2) {
    drawImageInBox(imgSmall2, pageW - margin - mainImgW + smallImgW + smallImgGap, smallImagesY, smallImgW, smallImgH, "cover");
  }
  
  // Small image 3
  if (imgSmall3) {
    drawImageInBox(imgSmall3, pageW - margin - mainImgW + 2 * (smallImgW + smallImgGap), smallImagesY, smallImgW, smallImgH, "cover");
  }
  
  drawFooter();

  let itinY = 140;
  const textW = pageW - 3 * margin - mainImgW;
  
  // Get translated QuickHint data
  const QuickHint = getTranslatedQuickHint(language);
  
  // Create a set to track locations that have already been described
  const describedLocations = new Set();
  
  // Use smaller font for itinerary descriptions
  doc.setFontSize(9);
  
  itinArr.forEach((line, index) => {
    if (!line.trim()) return;
    const parts = line.split(":");
    if (parts.length < 2) return;
    const route = parts.slice(1).join(":").trim();
    const stops = route.split(/[-,&]+/).map(s => s.trim());
    const descs = [];
    
    stops.forEach(k => {
      // Normalize the location name for consistent matching
      const normalizedLocation = k.toLowerCase().trim();

      // Determine if this stop is an Overnight (O/N) marker; allow O/N descriptions to repeat across days
      const isOvernightToken = /(^|\b|\s)o\/n(\b|\s|$)/i.test(k);

      // Try to find an exact match first and capture the matched key (for O/N detection too)
      let hint = QuickHint[k];
      let matchedKey = hint ? k : null;

      // If no exact match, try case-insensitive partial matching
      if (!hint) {
        const matchingKey = Object.keys(QuickHint).find(f =>
          normalizedLocation.includes(f.toLowerCase()) ||
          f.toLowerCase().includes(normalizedLocation)
        );
        if (matchingKey) {
          hint = QuickHint[matchingKey];
          matchedKey = matchingKey;
        }
      }

      // If the matched quick hint key itself is an O/N marker, treat as overnight as well
      const isONByKey = matchedKey ? /o\/n/i.test(matchedKey) : false;
      const isON = isOvernightToken || isONByKey;

      // Only suppress duplicates for non O/N items
      if (!isON && describedLocations.has(normalizedLocation)) return;

      if (hint && !descs.includes(hint)) {
        descs.push(hint);
        // Track as described only for non O/N so that O/N can repeat
        if (!isON) describedLocations.add(normalizedLocation);
      }
    });

    // Enforce max 3 days per itinerary page (1-3 on first page, 4-6 on second, etc.)
    if (index > 0 && index % 3 === 0) {
      doc.addPage();
      drawHeader();
      drawFooter();
      itinY = 130;
      // Show More Photos section on itinerary continuation pages created by day grouping
      drawMorePhotosSection();
    }
    // More aggressive approach to prevent day header/description splits
    // If we're in the bottom third of the page, start a new page for the day
    const pageThreshold = pageH - footerHeight - 200; // 200pt from bottom
    
    if (itinY > pageThreshold) {
      // We're too close to the bottom of the page, start a new page
      doc.addPage();
      drawHeader();
      drawFooter();
      itinY = 130;
    }
    
    // Use smaller font for itinerary headings
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(200, 0, 0);
    
    // Ensure text is properly wrapped to prevent overlap with images
    const wrappedHeader = doc.splitTextToSize(line, textW);
    doc.text(wrappedHeader, margin, itinY);
    
    // Calculate header height based on number of wrapped lines
    const headerHeight = wrappedHeader.length * 12;
    itinY += headerHeight + 15; // Adaptive spacing between header and description

    // Use smaller font for itinerary descriptions
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(0);
    descs.forEach((d, index) => {
      // Calculate space needed for this description
      const wrap = doc.splitTextToSize(d, textW);
      
      // Check if we need to start a new page for this description
      // If we're more than 70% down the page and have a long description, start a new page
      if (itinY > (pageH - footerHeight) * 0.7 && wrap.length > 3) {
        doc.addPage();
        drawHeader();
        drawFooter();
        itinY = 130;
      } else {
        // Otherwise, just check if we have enough space
        itinY = checkPageSpace(itinY, wrap.length * 10 + 15, "text");
      }
      
      // Draw the description - ensure text stays within the available width
      doc.text(wrap, margin, itinY);
      
      // Calculate description height based on number of wrapped lines
      const descHeight = wrap.length * 10 + 8;
      itinY += descHeight;
      
      // Add spacing between descriptions within the same day
      if (index < descs.length - 1) {
        itinY += 10;
      }
    });
    
    // Add extra spacing between different days in the itinerary
    itinY += 20;
  });

  drawFooter();

  // --- SUGGESTED HOTELS / RATES / SUPPLEMENTS PAGE ---
  doc.addPage(); 
  drawHeader();

  // Section title helper
  let secY = 130;
  const drawSectionTitle = (txt, estimatedContentHeight = 100) => {
    // Check if we have enough space for the section title and at least some content
    // Force a new page if this section would be split across pages
    secY = checkPageSpace(secY, 30, "heading", true, estimatedContentHeight + 30);
    
    // Smaller, neater styling for all section titles
    doc.setFillColor(240)
       .roundedRect(margin, secY - 14, pageW - 2 * margin, 20, 4, 4, "F") // Smaller rectangle
       .setFont("helvetica", "bold")
       .setFontSize(10)  // Smaller font size for all section titles
       .setTextColor(200, 0, 0)
       .text(txt, pageW / 2, secY - 2, { align: "center" });
    secY += 24; // Reduced spacing
  };

  // Enhanced table helper with pagination and section boundary handling
  const drawTable = (cols, rows) => {
    // Calculate the total height of the table to determine if it fits on the current page
    let totalTableHeight = lineH; // Header height
    
    // Calculate height needed for all rows
    const rowHeights = rows.map(r => {
      let maxLines = 1;
      cols.forEach(c => {
        const wrap = doc.splitTextToSize(String(r[c] || ""), (pageW - 2 * margin) / cols.length - 8);
        if (wrap.length > maxLines) maxLines = wrap.length;
      });
      return Math.max(lineH * 1.2, lineH * 0.8 * maxLines);
    });
    
    totalTableHeight += rowHeights.reduce((sum, h) => sum + h, 0);
    totalTableHeight += 30; // Additional spacing after the table
    
    // Check if we have enough space for the entire table
    // Force a new page if the table would be split across pages with just a few rows
    secY = checkPageSpace(secY, lineH + 30, "table", true, totalTableHeight);
    
    const colW = (pageW - 2 * margin) / cols.length;
    doc.setFont("helvetica","bold").setFontSize(10);
    
    // Draw table header
    cols.forEach((c, i) => {
      const x = margin + i * colW;
      doc.setFillColor(220).rect(x, secY, colW, lineH, "F");
      doc.setTextColor(0).text(c, x + 4, secY + 16);
    });
    secY += lineH;
    
    doc.setFont("helvetica","normal");
    
    // Process each row
    rows.forEach((r, rowIndex) => {
      // Calculate maximum number of wrapped lines in any cell of this row
      let maxLines = 1;
      const wrappedTexts = cols.map(c => {
        const wrap = doc.splitTextToSize(String(r[c] || ""), colW - 8);
        if (wrap.length > maxLines) maxLines = wrap.length;
        return wrap;
      });
      
      // Calculate row height based on content
      const rowH = rowHeights[rowIndex];
      
      // Check if we have enough space for this row
      // If this row would cause a page break and it's not the first row after a header,
      // force a new page to keep the table visually coherent
      const wouldBreakPage = secY + rowH > pageH - footerHeight;
      const isFirstRowAfterHeader = secY === 130 + lineH;
      
      if (wouldBreakPage && !isFirstRowAfterHeader) {
        doc.addPage();
        drawHeader();
        drawFooter();
        secY = 130;
        
        // Redraw the header on the new page
        cols.forEach((c, i) => {
          const x = margin + i * colW;
          doc.setFillColor(220).rect(x, secY, colW, lineH, "F");
          doc.setTextColor(0).text(c, x + 4, secY + 16);
        });
        secY += lineH;
        doc.setFont("helvetica","normal");
      }
      
      // Draw cells with proper height
      cols.forEach((c, i) => {
        const x = margin + i * colW;
        doc.rect(x, secY, colW, rowH);
        const wrap = wrappedTexts[i];
        // Center text vertically in the cell
        const textY = secY + 14 + (rowH - wrap.length * 12) / 2;
        doc.text(wrap, x + 4, textY);
      });
      secY += rowH;
    });
    secY += 30;
  };

  // Suggested Hotels
  // Define columns for hotel tables (removed the option column)
  const hotelCols = [t.property, t.city, t.nights];
  
  // Custom column widths for hotel table (property column gets more space)
  const hotelColWidths = {
    [t.property]: 0.60, // 60% of table width (increased since we removed option column)
    [t.city]: 0.25,     // 25% of table width
    [t.nights]: 0.15    // 15% of table width
  };
  
  // Draw section title for Suggested Hotels
  drawSectionTitle(t.suggestedHotels, 100);
  
  // Enhanced custom table drawing function with pagination, specific column widths, and section boundary handling
  const drawHotelTable = (cols, rows, colWidths, optionTitle = null) => {
    // Calculate the total height of the table to determine if it fits on the current page
    let totalTableHeight = lineH * 0.9; // Header height (slightly reduced)
    
    // Add option title height if provided
    if (optionTitle) {
      totalTableHeight += lineH * 0.9;
    }
    
    const tableWidth = pageW - 2 * margin;
    
    // Calculate height needed for all rows
    const rowHeights = rows.map(r => {
      let maxLines = 1;
      cols.forEach(c => {
        const colW = tableWidth * colWidths[c];
        const wrap = doc.splitTextToSize(String(r[c] || ""), colW - 8);
        if (wrap.length > maxLines) maxLines = wrap.length;
      });
      return Math.max(lineH * 0.9, lineH * 0.7 * maxLines); // Reduced row heights
    });
    
    totalTableHeight += rowHeights.reduce((sum, h) => sum + h, 0);
    totalTableHeight += 30; // Additional spacing after the table
    
    // Check if we have enough space for the entire table
    // Force a new page if the table would be split across pages with just a few rows
    secY = checkPageSpace(secY, lineH + 30, "table", true, totalTableHeight);
    
    // Draw option title if provided
    if (optionTitle) {
      // Consistent styling for option titles
      doc.setFont("helvetica", "bold")
         .setFontSize(10) // Consistent font size for option titles
         .setFillColor(200, 0, 0)
         .rect(margin, secY, tableWidth, lineH, "F")
         .setTextColor(255)
         .text(optionTitle, margin + 10, secY + 16);
      secY += lineH;
    }
    
    // Consistent styling for table headers
    doc.setFont("helvetica", "bold")
       .setFontSize(9) // Consistent font size for all table headers
       .setTextColor(0);
    
    // Draw header function - extracted to reuse when adding new pages
    const drawTableHeader = (yPosition) => {
      let xPos = margin;
      cols.forEach((c) => {
        const colW = tableWidth * colWidths[c];
        doc.setFillColor(220).rect(xPos, yPosition, colW, lineH, "F");
        doc.setTextColor(0).text(c, xPos + 4, yPosition + 16);
        xPos += colW;
      });
      return yPosition + lineH;
    };
    
    // Draw the initial header
    secY = drawTableHeader(secY);
    
    // Draw rows
    // Consistent styling for table content
    doc.setFont("helvetica", "normal")
       .setFontSize(9) // Consistent font size for all table content
       .setTextColor(0);
    rows.forEach((r, rowIndex) => {
      // Calculate maximum number of wrapped lines in any cell of this row
      let maxLines = 1;
      const wrappedTexts = {};
      
      cols.forEach(c => {
        const colW = tableWidth * colWidths[c];
        const wrap = doc.splitTextToSize(String(r[c] || ""), colW - 8);
        if (wrap.length > maxLines) maxLines = wrap.length;
        wrappedTexts[c] = wrap;
      });
      
      // Calculate row height based on content
      const rowH = rowHeights[rowIndex];
      
      // Check if we have enough space for this row
      // If this row would cause a page break and it's not the first row after a header,
      // force a new page to keep the table visually coherent
      const wouldBreakPage = secY + rowH > pageH - footerHeight;
      const isFirstRowAfterHeader = secY === 130 + lineH;
      
      if (wouldBreakPage && !isFirstRowAfterHeader) {
        doc.addPage();
        drawHeader();
        drawFooter();
        secY = 130;
        
        // Redraw the option title if provided
        if (optionTitle) {
          // Consistent styling for option titles when redrawing
          doc.setFont("helvetica", "bold")
             .setFontSize(10) // Consistent font size for option titles
             .setFillColor(200, 0, 0)
             .rect(margin, secY, tableWidth, lineH, "F")
             .setTextColor(255)
             .text(optionTitle, margin + 10, secY + 16);
          secY += lineH;
        }
        
        // Redraw the header on the new page
        secY = drawTableHeader(secY);
        // Consistent styling for table content when redrawing
        doc.setFont("helvetica", "normal")
           .setFontSize(9) // Consistent font size for all table content
           .setTextColor(0);
      }
      
      // Draw cells with proper height
      let xPos = margin;
      cols.forEach(c => {
        const colW = tableWidth * colWidths[c];
        doc.rect(xPos, secY, colW, rowH);
        const wrap = wrappedTexts[c];
        // Center text vertically in the cell
        const textY = secY + 12 + (rowH - wrap.length * 10) / 2; // Adjusted vertical centering
        doc.text(wrap, xPos + 4, textY);
        xPos += colW;
      });
      secY += rowH;
    });
    secY += 20; // Reduced spacing after tables
  };

  // Group Series Optional Activities table (custom layout)
  // Columns: City | Activity | Cost per person | Day | Duration
  const drawGSOptionalTable = (items = []) => {
    const cols = ["City", "Activity", "Cost per person", "Day", "Duration"];
    const colWidths = {
      "City": 0.15,
      "Activity": 0.35,
      "Cost per person": 0.20,
      "Day": 0.15,
      "Duration": 0.15
    };

    const tableWidth = pageW - 2 * margin;

    // Header
    secY = checkPageSpace(secY, lineH + 30, "table", true, lineH + 30);
    doc.setFont("helvetica", "bold").setFontSize(10);
    let xPos = margin;
    cols.forEach((c) => {
      const colW = tableWidth * colWidths[c];
      doc.setFillColor(245).rect(xPos, secY, colW, lineH, "F");
      // Red header text like the sample
      doc.setTextColor(200, 0, 0).text(c, xPos + 4, secY + 16);
      xPos += colW;
    });
    secY += lineH;
    doc.setTextColor(0); // reset

    // Rows
    items.forEach((row, rowIdx) => {
      const isDescRow =
        !row["City"] &&
        !row["Day"] &&
        !row["Duration"] &&
        (!row["Cost per person"] || row["Cost per person"] === "") &&
        !!row["Activity"];

      if (isDescRow) {
        // Description row spanning full width under the activity
        const wrap = doc.splitTextToSize(String(row["Activity"] || ""), tableWidth - 8);
        const rowH = Math.max(lineH, wrap.length * 12 + 10);

        // Page break handling
        if (secY + rowH > pageH - footerHeight) {
          doc.addPage(); drawHeader(); drawFooter(); secY = 130;
          // Redraw header for the table on the new page
          let hx = margin;
          cols.forEach((c) => {
            const colW = tableWidth * colWidths[c];
            doc.setFillColor(245).rect(hx, secY, colW, lineH, "F");
            doc.setTextColor(200, 0, 0).text(c, hx + 4, secY + 16);
            hx += colW;
          });
          secY += lineH;
          doc.setTextColor(0);
        }

        // Draw merged row
        doc.setDrawColor(200);
        doc.rect(margin, secY, tableWidth, rowH);
        doc.setFont("helvetica", "italic").setTextColor(80);
        doc.text(wrap, margin + 4, secY + 14);
        doc.setFont("helvetica", "normal").setTextColor(0);
        secY += rowH;
        return;
      }

      // Normal data row
      const cwCity = tableWidth * colWidths["City"];
      const cwAct  = tableWidth * colWidths["Activity"];
      const cwCost = tableWidth * colWidths["Cost per person"];
      const cwDay  = tableWidth * colWidths["Day"];
      const cwDur  = tableWidth * colWidths["Duration"];

      const cityTxt = String(row["City"] || "");
      const actTxt  = String(row["Activity"] || "");
      const costTxt = String(row["Cost per person"] || "");
      const dayTxt  = String(row["Day"] || "");
      const durTxt  = String(row["Duration"] || "");

      const cityWrap = doc.splitTextToSize(cityTxt, cwCity - 8);
      const actWrap  = doc.splitTextToSize(actTxt, cwAct - 8);
      const costWrap = doc.splitTextToSize(costTxt, cwCost - 8);
      const dayWrap  = doc.splitTextToSize(dayTxt, cwDay - 8);
      const durWrap  = doc.splitTextToSize(durTxt, cwDur - 8);

      // Compute row height
      const maxLines = Math.max(cityWrap.length, actWrap.length, costWrap.length, dayWrap.length, durWrap.length);
      const rowH = Math.max(lineH, 10 * maxLines + 10);

      // Page break handling
      if (secY + rowH > pageH - footerHeight) {
        doc.addPage(); drawHeader(); drawFooter(); secY = 130;
        // Redraw header
        let hx = margin;
        cols.forEach((c) => {
          const colW = tableWidth * colWidths[c];
          doc.setFillColor(245).rect(hx, secY, colW, lineH, "F");
          doc.setTextColor(200, 0, 0).text(c, hx + 4, secY + 16);
          hx += colW;
        });
        secY += lineH;
        doc.setTextColor(0);
      }

      // Draw the row cells
      let x = margin;
      // City
      doc.rect(x, secY, cwCity, rowH);
      doc.text(cityWrap, x + 4, secY + 14);
      x += cwCity;

      // Activity (bold)
      doc.rect(x, secY, cwAct, rowH);
      doc.setFont("helvetica", "bold");
      doc.text(actWrap, x + 4, secY + 14);
      doc.setFont("helvetica", "normal");
      x += cwAct;

      // Cost per person (USD/JOD on multiple lines)
      doc.rect(x, secY, cwCost, rowH);
      doc.text(costWrap, x + 4, secY + 14);
      x += cwCost;

      // Day
      doc.rect(x, secY, cwDay, rowH);
      doc.text(dayWrap, x + 4, secY + 14);
      x += cwDay;

      // Duration
      doc.rect(x, secY, cwDur, rowH);
      doc.text(durWrap, x + 4, secY + 14);

      secY += rowH;
    });

    secY += 20;
  };
  
  // Create separate tables for each option
  // Preserve original option numbering (Option 1/2/3). Skip unticked ones.
  (finalOptions || []).forEach((opt, optIndex) => {
    if ((optIndex === 0 && !showOption1) || (optIndex === 1 && !showOption2) || (optIndex === 2 && !showOption3)) return;
    if (!opt || !Array.isArray(opt.accommodations) || opt.accommodations.length === 0) return;

    // Create option-specific rows
    const optionRows = [];
    for (const a of opt.accommodations) {
      optionRows.push({
        [t.property]: `${a.stars}* ${a.hotelName} ${t.orSimilar}`,
        [t.city]: a.city,
        [t.nights]: a.nights
      });
    }
    if (optionRows.length === 0) return;

    const optionTitle = `${t.option} ${optIndex + 1}`;
    drawHotelTable(hotelCols, optionRows, hotelColWidths, optionTitle);
  });

  // Rates Per Person
  // Create dynamic column headers based on visible options
  const rateColHeaders = [t.pax];
  if (showOption1) rateColHeaders.push(`${t.option} 1`);
  if (showOption2) rateColHeaders.push(`${t.option} 2`);
  if (showOption3) rateColHeaders.push(`${t.option} 3`);
  
  // Calculate dynamic column widths based on visible options
  const visibleOptionCount = [showOption1, showOption2, showOption3].filter(Boolean).length;
  const optionColWidth = visibleOptionCount > 0 ? (0.60 / visibleOptionCount) : 0.20;
  
  const rateColWidths = {
    [t.pax]: 0.40  // 40% for PAX range
  };
  
  // Add widths for visible options
  if (showOption1) rateColWidths[`${t.option} 1`] = optionColWidth;
  if (showOption2) rateColWidths[`${t.option} 2`] = optionColWidth;
  if (showOption3) rateColWidths[`${t.option} 3`] = optionColWidth;
  
  // Limit the number of rate rows to prevent extremely large tables
  const MAX_RATE_ROWS = 8;
  const formatBasePlusSgl = (base, sgl) => {
    const b = Number(base) || 0;
    const s = Number(sgl) || 0;
    if (!(b > 0)) return null;
    const sum = (b + (s > 0 ? s : 0)).toFixed(2);
    return `USD ${sum}`;
  };
  const isOnePaxLabel = (lbl) => {
    const s = String(lbl || "").trim().toLowerCase();
    return s === "1 pax" || s === "1" || s.startsWith("1 pax");
  };
  // Local SGL resolver (kept here to avoid hoist issues)
  const sglForOption = (optIdx) => {
    try {
      const optLocal = finalOptions?.[optIdx] || {};
      const extractFromAcc = (acc) => {
        if (!acc || typeof acc !== "object") return 0;
        let sgl = Number(acc.sglRate || 0);
        if (!Number.isFinite(sgl)) sgl = 0;
        if (sgl === 0 && acc.flatRate) {
          const v = Number(acc.flatRate.sglRate || 0);
          if (Number.isFinite(v) && v > 0) sgl = v;
        }
        if (sgl === 0 && Array.isArray(acc.validityRates)) {
          for (const vr of acc.validityRates) {
            const v = Number(vr?.sglRate || 0);
            if (Number.isFinite(v) && v > 0) { sgl = v; break; }
          }
        }
        return sgl;
      };
      // Prefer accommodations board-aware sum (exclude if SGL selected) x nights
      if (Array.isArray(optLocal.accommodations) && optLocal.accommodations.length > 0) {
        let sglSum = 0;
        for (const acc of optLocal.accommodations) {
          const boardStr = String(acc?.board || "");
          const hasSGL = /SGL/i.test(boardStr);
          if (hasSGL) continue; // not a supplement if SGL selected
          const nights = Number(acc?.nights) || 1;
          const rateSGL = extractFromAcc(acc) || 0;
          if (rateSGL > 0) sglSum += rateSGL * nights;
        }
        if (sglSum > 0) return sglSum;
      }
      // Fallback to option-level field
      let sgl = Number(optLocal.sglSupp || 0);
      if (!Number.isFinite(sgl)) sgl = 0;
      if (sgl > 0) return sgl;
      // Last resort: derive from quotations' accommodations
      if (Array.isArray(quotations)) {
        for (const q of quotations) {
          const qOpt = q?.options?.[optIdx];
          const accs = Array.isArray(qOpt?.accommodations) ? qOpt.accommodations : [];
          for (const acc of accs) {
            const v = extractFromAcc(acc);
            if (v > 0) return v;
          }
        }
      }
      return 0;
    } catch { return 0; }
  };
// 1-PAX specific SGL resolver: always add SGL across accommodations (x nights), ignoring board flags
const sglForOptionOnePax = (optIdx) => {
  try {
    const optLocal = finalOptions?.[optIdx] || {};
    const extractFromAcc = (acc) => {
      if (!acc || typeof acc !== "object") return 0;
      let sgl = Number(acc.sglRate || 0);
      if (!Number.isFinite(sgl)) sgl = 0;
      if (sgl === 0 && acc.flatRate) {
        const v = Number(acc.flatRate.sglRate || 0);
        if (Number.isFinite(v) && v > 0) sgl = v;
      }
      if (sgl === 0 && Array.isArray(acc.validityRates)) {
        for (const vr of acc.validityRates) {
          const v = Number(vr?.sglRate || 0);
          if (Number.isFinite(v) && v > 0) { sgl = v; break; }
        }
      }
      return sgl;
    };
    // Sum across all accommodations without excluding by board
    if (Array.isArray(optLocal.accommodations) && optLocal.accommodations.length > 0) {
      let sglSum = 0;
      for (const acc of optLocal.accommodations) {
        const nights = Number(acc?.nights) || 1;
        const rateSGL = extractFromAcc(acc) || 0;
        if (rateSGL > 0) sglSum += rateSGL * nights;
      }
      if (sglSum > 0) return sglSum;
    }
    // Fallback to option-level field
    let sgl = Number(optLocal.sglSupp || 0);
    if (Number.isFinite(sgl) && sgl > 0) return sgl;
    // Last resort: derive by summing quotations' accommodations
    if (Array.isArray(quotations)) {
      let sglQ = 0;
      for (const q of quotations) {
        const qOpt = q?.options?.[optIdx];
        const accs = Array.isArray(qOpt?.accommodations) ? qOpt.accommodations : [];
        for (const acc of accs) {
          const nights = Number(acc?.nights) || 1;
          const v = extractFromAcc(acc);
          if (v > 0) sglQ += v * nights;
        }
        if (sglQ > 0) break;
      }
      if (sglQ > 0) return sglQ;
    }
    return 0;
  } catch { return 0; }
};
  // Prefer precomputed table if provided by caller (GS Offer page)
  let rateRows = (Array.isArray(data?.ratesPerPersonTable) && data.ratesPerPersonTable.length > 0)
    ? data.ratesPerPersonTable.slice(0, MAX_RATE_ROWS).map(row => {
        const paxVal = row[t.pax] || row["PAX"] || row["Per Person"] || "";
        const onePax = isOnePaxLabel(paxVal);
        const out = { [t.pax]: String(paxVal) };
        const getCell = (idx) => {
          const k = `${t.option} ${idx + 1}`;
          const ek = `Option ${idx + 1}`;
          return row[k] ?? row[ek] ?? "-";
        };
        if (showOption1) {
          const base = parseFloat(String(getCell(0)).replace(/[^0-9.]/g, ""));
          const sgl = sglForOptionOnePax(0);
          out[`${t.option} 1`] = onePax ? (formatBasePlusSgl(base, sgl) || getCell(0)) : getCell(0);
        }
        if (showOption2) {
          const base = parseFloat(String(getCell(1)).replace(/[^0-9.]/g, ""));
          const sgl = sglForOptionOnePax(1);
          out[`${t.option} 2`] = onePax ? (formatBasePlusSgl(base, sgl) || getCell(1)) : getCell(1);
        }
        if (showOption3) {
          const base = parseFloat(String(getCell(2)).replace(/[^0-9.]/g, ""));
          const sgl = sglForOptionOnePax(2);
          out[`${t.option} 3`] = onePax ? (formatBasePlusSgl(base, sgl) || getCell(2)) : getCell(2);
        }
        return out;
      })
    : quotations.slice(0, MAX_RATE_ROWS).map(q => {
        const paxLabel = q?.paxRange ? String(q.paxRange) : getPaxLabel(Number(q?.pax || 0));
        const onePax = Number(q?.pax || 0) === 1 || isOnePaxLabel(paxLabel);
        const row = { [t.pax]: paxLabel };
        (q.options || []).forEach((option, idx) => {
          const totalNum = Number(option?.totalCost);
          const base = Number.isFinite(totalNum) ? totalNum : 0;
          const sgl = sglForOptionOnePax(idx);
          const cell = base ? `USD ${base.toFixed(2)}` : "-";
          const withSgl = onePax ? formatBasePlusSgl(base, sgl) : null;
          if (idx === 0 && showOption1) row[`${t.option} 1`] = withSgl || cell;
          if (idx === 1 && showOption2) row[`${t.option} 2`] = withSgl || cell;
          if (idx === 2 && showOption3) row[`${t.option} 3`] = withSgl || cell;
        });
        return row;
      });
  
  // Estimate the height of the rates table after we have the rows
  const estimatedRatesTableHeight = rateRows.length * lineH * 1.5 + lineH + 30;
  drawSectionTitle(t.ratesPerPerson, estimatedRatesTableHeight);
  
  drawHotelTable(rateColHeaders, rateRows, rateColWidths);

  // Supplements
  // Create dynamic column headers based on visible options
  const supColHeaders = [t.supplement];
  if (showOption1) supColHeaders.push(`${t.option} 1`);
  if (showOption2) supColHeaders.push(`${t.option} 2`);
  if (showOption3) supColHeaders.push(`${t.option} 3`);
  
  // Calculate dynamic column widths based on visible options
  const supColWidths = {
    [t.supplement]: 0.40  // 40% for supplement type
  };
  
  // Add widths for visible options
  if (showOption1) supColWidths[`${t.option} 1`] = optionColWidth;
  if (showOption2) supColWidths[`${t.option} 2`] = optionColWidth;
  if (showOption3) supColWidths[`${t.option} 3`] = optionColWidth;
  
  // Helper to resolve supplements for an option index
  const getSuppForOption = (optIdx) => {
    // Prefer explicit supplements passed by caller (GS Offer page)
    const fromPayload = data?.supplementsByOption && data.supplementsByOption[optIdx];
    if (fromPayload) {
      const sgl = Number(fromPayload.sgl || 0);
      const hb  = Number(fromPayload.hb  || 0);
      return {
        sgl: Number.isFinite(sgl) ? sgl : 0,
        hb:  Number.isFinite(hb)  ? hb  : 0
      };
    }

    // Extractor supporting flatRate and validityRates
    const extractSuppFromAccom = (acc) => {
      if (!acc || typeof acc !== "object") return { sgl: 0, hb: 0 };
      let sgl = Number(acc.sglRate || 0);
      let hb  = Number(acc.hbRate  || 0);
      if (!Number.isFinite(sgl)) sgl = 0;
      if (!Number.isFinite(hb))  hb  = 0;
      // flatRate fallback
      if (sgl === 0 && acc.flatRate) {
        const v = Number(acc.flatRate.sglRate || 0);
        if (Number.isFinite(v) && v > 0) sgl = v;
      }
      if (hb === 0 && acc.flatRate) {
        const v = Number(acc.flatRate.hbRate || 0);
        if (Number.isFinite(v) && v > 0) hb = v;
      }
      // validityRates fallback
      if ((sgl === 0 || hb === 0) && Array.isArray(acc.validityRates)) {
        for (const vr of acc.validityRates) {
          if (sgl === 0) {
            const v = Number(vr?.sglRate || 0);
            if (Number.isFinite(v) && v > 0) sgl = v;
          }
          if (hb === 0) {
            const v = Number(vr?.hbRate || 0);
            if (Number.isFinite(v) && v > 0) hb = v;
          }
          if (sgl > 0 && hb > 0) break;
        }
      }
      return { sgl, hb };
    };
 
    // Board-aware computation from accommodations when available (and multiply by nights)
    // - HB supplements: include only for hotels NOT selected as H/B
    // - SGL supplements: include only for hotels NOT selected as SGL (i.e., exclude "SGL Supplement" and "SGL + HB")
    try {
      const optLocal = finalOptions[optIdx] || {};
      const accsTop = Array.isArray(optLocal?.accommodations) ? optLocal.accommodations : [];
      if (accsTop.length > 0) {
        let hbSum = 0, sglSum = 0;
        for (const acc of accsTop) {
          const { sgl, hb } = extractSuppFromAccom(acc);
          const boardStr = String(acc?.board || "");
          const hasHB  = /H\s*\/?\s*B/i.test(boardStr);
          const hasSGL = /SGL/i.test(boardStr);
          const nights = Number(acc?.nights) || 1;

          // HB is a supplement only when HB was NOT selected at that hotel
          if (!hasHB) {
            const rateHB = Number(hb) || 0;
            if (rateHB > 0) hbSum += rateHB * nights;
          }
          // SGL is a supplement only when SGL was NOT selected at that hotel
          if (!hasSGL) {
            const rateSGL = Number(sgl) || 0;
            if (rateSGL > 0) sglSum += rateSGL * nights;
          }
        }
        return { sgl: sglSum, hb: hbSum };
      }
    } catch (_) {}
 
    // Fall back to top-level options array (if exists)
    const opt = finalOptions[optIdx] || {};
    let sgl = Number(opt.sglSupp || 0);
    let hb  = Number(opt.hbSupp  || 0);
    if (!Number.isFinite(sgl)) sgl = 0;
    if (!Number.isFinite(hb))  hb  = 0;

    // Try accommodations from top-level option
    if ((sgl === 0 || hb === 0) && Array.isArray(opt.accommodations) && opt.accommodations.length > 0) {
      const acc0 = opt.accommodations[0];
      const fromAcc0 = extractSuppFromAccom(acc0);
      if (sgl === 0) sgl = fromAcc0.sgl;
      if (hb  === 0) hb  = fromAcc0.hb;
    }

    // If still zero, attempt deriving from quotations' accommodations
    if ((sgl === 0 || hb === 0) && Array.isArray(quotations)) {
      for (const q of quotations) {
        const qOpt = q?.options?.[optIdx];
        const accs = Array.isArray(qOpt?.accommodations) ? qOpt.accommodations : [];
        for (const acc of accs) {
          const fromAcc = extractSuppFromAccom(acc);
          if (sgl === 0) sgl = fromAcc.sgl;
          if (hb  === 0) hb  = fromAcc.hb;
          if (sgl !== 0 && hb !== 0) break;
        }
        if (sgl !== 0 && hb !== 0) break;
      }
    }
    return { sgl, hb };
  };
  
  // Compute per-option season differences (High - Low) from accommodations' validityRates.dblRate
  const seasonDiffsByOption = (finalOptions || []).map((opt) => {
    let diffSum = 0;
    const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
    accs.forEach((acc) => {
      const vrs = Array.isArray(acc?.validityRates) ? acc.validityRates : [];
      let high = null;
      let low = null;
      vrs.forEach((vr) => {
        const s = String(vr?.season || vr?.Season || "").toLowerCase();
        // Accept common dbl keys
        const raw = vr?.dblRate ?? vr?.Rate_DBL ?? vr?.dbl ?? 0;
        const dbl = parseFloat(raw);
        if (!Number.isFinite(dbl) || dbl <= 0) return;
        if (s.includes("high")) {
          high = high == null ? dbl : Math.max(high, dbl);
        }
        if (s.includes("low")) {
          low = low == null ? dbl : Math.min(low, dbl);
        }
      });
      if (high != null && low != null && high > low) {
        diffSum += (high - low);
      }
    });
    return Number.isFinite(diffSum) && diffSum > 0 ? diffSum : 0;
  });

  // Determine which season deltas are actually relevant per option based on selected seasons
  const seasonFlagsByOption = (finalOptions || []).map((opt) => {
    let hasLow = false, hasHigh = false;
    const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
    accs.forEach(acc => {
      const vrs = Array.isArray(acc?.validityRates) ? acc.validityRates : [];
      vrs.forEach(vr => {
        const s = String(vr?.season || vr?.Season || "").toLowerCase();
        if (s.includes("low")) hasLow = true;
        if (s.includes("high")) hasHigh = true;
      });
    });
    return { hasLow, hasHigh };
  });

  // Build per-option values to show on PDF:
  // - High Season Supplement: show diff only when any Low season is selected in the option
  // - Low Season Reduction:  show diff only when any High season is selected in the option
  let highSeasonSuppByOption = seasonDiffsByOption.map((diff, idx) =>
    (diff > 0 && seasonFlagsByOption[idx]?.hasLow) ? diff : 0
  );
  let lowSeasonReductionByOption = seasonDiffsByOption.map((diff, idx) =>
    (diff > 0 && seasonFlagsByOption[idx]?.hasHigh) ? diff : 0
  );

  // Allow GS wrapper to override with explicitly provided arrays when available
  try {
    if (Array.isArray(data?.highSeasonSuppByOption)) {
      highSeasonSuppByOption = data.highSeasonSuppByOption.map(v => Number(v) || 0);
    }
    if (Array.isArray(data?.lowSeasonReductionByOption)) {
      lowSeasonReductionByOption = data.lowSeasonReductionByOption.map(v => Number(v) || 0);
    }
  } catch (_) {}

  // Create supplement rows with only visible options
  const supRows = [
    { [t.supplement]: t.sglSupplement },
    { [t.supplement]: t.hbSupplement },
    { [t.supplement]: (t.lowSeasonReduction || "Low Season Reduction") },
    { [t.supplement]: (t.highSeasonSupplement || "High Season Supplement") }
  ];
  
  // Add values for visible options using resolver
  if (showOption1) {
    const { sgl, hb } = getSuppForOption(0);
    supRows[0][`${t.option} 1`] = `USD ${Number(sgl || 0).toFixed(2)}`;
    supRows[1][`${t.option} 1`] = `USD ${Number(hb  || 0).toFixed(2)}`;
    const lsr = Number((typeof lowSeasonReductionByOption !== "undefined" ? lowSeasonReductionByOption[0] : 0) || 0);
    const hss = Number((typeof highSeasonSuppByOption !== "undefined" ? highSeasonSuppByOption[0] : 0) || 0);
    supRows[2][`${t.option} 1`] = lsr > 0 ? `USD ${lsr.toFixed(2)}` : "-";
    supRows[3][`${t.option} 1`] = hss > 0 ? `USD ${hss.toFixed(2)}` : "-";
  }
  if (showOption2) {
    const { sgl, hb } = getSuppForOption(1);
    supRows[0][`${t.option} 2`] = `USD ${Number(sgl || 0).toFixed(2)}`;
    supRows[1][`${t.option} 2`] = `USD ${Number(hb  || 0).toFixed(2)}`;
    const lsr = Number((typeof lowSeasonReductionByOption !== "undefined" ? lowSeasonReductionByOption[1] : 0) || 0);
    const hss = Number((typeof highSeasonSuppByOption !== "undefined" ? highSeasonSuppByOption[1] : 0) || 0);
    supRows[2][`${t.option} 2`] = lsr > 0 ? `USD ${lsr.toFixed(2)}` : "-";
    supRows[3][`${t.option} 2`] = hss > 0 ? `USD ${hss.toFixed(2)}` : "-";
  }
  if (showOption3) {
    const { sgl, hb } = getSuppForOption(2);
    supRows[0][`${t.option} 3`] = `USD ${Number(sgl || 0).toFixed(2)}`;
    supRows[1][`${t.option} 3`] = `USD ${Number(hb  || 0).toFixed(2)}`;
    const lsr = Number((typeof lowSeasonReductionByOption !== "undefined" ? lowSeasonReductionByOption[2] : 0) || 0);
    const hss = Number((typeof highSeasonSuppByOption !== "undefined" ? highSeasonSuppByOption[2] : 0) || 0);
    supRows[2][`${t.option} 3`] = lsr > 0 ? `USD ${lsr.toFixed(2)}` : "-";
    supRows[3][`${t.option} 3`] = hss > 0 ? `USD ${hss.toFixed(2)}` : "-";
  }
  
// If Group Series provided itemized HB cells, override HB row presentation
try {
  if (Array.isArray(data?.hbSuppCells)) {
    if (showOption1 && typeof data.hbSuppCells[0] === "string" && data.hbSuppCells[0]) {
      supRows[1][`${t.option} 1`] = data.hbSuppCells[0];
    }
    if (showOption2 && typeof data.hbSuppCells[1] === "string" && data.hbSuppCells[1]) {
      supRows[1][`${t.option} 2`] = data.hbSuppCells[1];
    }
    if (showOption3 && typeof data.hbSuppCells[2] === "string" && data.hbSuppCells[2]) {
      supRows[1][`${t.option} 3`] = data.hbSuppCells[2];
    }
  }
} catch (_) {}
  // Estimate the height of the supplements table after we have the rows
  const estimatedSupplementsTableHeight = supRows.length * lineH * 1.5 + lineH + 30;
  drawSectionTitle(t.supplements, estimatedSupplementsTableHeight);
  
  drawHotelTable(supColHeaders, supRows, supColWidths);
 
  if (isGroupSeries) {
  // --- RESTAURANTS AND OPTIONAL ACTIVITIES PAGES (Group Series enhancement) ---
  try {
    // Prefer structured itinerary rows from the first quotation if available
    // Prefer structured itinerary rows from the first quotation if available.
    // Also accept pre-normalized rows passed in payload (data.itineraryRows),
    // or fall back to parsing the flat itinerary string into minimal day objects.
    let itineraryRows =
      (Array.isArray(data?.itineraryRows) && data.itineraryRows) ||
      ((Array.isArray(quotations) && quotations.length > 0 && Array.isArray(quotations[0]?.itinerary))
        ? quotations[0].itinerary
        : (Array.isArray(itinerary) ? itinerary : []));
    
    // If still empty and itinerary is a string, parse it into structured rows: { day, itinerary }
    if ((!Array.isArray(itineraryRows) || itineraryRows.length === 0) && typeof data?.itinerary === "string") {
      const lines = data.itinerary.split("\n").map(s => s.trim()).filter(Boolean);
      itineraryRows = lines.map((line, i) => {
        const m = /^Day\s*\d+\s*:\s*(.*)$/i.exec(line);
        return {
          day: `Day ${i + 1}`,
          itinerary: m ? m[1] : line,
          transportType: "",       // unknown in this fallback
          mealIncluded: false,     // unknown in this fallback
          lunchRestaurant: "",
          dinnerRestaurant: "",
          guideRequired: false,
          guideLanguage: "English"
        };
      });
    }
 
    // Build restaurants table rows from itineraryRows
    // Helpers to detect city from restaurant name or provided lookup
    const detectCityFromRestaurant = (name) => {
      const n = String(name || "").toLowerCase();
      if (n.includes("amman")) return "Amman";
      if (n.includes("petra")) return "Petra";
      if (n.includes("aqaba")) return "Aqaba";
      if (n.includes("jerash")) return "Jerash";
      if (n.includes("madaba")) return "Madaba";
      if (n.includes("dead sea")) return "Dead Sea";
      if (n.includes("wadi rum") || n.includes("rum")) return "Wadi Rum";
      if (n.includes("um qais") || n.includes("umm qais")) return "Um Qais";
      return "";
    };
    // Fallback: try to infer city from itinerary free-text
    const detectCityFromText = (txt = "") => {
      const s = String(txt).toLowerCase();
      if (s.includes("amman")) return "Amman";
      if (s.includes("petra")) return "Petra";
      if (s.includes("aqaba")) return "Aqaba";
      if (s.includes("jerash")) return "Jerash";
      if (s.includes("madaba")) return "Madaba";
      if (s.includes("dead sea")) return "Dead Sea";
      if (s.includes("wadi rum") || s.includes("rum")) return "Wadi Rum";
      if (s.includes("um qais") || s.includes("umm qais")) return "Um Qais";
      return "";
    };
    const getRestaurantCity = (name) => {
      try {
        if (data && data.restaurantRegionLookup && typeof data.restaurantRegionLookup === "object") {
          return data.restaurantRegionLookup[name] || detectCityFromRestaurant(name);
        }
      } catch (_) {}
      return detectCityFromRestaurant(name);
    };
 
    let restaurantTableRows =
      (Array.isArray(data?.restaurantTableRows) && data.restaurantTableRows.length > 0)
        ? data.restaurantTableRows.slice()
        : [];

    if (restaurantTableRows.length === 0 && Array.isArray(itineraryRows)) {
      itineraryRows.forEach((row, idx) => {
        if (!row) return;
        const dayLabel = row.day || `Day ${idx + 1}`;
        if (row.mealIncluded || row.lunchRestaurant || row.dinnerRestaurant) {
          const itinCity = detectCityFromText(row.itinerary || "");
          const mealTypeNorm = String(row.mealType || "").toLowerCase().trim();
          const wantsLunch = !mealTypeNorm || mealTypeNorm.includes("lunch");
          const wantsDinner = !mealTypeNorm || mealTypeNorm.includes("dinner");

          if (wantsLunch && row.lunchRestaurant) {
            const lunchName = String(row.lunchRestaurant || "");
            const lunchCity = row.city || getRestaurantCity(lunchName) || itinCity;
            restaurantTableRows.push({
              "Day": dayLabel,
              "Restaurant Name": lunchName,
              "Meal Type": "Lunch",
              "City": lunchCity
            });
          }

          if (wantsDinner && row.dinnerRestaurant) {
            const dinnerName = String(row.dinnerRestaurant || "");
            const dinnerCity = row.city || getRestaurantCity(dinnerName) || itinCity;
            restaurantTableRows.push({
              "Day": dayLabel,
              "Restaurant Name": dinnerName,
              "Meal Type": "Dinner",
              "City": dinnerCity
            });
          }
        }
      });
    }
// If no restaurants found but itinerary exists, add a placeholder row to ensure section visibility
if (Array.isArray(itineraryRows) && itineraryRows.length > 0 && restaurantTableRows.length === 0) {
  restaurantTableRows.push({
    "Day": "",
    "Restaurant Name": "No restaurants selected",
    "Meal Type": "",
    "City": ""
  });
}
 
    // Build Transportation & Guide rows from itineraryRows
    const normalizeTransport = (type) => {
      const t = String(type || "").toLowerCase();
      if (!t) return "No";
      if (t.includes("full")) return "Full Day";
      if (t.includes("half")) return "Half Day";
      if (t.includes("transfer")) return "Transfer";
      if (t.includes("stopover") || t.includes("stop-over") || t.includes("stop")) return "Stopover";
      // Preserve original non-empty text if it's something else (e.g., "Coach 45-seater")
      return type || "No";
    };
    const extractTransportRaw = (row) => {
      // Robust fallback across common shapes
      return (
        row.transportType ||
        row.serviceType ||
        row.transportation ||
        row.transport ||
        row.transferType ||
        row.service ||
        ""
      );
    };
    const isGuideSelected = (row) => {
      // Accept boolean true, "yes", "y", "required", or existence of a language string
      if (row.guideRequired === true) return true;
      const gr = String(row.guideRequired ?? "").toLowerCase();
      if (["yes", "y", "true", "required"].includes(gr)) return true;
      if (row.guide === true) return true;
      if (typeof row.guide === "string" && ["yes", "y", "true"].includes(row.guide.toLowerCase())) return true;
      if ((row.guideLanguage || row.guideLang || row.language) && String(row.guideLanguage || row.guideLang || row.language).trim() !== "") return true;
      return false;
    };
    const getGuideLanguage = (row) => {
      return (row.guideLanguage || row.guideLang || row.language || "English");
    };
    const transportGuideRows = [];
    if (Array.isArray(itineraryRows)) {
      itineraryRows.forEach((row, idx) => {
        if (!row) return;
        const dayLabel = row.day || `Day ${idx + 1}`;
        const transport = normalizeTransport(extractTransportRaw(row));
        const hasGuide = isGuideSelected(row);
        // Include rows that actually have transport (not "No") or a guide selected
        if ((transport && transport !== "No") || hasGuide) {
          const guide = hasGuide ? `Yes (${getGuideLanguage(row)})` : "No";
          const transportCell = transport; // Only show the transport type without itinerary/locations
          transportGuideRows.push({
            "Day": dayLabel,
            "Transportation Details": transportCell,
            "Private (Language) Speaking Guide": guide
          });
        }
      });
    }
 
    // If we have restaurants or optional activities data to show, start a new page
    const hasRestaurants = restaurantTableRows.length > 0;
    const hasOptionalActivities = Boolean(
      (Array.isArray(data.optionals) && data.optionals.length > 0) ||
      (data.optionalActivities && typeof data.optionalActivities === "object" && Object.keys(data.optionalActivities).length > 0)
    );
    const hasGSOptionalActivities = Array.isArray(data.optionalActivitiesTable) && data.optionalActivitiesTable.length > 0;
 
    if (hasRestaurants || hasOptionalActivities || hasGSOptionalActivities || transportGuideRows.length > 0) {
      // New page for these sections
      doc.addPage();
      drawHeader();
      secY = 130;

      // Transportation & Guide section FIRST
      if (transportGuideRows.length > 0) {
        const transCols = ["Day", "Transportation Details", "Private (Language) Speaking Guide"];
        const transColWidths = {
          "Day": 0.15,
          "Transportation Details": 0.45,
          "Private (Language) Speaking Guide": 0.40
        };
        drawSectionTitle("Transportation & Guide", Math.min(transportGuideRows.length, 20) * lineH + 80);
        drawHotelTable(transCols, transportGuideRows, transColWidths);
      }

      // Then Restaurants section UNDER the Transportation & Guide table
      if (hasRestaurants) {
        const restCols = ["Day", "Restaurant Name", "Meal Type", "City"];
        const restColWidths = {
          "Day": 0.15,
          "Restaurant Name": 0.45,
          "Meal Type": 0.20,
          "City": 0.20
        };

        drawSectionTitle("Selected Restaurants", Math.min(restaurantTableRows.length, 20) * lineH + 80);
        drawHotelTable(restCols, restaurantTableRows, restColWidths);
      }

      // Optional Activities section LAST
      if (hasOptionalActivities) {
        // Preferred GS layout: City | Activity | Cost per person | Day | Duration
        if (Array.isArray(data.optionalActivitiesTable) && data.optionalActivitiesTable.length > 0) {
          const gsCols = ["City", "Activity", "Cost per person", "Day", "Duration"];
          const gsColWidths = {
            "City": 0.15,
            "Activity": 0.35,
            "Cost per person": 0.20,
            "Day": 0.15,
            "Duration": 0.15
          };

          const rows = [];
          data.optionalActivitiesTable.forEach(item => {
            // Build Cost per person cell:
            // - Prefer per-PAX-range lines if provided (item.paxCosts)
            // - Fallback to single USD/JOD stacked values
            let cost = "";
            if (Array.isArray(item.paxCosts) && item.paxCosts.length > 0) {
              const lines = item.paxCosts.map(pc => {
                const usdTxt = (pc?.usd ?? "") !== "" ? `USD ${Number(pc.usd).toFixed(2)}` : "";
                const jodTxt = (pc?.jod ?? "") !== "" ? `JOD ${Number(pc.jod).toFixed(2)}` : "";
                const joined = [usdTxt, jodTxt].filter(Boolean).join(" / ");
                return joined ? `${pc.label}: ${joined}` : `${pc.label}`;
              });
              cost = lines.join("\n");
            } else {
              const costUSD = (item?.costUSD ?? "") !== "" ? Number(item.costUSD).toFixed(2) : "";
              const costJOD = (item?.costJOD ?? "") !== "" ? Number(item.costJOD).toFixed(2) : "";
              cost = [costUSD && `USD ${costUSD}`, costJOD && `JOD ${costJOD}`].filter(Boolean).join("\n");
            }

            rows.push({
              "City": String(item.city || ""),
              "Activity": String(item.activity || ""),
              "Cost per person": cost,
              "Day": String(item.day || ""),
              "Duration": String(item.duration || "")
            });

            // Add description as a separate full-width row under the activity (spanning via empty cells)
            if (item.description) {
              rows.push({
                "City": "",
                "Activity": String(item.description || ""),
                "Cost per person": "",
                "Day": "",
                "Duration": ""
              });
            }
          });

          drawSectionTitle("Optional Activities", Math.min(rows.length, 20) * lineH + 100);
          drawGSOptionalTable(rows);
        }
        // Fallbacks for legacy shapes
        else if (data.optionalActivities && typeof data.optionalActivities === "object") {
          const optionalRows = [];
          Object.entries(data.optionalActivities).forEach(([dayIndex, activities]) => {
            const di = parseInt(dayIndex, 10);
            const dayLabel = Array.isArray(itineraryRows) && itineraryRows[di]?.day ? itineraryRows[di].day : `Day ${di + 1}`;
            (activities || []).forEach(act => {
              const name = String(act.activityName || "Activity");
              const entrances = Array.isArray(act.entrances) ? act.entrances.join(", ") : (act.entrances || "");
              const extras = Array.isArray(act.extras) ? act.extras.join(", ") : (act.extras || "");
              const experiences = typeof act.experiences === "string" ? act.experiences : "";
              optionalRows.push({
                "Day": dayLabel,
                "Activity": name,
                "Entrances": entrances,
                "Extras": extras,
                "Experiences": experiences
              });
            });
          });

          if (optionalRows.length > 0) {
            const optCols = ["Day", "Activity", "Entrances", "Extras", "Experiences"];
            const optColWidths = {
              "Day": 0.12,
              "Activity": 0.28,
              "Entrances": 0.20,
              "Extras": 0.20,
              "Experiences": 0.20
            };
            drawSectionTitle("Optional Activities", Math.min(optionalRows.length, 20) * lineH + 80);
            drawHotelTable(optCols, optionalRows, optColWidths);
          }
        } else if (Array.isArray(data.optionals) && data.optionals.length > 0) {
          const simpleRows = data.optionals.map(o => ({
            "Activity": String(o.description || "Optional"),
            "Price": (o.price != null && o.price !== "") ? `USD ${Number(o.price || 0).toFixed(2)}` : ""
          }));
          if (simpleRows.length > 0) {
            const simpleCols = ["Activity", "Price"];
            const simpleColWidths = { "Activity": 0.75, "Price": 0.25 };
            drawSectionTitle("Optional Activities", Math.min(simpleRows.length, 20) * lineH + 80);
            drawHotelTable(simpleCols, simpleRows, simpleColWidths);
          }
        }
      }

      drawFooter();
    }
  } catch (e) {
    // Fail gracefully, don't break PDF generation if any data shape is unexpected
    // console.warn("Failed to build restaurants/optionals sections:", e);
  }
}
 
  // --- INCLUSIONS & EXCLUSIONS PAGE ---
  doc.addPage();
  drawHeader();
  // Explicitly draw footer on the inclusions/exclusions page
  drawFooter();

  let y5 = 130;
  const drawList = (arr, heading) => {
    if (!arr.length) return;
    
    // Estimate the total height of this list section
    let estimatedSectionHeight = 16; // Height of the heading
    arr.forEach(line => {
      const wrap = doc.splitTextToSize(line, pageW - 2 * margin);
      const lineHeight = (wrap.length > 1 ? 18 : 12) * 1.2;
      estimatedSectionHeight += lineHeight;
    });
    estimatedSectionHeight += 20; // Additional spacing after the list
    
    // Check if we have enough space for the entire list section
    // Force a new page if this section would be split across pages
    const oldY5 = y5;
    y5 = checkPageSpace(y5, 30, "heading", true, estimatedSectionHeight);
    
    // If a page break occurred, explicitly redraw the footer
    if (y5 !== oldY5 && y5 === 130) {
      // A new page was created, explicitly redraw the footer
      drawFooter();
    }
    
    doc.setFont("helvetica","bold").setTextColor(200,0,0).text(heading, isRTL ? pageW - margin : margin, y5, { align: isRTL ? "right" : "left" });
    y5 += 16;
    
    doc.setFont("helvetica","normal").setTextColor(0);
    arr.forEach((line, index) => {
      const wrap = doc.splitTextToSize(line, pageW - 2 * margin);
      const lineHeight = (wrap.length > 1 ? 18 : 12) * 1.2;
      
      // Check if we have enough space for this item
      const oldY5Inner = y5;
      y5 = checkPageSpace(y5, lineHeight, "text");
      
      // If a page break occurred, explicitly redraw the footer
      if (y5 !== oldY5Inner && y5 === 130) {
        // A new page was created, explicitly redraw the footer
        drawFooter();
      }
      
      doc.text(wrap, isRTL ? pageW - margin : margin, y5, { align: isRTL ? "right" : "left" });
      y5 += lineHeight;
    });
    
    // After each list section, ensure the footer is visible
    drawFooter();
    
    y5 += 20;
  };

  // Process inclusions to add accommodation details, meal plans, auto-insert Petra/Jerash local guides, and handle guide data
  const processInclusions = () => {
    // Create a new array for processed inclusions
    const processedInclusions = [...rawIncArr];

    // Set to track inclusions for deduplication
    const inclusionSet = new Set(rawIncArr.map((inc) => String(inc).toLowerCase().trim()));

    // Process accommodations from the first visible option (typically the selected one)
    if (visibleOptions.length > 0 && visibleOptions[0].accommodations) {
      const accommodations = visibleOptions[0].accommodations;

      // Add accommodation details with meal plans
      accommodations.forEach((accom) => {
        // Format accommodation details
        let mealPlan = "BB"; // Default to Bed & Breakfast
        if (accom.mealPlan) {
          mealPlan = accom.mealPlan;
        } else if (accom.hbRate && accom.hbRate > 0) {
          mealPlan = "HB"; // Half Board
        } else if (accom.fbRate && accom.fbRate > 0) {
          mealPlan = "FB"; // Full Board
        }

        // Create accommodation inclusion text
        const accomText = `${accom.nights} ${accom.nights > 1 ? "nights" : "night"} accommodation at ${accom.stars}* ${accom.hotelName} in ${accom.city} on ${mealPlan} basis`;

        // Check if a similar inclusion already exists
        const accomKey = accomText.toLowerCase().trim();
        if (!inclusionSet.has(accomKey)) {
          processedInclusions.push(accomText);
          inclusionSet.add(accomKey);
        }
      });
    }

    // Auto-insert Local English-Speaking Guide lines for Petra and Jerash when they appear in itinerary
    try {
      const petraGuide =
        "Local English-Speaking Guide in Petra (From the visitor center up to Qaser Al Bint)";
      const jerashGuide = "Local English-Speaking Guide in Jerash (Up to 2 hours)";

      const texts = [];

      // Prefer structured rows from payload
      if (Array.isArray(data?.itineraryRows) && data.itineraryRows.length > 0) {
        data.itineraryRows.forEach((r) => {
          const s =
            String(r?.itinerary || r?.description || r?.route || r?.day || "")
              .trim();
          if (s) texts.push(s);
        });
      } else if (
        Array.isArray(quotations) &&
        quotations.length > 0 &&
        Array.isArray(quotations[0]?.itinerary)
      ) {
        quotations[0].itinerary.forEach((r) => {
          const s =
            String(r?.itinerary || r?.description || r?.route || r?.day || "")
              .trim();
          if (s) texts.push(s);
        });
      }

      // Flat itinerary lines derived earlier
      if (Array.isArray(itinArr) && itinArr.length > 0) {
        itinArr.forEach((l) => {
          const s = String(l || "").trim();
          if (s) texts.push(s);
        });
      }

      // Raw itinerary string as last resort
      if (typeof data?.itinerary === "string" && data.itinerary.trim()) {
        texts.push(data.itinerary.trim());
      }

      const corpus = texts.join(" | ").toLowerCase();
      const hasPetra = corpus.includes("petra");
      const hasJerash = corpus.includes("jerash");

      if (hasPetra && !inclusionSet.has(petraGuide.toLowerCase())) {
        processedInclusions.push(petraGuide);
        inclusionSet.add(petraGuide.toLowerCase());
      }
      if (hasJerash && !inclusionSet.has(jerashGuide.toLowerCase())) {
        processedInclusions.push(jerashGuide);
        inclusionSet.add(jerashGuide.toLowerCase());
      }
    } catch (_) {
      /* fail-safe: do nothing */
    }

    // Process guide data if available (replace generic guide text with specific guide details)
    let hasGuide = false;
    let guideData = null;

    // Check if guide data is available in the options
    if (visibleOptions.length > 0 && visibleOptions[0].guide) {
      guideData = visibleOptions[0].guide;
      hasGuide = true;
    }

    // Process each inclusion to replace default guide text with actual guide data
    if (hasGuide && guideData) {
      for (let i = 0; i < processedInclusions.length; i++) {
        const inc = String(processedInclusions[i] || "");

        // Check if this is a default guide inclusion
        const incLc = inc.toLowerCase();
        if (incLc.includes("local guide") || incLc.includes("english speaking guide")) {
          // Replace with actual guide data
          const guideText = `Services of ${guideData.name}, ${guideData.language}-speaking professional guide`;
          processedInclusions[i] = guideText;
          break; // Only replace the first occurrence
        }
      }
    }

    return processedInclusions;
  };
  
  // Get processed inclusions with accommodation details and guide data
  const incArr = processInclusions();
  
  // Display inclusions and exclusions in their original language
  drawList(incArr, t.inclusions);
  drawList(excArr, t.exclusions);

  // Ensure footer is drawn on the inclusions/exclusions page
  drawFooter();

  // --- TERMS AND CONDITIONS PAGE ---
  doc.addPage();
  drawHeader();
  // Explicitly draw footer on the terms page
  drawFooter();

  let termsY = 130;
  
  // Section title helper for terms page
  const drawTermsTitle = (txt, isRed = false, isBold = true, contentText = "") => {
    // If content text is provided, estimate the total section height
    let estimatedSectionHeight = 40; // Height of the title (increased for safety)
    
    if (contentText) {
      const wrap = doc.splitTextToSize(contentText, pageW - 2 * margin);
      estimatedSectionHeight += wrap.length * 16 + 20; // Increased multiplier and buffer
    }
    
    // Add extra buffer for specific sections that tend to be larger
    if (txt === t.checkInOutTiming) {
      estimatedSectionHeight += 100; // Extra buffer for Check-in/Out Timing Hotels section
    }
    
    // Calculate available space on current page
    const availableSpace = pageH - footerHeight - termsY;
    
    // Force a new page if:
    // 1. This is the Check-in/Out Timing Hotels section (always start on a new page) OR
    // 2. We're close to the bottom of the page (less than 150pt remaining) OR
    // 3. The section height is known and exceeds available space
    if (txt === t.checkInOutTiming || availableSpace < 150 || (estimatedSectionHeight > 0 && estimatedSectionHeight > availableSpace)) {
      doc.addPage();
      drawHeader();
      drawFooter();
      termsY = 130;
    }
    
    doc.setFont("helvetica", isBold ? "bold" : "normal")
       .setTextColor(isRed ? 200 : 0, 0, 0)
       .text(txt, isRTL ? pageW - margin : margin, termsY, { align: isRTL ? "right" : "left" });
    termsY += 20;
  };

  // Enhanced text content helper for terms page with pagination
  const drawTermsContent = (txt, isRed = false, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal")
       .setTextColor(isRed ? 200 : 0, 0, 0);
    
    const wrap = doc.splitTextToSize(txt, pageW - 2 * margin);
    const contentHeight = wrap.length * 14 + 10;
    
    // Check if we have enough space for this content
    // Not marking as a new section since we already handled that in drawTermsTitle
    termsY = checkPageSpace(termsY, contentHeight, "text");
    
    doc.text(wrap, isRTL ? pageW - margin : margin, termsY, { align: isRTL ? "right" : "left" });
    termsY += contentHeight;
  };

  // General Notes
  drawTermsTitle(t.generalNotes, true, true, data.generalNotes || "");
  if (data.generalNotes) {
    drawTermsContent(data.generalNotes);
  }
  
  // Cancellation fees
  drawTermsTitle(t.cancellationFees, false, true, data.cancellationFees || "");
  if (data.cancellationFees) {
    drawTermsContent(data.cancellationFees);
  }
  
  // Booking Process
  const bookingProcessText = data.bookingProcess || "15% Deposit is required to proceed with the booking, deposit amount will be on none-refundable basis, except in international force major conditions.\nUpon setting the programs and dates, we will proceed in booking and send the final confirmations with the hotel's names, which will be guaranteed, along with the deadline dates of the full payment which will be before the cancellation period.";
  drawTermsTitle(t.bookingProcess, false, true, bookingProcessText);
  drawTermsContent(bookingProcessText);
  
  // Validity
  drawTermsTitle(t.validity, false, true);
  
  // Check if we're dealing with Group Series with multiple validity dates
  if (isGroupSeries) {
    // Add debugging logs
    console.log("Group Series is checked");
    console.log("validityFrom:", validityFrom);
    console.log("validityTo:", validityTo);
    console.log("validityDates:", validityDates);
    // Create a table for validity dates
    // Use fixed column titles as requested
    const fromLabel = "From";
    const tillLabel = "Till";
    const validityTableCols = [fromLabel, tillLabel];
    const validityTableColWidths = {
      [t.from || "From"]: 0.5,
      [t.to || "Till"]: 0.5
    };
    
    // Prepare table rows
    const validityTableRows = [];
    
    // Add the main validity dates if they exist
    if (validityFrom && validityTo) {
      try {
        // Use the same labels defined above
        
        const fromDateFormatted = new Date(validityFrom).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const toDateFormatted = new Date(validityTo).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        
        console.log("Main validity dates:", fromDateFormatted, "to", toDateFormatted);
        
        const row = {};
        row[fromLabel] = fromDateFormatted;
        row[tillLabel] = toDateFormatted;
        
        validityTableRows.push(row);
      } catch (error) {
        console.error("Error formatting main validity dates:", error);
      }
    }
    
    // Add additional validity dates
    if (validityDates && Array.isArray(validityDates) && validityDates.length > 0) {
      console.log("Processing additional validity dates:", validityDates.length);
      
      validityDates.forEach((dateRange, index) => {
        if (dateRange && dateRange.from && dateRange.to) {
          try {
            // Use the same labels defined above
            
            const fromDateFormatted = new Date(dateRange.from).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            
            const toDateFormatted = new Date(dateRange.to).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            
            console.log(`Additional date range ${index}:`, fromDateFormatted, "to", toDateFormatted);
            
            const row = {};
            row[fromLabel] = fromDateFormatted;
            row[tillLabel] = toDateFormatted;
            
            validityTableRows.push(row);
          } catch (error) {
            console.error(`Error formatting additional validity date range ${index}:`, error);
          }
        } else {
          console.warn(`Invalid date range at index ${index}:`, dateRange);
        }
      });
    } else {
      console.log("No additional validity dates to process");
    }
    
    // Draw the validity dates table
    if (validityTableRows.length > 0) {
      console.log("Drawing validity table with", validityTableRows.length, "rows");
      // Add more space before the table and ensure we have enough space
      termsY += 10;
      // Force a new page if the validity table would be split across pages
      termsY = checkPageSpace(termsY, 50 + validityTableRows.length * 25, "table", true, 50 + validityTableRows.length * 25 + 20);
      
      // Custom table drawing function for validity dates
      const tableWidth = pageW - 2 * margin;
      const headerHeight = 30;
      const rowHeight = 25;
      
      try {
        // Draw table header
        doc.setFillColor(220);
        doc.rect(margin, termsY, tableWidth, headerHeight, "F");
        
        doc.setFont("helvetica", "bold").setTextColor(0);
        let xPos = margin;
        validityTableCols.forEach(col => {
          const colWidth = tableWidth * validityTableColWidths[col];
          doc.text(col, xPos + colWidth / 2, termsY + 16, { align: "center" });
          xPos += colWidth;
        });
      } catch (error) {
        console.error("Error drawing table header:", error);
      }
      
      termsY += headerHeight;
      
      try {
        // Draw table rows
        doc.setFont("helvetica", "normal");
        validityTableRows.forEach((row, rowIndex) => {
          // Alternate row background colors for better readability
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245);
            doc.rect(margin, termsY, tableWidth, rowHeight, "F");
          }
          
          // Draw cell borders
          doc.setDrawColor(180);
          doc.rect(margin, termsY, tableWidth, rowHeight);
          
          // Draw cell divider
          const midPoint = margin + tableWidth * validityTableColWidths[validityTableCols[0]];
          doc.line(midPoint, termsY, midPoint, termsY + rowHeight);
          
          // Draw cell content
          doc.setTextColor(200, 0, 0); // Red text for dates
          
          // From date
          const fromText = row[fromLabel] || "";
          doc.text(
            fromText,
            margin + tableWidth * validityTableColWidths[validityTableCols[0]] / 2,
            termsY + 14,
            { align: "center" }
          );
          
          // Till date
          const tillText = row[tillLabel] || "";
          doc.text(
            tillText,
            margin + tableWidth * validityTableColWidths[validityTableCols[0]] +
              tableWidth * validityTableColWidths[validityTableCols[1]] / 2,
            termsY + 14,
            { align: "center" }
          );
          
          termsY += rowHeight;
        });
      } catch (error) {
        console.error("Error drawing table rows:", error);
      }
      
      termsY += 20; // Add more space after the table
    }
  } else {
    // For non-group series or single validity date, use the original format
    const fromDate = isGroupSeries && validityFrom
      ? new Date(validityFrom).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
      : data.dateArr
        ? new Date(data.dateArr).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
        : "[arrival date]";
        
    const toDate = isGroupSeries && validityTo
      ? new Date(validityTo).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
      : data.dateDep
        ? new Date(data.dateDep).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
        : "[departure date]";
    
    doc.setFont("helvetica", "normal").setTextColor(0);
    const validityText = t.validityText;
    const validityWidth = doc.getTextWidth(validityText);
    const fromWidth = doc.getTextWidth(fromDate);
    const tillText = t.validityTill;
    const tillWidth = doc.getTextWidth(tillText);
    
    if (isRTL) {
      // For RTL languages (Arabic)
      const totalWidth = validityWidth + fromWidth + tillWidth + doc.getTextWidth(toDate);
      
      // Add to date in red (rightmost for RTL)
      doc.setTextColor(200, 0, 0);
      doc.text(toDate, pageW - margin, termsY, { align: "right" });
      
      // Continue with normal text
      doc.setTextColor(0);
      doc.text(tillText, pageW - margin - doc.getTextWidth(toDate), termsY, { align: "right" });
      
      // Add from date in red
      doc.setTextColor(200, 0, 0);
      doc.text(fromDate, pageW - margin - doc.getTextWidth(toDate) - tillWidth, termsY, { align: "right" });
      
      // Add validity text
      doc.setTextColor(0);
      doc.text(validityText, pageW - margin - doc.getTextWidth(toDate) - tillWidth - fromWidth, termsY, { align: "right" });
    } else {
      // For LTR languages
      doc.text(validityText, margin, termsY);
      
      // Add from date in red
      doc.setTextColor(200, 0, 0);
      doc.text(fromDate, margin + validityWidth, termsY);
      
      // Continue with normal text
      doc.setTextColor(0);
      doc.text(tillText, margin + validityWidth + fromWidth, termsY);
      
      // Add to date in red
      doc.setTextColor(200, 0, 0);
      doc.text(toDate, margin + validityWidth + fromWidth + tillWidth, termsY);
    }
    
    termsY += 20;
  }
  
  // Bookings Guarantee
  const bookingsGuaranteeText = data.bookingsGuarantee || "Cut off dates for rooming lists or a deposit will be requested based on cancellation policy";
  drawTermsTitle(t.bookingsGuarantee, false, true, bookingsGuaranteeText);
  drawTermsContent(bookingsGuaranteeText);
  
  // Rates & Taxes
  const ratesAndTaxesText = data.ratesAndTaxes || "Rates are guaranteed less a change on taxes occurs or an unforseen change in the exchange rates +/- or a change in rates by the suppliers is implemented, which will affect the rates directly and accordingly we will advise the change at least 30 days prior implementing it.";
  drawTermsTitle(t.ratesAndTaxes, false, true, ratesAndTaxesText);
  drawTermsContent(ratesAndTaxesText);
  
  // Children Policy
  const childrenPolicyText = data.childrenPolicy || "0-4.99 free of charge";
  drawTermsTitle(t.childrenPolicy, false, true, childrenPolicyText);
  drawTermsContent(childrenPolicyText);
  
  // Check-in/Out Timing Hotels
  // Determine the check-in/out content first to pass to drawTermsTitle
  let checkInOutContent = "";
  if (data.checkInOutTimes) {
    checkInOutContent = data.checkInOutTimes;
  } else {
    // Extract locations from accommodations if available
    let locations = [];
    if (finalOptions && finalOptions.length > 0 && finalOptions[0].accommodations) {
      locations = [...new Set(finalOptions[0].accommodations.map(acc => acc.city))];
    }
    
    if (locations.length > 0) {
      const firstLocation = locations[0];
      checkInOutContent = t.defaultCheckInOutLocation.replace('{location}', firstLocation);
      
      if (locations.length > 1) {
        const otherLocations = locations.slice(1).join(", ");
        checkInOutContent += "\n" + t.defaultCheckInOutOtherLocations.replace('{locations}', otherLocations);
      }
    } else {
      checkInOutContent = t.defaultCheckInOut;
    }
  }
  
  // Now pass the content to drawTermsTitle
  drawTermsTitle(t.checkInOutTiming, false, true, checkInOutContent);
  
  // Use custom check-in/out times if provided, otherwise generate from locations
  if (data.checkInOutTimes) {
    drawTermsContent(data.checkInOutTimes);
  } else {
    // Extract locations from accommodations if available
    let locations = [];
    if (finalOptions && finalOptions.length > 0 && finalOptions[0].accommodations) {
      locations = [...new Set(finalOptions[0].accommodations.map(acc => acc.city))];
    }
    
    if (locations.length > 0) {
      const firstLocation = locations[0];
      drawTermsContent(t.defaultCheckInOutLocation.replace('{location}', firstLocation));
      
      if (locations.length > 1) {
        const otherLocations = locations.slice(1).join(", ");
        drawTermsContent(t.defaultCheckInOutOtherLocations.replace('{locations}', otherLocations));
      }
    } else {
      drawTermsContent(t.defaultCheckInOut);
    }
  }
  
  // Triple Rooms
  const tripleRoomsText = data.tripleRooms || "Triple rooms in Jordan consist of rollaway beds.\nRate for triple room is the rate for per persin in sharing room multiple by three pax.";
  drawTermsTitle(t.tripleRooms, false, true, tripleRoomsText);
  drawTermsContent(tripleRoomsText);
  
  // Bank Account Details
  doc.setFont("helvetica", "bold").setTextColor(0);
  const bankDetailsText = data.bankAccountDetails || `${t.bankAccountDetails}(Bank Charges to be paid by the sender)\nBeneficiary Name: Travco Group Holding/ Jordan\nBank Adress: UM UTHAINA Branch, Amman, Jordan.\nUSD Currency.\nAccount # US Dollars: 210-194812\nUSD IBAN#: JO81JGBA2100001948120020010000`;
  
  // Calculate the total height needed for the bank details section
  const bankLines = bankDetailsText.split('\n');
  let totalBankDetailsHeight = 40; // Initial height for the section title
  
  bankLines.forEach(line => {
    const wrappedLine = doc.splitTextToSize(line, pageW - 2 * margin);
    totalBankDetailsHeight += wrappedLine.length * 16;
  });
  
  // Check if there's enough space for the entire bank details section
  // If not, start a new page to keep the entire section together
  if (termsY + totalBankDetailsHeight > pageH - footerHeight - 20) {
    doc.addPage();
    drawHeader();
    drawFooter();
    termsY = 130;
  }
  
  // Draw the bank details title
  doc.setFont("helvetica", "bold").setTextColor(0);
  doc.text(t.bankAccountDetails || "Bank Account Details", isRTL ? pageW - margin : margin, termsY, { align: isRTL ? "right" : "left" });
  termsY += 24;
  
  // Draw all bank details lines
  doc.setFont("helvetica", "normal");
  bankLines.forEach(line => {
    // If the line is too long, wrap it
    const wrappedLine = doc.splitTextToSize(line, pageW - 2 * margin);
    doc.text(wrappedLine, isRTL ? pageW - margin : margin, termsY, { align: isRTL ? "right" : "left" });
    termsY += wrappedLine.length * 16;
  });
  
  drawFooter();

  // --- SAVE FILE ---
  
  // Check if the PDF has too many pages and add a warning if needed
  const totalPages = doc.getNumberOfPages();
  if (totalPages > 10) {
    doc.addPage();
    drawHeader();
    
    const warningY = 150;
    doc.setFont("helvetica", "bold").setTextColor(200, 0, 0);
    doc.text(t.pdfSizeWarning || "Warning: This PDF contains a large amount of content",
             pageW / 2, warningY, { align: "center" });
    
    doc.setFont("helvetica", "normal").setTextColor(0);
    doc.text(t.pdfSizeWarningDetails || "Consider reducing the amount of content or splitting it into multiple documents for better readability.",
             pageW / 2, warningY + 30, { align: "center" });
    
    drawFooter();
  }
  
  doc.save(`Travco_Offer_${groupName.replace(/\s+/g,"_")}_${language}_${Date.now()}.pdf`);
}
