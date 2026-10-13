import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const MinistryAdminLogin = () => {
  const theme = {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    icon: '🏛️',
    button: 'bg-amber-600',
    buttonHover: 'bg-amber-700'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="ministry_admin"
        roleDescription="Ministry Administrator"
        themeColor={theme}
      />
    </div>
  );
};

export default MinistryAdminLogin;