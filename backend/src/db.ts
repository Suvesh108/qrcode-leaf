import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in the backend root directory
const dbPath = path.resolve(__dirname, "../qrcodeleaf.db");
const db = new Database(dbPath);

// Enable WAL journal mode to support multi-client write concurrency safely
db.pragma("journal_mode = WAL");

// Construct structured schemas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    style TEXT NOT NULL,
    image TEXT NOT NULL,
    pushedAt TEXT NOT NULL,
    qrConfig TEXT
  );

  CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    foregroundColor TEXT NOT NULL,
    backgroundColor TEXT NOT NULL,
    patternStyle TEXT NOT NULL,
    finderStyle TEXT NOT NULL,
    errorCorrection TEXT NOT NULL,
    scanValid INTEGER NOT NULL, -- Boolean encoded as 0 or 1
    attempts INTEGER NOT NULL,
    baseScans INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generationId TEXT NOT NULL,
    ip TEXT NOT NULL,
    userAgent TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (generationId) REFERENCES generations(id) ON DELETE CASCADE
  );
`);


// 0. Auto-purge simulated seed records if they exist to perform a clean dashboard reset
try {
  const hasFakeSeed = db.prepare("SELECT COUNT(*) as count FROM generations WHERE id IN ('1', '2')").get() as { count: number };
  if (hasFakeSeed.count > 0) {
    db.prepare("DELETE FROM scans").run();
    db.prepare("DELETE FROM generations").run();
    console.log("[DB] Purged simulated campaign and scan records successfully.");
  }
} catch (err) {
  console.error("[DB Reset Error]:", err);
}

// 1. Seed admin user account if missing
const seedAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@qrcodeleaf.com");
if (!seedAdmin) {
  db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(
    "admin@qrcodeleaf.com",
    "System Admin",
    "admin1234",
    "admin"
  );
  console.log("[DB] Seeded initial admin account.");
}

// Simulated campaign and scan seeding removed to support live analytics only.

export default db;
