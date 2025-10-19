# Translation System for Offer PDFs

This directory contains translation files for generating offer PDFs in multiple languages.

## Available Languages

- English (default)
- Arabic (with RTL support)
- French
- Spanish
- German

## How to Use

The translation system is integrated with the PDF generation utility. When generating a PDF, simply pass the desired language code to the `generateOfferPDF` function:

```javascript
import { generateOfferPDF } from "../../assets/utils/generateOfferPDF";

// Generate PDF in English (default)
generateOfferPDF({
  // other data...
  language: "english"
});

// Generate PDF in Arabic
generateOfferPDF({
  // other data...
  language: "arabic"
});

// Other supported languages: "french", "spanish", "german"
```

## How It Works

1. The `generateOfferPDF` function accepts a `language` parameter
2. It loads the appropriate translation file from the translations directory
3. For Arabic, it automatically enables right-to-left (RTL) text direction
4. All static text in the PDF is replaced with translated versions

## Translation Files Structure

Each language file exports an object with translation keys and values. The structure is consistent across all language files:

```javascript
export default {
  // Optional RTL direction (only for Arabic)
  "direction": "rtl",
  
  // PDF Sections
  "arrivalAndDeparture": "Arrival and Departure",
  "arrival": "Arrival:",
  // ... other translations
}
```

## Adding a New Language

To add a new language:

1. Create a new file in this directory (e.g., `italian.js`)
2. Copy the structure from `english.js`
3. Translate all values to the new language
4. Add RTL support if needed (for RTL languages like Hebrew or Farsi)
5. Import and add the new language in `index.js`

## RTL Support

For right-to-left languages like Arabic, add the `"direction": "rtl"` property to the translation object. The PDF generation utility will automatically handle text alignment and direction.

## Maintenance

When updating the PDF generation utility with new text elements:

1. Add the new text as a translation key in all language files
2. Use the translation key in the PDF generation code instead of hardcoded text
3. Test the PDF generation in all supported languages

## Example

```javascript
// Before (hardcoded text)
doc.text("Arrival and Departure", margin + 10, 138);

// After (using translation)
doc.text(t.arrivalAndDeparture, margin + 10, 138);