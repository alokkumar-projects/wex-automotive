import React, { useState, useEffect, useMemo } from 'react';
import { Scatter, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, PointElement, LinearScale, Tooltip, Legend, CategoryScale, BarElement } from 'chart.js';
import { vehicleApi } from '../api/vehicleApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useVehicles } from '../store/useVehicles.js';

ChartJS.register(ArcElement, PointElement, LinearScale, CategoryScale, BarElement, Tooltip, Legend);

const colorFor = (origin) => ({ USA: 'rgba(37,99,235,0.7)', Europe: 'rgba(34,197,94,0.7)', Japan: 'rgba(239,68,68,0.7)' }[origin] || 'rgba(100,116,139,0.7)');

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { stats } = useVehicles();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
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
    if (!stats || chartData.length === 0) return [];
    
    return stats.origins.map((o) => ({
      label: o,
      data: chartData.filter(v => v.origin === o && v.mpg != null && v.weight != null).map(v => ({ x: v.weight, y: v.mpg })),
      backgroundColor: colorFor(o),
      pointRadius: 4
    }));
  }, [chartData, stats]);

  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } },
        tooltip: { callbacks: { label: (ctx) => `Weight: ${ctx.parsed.x}, MPG: ${ctx.parsed.y}` } },
      },
      scales: {
        x: {
          title: { display: true, text: 'Weight', color: textColor },
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          title: { display: true, text: 'MPG', color: textColor },
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
      },
    };
  }, [theme]);

  const barData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };

    return {
      labels: Object.keys(stats.avgMpgByYear),
      datasets: [
        {
          label: 'Average MPG',
          data: Object.values(stats.avgMpgByYear),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
      ],
    };
  }, [stats]);

  const pieData = useMemo(() => {
    if (chartData.length === 0) return { labels: [], datasets: [] };

    const originCounts = chartData.reduce((acc, v) => {
      acc[v.origin] = (acc[v.origin] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(originCounts),
      datasets: [
        {
          data: Object.values(originCounts),
          backgroundColor: Object.keys(originCounts).map(o => colorFor(o)),
        },
      ],
    };
  }, [chartData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <Scatter data={{ datasets }} options={chartOptions} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        This scatter plot visualizes the inverse relationship between vehicle weight and MPG, grouped by origin.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 className="text-lg font-semibold mb-2">Average MPG by Year</h2>
          <Bar data={barData} options={{
            ...chartOptions.scales,
            plugins: { legend: { display: false } },
          }} />
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 className="text-lg font-semibold mb-2">Vehicle Origins</h2>
          <Pie data={pieData} options={{
            plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
          }} />
        </div>
      </div>
    </div>
  );
}