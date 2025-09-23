import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sqlite3 from 'sqlite3';
import { VehicleService } from './vehicleService.js';

// Use an in-memory database for fast, isolated tests
const db = new sqlite3.Database(':memory:');
const vehicleService = new VehicleService(db);

// Mock Data
const mockVehicles = [
  { id: 1, carName: 'Ford Pinto', origin: 'USA', cylinders: 4, mpg: 25 },
  { id: 2, carName: 'Toyota Corolla', origin: 'Japan', cylinders: 4, mpg: 35 },
  { id: 3, carName: 'Ford Galaxie 500', origin: 'USA', cylinders: 8, mpg: 15 },
];

// Setup and teardown for the database
beforeEach(() => {
  return new Promise((resolve) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE vehicles (
          id INTEGER PRIMARY KEY, mpg REAL, cylinders INTEGER, origin TEXT, carName TEXT
        )
      `);
      const stmt = db.prepare('INSERT INTO vehicles VALUES (?, ?, ?, ?, ?)');
      mockVehicles.forEach(v => stmt.run(v.id, v.mpg, v.cylinders, v.origin, v.carName));
      stmt.finalize(resolve);
    });
  });
});

afterEach(() => {
  return new Promise((resolve) => {
    db.run('DROP TABLE vehicles', resolve);
  });
});

describe('VehicleService', () => {
  it('should get all vehicles when no filters are provided', async () => {
    const vehicles = await vehicleService.getAll();
    expect(vehicles).toHaveLength(3);
  });

  it('should filter by a single origin', async () => {
    const vehicles = await vehicleService.getAll({ origins: 'Japan' });
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].carName).toBe('Toyota Corolla');
  });

  it('should filter by multiple origins', async () => {
    // Note: The service expects a comma-separated string
    const vehicles = await vehicleService.getAll({ origins: 'USA,Japan' });
    expect(vehicles).toHaveLength(3);
  });

  it('should filter by cylinders', async () => {
    const vehicles = await vehicleService.getAll({ cylinders: '8' });
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].carName).toBe('Ford Galaxie 500');
  });

  it('should filter by search term', async () => {
    const vehicles = await vehicleService.getAll({ searchTerm: 'Ford' });
    expect(vehicles).toHaveLength(2);
  });

  it('should handle combined filters', async () => {
    const vehicles = await vehicleService.getAll({ origins: 'USA', cylinders: '4' });
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].carName).toBe('Ford Pinto');
  });

  it('should get a single vehicle by ID', async () => {
    const vehicle = await vehicleService.getById(2);
    expect(vehicle).toBeDefined();
    expect(vehicle.carName).toBe('Toyota Corolla');
  });
});