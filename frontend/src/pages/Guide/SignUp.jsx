import React from 'react';
import UniversalSignupForm from '../../components/auth/universalSignupForm';

const GuideSignup = () => {
  const theme = {
    bg: 'bg-green-50',
    text: 'text-green-900',
    icon: '🧭',
    button: 'bg-green-600 hover:bg-green-700',
    buttonHover: 'hover:bg-green-700'
  };

  const customFields = [
    { 
      name: 'first_name',  // Changed from full_name
      label: 'First Name', 
      required: true 
    },
    { 
      name: 'last_name',   // Added this field
      label: 'Last Name', 
      required: true 
    },
    { 
      name: 'license_no',
      label: 'License Number', 
      required: true,
      pattern: '^AL-GD-\\d{4}$',
      errorMessage: 'License must be in format: AL-GD-1234',
      placeholder: 'AL-GD-1234'
    },
    { 
      name: 'bio',  
      label: 'Biography', 
      type: 'textarea',
      placeholder: 'Tell tourists about your guiding experience...',
      required: true
    }
    // Removed phone field as it's not in the GuideProfile model
  ];

  const fileUploadField = {
    label: 'License Verification Document',
    required: true,
    errorMessage: 'Please upload your license document'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <UniversalSignupForm 
        role="guide"
        roleDescription="Licensed Guide"
        themeColor={theme}
        customFields={customFields}
        fileUploadField={fileUploadField}
      />
    </div>
  );
};

export default GuideSignup;