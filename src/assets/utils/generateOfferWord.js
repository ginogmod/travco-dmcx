// assets/utils/generateOfferWord.js
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  AlignmentType,
  ImageRun,
  Packer,
  Header,
  Footer,
  ShadingType,
  WidthType,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import translations from "../translations";
import { getTranslatedQuickHint } from "./getTranslatedQuickHint";

// PDF assets reused for visual parity
import headerBanner from "../pdf/headerBanner.png?url";
import footerTravco from "../pdf/footerTravco.png?url";
import qaiaBackground from "../pdf/qaiaBackground.png?url";
import petraImage from "../pdf/petraImage.png?url";

// Signature banners (parity with PDF)
import signShatha from "../signatures/shatha.png?url";
import signOmar from "../signatures/omar.png?url";
import signOsama from "../signatures/osama.png?url";
import signAya from "../signatures/aya.png?url";
import signKhalil from "../signatures/khalil.png?url";
import signLaith from "../signatures/laith.png?url";
import signNejmeh from "../signatures/nejmeh.png?url";
import signNermin from "../signatures/nermin.png?url";
import signYanal from "../signatures/yanal.png?url";

// Colors used to mimic PDF styling
const COLOR_RED = "C80000";
const COLOR_GRAY = "5A5A5A";
const COLOR_LIGHT = "F0F0F0";
const COLOR_HEADER_CELL = "E0E0E0";

// Convert data URL to ArrayBuffer
function dataURLToArrayBuffer(dataURL) {
  try {
    const parts = dataURL.split(",");
    const base64 = parts[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
}

// Lightweight image compression to keep DOCX size under ~2MB
async function compressImageBlob(blob, cfg = {}) {
  const { maxW = 1400, maxH = 1400, mime = "image/jpeg", quality = 0.72 } = cfg;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 1;
          const h = img.naturalHeight || img.height || 1;
          const scale = Math.min(1, maxW / w, maxH / h);
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (out) => {
              URL.revokeObjectURL(url);
              resolve(out || blob);
            },
            mime,
            quality
          );
        } catch {
          URL.revokeObjectURL(url);
          resolve(blob);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(blob);
      };
      img.src = url;
    } catch {
      resolve(blob);
    }
  });
}

// Fetch image, compress, and return ArrayBuffer (supports normal and data URLs) with caching (prevents size bloat)
async function loadImageData(src, fallback = null, opts = {}) {
  try {
    let url = src || fallback;
    if (!url) return null;

    const preset = opts.preset || "photo";
    const presets = {
      photo: { maxW: 1400, maxH: 1400, mime: "image/jpeg", quality: 0.68 },
      thumb: { maxW: 900, maxH: 900, mime: "image/jpeg", quality: 0.72 },
      logo:  { maxW: 800, maxH: 300, mime: "image/jpeg",  quality: 0.8 },
      banner: { maxW: 1200, maxH: 300, mime: "image/png", quality: 1 },
      logoTransparent: { maxW: 900, maxH: 400, mime: "image/png", quality: 1 },
    };
    const cfg = presets[preset] || presets.photo;

    // Simple in-memory cache by URL + preset to avoid duplicating image data in the DOCX package
    loadImageData.cache = loadImageData.cache || new Map();
    const cacheKey = `${preset}|${url}`;
    if (loadImageData.cache.has(cacheKey)) return loadImageData.cache.get(cacheKey);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Image fetch failed");
    const blob = await res.blob();
    const compressed = await compressImageBlob(blob, cfg);
    const buf = await compressed.arrayBuffer();
    loadImageData.cache.set(cacheKey, buf);
    return buf;
  } catch {
    // Fallback to non-compressed bytes if anything fails (CORS, data URL, etc.)
    try {
      let url2 = src || fallback;
      if (!url2) return null;
      if (typeof url2 === "string" && url2.startsWith("data:")) {
        const buf = dataURLToArrayBuffer(url2);
        // cache best-effort
        try {
          loadImageData.cache = loadImageData.cache || new Map();
          loadImageData.cache.set(`data:${(opts.preset || "photo")}|len:${url2.length}`, buf);
        } catch {}
        return buf;
      }
      const res2 = await fetch(url2);
      if (!res2.ok) return null;
      return await res2.arrayBuffer();
    } catch {
      return null;
    }
  }
}

