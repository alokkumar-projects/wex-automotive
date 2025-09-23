import React, { useState } from 'react';
import { useVehicles } from '../store/useVehicles.js';
import LoadingSpinner from './LoadingSpinner.jsx';

// Import PrimeReact components
import { AutoComplete } from 'primereact/autocomplete';
import { SelectButton } from 'primereact/selectbutton';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';

export default function FilterPanel({ query, setQuery, isLoading }) {
  const { stats, vehicleNames } = useVehicles();
  const [suggestions, setSuggestions] = useState([]);

  if (!stats) {
    return (
      <div className="w-full lg:w-80 shrink-0 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Helper function to ensure range values are numbers for the Slider component
  const getNumericRange = (key, fallbackRange) => {
    const value = query[key];
    if (Array.isArray(value) && value.length === 2 && value.every(v => v != null && !isNaN(v))) {
      return value.map(Number);
    }
    return fallbackRange;
  };

  const searchVehicles = (event) => {
    const query = event.query.toLowerCase();
    const filteredNames = vehicleNames.filter((name) =>
      name.toLowerCase().includes(query)
    );
    setSuggestions(filteredNames);
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
    if (key) {
      setQuery({ sortBy: key, order: direction }, 'replaceIn');
    } else {
      setQuery({ sortBy: undefined, order: undefined }, 'replaceIn');
    }
  };

  const handleClearFilters = () => {
    setQuery({
      searchTerm: undefined,
      origins: undefined,
      cylinders: undefined,
      mpg: undefined,
      weight: undefined,
      horsepower: undefined,
      displacement: undefined,
      acceleration: undefined,
      sortBy: undefined,
      order: undefined,
    });
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
        inputClassName="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
        loading={isLoading}
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
          value={getNumericRange('mpg', stats.mpgRange)}
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
          value={getNumericRange('weight', stats.weightRange)}
          onChange={(e) => handleRangeChange('weight', e.value)}
          min={stats.weightRange[0]}
          max={stats.weightRange[1]}
          range
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm">
          <span>Horsepower</span>
          <span>{query.horsepower ? `${query.horsepower[0]} – ${query.horsepower[1]}` : `${stats.horsepowerRange[0]} – ${stats.horsepowerRange[1]}`}</span>
        </label>
        <Slider
          value={getNumericRange('horsepower', stats.horsepowerRange)}
          onChange={(e) => handleRangeChange('horsepower', e.value)}
          min={stats.horsepowerRange[0]}
          max={stats.horsepowerRange[1]}
          range
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm">
          <span>Displacement</span>
          <span>{query.displacement ? `${query.displacement[0]} – ${query.displacement[1]}` : `${stats.displacementRange[0]} – ${stats.displacementRange[1]}`}</span>
        </label>
        <Slider
          value={getNumericRange('displacement', stats.displacementRange)}
          onChange={(e) => handleRangeChange('displacement', e.value)}
          min={stats.displacementRange[0]}
          max={stats.displacementRange[1]}
          range
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm">
          <span>Acceleration</span>
          <span>{query.acceleration ? `${query.acceleration[0]} – ${query.acceleration[1]}` : `${stats.accelerationRange[0]} – ${stats.accelerationRange[1]}`}</span>
        </label>
        <Slider
          value={getNumericRange('acceleration', stats.accelerationRange)}
          onChange={(e) => handleRangeChange('acceleration', e.value)}
          min={stats.accelerationRange[0]}
          max={stats.accelerationRange[1]}
          step={0.1}
          range
        />
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Sort</div>
        <select
          value={`${query.sortBy || ''}:${query.order || ''}`}
          onChange={handleSortChange}
          className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
        >
          <option value=":">None</option>
          <option value="mpg:desc">MPG (high → low)</option>
          <option value="mpg:asc">MPG (low → high)</option>
          <option value="weight:asc">Weight (low → high)</option>
          <option value="weight:desc">Weight (high → low)</option>
          <option value="horsepower:desc">Horsepower (high → low)</option>
          <option value="modelYear:asc">Year (old → new)</option>
          <option value="modelYear:desc">Year (new → old)</option>
        </select>
      </div>
      <Button label="Clear All Filters" onClick={handleClearFilters} className="p-button-secondary" />
    </div>
  );
}