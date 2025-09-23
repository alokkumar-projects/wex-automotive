import React from 'react';
import { useVehicles } from '../store/useVehicles.js';
import VehicleCard from '../components/VehicleCard.jsx';

export default function Favorites() {
  const { favorites, allVehicles } = useVehicles();

  const favs = allVehicles.filter(v => favorites.includes(v.id));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Favorites</h1>
      {favs.length === 0 ? (
        <p className="text-sm text-slate-600">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {favs.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}