// Build header with Travco banner (full width)
function buildHeader(headerImgData) {
  // Wrap in a full-width white cell to avoid any dark/black background artifacts behind transparent PNGs
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders(),
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFFFFF" },
                borders: noBorders(),
                children: [
                  new Paragraph({
                    spacing: { before: 0, after: 0 },
                    children: headerImgData
                      ? [
                          new ImageRun({
                            data: headerImgData,
                            transformation: { width: 595, height: 95 },
                          }),
                        ]
                      : [],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Build footer with Travco footer left and agency logo right
function buildFooter(footerImgData, agencyLogoData) {
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders(),
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: footerImgData
                  ? [
                      new Paragraph({
                        spacing: { before: 0, after: 0 },
                        children: [
                          new ImageRun({
                            data: footerImgData,
                            transformation: { width: 120, height: 45 },
                          }),
                        ],
                      }),
                    ]
                  : [new Paragraph({ text: "" })],
                borders: noBorders(),
              }),
              new TableCell({
                children: agencyLogoData
                  ? [
                      new Paragraph({
                        spacing: { before: 0, after: 0 },
                        children: [
                          new ImageRun({
                            data: agencyLogoData,
                            transformation: { width: 110, height: 40 },
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ]
                  : [new Paragraph({ text: "" })],
                borders: noBorders(),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Border helpers
function tableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 8, color: "4D4D4D" },           // ~1pt dark gray
    bottom: { style: BorderStyle.SINGLE, size: 8, color: "4D4D4D" },
    left: { style: BorderStyle.SINGLE, size: 8, color: "4D4D4D" },
    right: { style: BorderStyle.SINGLE, size: 8, color: "4D4D4D" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "A6A6A6" }, // inner grid a bit lighter
    insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "A6A6A6" },
  };
}
function noBorders() {
  return {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  };
}

// Section bar (light gray, red text) similar to PDF section titles
function sectionBar(title, bg = COLOR_LIGHT, textColor = COLOR_RED, center = true, fontSize = 20) {
  // Borderless heading paragraph to avoid Word shading artifacts
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, color: textColor, size: fontSize })],
    alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 100, after: 60 },
  });
}

// Cover colored bar (red for group name, gray for agent)
function coverBar(text, bg, color = "FFFFFF") {
  return new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text, bold: true, color, size: 26 })],
              }),
            ],
            shading: { type: ShadingType.CLEAR, color: "auto", fill: bg },
            borders: noBorders(),
          }),
        ],
      }),
    ],
  });
}

// PAX ranges (parity with PDF)
const paxRanges = [
  { min: 1, max: 1, label: "1 PAX" },
  { min: 2, max: 3, label: "2-3 PAX" },
  { min: 4, max: 5, label: "4-5 PAX" },
  { min: 6, max: 7, label: "6-7 PAX" },
  { min: 8, max: 9, label: "8-9 PAX" },
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
  const num = Number(n);
  const rng = paxRanges.find((r) => num >= r.min && num <= r.max);
  return rng ? rng.label : `${num} PAX`;
}

// Build hotels table for a given option index
function buildHotelsTableForOption(t, finalOptions, optIdx) {
  const opt = finalOptions[optIdx];
  const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t.property, bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t.city, bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t.nights, bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
    ],
  });

  const rows = accs.map((a) => {
    const propTxt = `${a?.stars || ""}* ${a?.hotelName || ""} ${t.orSimilar}`;
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(String(propTxt))] }),
        new TableCell({ children: [new Paragraph(String(a?.city || ""))] }),
        new TableCell({ children: [new Paragraph(String(a?.nights || ""))] }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
    borders: tableBorders(),
  });
}

// Rates per Person table
// When a 1 PAX row exists, automatically add SGL supplement to the base rate cells (per option),
// matching the PDF behavior.
function buildRatesTable(t, quotations, visibleOpts, ratesPerPersonTable, finalOptions = []) {
  const headers = [t.pax, ...visibleOpts.map((i) => `${t.option} ${i + 1}`)];
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      })
    ),
  });

  const rowsData = [];

  const isOnePaxLabel = (lbl) => {
    const s = String(lbl || "").trim().toLowerCase();
    return s === "1 pax" || s === "1" || s.startsWith("1 pax");
  };
  const formatBasePlusSgl = (base, sgl) => {
    const b = Number(base) || 0;
    const s = Number(sgl) || 0;
    if (!(b > 0)) return null;
    const sum = (b + (s > 0 ? s : 0)).toFixed(2);
    return `USD ${sum}`;
  };
  // Resolve SGL supplement specifically for 1 PAX math (ignore board flags; always treat SGL as a supplement to add)
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
      // Sum SGL across accommodations x nights (do NOT exclude based on board)
      if (Array.isArray(optLocal.accommodations) && optLocal.accommodations.length > 0) {
        let sglSum = 0;
        for (const acc of optLocal.accommodations) {
          const nights = Number(acc?.nights) || 1;
          const rateSGL = extractFromAcc(acc) || 0;
          if (rateSGL > 0) sglSum += rateSGL * nights;
        }
        if (sglSum > 0) return sglSum;
      }
      // Fallback to top-level SGL on the option
      let sgl = Number(optLocal.sglSupp || 0);
      if (Number.isFinite(sgl) && sgl > 0) return sgl;
      // Last resort: derive from quotations accommodations (sum first option’s accs with nights)
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
    } catch {
      return 0;
    }
  };

  if (Array.isArray(ratesPerPersonTable) && ratesPerPersonTable.length > 0) {
    // The GS wrapper localizes headers; fallback to english keys if needed
    for (const row of ratesPerPersonTable) {
      const cells = [];
      const paxVal = row[t.pax] || row["PAX"] || row["Per Person"] || "";
      const onePax = isOnePaxLabel(paxVal);
      cells.push(String(paxVal));
      visibleOpts.forEach((i) => {
        const key = `${t.option} ${i + 1}`;
        const engKey = `Option ${i + 1}`;
        let cell = String(row[key] || row[engKey] || "-");
        if (onePax) {
          // Parse a numeric base from the cell like "USD 567.36"
          const baseNum = parseFloat(cell.replace(/[^0-9.]/g, ""));
          const sgl = sglForOptionOnePax(i);
          const withSgl = formatBasePlusSgl(baseNum, sgl);
          if (withSgl) cell = withSgl;
        }
        cells.push(cell);
      });
      rowsData.push(cells);
    }
  } else {
    const lim = Math.min(8, quotations.length);
    for (let qi = 0; qi < lim; qi++) {
      const q = quotations[qi];
      const paxLabel = q?.paxRange ? String(q.paxRange) : getPaxLabel(q?.pax || 0);
      const onePax = Number(q?.pax || 0) === 1 || isOnePaxLabel(paxLabel);
      const cells = [paxLabel];
      visibleOpts.forEach((i) => {
        const base = Number(q?.options?.[i]?.totalCost || 0);
        const sgl = sglForOptionOnePax(i);
        const withSgl = onePax ? formatBasePlusSgl(base, sgl) : null;
        cells.push(withSgl ? withSgl : base > 0 ? `USD ${base.toFixed(2)}` : "-");
      });
      rowsData.push(cells);
    }
  }

  const rows = rowsData.map(
    (cells) =>
      new TableRow({
        children: cells.map((v) => new TableCell({ children: [new Paragraph(String(v))] })),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
    borders: tableBorders(),
  });
}

