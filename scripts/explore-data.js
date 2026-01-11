#!/usr/bin/env node

/**
 * Script to explore Kaikki.org Wiktionary data
 * Usage: node scripts/explore-data.js [word]
 */

import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';

const DATA_FILE = './data/raw-wiktextract-data.jsonl.gz';

async function exploreData(searchWord = null, filterLangs = []) {
  console.log('Opening data file...\n');
  if (searchWord && filterLangs.length > 0) {
    console.log(`Filtering for languages: ${filterLangs.join(', ')}\n`);
  }

  const readStream = fs.createReadStream(DATA_FILE);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: readStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  const startTime = Date.now();
  const ESTIMATED_TOTAL_ENTRIES = 10_400_000; // ~10.4M entries in full dataset

  let lineCount = 0;
  let wordsWithEtymology = 0;
  let englishWords = 0;
  const etymologyExamples = [];
  const foundWords = []; // Changed to array to collect all matches

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  for await (const line of rl) {
    lineCount++;

    if (lineCount % 100000 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = lineCount / (elapsed / 1000); // entries per second
      const remaining = ESTIMATED_TOTAL_ENTRIES - lineCount;
      const estimatedRemaining = remaining / rate * 1000; // ms

      const progress = ((lineCount / ESTIMATED_TOTAL_ENTRIES) * 100).toFixed(1);
      const elapsedStr = formatTime(elapsed);
      const remainingStr = formatTime(estimatedRemaining);
      const rateStr = Math.round(rate).toLocaleString();

      process.stdout.write(
        `\r${lineCount.toLocaleString()} entries (${progress}%) | ` +
        `${elapsedStr} elapsed | ~${remainingStr} remaining | ${rateStr} entries/sec`
      );
    }

    try {
      const entry = JSON.parse(line);

      // Count English words
      if (entry.lang === 'English' || entry.lang_code === 'en') {
        englishWords++;
      }

      // Count words with etymology
      if (entry.etymology_text || entry.etymology_templates) {
        wordsWithEtymology++;
      }

      // If searching for specific word, collect all language matches
      if (searchWord && entry.word === searchWord) {
        // If language filters provided, check if entry matches (case-insensitive)
        const matchesFilter = filterLangs.length === 0 ||
                             filterLangs.some(filter =>
                               entry.lang?.toLowerCase() === filter.toLowerCase() ||
                               entry.lang_code?.toLowerCase() === filter.toLowerCase()
                             );

        if (matchesFilter) {
          foundWords.push({
            lang: entry.lang,
            pos: entry.pos,
            etymology_text: entry.etymology_text,
            etymology_templates: entry.etymology_templates,
            senses: entry.senses?.slice(0, 2), // Just first 2 senses
            categories: entry.categories?.slice(0, 5)
          });

          // If we have language filters, exit early once we find all requested languages
          if (filterLangs.length > 0) {
            const allFound = filterLangs.every(filter =>
              foundWords.some(w =>
                w.lang?.toLowerCase() === filter.toLowerCase()
              )
            );
            if (allFound) {
              break;
            }
          }

          // Stop after finding 10 different language entries (when no filter)
          if (filterLangs.length === 0 && foundWords.length >= 10) {
            break;
          }
        }
      }

      // Collect interesting examples (from all languages)
      if (!searchWord &&
          entry.etymology_templates &&
          entry.etymology_templates.length > 0 &&
          etymologyExamples.length < 10) {
        etymologyExamples.push({
          word: entry.word,
          lang: entry.lang,
          pos: entry.pos,
          etymology_text: entry.etymology_text,
          etymology_templates: entry.etymology_templates.slice(0, 3),
          categories: entry.categories?.slice(0, 5)
        });
      }

    } catch (err) {
      // Skip malformed lines
    }

    // If just exploring, stop after reasonable sample
    if (!searchWord && lineCount > 500000) {
      break;
    }
  }

  const totalElapsed = Date.now() - startTime;

  console.log('\n\n=== Summary ===');
  console.log(`Total entries processed: ${lineCount.toLocaleString()}`);
  console.log(`Time elapsed: ${formatTime(totalElapsed)}`);
  console.log(`Average rate: ${Math.round(lineCount / (totalElapsed / 1000)).toLocaleString()} entries/sec`);
  console.log(`English words: ${englishWords.toLocaleString()}`);
  console.log(`Words with etymology: ${wordsWithEtymology.toLocaleString()}`);

  if (!searchWord && etymologyExamples.length > 0) {
    console.log('\n=== Example Entries with Etymology (All Languages) ===\n');
    etymologyExamples.forEach((example, i) => {
      console.log(`\n${i + 1}. "${example.word}" [${example.lang}] (${example.pos})`);
      console.log(`   Etymology: ${example.etymology_text?.substring(0, 150)}...`);
      if (example.etymology_templates) {
        console.log(`   Templates: ${example.etymology_templates.map(t => t.name).join(', ')}`);
      }
      if (example.categories) {
        console.log(`   Categories: ${example.categories.slice(0, 3).join(', ')}`);
      }
    });
  }

  if (searchWord) {
    if (foundWords.length === 0) {
      console.log(`\n❌ Word "${searchWord}" not found in data`);
    } else {
      console.log(`\n\n✅ Found "${searchWord}" in ${foundWords.length} language(s):\n`);

      foundWords.forEach((entry, i) => {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`${i + 1}. ${searchWord} [${entry.lang}] (${entry.pos || 'unknown'})`);
        console.log(`${'='.repeat(70)}`);

        if (entry.etymology_text) {
          console.log(`\n📜 Etymology:`);
          console.log(`   ${entry.etymology_text.substring(0, 300)}${entry.etymology_text.length > 300 ? '...' : ''}`);
        }

        if (entry.etymology_templates && entry.etymology_templates.length > 0) {
          console.log(`\n🔗 Templates: ${entry.etymology_templates.slice(0, 5).map(t => t.name).join(', ')}`);
        }

        if (entry.senses && entry.senses.length > 0) {
          console.log(`\n📖 Definitions:`);
          entry.senses.forEach((sense, j) => {
            const gloss = sense.glosses?.[0] || sense.raw_glosses?.[0] || 'No definition';
            console.log(`   ${j + 1}. ${gloss.substring(0, 150)}${gloss.length > 150 ? '...' : ''}`);
          });
        }

        if (entry.categories && entry.categories.length > 0) {
          console.log(`\n🏷️  Categories: ${entry.categories.slice(0, 3).join(', ')}`);
        }
      });
    }
  }
}

// Get word and optional language filters from command line
const searchWord = process.argv[2];
const filterLangs = process.argv.slice(3); // All arguments after the word

if (searchWord) {
  if (filterLangs.length > 0) {
    console.log(`Searching for: ${searchWord} (languages: ${filterLangs.join(', ')})\n`);
  } else {
    console.log(`Searching for: ${searchWord}\n`);
  }
  exploreData(searchWord, filterLangs).catch(console.error);
} else {
  console.log('Exploring data (processing first 500k entries)...\n');
  exploreData().catch(console.error);
}
