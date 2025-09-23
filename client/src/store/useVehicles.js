import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import debounce from 'lodash.debounce';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');
const api = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

const debouncedFetch = debounce((get) => {
  get().fetchFilteredVehicles();
}, 300);

export const useVehicles = create(
  persist(
    (set, get) => ({
      // Data
      stats: null,
      allVehicles: [], // Master list for lookups
      filteredVehicles: [], // List for the gallery
      error: null,
      
      // UI State
      filters: {
        origins: [],
        cylinders: [],
        mpg: [0, 0],
        weight: [0, 0],
        horsepower: [0, 0],
        displacement: [0, 0],
        acceleration: [0, 0],
        modelYear: [0, 0],
      },
      searchTerm: '',
      sortConfig: { key: null, direction: 'asc' },
      favorites: [],

      // Actions
      initialize: async () => {
        try {
          const [statsRes, allVehiclesRes] = await Promise.all([
            fetch(api('/api/stats')).then(r => r.json()),
            fetch(api('/api/vehicles')).then(r => r.json()) // Fetch all vehicles once
          ]);

          set(state => ({
            stats: statsRes,
            allVehicles: allVehiclesRes,
            filteredVehicles: allVehiclesRes, // Initially, filtered is the same as all
            filters: {
              ...state.filters,
              mpg: statsRes.mpgRange.map(v => v ?? 0),
              weight: statsRes.weightRange.map(v => v ?? 0),
              horsepower: statsRes.horsepowerRange.map(v => v ?? 0),
              displacement: statsRes.displacementRange.map(v => v ?? 0),
              acceleration: statsRes.accelerationRange.map(v => v ?? 0),
              modelYear: statsRes.modelYearRange.map(v => v ?? 0),
            }
          }));
        } catch (e) {
          console.error('Initialization failed', e);
          set({ error: String(e) });
        }
      },

      fetchFilteredVehicles: async () => {
        const { filters, searchTerm, sortConfig } = get();
        const params = new URLSearchParams();

        if (searchTerm) params.set('searchTerm', searchTerm);
        if (filters.origins.length) params.set('origins', filters.origins.join(','));
        if (filters.cylinders.length) params.set('cylinders', filters.cylinders.join(','));
        
        if (filters.mpg) params.set('mpg', filters.mpg.join(','));
        if (filters.weight) params.set('weight', filters.weight.join(','));
        if (filters.horsepower) params.set('horsepower', filters.horsepower.join(','));
        if (filters.displacement) params.set('displacement', filters.displacement.join(','));
        if (filters.acceleration) params.set('acceleration', filters.acceleration.join(','));
        if (filters.modelYear) params.set('modelYear', filters.modelYear.join(','));

        if (sortConfig.key) {
          params.set('sortBy', sortConfig.key);
          params.set('order', sortConfig.direction);
        }

        try {
          const vehiclesRes = await fetch(api(`/api/vehicles?${params.toString()}`)).then(r => r.json());
          set({ filteredVehicles: vehiclesRes, error: null });
        } catch (e) {
          console.error('fetchFilteredVehicles failed', e);
          set({ error: String(e) });
        }
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term });
        debouncedFetch(get);
      },

      setFilter: (key, value) => {
        set((s) => ({ filters: { ...s.filters, [key]: value } }));
        if (Array.isArray(value) && value.length === 2) {
          debouncedFetch(get);
        } else {
          get().fetchFilteredVehicles();
        }
      },
      
      setSortConfig: (cfg) => {
        set({ sortConfig: cfg });
        get().fetchFilteredVehicles();
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