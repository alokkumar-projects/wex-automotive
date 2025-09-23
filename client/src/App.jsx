import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useVehicles } from './store/useVehicles.js';

// Lazy load pages for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const Gallery = React.lazy(() => import('./pages/Gallery.jsx'));
const VehicleDetail = React.lazy(() => import('./pages/VehicleDetail.jsx'));
const Favorites = React.lazy(() => import('./pages/Favorites.jsx'));
const About = React.lazy(() => import('./pages/About.jsx'));

export default function App() {
  useEffect(() => {
    useVehicles.getState().initialize();
  }, []);

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </Suspense>
  );
}