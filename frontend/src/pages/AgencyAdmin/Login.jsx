import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const AgencyAdminLogin = () => {
  const theme = {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    icon: '🏢',
    button: 'bg-purple-600',
    buttonHover: 'bg-purple-700'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-violet-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="agency_admin"
        roleDescription="Agency Administrator"
        themeColor={theme}
      />
    </div>
  );
};

export default AgencyAdminLogin;