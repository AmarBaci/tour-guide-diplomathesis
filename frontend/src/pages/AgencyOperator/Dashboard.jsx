import React, { useState, useEffect } from "react";
import { 
  FiCalendar, 
  FiClock,
  FiDollarSign,
  FiUsers,
  FiPlus,
  FiFilter,
  FiSearch,
  FiX,
  FiCheck,
  FiEye,
  FiBell,
  FiUser,
  FiMessageSquare,
  FiStar,
  FiGlobe,
  FiAward,
  FiLoader,
  FiAlertCircle,
  FiInfo,
  FiMail,
  FiMap,
  FiChevronDown,
  FiChevronUp,
  FiPhone,
  FiList,
  FiRefreshCw 
} from "react-icons/fi";
import { agencyAPI } from '../../api/agency';
import { useDashboard } from '../../context/DashboardContext';

const AgencyOperatorDashboard = () => {
  const { activeTab, setActiveTab } = useDashboard();
  useEffect(() => { setActiveTab(p => p || 'tour-management'); }, [setActiveTab]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showGuideDetail, setShowGuideDetail] = useState(false);
  const [showGuideBrowser, setShowGuideBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for data
  const [agencyTours, setAgencyTours] = useState([]);
  const [scheduledTours, setScheduledTours] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [guideOffers, setGuideOffers] = useState([]);
  const [guideApplications, setGuideApplications] = useState([]);

  // State for new schedule
  const [newSchedule, setNewSchedule] = useState({
    tour: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    available_slots: 10,
  });

  // State for new guide offer
  const [newOffer, setNewOffer] = useState({
    tour: "",
    guide: "",
    proposed_salary: "",
  });

  // State for guide filters
  const [guideFilters, setGuideFilters] = useState({
    specialty: "",
    language: "",
    min_rating: 0,
  });

  // State for UI controls
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        switch (activeTab) {
          case "tour-management":
            await fetchAgencyTours();
            break;
          case "scheduled-tours":
            // Tours are needed to show each schedule's guide and duration
            await Promise.all([fetchScheduledTours(), fetchAgencyTours()]);
            break;
          case "booking-requests":
            await fetchBookingRequests();
            break;
          case "guide-offers":
            await fetchGuideOffers();
            break;
          case "guide-applications":
            await fetchGuideApplications();
            break;
          default:
            break;
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

  // Fetch agency tours
  const fetchAgencyTours = async () => {
    try {
      const response = await agencyAPI.getAgencyTours();
      setAgencyTours(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching agency tours:", err);
      setError("Failed to load tours");
      setAgencyTours([]);
    }
  };

  // Fetch scheduled tours
  const fetchScheduledTours = async () => {
    try {
      console.log("Fetching scheduled tours...");
      const response = await agencyAPI.getTourSchedules();
      console.log("Scheduled tours API response:", response);
      console.log("Response data:", response?.data);
      
      // Handle different response structures
      let schedules = [];
      if (Array.isArray(response?.data)) {
        schedules = response.data;
      } else if (response?.data?.results) {
        schedules = response.data.results;
      } else if (response?.data?.schedules) {
        schedules = response.data.schedules;
      }
      
      console.log("Processed schedules:", schedules);
      setScheduledTours(schedules);
    } catch (err) {
      console.error("Error fetching scheduled tours:", err);
      setError("Failed to load scheduled tours");
      setScheduledTours([]);
    }
  };

  // Fetch booking requests
  const fetchBookingRequests = async () => {
    try {
      const response = await agencyAPI.getBookingRequests();
      const data = response?.data || [];
      const pendingBookings = Array.isArray(data) ? 
        data.filter(booking => booking?.status === "pending") : [];
      setBookingRequests(pendingBookings);
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError("Failed to load booking requests");
      setBookingRequests([]);
    }
  };

  // Fetch guide offers
  const fetchGuideOffers = async () => {
    try {
      console.log("Fetching guide offers...");
      const response = await agencyAPI.getGuideOffers();
      console.log("Guide offers API response:", response);
      console.log("Response data:", response?.data);
      
      // Handle different response structures
      let offers = [];
      if (Array.isArray(response?.data)) {
        offers = response.data;
      } else if (response?.data?.results) {
        offers = response.data.results;
      } else if (response?.data?.offers) {
        offers = response.data.offers;
      }
      
      // Filter to show only agency offers (not applications)
      const agencyOffers = offers.filter(offer => offer.offer_type === 'agency_offer');
      
      console.log("Processed offers:", agencyOffers);
      setGuideOffers(agencyOffers);
    } catch (err) {
      console.error("Error fetching guide offers:", err);
      setError("Failed to load guide offers");
      setGuideOffers([]);
    }
  };

  // Fetch guide applications
  const fetchGuideApplications = async () => {
    try {
      console.log("Fetching guide applications...");
      const response = await agencyAPI.getGuideOffers();
      console.log("Guide applications API response:", response);
      console.log("Response data:", response?.data);
      
      // Handle different response structures
      let applications = [];
      if (Array.isArray(response?.data)) {
        applications = response.data;
      } else if (response?.data?.results) {
        applications = response.data.results;
      } else if (response?.data?.offers) {
        applications = response.data.offers;
      }
      
      // Filter to show only guide applications
      const guideApplications = applications.filter(app => app.offer_type === 'guide_application');
      
      console.log("Processed applications:", guideApplications);
      setGuideApplications(guideApplications);
    } catch (err) {
      console.error("Error fetching guide applications:", err);
      setError("Failed to load guide applications");
      setGuideApplications([]);
    }
  };

  // Fetch available guides with filters
  const fetchAvailableGuides = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await agencyAPI.getAvailableGuides(filters);
      
      // Handle API response
      let guides = [];
      if (Array.isArray(response?.data)) {
        guides = response.data;
      } else if (response?.data?.results) {
        guides = response.data.results;
      }
      
      setAvailableGuides(guides);
    } catch (err) {
      console.error("Error fetching available guides:", err);
      setError("Failed to load guides");
      setAvailableGuides([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule tour button click
  const handleScheduleTour = (tour) => {
    setSelectedTour(tour);
    setNewSchedule({
      ...newSchedule,
      tour: tour.id,
      available_slots: tour.max_group_size || 10
    });
    setShowScheduleModal(true);
  };

  // Create a new tour schedule
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const scheduleData = {
        ...newSchedule,
        end_time: calculateEndTime(newSchedule.start_time, selectedTour.duration_hours),
      };
      
      await agencyAPI.createTourSchedule(scheduleData);
      
      setSuccess("Tour schedule created successfully!");
      setShowScheduleModal(false);
      setNewSchedule({
        tour: "",
        date: new Date().toISOString().split('T')[0],
        start_time: "09:00",
        available_slots: 10,
      });
      
      // Refresh scheduled tours if on that tab
      if (activeTab === "scheduled-tours") {
        await fetchScheduledTours();
      }
    } catch (err) {
      setError("Failed to create schedule: " + (err.response?.data?.detail || err.message));
      console.error("Error creating schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new guide offer
  const handleCreateOffer = async () => {
    const salary = parseFloat(newOffer.proposed_salary);
    if (!newOffer.proposed_salary || isNaN(salary) || salary <= 0) {
      setError('Please enter a valid salary amount greater than €0.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      await agencyAPI.createGuideOffer(newOffer);
      
      setSuccess(`Offer of €${newOffer.proposed_salary} sent to guide successfully!`);
      setShowGuideDetail(false);
      setNewOffer({
        tour: "",
        guide: "",
        proposed_salary: "",
      });
      
      // Refresh guide offers if on that tab
      if (activeTab === "guide-offers") {
        await fetchGuideOffers();
      }
    } catch (err) {
      setError("Failed to send offer: " + (err.response?.data?.detail || err.message));
      console.error("Error sending offer:", err);
    } finally {
      setLoading(false);
    }
  };

  // Directly assign a guide to a tour (no salary negotiation needed)
  const handleAssignDirectly = async () => {
    if (!newOffer.tour || !selectedGuide) {
      setError('No tour or guide selected for direct assignment.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await agencyAPI.assignGuideToTour(newOffer.tour, selectedGuide.id);
      setSuccess(`${getGuideName(selectedGuide)} has been directly assigned to the tour!`);
      setShowGuideDetail(false);
    } catch (err) {
      setError('Failed to assign guide: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Respond to a guide application
  const handleRespondToApplication = async (applicationId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      await agencyAPI.respondToApplication(applicationId, status);
      
      setSuccess(`Application ${status} successfully!`);
      
      // Refresh applications list
      await fetchGuideApplications();
    } catch (err) {
      setError(`Failed to ${status} application: ` + (err.response?.data?.detail || err.message));
      console.error(`Error ${status} application:`, err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = (hours + duration) % 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSelectGuideForOffer = (guide, tour) => {
    setSelectedGuide(guide);
    setNewOffer({
      tour: tour.id,
      guide: guide.id,
      proposed_salary: guide.daily_rate || "",
    });
    setShowGuideDetail(true);
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      setLoading(true);
      if (action === 'confirmed') {
        await agencyAPI.confirmBooking(bookingId);
      } else {
        await agencyAPI.rejectBooking(bookingId);
      }
      setSuccess(`Booking ${action} successfully!`);
      setBookingRequests(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setError(`Failed to ${action} booking: ` + (err.response?.data?.detail || err.message));
      console.error(`Error ${action} booking:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuideFilterChange = (filter, value) => {
    const newFilters = { ...guideFilters, [filter]: value };
    setGuideFilters(newFilters);
    fetchAvailableGuides(newFilters);
  };

  // Helper functions to handle data from backend
  const getGuideName = (guide) => {
    if (guide.user && guide.user.get_full_name) return guide.user.get_full_name;
    if (guide.user && guide.user.first_name && guide.user.last_name) 
      return `${guide.user.first_name} ${guide.user.last_name}`;
    if (guide.full_name) return guide.full_name;
    return "Unknown Guide";
  };

  const getGuideLanguages = (guide) => {
    if (Array.isArray(guide.languages)) return guide.languages;
    if (guide.language_list) return guide.language_list;
    return ["Not specified"];
  };

  const getGuideSpecialties = (guide) => {
    if (guide.specialties) return guide.specialties;
    if (guide.specialty_list) return guide.specialty_list;
    return ["Not specified"];
  };

  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const renderTourManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agency Tours</h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiSearch className="mr-2" />
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencyTours.map(tour => (
          <div key={tour.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2">{tour.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>{tour.duration_hours} hours</span>
              </div>
              <div className="flex items-center">
                <FiDollarSign className="mr-2" />
                <span>€{tour.price_per_person} per person</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                <span>Max {tour.max_group_size} people</span>
              </div>
              <div className="flex items-center mt-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                  {tour.difficulty}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {tour.category}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                onClick={() => handleScheduleTour(tour)}
              >
                <FiPlus className="mr-1" />
                Schedule
              </button>
              <button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                onClick={() => {
                  setSelectedTour(tour);
                  setShowGuideBrowser(true);
                  fetchAvailableGuides();
                }}
              >
                <FiUser className="mr-1" />
                Hire Guide
              </button>
            </div>
          </div>
        ))}
      </div>

      {agencyTours.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
          <FiCalendar className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tours available</h3>
          <p className="text-gray-500">Create your first tour to get started</p>
        </div>
      )}

      {/* Guide Browser Modal */}
      {showGuideBrowser && selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Available Guides for {selectedTour.title}</h3>
              <button 
                onClick={() => {
                  setShowGuideBrowser(false);
                  setSelectedTour(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="mb-4">
              <button 
                className="flex items-center text-blue-600 text-sm"
                onClick={() => setExpandedFilters(!expandedFilters)}
              >
                {expandedFilters ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                {expandedFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {expandedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialty</label>
                    <select 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={guideFilters.specialty}
                      onChange={(e) => handleGuideFilterChange('specialty', e.target.value)}
                    >
                      <option value="">All Specialties</option>
                      <option value="adventure">Adventure</option>
                      <option value="cultural">Cultural</option>
                      <option value="historical">Historical</option>
                      <option value="nature">Nature</option>
                      <option value="culinary">Culinary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={guideFilters.language}
                      onChange={(e) => handleGuideFilterChange('language', e.target.value)}
                    >
                      <option value="">All Languages</option>
                      <option value="english">English</option>
                      <option value="italian">Italian</option>
                      <option value="german">German</option>
                      <option value="french">French</option>
                      <option value="albanian">Albanian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Rating</label>
                    <select 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={guideFilters.min_rating}
                      onChange={(e) => handleGuideFilterChange('min_rating', e.target.value)}
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FiLoader className="animate-spin text-2xl text-blue-500 mr-3" />
                <span className="text-gray-600">Loading guides...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableGuides.map(guide => (
                  <div key={guide.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                        <FiUser className="text-2xl text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-lg text-gray-900">{getGuideName(guide)}</h5>
                          <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            <FiStar className="mr-1" />
                            <span>{guide.rating || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <FiAward className="mr-1" />
                          <span>{guide.experience || 'Experience not specified'}</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {getGuideSpecialties(guide).slice(0, 3).map(specialty => (
                              <span key={specialty} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {specialty}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FiGlobe className="mr-1" />
                            <span>{getGuideLanguages(guide).slice(0, 3).join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2 border-t pt-3">
                      <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm transition-colors"
                        onClick={() => handleSelectGuideForOffer(guide, selectedTour)}
                      >
                        Send Offer
                      </button>
                      <button 
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-sm transition-colors"
                        onClick={() => {
                          setSelectedGuide(guide);
                          setShowGuideDetail(true);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {availableGuides.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <FiUser className="text-4xl mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No guides found matching your criteria</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduledTours = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Scheduled Tours</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scheduledTours.map(schedule => {
          const tour = agencyTours.find(t => t.id === schedule.tour);
          return (
          <div key={schedule.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{schedule.tour_title || "Unknown Tour"}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {schedule.date} at {schedule.start_time}
                  </span>
                  {tour?.guide && (
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Guide: {tour.guide_name || "Unknown Guide"}
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${"bg-green-100 text-green-800"}`}>
                Scheduled
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiUsers className="mr-2" />
                <span>{schedule.available_slots} available slots</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiClock className="mr-2" />
                <span>Duration: {tour?.duration_hours || 'N/A'} hours</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {scheduledTours.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
          <FiCalendar className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled tours</h3>
          <p className="text-gray-500">Schedule your first tour to get started</p>
        </div>
      )}
    </div>
  );

  const renderBookingRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Booking Requests</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Tour</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Tourist</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Participants</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookingRequests.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{booking.tour_schedule?.tour?.title || "Unknown Tour"}</td>
                <td className="p-4 text-gray-600">{booking.tour_schedule?.date}</td>
                <td className="p-4 text-gray-600">{booking.tourist?.email || "Unknown Tourist"}</td>
                <td className="p-4 text-gray-600">{booking.number_of_people}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4">
                  {booking.status === "pending" && (
                    <div className="flex space-x-2">
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                        onClick={() => handleBookingAction(booking.id, "confirmed")}
                      >
                        <FiCheck size={16} />
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                        onClick={() => handleBookingAction(booking.id, "cancelled")}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {bookingRequests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FiUsers className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No booking requests found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGuideOffers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Guide Offers</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {guideOffers.map(offer => (
          <div key={offer.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{offer.tour?.title || "Unknown Tour"}</h3>
                <p className="text-gray-600">Guide: {getGuideName(offer.guide)}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                offer.status === "accepted" ? "bg-green-100 text-green-800" :
                offer.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {offer.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiDollarSign className="mr-2" />
                <span>Offer: €{offer.proposed_salary}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="mr-2" />
                <span>Sent: {new Date(offer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {guideOffers.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
          <FiMail className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guide offers</h3>
          <p className="text-gray-500">Send your first offer to a guide</p>
        </div>
      )}
    </div>
  );

  const renderGuideApplications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Guide Applications</h2>
        <button 
          onClick={fetchGuideApplications}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiRefreshCw className="mr-1" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {guideApplications.map(application => (
          <div key={application.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{application.tour?.title || "Unknown Tour"}</h3>
                <p className="text-gray-600">Applied by: {getGuideName(application.guide)}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                application.status === "accepted" ? "bg-green-100 text-green-800" :
                application.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {application.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="mr-2" />
                <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiUser className="mr-2" />
                <span>Experience: {application.guide?.experience || 'Not specified'}</span>
              </div>
            </div>
            
            {application.status === "pending" && (
              <div className="flex justify-end space-x-2">
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  onClick={() => handleRespondToApplication(application.id, "rejected")}
                >
                  Reject
                </button>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  onClick={() => handleRespondToApplication(application.id, "accepted")}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {guideApplications.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
          <FiList className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guide applications</h3>
          <p className="text-gray-500">Guides will appear here when they apply for your tours</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "tour-management": return renderTourManagement();
      case "scheduled-tours": return renderScheduledTours();
      case "booking-requests": return renderBookingRequests();
      case "guide-offers": return renderGuideOffers();
      case "guide-applications": return renderGuideApplications();
      default: return renderTourManagement();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">


        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center mb-4">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center mb-4">
              <FiCheck className="mr-2" />
              {success}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
              <FiLoader className="animate-spin text-4xl text-blue-500" />
              <p className="ml-3 text-gray-600">Loading...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>

      {/* Schedule Tour Modal */}
      {showScheduleModal && selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Schedule {selectedTour.title}</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSchedule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                  <input 
                    type="date" 
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Start Time</label>
                  <input 
                    type="time" 
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Available Slots</label>
                  <input 
                    type="number" 
                    value={newSchedule.available_slots}
                    onChange={(e) => setNewSchedule({...newSchedule, available_slots: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    min="1"
                    max={selectedTour.max_group_size || 50}
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Max for this tour: {selectedTour.max_group_size || 50}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guide Detail Modal */}
      {showGuideDetail && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Guide Profile</h3>
              <button 
                onClick={() => setShowGuideDetail(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <div className="flex items-start">
              <div className="w-24 h-24 bg-gray-200 rounded-full mr-6 flex items-center justify-center">
                <FiUser className="text-3xl text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{getGuideName(selectedGuide)}</h4>
                    <div className="flex items-center mt-1">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span className="font-medium">{selectedGuide.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium mb-2 text-gray-900">About</h5>
                  <p className="text-gray-700">{selectedGuide.bio || selectedGuide.description || 'No biography available.'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h5 className="font-medium mb-2 text-gray-900">Specialties</h5>
                    <div className="flex flex-wrap gap-2">
                      {getGuideSpecialties(selectedGuide).map(specialty => (
                        <span key={specialty} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2 text-gray-900">Languages</h5>
                    <div className="flex flex-wrap gap-2">
                      {getGuideLanguages(selectedGuide).map(language => (
                        <span key={language} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h5 className="font-medium mb-2 text-gray-900">Send Salary Offer</h5>
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Offer Amount (€)</label>
                        <input 
                          type="number" 
                          value={newOffer.proposed_salary}
                          onChange={(e) => setNewOffer({...newOffer, proposed_salary: e.target.value})}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          min="1"
                          placeholder="Enter offer amount"
                        />
                      </div>
                      <button
                        onClick={handleCreateOffer}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        Send Offer
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-1 text-gray-900">Direct Assignment</h5>
                    <p className="text-sm text-gray-500 mb-2">Skip the offer process and assign this guide directly to the tour.</p>
                    <button
                      onClick={handleAssignDirectly}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 w-full"
                      disabled={loading}
                    >
                      Assign Directly to Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyOperatorDashboard;