#!/usr/bin/env node

/**
 * Script to explore Kaikki.org Wiktionary data
 * Usage: node scripts/explore-data.js [word]
 */

import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';

const DATA_FILE = './data/raw-wiktextract-data.jsonl.gz';

async function exploreData(searchWord = null) {
  console.log('Opening data file...\n');

  const readStream = fs.createReadStream(DATA_FILE);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: readStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let wordsWithEtymology = 0;
  let englishWords = 0;
  const etymologyExamples = [];
  const foundWords = []; // Changed to array to collect all matches

  for await (const line of rl) {
    lineCount++;

    if (lineCount % 100000 === 0) {
      process.stdout.write(`\rProcessed ${lineCount.toLocaleString()} entries...`);
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
        foundWords.push({
          lang: entry.lang,
          pos: entry.pos,
          etymology_text: entry.etymology_text,
          etymology_templates: entry.etymology_templates,
          senses: entry.senses?.slice(0, 2), // Just first 2 senses
          categories: entry.categories?.slice(0, 5)
        });

        // Stop after finding 10 different language entries
        if (foundWords.length >= 10) {
          break;
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

  console.log('\n\n=== Summary ===');
  console.log(`Total entries processed: ${lineCount.toLocaleString()}`);
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

// Get word from command line
const searchWord = process.argv[2];

if (searchWord) {
  console.log(`Searching for: ${searchWord}\n`);
  exploreData(searchWord).catch(console.error);
} else {
  console.log('Exploring data (processing first 500k entries)...\n');
  exploreData().catch(console.error);
}
