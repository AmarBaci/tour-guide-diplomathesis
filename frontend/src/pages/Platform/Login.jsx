import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const PlatformAdminLogin = () => {
  const theme = {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    icon: '🔧',
    button: 'bg-gray-800',
    buttonHover: 'bg-gray-900'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="admin"
        roleDescription="Platform Administrator"
        themeColor={theme}
      />
    </div>
  );
};

export default PlatformAdminLogin;