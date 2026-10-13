import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const PAGE_TITLES = {
  // tourist
  discover:            'Discover Tours',
  bookings:            'My Bookings',
  // guide
  browse:              'Browse Tours',
  offers:              'Job Offers',
  calendar:            'Availability Calendar',
  // agency admin
  tours:               'Tour Management',
  operators:           'Operator Management',
  // agency operator
  'tour-management':       'Tour Management',
  'scheduled-tours':       'Scheduled Tours',
  'booking-requests':      'Booking Requests',
  'guide-offers':          'Guide Offers',
  'guide-applications':    'Guide Applications',
  // ministry
  guides:              'Guide Verification',
  agencies:            'Agency Verification',
  // shared
  profile:             'My Profile',
  overview:            'Platform Overview',
};

function DashboardShell() {
  const { activeTab } = useDashboard();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader title={PAGE_TITLES[activeTab] || 'Dashboard'} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const DashboardLayout = () => (
  <DashboardProvider>
    <DashboardShell />
  </DashboardProvider>
);

export default DashboardLayout;