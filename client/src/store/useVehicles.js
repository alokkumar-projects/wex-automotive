import { create } from 'zustand';
import { vehicleApi } from '../api/vehicleApi';

export const useVehicles = create(
    (set, get) => ({
      // State
      stats: null,
      vehicleNames: [],
      filteredVehicles: [],
      isLoading: true,
      error: null,
      favorites: [], // Will now store just IDs, fetched from DB
      favoriteDetails: [],
      isLoadingFavorites: false,
      page: 1,
      hasMore: true,
      currentFilters: {},

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          const [statsRes, namesRes] = await Promise.all([
            vehicleApi.getStats(),
            vehicleApi.getVehicleNames(),
          ]);
          set({ stats: statsRes, vehicleNames: namesRes });
        } catch (e) {
          console.error('Initialization failed', e);
          set({ isLoading: false, error: 'Failed to load initial data.' });
        }
      },
      
      fetchUserFavorites: async (userId) => {
        if (!userId) {
          set({ favorites: [], favoriteDetails: [] });
          return;
        }
        try {
          set({ isLoadingFavorites: true });
          const details = await vehicleApi.getFavorites(userId);
          set({
            favoriteDetails: details,
            favorites: details.map(v => v.id), // Store just the IDs
            isLoadingFavorites: false,
          });
        } catch (e) {
          console.error('Failed to fetch user favorites', e);
          set({ isLoadingFavorites: false });
        }
      },

      toggleFavorite: async (vehicleId, userId) => {
        const { favorites, fetchUserFavorites } = get();
        const isFavorite = favorites.includes(vehicleId);

        try {
          if (isFavorite) {
            await vehicleApi.removeFavorite(userId, vehicleId);
          } else {
            await vehicleApi.addFavorite(userId, vehicleId);
          }
          // Refetch favorites to ensure state is in sync with the DB
          await fetchUserFavorites(userId);
        } catch (e) {
          console.error('Failed to toggle favorite', e);
        }
      },

      clearFavorites: () => {
        set({ favorites: [], favoriteDetails: [] });
      },

      // Other actions like fetchFilteredVehicles and fetchNextPage remain the same...
      fetchFilteredVehicles: async (filters) => {
        try {
          set({ isLoading: true, error: null, currentFilters: filters });
          const apiParams = { ...filters, page: 1, limit: 20 };
          for (const key in apiParams) {
            if (Array.isArray(apiParams[key])) {
              apiParams[key] = apiParams[key].join(',');
            }
          }
          const vehiclesRes = await vehicleApi.getVehicles(apiParams);
          set({
            filteredVehicles: vehiclesRes,
            isLoading: false,
            page: 2,
            hasMore: vehiclesRes.length > 0,
          });
        } catch (e) {
          console.error('Fetch filtered failed', e);
          set({ isLoading: false, error: 'Failed to filter vehicles.' });
        }
      },

      fetchNextPage: async () => {
        const { page, hasMore, isLoading, currentFilters } = get();
        if (isLoading || !hasMore) return;

        try {
          set({ isLoading: true });
          const apiParams = { ...currentFilters, page, limit: 20 };
          for (const key in apiParams) {
            if (Array.isArray(apiParams[key])) {
              apiParams[key] = apiParams[key].join(',');
            }
          }

          const vehiclesRes = await vehicleApi.getVehicles(apiParams);
          set((state) => ({
            filteredVehicles: [...state.filteredVehicles, ...vehiclesRes],
            isLoading: false,
            page: state.page + 1,
            hasMore: vehiclesRes.length > 0,
          }));
        } catch (e) {
          console.error('Fetch next page failed', e);
          set({ isLoading: false, error: 'Failed to load more vehicles.' });
        }
      },
    })
);