import React from 'react';
import UniversalSignupForm from '../../components/auth/universalSignupForm';

const TouristSignup = () => {
  const theme = {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: '🌄',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonHover: 'hover:bg-blue-700'
  };

  const customFields = [
    { 
      name: 'full_name', 
      label: 'Full Name', 
      required: true,
      pattern: "^[a-zA-Z' \\-]{2,100}$",
      errorMessage: 'Please enter a valid name (2-100 characters)'
    },
    { 
      name: 'nationality', 
      label: 'Nationality', 
      required: true,
      type: 'select',
      options: [
        { value: 'AL', label: 'Albania' },
        { value: 'US', label: 'United States' },
        { value: 'UK', label: 'United Kingdom' },
        // Add more nationalities
      ]
    },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <UniversalSignupForm 
        role="tourist"
        roleDescription="Tourist"
        themeColor={theme}
        customFields={customFields}
      />
    </div>
  );
};

export default TouristSignup;