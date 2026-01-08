#!/usr/bin/env node

/**
 * Script to explore Kaikki.org Wiktionary data
 * Usage: node scripts/explore-data.js [word]
 */

const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

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
  let foundWord = null;

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

      // If searching for specific word
      if (searchWord && entry.word === searchWord && entry.lang === 'English') {
        foundWord = entry;
        console.log('\n\n✅ Found word:', searchWord);
        console.log(JSON.stringify(entry, null, 2));
        break;
      }

      // Collect interesting examples
      if (!searchWord &&
          entry.lang === 'English' &&
          entry.etymology_templates &&
          entry.etymology_templates.length > 0 &&
          etymologyExamples.length < 5) {
        etymologyExamples.push({
          word: entry.word,
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
    console.log('\n=== Example Entries with Etymology ===\n');
    etymologyExamples.forEach((example, i) => {
      console.log(`\n${i + 1}. "${example.word}" (${example.pos})`);
      console.log(`   Etymology: ${example.etymology_text?.substring(0, 150)}...`);
      if (example.etymology_templates) {
        console.log(`   Templates: ${example.etymology_templates.map(t => t.name).join(', ')}`);
      }
      if (example.categories) {
        console.log(`   Categories: ${example.categories.slice(0, 3).join(', ')}`);
      }
    });
  }

  if (searchWord && !foundWord) {
    console.log(`\n❌ Word "${searchWord}" not found in data`);
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
