import { EtymologyData } from '../types/etymology';

export const mockEtymologyData: EtymologyData = {
  words: [
    // English: "run"
    {
      id: 'run_en',
      word: 'run',
      language: 'eng',
      languageDisplay: 'English',
      definition: 'to move swiftly on foot',
      partOfSpeech: 'verb'
    },
    // Old English: "rinnan"
    {
      id: 'rinnan_ang',
      word: 'rinnan',
      language: 'ang',
      languageDisplay: 'Old English',
      definition: 'to run, flow',
      partOfSpeech: 'verb'
    },
    // Proto-Germanic: "*rinnaną"
    {
      id: 'rinnaną_gem-pro',
      word: '*rinnaną',
      language: 'gem-pro',
      languageDisplay: 'Proto-Germanic',
      definition: 'to run',
      partOfSpeech: 'verb'
    },
    // Proto-Indo-European: "*h₃reyn-"
    {
      id: 'h₃reyn_ine-pro',
      word: '*h₃reyn-',
      language: 'ine-pro',
      languageDisplay: 'Proto-Indo-European',
      definition: 'to flow, run',
      partOfSpeech: 'root'
    },
    // Spanish: "correr"
    {
      id: 'correr_spa',
      word: 'correr',
      language: 'spa',
      languageDisplay: 'Spanish',
      definition: 'to run',
      partOfSpeech: 'verb'
    },
    // Latin: "currere"
    {
      id: 'currere_lat',
      word: 'currere',
      language: 'lat',
      languageDisplay: 'Latin',
      definition: 'to run',
      partOfSpeech: 'verb'
    },
    // English: "algorithm"
    {
      id: 'algorithm_en',
      word: 'algorithm',
      language: 'eng',
      languageDisplay: 'English',
      definition: 'a process or set of rules to be followed',
      partOfSpeech: 'noun'
    },
    // Medieval Latin: "algorismus"
    {
      id: 'algorismus_lat-med',
      word: 'algorismus',
      language: 'lat-med',
      languageDisplay: 'Medieval Latin',
      definition: 'the Arabic numeral system',
      partOfSpeech: 'noun'
    },
    // Arabic: "al-Khwārizmī"
    {
      id: 'al-Khwārizmī_ara',
      word: 'الخوارزمي',
      language: 'ara',
      languageDisplay: 'Arabic',
      definition: 'Persian mathematician\'s name',
      partOfSpeech: 'proper noun'
    },
    // English: "brother"
    {
      id: 'brother_en',
      word: 'brother',
      language: 'eng',
      languageDisplay: 'English',
      definition: 'a male sibling',
      partOfSpeech: 'noun'
    },
    // Old English: "brōþor"
    {
      id: 'brōþor_ang',
      word: 'brōþor',
      language: 'ang',
      languageDisplay: 'Old English',
      definition: 'brother',
      partOfSpeech: 'noun'
    },
    // Proto-Germanic: "*brōþēr"
    {
      id: 'brōþēr_gem-pro',
      word: '*brōþēr',
      language: 'gem-pro',
      languageDisplay: 'Proto-Germanic',
      definition: 'brother',
      partOfSpeech: 'noun'
    },
    // PIE root for brother
    {
      id: 'bʰréh₂tēr_ine-pro',
      word: '*bʰréh₂tēr',
      language: 'ine-pro',
      languageDisplay: 'Proto-Indo-European',
      definition: 'brother',
      partOfSpeech: 'noun'
    },
    // Latin: "frāter" (cognate)
    {
      id: 'frāter_lat',
      word: 'frāter',
      language: 'lat',
      languageDisplay: 'Latin',
      definition: 'brother',
      partOfSpeech: 'noun'
    },
    // Sanskrit: "bhrātṛ" (cognate)
    {
      id: 'bhrātṛ_san',
      word: 'भ्रातृ',
      language: 'san',
      languageDisplay: 'Sanskrit',
      definition: 'brother',
      partOfSpeech: 'noun'
    }
  ],
  relationships: [
    // "run" etymology chain
    {
      id: 'e1',
      source: 'run_en',
      target: 'rinnan_ang',
      type: 'inherited_from'
    },
    {
      id: 'e2',
      source: 'rinnan_ang',
      target: 'rinnaną_gem-pro',
      type: 'inherited_from'
    },
    {
      id: 'e3',
      source: 'rinnaną_gem-pro',
      target: 'h₃reyn_ine-pro',
      type: 'derives_from'
    },
    // "correr" etymology chain
    {
      id: 'e4',
      source: 'correr_spa',
      target: 'currere_lat',
      type: 'inherited_from'
    },
    {
      id: 'e5',
      source: 'currere_lat',
      target: 'h₃reyn_ine-pro',
      type: 'derives_from',
      notes: 'Both trace back to same PIE root'
    },
    // "algorithm" etymology chain (borrowing example)
    {
      id: 'e6',
      source: 'algorithm_en',
      target: 'algorismus_lat-med',
      type: 'borrowed_from'
    },
    {
      id: 'e7',
      source: 'algorismus_lat-med',
      target: 'al-Khwārizmī_ara',
      type: 'derives_from',
      notes: 'Named after Persian mathematician'
    },
    // "brother" etymology chain
    {
      id: 'e8',
      source: 'brother_en',
      target: 'brōþor_ang',
      type: 'inherited_from'
    },
    {
      id: 'e9',
      source: 'brōþor_ang',
      target: 'brōþēr_gem-pro',
      type: 'inherited_from'
    },
    {
      id: 'e10',
      source: 'brōþēr_gem-pro',
      target: 'bʰréh₂tēr_ine-pro',
      type: 'derives_from'
    },
    // Cognates from same PIE root
    {
      id: 'e11',
      source: 'frāter_lat',
      target: 'bʰréh₂tēr_ine-pro',
      type: 'derives_from'
    },
    {
      id: 'e12',
      source: 'bhrātṛ_san',
      target: 'bʰréh₂tēr_ine-pro',
      type: 'derives_from'
    }
  ]
};

// Helper function to get word by ID
export function getWordById(id: string) {
  return mockEtymologyData.words.find(word => word.id === id);
}

// Helper function to get parent words (etymology sources)
export function getParentWords(wordId: string) {
  const parentRelationships = mockEtymologyData.relationships.filter(
    rel => rel.source === wordId
  );

  return parentRelationships.map(rel => ({
    word: mockEtymologyData.words.find(w => w.id === rel.target)!,
    relationship: rel
  }));
}

// Helper function to get all words for autocomplete
export function getAllWords() {
  return mockEtymologyData.words;
}
