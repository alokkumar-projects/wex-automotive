import Fastify from 'fastify';
import cors from '@fastify/cors';
import sqlite3 from 'sqlite3';
import { getStats } from './utils/data.js';

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

const db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    fastify.log.error('DB Connection Error:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

fastify.get('/', async () => ({ status: 'ok', service: 'wex-automotive-api' }));

fastify.get('/api/stats', async (req, reply) => {
  try {
    const rows = await dbAll('SELECT * FROM vehicles');
    return getStats(rows);
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Failed to fetch vehicle data for stats' });
  }
});

fastify.get('/api/vehicles', async (req, reply) => {
  const {
    searchTerm, origins, cylinders, sortBy, order = 'asc',
    mpg, weight, horsepower, displacement, acceleration, modelYear
  } = req.query;

  let query = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];

  // Helper for range filters
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

  // Add range filters
  addRangeFilter('mpg', mpg);
  addRangeFilter('weight', weight);
  addRangeFilter('horsepower', horsepower);
  addRangeFilter('displacement', displacement);
  addRangeFilter('acceleration', acceleration);
  addRangeFilter('modelYear', modelYear);

  if (sortBy && ['mpg', 'weight', 'horsepower', 'modelYear'].includes(sortBy)) {
    query += ` ORDER BY ${sortBy} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }

  try {
    const rows = await dbAll(query, params);
    return rows;
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Failed to query vehicles' });
  }
});


fastify.get('/api/vehicles/:id', async (req, reply) => {
  try {
    const id = Number(req.params.id);
    const row = await dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!row) {
      reply.code(404).send({ error: 'Vehicle not found' });
      return;
    }
    return row;
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Failed to fetch vehicle' });
  }
});

const port = process.env.PORT || 5175;
const host = process.env.HOST || '0.0.0.0';

fastify.listen({ port, host }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});