// Supplements table (SGL, HB, Low Season Reduction, High Season Supplement)
// Helper: derive supplements for an option (parity with PDF generator)
function resolveSupplementsForOption(finalOptions, quotations, optIdx) {
  try {
    const optLocal = finalOptions?.[optIdx] || {};

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

    // Board-aware computation from accommodations (multiply by nights)
    if (Array.isArray(optLocal.accommodations) && optLocal.accommodations.length > 0) {
      let hbSum = 0, sglSum = 0;
      for (const acc of optLocal.accommodations) {
        const { sgl, hb } = extractSuppFromAccom(acc);
        const boardStr = String(acc?.board || "");
        const hasHB  = /H\s*\/?\s*B/i.test(boardStr);
        const hasSGL = /SGL/i.test(boardStr); // best-effort detection
        const nights = Number(acc?.nights) || 1;
        if (!hasHB) {
          const rateHB = Number(hb) || 0;
          if (rateHB > 0) hbSum += rateHB * nights;
        }
        if (!hasSGL) {
          const rateSGL = Number(sgl) || 0;
          if (rateSGL > 0) sglSum += rateSGL * nights;
        }
      }
      return { sgl: sglSum, hb: hbSum };
    }

    // Fall back to top-level fields
    let sgl = Number(optLocal.sglSupp || 0);
    let hb  = Number(optLocal.hbSupp  || 0);
    if (!Number.isFinite(sgl)) sgl = 0;
    if (!Number.isFinite(hb))  hb  = 0;

    // Try deriving from quotations if still zero
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
  } catch {
    return { sgl: 0, hb: 0 };
  }
}

function buildSupplementsTable(t, finalOptions, visibleOpts, highSeasonSuppByOption = [], lowSeasonReductionByOption = [], quotations = []) {
  const headers = [t.supplement, ...visibleOpts.map((i) => `${t.option} ${i + 1}`)];
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      })
    ),
  });

  const sglRowCells = [t.sglSupplement];
  const hbRowCells = [t.hbSupplement];
  const lsrRowCells = [t.lowSeasonReduction || "Low Season Reduction"];
  const hssRowCells = [t.highSeasonSupplement || "High Season Supplement"];

  visibleOpts.forEach((i) => {
    const { sgl, hb } = resolveSupplementsForOption(finalOptions, quotations, i);
    sglRowCells.push(`USD ${Number(sgl || 0).toFixed(2)}`);
    hbRowCells.push(`USD ${Number(hb || 0).toFixed(2)}`);

    const lsr = Number(Array.isArray(lowSeasonReductionByOption) ? (lowSeasonReductionByOption[i] || 0) : 0);
    const hss = Number(Array.isArray(highSeasonSuppByOption) ? (highSeasonSuppByOption[i] || 0) : 0);
    lsrRowCells.push(lsr > 0 ? `USD ${lsr.toFixed(2)}` : "-");
    hssRowCells.push(hss > 0 ? `USD ${hss.toFixed(2)}` : "-");
  });

  const mkRow = (cells) =>
    new TableRow({
      children: cells.map((v) => new TableCell({ children: [new Paragraph(String(v))] })),
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, mkRow(sglRowCells), mkRow(hbRowCells), mkRow(lsrRowCells), mkRow(hssRowCells)],
    borders: tableBorders(),
  });
}
// ===== Group Series helpers: Restaurants + Transportation/Guide tables =====
function normalizeItRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((r, i) => ({
    day: r?.day || `Day ${i + 1}`,
    itinerary: r?.itinerary || "",
    transport:
      r?.transportType || r?.serviceType || r?.transportation || r?.transport || "",
    lunch: r?.lunchRestaurant || "",
    dinner: r?.dinnerRestaurant || "",
    guideRequired:
      typeof r?.guideRequired === "boolean"
        ? r.guideRequired
        : ["yes", "y", "true", "required"].includes(String(r?.guideRequired || "").toLowerCase()),
    guideLanguage: r?.guideLanguage || r?.guideLang || r?.language || "",
  }));
}

