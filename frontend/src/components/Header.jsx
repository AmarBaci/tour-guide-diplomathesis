import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from './shared/DarkModeToggle';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transparent = isLanding && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🦅</span>
          <span className={`text-lg font-bold tracking-tight ${
            transparent ? 'text-white' : 'text-blue-700 dark:text-blue-400'
          }`}>
            Albania Tourism Hub
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <DarkModeToggle />

          {/* Sign Up dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                transparent
                  ? 'border border-white/50 text-white hover:bg-white/10'
                  : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-700 dark:hover:border-blue-500 dark:hover:text-blue-400'
              }`}
            >
              Sign Up
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                <Link
                  to="/tourist/signup"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-lg">🌄</span> As Tourist
                </Link>
                <Link
                  to="/guide/signup"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-lg">🧭</span> As Guide
                </Link>
                <Link
                  to="/agency-admin/signup"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-lg">🏢</span> As Agency
                </Link>
              </div>
            )}
          </div>

          {/* Login */}
          <Link
            to="/select-account"
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              transparent
                ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}