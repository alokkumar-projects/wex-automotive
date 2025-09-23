import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VehicleDetail from '../pages/VehicleDetail';
import { vehicleApi } from '../api/vehicleApi';

vi.mock('../api/vehicleApi.js');

describe('VehicleDetail', () => {
  it('fetches and displays vehicle details', async () => {
    const mockVehicle = { id: 1, carName: 'Ford Pinto', origin: 'USA' };
    vehicleApi.getVehiclesByIds.mockResolvedValue([mockVehicle]);

    render(
      <MemoryRouter initialEntries={['/vehicle/1']}>
        <Routes>
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      //expect(screen.getByText('Ford Pinto')).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });
  });
});