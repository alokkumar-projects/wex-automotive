import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useVehicles } from '../store/useVehicles.js';

function physicsForAcceleration(acc) {
  const a = Math.max(8, Math.min(25, acc ?? 16));
  const t = (25 - a) / (25 - 8);
  const stiffness = 80 + t * 220;
  const damping = 30 - t * 15;
  return { stiffness, damping };
}

export default function VehicleDetail() {
  const { id } = useParams();
  const { vehicles, fetchAll } = useVehicles();

  useEffect(() => { if (!vehicles.length) fetchAll(); }, [vehicles.length, fetchAll]);

  const v = useMemo(() => vehicles.find(x => x.id === Number(id)), [vehicles, id]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { stiffness, damping } = physicsForAcceleration(v?.acceleration);
  const tx = useSpring(mx, { stiffness, damping });
  const ty = useSpring(my, { stiffness, damping });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    mx.set(dx * 30);
    my.set(dy * 30);
  };

  if (!v) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-xl border bg-gradient-to-br from-slate-800 to-slate-600 text-white p-6 h-64 overflow-hidden relative"
        onMouseMove={onMove}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
      >
        <motion.div
          style={{ x: tx, y: ty }}
          className="absolute inset-0 flex items-center justify-center"
        >
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