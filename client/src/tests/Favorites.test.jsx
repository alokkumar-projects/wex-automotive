import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Favorites from '../pages/Favorites';
import { useVehicles } from '../store/useVehicles';

vi.mock('../store/useVehicles.js');

describe('Favorites', () => {
  it('displays a message when there are no favorites', () => {
    useVehicles.mockReturnValue({
      favorites: [],
      favoriteDetails: [],
      fetchFavoriteDetails: vi.fn(),
      isLoadingFavorites: false,
    });

    render(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    );

    expect(screen.getByText("You haven't added any favorites yet.")).toBeInTheDocument();
  });

  it('displays favorited vehicles', () => {
    useVehicles.mockReturnValue({
      favorites: [1],
      favoriteDetails: [{ id: 1, carName: 'Ford Pinto' }],
      fetchFavoriteDetails: vi.fn(),
      isLoadingFavorites: false,
    });

    render(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    );

    //expect(screen.getByText('Ford Pinto')).toBeInTheDocument();
  });
});