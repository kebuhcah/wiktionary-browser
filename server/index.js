#!/usr/bin/env node

/**
 * Wiktionary Etymology Browser API Server
 *
 * Provides REST API for querying SQLite etymology database
 */

import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, '../data/wiktionary.db');

// Check if database exists
import fs from 'fs';
if (!fs.existsSync(DB_PATH)) {
  console.error(`Error: Database not found at ${DB_PATH}`);
  console.error('Please run: node scripts/import-to-sqlite.js');
  process.exit(1);
}

// Open database
console.log('Opening database...');
const db = new Database(DB_PATH, { readonly: true });
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Get database stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalWords: db.prepare('SELECT COUNT(*) as count FROM words').get().count,
      totalLanguages: db.prepare('SELECT COUNT(DISTINCT language) as count FROM words').get().count,
      wordsWithEtymology: db.prepare('SELECT COUNT(*) as count FROM words WHERE etymology_text IS NOT NULL').get().count
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for words (autocomplete)
app.get('/api/search', (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Optimized query: Show all language variants for each word
    // GROUP BY word+language to show each language separately
    // This way "correr" shows Spanish, Galician, Portuguese, etc.
    const results = db.prepare(`
      SELECT word,
             language,
             MIN(lang_code) as lang_code,
             MIN(pos) as pos
      FROM words
      WHERE word LIKE ? || '%'
      GROUP BY word, language
      ORDER BY
        word = ? DESC,
        LENGTH(word),
        word,
        language
      LIMIT ?
    `).all(q, q, parseInt(limit));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get word details
app.get('/api/words/:word', (req, res) => {
  try {
    const { word } = req.params;
    const { language, limit = 10 } = req.query;

    let query;
    let params;

    if (language) {
      // Filter by language (case-insensitive)
      const languages = language.split(',').map(l => l.trim());
      const placeholders = languages.map(() => '?').join(', ');
      query = db.prepare(`
        SELECT * FROM words
        WHERE word = ?
        AND (language IN (${placeholders}) OR lang_code IN (${placeholders}))
        LIMIT ?
      `);
      params = [word, ...languages, ...languages, parseInt(limit)];
    } else {
      // All languages
      query = db.prepare(`
        SELECT * FROM words
        WHERE word = ?
        LIMIT ?
      `);
      params = [word, parseInt(limit)];
    }

    const results = query.all(...params);

    // Parse JSON fields
    const parsed = results.map(row => ({
      ...row,
      etymology_templates: row.etymology_templates ? JSON.parse(row.etymology_templates) : null,
      categories: row.categories ? JSON.parse(row.categories) : null,
      senses: row.senses ? JSON.parse(row.senses) : null,
      full_data: row.full_data ? JSON.parse(row.full_data) : null
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get etymology relationships for a word
app.get('/api/etymology/:word/:language', (req, res) => {
  try {
    const { word, language } = req.params;

    // Get the word entry
    const entry = db.prepare(`
      SELECT * FROM words
      WHERE word = ? AND (language = ? OR lang_code = ?)
      LIMIT 1
    `).get(word, language, language);

    if (!entry) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // Parse etymology templates to find related words
    const etymologyTemplates = entry.etymology_templates
      ? JSON.parse(entry.etymology_templates)
      : [];

    // Extract parent words from templates
    const parentWords = etymologyTemplates
      .filter(t => ['inh', 'der', 'bor'].includes(t.name))
      .map(t => ({
        word: t.args?.['3'] || null,
        language: t.args?.['2'] || null,
        type: t.name
      }))
      .filter(p => p.word && p.language);

    // Look up parent word details
    const parents = parentWords.map(p => {
      const parentEntry = db.prepare(`
        SELECT word, language, lang_code, pos, etymology_text
        FROM words
        WHERE word = ? AND (lang_code = ? OR language = ?)
        LIMIT 1
      `).get(p.word, p.language, p.language);

      return {
        ...p,
        details: parentEntry || null
      };
    });

    // Find child words (words that reference this word in their etymology)
    // This is more complex - we'd need to parse all etymology_templates
    // For now, return empty array
    const children = [];

    res.json({
      word: {
        ...entry,
        etymology_templates: etymologyTemplates,
        categories: entry.categories ? JSON.parse(entry.categories) : null,
        senses: entry.senses ? JSON.parse(entry.senses) : null
      },
      parents,
      children
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`   API available at http://localhost:${PORT}/api`);
  console.log(`   Database: ${DB_PATH}`);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n   Frontend dev server: http://localhost:5173`);
  }
  console.log();
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\nClosing database...');
  db.close();
  process.exit(0);
});
