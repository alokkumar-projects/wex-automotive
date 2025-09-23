import React from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../store/useVehicles.js';
import { useAuth } from '../contexts/AuthContext.jsx'; // Import useAuth

const originBadge = (origin) => {
  // ... (code is the same)
};

export default function VehicleCard({ v }) {
  const { favorites, toggleFavorite } = useVehicles();
  const { user } = useAuth(); // Get the current user

  const fav = favorites.includes(v.id);

  const handleToggleFavorite = () => {
    if (user) {
      toggleFavorite(v.id, user.id);
    } else {
      // Optional: redirect to login or show a message
      alert('Please log in to add favorites.');
    }
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-white text-xs px-2 py-1 rounded ${originBadge(v.origin)}`}>{v.origin}</span>
        <button
          onClick={handleToggleFavorite}
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