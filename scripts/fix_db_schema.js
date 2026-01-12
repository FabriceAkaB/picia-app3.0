const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data/picia.db');
const db = new Database(dbPath);

console.log('Migrating database schema...');

// Add blurScore column
try {
    db.prepare("ALTER TABLE faces ADD COLUMN blurScore REAL DEFAULT 0").run();
    console.log("✔ Added column: blurScore");
} catch (error) {
    if (!error.message.includes('duplicate column name')) {
        console.error("Error adding blurScore:", error.message);
    } else {
        console.log("ℹ blurScore already exists");
    }
}

// Add faceCountInImage column
try {
    db.prepare("ALTER TABLE faces ADD COLUMN faceCountInImage INTEGER DEFAULT 1").run();
    console.log("✔ Added column: faceCountInImage");
} catch (error) {
    if (!error.message.includes('duplicate column name')) {
        console.error("Error adding faceCountInImage:", error.message);
    } else {
        console.log("ℹ faceCountInImage already exists");
    }
}

// Add panoramicScore column
try {
    db.prepare("ALTER TABLE faces ADD COLUMN panoramicScore REAL DEFAULT 0").run();
    console.log("✔ Added column: panoramicScore");
} catch (error) {
    if (!error.message.includes('duplicate column name')) {
        console.error("Error adding panoramicScore:", error.message);
    } else {
        console.log("ℹ panoramicScore already exists");
    }
}

console.log('Migration complete.');
