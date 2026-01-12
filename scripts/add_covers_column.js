const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data/picia.db');
const db = new Database(dbPath);

console.log('Migrating database schema...');

// Add coverFaceIds column to clusters
try {
    db.prepare("ALTER TABLE clusters ADD COLUMN coverFaceIds TEXT").run();
    console.log("✔ Added column: coverFaceIds");
} catch (error) {
    if (!error.message.includes('duplicate column name')) {
        console.error("Error adding coverFaceIds:", error.message);
    } else {
        console.log("ℹ coverFaceIds already exists");
    }
}

console.log('Migration complete.');