function buildRestaurantsTableGS(itRows, t) {
  const rows = [];
  itRows.forEach((r) => {
    if (r.lunch) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(r.day))] }),
            new TableCell({ children: [new Paragraph(String(r.lunch))] }),
            new TableCell({ children: [new Paragraph("Lunch")] }),
          ],
        })
      );
    }
    if (r.dinner) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(r.day))] }),
            new TableCell({ children: [new Paragraph(String(r.dinner))] }),
            new TableCell({ children: [new Paragraph("Dinner")] }),
          ],
        })
      );
    }
  });

  if (!rows.length) return null;

  const header = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Day", bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [
          new Paragraph({ children: [new TextRun({ text: "Restaurant Name", bold: true })] }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Meal Type", bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows],
    borders: tableBorders(),
  });
}

function isGuideSelectedRow(r) {
  if (r.guideRequired) return true;
  const gr = String(r.guideRequired || "").toLowerCase();
  if (["yes", "y", "true", "required"].includes(gr)) return true;
  if (r.guideLanguage && String(r.guideLanguage).trim() !== "") return true;
  return false;
}

function buildTransportGuideTableGS(itRows, t) {
  const rows = [];
  itRows.forEach((r) => {
    const hasGuide = isGuideSelectedRow(r);
    const transportCell = r.transport ? String(r.transport) : "";
    if (transportCell || hasGuide) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(r.day))] }),
            new TableCell({ children: [new Paragraph(transportCell)] }),
            new TableCell({
              children: [
                new Paragraph(
                  hasGuide
                    ? `Yes (${r.guideLanguage || "English"})`
                    : "No"
                ),
              ],
            }),
          ],
        })
      );
    }
  });

  if (!rows.length) return null;

  const header = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Day", bold: true })] })],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Transportation Details", bold: true })],
          }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Private (Language) Speaking Guide", bold: true }),
            ],
          }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLOR_HEADER_CELL },
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows],
    borders: tableBorders(),
  });
}
// ===== End GS helpers =====

// Itinerary + QuickHint two-column layout (left text, right images)
function buildItineraryTwoColumn(QuickHint, itinArr, mainImg, s1Img, s2Img, s3Img) {
  const describedLocations = new Set();
  const leftChildren = [];

  const boldRed = (txt) =>
    new Paragraph({
      children: [new TextRun({ text: txt, bold: true, color: COLOR_RED, size: 20 })],
      spacing: { before: 90, after: 40 },
    });

  const normalPara = (txt) =>
    new Paragraph({
      children: [new TextRun({ text: txt, size: 18 })],
      spacing: { before: 40, after: 40 },
    });

  (Array.isArray(itinArr) ? itinArr : []).forEach((line) => {
    if (!String(line || "").trim()) return;
    const parts = String(line).split(":");
    if (parts.length < 1) return;
    leftChildren.push(boldRed(line));

    let route = "";
    if (parts.length >= 2) route = parts.slice(1).join(":").trim();
    const stops = route.split(/[-,&]+/).map((s) => s.trim()).filter(Boolean);
    const descs = [];

    stops.forEach((k) => {
      const normalized = k.toLowerCase();

      // Allow O/N (Overnight) descriptions to repeat across days
      const isOvernightToken = /(^|\b|\s)o\/n(\b|\s|$)/i.test(k);

      // Try to find an exact/partial QuickHint match and capture the matched key
      let hint = QuickHint[k];
      let matchedKey = hint ? k : null;

      if (!hint) {
        const matchingKey = Object.keys(QuickHint).find(
          (f) => normalized.includes(f.toLowerCase()) || f.toLowerCase().includes(normalized)
        );
        if (matchingKey) {
          hint = QuickHint[matchingKey];
          matchedKey = matchingKey;
        }
      }

      // If the matched quick hint key itself indicates O/N, treat as overnight as well
      const isONByKey = matchedKey ? /o\/n/i.test(matchedKey) : false;
      const isON = isOvernightToken || isONByKey;

      // Only suppress duplicates for non O/N items
      if (!isON && describedLocations.has(normalized)) return;

      if (hint && !descs.includes(hint)) {
        descs.push(hint);
        // Track as described only for non O/N so that O/N can repeat across days
        if (!isON) describedLocations.add(normalized);
      }
    });

    descs.forEach((d) => leftChildren.push(normalPara(d)));
  });

  // Right images
  const rightChildren = [];
  if (mainImg) {
    rightChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: mainImg,
            transformation: { width: 350, height: 480 },
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 80 },
      })
    );
  }
  const thumbs = [s1Img, s2Img, s3Img].filter(Boolean);
  if (thumbs.length) {
    rightChildren.push(
      new Paragraph({
        children: thumbs.flatMap((buf, idx) => {
          const runs = [
            new ImageRun({
              data: buf,
              transformation: { width: 94, height: 94 },
            }),
          ];
          if (idx < thumbs.length - 1) runs.push(new TextRun({ text: "  " }));
          return runs;
        }),
        alignment: AlignmentType.RIGHT,
        spacing: { before: 20, after: 0 },
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: leftChildren.length ? leftChildren : [new Paragraph("")],
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            borders: noBorders(),
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: rightChildren.length ? rightChildren : [new Paragraph("")],
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            borders: noBorders(),
          }),
        ],
      }),
    ],
  });
}

