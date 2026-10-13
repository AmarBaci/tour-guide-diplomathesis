import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignUpLink from './signUpLink';
import FormField from '../shared/FormField';
import { useToast } from '../../context/ToastContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const UniversalLoginForm = ({ role, roleDescription, themeColor }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Login attempt as:", role, "with:", { email, password });
      
      const response = await axios.post('/api/auth/login/', 
        { 
          email, 
          password,
          expected_role: role
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      console.log("Login response:", response);
      const data = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // DEBUG: Log the full response structure
      console.log("Full login response data:", JSON.stringify(data, null, 2));
      
      // Handle different response structures
      let userData = data.user || data;  // Handle both nested and flat structures
      
      // Store user data - SAFE ACCESS
      localStorage.setItem('userData', JSON.stringify({
        email: userData.email,
        user_type: userData.user_type,
        is_verified: userData.is_verified,
        is_approved: userData.is_approved,
        agency_status: userData.agency_status
      }));
      
      console.log("Authentication successful, redirecting...");
      
      // Determine redirection based on user type and status
      let redirectPath = '/';
      
      // SAFE ACCESS: Use fallback values
      const userType = userData.user_type || 'unknown';
      const isApproved = userData.is_approved || false;
      const agencyStatus = userData.agency_status || false;
      
      switch(userType) {
        case 'tourist':
          redirectPath = '/tourist/dashboard';
          break;
          
        case 'guide':
          if (!isApproved) {
            redirectPath = '/guide/verification-pending';
          } else {
            redirectPath = '/guide/dashboard';
          }
          break;
          
        case 'agency_admin':
          if (!agencyStatus) {
            redirectPath = '/agency-admin/verification-pending';
          } else {
            redirectPath = '/agency-admin/dashboard';
          }
          break;
          
        case 'agency_operator':
          redirectPath = '/agency-operator/dashboard';
          break;
          
        case 'ministry_admin':
          redirectPath = '/ministry-admin/dashboard';
          break;
          
        case 'admin':  // Platform admin
          redirectPath = '/platform-admin/dashboard';
          break;
          
        default:
          console.error("Unknown user type:", userType);
          redirectPath = '/';
      }
      
      console.log(`Redirecting to: ${redirectPath}`);
      navigate(redirectPath);
      toast.success(`Welcome back! Signed in as ${roleDescription}.`);
      
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Check your connection.');
      } 
      else if (err.response) {
        if (err.response.status === 403) {
          setError("You're using the wrong login portal for your account type");
        }
        else if (err.response.data?.error) {
          setError(err.response.data.error);
        } 
        else if (err.response.data?.detail) {
          setError(err.response.data.detail);
        } 
        else if (err.response.data?.non_field_errors) {
          setError(err.response.data.non_field_errors[0]);
        } 
        else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('No response from server. Is the backend running?');
      } else {
        // Handle undefined properties safely
        setError('Configuration error: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 mb-4">
          <span className="text-4xl">{themeColor.icon}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login as {roleDescription}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Access your personalized dashboard</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <div className="relative">
          <FormField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link
            to={`/forgot-password?role=${role}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Forgot Password?
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white mt-2
            bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
            transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      
      <SignUpLink role={role} />
    </div>
  );
};

export default UniversalLoginForm;
