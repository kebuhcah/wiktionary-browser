#!/usr/bin/env node

/**
 * Show language distribution in Wiktionary data
 */

import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';

const DATA_FILE = './data/raw-wiktextract-data.jsonl.gz';

async function showLanguages() {
  console.log('Analyzing language distribution...\n');

  const readStream = fs.createReadStream(DATA_FILE);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: readStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  const languageCounts = new Map();
  const languagesWithEtymology = new Map();
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;

    if (lineCount % 100000 === 0) {
      process.stdout.write(`\rProcessed ${lineCount.toLocaleString()} entries...`);
    }

    try {
      const entry = JSON.parse(line);
      const lang = entry.lang || entry.lang_code || 'Unknown';

      languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);

      if (entry.etymology_text || entry.etymology_templates) {
        languagesWithEtymology.set(lang, (languagesWithEtymology.get(lang) || 0) + 1);
      }
    } catch (err) {
      // Skip malformed lines
    }

    if (lineCount > 1000000) {
      break;
    }
  }

  console.log('\n\n=== Top 20 Languages by Entry Count ===\n');

  const sortedLangs = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  sortedLangs.forEach(([lang, count], i) => {
    const withEtym = languagesWithEtymology.get(lang) || 0;
    const percent = ((withEtym / count) * 100).toFixed(1);
    console.log(`${i + 1}. ${lang.padEnd(20)} ${count.toLocaleString().padStart(10)} entries  (${withEtym.toLocaleString()} with etymology, ${percent}%)`);
  });

  console.log(`\n=== Summary ===`);
  console.log(`Total languages: ${languageCounts.size}`);
  console.log(`Total entries processed: ${lineCount.toLocaleString()}`);
}

showLanguages().catch(console.error);
