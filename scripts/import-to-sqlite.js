#!/usr/bin/env node

/**
 * Import Kaikki.org Wiktionary data into SQLite database
 *
 * Usage: node scripts/import-to-sqlite.js [--resume]
 *
 * This creates a SQLite database optimized for fast etymology queries.
 * Import takes ~1-2 hours and creates a ~25GB database.
 *
 * Use --resume to continue from last checkpoint if interrupted.
 */

import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';
import Database from 'better-sqlite3';

const DATA_FILE = './data/raw-wiktextract-data.jsonl.gz';
const DB_FILE = './data/wiktionary.db';
const CHECKPOINT_FILE = './data/import-checkpoint.json';
const BATCH_SIZE = 10000; // Insert in batches for performance
const CHECKPOINT_INTERVAL = 100000; // Save progress every 100k entries

async function importData(resume = false) {
  console.log('=== Wiktionary SQLite Import ===\n');

  let startLine = 0;
  if (resume && fs.existsSync(CHECKPOINT_FILE)) {
    const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    startLine = checkpoint.lastLine;
    console.log(`Resuming from line ${startLine.toLocaleString()}...\n`);
  } else {
    // Delete existing database if starting fresh
    if (fs.existsSync(DB_FILE)) {
      console.log('Removing existing database...');
      fs.unlinkSync(DB_FILE);
    }
  }

  console.log('Opening database...');
  const db = new Database(DB_FILE);

  // Enable performance optimizations
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging for concurrent reads
  db.pragma('synchronous = NORMAL'); // Faster writes, still safe
  db.pragma('cache_size = 1000000'); // 1GB cache
  db.pragma('temp_store = MEMORY'); // Use memory for temp tables

  console.log('Creating schema...\n');

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT NOT NULL,
      language TEXT NOT NULL,
      lang_code TEXT,
      pos TEXT,
      etymology_text TEXT,
      etymology_templates TEXT,  -- JSON array
      categories TEXT,           -- JSON array
      senses TEXT,               -- JSON array
      full_data TEXT,            -- Complete JSON for flexibility
      PRIMARY KEY (word, language, pos)
    )
  `);

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT OR REPLACE INTO words (
      word, language, lang_code, pos, etymology_text,
      etymology_templates, categories, senses, full_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const startTime = Date.now();
  const ESTIMATED_TOTAL = 10_400_000;

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

  function saveCheckpoint(lineCount) {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
      lastLine: lineCount,
      timestamp: new Date().toISOString()
    }));
  }

  console.log('Reading and importing data...\n');

  const readStream = fs.createReadStream(DATA_FILE);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: readStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let importedCount = 0;
  let batch = [];
  let skippedToResume = false;

  // Start transaction for batch inserts
  const insertMany = db.transaction((entries) => {
    for (const entry of entries) {
      insert.run(entry);
    }
  });

  for await (const line of rl) {
    lineCount++;

    // Skip lines if resuming
    if (resume && !skippedToResume) {
      if (lineCount <= startLine) {
        if (lineCount % 100000 === 0) {
          process.stdout.write(`\rSkipping to resume point: ${lineCount.toLocaleString()}...`);
        }
        continue;
      } else {
        skippedToResume = true;
        console.log(`\n\nResumed at line ${lineCount.toLocaleString()}\n`);
      }
    }

    try {
      const entry = JSON.parse(line);

      batch.push([
        entry.word || '',
        entry.lang || '',
        entry.lang_code || '',
        entry.pos || '',
        entry.etymology_text || null,
        entry.etymology_templates ? JSON.stringify(entry.etymology_templates) : null,
        entry.categories ? JSON.stringify(entry.categories) : null,
        entry.senses ? JSON.stringify(entry.senses) : null,
        JSON.stringify(entry) // Store complete entry
      ]);

      // Insert batch when it reaches size
      if (batch.length >= BATCH_SIZE) {
        insertMany(batch);
        importedCount += batch.length;
        batch = [];
      }

      // Progress update
      if (lineCount % 10000 === 0) {
        const elapsed = Date.now() - startTime;
        const rate = lineCount / (elapsed / 1000);
        const remaining = ESTIMATED_TOTAL - lineCount;
        const estimatedRemaining = remaining / rate * 1000;
        const progress = ((lineCount / ESTIMATED_TOTAL) * 100).toFixed(1);

        process.stdout.write(
          `\r${lineCount.toLocaleString()} entries (${progress}%) | ` +
          `${formatTime(elapsed)} elapsed | ~${formatTime(estimatedRemaining)} remaining | ` +
          `${Math.round(rate).toLocaleString()} entries/sec`
        );
      }

      // Save checkpoint
      if (lineCount % CHECKPOINT_INTERVAL === 0) {
        // Insert remaining batch before checkpoint
        if (batch.length > 0) {
          insertMany(batch);
          importedCount += batch.length;
          batch = [];
        }
        saveCheckpoint(lineCount);
      }

    } catch (err) {
      // Skip malformed lines
      if (lineCount % 100000 === 0) {
        console.error(`\nWarning: Skipped malformed entry at line ${lineCount}`);
      }
    }
  }

  // Insert final batch
  if (batch.length > 0) {
    insertMany(batch);
    importedCount += batch.length;
  }

  const totalElapsed = Date.now() - startTime;

  console.log('\n\n=== Creating indexes ===');
  console.log('This may take several minutes...\n');

  console.log('Creating word index...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_word ON words(word)');

  console.log('Creating language index...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_language ON words(language)');

  console.log('Creating combined word+language index...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_word_lang ON words(word, language)');

  console.log('Creating pos index...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_pos ON words(pos)');

  console.log('\nOptimizing database...');
  db.pragma('optimize');

  console.log('\n=== Import Complete! ===');
  console.log(`Total entries processed: ${lineCount.toLocaleString()}`);
  console.log(`Entries imported: ${importedCount.toLocaleString()}`);
  console.log(`Time elapsed: ${formatTime(totalElapsed)}`);
  console.log(`Average rate: ${Math.round(lineCount / (totalElapsed / 1000)).toLocaleString()} entries/sec`);

  const dbSize = fs.statSync(DB_FILE).size;
  console.log(`Database size: ${(dbSize / 1024 / 1024 / 1024).toFixed(2)} GB`);

  // Clean up checkpoint file
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
    console.log('Checkpoint file removed');
  }

  db.close();
  console.log('\nDatabase ready at: ./data/wiktionary.db');
  console.log('You can now use: node scripts/query-sqlite.js <word> [language...]');
}

// Parse command line args
const args = process.argv.slice(2);
const resume = args.includes('--resume');

// Check if data file exists
if (!fs.existsSync(DATA_FILE)) {
  console.error(`Error: Data file not found: ${DATA_FILE}`);
  console.error('Please download the data first.');
  process.exit(1);
}

importData(resume).catch(console.error);