// Validity block
function buildValidityBlock(t, isGroupSeries, validityFrom, validityTo, validityDates, dateArr, dateDep) {
  const children = [];
  children.push(
    new Paragraph({
      children: [new TextRun({ text: t.validity, bold: true, size: 22 })],
      spacing: { before: 200, after: 80 },
    })
  );

  if (isGroupSeries) {
    const header = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "From", bold: true })] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Till", bold: true })] })],
        }),
      ],
    });

    const rows = [];

    if (validityFrom && validityTo) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph(
                  new Date(validityFrom).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                ),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph(
                  new Date(validityTo).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                ),
              ],
            }),
          ],
        })
      );
    }

    (Array.isArray(validityDates) ? validityDates : []).forEach((r) => {
      if (!r || !r.from || !r.to) return;
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph(
                  new Date(r.from).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                ),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph(
                  new Date(r.to).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                ),
              ],
            }),
          ],
        })
      );
    });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [header, ...rows],
      borders: tableBorders(),
    });
    children.push(table);
  } else {
    const fromDate = validityFrom
      ? new Date(validityFrom).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : dateArr
      ? new Date(dateArr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "[arrival date]";
    const toDate = validityTo
      ? new Date(validityTo).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : dateDep
      ? new Date(dateDep).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "[departure date]";

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: t.validityText || "The above rates are valid from ", size: 18 }),
          new TextRun({ text: fromDate, color: COLOR_RED, size: 18 }),
          new TextRun({ text: ` ${t.validityTill || "till"} `, size: 18 }),
          new TextRun({ text: toDate, color: COLOR_RED, size: 18 }),
        ],
        spacing: { before: 60, after: 60 },
      })
    );
  }

  return children;
}

