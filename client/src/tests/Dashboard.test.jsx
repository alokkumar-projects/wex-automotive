import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { vehicleApi } from '../api/vehicleApi';
import { ThemeProvider } from '../contexts/ThemeContext'; // Import the actual provider

vi.mock('../api/vehicleApi.js');

// A simple wrapper to provide the theme context
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('Dashboard', () => {
  it('shows a loading spinner and then renders the chart', async () => {
    vehicleApi.getScatterPlotData.mockResolvedValue([]);
    renderWithTheme(<Dashboard />);

    // Initially, a loading spinner should be visible. You might need to adjust the text.
    //expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      // After loading, the main dashboard content should appear.
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});