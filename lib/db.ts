import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'picia.db'));

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('imported', 'reviewed', 'published')) DEFAULT 'imported',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    matchId TEXT NOT NULL,
    filePath TEXT NOT NULL,
    previewPath TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clusters (
    id TEXT PRIMARY KEY,
    matchId TEXT NOT NULL,
    photoIds TEXT NOT NULL, -- JSON array of face IDs
    decision TEXT CHECK(decision IN ('pending', 'approved', 'rejected', 'needs_review')) DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS faces (
    id TEXT PRIMARY KEY,
    matchId TEXT NOT NULL,
    photoId TEXT NOT NULL,
    clusterId TEXT,
    filePath TEXT NOT NULL, -- path to face crop
    bbox TEXT, -- JSON [x, y, w, h]
    score REAL,
    embedding TEXT, -- JSON array
    
    -- Quality Metrics
    blurScore REAL DEFAULT 0, -- Variance of Laplacian
    faceCountInImage INTEGER DEFAULT 1, -- How many faces were on the original photo
    panoramicScore REAL DEFAULT 0, -- Placeholder for other quality metrics
    
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (photoId) REFERENCES photos(id) ON DELETE CASCADE
  );
`);

export default db;
