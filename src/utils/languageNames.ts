/**
 * Map language codes to full language names
 * Source: Wiktionary language codes
 */

export const LANGUAGE_NAMES: Record<string, string> = {
  // Modern languages
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'he': 'Hebrew',
  'ko': 'Korean',
  'el': 'Greek',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',

  // Historical/Old languages
  'enm': 'Middle English',
  'ang': 'Old English',
  'frm': 'Middle French',
  'fro': 'Old French',
  'goh': 'Old High German',
  'gmh': 'Middle High German',
  'gml': 'Middle Low German',
  'osx': 'Old Saxon',
  'odt': 'Old Dutch',
  'dum': 'Middle Dutch',
  'non': 'Old Norse',
  'gmq-osw': 'Old Swedish',
  'gmq-oda': 'Old Danish',
  'la': 'Latin',
  'VL': 'Vulgar Latin',
  'grc': 'Ancient Greek',
  'grc-koi': 'Koine Greek',
  'sa': 'Sanskrit',
  'peo': 'Old Persian',
  'fa': 'Persian',
  'ae': 'Avestan',

  // Proto-languages
  'ine-pro': 'Proto-Indo-European',
  'gem-pro': 'Proto-Germanic',
  'gmw-pro': 'Proto-West Germanic',
  'gmq-pro': 'Proto-Norse',
  'gml-pro': 'Proto-Germanic',
  'itc-pro': 'Proto-Italic',
  'cel-pro': 'Proto-Celtic',
  'sla-pro': 'Proto-Slavic',
  'ira-pro': 'Proto-Iranian',
  'iir-pro': 'Proto-Indo-Iranian',
  'grk-pro': 'Proto-Hellenic',
  'roa-opt': 'Old Portuguese',
  'roa-pro': 'Proto-Romance',

  // Celtic languages
  'ga': 'Irish',
  'gd': 'Scottish Gaelic',
  'cy': 'Welsh',
  'br': 'Breton',
  'kw': 'Cornish',
  'sga': 'Old Irish',
  'mga': 'Middle Irish',

  // Slavic languages
  'cu': 'Old Church Slavonic',
  'orv': 'Old East Slavic',
  'be': 'Belarusian',
  'uk': 'Ukrainian',
  'bg': 'Bulgarian',
  'mk': 'Macedonian',
  'sr': 'Serbian',
  'hr': 'Croatian',
  'sl': 'Slovenian',
  'sk': 'Slovak',

  // Romance languages
  'ca': 'Catalan',
  'gl': 'Galician',
  'an': 'Aragonese',
  'oc': 'Occitan',
  'sc': 'Sardinian',

  // Others
  'sq': 'Albanian',
  'hy': 'Armenian',
  'ka': 'Georgian',
  'eu': 'Basque',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'yi': 'Yiddish',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'sw': 'Swahili',
  'af': 'Afrikaans',
};

/**
 * Get full language name from code, with fallback to code if not found
 */
export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code;
}
