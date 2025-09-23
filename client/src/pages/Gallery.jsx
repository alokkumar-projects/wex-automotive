import React, { useEffect, useCallback } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useQueryParams, StringParam, ArrayParam, withDefault } from 'use-query-params';
import debounce from 'lodash.debounce';

export default function Gallery() {
  const { filteredVehicles, isLoading, error } = useVehicles();
  
  // This hook gets the function from the store once.
  const fetchFilteredVehicles = useVehicles(state => state.fetchFilteredVehicles);

  const [query, setQuery] = useQueryParams({
    searchTerm: withDefault(StringParam, ''),
    origins: withDefault(ArrayParam, []),
    cylinders: withDefault(ArrayParam, []),
    // Define all other possible query params to make the hook aware of them
    mpg: withDefault(ArrayParam, undefined),
    weight: withDefault(ArrayParam, undefined),
    horsepower: withDefault(ArrayParam, undefined),
    displacement: withDefault(ArrayParam, undefined),
    acceleration: withDefault(ArrayParam, undefined),
    modelYear: withDefault(ArrayParam, undefined),
    sortBy: withDefault(StringParam, undefined),
    order: withDefault(StringParam, undefined),
  });

  // Create a stable, debounced version of the fetch function using useCallback.
  // This is the key to preventing the infinite loop.
  const debouncedFetch = useCallback(
    debounce((filters) => {
      fetchFilteredVehicles(filters);
    }, 300), // 300ms delay
    [fetchFilteredVehicles] // This dependency array ensures the debounced function is stable
  );

  useEffect(() => {
    // Call the debounced fetcher whenever the URL query changes.
    debouncedFetch(query);

    // This cleanup function is important: it cancels any pending debounced call
    // if the component unmounts before the timer finishes.
    return () => {
      debouncedFetch.cancel();
    };
  }, [query, debouncedFetch]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel query={query} setQuery={setQuery} />
      <div className="w-full">
        {/* Show a spinner only on the initial page load for a better UX */}
        {isLoading && filteredVehicles.length === 0 ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : filteredVehicles.length === 0 ? (
            <p className="text-slate-600 text-center">No vehicles match the current filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVehicles.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}