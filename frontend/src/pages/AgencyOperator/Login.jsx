import React from 'react';
import UniversalLoginForm from '../../components/auth/universalLoginForm';

const AgencyOperatorLogin = () => {
  const theme = {
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    icon: '👨‍💼',
    button: 'bg-indigo-600',
    buttonHover: 'bg-indigo-700'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalLoginForm 
        role="agency_operator"
        roleDescription="Agency Operator"
        themeColor={theme}
      />
    </div>
  );
};

export default AgencyOperatorLogin;