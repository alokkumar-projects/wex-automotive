import React, { useEffect, useCallback, useRef } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useQueryParams, StringParam, withDefault, DelimitedArrayParam } from 'use-query-params';
import debounce from 'lodash.debounce';

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

  const observer = useRef();
  const lastVehicleElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchNextPage]);


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
    if (error) {
      return <EmptyState message={error} />;
    }
    if (filteredVehicles.length === 0 && !isLoading) {
      return <EmptyState message="No vehicles match the current filters." />;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((v, index) => {
          if (filteredVehicles.length === index + 1) {
            return <div ref={lastVehicleElementRef} key={v.id}><VehicleCard v={v} /></div>;
          } else {
            return <VehicleCard key={v.id} v={v} />;
          }
        })}
        {isLoading && Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
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