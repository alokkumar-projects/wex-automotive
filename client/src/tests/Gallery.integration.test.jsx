import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { MemoryRouter } from 'react-router-dom';
import { within } from '@testing-library/dom';

import Gallery from '../pages/Gallery';
import { useVehicles } from '../store/useVehicles.js';
import { vehicleApi } from '../api/vehicleApi.js';

vi.mock('../api/vehicleApi.js');

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
  beforeEach(() => {
    useVehicles.setState({
      stats: mockStats,
      filteredVehicles: mockAllVehicles,
      isLoading: false,
      error: null,
      fetchFilteredVehicles: vi.fn(),
      fetchNextPage: vi.fn(),
      hasMore: true,
    });
    vi.clearAllMocks();
  });

  it('renders vehicles and allows filtering by origin', async () => {
    vehicleApi.getVehicles.mockResolvedValue(mockFilteredVehicles);

    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Gallery />
        </QueryParamProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Ford Pinto')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();

    const originGroup = screen.getByText('Origin').parentElement;
    const japanFilterButton = within(originGroup).getByText('Japan');

    fireEvent.click(japanFilterButton);

    await waitFor(() => {
      // Correctly assert that the function is called with the filters object AND the boolean
      expect(useVehicles.getState().fetchFilteredVehicles).toHaveBeenCalledWith(
        expect.objectContaining({
          origins: ['Japan'],
        }),
        true // This second argument was missing
      );
    });

    useVehicles.setState({ filteredVehicles: mockFilteredVehicles, isLoading: false });

    await waitFor(() => {
      expect(screen.queryByText('Ford Pinto')).not.toBeInTheDocument();
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    });
  });
});