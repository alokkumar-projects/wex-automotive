import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Gallery from './pages/Gallery.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Favorites from './pages/Favorites.jsx';
import About from './pages/About.jsx';
import { useVehicles } from './store/useVehicles.js';

export default function App() {
  // Fetch all initial data on app load
  useEffect(() => {
    useVehicles.getState().initialize();
  }, []);

  return (
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
  );
}