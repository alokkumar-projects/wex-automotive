import axios from 'axios';

// Create a pre-configured instance of axios
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const vehicleApi = {
  async getStats() {
    const response = await apiClient.get('/api/v1/stats');
    return response.data;
  },
  async getVehicles(params) {
    const response = await apiClient.get('/api/v1/vehicles', { params });
    return response.data;
  },
  async getScatterPlotData() {
    const response = await apiClient.get('/api/v1/vehicles/scatter-plot');
    return response.data;
  }
};