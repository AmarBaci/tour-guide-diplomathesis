import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    loading: true,
    isValid: false,
    user: null
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('accessToken');
      let userData;
      
      try {
        userData = JSON.parse(localStorage.getItem('userData') || '{}');
      } catch (e) {
        console.error("Error parsing userData:", e);
        userData = {};
      }
      
      // No token = not authenticated
      if (!token) {
        setAuthState({ loading: false, isValid: false, user: null });
        return;
      }
      
      try {
        // Verify token locally first
        const decoded = jwtDecode(token); // Now properly using jwtDecode
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (isExpired) {
          throw new Error('Token expired');
        }
        
        // Verify with backend
        await api.get('/api/auth/verify/');
        
        setAuthState({
          loading: false,
          isValid: true,
          user: userData
        });
      } catch (error) {
        console.error("Authentication verification failed:", error);
        
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        setAuthState({ loading: false, isValid: false, user: null });
      }
    };

    verifyAuth();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      verifyAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loader while verifying
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authState.isValid) {
    return <Navigate to="/tourist/login" state={{ from: location }} replace />;
  }

  // Check user role permissions
  if (allowedRoles && !allowedRoles.includes(authState.user?.user_type)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
          <p className="mt-4 mb-6">
            Your account type ({authState.user?.user_type}) doesn't have permission to access this page.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;