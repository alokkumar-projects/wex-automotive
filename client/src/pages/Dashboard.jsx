import React, { useState, useEffect, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, Tooltip, Legend } from 'chart.js';
import { vehicleApi } from '../api/vehicleApi.js'; // Import vehicleApi
import LoadingSpinner from '../components/LoadingSpinner.jsx'; // Import a spinner

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

const colorFor = (origin) => ({ USA: 'rgba(37,99,235,0.7)', Europe: 'rgba(34,197,94,0.7)', Japan: 'rgba(239,68,68,0.7)' }[origin] || 'rgba(100,116,139,0.7)');

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a dedicated fetcher for the dashboard data
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        // This is a new function you'll add to your vehicleApi
        const response = await vehicleApi.getScatterPlotData(); 
        setChartData(response);
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const datasets = useMemo(() => {
    if (chartData.length === 0) return [];
    
    return ['USA', 'Europe', 'Japan'].map((o) => ({
      label: o,
      data: chartData.filter(v => v.origin === o && v.mpg != null && v.weight != null).map(v => ({ x: v.weight, y: v.mpg })),
      backgroundColor: colorFor(o),
      pointRadius: 4
    }));
  }, [chartData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="rounded-lg border bg-white p-4">
        <Scatter
          data={{ datasets }}
          options={{
            responsive: true,
            plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `Weight: ${ctx.parsed.x}, MPG: ${ctx.parsed.y}` } } },
            scales: {
              x: { title: { display: true, text: 'Weight' } },
              y: { title: { display: true, text: 'MPG' } }
            }
          }}
        />
      </div>
      <p className="text-sm text-slate-600">
        This scatter plot visualizes the inverse relationship between vehicle weight and MPG, grouped by origin.
      </p>
    </div>
  );
}