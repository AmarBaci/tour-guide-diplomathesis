import React, { useState, useEffect } from "react";
import { 
  FiUser, 
  FiBriefcase, 
  FiCalendar,
  FiCheck,
  FiX,
  FiDollarSign,
  FiBell,
  FiSearch,
  FiEdit3,
  FiRefreshCw,
  FiMail,
  FiClock,
  FiMapPin,
  FiUsers,
  FiLoader
} from "react-icons/fi";
import { FaCertificate } from "react-icons/fa";
import { guideAPI } from "../../api/guide";
import { useDashboard } from '../../context/DashboardContext';

const GuideDashboard = () => {
  const { activeTab, setActiveTab } = useDashboard();
  useEffect(() => { setActiveTab(p => p || 'profile'); }, [setActiveTab]);
  const [profile, setProfile] = useState(null);
  const [availableTours, setAvailableTours] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [availability, setAvailability] = useState([]);  // { id, date, is_available }
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed
  const [loading, setLoading] = useState({
    profile: false,
    tours: false,
    offers: false,
    applying: false,
    responding: false,
    calendar: false
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    languages: []
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setError("");
      const response = await guideAPI.getMyProfile();
      
      if (response.data) {
        setProfile(response.data);
        setEditForm({
          bio: response.data.bio || "",
          languages: response.data.languages || []
        });
      } else {
        setError("No profile data received");
      }
    } catch {
      setError("Failed to load profile data");
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Fetch available tours
  const fetchAvailableTours = async () => {
    try {
      setLoading(prev => ({ ...prev, tours: true }));
      setError("");
      const response = await guideAPI.getAvailableTours();
      
      // Handle different possible response structures
      let toursData = response.data;
      
      if (toursData && !Array.isArray(toursData)) {
        if (toursData.results) toursData = toursData.results;
        else if (toursData.data) toursData = toursData.data;
        else if (toursData.tours) toursData = toursData.tours;
      }
      
      setAvailableTours(Array.isArray(toursData) ? toursData : []);
    } catch {
      setError("Failed to load available tours");
      setAvailableTours([]);
    } finally {
      setLoading(prev => ({ ...prev, tours: false }));
    }
  };

  // Fetch job offers
  const fetchJobOffers = async () => {
    try {
      setLoading(prev => ({ ...prev, offers: true }));
      setError("");
      const response = await guideAPI.getJobOffers();
      setJobOffers(response.data.results || response.data || []);
    } catch {
      setError("Failed to load job offers");
      setJobOffers([]);
    } finally {
      setLoading(prev => ({ ...prev, offers: false }));
    }
  };

  // Fetch availability for the calendar
  const fetchAvailability = async () => {
    try {
      setLoading(prev => ({ ...prev, calendar: true }));
      const response = await guideAPI.getAvailability();
      setAvailability(response.data.results || response.data || []);
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setLoading(prev => ({ ...prev, calendar: false }));
    }
  };

  // Toggle a day's availability
  const handleToggleDay = async (dateStr) => {
    const existing = availability.find(a => a.date === dateStr);
    const newValue = existing ? !existing.is_available : false; // default is available; first click = mark unavailable
    try {
      await guideAPI.setAvailability(dateStr, newValue);
      await fetchAvailability();
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "browse") {
      fetchAvailableTours();
    } else if (activeTab === "offers") {
      fetchJobOffers();
    } else if (activeTab === "calendar") {
      fetchAvailability();
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const response = await guideAPI.updateMyProfile(editForm);
      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
    } catch {
      setError("Failed to update profile");
    }
  };

  const handleApplyForTour = async (tourId) => {
    try {
      setLoading(prev => ({ ...prev, applying: true }));
      setError("");
      await guideAPI.applyForTour(tourId);
      // Remove the applied tour from the list
      setAvailableTours(prevTours => prevTours.filter(tour => tour.id !== tourId));
      setSuccessMessage("Successfully applied for the tour!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to apply for tour");
    } finally {
      setLoading(prev => ({ ...prev, applying: false }));
    }
  };

  const handleRespondToOffer = async (offerId, response) => {
    try {
      setLoading(prev => ({ ...prev, responding: true }));
      setError("");
      await guideAPI.respondToOffer(offerId, response);
      // Refresh the offers list to get updated data
      await fetchJobOffers();
      setSuccessMessage(`Offer ${response} successfully!`);
    } catch {
      setError("Failed to respond to offer");
    } finally {
      setLoading(prev => ({ ...prev, responding: false }));
    }
  };

  const handleRetry = () => {
    setError("");
    if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "browse") {
      fetchAvailableTours();
    } else if (activeTab === "offers") {
      fetchJobOffers();
    }
  };

  const renderProfile = () => {
    if (loading.profile) return (
      <div className="flex justify-center items-center p-8">
        <FiLoader className="animate-spin mr-2" />
        Loading profile...
      </div>
    );
    
    if (error) return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={handleRetry}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
    
    if (!profile) return (
      <div className="text-gray-500 p-8 text-center">
        No profile data found. Please contact support.
      </div>
    );

    return (
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiEdit3 className="mr-1" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{profile.full_name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{profile.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <p className="text-gray-900">{profile.license_no}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Tell us about yourself and your guiding experience..."
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{profile.full_name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{profile.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-gray-900">{profile.license_no}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="mt-1 text-gray-900">{profile.bio || "No bio provided"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Qualifications & Licenses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <FaCertificate className="mr-2 text-blue-600" /> 
                Languages
              </h3>
              {profile.languages && profile.languages.length > 0 ? (
                <ul className="space-y-2">
                  {profile.languages.map((language, i) => (
                    <li key={i} className="flex items-start">
                      <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span>{language.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No languages specified</p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <FaCertificate className="mr-2 text-blue-600" /> 
                License Status
              </h3>
              <div className={`border rounded-lg p-3 ${
                profile.is_approved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
              }`}>
                <div className="font-medium">{profile.license_no}</div>
                <div className={`text-sm ${
                  profile.is_approved ? "text-green-700" : "text-yellow-700"
                }`}>
                  Status: {profile.is_approved ? "Approved" : "Pending Approval"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBrowseTours = () => {
    if (loading.tours) return (
      <div className="flex justify-center items-center p-8">
        <FiLoader className="animate-spin mr-2" />
        Loading available tours...
      </div>
    );
    
    return (
      <div className="space-y-6">
        {/* Approval status banner */}
        {profile && !profile.is_approved && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
            <FiBell className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Your guide profile is pending approval.</p>
              <p className="text-sm">You can browse available tours but cannot apply until a Ministry Admin approves your profile.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Available Tour Opportunities</h2>
          <button 
            onClick={fetchAvailableTours}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw className="mr-1" />
            Refresh
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <FiSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search tours by location, agency, or specialty..."
                className="w-full p-2 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="divide-y">
            {availableTours.length > 0 ? (
              availableTours.map(tour => (
                <div key={tour.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{tour.title}</h3>
                      <p className="text-gray-600">{tour.agency_name || 'Unknown Agency'}</p>
                    </div>
                    <div className="flex items-center">
                      <FiDollarSign className="mr-1 text-green-600" />
                      <span className="font-medium">€{tour.price_per_person}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-gray-700">{tour.description}</p>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-1" />
                        <span>Duration: {tour.duration_hours} hours</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <FiUsers className="inline mr-1" />
                        Max group: {tour.max_group_size} people
                      </div>
                      <div className="text-sm text-gray-500">
                        <FiMapPin className="inline mr-1" />
                        Category: {tour.category}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                        onClick={() => handleApplyForTour(tour.id)}
                        disabled={loading.applying}
                      >
                        {loading.applying ? (
                          <>
                            <FiLoader className="animate-spin inline mr-1" />
                            Applying...
                          </>
                        ) : "Apply Now"}
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {error ? "Error loading tours. Please try again." : "No available tours at the moment. Check back later!"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderJobOffers = () => {
    if (loading.offers) return (
      <div className="flex justify-center items-center p-8">
        <FiLoader className="animate-spin mr-2" />
        Loading job offers...
      </div>
    );
    
    return (
      <div className="space-y-6">
        {/* Approval status banner */}
        {profile && !profile.is_approved && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
            <FiBell className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Your guide profile is pending approval.</p>
              <p className="text-sm">We'll notify you once a Ministry Admin reviews your profile. Offers received here will be visible after approval.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Job Offers</h2>
          <button 
            onClick={fetchJobOffers}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw className="mr-1" />
            Refresh
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="divide-y">
            {jobOffers.length > 0 ? (
              jobOffers.map(offer => (
                <div key={offer.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{offer.tour?.title || "Unknown Tour"}</h3>
                      <p className="text-gray-600">{offer.agency_name || "Unknown Agency"}</p>
                    </div>
                    <div className="flex items-center">
                      <FiDollarSign className="mr-1 text-green-600" />
                      <span className="font-medium">€{offer.proposed_salary}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      <span>Duration: {offer.tour?.duration_hours || "N/A"} hours</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiDollarSign className="mr-1" />
                      <span>Tour Price: €{offer.tour?.price_per_person || "N/A"}/person</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMail className="mr-1" />
                      <span>Received: {new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded ${
                        offer.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : offer.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {offer.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                        onClick={() => handleRespondToOffer(offer.id, 'accepted')}
                        disabled={loading.responding}
                      >
                        {loading.responding ? (
                          <>
                            <FiLoader className="animate-spin inline mr-1" />
                            Accepting...
                          </>
                        ) : "Accept Offer"}
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                        onClick={() => handleRespondToOffer(offer.id, 'rejected')}
                        disabled={loading.responding}
                      >
                        {loading.responding ? (
                          <>
                            <FiLoader className="animate-spin inline mr-1" />
                            Declining...
                          </>
                        ) : "Decline Offer"}
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {error ? "Error loading offers. Please try again." : "No job offers at the moment. Check back later!"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
    const today = new Date();
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Build a map of date string → availability entry
    const availMap = {};
    availability.forEach(a => { availMap[a.date] = a; });

    const prevMonth = () => {
      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
      else setCalendarMonth(m => m - 1);
    };
    const nextMonth = () => {
      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
      else setCalendarMonth(m => m + 1);
    };

    // Pad cells so the first day falls on the correct weekday column
    const padCells = Array(firstDayOfMonth).fill(null);
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Availability Calendar</h2>
        <p className="text-gray-500 text-sm -mt-4">Click a day to toggle your availability. Green = available, red = unavailable.</p>

        {loading.calendar ? (
          <div className="flex justify-center items-center p-8">
            <FiLoader className="animate-spin mr-2" />
            Loading calendar...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-medium text-lg">{monthNames[calendarMonth]} {calendarYear}</h3>
                <p className="text-gray-600 text-sm">Your availability is visible to agencies</p>
              </div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50">
                  ‹ Prev
                </button>
                <button onClick={() => { setCalendarMonth(today.getMonth()); setCalendarYear(today.getFullYear()); }}
                  className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50">
                  Today
                </button>
                <button onClick={nextMonth} className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50">
                  Next ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {padCells.map((_, i) => <div key={`pad-${i}`} />)}
              {dayCells.map(day => {
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const entry = availMap[dateStr];
                // If no entry: treat as available (default); if entry exists use its value
                const isAvail = entry ? entry.is_available : true;
                const isPast = new Date(dateStr) < new Date(today.toDateString());
                return (
                  <button
                    key={dateStr}
                    disabled={isPast}
                    onClick={() => handleToggleDay(dateStr)}
                    title={dateStr}
                    className={`min-h-12 p-2 border rounded-lg text-sm font-medium transition-colors
                      ${isPast ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' :
                        isAvail ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800' :
                                  'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded opacity-40" />
                <span>Past</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return renderProfile();
      case "browse": return renderBrowseTours();
      case "offers": return renderJobOffers();
      case "calendar": return renderCalendar();
      default: return renderProfile();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">

        
        {/* Scrollable Content */}

        <div className="p-6">
          {renderContent()}
        </div>
    </div>
  );
};

export default GuideDashboard;