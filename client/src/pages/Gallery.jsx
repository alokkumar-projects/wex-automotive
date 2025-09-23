import React from 'react';
import { useVehicles } from '../store/useVehicles.js';
import FilterPanel from '../components/FilterPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';

export default function Gallery() {
  const { filteredVehicles } = useVehicles();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <FilterPanel />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {filteredVehicles.map(v => <VehicleCard key={v.id} v={v} />)}
      </div>
    </div>
  );
}