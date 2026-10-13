import React from 'react';

export default function FormInput({ 
  label, 
  type = "text", 
  options, 
  error, 
  required, 
  ...props 
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === "select" ? (
        <select
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
            error ? 'border-red-500' : ''
          }`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options && options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
            error ? 'border-red-500' : ''
          }`}
          {...props}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}