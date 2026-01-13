/**
 * API client for etymology database queries
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface WordSearchResult {
  word: string;
  language: string;
  lang_code: string;
  pos: string;
}

export interface WordEntry {
  word: string;
  language: string;
  lang_code: string;
  pos: string;
  etymology_text: string | null;
  etymology_templates: any[] | null;
  categories: string[] | null;
  senses: any[] | null;
  full_data: any | null;
}

export interface EtymologyRelationship {
  word: string;
  language: string;
  type: string;
  details: {
    word: string;
    language: string;
    lang_code: string;
    pos: string;
    etymology_text: string | null;
  } | null;
}

export interface EtymologyResponse {
  word: WordEntry;
  parents: EtymologyRelationship[];
  children: EtymologyRelationship[];
}

/**
 * Check if API server is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getStats(): Promise<{
  totalWords: number;
  totalLanguages: number;
  wordsWithEtymology: number;
}> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return response.json();
}

/**
 * Search for words (autocomplete)
 */
export async function searchWords(
  query: string,
  limit: number = 20
): Promise<WordSearchResult[]> {
  if (query.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE_URL}/search?${params}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
}

/**
 * Get word details
 */
export async function getWordDetails(
  word: string,
  languages?: string[],
  limit: number = 10
): Promise<WordEntry[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (languages && languages.length > 0) {
    params.set('language', languages.join(','));
  }

  const response = await fetch(`${API_BASE_URL}/words/${encodeURIComponent(word)}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch word details');
  }
  return response.json();
}

/**
 * Get etymology relationships for a word
 */
export async function getEtymology(
  word: string,
  language: string
): Promise<EtymologyResponse> {
  const response = await fetch(
    `${API_BASE_URL}/etymology/${encodeURIComponent(word)}/${encodeURIComponent(language)}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch etymology');
  }
  return response.json();
}
