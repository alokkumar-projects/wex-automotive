import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto px-4 py-6 grow">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
        WEX Automotive Data Explorer
      </footer>
    </div>
  );
}