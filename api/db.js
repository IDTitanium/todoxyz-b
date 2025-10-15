import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Ensure the database file is writable (Vercel fix)
const source = path.join(process.cwd(), 'db.sqlite');
const dest = '/tmp/db.sqlite';

if (!fs.existsSync(dest)) {
  // copy a pre-seeded database if it exists
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
  } else {
    fs.writeFileSync(dest, '');
  }
}

// Initialize better-sqlite3
const db = new Database(dest);

// Create tables if they don’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();

export { db };
