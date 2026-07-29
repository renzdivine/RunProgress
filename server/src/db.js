import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'data.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    athlete_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    stravaId INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    distance REAL NOT NULL,
    time REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const insertActivity = db.prepare(`
  INSERT OR REPLACE INTO activities (stravaId, name, distance, time, date)
  VALUES (@stravaId, @name, @distance, @time, @date)
`);

const insertActivities = db.transaction((activities) => {
  for (const a of activities) {
    insertActivity.run(a);
  }
});

export function saveToken(accessToken, athleteId) {
  db.prepare(`INSERT INTO tokens (access_token, athlete_id) VALUES (?, ?)`).run(accessToken, athleteId);
}

export function getLatestToken() {
  return db.prepare(`SELECT * FROM tokens ORDER BY id DESC LIMIT 1`).get() || null;
}

export function saveActivities(activities) {
  insertActivities(activities);
}

export function getAllStoredActivities() {
  return db.prepare(`SELECT * FROM activities ORDER BY date DESC`).all();
}

export function getActivityByStravaId(id) {
  return db.prepare(`SELECT * FROM activities WHERE stravaId = ?`).get(id) || null;
}

export default db;
