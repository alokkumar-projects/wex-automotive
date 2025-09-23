import React, { useEffect, useCallback } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useQueryParams, StringParam, withDefault, DelimitedArrayParam } from 'use-query-params';
import debounce from 'lodash.debounce';
import VirtualizedVehicleGrid from '../components/VirtualizedVehicleGrid.jsx'; // Import the new component

export default function Gallery() {
  const { filteredVehicles, isLoading, error, hasMore, fetchFilteredVehicles, fetchNextPage } = useVehicles();

  const [query, setQuery] = useQueryParams({
    searchTerm: withDefault(StringParam, ''),
    origins: withDefault(DelimitedArrayParam, []),
    cylinders: withDefault(DelimitedArrayParam, []),
    mpg: DelimitedArrayParam,
    weight: DelimitedArrayParam,
    horsepower: DelimitedArrayParam,
    displacement: DelimitedArrayParam,
    acceleration: DelimitedArrayParam,
    modelYear: DelimitedArrayParam,
    sortBy: withDefault(StringParam, undefined),
    order: withDefault(StringParam, undefined),
  });

  const debouncedFetch = useCallback(
    debounce((filters) => fetchFilteredVehicles(filters, true), 300),
    [fetchFilteredVehicles]
  );

  const queryString = JSON.stringify(query);

  useEffect(() => {
    const queryParams = JSON.parse(queryString);
    debouncedFetch(queryParams);
    return () => debouncedFetch.cancel();
  }, [queryString, debouncedFetch]);

  const renderContent = () => {
    if (error) return <EmptyState message={error} />;
    if (filteredVehicles.length === 0 && !isLoading) {
      return <EmptyState message="No vehicles match the current filters." />;
    }

    return (
      <VirtualizedVehicleGrid
        filteredVehicles={filteredVehicles}
        fetchNextPage={fetchNextPage}
        hasMore={hasMore}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel query={query} setQuery={setQuery} />
      <div className="w-full flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}