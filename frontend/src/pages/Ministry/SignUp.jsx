import React from 'react';
import UniversalSignupForm from '../../components/auth/universalSignupForm';

const MinistryAdminSignup = () => {
  const theme = {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    icon: '🏛️',
    button: 'bg-amber-600',
    buttonHover: 'bg-amber-700'
  };

  const customFields = [
    { name: 'department', label: 'Department', required: true },
    { name: 'full_name', label: 'Full Name', required: true },
    { 
      name: 'phone', 
      label: 'Phone Number', 
      required: true,
      placeholder: '+355 XX XXX XXXX',
      pattern: '^\\+355\\s?\\d{2}\\s?\\d{3}\\s?\\d{3,4}$',
      errorMessage: 'Albanian format: +355 XX XXX XXXX'
    },
    { 
      name: 'official_id', 
      label: 'Official ID Number', 
      required: true,
      pattern: '^GOV-AL-\\d{5}$',
      errorMessage: 'Format: GOV-AL-12345'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalSignupForm 
        role="ministry_admin"
        roleDescription="Ministry Administrator"
        themeColor={theme}
        customFields={customFields}
      />
    </div>
  );
};

export default MinistryAdminSignup;