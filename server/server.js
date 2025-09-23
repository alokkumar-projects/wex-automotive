import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { getStats } from './utils/data.js';
import { vehicleService } from './services/vehicleService.js';

// Load environment variables
dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

// --- Centralized Error Handler ---
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  // Send a generic error response
  reply.status(500).send({ error: 'Internal Server Error' });
});

// --- API Schema for Validation ---
const vehicleQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      searchTerm: { type: 'string' },
      origins: { type: 'string' },
      cylinders: { type: 'string' },
      sortBy: { type: 'string', enum: ['mpg', 'weight', 'horsepower', 'modelYear'] },
      order: { type: 'string', enum: ['asc', 'desc'] },
      mpg: { type: 'string', pattern: '^\\d+(\\.\\d+)?,\\d+(\\.\\d+)?$' },
      weight: { type: 'string', pattern: '^\\d+,\\d+$' },
      horsepower: { type: 'string', pattern: '^\\d+,\\d+$' },
      displacement: { type: 'string', pattern: '^\\d+,\\d+$' },
      acceleration: { type: 'string', pattern: '^\\d+(\\.\\d+)?,\\d+(\\.\\d+)?$' },
      modelYear: { type: 'string', pattern: '^\\d+,\\d+$' },
    },
  }
};

// --- API Route Definitions (v1) ---

let statsCache = null;

fastify.get('/', async () => ({ status: 'ok', service: 'wex-automotive-api' }));

fastify.get('/api/v1/stats', async (req, reply) => {
  // Return from cache if it exists
  if (statsCache) {
    fastify.log.info('Returning stats from cache');
    return statsCache;
  }
  const allVehicles = await vehicleService.getAllForStats();
  statsCache = getStats(allVehicles);
  fastify.log.info('Caching new stats result');
  return statsCache;
});

fastify.get('/api/v1/vehicles', { schema: vehicleQuerySchema }, async (req, reply) => {
  const vehicles = await vehicleService.getAll(req.query);
  return vehicles;
});

fastify.get('/api/v1/vehicles/:id', async (req, reply) => {
  const id = Number(req.params.id);
  const vehicle = await vehicleService.getById(id);
  if (!vehicle) {
    return reply.code(404).send({ error: 'Vehicle not found' });
  }
  return vehicle;
});


// --- Server Start ---
const port = process.env.PORT || 5175;
const host = process.env.HOST || '0.0.0.0';

fastify.listen({ port, host }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});