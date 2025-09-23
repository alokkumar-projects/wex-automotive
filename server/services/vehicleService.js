import sqlite3 from 'sqlite3';

/**
 * A service class to handle all database interactions for vehicles.
 * This pattern allows for dependency injection of the database connection,
 * which is excellent for testing.
 */
export class VehicleService {
  /**
   * @param {sqlite3.Database} db The database instance.
   */
  constructor(db) {
    if (!db) {
      throw new Error('A database instance must be provided.');
    }
    this.db = db;
  }

  // --- Private, Promisified Database Helpers ---

  _dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  _dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
  }

  // --- Public Service Methods ---

  async getAll(filters = {}) {
    const {
      searchTerm, origins, cylinders, sortBy, order = 'asc',
      mpg, weight, horsepower, displacement, acceleration, modelYear
    } = filters;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    const addRangeFilter = (field, value) => {
      if (value) {
        const [min, max] = String(value).split(',').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          query += ` AND ${field} BETWEEN ? AND ?`;
          params.push(min, max);
        }
      }
    };

    if (searchTerm) {
      query += ' AND carName LIKE ?';
      params.push(`%${searchTerm}%`);
    }
    if (origins) {
      const originList = String(origins).split(',');
      query += ` AND origin IN (${originList.map(() => '?').join(',')})`;
      params.push(...originList);
    }
    if (cylinders) {
      const cylinderList = String(cylinders).split(',');
      query += ` AND cylinders IN (${cylinderList.map(() => '?').join(',')})`;
      params.push(...cylinderList);
    }

    addRangeFilter('mpg', mpg);
    addRangeFilter('weight', weight);
    addRangeFilter('horsepower', horsepower);
    addRangeFilter('displacement', displacement);
    addRangeFilter('acceleration', acceleration);
    addRangeFilter('modelYear', modelYear);

    if (sortBy && ['mpg', 'weight', 'horsepower', 'modelYear'].includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
    }

    return this._dbAll(query, params);
  }

  async getById(id) {
    return this._dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
  }

  async getAllForStats() {
    return this._dbAll('SELECT * FROM vehicles');
  }
}