# Wiktionary Data Scripts

Scripts for exploring and processing Kaikki.org Wiktionary data.

## Data Download

The data is downloaded from: https://kaikki.org/dictionary/rawdata.html

- **File**: `raw-wiktextract-data.jsonl.gz`
- **Size**: 2.3GB compressed (~20GB uncompressed)
- **Format**: JSONL (JSON Lines) - one JSON object per line
- **Location**: `./data/raw-wiktextract-data.jsonl.gz`

## Available Scripts

### explore-data.js

Explore the Wiktionary data and search for specific words.

**Usage:**

```bash
# Get summary statistics and see examples
node scripts/explore-data.js

# Search for a specific word
node scripts/explore-data.js run
node scripts/explore-data.js philosophy
node scripts/explore-data.js algorithm
```

**Output:**
- Total entries count
- Number of English words
- Words with etymology data
- Example entries with etymology templates and categories

## Data Structure

Each entry in the JSONL file is a JSON object with this structure:

```json
{
  "word": "philosophy",
  "lang": "English",
  "lang_code": "en",
  "pos": "noun",

  "etymology_text": "From Middle English philosophie, from Old French filosofie...",

  "etymology_templates": [
    {
      "name": "inh",
      "args": {
        "1": "en",
        "2": "enm",
        "3": "philosophie"
      },
      "expansion": "Middle English philosophie"
    },
    {
      "name": "der",
      "args": {
        "1": "en",
        "2": "fro",
        "3": "filosofie"
      },
      "expansion": "Old French filosofie"
    }
  ],

  "categories": [
    "English terms derived from Latin",
    "English terms derived from Ancient Greek",
    "English countable nouns"
  ],

  "senses": [
    {
      "glosses": ["The love of wisdom."],
      "id": "philosophy-en-noun-..."
    }
  ],

  "sounds": [
    {
      "ipa": "/fɪˈlɒsəfi/"
    }
  ]
}
```

## Key Fields

### Etymology Fields

- **`etymology_text`**: Plain text description of word origin
- **`etymology_templates`**: Structured template data with relationships
  - Template names: `inh` (inherited), `der` (derived), `bor` (borrowed), `cog` (cognate)
  - Args contain language codes and source words

### Categories

- **`categories`**: Array of Wiktionary categories
  - Etymology categories: "English terms derived from Latin"
  - Grammatical categories: "English nouns", "English verbs"
  - Topical categories: "en:Philosophy", "en:Science"

### Other Useful Fields

- **`lang`**: Language name (e.g., "English")
- **`lang_code`**: ISO language code (e.g., "en")
- **`pos`**: Part of speech (noun, verb, adjective, etc.)
- **`senses`**: Array of definitions/meanings
- **`sounds`**: Pronunciation data (IPA, audio URLs)
- **`translations`**: Translations to other languages

## Etymology Template Types

Common template names found in `etymology_templates`:

- **`inh`**: Inherited from (language evolution)
- **`der`**: Derived from (general derivation)
- **`bor`**: Borrowed from (loanword)
- **`cog`**: Cognate with (related word in another language)
- **`m`**: Mention (reference to another word)
- **`doublet`**: Doublet of (different evolution of same root)
- **`affix`**: Formed from prefix/suffix
- **`compound`**: Compound word

## Template Arguments

Template args typically follow this pattern:

```json
{
  "1": "target_lang",  // Target language code (e.g., "en")
  "2": "source_lang",  // Source language code (e.g., "la")
  "3": "source_word",  // The source word
  "4": "optional_note" // Optional additional info
}
```

Example: `{{inh|en|enm|philosophie}}` means:
- English (`en`)
- inherited from (`inh`)
- Middle English (`enm`)
- word `philosophie`

## Next Steps

1. **Extract Etymology Relationships**: Parse `etymology_templates` to build word relationship graph
2. **Process Categories**: Extract language families and etymology patterns from categories
3. **Build Graph Database**: Convert to format for React app
4. **API Layer**: Create backend to serve etymology data

## Resources

- [Kaikki.org Data](https://kaikki.org/dictionary/rawdata.html)
- [Wiktextract Documentation](https://github.com/tatuylonen/wiktextract)
- [Wiktionary Language Codes](https://en.wiktionary.org/wiki/Wiktionary:List_of_languages)
