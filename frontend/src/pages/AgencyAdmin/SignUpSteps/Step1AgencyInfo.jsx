import React from 'react';

const Step1AgencyInfo = ({ formData, errors, onChange, onFileChange }) => {
  // Unique IDs for accessibility
  const agencyNameId = "agency-name";
  const registrationNoId = "registration-no";
  const documentId = "registration-document";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">Agency Information</h2>
      <p className="text-gray-600">
        Provide your agency's official details and documentation
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Agency Name Field */}
        <div>
          <label 
            htmlFor={agencyNameId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Agency Name <span className="text-red-500">*</span>
          </label>
          <input
            id={agencyNameId}
            type="text"
            name="agency_name"
            value={formData.agency_name || ''}
            onChange={onChange}
            autoComplete="organization"
            className={`w-full px-4 py-2 border ${
              errors.agency_name ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter agency name"
            aria-describedby={errors.agency_name ? "agency-name-error" : undefined}
          />
          {errors.agency_name && (
            <p id="agency-name-error" className="mt-1 text-sm text-red-600">
              {errors.agency_name}
            </p>
          )}
        </div>
        
        {/* Registration Number Field */}
        <div>
          <label 
            htmlFor={registrationNoId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            id={registrationNoId}
            type="text"
            name="registration_no"
            value={formData.registration_no || ''}
            onChange={onChange}
            autoComplete="off"
            className={`w-full px-4 py-2 border ${
              errors.registration_no ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="AL-AG-1234"
            aria-describedby={errors.registration_no ? "registration-no-error" : undefined}
          />
          {errors.registration_no && (
            <p id="registration-no-error" className="mt-1 text-sm text-red-600">
              {errors.registration_no}
            </p>
          )}
        </div>
      </div>
      
      {/* Document Upload Field */}
      <div>
        <label 
          htmlFor={documentId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Business Registration Document <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center justify-center w-full">
          <label 
            htmlFor={documentId}
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-10 h-10 text-gray-400 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, or PNG (MAX. 5MB)
              </p>
            </div>
          </label>
          <input 
            id={documentId}
            type="file" 
            className="hidden" 
            onChange={(e) => onFileChange('registration_document', e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
            aria-describedby={errors.registration_document ? "document-error" : undefined}
          />
        </div>
        
        {errors.registration_document && (
          <p id="document-error" className="mt-1 text-sm text-red-600">
            {errors.registration_document}
          </p>
        )}
        
        {formData.registration_document && (
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              Selected file: {formData.registration_document.name} 
              ({(formData.registration_document.size / 1024).toFixed(1)}KB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1AgencyInfo;