import React from 'react';
import UniversalSignupForm from '../../components/auth/universalSignupForm';

const PlatformAdminSignup = () => {
  const theme = {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    icon: '🔧',
    button: 'bg-gray-800',
    buttonHover: 'bg-gray-900'
  };

  const customFields = [
    { name: 'full_name', label: 'Full Name', required: true },
    { 
      name: 'admin_code', 
      label: 'Admin Authorization Code', 
      required: true,
      pattern: '^ADMIN-\\d{3}-[A-Z]{4}$',
      errorMessage: 'Format: ADMIN-123-ABCD'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-gray-950">
      <UniversalSignupForm 
        role="admin"
        roleDescription="Platform Administrator"
        themeColor={theme}
        customFields={customFields}
      />
    </div>
  );
};

export default PlatformAdminSignup;