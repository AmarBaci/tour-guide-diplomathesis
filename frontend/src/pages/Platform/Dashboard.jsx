import React, { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiServer, 
  FiSettings,
  FiActivity,
  FiDatabase,
  FiExternalLink,
  FiBarChart2
} from "react-icons/fi";
import { platformAPI } from "../../api/platform";
import { useDashboard } from '../../context/DashboardContext';

const PlatformAdminDashboard = () => {
  const { setActiveTab } = useDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setActiveTab('overview'); return () => setActiveTab(''); }, []);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTours: 0,
    totalBookings: 0,
    systemStatus: 'healthy'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // These would be your actual API calls
      const statsResponse = await platformAPI.getUserStats();
      const activityResponse = await platformAPI.getRecentActivity();
      
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <FiActivity className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Platform Administration</h1>
        <p className="text-gray-600">System overview and quick access</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={FiUsers}
          color="blue"
        />
        <StatCard 
          title="Active Tours" 
          value={stats.activeTours} 
          icon={FiActivity}
          color="green"
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={FiDatabase}
          color="purple"
        />
        <StatCard 
          title="System Status" 
          value={stats.systemStatus === 'healthy' ? 'Operational' : 'Issues'} 
          icon={FiServer}
          color={stats.systemStatus === 'healthy' ? 'green' : 'red'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiSettings className="mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <ActionButton 
              title="Open Django Admin"
              description="Full system administration"
              icon={FiExternalLink}
              onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')}
            />
            <ActionButton 
              title="View User Reports"
              description="Download user analytics"
              icon={FiBarChart2}
              onClick={() => console.log('Generate report')}
            />
            <ActionButton 
              title="System Health Check"
              description="Run diagnostics"
              icon={FiServer}
              onClick={() => console.log('Run health check')}
            />
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiActivity className="mr-2 text-green-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* System Info Footer */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <InfoItem label="Environment" value="Production" />
          <InfoItem label="Version" value="v1.2.0" />
          <InfoItem label="Database" value="PostgreSQL 14" />
          <InfoItem label="Uptime" value="99.98%" />
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'gray' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
      </div>
    </div>
  );
};

// Reusable Action Button Component
const ActionButton = ({ title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
  >
    <div className="flex items-center">
      <div className="bg-blue-100 p-2 rounded-full mr-3">
        <Icon className="text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </button>
);

// Reusable Info Item Component
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-gray-600 text-xs">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

export default PlatformAdminDashboard;