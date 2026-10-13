// src/components/auth/VerificationPending.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const VerificationPending = ({ role, contactEmail = "tourism@ministry.al" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center">
        <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Account Verification Pending</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your {role} account is under review by the Ministry of Tourism. 
          This process usually takes 1-2 business days.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-medium">Note:</span> You'll receive an email notification 
            once your account is approved. For urgent inquiries, contact 
              <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
              {contactEmail}
            </a>
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Return Home
          </Link>
          <Link 
            to={`/${role}/login`} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Login Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;