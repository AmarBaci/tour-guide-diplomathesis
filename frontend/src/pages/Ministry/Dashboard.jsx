import React, { useState, useEffect } from "react";
import { FiUsers, FiHome, FiRefreshCw, FiCheck, FiX, FiFileText, FiActivity } from "react-icons/fi";
import { ministryAPI } from "../../api/ministry";
import { useDashboard } from '../../context/DashboardContext';

const MinistryDashboard = () => {
  const { activeTab, setActiveTab } = useDashboard();
  useEffect(() => { setActiveTab(p => p || 'guides'); }, []);
  const [guides, setGuides] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setError('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccessMessage('');
    setTimeout(() => setError(''), 5000);
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load verification requests
      const verificationsResponse = await ministryAPI.getVerificationRequests();
      let verificationsData = verificationsResponse.data;
      
      // Handle different response formats
      if (verificationsData && !Array.isArray(verificationsData)) {
        if (verificationsData.results) verificationsData = verificationsData.results;
        else if (verificationsData.data) verificationsData = verificationsData.data;
      }
      setVerifications(Array.isArray(verificationsData) ? verificationsData : []);

      // Load guides and agencies
      const [guidesResponse, agenciesResponse] = await Promise.all([
        ministryAPI.getAllGuides(),
        ministryAPI.getAllAgencies()
      ]);
      
      // Guides data handling
      let guidesData = guidesResponse.data;
      if (guidesData && !Array.isArray(guidesData)) {
        if (guidesData.results) guidesData = guidesData.results;
        else if (guidesData.data) guidesData = guidesData.data;
      }
      setGuides(Array.isArray(guidesData) ? guidesData : []);

      // Agencies data handling
      let agenciesData = agenciesResponse.data;
      if (agenciesData && !Array.isArray(agenciesData)) {
        if (agenciesData.results) agenciesData = agenciesData.results;
        else if (agenciesData.data) agenciesData = agenciesData.data;
      }
      setAgencies(Array.isArray(agenciesData) ? agenciesData : []);

    } catch (error) {
      showError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Find verification status for a guide
  const getGuideVerificationStatus = (guide) => {
    return verifications.find(v => 
      v.request_type === 'guide' && v.user_email === guide.email
    ) || null;
  };

  // Find verification status for an agency
  const getAgencyVerificationStatus = (agency) => {
    const adminEmail = agency.admin_email;
    return verifications.find(v => 
      v.request_type === 'agency' && v.user_email === adminEmail
    ) || null;
  };

  // Approve a guide
  const approveGuide = async (guide) => {
    setProcessing(`guide-${guide.id}`);
    try {
      const verification = getGuideVerificationStatus(guide);
      if (!verification) {
        showError(`No pending verification request found for ${guide.full_name || guide.email}. Use "Create Missing Verifications" first.`);
        return;
      }
      await ministryAPI.updateVerificationStatus(verification.id, {
        status: 'approved',
        resolution_notes: 'Approved by ministry admin'
      });
      await loadAllData();
      showSuccess(`Guide ${guide.full_name || guide.email} approved successfully.`);
    } catch (err) {
      showError('Failed to approve guide. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Reject a guide
  const rejectGuide = async (guide) => {
    setProcessing(`guide-reject-${guide.id}`);
    try {
      const verification = getGuideVerificationStatus(guide);
      if (!verification) {
        showError(`No pending verification request found for ${guide.full_name || guide.email}.`);
        return;
      }
      await ministryAPI.updateVerificationStatus(verification.id, {
        status: 'rejected',
        resolution_notes: 'Rejected by ministry admin'
      });
      await loadAllData();
      showSuccess(`Guide ${guide.full_name || guide.email} rejected.`);
    } catch (err) {
      showError('Failed to reject guide. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Approve an agency
  const approveAgency = async (agency) => {
    setProcessing(`agency-${agency.id}`);
    try {
      const verification = getAgencyVerificationStatus(agency);
      if (!verification) {
        showError(`No pending verification request found for ${agency.name}. Use "Create Missing Verifications" first.`);
        return;
      }
      await ministryAPI.updateVerificationStatus(verification.id, {
        status: 'approved',
        resolution_notes: 'Approved by ministry admin'
      });
      await loadAllData();
      showSuccess(`Agency ${agency.name} approved successfully.`);
    } catch (err) {
      showError('Failed to approve agency. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Reject an agency
  const rejectAgency = async (agency) => {
    setProcessing(`agency-reject-${agency.id}`);
    try {
      const verification = getAgencyVerificationStatus(agency);
      if (!verification) {
        showError(`No pending verification request found for ${agency.name}.`);
        return;
      }
      await ministryAPI.updateVerificationStatus(verification.id, {
        status: 'rejected',
        resolution_notes: 'Rejected by ministry admin'
      });
      await loadAllData();
      showSuccess(`Agency ${agency.name} rejected.`);
    } catch (err) {
      showError('Failed to reject agency. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl">Loading ministry dashboard...</div>
      </div>
    );
  }

  // Calculate counts for UI
  const pendingGuides = guides.filter(guide => {
    const verification = getGuideVerificationStatus(guide);
    return !guide.is_approved && verification && verification.status === 'pending';
  });

  const pendingAgencies = agencies.filter(agency => {
    const verification = getAgencyVerificationStatus(agency);
    return !agency.is_active && verification && verification.status === 'pending';
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ministry Admin Dashboard</h1>
          <p className="text-gray-600">Manage guide and agency verification requests</p>
        </div>

        {/* Inline notifications */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-4 text-green-600 hover:text-green-800 font-bold">&times;</button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-4 text-red-600 hover:text-red-800 font-bold">&times;</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: <FiUsers size={24} />,
              label: 'Total Guides',
              value: guides.length,
              sub: `${guides.filter(g => g.is_approved).length} approved`,
              color: 'blue'
            },
            {
              icon: <FiHome size={24} />,
              label: 'Total Agencies',
              value: agencies.length,
              sub: `${agencies.filter(a => a.is_active).length} active`,
              color: 'teal'
            },
            {
              icon: <FiFileText size={24} />,
              label: 'Pending Verifications',
              value: verifications.filter(v => v.status === 'pending').length,
              sub: 'awaiting review',
              color: 'orange'
            },
            {
              icon: <FiActivity size={24} />,
              label: 'Total Verifications',
              value: verifications.length,
              sub: `${verifications.filter(v => v.status === 'approved').length} approved`,
              color: 'green'
            },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-lg shadow p-4 border-l-4 border-${stat.color}-500`}>
              <div className={`text-${stat.color}-500 mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow">
          <button
            onClick={() => setActiveTab("guides")}
            className={`flex-1 py-3 px-4 rounded-md text-center transition-all ${
              activeTab === "guides" 
                ? "bg-blue-500 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiUsers className="inline mr-2" />
            Guides {pendingGuides.length > 0 && (
              <span className="ml-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {pendingGuides.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("agencies")}
            className={`flex-1 py-3 px-4 rounded-md text-center transition-all ${
              activeTab === "agencies" 
                ? "bg-blue-500 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiHome className="inline mr-2" />
            Agencies {pendingAgencies.length > 0 && (
              <span className="ml-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {pendingAgencies.length}
              </span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={loadAllData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Data
          </button>
          <button
            onClick={() =>
              ministryAPI.createAllVerifications()
                .then(() => { loadAllData(); showSuccess('Missing verification requests created.'); })
                .catch(() => showError('Failed to create verification requests.'))
            }
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Missing Verifications
          </button>
        </div>

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Guide Management</h2>
              <p className="text-gray-600">
                {pendingGuides.length} pending, {guides.length - pendingGuides.length} approved
              </p>
            </div>
            
            <div className="p-6">
              {guides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiUsers className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>No guides found in the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {guides.map((guide) => {
                    const verification = getGuideVerificationStatus(guide);
                    const isApproved = guide.is_approved;
                    const isPending = verification && verification.status === 'pending';
                    
                    return (
                      <div key={guide.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {guide.full_name || `${guide.first_name} ${guide.last_name}`}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                              <p><span className="font-medium">Email:</span> {guide.email}</p>
                              <p><span className="font-medium">License:</span> {guide.license_no}</p>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isApproved ? 'bg-green-100 text-green-800' :
                                isPending ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {isApproved ? '✓ Approved' : isPending ? '⏳ Pending' : '✗ Not Verified'}
                              </span>
                            </div>
                          </div>
                          
                          {!isApproved && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => approveGuide(guide)}
                                disabled={processing === `guide-${guide.id}`}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                              >
                                <FiCheck className="mr-1" />
                                {processing === `guide-${guide.id}` ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => rejectGuide(guide)}
                                disabled={processing === `guide-reject-${guide.id}`}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                              >
                                <FiX className="mr-1" />
                                {processing === `guide-reject-${guide.id}` ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agencies Tab */}
        {activeTab === "agencies" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Agency Management</h2>
              <p className="text-gray-600">
                {pendingAgencies.length} pending, {agencies.length - pendingAgencies.length} approved
              </p>
            </div>
            
            <div className="p-6">
              {agencies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiHome className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>No agencies found in the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agencies.map((agency) => {
                    const verification = getAgencyVerificationStatus(agency);
                    const isApproved = agency.is_active;
                    const isPending = verification && verification.status === 'pending';
                    const adminName = agency.admin_name || 'Unknown';
                    const adminEmail = agency.admin_email || 'Unknown';
                    
                    return (
                      <div key={agency.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">{agency.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                              <p><span className="font-medium">Registration:</span> {agency.registration_no}</p>
                              <p><span className="font-medium">Admin:</span> {adminName}</p>
                              <p><span className="font-medium">Email:</span> {adminEmail}</p>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isApproved ? 'bg-green-100 text-green-800' :
                                isPending ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {isApproved ? '✓ Approved' : isPending ? '⏳ Pending' : '✗ Not Verified'}
                              </span>
                            </div>
                          </div>
                          
                          {!isApproved && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => approveAgency(agency)}
                                disabled={processing === `agency-${agency.id}`}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                              >
                                <FiCheck className="mr-1" />
                                {processing === `agency-${agency.id}` ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => rejectAgency(agency)}
                                disabled={processing === `agency-reject-${agency.id}`}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                              >
                                <FiX className="mr-1" />
                                {processing === `agency-reject-${agency.id}` ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinistryDashboard;