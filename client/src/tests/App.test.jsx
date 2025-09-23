import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, vi as vitest } from 'vitest';
import App from '../App';

// Mock the zustand store
vi.mock('../store/useVehicles.js', () => ({
  useVehicles: {
    getState: () => ({
      initialize: vi.fn(),
    }),
  },
}));

// Define the mock provider component before using it in the mock factory
const MockThemeProvider = ({ children }) => <div>{children}</div>;

// Mock the ThemeProvider context
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
  ThemeProvider: MockThemeProvider,
}));

describe('App', () => {
  it('renders the main layout and navigates to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Check that the app initializes the vehicle store
    expect(useVehicles.getState().initialize).toHaveBeenCalled();

    // Check that a layout element (like the navbar) is present
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
