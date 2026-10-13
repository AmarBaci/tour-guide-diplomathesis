import React from 'react';

const FormNavigation = ({ 
  onBack, 
  onNext, 
  onSubmit,
  isFirstStep, 
  isLastStep,
  nextLabel = 'Next'
}) => {
  return (
    <div className="flex justify-between mt-8">
      {!isFirstStep ? (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      ) : (
        <div></div> // Spacer
      )}
      
      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {nextLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Submit Registration
        </button>
      )}
    </div>
  );
};

export default FormNavigation;