import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { vehicleApi } from '../api/vehicleApi';

export const useVehicles = create(
  persist(
    (set, get) => ({
      // State
      stats: null,
      filteredVehicles: [],
      isLoading: true,
      error: null,
      favorites: [],
      page: 1,
      hasMore: true,
      currentFilters: {}, // Keep track of the current filters

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          const [statsRes] = await Promise.all([
            vehicleApi.getStats(),
          ]);

          set({
            stats: statsRes,
            isLoading: false,
          });
          get().fetchFilteredVehicles({}, true); // Initial fetch
        } catch (e) {
          console.error('Initialization failed', e);
          set({ isLoading: false, error: 'Failed to load vehicle data.' });
        }
      },
      
      fetchFilteredVehicles: async (filters, reset = false) => {
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
            page: 2, // The next page to fetch will be page 2
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
      
      toggleFavorite: (id) => {
        set((s) => {
          const exists = s.favorites.includes(id);
          const favorites = exists ? s.favorites.filter(x => x !== id) : [...s.favorites, id];
          return { favorites };
        });
      },
    }),
    {
      name: 'wex-favorites',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);