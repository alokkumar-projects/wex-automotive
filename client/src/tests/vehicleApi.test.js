import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vehicleApi } from '../api/vehicleApi';
import axios from 'axios';

// Define the mock object before the vi.mock call
const mockAxios = {
  get: vi.fn(),
};

// Mock axios to prevent actual network calls
vi.mock('axios', () => ({
  default: {
    create: () => mockAxios,
  },
}));

describe('vehicleApi', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAxios.get.mockReset();
  });

  it('fetches vehicles with correct parameters', async () => {
    const mockVehicles = [{ id: 1, carName: 'Ford Pinto' }];
    mockAxios.get.mockResolvedValue({ data: mockVehicles });

    const params = { origins: 'USA', cylinders: '4' };
    const vehicles = await vehicleApi.getVehicles(params);

    expect(vehicles).toEqual(mockVehicles);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/vehicles', { params });
  });

  it('fetches stats correctly', async () => {
    const mockStats = { origins: ['USA', 'Japan'] };
    mockAxios.get.mockResolvedValue({ data: mockStats });

    const stats = await vehicleApi.getStats();
    expect(stats).toEqual(mockStats);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/stats');
  });
});
