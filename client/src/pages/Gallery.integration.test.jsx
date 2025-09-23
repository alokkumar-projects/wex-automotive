import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { MemoryRouter } from 'react-router-dom';
import { within } from '@testing-library/dom';

import Gallery from './Gallery';
import { useVehicles } from '../store/useVehicles.js';
import { vehicleApi } from '../api/vehicleApi.js';

// Mock the entire API module to prevent real network calls
vi.mock('../api/vehicleApi.js');

// A complete mock stats object to prevent crashes
const mockStats = {
  origins: ['USA', 'Japan', 'Europe'],
  cylinders: [3, 4, 5, 6, 8],
  mpgRange: [9, 46.6],
  weightRange: [1613, 5140],
  horsepowerRange: [46, 230],
  displacementRange: [68, 455],
  accelerationRange: [8, 24.8],
  modelYearRange: [70, 82],
};

const mockAllVehicles = [
  { id: 1, carName: 'Ford Pinto', origin: 'USA', cylinders: 4 },
  { id: 2, carName: 'Toyota Corolla', origin: 'Japan', cylinders: 4 },
];

const mockFilteredVehicles = [
  { id: 2, carName: 'Toyota Corolla', origin: 'Japan', cylinders: 4 },
];

describe('Gallery Integration Test', () => {

  // Before each test, reset the state of the store and API mocks
  beforeEach(() => {
    useVehicles.setState({
      stats: mockStats,
      allVehicles: mockAllVehicles,
      filteredVehicles: mockAllVehicles, // Start with all vehicles showing
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('renders vehicles and allows filtering by origin', async () => {
    // Mock the API to return only the Japanese car when it's called with filters
    vehicleApi.getVehicles.mockResolvedValue(mockFilteredVehicles);
    
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Gallery />
        </QueryParamProvider>
      </MemoryRouter>
    );

    // 1. Check that both vehicles are initially rendered
    expect(screen.getByText('Ford Pinto')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();

    // 2. Find the "Origin" filter section's parent element
    const originGroup = screen.getByText('Origin').parentElement;
    
    // THE FIX: Find the "Japan" button *within* the specific origin group
    const japanFilterButton = within(originGroup).getByText('Japan');
    
    // 3. Simulate a user clicking the filter button
    fireEvent.click(japanFilterButton);

    // 4. Wait for the debounced API call to be made
    await waitFor(() => {
      // Assert that our API was called with the correct parameters
      expect(vehicleApi.getVehicles).toHaveBeenCalledWith(
        expect.objectContaining({
          origins: 'Japan', // use-query-params sends this as a comma-separated string
        })
      );
    });

    // We must manually update the store's state to simulate the API response
    useVehicles.setState({ filteredVehicles: mockFilteredVehicles, isLoading: false });

    // 5. Assert that the UI has updated to show only the filtered vehicle
    // We use queryByText because we expect "Ford Pinto" to NOT be in the document
    await waitFor(() => {
        expect(screen.queryByText('Ford Pinto')).not.toBeInTheDocument();
        expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });
  });
});