import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getStats } from './utils/data.js';
import { vehicleService } from './services/vehicleService.js';

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });


// --- API Route Definitions ---

fastify.get('/', async () => ({ status: 'ok', service: 'wex-automotive-api' }));

/**
 * Route to get calculated statistics for the entire dataset.
 */
fastify.get('/api/stats', async (req, reply) => {
  try {
    const allVehicles = await vehicleService.getAllForStats();
    // The getStats utility is still useful for calculating ranges, averages, etc.
    return getStats(allVehicles);
  } catch (err) {
    fastify.log.error(err, 'Failed to fetch stats');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

/**
 * Route to get a list of vehicles based on query parameters for filtering and sorting.
 */
fastify.get('/api/vehicles', async (req, reply) => {
  try {
    // Pass the entire query object directly to the service
    const vehicles = await vehicleService.getAll(req.query);
    return vehicles;
  } catch (err) {
    fastify.log.error(err, 'Failed to query vehicles');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

/**
 * Route to get a single vehicle by its ID.
 */
fastify.get('/api/vehicles/:id', async (req, reply) => {
  try {
    const id = Number(req.params.id);
    const vehicle = await vehicleService.getById(id);

    if (!vehicle) {
      reply.code(404).send({ error: 'Vehicle not found' });
      return;
    }
    return vehicle;
  } catch (err) {
    fastify.log.error(err, 'Failed to fetch vehicle by ID');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});


// --- Server Start ---
const port = process.env.PORT || 5175;
const host = process.env.HOST || '0.0.0.0';

fastify.listen({ port, host }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});