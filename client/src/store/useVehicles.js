import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import debounce from 'lodash.debounce';
import { vehicleApi } from '../api/vehicleApi';

const debouncedFetch = debounce((get) => {
  get().fetchFilteredVehicles();
}, 300);

export const useVehicles = create(
  persist(
    (set, get) => ({
      // State
      stats: null,
      allVehicles: [],
      filteredVehicles: [],
      isLoading: true,
      error: null,
      favorites: [],

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          const [statsRes, allVehiclesRes] = await Promise.all([
            vehicleApi.getStats(),
            vehicleApi.getVehicles(),
          ]);

          set(state => ({
            stats: statsRes,
            allVehicles: allVehiclesRes,
            filteredVehicles: allVehiclesRes,
            isLoading: false,
            // ... (rest of the state update is the same)
          }));
        } catch (e) {
          console.error('Initialization failed', e);
          set({ isLoading: false, error: 'Failed to load vehicle data.' });
        }
      },
      
      fetchFilteredVehicles: async (filters) => {
        try {
          set({ isLoading: true, error: null });
          const vehiclesRes = await vehicleApi.getVehicles(filters);
          set({ filteredVehicles: vehiclesRes, isLoading: false });
        } catch (e) {
          console.error('Fetch filtered failed', e);
          set({ isLoading: false, error: 'Failed to filter vehicles.' });
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