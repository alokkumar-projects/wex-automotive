import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { vehicleApi } from '../api/vehicleApi';

export const useVehicles = create(
  persist(
    (set, get) => ({
      // State
      stats: null,
      vehicleNames: [],
      filteredVehicles: [],
      isLoading: true,
      error: null,
      favorites: [],
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
          get().fetchFavoriteDetails();
        } catch (e) {
          console.error('Initialization failed', e);
          set({ isLoading: false, error: 'Failed to load initial data.' });
        }
      },
      
      fetchFilteredVehicles: async (filters) => {
        try {
          set({ isLoading: true, error: null, currentFilters: filters });
          const apiParams = { ...filters, page: 1, limit: 20 };
          // This logic correctly converts arrays to strings
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
      
      fetchFavoriteDetails: async () => {
        const { favorites } = get();
        if (favorites.length === 0) {
          set({ favoriteDetails: [] });
          return;
        }
        try {
          set({ isLoadingFavorites: true });
          const details = await vehicleApi.getVehiclesByIds(favorites);
          set({ favoriteDetails: details, isLoadingFavorites: false });
        } catch (e) {
          console.error('Failed to fetch favorite details', e);
          set({ isLoadingFavorites: false });
        }
      },

      toggleFavorite: (id) => {
        const { favorites } = get();
        const exists = favorites.includes(id);
        const newFavorites = exists
          ? favorites.filter((favId) => favId !== id)
          : [...favorites, id];
        
        set({ favorites: newFavorites });
        
        get().fetchFavoriteDetails();
      },
    }),
    {
      name: 'wex-favorites',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);