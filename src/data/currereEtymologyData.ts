import { EtymologyData } from '../types/etymology';

/**
 * Real Wiktionary data for the Latin "currere" (to run) family
 * Extracted from Kaikki.org Wiktionary dataset
 *
 * This dataset demonstrates:
 * - Ancient language evolution (PIE → Proto-Italic → Latin)
 * - Romance language inheritance (Latin → Spanish/French/Italian)
 * - English borrowings from Latin (technical/learned words)
 * - English borrowings through French (everyday words)
 * - Latin derivational morphology (prefixes: ob-, re-, ex-)
 */
export const currereEtymologyData: EtymologyData = {
  words: [
    // ========== Ancient Roots ==========
    {
      id: 'pie_kers',
      word: '*ḱers-',
      language: 'ine-pro',
      languageDisplay: 'Proto-Indo-European',
      definition: 'to run',
      partOfSpeech: 'root'
    },
    {
      id: 'proto_italic_korzo',
      word: '*korzō',
      language: 'itc-pro',
      languageDisplay: 'Proto-Italic',
      definition: 'to run',
      partOfSpeech: 'verb'
    },

    // ========== Latin Base ==========
    {
      id: 'latin_curro',
      word: 'currō',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'to run; to hurry, hasten, speed',
      partOfSpeech: 'verb'
    },

    // ========== Latin Derived Forms ==========
    {
      id: 'latin_cursor',
      word: 'cursor',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'runner',
      partOfSpeech: 'noun'
    },
    {
      id: 'latin_occurro',
      word: 'occurrō',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'run to meet, run against, befall',
      partOfSpeech: 'verb'
    },
    {
      id: 'latin_recurro',
      word: 'recurrō',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'to hurry or run back; to return, revert',
      partOfSpeech: 'verb'
    },
    {
      id: 'latin_excursio',
      word: 'excursiō',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'a running out, an inroad, invasion',
      partOfSpeech: 'noun'
    },
    {
      id: 'latin_cursus',
      word: 'cursus',
      language: 'la',
      languageDisplay: 'Latin',
      definition: 'course of a race',
      partOfSpeech: 'noun'
    },

    // ========== Old French Intermediaries ==========
    {
      id: 'old_french_cours',
      word: 'cours',
      language: 'fro',
      languageDisplay: 'Old French',
      definition: 'course',
      partOfSpeech: 'noun'
    },
    {
      id: 'old_french_curant',
      word: 'curant',
      language: 'fro',
      languageDisplay: 'Old French',
      definition: 'running (present participle)',
      partOfSpeech: 'verb'
    },

    // ========== Romance Languages ==========
    {
      id: 'spanish_correr',
      word: 'correr',
      language: 'es',
      languageDisplay: 'Spanish',
      definition: 'to run, to jog; to flow',
      partOfSpeech: 'verb'
    },
    {
      id: 'french_courir',
      word: 'courir',
      language: 'fr',
      languageDisplay: 'French',
      definition: 'to run; to hurry; to rush',
      partOfSpeech: 'verb'
    },
    {
      id: 'italian_correre',
      word: 'correre',
      language: 'it',
      languageDisplay: 'Italian',
      definition: 'to run; to hurry, to rush',
      partOfSpeech: 'verb'
    },

    // ========== English Words ==========
    {
      id: 'english_course',
      word: 'course',
      language: 'en',
      languageDisplay: 'English',
      definition: 'a sequence of events',
      partOfSpeech: 'noun'
    },
    {
      id: 'english_current',
      word: 'current',
      language: 'en',
      languageDisplay: 'English',
      definition: 'the generally unidirectional movement of a gas or fluid',
      partOfSpeech: 'noun'
    },
    {
      id: 'english_cursor',
      word: 'cursor',
      language: 'en',
      languageDisplay: 'English',
      definition: 'a moving icon representing the position of the pointing device',
      partOfSpeech: 'noun'
    },
    {
      id: 'english_occur',
      word: 'occur',
      language: 'en',
      languageDisplay: 'English',
      definition: 'to happen or take place',
      partOfSpeech: 'verb'
    },
    {
      id: 'english_recur',
      word: 'recur',
      language: 'en',
      languageDisplay: 'English',
      definition: 'to appear or happen again, especially repeatedly',
      partOfSpeech: 'verb'
    },
    {
      id: 'english_excursion',
      word: 'excursion',
      language: 'en',
      languageDisplay: 'English',
      definition: 'a brief recreational trip; a journey out of the usual way',
      partOfSpeech: 'noun'
    }
  ],

  relationships: [
    // ========== Ancient Evolution Chain ==========
    {
      id: 'rel_1',
      source: 'proto_italic_korzo',
      target: 'pie_kers',
      type: 'inherited_from',
      notes: 'Proto-Italic inherited from PIE root'
    },
    {
      id: 'rel_2',
      source: 'latin_curro',
      target: 'proto_italic_korzo',
      type: 'inherited_from',
      notes: 'Latin inherited from Proto-Italic'
    },

    // ========== Romance Language Inheritance ==========
    {
      id: 'rel_3',
      source: 'spanish_correr',
      target: 'latin_curro',
      type: 'inherited_from',
      notes: 'Spanish inherited from Latin currere'
    },
    {
      id: 'rel_4',
      source: 'french_courir',
      target: 'latin_curro',
      type: 'inherited_from',
      notes: 'French inherited from Latin currere via Old French'
    },
    {
      id: 'rel_5',
      source: 'italian_correre',
      target: 'latin_curro',
      type: 'inherited_from',
      notes: 'Italian inherited from Latin currere'
    },

    // ========== Latin Derivational Morphology ==========
    {
      id: 'rel_6',
      source: 'latin_cursor',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'cursor = currō + -or (agentive suffix)'
    },
    {
      id: 'rel_7',
      source: 'latin_occurro',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'occurrō = ob- (against) + currō'
    },
    {
      id: 'rel_8',
      source: 'latin_recurro',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'recurrō = re- (back) + currō'
    },
    {
      id: 'rel_9',
      source: 'latin_excursio',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'excursiō from excurrere = ex- (out) + currere'
    },
    {
      id: 'rel_10',
      source: 'latin_cursus',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'cursus is derived from currō'
    },

    // ========== Old French Intermediaries ==========
    {
      id: 'rel_11',
      source: 'old_french_cours',
      target: 'latin_cursus',
      type: 'derives_from',
      notes: 'Old French cours from Latin cursus'
    },
    {
      id: 'rel_12',
      source: 'old_french_curant',
      target: 'latin_curro',
      type: 'derives_from',
      notes: 'Old French curant from Latin currere (present participle)'
    },

    // ========== English Direct Borrowings from Latin ==========
    {
      id: 'rel_13',
      source: 'english_cursor',
      target: 'latin_cursor',
      type: 'borrowed_from',
      notes: 'English borrowed directly from Latin cursor'
    },
    {
      id: 'rel_14',
      source: 'english_occur',
      target: 'latin_occurro',
      type: 'borrowed_from',
      notes: 'English borrowed from Latin occurrō via Middle French'
    },
    {
      id: 'rel_15',
      source: 'english_recur',
      target: 'latin_recurro',
      type: 'borrowed_from',
      notes: 'English learned borrowing from Latin recurrō'
    },
    {
      id: 'rel_16',
      source: 'english_excursion',
      target: 'latin_excursio',
      type: 'borrowed_from',
      notes: 'English borrowed from Latin excursiō'
    },

    // ========== English Borrowings via Old French ==========
    {
      id: 'rel_17',
      source: 'english_course',
      target: 'old_french_cours',
      type: 'borrowed_from',
      notes: 'English course from Old French cours'
    },
    {
      id: 'rel_18',
      source: 'english_current',
      target: 'old_french_curant',
      type: 'borrowed_from',
      notes: 'English current from Old French curant'
    }
  ]
};

// Helper function to get word by ID
export function getWordById(id: string) {
  return currereEtymologyData.words.find(word => word.id === id);
}

// Helper function to get parent words (etymology sources)
export function getParentWords(wordId: string) {
  const parentRelationships = currereEtymologyData.relationships.filter(
    rel => rel.source === wordId
  );

  return parentRelationships.map(rel => ({
    word: currereEtymologyData.words.find(w => w.id === rel.target)!,
    relationship: rel
  }));
}

// Helper function to get child words (words derived from this one)
export function getChildWords(wordId: string) {
  const childRelationships = currereEtymologyData.relationships.filter(
    rel => rel.target === wordId
  );

  return childRelationships.map(rel => ({
    word: currereEtymologyData.words.find(w => w.id === rel.source)!,
    relationship: rel
  }));
}

// Helper function to get related words (both parents and children)
export function getRelatedWords(wordId: string) {
  return {
    parents: getParentWords(wordId),
    children: getChildWords(wordId)
  };
}

// Helper function to get all words for autocomplete
export function getAllWords() {
  return currereEtymologyData.words;
}
