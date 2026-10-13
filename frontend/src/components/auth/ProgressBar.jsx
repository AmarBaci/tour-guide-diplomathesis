import React from 'react';

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li 
            key={index} 
            className={`flex-1 flex items-center ${
              index < steps.length - 1 ? 'after:content-[""] after:w-full after:h-1' : ''
            } ${index <= currentStep ? 'after:bg-blue-600' : 'after:bg-gray-200 dark:after:bg-gray-700'}`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              index === currentStep ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ProgressBar;