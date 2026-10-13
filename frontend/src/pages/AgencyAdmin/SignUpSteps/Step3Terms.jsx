import React from 'react';

const Step3Terms = ({ formData, errors, onChange }) => {
  const termsId = "terms-accepted";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">Terms & Conditions</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
        <h3 className="font-bold mb-2">Tourism Platform Agreement</h3>
        <p className="text-sm mb-3">
          By registering your agency on our platform, you agree to the following terms...
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>All tours must comply with Albanian tourism regulations</li>
          <li>Only licensed guides may be employed through the platform</li>
          <li>Commission fees apply to completed bookings</li>
          <li>Accurate representation of services is required</li>
          <li>Ministry approval is required for all agency accounts</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={termsId}
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted || false}
              onChange={onChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
            />
          </div>
          <div className="ml-3 text-sm">
            <label 
              htmlFor={termsId} 
              className="font-medium text-gray-700"
            >
              I accept the Terms & Conditions and Privacy Policy
            </label>
            <p className="text-gray-500">
              You acknowledge that your registration requires ministry approval
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p id="terms-error" className="mt-1 text-sm text-red-600">
            {errors.termsAccepted}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step3Terms;