// Main generator
export async function generateOfferWord(data) {
  const lang = (data?.language || "english").toLowerCase();
  const t = translations[lang] || translations.english;
  const QuickHint = getTranslatedQuickHint(lang);

  const {
    groupName = "",
    agent = "",
    itinerary = [],
    options = [],
    quotations = [],
    message = "",
    inclusions = [],
    exclusions = [],
    signatureKey = "",
    agencyLogo = "",
    mainImage = "",
    smallImage1 = "",
    smallImage2 = "",
    smallImage3 = "",
    itineraryRows = [],
    isGroupSeries = false,
    validityFrom = "",
    validityTo = "",
    validityDates = [],
    showOption1 = true,
    showOption2 = true,
    showOption3 = true,
    dateArr = "",
    dateDep = "",
    generalNotes = "",
    cancellationFees = "",
    bookingProcess = "",
    bookingsGuarantee = "",
    ratesAndTaxes = "",
    childrenPolicy = "",
    checkInOutTimes = "",
    tripleRooms = "",
    bankAccountDetails = "",
    // Optional arrays provided by GS wrapper
    highSeasonSuppByOption = [],
    lowSeasonReductionByOption = [],
    ratesPerPersonTable = [],
  } = data || {};

  // Options source parity with PDF
  let finalOptions =
    (Array.isArray(options) && options.length
      ? options
      : (Array.isArray(quotations) && quotations.length && Array.isArray(quotations[0]?.options) ? quotations[0].options : [])) || [];

  // Normalize arrays
  const itinArr =
    Array.isArray(itinerary) ? itinerary : typeof itinerary === "string" ? itinerary.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const incArr =
    Array.isArray(inclusions) ? inclusions : typeof inclusions === "string" ? inclusions.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const excArr =
    Array.isArray(exclusions) ? exclusions : typeof exclusions === "string" ? exclusions.split("\n").map((s) => s.trim()).filter(Boolean) : [];

  // Auto-insert Local English-Speaking Guide lines for Petra and Jerash when they appear in the itinerary (applies to normal and GS)
  const processedIncArr = (() => {
    const res = [...incArr];
    const inclusionSet = new Set(res.map((i) => String(i).toLowerCase().trim()));
    try {
      const petraGuide =
        "Local English-Speaking Guide in Petra (From the visitor center up to Qaser Al Bint)";
      const jerashGuide = "Local English-Speaking Guide in Jerash (Up to 2 hours)";

      const texts = [];

      // Prefer structured rows from payload
      if (Array.isArray(itineraryRows) && itineraryRows.length > 0) {
        itineraryRows.forEach((r) => {
          const s = String(r?.itinerary || r?.description || r?.route || r?.day || "").trim();
          if (s) texts.push(s);
        });
      } else if (
        Array.isArray(quotations) &&
        quotations.length > 0 &&
        Array.isArray(quotations[0]?.itinerary)
      ) {
        quotations[0].itinerary.forEach((r) => {
          const s = String(r?.itinerary || r?.description || r?.route || r?.day || "").trim();
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
        res.push(petraGuide);
        inclusionSet.add(petraGuide.toLowerCase());
      }
      if (hasJerash && !inclusionSet.has(jerashGuide.toLowerCase())) {
        res.push(jerashGuide);
        inclusionSet.add(jerashGuide.toLowerCase());
      }
    } catch (_) {
      /* fail-safe */
    }
    return res;
  })();

  // Signature map (parity with PDF)
  const signatureMap = {
    shatha: signShatha,
    omar: signOmar,
    osama: signOsama,
    aya: signAya,
    khalil: signKhalil,
    laith: signLaith,
    nejmeh: signNejmeh,
    nermin: signNermin,
    yanal: signYanal,
  };

  // Load images
  const [headerImg, footerImg, qaiaImg, petraImg, sigImg, agencyLogoImg, mainImg, s1Img, s2Img, s3Img] = await Promise.all([
    loadImageData(headerBanner, null, { preset: "banner" }),
    loadImageData(footerTravco, null, { preset: "banner" }),
    loadImageData(qaiaBackground, null, { preset: "photo" }),
    loadImageData(petraImage, null, { preset: "photo" }),
    signatureKey && signatureMap[signatureKey] ? loadImageData(signatureMap[signatureKey], null, { preset: "logoTransparent" }) : Promise.resolve(null),
    agencyLogo ? loadImageData(agencyLogo, null, { preset: "logoTransparent" }) : Promise.resolve(null),
    loadImageData(mainImage, petraImage, { preset: "photo" }),
    loadImageData(smallImage1, null, { preset: "thumb" }),
    loadImageData(smallImage2, null, { preset: "thumb" }),
    loadImageData(smallImage3, null, { preset: "thumb" }),
  ]);

  const header = buildHeader(headerImg);
  const footer = buildFooter(footerImg, agencyLogoImg);

  // Visible options
  const visibleOpts = [0, 1, 2].filter((i) => (i === 0 && showOption1) || (i === 1 && showOption2) || (i === 2 && showOption3));
  
  // Compute High/Low-season diffs per option (parity with PDF) for the Supplements table
  let computedHighSeasonSuppByOption = [];
  let computedLowSeasonReductionByOption = [];
  try {
    const seasonDiffsByOption = (finalOptions || []).map((opt) => {
      let diffSum = 0;
      const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
      accs.forEach((acc) => {
        const vrs = Array.isArray(acc?.validityRates) ? acc.validityRates : [];
        let high = null;
        let low = null;
        vrs.forEach((vr) => {
          const s = String(vr?.season || vr?.Season || "").toLowerCase();
          const raw = vr?.dblRate ?? vr?.Rate_DBL ?? vr?.dbl ?? 0;
          const dbl = parseFloat(raw);
          if (!Number.isFinite(dbl) || dbl <= 0) return;
          if (s.includes("high")) high = high == null ? dbl : Math.max(high, dbl);
          if (s.includes("low"))  low  = low  == null ? dbl : Math.min(low,  dbl);
        });
        if (high != null && low != null && high > low) diffSum += (high - low);
      });
      return Number.isFinite(diffSum) && diffSum > 0 ? diffSum : 0;
    });
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
    computedHighSeasonSuppByOption = seasonDiffsByOption.map((diff, idx) =>
      (diff > 0 && seasonFlagsByOption[idx]?.hasLow) ? diff : 0
    );
    computedLowSeasonReductionByOption = seasonDiffsByOption.map((diff, idx) =>
      (diff > 0 && seasonFlagsByOption[idx]?.hasHigh) ? diff : 0
    );
    // Allow payload overrides when provided
    try {
      if (Array.isArray(highSeasonSuppByOption) && highSeasonSuppByOption.length) {
        computedHighSeasonSuppByOption = highSeasonSuppByOption.map(v => Number(v) || 0);
      }
      if (Array.isArray(lowSeasonReductionByOption) && lowSeasonReductionByOption.length) {
        computedLowSeasonReductionByOption = lowSeasonReductionByOption.map(v => Number(v) || 0);
      }
    } catch {}
  } catch {}
  
  // Sections begin
  const sections = [];

  // COVER
  sections.push({
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } }, // ~0.5" each side
    headers: { default: header },
    footers: { default: footer },
    children: [
      coverBar(groupName, COLOR_RED, "FFFFFF"),
      new Paragraph({ text: "", spacing: { after: 80 } }),
      coverBar(agent, COLOR_GRAY, "FFFFFF"),
      ...(message
        ? [
            new Paragraph({ text: "", spacing: { before: 400 } }),
            new Paragraph({ children: [new TextRun({ text: message, size: 24 })], spacing: { before: 120, after: 120 } }),
          ]
        : []),
      ...(sigImg
        ? [
            new Paragraph({
              children: [new ImageRun({ data: sigImg, transformation: { width: 500, height: 160 } })],
              spacing: { before: 120 },
            }),
          ]
        : []),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  });

  // ARRIVAL & DEPARTURE (mirrors PDF)
  sections.push({
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
    headers: { default: header },
    footers: { default: footer },
    children: [
      // Clean heading (no cell shading) to avoid highlight artifacts
      sectionBar(t.arrivalAndDeparture || "Arrival and Departure", COLOR_LIGHT, COLOR_RED, false, 22),
      // QAIA hero image
      new Paragraph({
        children: qaiaImg ? [new ImageRun({ data: qaiaImg, transformation: { width: 595, height: 230 } })] : [],
        spacing: { before: 60, after: 100 },
      }),
      // Custom Arrival & Departure content as specified (keep fonts and neat layout)
      // Arrival
      new Paragraph({ children: [new TextRun({ text: "Arrival:", bold: true, size: 22 })], spacing: { before: 90, after: 40 } }),
      new Paragraph({ children: [new TextRun({ text: "Meet & assist Team at Queen Alia airport & procedures:", bold: true, size: 20 })], spacing: { before: 40, after: 20 } }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Our representatives will be having a sign with your Name/Company logo.", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({
            text:
              "Our Representative will be waiting as soon as the clients leave the aircraft as he will collect the passports; finish the visa formalities then lead clients to the luggage before leaving Airport.",
            size: 20,
          }),
        ],
        spacing: { before: 30, after: 30 },
      }),

      // Departure
      new Paragraph({ children: [new TextRun({ text: "Departure:", bold: true, size: 22 })], spacing: { before: 90, after: 40 } }),
      new Paragraph({ children: [new TextRun({ text: "Hotel Check out Procedures:", bold: true, size: 20 })], spacing: { before: 40, after: 20 } }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Our representative’s team will help on the checkout desk at the Hotel if needed", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Set Luggage pick up time from all the rooms day before if requested", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Transfer luggage to the bus and check count.", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),

      // Airport Greetings and check out procedures
      new Paragraph({ children: [new TextRun({ text: "Airport Greetings and check out procedures:", bold: true, size: 22 })], spacing: { before: 90, after: 40 } }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Transfer all the luggage check at the check in point.", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Issue Boarding passes to the clients.", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 20 }),
          new TextRun({ text: "Finish the passports check formalities. By Travco Meet and greet representative.", size: 20 }),
        ],
        spacing: { before: 30, after: 30 },
      }),

      new Paragraph({ children: [new PageBreak()] }),
    ],
  });

  // ITINERARY + QUICK HINT two-column layout (like PDF page)
  sections.push({
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
    headers: { default: header },
    footers: { default: footer },
    children: [buildItineraryTwoColumn(QuickHint, itinArr, mainImg || petraImg, s1Img, s2Img, s3Img), new Paragraph({ children: [new PageBreak()] })],
  });


  // SUGGESTED HOTELS
  const hotelsChildren = [sectionBar(t.suggestedHotels || "Suggested Hotels")];
  visibleOpts.forEach((i) => {
    const hasAcc = Array.isArray(finalOptions?.[i]?.accommodations) && finalOptions[i].accommodations.length > 0;
    if (!hasAcc) return;
    hotelsChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `${t.option} ${i + 1}`, bold: true, color: COLOR_RED, size: 22 })],
        spacing: { before: 120, after: 60 },
      })
    );
    hotelsChildren.push(buildHotelsTableForOption(t, finalOptions, i));
  });

  // RATES PER PERSON
  hotelsChildren.push(sectionBar(t.ratesPerPerson || "Rates Per Person"));
  hotelsChildren.push(buildRatesTable(t, quotations, visibleOpts, ratesPerPersonTable, finalOptions));

  // SUPPLEMENTS
  hotelsChildren.push(sectionBar(t.supplements || "Supplements"));
  hotelsChildren.push(
    buildSupplementsTable(
      t,
      finalOptions,
      visibleOpts,
      computedHighSeasonSuppByOption,
      computedLowSeasonReductionByOption,
      quotations
    )
  );
  hotelsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  if (isGroupSeries) {
    try {
      const itRowsNorm = normalizeItRows(Array.isArray(itineraryRows) ? itineraryRows : []);
      const restTable = buildRestaurantsTableGS(itRowsNorm, t);
      const tgTable = buildTransportGuideTableGS(itRowsNorm, t);

      // Vertically stack all five tables on the same page:
      // Restaurants, Transportation & Guides, Suggested Hotels, Rates Per Person, Supplements
      const combinedChildren = [];
      if (restTable) {
        combinedChildren.push(sectionBar(t.restaurants || "Restaurants"));
        combinedChildren.push(restTable);
      }
      if (tgTable) {
        combinedChildren.push(sectionBar(t.transportationAndGuide || "Transportation & Guides"));
        combinedChildren.push(tgTable);
      }
      // Append Suggested Hotels + Rates + Supplements block (already contains a PageBreak at end)
      combinedChildren.push(...hotelsChildren);

      sections.push({
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
        headers: { default: header },
        footers: { default: footer },
        children: combinedChildren,
      });
    } catch {
      // Fallback to original hotels section only
      sections.push({
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
        headers: { default: header },
        footers: { default: footer },
        children: hotelsChildren,
      });
    }
  } else {
    sections.push({
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
      headers: { default: header },
      footers: { default: footer },
      children: hotelsChildren,
    });
  }

  // INCLUSIONS & EXCLUSIONS
  const incExcChildren = [];
  incExcChildren.push(
    new Paragraph({
      children: [new TextRun({ text: t.inclusions || "Inclusions:", bold: true, color: COLOR_RED, size: 24 })],
      spacing: { before: 140, after: 80 },
    })
  );
  (processedIncArr || []).forEach((line) => {
    incExcChildren.push(new Paragraph({ text: String(line), spacing: { before: 40, after: 40 } }));
  });
  incExcChildren.push(
    new Paragraph({
      children: [new TextRun({ text: t.exclusions || "Exclusions:", bold: true, color: COLOR_RED, size: 24 })],
      spacing: { before: 140, after: 80 },
    })
  );
  (excArr || []).forEach((line) => {
    incExcChildren.push(new Paragraph({ text: String(line), spacing: { before: 40, after: 40 } }));
  });
  incExcChildren.push(new Paragraph({ children: [new PageBreak()] }));

  sections.push({
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
    headers: { default: header },
    footers: { default: footer },
    children: incExcChildren,
  });

  // TERMS & CONDITIONS (General Notes, Cancellation fees, Booking Process, Validity, Bookings Guarantee, Rates & Taxes, Children Policy, Check-in/out, Triple Rooms, Bank Details)
  const termsChildren = [];

  const titleP = (txt) =>
    new Paragraph({
      children: [new TextRun({ text: txt, bold: true, color: COLOR_RED, size: 22 })],
      spacing: { before: 140, after: 80 },
    });

  const bodyP = (txt) => new Paragraph({ text: String(txt), spacing: { before: 40, after: 40 } });

  // General Notes
  termsChildren.push(titleP(t.generalNotes || "General Notes:"));
  if (generalNotes) termsChildren.push(bodyP(generalNotes));

  // Cancellation fees
  termsChildren.push(titleP(t.cancellationFees || "Cancellation fees:"));
  if (cancellationFees) termsChildren.push(bodyP(cancellationFees));

  // Booking Process
  termsChildren.push(titleP(t.bookingProcess || "Booking Process:"));
  termsChildren.push(
    bodyP(
      bookingProcess ||
        "15% Deposit is required to proceed with the booking, deposit amount will be on none-refundable basis, except in international force major conditions.\nUpon setting the programs and dates, we will proceed in booking and send the final confirmations with the hotel's names, which will be guaranteed, along with the deadline dates of the full payment which will be before the cancellation period."
    )
  );

  // Validity
  buildValidityBlock(t, isGroupSeries, validityFrom, validityTo, validityDates, dateArr, dateDep).forEach((node) => termsChildren.push(node));

  // Bookings Guarantee
  termsChildren.push(titleP(t.bookingsGuarantee || "Bookings Guarantee:"));
  termsChildren.push(bodyP(bookingsGuarantee || "Cut off dates for rooming lists or a deposit will be requested based on cancellation policy"));

  // Rates & Taxes
  termsChildren.push(titleP(t.ratesAndTaxes || "Rates & Taxes:"));
  termsChildren.push(
    bodyP(
      ratesAndTaxes ||
        "Rates are guaranteed less a change on taxes occurs or an unforseen change in the exchange rates +/- or a change in rates by the suppliers is implemented, which will affect the rates directly and accordingly we will advise the change at least 30 days prior implementing it."
    )
  );

  // Children Policy
  termsChildren.push(titleP(t.childrenPolicy || "Children Policy:"));
  termsChildren.push(bodyP(childrenPolicy || "0-1.99 free of charge"));

  // Check-in/Out
  termsChildren.push(titleP(t.checkInOutTiming || "Check-in/ Out Timing Hotels:"));
  if (checkInOutTimes) {
    termsChildren.push(bodyP(checkInOutTimes));
  } else {
    // Build from first option's accommodation cities if available
    const cities =
      Array.isArray(finalOptions?.[0]?.accommodations) && finalOptions[0].accommodations.length
        ? [...new Set(finalOptions[0].accommodations.map((a) => a?.city).filter(Boolean))]
        : [];
    if (cities.length > 0) {
      termsChildren.push(bodyP((t.defaultCheckInOutLocation || "* Check-in in {location} at 14:00/ Check-Out from {location} at 12:00 noontime.").replace("{location}", cities[0])));
      if (cities.length > 1) {
        const others = cities.slice(1).join(", ");
        termsChildren.push(bodyP((t.defaultCheckInOutOtherLocations || "* Check-in in {locations} at 14:00 (+/-), checkout from {locations} at 12:00 noontime.").replace("{locations}", others)));
      }
    } else {
      termsChildren.push(bodyP(t.defaultCheckInOut || "* Check-in at 14:00/ Check-Out at 12:00 noontime."));
    }
  }

  // Triple Rooms
  termsChildren.push(titleP(t.tripleRooms || "Triple Rooms:"));
  termsChildren.push(
    bodyP(tripleRooms || "Triple rooms in Jordan consist of rollaway beds.\nRate for triple room is the rate for per persin in sharing room multiple by three pax.")
  );

  // Bank Account Details
  termsChildren.push(titleP(t.bankAccountDetails || "Bank Account Details:"));
  (bankAccountDetails ||
    `${t.bankAccountDetails || "Bank Account Details"}(Bank Charges to be paid by the sender)
Beneficiary Name: Travco Group Holding/ Jordan
Bank Adress: UM UTHAINA Branch, Amman, Jordan.
USD Currency.
Account # US Dollars: 210-194812
USD IBAN#: JO81JGBA2100001948120020010000`)
    .split("\n")
    .forEach((line) => termsChildren.push(bodyP(line)));

  sections.push({
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 } } },
    headers: { default: header },
    footers: { default: footer },
    children: termsChildren,
  });

  const doc = new Document({
    sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Travco_Offer_${String(groupName || "").replace(/\s+/g, "_")}_${Date.now()}.docx`);
}