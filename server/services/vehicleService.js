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

  _dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  // --- Public Service Methods ---

  async register(username, password) {
    const user = await this.getUserByUsername(username);
    if (user) {
      throw new Error('User already exists');
    }
    return this._dbRun('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
  }

  async login(username, password) {
    const user = await this._dbGet('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  async getUserByUsername(username) {
    return this._dbGet('SELECT * FROM users WHERE username = ?', [username]);
  }


  async getAll(filters = {}) {
    const {
      searchTerm, origins, cylinders, sortBy, order = 'asc',
      mpg, weight, horsepower, displacement, acceleration, modelYear
    } = filters;

    // Explicitly handle pagination parameters and convert to numbers
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;

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
    if (origins && origins.length > 0) {
      const originList = String(origins).split(',');
      query += ` AND origin IN (${originList.map(() => '?').join(',')})`;
      params.push(...originList);
    }
    if (cylinders && cylinders.length > 0) {
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

    // Add pagination logic
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this._dbAll(query, params);
  }

  async getById(id) {
    return this._dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
  }

  async getAllForStats() {
    return this._dbAll('SELECT * FROM vehicles');
  }

  async getScatterPlotData() {
    // Select only the necessary columns for the chart
    return this._dbAll('SELECT weight, mpg, origin FROM vehicles');
  }

  // Add this new method to your VehicleService class
  async getVehicleNames() {
    const query = 'SELECT carName FROM vehicles';
    const rows = await this._dbAll(query);
    // Return a simple array of strings
    return rows.map(r => r.carName);
  }

  async getByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    // Prevents SQL injection by creating placeholders
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT * FROM vehicles WHERE id IN (${placeholders})`;
    return this._dbAll(query, ids);
  }

  async getRelatedVehicles(id) {
    const vehicle = await this.getById(id);
    if (!vehicle) {
      return [];
    }
    const { origin, modelYear } = vehicle;

    const query = `
      SELECT * FROM vehicles
      WHERE (origin = ? OR modelYear = ?) AND id != ?
      ORDER BY RANDOM()
      LIMIT 4
    `;
    const params = [origin, modelYear, id];
    return this._dbAll(query, params);
  }

  // --- Favorites Methods ---

  async getFavorites(userId) {
    const query = `
      SELECT v.* FROM vehicles v
      JOIN user_favorites uf ON v.id = uf.vehicle_id
      WHERE uf.user_id = ?
    `;
    return this._dbAll(query, [userId]);
  }

  async addFavorite(userId, vehicleId) {
    const query = 'INSERT INTO user_favorites (user_id, vehicle_id) VALUES (?, ?)';
    return this._dbRun(query, [userId, vehicleId]);
  }

  async removeFavorite(userId, vehicleId) {
    const query = 'DELETE FROM user_favorites WHERE user_id = ? AND vehicle_id = ?';
    return this._dbRun(query, [userId, vehicleId]);
  }
}