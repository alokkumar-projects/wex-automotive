import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicleParallax } from '../hooks/useVehicleParallax.js';
import { vehicleApi } from '../api/vehicleApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useVehicles } from '../store/useVehicles.js';
import { Button } from 'primereact/button';
import VehicleCard from '../components/VehicleCard.jsx';

// Import PrimeReact components
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Fieldset } from 'primereact/fieldset';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const { motionStyle, onMove, onLeave } = useVehicleParallax(vehicle?.acceleration);
  const { favorites, toggleFavorite } = useVehicles();
  const isFavorite = favorites.includes(Number(id));

  useEffect(() => {
    const fetchVehicleData = async () => {
      setVehicle(null); // Reset on ID change
      const [vehicleData, relatedData] = await Promise.all([
        vehicleApi.getVehiclesByIds([id]),
        vehicleApi.getRelatedVehicles(id)
      ]);
      setVehicle(vehicleData[0]);
      setRelatedVehicles(relatedData);
    };
    fetchVehicleData();
  }, [id]);
  
  const getSeverityForOrigin = (origin) => {
    const map = { USA: 'info', Europe: 'success', Japan: 'danger' };
    return map[origin] || 'secondary';
  };

  if (!vehicle) {
    return <LoadingSpinner />;
  }

  const header = (
    <div onMouseMove={onMove} onMouseLeave={onLeave} className="h-64 overflow-hidden relative bg-slate-700">
       <motion.div style={motionStyle} className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-32 bg-white/10 rounded-2xl blur-md" />
        </motion.div>
    </div>
  );

  const title = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Tag severity={getSeverityForOrigin(vehicle.origin)} value={vehicle.origin}></Tag>
        <span className="text-2xl font-bold">{vehicle.carName}</span>
      </div>
      <Button
        icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
        rounded
        text
        severity="danger"
        aria-label="Favorite"
        onClick={() => toggleFavorite(vehicle.id)}
      />
    </div>
  );

  const subTitle = `Year: 19${String(vehicle.modelYear).padStart(2, '0')} • Acceleration: ${vehicle.acceleration}s`;

  return (
    <>
      <Card title={title} subTitle={subTitle} header={header}>
        <Fieldset legend="Vehicle Specifications">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <div className="text-center">
              <div className="text-sm text-slate-500">MPG</div>
              <div className="text-xl font-semibold">{vehicle.mpg}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500">Weight</div>
              <div className="text-xl font-semibold">{vehicle.weight} lbs</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500">Horsepower</div>
              <div className="text-xl font-semibold">{vehicle.horsepower ?? 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500">Displacement</div>
              <div className="text-xl font-semibold">{vehicle.displacement}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-500">Cylinders</div>
              <div className="text-xl font-semibold">{vehicle.cylinders}</div>
            </div>
          </div>
        </Fieldset>
      </Card>

      {relatedVehicles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Vehicles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedVehicles.map(v => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}