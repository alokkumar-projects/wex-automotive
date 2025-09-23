import Fastify from 'fastify';
import cors from '@fastify/cors';
import sqlite3 from 'sqlite3';
import { getStats } from './utils/data.js';
import { VehicleService } from './services/vehicleService.js';

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

// --- Database Connection & Service Instantiation ---
const db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    fastify.log.error(err, 'Database connection failed');
    process.exit(1);
  }
});

// Create an instance of the service, injecting the database connection.
const vehicleService = new VehicleService(db);

// --- In-Memory Cache for Static Stats Data ---
let statsCache = null;

// --- API Route Definitions (v1) ---

fastify.post('/api/v1/auth/register', async (request, reply) => {
  try {
    const { username, password } = request.body;
    const user = await vehicleService.register(username, password);
    return { success: true, userId: user.id };
  } catch (err) {
    request.log.error(err, 'Failed to register user');
    reply.code(500).send({ error: 'Failed to register user' });
  }
});

fastify.post('/api/v1/auth/login', async (request, reply) => {
  try {
    const { username, password } = request.body;
    const user = await vehicleService.login(username, password);
    return { success: true, user };
  } catch (err) {
    request.log.error(err, 'Failed to login user');
    reply.code(401).send({ error: 'Invalid credentials' });
  }
});


fastify.get('/api/v1/stats', async (request, reply) => {
  if (statsCache) {
    request.log.info('Returning stats from cache');
    return statsCache;
  }
  try {
    const allVehicles = await vehicleService.getAllForStats();
    statsCache = getStats(allVehicles);
    request.log.info('Stats cached successfully');
    return statsCache;
  } catch (err) {
    request.log.error(err, 'Failed to get stats');
    reply.code(500).send({ error: 'Failed to retrieve statistics' });
  }
});

fastify.get('/api/v1/vehicles', async (request, reply) => {
  try {
    const vehicles = await vehicleService.getAll(request.query);
    return vehicles;
  } catch (err) {
    request.log.error(err, 'Failed to query vehicles');
    reply.code(500).send({ error: 'Failed to retrieve vehicles' });
  }
});

fastify.get('/api/v1/vehicles/:id', async (request, reply) => {
  try {
    const id = Number(request.params.id);
    const vehicle = await vehicleService.getById(id);
    if (!vehicle) {
      return reply.code(404).send({ error: 'Vehicle not found' });
    }
    return vehicle;
  } catch (err) {
    request.log.error(err, 'Failed to get vehicle by ID');
    reply.code(500).send({ error: 'Failed to retrieve vehicle' });
  }
});

fastify.get('/api/v1/vehicles/:id/related', async (request, reply) => {
  try {
    const id = Number(request.params.id);
    const vehicles = await vehicleService.getRelatedVehicles(id);
    return vehicles;
  } catch (err) {
    request.log.error(err, 'Failed to get related vehicles');
    reply.code(500).send({ error: 'Failed to retrieve related vehicles' });
  }
});

// Add this new route definition

fastify.get('/api/v1/vehicles/scatter-plot', async (request, reply) => {
  try {
    const data = await vehicleService.getScatterPlotData();
    return data;
  } catch (err) {
    request.log.error(err, 'Failed to get scatter plot data');
    reply.code(500).send({ error: 'Failed to retrieve scatter plot data' });
  }
});

fastify.get('/api/v1/vehicles/names', async (request, reply) => {
  try {
    const names = await vehicleService.getVehicleNames();
    return names;
  } catch (err) {
    request.log.error(err, 'Failed to get vehicle names');
    reply.code(500).send({ error: 'Failed to retrieve vehicle names' });
  }
});

fastify.get('/api/v1/vehicles/by-ids', async (request, reply) => {
  try {
    const ids = (request.query.ids || '').split(',').map(Number).filter(Boolean);
    const vehicles = await vehicleService.getByIds(ids);
    return vehicles;
  } catch (err) {
    request.log.error(err, 'Failed to get vehicles by IDs');
    reply.code(500).send({ error: 'Failed to retrieve vehicles' });
  }
});

// --- User Favorites API Routes ---

fastify.get('/api/v1/favorites/:userId', async (request, reply) => {
    try {
      const userId = Number(request.params.userId);
      const favorites = await vehicleService.getFavorites(userId);
      return favorites;
    } catch (err) {
      request.log.error(err, 'Failed to get favorites');
      reply.code(500).send({ error: 'Failed to retrieve favorites' });
    }
  });
  
  fastify.post('/api/v1/favorites', async (request, reply) => {
    try {
      const { userId, vehicleId } = request.body;
      await vehicleService.addFavorite(userId, vehicleId);
      return { success: true };
    } catch (err) {
      request.log.error(err, 'Failed to add favorite');
      reply.code(500).send({ error: 'Failed to add favorite' });
    }
  });
  
  fastify.delete('/api/v1/favorites', async (request, reply) => {
    try {
      const { userId, vehicleId } = request.body;
      await vehicleService.removeFavorite(userId, vehicleId);
      return { success: true };
    } catch (err) {
      request.log.error(err, 'Failed to remove favorite');
      reply.code(500).send({ error: 'Failed to remove favorite' });
    }
  });

// --- Server Start & Graceful Shutdown ---
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 5175, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const close = (signal) => {
  fastify.log.info(`Received ${signal}, shutting down...`);
  db.close((err) => {
    if (err) {
      fastify.log.error(err, 'Error closing database');
    } else {
      fastify.log.info('Database connection closed.');
    }
    fastify.close(() => {
        process.exit(0);
    });
  });
};
process.on('SIGINT', close);
process.on('SIGTERM', close);

start();