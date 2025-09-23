import React, { useState } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import LoadingSpinner from './LoadingSpinner.jsx';

// Import PrimeReact components
import { AutoComplete } from 'primereact/autocomplete';
import { SelectButton } from 'primereact/selectbutton';
import { Slider } from 'primereact/slider';

export default function FilterPanel({ query, setQuery }) {
  const { stats, vehicleNames } = useVehicles();
  const [suggestions, setSuggestions] = useState([]);

  if (!stats) {
    return (
      <div className="w-full lg:w-80 shrink-0 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  const searchVehicles = (event) => {
    const query = event.query.toLowerCase();
    const _suggestions = vehicleNames
      .filter((v) => v.carName.toLowerCase().includes(query))
      .map((v) => v.carName);
    
    // Get unique suggestions
    setSuggestions([...new Set(_suggestions)]);
  };

  const handleSearchChange = (e) => {
    setQuery({ searchTerm: e.value || undefined }, 'replaceIn');
  };

  const handleMultiSelectChange = (key, value) => {
    setQuery({ [key]: value.length ? value : undefined }, 'replaceIn');
  };

  const handleRangeChange = (key, value) => {
    setQuery({ [key]: value }, 'replaceIn');
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split(':');
    setQuery({ sortBy: key || undefined, order: direction || 'asc' }, 'replaceIn');
  };

  const originOptions = stats.origins.map(o => ({ label: o, value: o }));
  const cylinderOptions = stats.cylinders.map(c => ({ label: c, value: String(c) }));

  return (
    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
      <AutoComplete
        value={query.searchTerm || ''}
        suggestions={suggestions}
        completeMethod={searchVehicles}
        onChange={handleSearchChange}
        onSelect={handleSearchChange}
        placeholder="Search car name..."
        className="w-full"
        inputClassName="w-full border rounded px-3 py-2"
      />

      <div>
        <div className="text-sm font-semibold mb-2">Origin</div>
        <SelectButton 
          value={query.origins || []} 
          options={originOptions} 
          onChange={(e) => handleMultiSelectChange('origins', e.value)} 
          multiple 
        />
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Cylinders</div>
        <SelectButton 
          value={query.cylinders || []} 
          options={cylinderOptions} 
          onChange={(e) => handleMultiSelectChange('cylinders', e.value)} 
          multiple 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm">
          <span>MPG</span>
          <span>{query.mpg ? `${query.mpg[0]} – ${query.mpg[1]}` : `${stats.mpgRange[0]} – ${stats.mpgRange[1]}`}</span>
        </label>
        <Slider 
          value={query.mpg || stats.mpgRange} 
          onChange={(e) => handleRangeChange('mpg', e.value)} 
          min={stats.mpgRange[0]} 
          max={stats.mpgRange[1]} 
          step={0.1} 
          range 
        />
      </div>

       <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm">
          <span>Weight</span>
          <span>{query.weight ? `${query.weight[0]} – ${query.weight[1]}` : `${stats.weightRange[0]} – ${stats.weightRange[1]}`}</span>
        </label>
        <Slider 
          value={query.weight || stats.weightRange} 
          onChange={(e) => handleRangeChange('weight', e.value)} 
          min={stats.weightRange[0]} 
          max={stats.weightRange[1]} 
          range 
        />
      </div>

      {/* Repeat for other sliders: Horsepower, Displacement, etc. */}

      <div>
        <div className="text-sm font-semibold mb-2">Sort</div>
        <select
          value={`${query.sortBy || ''}:${query.order || 'asc'}`}
          onChange={handleSortChange}
          className="border rounded px-3 py-2 w-full bg-white"
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