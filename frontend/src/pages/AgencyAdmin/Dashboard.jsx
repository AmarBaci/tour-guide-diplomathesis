import React, { useState, useEffect, useCallback } from "react";
import { 
  FiUserPlus, 
  FiUsers, 
  FiMap, 
  FiSettings,
  FiBell,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLoader,
  FiX,
  FiAlertCircle,
  FiSlash,
  FiCheck,
  FiCopy
} from "react-icons/fi";
import { agencyAPI } from '../../api/agency';
import { useDashboard } from '../../context/DashboardContext';

const AgencyAdminDashboard = () => {
  const { activeTab, setActiveTab } = useDashboard();
  useEffect(() => { setActiveTab(p => p || 'tours'); }, [setActiveTab]);
  const [tours, setTours] = useState([]);
  const [operators, setOperators] = useState([]);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);
  const [showCreateOperatorModal, setShowCreateOperatorModal] = useState(false);
  const [showOperatorSuccessModal, setShowOperatorSuccessModal] = useState(false);
  const [createdOperatorInfo, setCreatedOperatorInfo] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    location_name: '',
    duration_hours: '',
    price_per_person: '',
    max_group_size: '',
    meeting_point: '',
    tour_type: 'group',
    difficulty: 'moderate',
    category: 'cultural'
  });
  const [newOperator, setNewOperator] = useState({
    email: '',
    password: 'TempPassword123'
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get agency ID from the agency profile API
        const response = await agencyAPI.getAgencyProfile();
        if (response.data && response.data.id) {
          setAgencyId(response.data.id);
          setAgencyInfo(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch agency profile:", err);
        
        // Fallback: try to get agency ID from user data in localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (user) {
          // Try different possible paths to agency ID
          let extractedAgencyId = null;
          
          if (user.agency_admin_profile && user.agency_admin_profile.agency) {
            extractedAgencyId = user.agency_admin_profile.agency.id;
          } else if (user.agency_operator_profile && user.agency_operator_profile.agency) {
            extractedAgencyId = user.agency_operator_profile.agency.id;
          } else if (user.agency) {
            extractedAgencyId = user.agency.id;
          } else if (user.agency_id) {
            extractedAgencyId = user.agency_id;
          }
          
          if (extractedAgencyId) {
            setAgencyId(extractedAgencyId);
          } else {
            console.warn("No agency ID found in user data");
          }
        }
      }
    };
    
    fetchUserData();
  }, []);


  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agencyAPI.getAgencyTours();
      let toursData = [];
      
      if (Array.isArray(response.data)) {
        toursData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        toursData = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        toursData = response.data.data;
      } else if (response.data && Array.isArray(response.data.tours)) {
        toursData = response.data.tours;
      }
      
      setTours(toursData || []);
    } catch (err) {
      setError("Failed to load tours");
      console.error("Error fetching tours:", err);
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agencyAPI.getOperators();
      
      let operatorsData = [];
      
      if (Array.isArray(response.data)) {
        operatorsData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        operatorsData = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        operatorsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.operators)) {
        operatorsData = response.data.operators;
      }
      
      setOperators(operatorsData || []);
    } catch (err) {
      setError("Failed to load operators");
      console.error("Error fetching operators:", err);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAgencyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agencyAPI.getAgencyProfile();
      
      let agencyData = null;
      
      if (response.data && response.data.agency) {
        agencyData = response.data.agency;
      } else if (response.data) {
        agencyData = response.data;
      }
      // Keep the agency ID we already have, otherwise take it from the profile
      if (agencyData && agencyData.id) {
        setAgencyId(prev => prev || agencyData.id);
      }
      
      setAgencyInfo(agencyData);
    } catch (err) {
      setError("Failed to load agency profile");
      console.error("Error fetching agency profile:", err);
      setAgencyInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "tours":
        fetchTours();
        break;
      case "operators":
        fetchOperators();
        break;
      case "profile":
        fetchAgencyProfile();
        break;
      default:
        break;
    }
  }, [activeTab, agencyId, fetchTours, fetchOperators, fetchAgencyProfile]);

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Resolve agencyId from state or agencyInfo
      const effectiveAgencyId = agencyId || agencyInfo?.id;
      if (!effectiveAgencyId) {
        setError("Could not determine your agency. Please refresh the page.");
        return;
      }
      
      const response = await agencyAPI.createOperator(newOperator, effectiveAgencyId);
      
      if (response.data) {
        // Success! Refresh operators list
        await fetchOperators();
        
        // Store operator info and show success modal
        setCreatedOperatorInfo({
          email: newOperator.email,
          password: newOperator.password,
          message: response.data.message || "Operator created successfully!"
        });
        
        // Reset form and close creation modal
        setNewOperator({ 
          email: '', 
          password: 'TempPassword123'
        });
        setShowCreateOperatorModal(false);
        setCopiedPassword(false);
        setShowOperatorSuccessModal(true);
      }
      
    } catch (err) {
      console.error("Operator creation error:", err);
      setError("Failed to create operator: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgencyProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await agencyAPI.updateAgencyProfile(agencyInfo);
      
      if (response.data) {
        setAgencyInfo(response.data);
        alert("Agency profile updated successfully!");
      }
    } catch (err) {
      setError("Failed to update agency profile");
      console.error("Error updating agency profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const tourData = {
        ...newTour,
        duration_hours: parseInt(newTour.duration_hours),
        price_per_person: parseFloat(newTour.price_per_person),
        max_group_size: parseInt(newTour.max_group_size)
      };
      
      const response = await agencyAPI.createTour(tourData);
      
      if (response.data) {
        setTours([...tours, response.data]);
        setShowCreateTourModal(false);
        setNewTour({
          title: '',
          description: '',
          location_name: '',
          duration_hours: '',
          price_per_person: '',
          max_group_size: '',
          meeting_point: '',
          tour_type: 'group',
          difficulty: 'moderate',
          category: 'cultural'
        });
        alert("Tour created successfully!");
      }
    } catch (err) {
      setError("Failed to create tour");
      console.error("Error creating tour:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to deactivate this tour? It will no longer be visible to tourists.')) return;
    try {
      setLoading(true);
      await agencyAPI.deactivateTour(tourId);
      // Remove from active list since it's now inactive
      setTours(prev => prev.filter(t => t.id !== tourId));
    } catch (err) {
      setError('Failed to deactivate tour: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Permanently delete this tour? Its schedules and bookings will be deleted too. To just hide it from tourists, deactivate it instead.')) return;
    try {
      setLoading(true);
      await agencyAPI.deleteTour(tourId);
      setTours(prev => prev.filter(t => t.id !== tourId));
    } catch (err) {
      setError('Failed to delete tour: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTour({
      ...newTour,
      [name]: value
    });
  };

  const handleOperatorInputChange = (e) => {
    const { name, value } = e.target;
    setNewOperator({
      ...newOperator,
      [name]: value
    });
  };

  const handleAgencyInputChange = (e) => {
    const { name, value } = e.target;
    setAgencyInfo({
      ...agencyInfo,
      [name]: value
    });
  };

  const renderTours = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tour Management</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowCreateTourModal(true)}
        >
          <FiPlus className="mr-2" /> Create New Tour
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <p className="ml-3 text-gray-600">Loading tours...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Tour Name</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(tours) && tours.map(tour => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{tour.title}</div>
                    <div className="text-sm text-gray-600">{tour.description}</div>
                  </td>
                  <td className="p-3">{tour.location_name || tour.meeting_point || 'N/A'}</td>
                  <td className="p-3">{tour.duration_hours ? `${tour.duration_hours} hours` : 'N/A'}</td>
                  <td className="p-3">€{tour.price_per_person || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      tour.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tour.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiEdit />
                    </button>
                    {tour.is_active && (
                      <button
                        title="Deactivate tour"
                        className="text-orange-600 hover:text-orange-800"
                        onClick={() => handleDeactivateTour(tour.id)}
                      >
                        <FiSlash />
                      </button>
                    )}
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteTour(tour.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tours.length === 0 && !loading && !error && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FiMap className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tours created yet</h3>
          <p className="text-gray-500">Create your first tour to get started</p>
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            onClick={() => setShowCreateTourModal(true)}
          >
            Create Your First Tour
          </button>
        </div>
      )}

      {/* Create Tour Modal */}
      {showCreateTourModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Tour</h3>
              <button onClick={() => setShowCreateTourModal(false)}>
                <FiX className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleCreateTour}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Tour Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={newTour.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description"
                    value={newTour.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input 
                    type="text" 
                    name="location_name"
                    value={newTour.location_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Point</label>
                  <input 
                    type="text" 
                    name="meeting_point"
                    value={newTour.meeting_point}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                  <input 
                    type="number" 
                    name="duration_hours"
                    value={newTour.duration_hours}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per person (€)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price_per_person"
                    value={newTour.price_per_person}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Group Size</label>
                  <input 
                    type="number" 
                    name="max_group_size"
                    value={newTour.max_group_size}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tour Type</label>
                  <select 
                    name="tour_type"
                    value={newTour.tour_type}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="private">Private Tour</option>
                    <option value="group">Group Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select 
                    name="difficulty"
                    value={newTour.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    name="category"
                    value={newTour.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="historical">Historical</option>
                    <option value="nature">Nature</option>
                    <option value="culinary">Culinary</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateTourModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderOperators = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Operator Management</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowCreateOperatorModal(true)}
        >
          <FiUserPlus className="mr-2" /> Add New Operator
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <p className="ml-3 text-gray-600">Loading operators...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.isArray(operators) && operators.map(operator => (
                  <tr key={operator.id} className="hover:bg-gray-50">
                    <td className="p-3">{operator.user?.email || operator.email || 'N/A'}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Active
                      </span>
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {operators.length === 0 && !loading && !error && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FiUsers className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No operators found</h3>
              <p className="text-gray-500">Add your first operator to get started</p>
            </div>
          )}

          {/* Create Operator Modal */}
          {showCreateOperatorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Create New Operator</h3>
                  <button onClick={() => setShowCreateOperatorModal(false)}>
                    <FiX className="text-2xl" />
                  </button>
                </div>
                <form onSubmit={handleCreateOperator}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={newOperator.email}
                        onChange={handleOperatorInputChange}
                        className="w-full p-3 border rounded-lg" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input 
                        type="password" 
                        name="password"
                        value={newOperator.password}
                        onChange={handleOperatorInputChange}
                        className="w-full p-3 border rounded-lg" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowCreateOperatorModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Create Operator
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAgencyProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Agency Profile</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <p className="ml-3 text-gray-600">Loading agency profile...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      ) : agencyInfo ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSaveAgencyProfile}>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32" />
                <button type="button" className="mt-2 text-blue-600 text-sm">Upload Logo</button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Agency Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={agencyInfo.name || ''}
                    onChange={handleAgencyInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">License Number</label>
                  <input 
                    type="text" 
                    name="registration_no"
                    value={agencyInfo.registration_no || ''}
                    onChange={handleAgencyInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Contact Phone</label>
                  <input 
                    type="text" 
                    name="contact_phone"
                    value={agencyInfo.contact_phone || ''}
                    onChange={handleAgencyInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    name="contact_email"
                    value={agencyInfo.contact_email || agencyInfo.email || ''}
                    onChange={handleAgencyInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={agencyInfo.address || ''}
                    onChange={handleAgencyInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FiSettings className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agency profile found</h3>
          <p className="text-gray-500">Please contact support if this is an error</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "tours": return renderTours();
      case "operators": return renderOperators();
      case "profile": return renderAgencyProfile();
      default: return renderTours();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">


        
        <div className="p-6">
          {renderContent()}
        </div>

      {/* Operator Created Success Modal */}
      {showOperatorSuccessModal && createdOperatorInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <FiCheck size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Operator Created!</h3>
            </div>
            <p className="text-gray-600 mb-5 text-sm">{createdOperatorInfo.message}</p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">{createdOperatorInfo.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded">{createdOperatorInfo.password}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdOperatorInfo.password);
                      setCopiedPassword(true);
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-2 rounded transition-colors"
                  >
                    {copiedPassword ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    {copiedPassword ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
              ⚠️ Share these credentials securely with the operator. They should change their password on first login.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => { setShowOperatorSuccessModal(false); setCreatedOperatorInfo(null); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyAdminDashboard;