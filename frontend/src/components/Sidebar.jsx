import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCompass, FiBookOpen, FiUser, FiBriefcase, FiCalendar,
  FiUsers, FiSettings, FiBarChart2, FiCheckCircle,
  FiLogOut, FiChevronLeft, FiChevronRight, FiClipboard,
  FiDollarSign, FiLayers, FiHome
} from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const NAV_CONFIG = {
  tourist: [
    { id: 'discover',  label: 'Discover Tours',  icon: <FiCompass /> },
    { id: 'bookings',  label: 'My Bookings',     icon: <FiBookOpen /> },
    { id: 'profile',   label: 'My Profile',      icon: <FiUser /> },
  ],
  guide: [
    { id: 'profile',   label: 'My Profile',       icon: <FiUser /> },
    { id: 'browse',    label: 'Browse Tours',      icon: <FiCompass /> },
    { id: 'offers',    label: 'Job Offers',        icon: <FiDollarSign /> },
    { id: 'calendar',  label: 'Availability',      icon: <FiCalendar /> },
  ],
  agency_admin: [
    { id: 'tours',     label: 'Tour Management',  icon: <FiLayers /> },
    { id: 'operators', label: 'Operators',         icon: <FiUsers /> },
    { id: 'profile',   label: 'Agency Profile',   icon: <FiHome /> },
  ],
  agency_operator: [
    { id: 'tour-management',     label: 'Tour Management',     icon: <FiLayers /> },
    { id: 'scheduled-tours',     label: 'Scheduled Tours',     icon: <FiCalendar /> },
    { id: 'booking-requests',    label: 'Booking Requests',    icon: <FiBookOpen /> },
    { id: 'guide-offers',        label: 'Guide Offers',        icon: <FiBriefcase /> },
    { id: 'guide-applications',  label: 'Applications',        icon: <FiClipboard /> },
  ],
  ministry_admin: [
    { id: 'guides',    label: 'Guide Verification',   icon: <FiCheckCircle /> },
    { id: 'agencies',  label: 'Agency Verification',  icon: <FiSettings /> },
  ],
  admin: [
    { id: 'overview',  label: 'Overview',  icon: <FiBarChart2 /> },
  ],
};

const ROLE_LABEL = {
  tourist:          'Tourist Portal',
  guide:            'Guide Portal',
  agency_admin:     'Agency Admin',
  agency_operator:  'Agency Operator',
  ministry_admin:   'Ministry Admin',
  admin:            'Platform Admin',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useDashboard();

  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem('userData') || '{}');
  } catch { /* noop */ }

  const role = userData.user_type || 'tourist';
  const navItems = NAV_CONFIG[role] || [];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    navigate('/select-account');
  };

  return (
    <aside
      className={`
        relative flex flex-col h-screen bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-700
        transition-all duration-300 flex-shrink-0
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 dark:border-gray-700 ${collapsed ? 'justify-center' : ''}`}>
        <span className="text-2xl">🦅</span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 truncate">Albania Tourism</p>
            <p className="text-[11px] text-gray-400 truncate">{ROLE_LABEL[role]}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}
              `}
            >
              <span className={`text-lg flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <FiLogOut className="text-lg flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center
          text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-xs z-10"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </aside>
  );
}
