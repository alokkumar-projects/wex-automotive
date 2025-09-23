import React from 'react';
import { useVehicles } from '../store/useVehicles.js';
import LoadingSpinner from './LoadingSpinner.jsx';

function Range({ label, value, onChange, min, max, step = 1 }) {
  const id = React.useId();
  // Provide a fallback array to prevent crashes if value is temporarily undefined
  const [lo, hi] = value || [min, max];

  return (
    <div>
      <label id={`${id}-label`} className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{lo} – {hi}</span>
      </label>
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-lo`} className="sr-only">{label} minimum</label>
        <input
          id={`${id}-lo`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Number(e.target.value), hi])}
          className="w-full"
          aria-labelledby={`${id}-label`}
        />
        <label htmlFor={`${id}-hi`} className="sr-only">{label} maximum</label>
        <input
          id={`${id}-hi`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Number(e.target.value)])}
          className="w-full"
          aria-labelledby={`${id}-label`}
        />
      </div>
    </div>
  );
}

export default function FilterPanel({ query, setQuery }) {
  const { stats } = useVehicles();

  if (!stats) {
    return (
      <div className="w-full lg:w-80 shrink-0 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSearchChange = (e) => {
    setQuery({ searchTerm: e.target.value || undefined }, 'replaceIn');
  };

  const toggleMultiSelect = (key, value) => {
    const currentValues = query[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setQuery({ [key]: newValues.length ? newValues : undefined }, 'replaceIn');
  };

  const handleRangeChange = (key, value) => {
    setQuery({ [key]: value }, 'replaceIn');
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split(':');
    setQuery({
      sortBy: key || undefined,
      order: direction || 'asc',
    }, 'replaceIn');
  };

  return (
    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
      <input
        value={query.searchTerm || ''}
        onChange={handleSearchChange}
        placeholder="Search car name..."
        className="w-full border rounded px-3 py-2"
      />

      <div>
        <div className="text-sm font-semibold mb-2">Origin</div>
        <div className="flex flex-wrap gap-2">
          {stats.origins.map(o => (
            <label key={o} className={`px-2 py-1 rounded border cursor-pointer ${(query.origins || []).includes(o) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
              <input type="checkbox" className="hidden" checked={(query.origins || []).includes(o)} onChange={() => toggleMultiSelect('origins', o)} />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Cylinders</div>
        <div className="flex flex-wrap gap-2">
          {stats.cylinders.map(c => (
            <label key={c} className={`px-2 py-1 rounded border cursor-pointer ${(query.cylinders || []).includes(String(c)) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
              <input type="checkbox" className="hidden" checked={(query.cylinders || []).includes(String(c))} onChange={() => toggleMultiSelect('cylinders', String(c))} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <Range label="MPG" value={query.mpg} min={stats.mpgRange[0]} max={stats.mpgRange[1]} onChange={(v) => handleRangeChange('mpg', v)} step={0.1} />
      <Range label="Weight" value={query.weight} min={stats.weightRange[0]} max={stats.weightRange[1]} onChange={(v) => handleRangeChange('weight', v)} step={1} />
      <Range label="Horsepower" value={query.horsepower} min={stats.horsepowerRange[0]} max={stats.horsepowerRange[1]} onChange={(v) => handleRangeChange('horsepower', v)} step={1} />
      <Range label="Displacement" value={query.displacement} min={stats.displacementRange[0]} max={stats.displacementRange[1]} onChange={(v) => handleRangeChange('displacement', v)} step={1} />
      <Range label="Acceleration" value={query.acceleration} min={stats.accelerationRange[0]} max={stats.accelerationRange[1]} onChange={(v) => handleRangeChange('acceleration', v)} step={0.1} />
      <Range label="Model Year" value={query.modelYear} min={stats.modelYearRange[0]} max={stats.modelYearRange[1]} onChange={(v) => handleRangeChange('modelYear', v)} step={1} />

      <div>
        <div className="text-sm font-semibold mb-2">Sort</div>
        <select
          value={`${query.sortBy || ''}:${query.order || 'asc'}`}
          onChange={handleSortChange}
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