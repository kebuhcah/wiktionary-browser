#!/usr/bin/env node

/**
 * Query Wiktionary SQLite database
 *
 * Usage:
 *   node scripts/query-sqlite.js <word>                    # All languages
 *   node scripts/query-sqlite.js <word> <lang1> [lang2]    # Specific languages
 *   node scripts/query-sqlite.js --stats                   # Database statistics
 *
 * Examples:
 *   node scripts/query-sqlite.js correr
 *   node scripts/query-sqlite.js correr Spanish
 *   node scripts/query-sqlite.js run English German
 *   node scripts/query-sqlite.js --stats
 */

import Database from 'better-sqlite3';
import fs from 'fs';

const DB_FILE = './data/wiktionary.db';

function formatResult(row, index, total) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${index}. ${row.word} [${row.language}] (${row.pos || 'unknown'})`);
  console.log(`${'='.repeat(70)}`);

  if (row.etymology_text) {
    console.log(`\n📜 Etymology:`);
    const truncated = row.etymology_text.substring(0, 300);
    console.log(`   ${truncated}${row.etymology_text.length > 300 ? '...' : ''}`);
  }

  if (row.etymology_templates) {
    try {
      const templates = JSON.parse(row.etymology_templates);
      if (templates.length > 0) {
        const templateNames = templates.slice(0, 5).map(t => t.name).join(', ');
        console.log(`\n🔗 Templates: ${templateNames}`);
      }
    } catch (e) {
      // Skip if JSON parsing fails
    }
  }

  if (row.senses) {
    try {
      const senses = JSON.parse(row.senses);
      if (senses.length > 0) {
        console.log(`\n📖 Definitions:`);
        senses.slice(0, 2).forEach((sense, i) => {
          const gloss = sense.glosses?.[0] || sense.raw_glosses?.[0] || 'No definition';
          const truncated = gloss.substring(0, 150);
          console.log(`   ${i + 1}. ${truncated}${gloss.length > 150 ? '...' : ''}`);
        });
      }
    } catch (e) {
      // Skip if JSON parsing fails
    }
  }

  if (row.categories) {
    try {
      const categories = JSON.parse(row.categories);
      if (categories.length > 0) {
        console.log(`\n🏷️  Categories: ${categories.slice(0, 3).join(', ')}`);
      }
    } catch (e) {
      // Skip if JSON parsing fails
    }
  }
}

function showStats(db) {
  console.log('=== Database Statistics ===\n');

  const totalWords = db.prepare('SELECT COUNT(*) as count FROM words').get();
  console.log(`Total entries: ${totalWords.count.toLocaleString()}`);

  const languages = db.prepare('SELECT COUNT(DISTINCT language) as count FROM words').get();
  console.log(`Unique languages: ${languages.count.toLocaleString()}`);

  const withEtymology = db.prepare('SELECT COUNT(*) as count FROM words WHERE etymology_text IS NOT NULL').get();
  console.log(`Entries with etymology: ${withEtymology.count.toLocaleString()}`);

  console.log('\n=== Top 20 Languages ===\n');
  const topLangs = db.prepare(`
    SELECT language, COUNT(*) as count
    FROM words
    GROUP BY language
    ORDER BY count DESC
    LIMIT 20
  `).all();

  topLangs.forEach((row, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${row.language.padEnd(25)} ${row.count.toLocaleString().padStart(10)} entries`);
  });

  const dbSize = fs.statSync(DB_FILE).size;
  console.log(`\nDatabase size: ${(dbSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
}

function queryWord(db, word, languages = []) {
  const startTime = Date.now();

  let query;
  let params;

  if (languages.length === 0) {
    // Search all languages
    query = db.prepare('SELECT * FROM words WHERE word = ? LIMIT 10');
    params = [word];
  } else {
    // Search specific languages (case-insensitive)
    const placeholders = languages.map(() => '?').join(', ');
    query = db.prepare(`
      SELECT * FROM words
      WHERE word = ?
      AND (language IN (${placeholders}) OR lang_code IN (${placeholders}))
    `);
    params = [word, ...languages, ...languages];
  }

  const results = query.all(...params);
  const queryTime = Date.now() - startTime;

  console.log('\n=== Summary ===');
  console.log(`Query time: ${queryTime}ms`);

  if (results.length === 0) {
    console.log(`\n❌ Word "${word}" not found in database`);
    if (languages.length > 0) {
      console.log(`   (searched languages: ${languages.join(', ')})`);
    }
    return;
  }

  console.log(`✅ Found "${word}" in ${results.length} language(s):\n`);

  results.forEach((row, i) => {
    formatResult(row, i + 1, results.length);
  });
}

// Main
if (!fs.existsSync(DB_FILE)) {
  console.error(`Error: Database not found: ${DB_FILE}`);
  console.error('Please run: node scripts/import-to-sqlite.js');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/query-sqlite.js <word> [language...]');
  console.error('       node scripts/query-sqlite.js --stats');
  process.exit(1);
}

const db = new Database(DB_FILE, { readonly: true });

// Enable performance optimizations for reads
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');

if (args[0] === '--stats') {
  showStats(db);
} else {
  const word = args[0];
  const languages = args.slice(1);

  if (languages.length > 0) {
    console.log(`Searching for: ${word} (languages: ${languages.join(', ')})`);
  } else {
    console.log(`Searching for: ${word} (all languages)`);
  }

  queryWord(db, word, languages);
}

db.close();
