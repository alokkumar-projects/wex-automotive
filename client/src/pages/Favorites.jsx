import React, { useEffect } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import VehicleCard from '../components/VehicleCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Favorites() {
  const { 
    favoriteDetails, 
    fetchUserFavorites, 
    isLoadingFavorites 
  } = useVehicles();
  
  const { user } = useAuth();

  // Fetch this user's favorites when the component mounts or the user changes
  useEffect(() => {
    if (user) {
      fetchUserFavorites(user.id);
    }
  }, [user, fetchUserFavorites]);

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