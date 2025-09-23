import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicles } from '../store/useVehicles.js';
import { useVehicleParallax } from '../hooks/useVehicleParallax.js';

export default function VehicleDetail() {
  const { id } = useParams();
  const allVehicles = useVehicles(state => state.allVehicles);

  const v = useMemo(() => allVehicles.find(x => x.id === Number(id)), [allVehicles, id]);
  const { motionStyle, eventHandlers } = useVehicleParallax(v?.acceleration);

  if (!v) {
    return <div>Loading vehicle details...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-xl border bg-gradient-to-br from-slate-800 to-slate-600 text-white p-6 h-64 overflow-hidden relative"
        {...eventHandlers}
      >
        <motion.div style={motionStyle} className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-32 bg-white/10 rounded-2xl blur-md" />
        </motion.div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">{v.carName}</h1>
          <p className="text-sm opacity-80">Origin: {v.origin} • Year: 19{String(v.modelYear).padStart(2, '0')}</p>
          <p className="mt-2 text-sm">Acceleration (0–60s proxy): {v.acceleration}</p>
          <p className="text-xs opacity-70">Parallax responsiveness is driven by the car’s acceleration value.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="rounded border bg-white p-3">MPG: {v.mpg}</div>
        <div className="rounded border bg-white p-3">Weight: {v.weight}</div>
        <div className="rounded border bg-white p-3">Horsepower: {v.horsepower ?? 'NA'}</div>
        <div className="rounded border bg-white p-3">Displacement: {v.displacement}</div>
        <div className="rounded border bg-white p-3">Cylinders: {v.cylinders}</div>
      </div>
    </div>
  );
}