import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const ORIGIN_MAP = { 1: 'USA', 2: 'Europe', 3: 'Japan' };

function toNum(s) {
  if (s == null) return null;
  const t = String(s).trim();
  if (t === '' || t === '?') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

function normalizeHeader(h) {
  const k = String(h).replace(/^\uFEFF/, '').trim().toLowerCase(); // strip BOM + trim
  if (k === 'model year' || k === 'model_year' || k === 'model-year') return 'modelYear';
  if (k === 'car name' || k === 'car_name' || k === 'car-name') return 'carName';
  return k; // mpg, cylinders, displacement, horsepower, weight, acceleration, origin
}

export async function loadData(csvPath) {
  const filePath = path.resolve(csvPath);
  const input = fs.readFileSync(filePath, 'utf8'); // reads the attached CSV with the header row

  // Parse whole file with BOM removal, explicit delimiter, and header normalization
  const rows = parse(input, {
    bom: true,
    delimiter: '\t',          // FIX: Changed from ',' to '\t' to correctly parse the tab-separated file
    columns: (header) => header.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true
  });

  let id = 1;
  const vehicles = rows.map((r) => {
    const originCode = toNum(r.origin);
    const origin = originCode != null ? (ORIGIN_MAP[originCode] || originCode) : null;

    return {
      id: id++,
      mpg: toNum(r.mpg),
      cylinders: toNum(r.cylinders),
      displacement: toNum(r.displacement),
      horsepower: toNum(r.horsepower),
      weight: toNum(r.weight),
      acceleration: toNum(r.acceleration),
      modelYear: toNum(r.modelYear),
      origin,
      carName: (r.carName ?? '').trim() || null
    };
  });

  // Diagnostic if still empty
  if (!vehicles.length || vehicles.every(v =>
    v.mpg == null && v.cylinders == null && v.weight == null && v.origin == null && !v.carName
  )) {
    console.warn('[data] Parsed CSV but values are empty — check CSV_PATH and delimiter/BOM'); // diagnostic
  }

  return { vehicles };
}

export function getStats(vehicles) {
  const numRange = (arr) => {
    const clean = arr.filter(x => x !== null && x !== undefined);
    if (!clean.length) return [null, null];
    return [Math.min(...clean), Math.max(...clean)];
  };

  const by = (key) => vehicles.map(v => v[key]);

  const grouped = vehicles.reduce((acc, v) => {
    if (v.mpg == null || v.modelYear == null) return acc;
    const y = v.modelYear;
    if (!acc[y]) acc[y] = { sum: 0, count: 0 };
    acc[y].sum += v.mpg;
    acc[y].count += 1;
    return acc;
  }, {});
  const avgMpgByYear = Object.fromEntries(
    Object.entries(grouped).map(([y, { sum, count }]) => [y, +(sum / count).toFixed(2)])
  );

  const origins = Array.from(new Set(vehicles.map(v => v.origin).filter(Boolean))).sort();
  const cylinders = Array.from(new Set(vehicles.map(v => v.cylinders).filter(Boolean))).sort((a, b) => a - b);

  return {
    mpgRange: numRange(by('mpg')),
    weightRange: numRange(by('weight')),
    horsepowerRange: numRange(by('horsepower')),
    displacementRange: numRange(by('displacement')),
    accelerationRange: numRange(by('acceleration')),
    modelYearRange: numRange(by('modelYear')),
    origins,
    cylinders,
    avgMpgByYear
  };
}