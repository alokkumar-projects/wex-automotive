import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// --- Database Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../db.sqlite');

// Delete existing DB if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database file.');
}

const db = new sqlite3.Database(dbPath);

// --- Data Parsing (similar to original data.js) ---
const ORIGIN_MAP = { 1: 'USA', 2: 'Europe', 3: 'Japan' };
function toNum(s) {
  if (s == null) return null;
  const t = String(s).trim();
  if (t === '' || t === '?') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}
function normalizeHeader(h) {
  const k = String(h).replace(/^\uFEFF/, '').trim().toLowerCase();
  if (k === 'model year' || k === 'model_year' || k === 'model-year') return 'modelYear';
  if (k === 'car name' || k === 'car_name' || k === 'car-name') return 'carName';
  return k;
}

// --- Read CSV and Load into Database ---
async function seedDatabase() {
  const csvPath = path.resolve(__dirname, '../data/auto-mpg.csv');
  const input = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(input, {
    bom: true,
    delimiter: '\t',
    columns: (header) => header.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  });

  const vehicles = rows.map((r, i) => ({
    id: i + 1,
    mpg: toNum(r.mpg),
    cylinders: toNum(r.cylinders),
    displacement: toNum(r.displacement),
    horsepower: toNum(r.horsepower),
    weight: toNum(r.weight),
    acceleration: toNum(r.acceleration),
    modelYear: toNum(r.modelYear),
    origin: ORIGIN_MAP[toNum(r.origin)] || null,
    carName: (r.carName ?? '').trim() || null,
  }));

  db.serialize(() => {
    console.log('Creating vehicles table...');
    db.run(`
      CREATE TABLE vehicles (
        id INTEGER PRIMARY KEY,
        mpg REAL,
        cylinders INTEGER,
        displacement REAL,
        horsepower REAL,
        weight REAL,
        acceleration REAL,
        modelYear INTEGER,
        origin TEXT,
        carName TEXT
      )
    `);

    console.log('Inserting data...');
    const stmt = db.prepare(`
      INSERT INTO vehicles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    vehicles.forEach(v => {
      stmt.run(
        v.id, v.mpg, v.cylinders, v.displacement, v.horsepower,
        v.weight, v.acceleration, v.modelYear, v.origin, v.carName
      );
    });

    stmt.finalize();
    console.log(`Successfully inserted ${vehicles.length} vehicles.`);

    // Create users table
    console.log('Creating users table...');
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    // Create user_favorites table
    console.log('Creating user_favorites table...');
    db.run(`
      CREATE TABLE user_favorites (
        user_id INTEGER,
        vehicle_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
        PRIMARY KEY (user_id, vehicle_id)
      )
    `);
  });

  db.close();
}

seedDatabase().catch(console.error);