import axios from 'axios';

// Create a pre-configured instance of axios
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const vehicleApi = {
  async login(username, password) {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    return response.data;
  },
  async signup(username, password) {
    const response = await apiClient.post('/api/v1/auth/register', { username, password });
    return response.data;
  },
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
  },
  async getVehicleNames() {
    const response = await apiClient.get('/api/v1/vehicles/names');
    return response.data;
  },
  async getVehiclesByIds(ids) {
    if (ids.length === 0) return [];
    const response = await apiClient.get('/api/v1/vehicles/by-ids', {
      params: { ids: ids.join(',') }
    });
    return response.data;
  },
  async getRelatedVehicles(id) {
    const response = await apiClient.get(`/api/v1/vehicles/${id}/related`);
    return response.data;
  },
  async getFavorites(userId) {
    const response = await apiClient.get(`/api/v1/favorites/${userId}`);
    return response.data;
  },
  async addFavorite(userId, vehicleId) {
    const response = await apiClient.post('/api/v1/favorites', { userId, vehicleId });
    return response.data;
  },
  async removeFavorite(userId, vehicleId) {
    const response = await apiClient.delete('/api/v1/favorites', { data: { userId, vehicleId } });
    return response.data;
  }
};