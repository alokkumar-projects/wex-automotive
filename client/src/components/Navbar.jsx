import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const link = ({ isActive }) =>
  clsx(
    'px-3 py-2 rounded-md text-sm font-medium',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
  );

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex gap-2">
        <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
        <NavLink to="/gallery" className={link}>Gallery</NavLink>
        <NavLink to="/favorites" className={link}>Favorites</NavLink>
        <div className="grow" />
        <NavLink to="/about" className={link}>About</NavLink>
      </nav>
    </header>
  );
}