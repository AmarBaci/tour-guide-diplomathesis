// src/pages/tourist/Login.jsx
import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const TouristLogin = () => {
  const theme = {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: '🌄',
    button: 'bg-blue-600',
    buttonHover: 'bg-blue-700'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="tourist"
        roleDescription="Tourist"
        themeColor={theme}
      />
    </div>
  );
};

export default TouristLogin;