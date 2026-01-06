export const languageColors: Record<string, string> = {
  // Germanic languages - Blue shades
  'eng': '#3b82f6',
  'ang': '#60a5fa',
  'gem-pro': '#93c5fd',

  // Romance languages - Red/Pink shades
  'spa': '#ef4444',
  'lat': '#f87171',
  'lat-med': '#fca5a5',

  // Slavic languages - Green shades
  'rus': '#22c55e',
  'pol': '#4ade80',

  // Indo-Iranian languages - Yellow/Orange shades
  'san': '#f59e0b',
  'hin': '#fbbf24',

  // Semitic languages - Purple shades
  'ara': '#a855f7',
  'heb': '#c084fc',

  // Ancient/Proto languages - Gray shades
  'ine-pro': '#6b7280',
  'proto': '#9ca3af',

  // Default
  'default': '#94a3b8'
};

export function getLanguageColor(languageCode: string): string {
  return languageColors[languageCode] || languageColors['default'];
}

export function getLanguageFamily(languageCode: string): string {
  if (['eng', 'ang', 'gem-pro'].includes(languageCode)) {
    return 'Germanic';
  }
  if (['spa', 'lat', 'lat-med'].includes(languageCode)) {
    return 'Romance';
  }
  if (['rus', 'pol'].includes(languageCode)) {
    return 'Slavic';
  }
  if (['san', 'hin'].includes(languageCode)) {
    return 'Indo-Iranian';
  }
  if (['ara', 'heb'].includes(languageCode)) {
    return 'Semitic';
  }
  if (['ine-pro', 'gem-pro'].includes(languageCode)) {
    return 'Proto';
  }
  return 'Other';
}
