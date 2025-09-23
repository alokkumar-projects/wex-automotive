import React, { useEffect, useCallback } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useQueryParams, StringParam, ArrayParam, withDefault, DelimitedArrayParam } from 'use-query-params';
import debounce from 'lodash.debounce';

export default function Gallery() {
  const { filteredVehicles, isLoading, error } = useVehicles();
  const fetchFilteredVehicles = useVehicles(state => state.fetchFilteredVehicles);

  const [query, setQuery] = useQueryParams({
    searchTerm: withDefault(StringParam, ''),
    origins: withDefault(ArrayParam, []),
    cylinders: withDefault(ArrayParam, []),
    mpg: DelimitedArrayParam,
    weight: DelimitedArrayParam,
    horsepower: DelimitedArrayParam,
    displacement: DelimitedArrayParam,
    acceleration: DelimitedArrayParam,
    modelYear: DelimitedArrayParam,
    sortBy: withDefault(StringParam, undefined),
    order: withDefault(StringParam, undefined),
  });

  // Use useCallback to ensure the debounced function reference is stable
  const debouncedFetch = useCallback(
    debounce((filters) => fetchFilteredVehicles(filters), 300),
    [fetchFilteredVehicles]
  );

  // THE FIX: Stabilize the useEffect dependency by stringifying the query object.
  const queryString = JSON.stringify(query);

  useEffect(() => {
    // We parse the string back into an object to pass to the fetch function
    const queryParams = JSON.parse(queryString);
    debouncedFetch(queryParams);

    return () => debouncedFetch.cancel();
  }, [queryString, debouncedFetch]); // Now this only runs when the URL content actually changes.

  const renderContent = () => {
    if (isLoading && filteredVehicles.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      );
    }
    if (error) {
      return <EmptyState message={error} />;
    }
    if (!isLoading && filteredVehicles.length === 0) {
      return <EmptyState message="No vehicles match the current filters." />;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map(v => <VehicleCard key={v.id} v={v} />)}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel query={query} setQuery={setQuery} />
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}