import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard.jsx'; // Corrected import path

// Mock the zustand store
vi.mock('../store/useVehicles.js', () => ({
  useVehicles: () => ({
    favorites: [],
    toggleFavorite: () => {},
  }),
}));

describe('VehicleCard', () => {
  const mockVehicle = {
    id: 1,
    carName: 'Chevrolet Chevelle Malibu',
    origin: 'USA',
    modelYear: 70,
    mpg: 18,
    weight: 3504,
  };

  it('renders vehicle information correctly', () => {
    render(
      <BrowserRouter>
        <VehicleCard v={mockVehicle} />
      </BrowserRouter>
    );

    expect(screen.getByText('Chevrolet Chevelle Malibu')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText(/MPG: 18/)).toBeInTheDocument();
    expect(screen.getByText(/Year: 1970/)).toBeInTheDocument();
    expect(screen.getByText(/Weight: 3504/)).toBeInTheDocument();
  });
});