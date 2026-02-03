/**
 * Migrate categories from JSON text to normalized tables
 *
 * Creates:
 * - categories table: stores unique category names
 * - word_categories junction table: many-to-many relationship
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'wiktionary.db');
const db = new Database(dbPath);

console.log('Starting category migration...\n');

// Enable performance optimizations
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache

console.log('Step 1: Creating categories table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE INDEX IF NOT EXISTS idx_category_name ON categories(name);
`);
console.log('✓ Categories table created\n');

console.log('Step 2: Creating word_categories junction table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS word_categories (
    word TEXT NOT NULL,
    language TEXT NOT NULL,
    pos TEXT,
    etymology_index INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (word, language, pos, etymology_index)
      REFERENCES words(word, language, pos, etymology_index),
    PRIMARY KEY (word, language, pos, etymology_index, category_id)
  );
  CREATE INDEX IF NOT EXISTS idx_wc_category ON word_categories(category_id);
  CREATE INDEX IF NOT EXISTS idx_wc_word ON word_categories(word, language);
`);
console.log('✓ Junction table created\n');

console.log('Step 3: Extracting and inserting unique categories...');
console.log('This may take a while for a large database...\n');

// Use a transaction for better performance
const transaction = db.transaction(() => {
  // Get all unique categories from the JSON arrays
  const categorySet = new Set();

  const stmt = db.prepare(`
    SELECT DISTINCT categories
    FROM words
    WHERE categories IS NOT NULL
    AND categories != '[]'
  `);

  let rowCount = 0;
  for (const row of stmt.iterate()) {
    try {
      const categories = JSON.parse(row.categories);
      if (Array.isArray(categories)) {
        categories.forEach(cat => {
          if (cat && typeof cat === 'string') {
            categorySet.add(cat);
          }
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }

    rowCount++;
    if (rowCount % 100000 === 0) {
      console.log(`  Processed ${rowCount.toLocaleString()} rows, found ${categorySet.size.toLocaleString()} unique categories...`);
    }
  }

  console.log(`\n✓ Found ${categorySet.size.toLocaleString()} unique categories\n`);

  // Insert all unique categories
  console.log('Step 4: Inserting categories into table...');
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');

  let insertCount = 0;
  for (const category of categorySet) {
    insertCategory.run(category);
    insertCount++;
    if (insertCount % 10000 === 0) {
      console.log(`  Inserted ${insertCount.toLocaleString()} categories...`);
    }
  }

  console.log(`✓ Inserted ${insertCount.toLocaleString()} categories\n`);

  // Build category name -> id map for efficient lookups
  console.log('Step 5: Building category lookup map...');
  const categoryMap = new Map();
  const catStmt = db.prepare('SELECT id, name FROM categories');
  for (const cat of catStmt.iterate()) {
    categoryMap.set(cat.name, cat.id);
  }
  console.log(`✓ Built map with ${categoryMap.size.toLocaleString()} entries\n`);

  // Populate junction table
  console.log('Step 6: Populating word_categories junction table...');
  console.log('This will take some time...\n');

  const wordStmt = db.prepare(`
    SELECT word, language, pos, etymology_index, categories
    FROM words
    WHERE categories IS NOT NULL
    AND categories != '[]'
  `);

  const insertJunction = db.prepare(`
    INSERT OR IGNORE INTO word_categories
    (word, language, pos, etymology_index, category_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  let wordCount = 0;
  let junctionCount = 0;

  for (const word of wordStmt.iterate()) {
    try {
      const categories = JSON.parse(word.categories);
      if (Array.isArray(categories)) {
        for (const catName of categories) {
          const categoryId = categoryMap.get(catName);
          if (categoryId) {
            insertJunction.run(
              word.word,
              word.language,
              word.pos,
              word.etymology_index,
              categoryId
            );
            junctionCount++;
          }
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }

    wordCount++;
    if (wordCount % 50000 === 0) {
      console.log(`  Processed ${wordCount.toLocaleString()} words, created ${junctionCount.toLocaleString()} associations...`);
    }
  }

  console.log(`\n✓ Created ${junctionCount.toLocaleString()} word-category associations\n`);
});

const startTime = Date.now();
transaction();
const endTime = Date.now();

console.log(`\n✅ Migration completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);

// Print statistics
console.log('Database statistics:');
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
console.log(`  Categories: ${categoryCount.count.toLocaleString()}`);

const junctionCount = db.prepare('SELECT COUNT(*) as count FROM word_categories').get();
console.log(`  Word-category associations: ${junctionCount.count.toLocaleString()}`);

const wordsWithCats = db.prepare(`
  SELECT COUNT(DISTINCT word || language || pos || etymology_index) as count
  FROM word_categories
`).get();
console.log(`  Words with categories: ${wordsWithCats.count.toLocaleString()}`);

console.log('\nExample query - top 10 most common categories:');
const topCategories = db.prepare(`
  SELECT c.name, COUNT(*) as count
  FROM word_categories wc
  JOIN categories c ON wc.category_id = c.id
  GROUP BY c.id
  ORDER BY count DESC
  LIMIT 10
`).all();

topCategories.forEach((cat, i) => {
  console.log(`  ${i + 1}. ${cat.name}: ${cat.count.toLocaleString()} words`);
});

db.close();
console.log('\n✅ Done!');
