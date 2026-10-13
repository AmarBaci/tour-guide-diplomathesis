import React from 'react';

const Step2AdminInfo = ({ formData, errors, onChange }) => {
  // Unique IDs for accessibility
  const emailId = "admin-email";
  const passwordId = "admin-password";
  const confirmPasswordId = "admin-confirm-password";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">Administrator Account</h2>
      <p className="text-gray-600">
        Create the administrator account for your agency
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Email Field */}
        <div>
          <label 
            htmlFor={emailId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id={emailId}
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            autoComplete="email"
            className={`w-full px-4 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="your.email@example.com"
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Field */}
          <div>
            <label 
              htmlFor={passwordId}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id={passwordId}
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={onChange}
              autoComplete="new-password"
              className={`w-full px-4 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="••••••••"
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <label 
              htmlFor={confirmPasswordId}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id={confirmPasswordId}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword || ''}
              onChange={onChange}
              autoComplete="new-password"
              className={`w-full px-4 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="••••••••"
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2AdminInfo;