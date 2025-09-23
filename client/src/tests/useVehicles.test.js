import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVehicles } from '../store/useVehicles';
import { vehicleApi } from '../api/vehicleApi';

// Mock the entire API module
vi.mock('../api/vehicleApi');

describe('useVehicles Store', () => {
  beforeEach(() => {
    // Reset the store state and mocks before each test
    useVehicles.setState({
      favorites: [],
      favoriteDetails: [],
    });
    vi.clearAllMocks();
  });

  it('toggles a favorite vehicle', () => {
    const { toggleFavorite } = useVehicles.getState();
    toggleFavorite(1);
    expect(useVehicles.getState().favorites).toContain(1);

    toggleFavorite(1);
    expect(useVehicles.getState().favorites).not.toContain(1);
  });

  it('fetches favorite details and updates the store', async () => {
    const mockFavorites = [{ id: 1, carName: 'Ford Pinto' }];
    vehicleApi.getVehiclesByIds.mockResolvedValue(mockFavorites);

    // Set a favorite before fetching details
    useVehicles.setState({ favorites: [1] });

    const { fetchFavoriteDetails } = useVehicles.getState();
    await fetchFavoriteDetails();

    expect(useVehicles.getState().favoriteDetails).toEqual(mockFavorites);
    expect(useVehicles.getState().isLoadingFavorites).toBe(false);
  });
});