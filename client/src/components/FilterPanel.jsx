import React from 'react';
import { useVehicles } from '../store/useVehicles.js';

function Range({ label, value, onChange, min, max, step = 1 }) {
  const [lo, hi] = value;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{lo} – {hi}</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => onChange([Number(e.target.value), hi])}
          className="w-full" />
        <input type="range" min={min} max={max} step={step} value={hi}
          onChange={(e) => onChange([lo, Number(e.target.value)])}
          className="w-full" />
      </div>
    </div>
  );
}

export default function FilterPanel() {
  const { stats, filters, setFilter, searchTerm, setSearchTerm, setSortConfig } = useVehicles();

  if (!stats) return null;

  const toggleMulti = (key, value) => {
    const cur = new Set(filters[key]);
    cur.has(value) ? cur.delete(value) : cur.add(value);
    setFilter(key, Array.from(cur));
  };

  return (
    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search car name..."
        className="w-full border rounded px-3 py-2"
      />

      <div>
        <div className="text-sm font-semibold mb-2">Origin</div>
        <div className="flex flex-wrap gap-2">
          {stats.origins.map(o => (
            <label key={o} className={`px-2 py-1 rounded border cursor-pointer ${filters.origins.includes(o) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
              <input type="checkbox" className="hidden" checked={filters.origins.includes(o)} onChange={() => toggleMulti('origins', o)} />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Cylinders</div>
        <div className="flex flex-wrap gap-2">
          {stats.cylinders.map(c => (
            <label key={c} className={`px-2 py-1 rounded border cursor-pointer ${filters.cylinders.includes(c) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
              <input type="checkbox" className="hidden" checked={filters.cylinders.includes(c)} onChange={() => toggleMulti('cylinders', c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <Range label="MPG" value={filters.mpg} min={stats.mpgRange[0]} max={stats.mpgRange[1]} onChange={(v) => setFilter('mpg', v)} step={0.1} />
      <Range label="Weight" value={filters.weight} min={stats.weightRange[0]} max={stats.weightRange[1]} onChange={(v) => setFilter('weight', v)} step={1} />
      <Range label="Horsepower" value={filters.horsepower} min={stats.horsepowerRange[0]} max={stats.horsepowerRange[1]} onChange={(v) => setFilter('horsepower', v)} step={1} />
      <Range label="Displacement" value={filters.displacement} min={stats.displacementRange[0]} max={stats.displacementRange[1]} onChange={(v) => setFilter('displacement', v)} step={1} />
      <Range label="Acceleration" value={filters.acceleration} min={stats.accelerationRange[0]} max={stats.accelerationRange[1]} onChange={(v) => setFilter('acceleration', v)} step={0.1} />
      <Range label="Model Year" value={filters.modelYear} min={stats.modelYearRange[0]} max={stats.modelYearRange[1]} onChange={(v) => setFilter('modelYear', v)} step={1} />

      <div>
        <div className="text-sm font-semibold mb-2">Sort</div>
        <select
          onChange={(e) => {
            const [key, direction] = e.target.value.split(':');
            setSortConfig({ key: key || null, direction: direction || 'asc' });
          }}
          className="border rounded px-3 py-2 w-full"
        >
          <option value=":asc">None</option>
          <option value="mpg:desc">MPG (high → low)</option>
          <option value="mpg:asc">MPG (low → high)</option>
          <option value="weight:asc">Weight (low → high)</option>
          <option value="weight:desc">Weight (high → low)</option>
          <option value="horsepower:desc">Horsepower (high → low)</option>
          <option value="modelYear:asc">Year (old → new)</option>
          <option value="modelYear:desc">Year (new → old)</option>
        </select>
      </div>
    </div>
  );
}