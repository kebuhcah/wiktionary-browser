/**
 * Populate word_categories junction table
 * Assumes categories table is already populated
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'wiktionary.db');
const db = new Database(dbPath);

console.log('Populating word_categories junction table...\n');

// Enable performance optimizations
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');

// Build category name -> id map
console.log('Step 1: Building category lookup map...');
const categoryMap = new Map();
const catStmt = db.prepare('SELECT id, name FROM categories');
for (const cat of catStmt.iterate()) {
  categoryMap.set(cat.name, cat.id);
}
console.log(`✓ Built map with ${categoryMap.size.toLocaleString()} categories\n`);

// Populate junction table
console.log('Step 2: Loading words with categories...\n');

const wordStmt = db.prepare(`
  SELECT word, language, pos, etymology_index, categories
  FROM words
  WHERE categories IS NOT NULL
  AND categories != '[]'
`);

// Load all words into memory first to avoid "database busy" error
const words = wordStmt.all();
console.log(`✓ Loaded ${words.length.toLocaleString()} words\n`);

console.log('Step 3: Creating word-category associations...\n');

const insertJunction = db.prepare(`
  INSERT OR IGNORE INTO word_categories
  (word, language, pos, etymology_index, category_id)
  VALUES (?, ?, ?, ?, ?)
`);

let wordCount = 0;
let junctionCount = 0;
let parseErrors = 0;
let missingCategories = 0;
let emptyCategories = 0;

const startTime = Date.now();

// Use a transaction for better performance
const transaction = db.transaction(() => {
  for (const word of words) {
    try {
      const categories = JSON.parse(word.categories);
      if (Array.isArray(categories)) {
        if (categories.length === 0) {
          emptyCategories++;
        }
        for (const catName of categories) {
          if (catName && typeof catName === 'string') {
            const categoryId = categoryMap.get(catName);
            if (categoryId) {
              const result = insertJunction.run(
                word.word,
                word.language,
                word.pos,
                word.etymology_index,
                categoryId
              );
              if (result.changes > 0) {
                junctionCount++;
              }
            } else {
              missingCategories++;
              if (missingCategories <= 10) {
                console.log(`  Category not found in map: "${catName}" for word: ${word.word}`);
              }
            }
          }
        }
      }
    } catch (e) {
      parseErrors++;
      if (parseErrors <= 10) {
        console.log(`  Parse error for word "${word.word}": ${e.message}`);
        console.log(`  Categories value: ${word.categories.substring(0, 100)}...`);
      }
    }

    wordCount++;
    if (wordCount % 50000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (wordCount / elapsed).toFixed(0);
      console.log(`  Processed ${wordCount.toLocaleString()} words in ${elapsed}s (${rate} words/sec)`);
      console.log(`    Created ${junctionCount.toLocaleString()} associations`);
      console.log(`    Parse errors: ${parseErrors}, Missing categories: ${missingCategories}, Empty arrays: ${emptyCategories}`);
    }
  }
});

transaction();

const endTime = Date.now();

console.log(`\n✅ Completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);

console.log('Final statistics:');
console.log(`  Words processed: ${wordCount.toLocaleString()}`);
console.log(`  Associations created: ${junctionCount.toLocaleString()}`);
console.log(`  Parse errors: ${parseErrors.toLocaleString()}`);
console.log(`  Missing category IDs: ${missingCategories.toLocaleString()}`);
console.log(`  Empty category arrays: ${emptyCategories.toLocaleString()}`);

// Verify
const verifyCount = db.prepare('SELECT COUNT(*) as count FROM word_categories').get();
console.log(`\n  Total rows in word_categories: ${verifyCount.count.toLocaleString()}`);

db.close();
console.log('\n✅ Done!');
