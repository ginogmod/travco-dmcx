// src/assets/utils/getTranslatedQuickHint.js
import QuickHintEnglish from '../templates/QuickHint.json';
import QuickHintArabic from '../templates/translations/QuickHint_arabic.json';
import QuickHintFrench from '../templates/translations/QuickHint_french.json';
import QuickHintSpanish from '../templates/translations/QuickHint_spanish.json';
import QuickHintGerman from '../templates/translations/QuickHint_german.json';
import AdditionalLocations from '../templates/AdditionalLocations.json';

/**
 * Get the QuickHint data for the specified language
 * @param {string} language - The language to get QuickHint data for (english, arabic, french, spanish, german)
 * @returns {Object} The QuickHint data for the specified language
 */
export function getTranslatedQuickHint(language = 'english') {
  switch (language.toLowerCase()) {
    case 'arabic':
      return QuickHintArabic;
    case 'french':
      return QuickHintFrench;
    case 'spanish':
      return QuickHintSpanish;
    case 'german':
      return QuickHintGerman;
    case 'english':
    default:
      // For English, merge QuickHint and AdditionalLocations
      return { ...QuickHintEnglish, ...AdditionalLocations };
  }
}