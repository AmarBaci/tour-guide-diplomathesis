import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

/**
 * Dark / Light mode toggle button.
 * Drop it anywhere — reads/writes from DarkModeContext.
 */
export default function DarkModeToggle({ className = '' }) {
  const { dark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300
        ${dark ? 'bg-blue-600' : 'bg-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      <span
        className={`
          absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow
          transition-transform duration-300
          ${dark ? 'translate-x-5' : 'translate-x-0'}
          flex items-center justify-center text-xs
        `}
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
