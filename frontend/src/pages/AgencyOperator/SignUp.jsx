import React from 'react';
import UniversalSignupForm from '../../components/auth/universalSignupForm';

const AgencyOperatorSignup = () => {
  const theme = {
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    icon: '👨‍💼',
    button: 'bg-indigo-600',
    buttonHover: 'bg-indigo-700'
  };

  const customFields = [
    { 
      name: 'agency_registration_no', 
      label: 'Agency Registration Number', 
      required: true,
      pattern: '^AL-AG-\\d{4}$',
      errorMessage: 'Format: AL-AG-1234'
    },
    { name: 'full_name', label: 'Full Name', required: true },
    { 
      name: 'phone', 
      label: 'Phone Number', 
      required: true,
      placeholder: '+355 XX XXX XXXX',
      pattern: '^\\+355\\s?\\d{2}\\s?\\d{3}\\s?\\d{3,4}$',
      errorMessage: 'Albanian format: +355 XX XXX XXXX'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-gray-900 dark:to-gray-950">
      <UniversalSignupForm 
        role="agency_operator"
        roleDescription="Agency Operator"
        themeColor={theme}
        customFields={customFields}
      />
    </div>
  );
};

export default AgencyOperatorSignup;