import React, { useEffect } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import VehicleCard from '../components/VehicleCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Favorites() {
  const { 
    favorites, 
    favoriteDetails, 
    fetchFavoriteDetails, 
    isLoadingFavorites 
  } = useVehicles();

  // Fetch favorite details whenever the list of favorite IDs changes
  useEffect(() => {
    fetchFavoriteDetails();
  }, [favorites, fetchFavoriteDetails]);

  if (isLoadingFavorites) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Favorites</h1>
      {favoriteDetails.length === 0 ? (
        <p className="text-sm text-slate-600">You haven't added any favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {favoriteDetails.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}