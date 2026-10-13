import React, { useState } from 'react';

const MultiStepForm = ({ 
  steps, 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false,
  submitError = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle file inputs separately
    if (type === 'file') {
      if (files && files[0]) {
        const file = files[0];
        console.log('Selected file:', file.name, file.size, file.type);
        setFormData(prev => ({ ...prev, [name]: file }));
      }
      return;
    }
    
    // Handle other input types
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (fieldName, file) => {
    // Validate file object
    if (!file || !(file instanceof File)) {
      console.error('Invalid file object received:', file);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleNext = () => {
    const currentStepValidator = steps[currentStep].validate;
    if (currentStepValidator) {
      const stepErrors = currentStepValidator(formData);
      setErrors(stepErrors);
      
      if (Object.keys(stepErrors).length === 0) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const currentStepValidator = steps[currentStep].validate;
    let stepErrors = {};
    
    if (currentStepValidator) {
      stepErrors = currentStepValidator(formData);
      setErrors(stepErrors);
    }
    
    if (Object.keys(stepErrors).length === 0 && currentStep === steps.length - 1) {
      onSubmit(formData);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <form onSubmit={handleFormSubmit} className="p-6">
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <strong>Registration Error:</strong> {submitError}
        </div>
      )}
      
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > index 
                ? 'bg-green-500 text-white' 
                : currentStep === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <span className="mt-2 text-sm text-center font-medium text-gray-600">
              {step.title}
            </span>
          </div>
        ))}
      </div>
      
      <CurrentStepComponent
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onFileChange={handleFileChange}
      />
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className={`px-6 py-2 rounded-lg ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Complete Registration'}
          </button>
        )}
      </div>
    </form>
  );
};

export default MultiStepForm;