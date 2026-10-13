import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const GuideLogin = () => {
  const theme = {
    bg: 'bg-green-50',
    text: 'text-green-900',
    icon: '🧭',
    button: 'bg-green-600',
    buttonHover: 'bg-green-700'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="guide"
        roleDescription="Licensed Guide"
        themeColor={theme}
      />
    </div>
  );
};

export default GuideLogin;