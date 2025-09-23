import sqlite3 from 'sqlite3';

// Initialize the database connection once and share it across all service methods.
const db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  }
  console.log('Vehicle service connected to the SQLite database.');
});

// --- Promisified Database Helpers ---
// This pattern makes our async database calls much cleaner to work with.
const dbAll = (query, params = []) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (query, params = []) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => err ? reject(err) : resolve(row));
});


// --- The Service Module ---
// This object encapsulates all the logic for fetching and manipulating vehicle data.
export const vehicleService = {
  /**
   * Gets a filtered, sorted list of all vehicles.
   * @param {object} filters - The query parameters from the request.
   * @returns {Promise<Array>} A promise that resolves to an array of vehicle objects.
   */
  async getAll(filters = {}) {
    const {
      searchTerm, origins, cylinders, sortBy, order = 'asc',
      mpg, weight, horsepower, displacement, acceleration, modelYear
    } = filters;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    const addRangeFilter = (field, value) => {
      if (value) {
        const [min, max] = value.split(',').map(Number);
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
      const originList = origins.split(',');
      query += ` AND origin IN (${originList.map(() => '?').join(',')})`;
      params.push(...originList);
    }
    if (cylinders) {
      const cylinderList = cylinders.split(',');
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

    return dbAll(query, params);
  },

  /**
   * Gets a single vehicle by its ID.
   * @param {number} id - The ID of the vehicle.
   * @returns {Promise<object|null>} A promise that resolves to the vehicle object or null if not found.
   */
  async getById(id) {
    return dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
  },

  /**
   * Gets all vehicles to calculate statistics.
   * @returns {Promise<Array>} A promise that resolves to an array of all vehicle objects.
   */
  async getAllForStats() {
    return dbAll('SELECT * FROM vehicles');
  }
};