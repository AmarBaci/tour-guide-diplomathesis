// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Unauthorized Access</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          You don't have permission to access this page. 
          Please contact support if you believe this is an error.
        </p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;