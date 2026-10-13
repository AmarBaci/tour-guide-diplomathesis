import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import DarkModeToggle from './shared/DarkModeToggle';
import api from '../utils/axiosConfig';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Poll for unread notifications count by checking pending bookings / offers.
 * Each role has different endpoints to check.
 */
async function fetchNotificationCount(userType) {
  try {
    if (userType === 'agency_admin' || userType === 'agency_operator') {
      // Count pending bookings + pending guide applications
      const [bookingsRes, offersRes] = await Promise.all([
        api.get('/api/bookings/?status=pending'),
        api.get('/api/guide-offers/?offer_type=guide_application&status=pending'),
      ]);
      const bookings = bookingsRes.data?.results ?? bookingsRes.data ?? [];
      const offers = offersRes.data?.results ?? offersRes.data ?? [];
      const bCount = Array.isArray(bookings) ? bookings.length : 0;
      const oCount = Array.isArray(offers) ? offers.length : 0;
      return bCount + oCount;
    }
    if (userType === 'guide') {
      const res = await api.get('/api/guide-offers/?status=pending');
      const data = res.data?.results ?? res.data ?? [];
      return Array.isArray(data) ? data.length : 0;
    }
    if (userType === 'ministry_admin') {
      const res = await api.get('/api/verification/requests/');
      const data = res.data?.results ?? res.data ?? [];
      const pending = Array.isArray(data) ? data.filter(v => v.status === 'pending').length : 0;
      return pending;
    }
    return 0;
  } catch {
    return 0;
  }
}

export default function DashboardHeader({ title }) {
  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem('userData') || '{}');
  } catch { /* noop */ }

  const name = userData.full_name || userData.email?.split('@')[0] || 'User';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const [notifCount, setNotifCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const userType = userData.user_type;
    if (!userType) return;

    const poll = async () => {
      const count = await fetchNotificationCount(userType);
      setNotifCount(count);
    };

    poll(); // immediate
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between
      px-6 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
      border-b border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0">

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
        {title || 'Dashboard'}
      </h1>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <DarkModeToggle />

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(p => !p)}
            className="relative text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title={notifCount > 0 ? `${notifCount} pending notification(s)` : 'No new notifications'}
          >
            <FiBell size={20} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold
                w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 border border-gray-200
              dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 text-sm">
              {notifCount > 0 ? (
                <p className="text-gray-700 dark:text-gray-300">
                  You have <span className="font-bold text-red-600">{notifCount}</span> pending item(s) requiring attention.
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500
            flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          title={name}
        >
          {initials || '?'}
        </div>

        {/* Name (hidden on small screens) */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
          {name}
        </span>
      </div>
    </header>
  );
}

