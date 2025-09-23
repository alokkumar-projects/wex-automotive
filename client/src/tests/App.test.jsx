import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
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
  it('renders the main application and navigates to the dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('WEX Automotive Data Explorer')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});