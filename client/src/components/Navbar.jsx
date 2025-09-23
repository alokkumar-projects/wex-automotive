import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import ThemeToggler from './ThemeToggler';

const link = ({ isActive }) =>
  clsx(
    'px-3 py-2 rounded-md text-sm font-medium',
    isActive
      ? 'bg-slate-900 text-white dark:bg-slate-700'
      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700'
  );

export default function Navbar() {
  return (
    <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex gap-2 items-center">
        <NavLink to="/dashboard" className={link}>
          Dashboard
        </NavLink>
        <NavLink to="/gallery" className={link}>
          Gallery
        </NavLink>
        <NavLink to="/favorites" className={link}>
          Favorites
        </NavLink>
        <div className="grow" />
        <ThemeToggler />
        <NavLink to="/about" className={link}>
          About
        </NavLink>
      </nav>
    </header>
  );
}