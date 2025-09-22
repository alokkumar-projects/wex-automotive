import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto px-4 py-6 grow">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-sm text-slate-500 text-center">
        WEX Automotive Data Explorer
      </footer>
    </div>
  );
}