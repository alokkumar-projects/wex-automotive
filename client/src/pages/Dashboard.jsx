import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, Tooltip, Legend } from 'chart.js';
import { useVehicles } from '../store/useVehicles.js';

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

const colorFor = (origin) => ({ USA: 'rgba(37,99,235,0.7)', Europe: 'rgba(34,197,94,0.7)', Japan: 'rgba(239,68,68,0.7)' }[origin] || 'rgba(100,116,139,0.7)');

export default function Dashboard() {
  const { vehicles } = useVehicles();

  const datasets = ['USA', 'Europe', 'Japan'].map((o) => ({
    label: o,
    data: vehicles.filter(v => v.origin === o && v.mpg != null && v.weight != null).map(v => ({ x: v.weight, y: v.mpg })),
    backgroundColor: colorFor(o),
    pointRadius: 4
  }));

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
        This scatter plot visualizes the inverse relationship between vehicle weight and MPG, grouped by origin as planned.
      </p>
    </div>
  );
}