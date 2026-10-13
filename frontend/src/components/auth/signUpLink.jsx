import React from 'react';
import { Link } from 'react-router-dom';

const SignUpLink = ({ role }) => {
  // Map backend roles to frontend path segments
  const getPathSegment = () => {
    const pathMap = {
      tourist: 'tourist',
      guide: 'guide',
      agency_admin: 'agency-admin'
    };
    return pathMap[role];
  };

  const pathSegment = getPathSegment();

  if (!pathSegment) return null;

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link 
          to={`/${pathSegment}/signup`} 
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};

export default SignUpLink;