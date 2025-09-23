import React from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../store/useVehicles.js';

const originBadge = (origin) => {
  const map = { USA: 'bg-blue-600', Europe: 'bg-green-600', Japan: 'bg-red-600' };
  return map[origin] || 'bg-slate-600';
};

export default function VehicleCard({ v }) {
  const { favorites, toggleFavorite } = useVehicles();

  const fav = favorites.includes(v.id);

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-white text-xs px-2 py-1 rounded ${originBadge(v.origin)}`}>{v.origin}</span>
        <button
          onClick={() => toggleFavorite(v.id)}
          className={`text-sm ${fav ? 'text-yellow-500' : 'text-slate-400'} hover:text-yellow-600`}
          title="Toggle favorite"
        >
          ★
        </button>
      </div>
      <Link to={`/vehicle/${v.id}`} className="text-base font-semibold hover:underline text-slate-900 dark:text-slate-50">
        {v.carName}
      </Link>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        <div>MPG: {v.mpg}</div>
        <div>Year: 19{String(v.modelYear).padStart(2, '0')}</div>
        <div>Weight: {v.weight}</div>
      </div>
    </div>
  );
}