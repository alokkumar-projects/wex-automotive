import React, { useEffect, useCallback } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useQueryParams, StringParam, withDefault, DelimitedArrayParam } from 'use-query-params';
import debounce from 'lodash.debounce';
import VirtualizedVehicleGrid from '../components/VirtualizedVehicleGrid.jsx';

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
  
    const isRefetching = isLoading && filteredVehicles.length > 0;
  
    if (filteredVehicles.length === 0 && !isLoading) {
      return <EmptyState message="No vehicles match the current filters." />;
    }
  
    return (
      <div className="relative w-full h-[calc(100vh-200px)]">
        <VirtualizedVehicleGrid
          filteredVehicles={filteredVehicles}
          fetchNextPage={fetchNextPage}
          hasMore={hasMore}
          isLoading={isLoading}
        />
        {isRefetching && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-50"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel query={query} setQuery={setQuery} isLoading={isLoading} />
      <div className="w-full flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}