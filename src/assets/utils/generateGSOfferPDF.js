/**
* assets/utils/generateGSOfferPDF.js
* Group Series PDF entrypoint. Wraps generateOfferPDF to ensure consistent invocation
* and future GS-specific extensions. This wrapper guarantees the download is triggered.
*/
import { generateOfferPDF } from "./generateOfferPDF";
import translations from "../translations";

/**
* Generate and download the Group Series Offer PDF.
* Ensures isGroupSeries flag is set and guards against missing arrays.
*/
export function generateGSOfferPDF(input = {}) {
  try {
    // Normalize core arrays up-front
    const options = Array.isArray(input.options) ? input.options : [];
    const quotations = Array.isArray(input.quotations) ? input.quotations : [];
    const validityDates = Array.isArray(input.validityDates) ? input.validityDates : [];
    const optionals = Array.isArray(input.optionals) ? input.optionals : [];

    // Helper: pick first non-zero numeric from a list of candidates
    const firstNonZero = (...vals) => {
      for (const v of vals) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) return n;
      }
      return 0;
    };

    // Helper: sanitize numeric-like strings into numbers (remove currency symbols, commas, and spaces)
    const sanitizeNumber = (v) => {
      if (v == null) return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const s = String(v)
        .replace(/USD|JOD|EUR|\$|€|,|\s/gi, "")
        .replace(/^\s*-\s*$/, "0")
        .trim();
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    };

    // Normalize additional images arrays from input (merge aliases and de-dup)
    const normalizeAdditionalImages = (input) => {
      const list = [
        ...(Array.isArray(input?.moreImages) ? input.moreImages : []),
        ...(Array.isArray(input?.additionalImages) ? input.additionalImages : []),
      ]
        .map(s => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
      // De-duplicate while preserving order
      const set = new Set();
      const out = [];
      for (const s of list) {
        if (!set.has(s)) {
          set.add(s);
          out.push(s);
        }
      }
      return {
        additionalImages: out,
        moreImages: out, // pass through both keys for downstream consumers
      };
    };

    // Helper: normalize transport strings into the 4 canonical labels used by the PDF
    const normalizeTransportType = (raw) => {
      const s = String(raw || "").trim().toLowerCase();
      if (!s) return "No";
      if (s.includes("full") || s === "fd" || s.includes("full day")) return "Full Day";
      if (s.includes("half") || s === "hd" || s.includes("half day")) return "Half Day";
      if (s.includes("trans")) return "Transfer";
      if (s.includes("stop")) return "Stop-Over";
      return raw; // leave as-is if custom
    };

    // Helper: derive PAX label when missing (aligns to generator's ranges)
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
    const getPaxLabel = (n) => {
      const num = Number(n);
      if (!Number.isFinite(num) || num <= 0) return "";
      const r = paxRanges.find(r => num >= r.min && num <= r.max);
      return r ? r.label : `${num} PAX`;
    };

    // Choose a reliable options source that actually contains accommodations (to drive Suggested Hotels and Supplements)
    const hasAccomData = (arr) =>
      Array.isArray(arr) && arr.some(o => Array.isArray(o?.accommodations) && o.accommodations.length > 0);
    const firstQuoteOptions =
      (Array.isArray(quotations) && quotations.length > 0 && Array.isArray(quotations[0]?.options))
        ? quotations[0].options
        : [];
    const sourceOptions = hasAccomData(options)
      ? options
      : (hasAccomData(firstQuoteOptions) ? firstQuoteOptions : options);

    // 1) Compute accurate supplements per option (SGL / HB)
    // Priority:
    //   a) explicit option.sglSupp / option.hbSupp
    //   b) first accommodation at option level
    //   c) scan across quotations[any row].options[optIdx].accommodations for first non-zero sglRate/hbRate
    // Helper to extract SGL/HB from an accommodation object supporting flatRate/validityRates
    const extractSuppFromAccom = (acc) => {
      if (!acc || typeof acc !== "object") return { sgl: 0, hb: 0 };
      // Direct fields first
      let sgl = sanitizeNumber(firstNonZero(acc.sglRate));
      let hb  = sanitizeNumber(firstNonZero(acc.hbRate));
      // Flat rate fallback
      if (sgl === 0 && acc.flatRate) sgl = sanitizeNumber(firstNonZero(acc.flatRate.sglRate));
      if (hb  === 0 && acc.flatRate) hb  = sanitizeNumber(firstNonZero(acc.flatRate.hbRate));
      // Validity rates fallback: take first non-zero across all
      if ((sgl === 0 || hb === 0) && Array.isArray(acc.validityRates)) {
        for (const vr of acc.validityRates) {
          if (sgl === 0) sgl = sanitizeNumber(firstNonZero(vr?.sglRate));
          if (hb  === 0) hb  = sanitizeNumber(firstNonZero(vr?.hbRate));
          if (sgl > 0 && hb > 0) break;
        }
      }
      return { sgl, hb };
    };
 
    // Normalize board string
    const normalizeBoard = (b) => String(b || "").replace(/\s+/g, "").toUpperCase();

    // Build supplements per option with HB logic:
    // - If a hotel is selected as H/B, its HB is INCLUDED in the hotel rate, so do NOT count it as a supplement
    // - For hotels left as B/B, HB stays as a supplement
    // We also prepare human-friendly HB cells like "USD 3.00 + USD 3.00" for the Supplements table.
    const hbSuppCells = [];
    const supplementsByOption = sourceOptions.map((opt, optIdx) => {
      // Start with explicit option-level values for SGL only (unchanged by board)
      let sgl = sanitizeNumber(firstNonZero(opt?.sglSupp));

      // SGL: fallbacks as before
      const acc0 = Array.isArray(opt?.accommodations) ? opt.accommodations[0] : undefined;
      if (acc0) {
        const fromAcc0 = extractSuppFromAccom(acc0);
        if (sgl === 0) sgl = fromAcc0.sgl;
      }
      if (sgl === 0) {
        for (const q of quotations) {
          const qOpt = q?.options?.[optIdx];
          const accs = Array.isArray(qOpt?.accommodations) ? qOpt.accommodations : [];
          for (const acc of accs) {
            const fromAcc = extractSuppFromAccom(acc);
            if (sgl === 0) sgl = fromAcc.sgl;
            if (sgl > 0) break;
          }
          if (sgl > 0) break;
        }
      }

      // HB and SGL: recalculate based on board per accommodation (and multiply by nights)
      let hbSum = 0;
      const hbPieces = [];
      let sglSum = 0;
      const accsTop = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
      
      if (accsTop.length > 0) {
        for (const acc of accsTop) {
          const { hb, sgl } = extractSuppFromAccom(acc);
          const nights = Number(acc?.nights) || 1;
          const boardStr = String(acc?.board || "");
          const hasHB  = /H\s*\/?\s*B/i.test(boardStr);
          const hasSGL = /SGL/i.test(boardStr);
          
          // HB supplement is counted only if HB is NOT selected in this hotel
          if (!hasHB) {
            const rate = sanitizeNumber(hb);
            if (rate > 0) {
              const total = rate * nights;
              hbSum += total;
              hbPieces.push({ rate, nights, total });
            }
          }
          
          // SGL supplement is counted only if SGL is NOT selected in this hotel
          if (!hasSGL) {
            const rate = sanitizeNumber(sgl);
            if (rate > 0) {
              sglSum += rate * nights;
            }
          }
        }
        // Override sgl with computed sum when accommodations exist
        sgl = Number.isFinite(Number(sglSum)) ? Number(sglSum) : 0;
      } else {
        // No accommodations at option level, fall back to previous logic
        // Prefer explicit option-level, then quotations scan
        let hb = sanitizeNumber(firstNonZero(opt?.hbSupp));
        if (hb === 0 && acc0) {
          hb = extractSuppFromAccom(acc0).hb;
        }
        if (hb === 0) {
          for (const q of quotations) {
            const qOpt = q?.options?.[optIdx];
            const accs = Array.isArray(qOpt?.accommodations) ? qOpt.accommodations : [];
            for (const acc of accs) {
              const fromAcc = extractSuppFromAccom(acc);
              if (hb === 0) hb = sanitizeNumber(fromAcc.hb);
              if (hb > 0) break;
            }
            if (hb > 0) break;
          }
        }
        hbSum = sanitizeNumber(hb);
        if (hbSum > 0) hbPieces.push(hbSum);
      }

      // Prepare display cell for HB supplements with nights breakdown, e.g. "USD 10.00 x 1 + USD 15.00 x 2 = USD 40.00"
      const hbCell =
        hbPieces.length === 0
          ? "USD 0.00"
          : hbPieces.map(function(p){ return "USD " + Number(p.rate).toFixed(2) + " x " + p.nights; }).join(" + ") + " = USD " + Number(hbSum).toFixed(2);
      hbSuppCells[optIdx] = hbCell;

      return {
        sgl: Number.isFinite(Number(sgl)) ? Number(sgl) : 0,
        hb: Number.isFinite(Number(hbSum)) ? Number(hbSum) : 0
      };
    });

// Option visibility re-evaluation is handled below after declaring showOpt flags

    // 2) Ensure Rates Per Person has totals for each option in each quotation row
    // Build cross-row fallbacks per option index (first non-zero found)
    const fallbackTotalsPerOption = [];
    const scanTotals = (srcQuotations) => {
      srcQuotations.forEach(q => {
        (q?.options || []).forEach((op, idx) => {
          const val = sanitizeNumber(op?.totalCost);
          if (val > 0 && typeof fallbackTotalsPerOption[idx] === "undefined") {
            fallbackTotalsPerOption[idx] = val;
          }
        });
      });
    };
    scanTotals(quotations);

    // Also consider top-level options array as a fallback source
    options.forEach((op, idx) => {
      if (typeof fallbackTotalsPerOption[idx] === "undefined") {
        const v = sanitizeNumber(op?.totalCost);
        if (v > 0) fallbackTotalsPerOption[idx] = v;
      }
    });

    const normalizedQuotations = quotations.map((q) => {
      const qCopy = { ...q, options: Array.isArray(q.options) ? q.options.map(o => ({ ...o })) : [] };

      // Ensure each row has a usable paxRange for display in Rates Per Person
      if (!qCopy.paxRange || String(qCopy.paxRange).trim() === "") {
        if (typeof qCopy.pax === "string" && qCopy.pax.trim()) {
          qCopy.paxRange = qCopy.pax; // e.g., "10-14 PAX"
        } else if (Number.isFinite(Number(qCopy.pax))) {
          const label = getPaxLabel(Number(qCopy.pax));
          if (label) qCopy.paxRange = label;
        }
      }

      // Fill missing/zero totals from cross-option fallbacks
      qCopy.options.forEach((op, idx) => {
        const val = sanitizeNumber(op?.totalCost);
        if (val <= 0) {
          const fallback = sanitizeNumber(fallbackTotalsPerOption[idx]);
          if (fallback > 0) {
            op.totalCost = fallback;
          }
        } else {
          op.totalCost = val; // normalize to number
        }
      });
      return qCopy;
    });

/* After supplements and before building Rates table, ensure option visibility
   reflects actual availability of options with accommodations */
let showOpt1 = input?.showOption1 !== false;
let showOpt2 = input?.showOption2 !== false;
let showOpt3 = input?.showOption3 !== false;

// If caller did not explicitly set visibility, infer from sourceOptions count
try {
  const optCount = Array.isArray(sourceOptions) ? sourceOptions.length : 0;
  if (typeof input?.showOption1 !== "boolean") showOpt1 = optCount >= 1;
  if (typeof input?.showOption2 !== "boolean") showOpt2 = optCount >= 2;
  if (typeof input?.showOption3 !== "boolean") showOpt3 = optCount >= 3;
} catch (_) {}
// 2.5) Build explicit Rates Per Person table for GS (English keys)
// This ensures the Rates table renders even if downstream derivation fails.
// Note: Keys must match PDF headers in english: "PAX", "Option 1/2/3".

let ratesPerPersonTable = normalizedQuotations.map((q) => {
  const row = { PAX: q?.paxRange || "" };
  const opts = Array.isArray(q?.options) ? q.options : [];
  opts.forEach((op, idx) => {
    const val = sanitizeNumber(op?.totalCost);
    const cell = val > 0 ? `USD ${val.toFixed(2)}` : "-";
    if (idx === 0 && showOpt1) row["Option 1"] = cell;
    if (idx === 1 && showOpt2) row["Option 2"] = cell;
    if (idx === 2 && showOpt3) row["Option 3"] = cell;
  });
  // Ensure columns exist even if option is missing in this row
  if (showOpt1 && !("Option 1" in row)) row["Option 1"] = "-";
  if (showOpt2 && !("Option 2" in row)) row["Option 2"] = "-";
  if (showOpt3 && !("Option 3" in row)) row["Option 3"] = "-";
  return row;
});

// If table has no numeric values or quotations are empty, fall back to top-level options/fallback totals
const hasAnyAmount =
  Array.isArray(ratesPerPersonTable) &&
  ratesPerPersonTable.some(r =>
    (showOpt1 && r["Option 1"] && r["Option 1"] !== "-") ||
    (showOpt2 && r["Option 2"] && r["Option 2"] !== "-") ||
    (showOpt3 && r["Option 3"] && r["Option 3"] !== "-")
  );

if (!hasAnyAmount) {
  const fallbackRow = { PAX: "Per Person" };
  const fmt = (v) => {
    const n = sanitizeNumber(v);
    return n > 0 ? `USD ${n.toFixed(2)}` : "-";
  };
  if (showOpt1) fallbackRow["Option 1"] = fmt(fallbackTotalsPerOption[0] ?? options[0]?.totalCost);
  if (showOpt2) fallbackRow["Option 2"] = fmt(fallbackTotalsPerOption[1] ?? options[1]?.totalCost);
  if (showOpt3) fallbackRow["Option 3"] = fmt(fallbackTotalsPerOption[2] ?? options[2]?.totalCost);
  ratesPerPersonTable = [fallbackRow];
}

// 2.55) If caller supplied a prebuilt Rates table (english keys), prefer it
if (Array.isArray(input?.ratesPerPersonTable) && input.ratesPerPersonTable.length > 0) {
  ratesPerPersonTable = input.ratesPerPersonTable;
}

// 2.6) Localize Rates Per Person table keys to current language
const lang = input?.language || "english";
const tt = translations[lang] || translations.english;
const localizedRatesPerPersonTable = (Array.isArray(ratesPerPersonTable) ? ratesPerPersonTable : []).map(row => {
  const out = {};
  // PAX column
  if (Object.prototype.hasOwnProperty.call(row, "PAX")) {
    out[tt.pax] = row["PAX"];
  } else if (Object.prototype.hasOwnProperty.call(row, "Per Person")) {
    // Fallback label when we used a generic row
    out[tt.pax] = row["Per Person"];
  }
  // Options columns (respect visibility flags)
  if (showOpt1 && Object.prototype.hasOwnProperty.call(row, "Option 1")) {
    out[`${tt.option} 1`] = row["Option 1"];
  }
  if (showOpt2 && Object.prototype.hasOwnProperty.call(row, "Option 2")) {
    out[`${tt.option} 2`] = row["Option 2"];
  }
  if (showOpt3 && Object.prototype.hasOwnProperty.call(row, "Option 3")) {
    out[`${tt.option} 3`] = row["Option 3"];
  }
  return out;
});
    // 3) Normalize itinerary rows for Restaurants and Transportation & Guide tables
    // Prefer caller-provided structured rows; otherwise scan all quotations for the first itinerary
    // that actually contains restaurant selections; fallback to the longest itinerary; finally parse flat text.
    const hasRestaurantsInRows = (arr) =>
      Array.isArray(arr) && arr.some(r =>
        (r && typeof r.lunchRestaurant === 'string' && r.lunchRestaurant.trim().length > 0) ||
        (r && typeof r.dinnerRestaurant === 'string' && r.dinnerRestaurant.trim().length > 0)
      );

    // Candidates
    const fromCaller = Array.isArray(input?.itineraryRows) ? input.itineraryRows : [];
    const fromAllQuotes = Array.isArray(quotations)
      ? quotations
          .map(q => (Array.isArray(q?.itinerary) ? q.itinerary : []))
          .filter(a => Array.isArray(a) && a.length > 0)
      : [];
    const fromFirstQuote = (Array.isArray(quotations) && quotations.length > 0 && Array.isArray(quotations[0]?.itinerary))
      ? quotations[0].itinerary
      : [];
    const fromFlat = (typeof input?.itinerary === "string" && input.itinerary.trim())
      ? input.itinerary
          .split("\n")
          .map(s => s.trim())
          .filter(Boolean)
          .map((line, i) => {
            const m = /^Day\s*\d+\s*:\s*(.*)$/i.exec(line);
            return {
              day: `Day ${i + 1}`,
              itinerary: m ? m[1] : line
            };
          })
      : [];

    // Pick best source
    let itineraryRows = [];
    if (hasRestaurantsInRows(fromCaller)) {
      itineraryRows = fromCaller;
    } else {
      const withRestaurants = fromAllQuotes.find(a => hasRestaurantsInRows(a));
      if (withRestaurants && withRestaurants.length > 0) {
        itineraryRows = withRestaurants;
      } else if (Array.isArray(fromCaller) && fromCaller.length > 0) {
        itineraryRows = fromCaller;
      } else if (fromAllQuotes.length > 0) {
        // choose the longest itinerary among quotations if none has restaurants
        itineraryRows = fromAllQuotes.slice().sort((a, b) => b.length - a.length)[0];
      } else if (fromFirstQuote.length > 0) {
        itineraryRows = fromFirstQuote;
      } else {
        itineraryRows = fromFlat;
      }
    }

    // Robust per-row normalization ensuring meals/guide/transport are properly reflected
    const itineraryRowsNormalized = (Array.isArray(itineraryRows) ? itineraryRows : []).map((row, idx) => {
      const transportRaw = row?.transportType ?? row?.serviceType ?? row?.transport ?? "";
      const guideRequired =
        (typeof row?.guideRequired === "boolean" ? row.guideRequired : false) ||
        Boolean(row?.guideName && String(row.guideName).trim().length > 0);

      const guideLanguage = row?.guideLanguage || (guideRequired ? "English" : "");

      // Normalize meal flags from available fields
      const mealTypeNorm = String(row?.mealType || "").toLowerCase().trim();
      const wantsLunch = !mealTypeNorm || mealTypeNorm.includes("lunch");
      const wantsDinner = !mealTypeNorm || mealTypeNorm.includes("dinner");

      const lunchRestaurant = (wantsLunch && typeof row?.lunchRestaurant === "string") ? row.lunchRestaurant : "";
      const dinnerRestaurant = (wantsDinner && typeof row?.dinnerRestaurant === "string") ? row.dinnerRestaurant : "";

      // Derive mealType and mealIncluded if not explicitly set
      let mealType = row?.mealType || "";
      if (!mealType) {
        if (lunchRestaurant && dinnerRestaurant) mealType = "Lunch & Dinner";
        else if (lunchRestaurant) mealType = "Lunch";
        else if (dinnerRestaurant) mealType = "Dinner";
      }
      const mealIncluded = Boolean(row?.mealIncluded || mealType || lunchRestaurant || dinnerRestaurant);

      return {
        day: row?.day || `Day ${idx + 1}`,
        itinerary: row?.itinerary || row?.description || "",
        // Preserve multi-day collapsing metadata for base generator
        multiDayEnabled: Boolean(row?.multiDayEnabled),
        multiDayDays: Array.isArray(row?.multiDayDays) ? row.multiDayDays : [],
        transportType: normalizeTransportType(transportRaw),
        mealIncluded,
        mealType,
        lunchRestaurant: lunchRestaurant || "",
        dinnerRestaurant: dinnerRestaurant || "",
        guideRequired,
        guideLanguage
      };
    });

    // 4) Build computed options with supplements injected (so base renderer picks them up)
    const computedOptions = sourceOptions.map((opt, idx) => {
      const sup = supplementsByOption[idx] || { sgl: 0, hb: 0 };
      return {
        ...opt,
        sglSupp: Number.isFinite(Number(sup.sgl)) ? Number(sup.sgl) : 0,
        hbSupp: Number.isFinite(Number(sup.hb)) ? Number(sup.hb) : 0
      };
    });

    // 4.5) Precompute Selected Restaurants table rows from normalized itinerary
    let restaurantTableRows = [];
    try {
      if (Array.isArray(itineraryRowsNormalized)) {
        itineraryRowsNormalized.forEach((row, idx) => {
          if (!row) return;
          const dayLabel = row.day || `Day ${idx + 1}`;
          const mealTypeNorm = String(row?.mealType || "").toLowerCase().trim();
          const wantsLunch = !mealTypeNorm || mealTypeNorm.includes("lunch");
          const wantsDinner = !mealTypeNorm || mealTypeNorm.includes("dinner");

          if (wantsLunch && row.lunchRestaurant) {
            restaurantTableRows.push({
              "Day": dayLabel,
              "Restaurant Name": String(row.lunchRestaurant || ""),
              "Meal Type": "Lunch",
              "City": String(row.city || "")
            });
          }
          if (wantsDinner && row.dinnerRestaurant) {
            restaurantTableRows.push({
              "Day": dayLabel,
              "Restaurant Name": String(row.dinnerRestaurant || ""),
              "Meal Type": "Dinner",
              "City": String(row.city || "")
            });
          }
        });
      }
      if (Array.isArray(itineraryRowsNormalized) && itineraryRowsNormalized.length > 0 && restaurantTableRows.length === 0) {
        restaurantTableRows.push({
          "Day": "",
          "Restaurant Name": "No restaurants selected",
          "Meal Type": "",
          "City": ""
        });
      }
    } catch (_) {}

    // Compute High Season Supplement / Low Season Reduction using hotelRates from localStorage when available
    // This mirrors the UI logic (manual mode panel) so the PDF reflects the visible values in the builder.
    const loadHotelRatesFromLS = () => {
      try {
        if (typeof localStorage === "undefined") return [];
        const raw = localStorage.getItem("hotelRates");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(r => ({
          City: r.City,
          Stars: r.Stars,
          Hotel: r.Hotel,
          Season: r.Season || r.season || "",
          Rate_DBL: parseFloat(r.Rate_DBL || r.DBL || r.dbl || r.DblRate || 0)
        })) : [];
      } catch (_) { return []; }
    };
    const hotelRatesLS = loadHotelRatesFromLS();

    const getHighLowForHotel = (city, stars, hotel) => {
      const list = hotelRatesLS.filter(r =>
        r && r.City === city && String(r.Stars) === String(stars) && r.Hotel === hotel
      );
      let high = null, low = null;
      list.forEach(r => {
        const s = String(r.Season || "").toLowerCase();
        const dbl = Number(r.Rate_DBL) || 0;
        if (!(dbl > 0)) return;
        if (s.includes("high")) high = (high == null) ? dbl : Math.max(high, dbl);
        if (s.includes("low"))  low  = (low  == null) ? dbl : Math.min(low,  dbl);
      });
      return { high, low };
    };

    // For each option determine if any Low/High season is selected in its accommodations
    const seasonFlagsByOption = (sourceOptions || []).map(opt => {
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

    // Compute per-option deltas from hotelRates: sum of (High DBL − Low DBL) across accommodations that have both
    const seasonDiffsByOption = (sourceOptions || []).map(opt => {
      let sum = 0;
      const accs = Array.isArray(opt?.accommodations) ? opt.accommodations : [];
      accs.forEach(acc => {
        const { high, low } = getHighLowForHotel(acc?.city, acc?.stars, acc?.hotelName);
        if (high != null && low != null && high > low) sum += (high - low);
      });
      return Number.isFinite(sum) && sum > 0 ? sum : 0;
    });

    // Map to rows to show:
    // - High Season Supplement is relevant when any Low season was used in the option
    // - Low Season Reduction is relevant when any High season was used in the option
    let highSeasonSuppByOption = seasonDiffsByOption.map((diff, idx) =>
      (diff > 0 && seasonFlagsByOption[idx]?.hasLow) ? diff : 0
    );
    let lowSeasonReductionByOption = seasonDiffsByOption.map((diff, idx) =>
      (diff > 0 && seasonFlagsByOption[idx]?.hasHigh) ? diff : 0
    );

    // Build final payload (let base renderer construct the localized Rates table from quotations)
    const { additionalImages, moreImages } = normalizeAdditionalImages(input);
    const payload = {
      ...input,
      isGroupSeries: true,
      // Ensure language defaults to english for column key alignment
      language: input?.language || "english",
      // Ensure options visibility tracks actual availability unless explicitly set by caller
      showOption1: showOpt1,
      showOption2: showOpt2,
      showOption3: showOpt3,
      // Additional images to be used by itinerary continuation pages ("More Photos" section)
      additionalImages,
      moreImages,
      // Force-feed a prebuilt Rates Per Person table so GS always renders this section
      ratesPerPersonTable: Array.isArray(localizedRatesPerPersonTable) ? localizedRatesPerPersonTable : [],
      // Only pass options when they actually contain accommodations; otherwise let base renderer derive from quotations[0]
      options: hasAccomData(computedOptions) ? computedOptions : [],
      quotations: normalizedQuotations,
      validityDates,
      optionals,
      supplementsByOption,   // still include for forward-compat
      hbSuppCells,           // HB breakdown text per option for Supplements table
      // Override arrays used by base generator to populate the two extra Supplement rows
      highSeasonSuppByOption,
      lowSeasonReductionByOption,
      itineraryRows: itineraryRowsNormalized,
      restaurantTableRows
    };

    // Debug: surface what we're about to render for GS offer PDF
    try {
      console.log("[GS-PDF] normalizedQuotations:", normalizedQuotations);
      console.log("[GS-PDF] ratesPerPersonTable:", payload.ratesPerPersonTable);
      console.log("[GS-PDF] supplementsByOption:", supplementsByOption);
      console.log("[GS-PDF] showOption flags:", {
        showOption1: payload.showOption1,
        showOption2: payload.showOption2,
        showOption3: payload.showOption3
      });
    } catch (_) {}

    // Call the underlying PDF generator; it will perform doc.save(...)
    generateOfferPDF(payload);
  } catch (err) {
    // Fail gracefully but surface details in console
    console.error("generateGSOfferPDF failed:", err);
    try {
      alert("Failed to generate PDF. Check console for details.");
    } catch (_) {
      /* ignore alert issues in non-browser contexts */
    }
  }
}