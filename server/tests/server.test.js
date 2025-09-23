import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import app from '../server'; // Assuming your server.js exports the fastify instance

describe('Server API', () => {
  let server;

  beforeAll(async () => {
    server = Fastify();
    server.register(app);
    await server.ready();
  });

  afterAll(() => {
    server.close();
  });

  it('GET /api/v1/vehicles returns a successful response', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/vehicles',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toBeInstanceOf(Array);
  });

  it('GET /api/v1/stats returns a successful response', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/stats',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toBeInstanceOf(Object);
  });
});