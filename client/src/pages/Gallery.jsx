import React, { useEffect } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useQueryParams, StringParam, ArrayParam, withDefault } from 'use-query-params';

export default function Gallery() {
  const { filteredVehicles, isLoading, error, fetchFilteredVehicles } = useVehicles();
  
  const [query, setQuery] = useQueryParams({
    searchTerm: withDefault(StringParam, ''),
    origins: withDefault(ArrayParam, []),
    cylinders: withDefault(ArrayParam, []),
  });

  useEffect(() => {
    fetchFilteredVehicles(query);
  }, [query, fetchFilteredVehicles]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel query={query} setQuery={setQuery} />
      <div className="w-full">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVehicles.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}