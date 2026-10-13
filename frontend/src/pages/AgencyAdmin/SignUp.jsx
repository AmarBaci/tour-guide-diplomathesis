import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiStepForm from '../../components/auth/MultiStepForm';
import Step1AgencyInfo from './SignUpSteps/Step1AgencyInfo';
import Step2AdminInfo from './SignUpSteps/Step2AdminInfo';
import Step3Terms from './SignUpSteps/Step3Terms';
import api from '../../utils/axiosConfig';

const AgencySignup = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // 1. Validate passwords match on frontend
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // 2. Create FormData payload - REMOVE confirmPassword
      const payload = new FormData();
      
      // Append only the fields the backend expects
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('agency_name', formData.agency_name);
      payload.append('registration_no', formData.registration_no);
      
      // 3. Append file
      if (formData.registration_document instanceof File) {
        payload.append('registration_document', formData.registration_document);
      } else {
        throw new Error('Please upload a registration document');
      }
      
      // 4. Debug: Log what we're sending
      console.log('Sending registration data:');
      for (const [key, value] of payload.entries()) {
        console.log(key, key === 'password' ? '***' : value);
      }
      
      // 5. Send request
      const response = await api.post('api/register/agency/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Registration successful:', response.data);
      
      // 6. Redirect on success
      navigate('/agency-admin/verification-pending', {
        state: {
          email: formData.email,
          message: "Your agency registration is under review"
        }
      });
      
    } catch (error) {
      // 7. Enhanced error handling
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please check your information.';
      
      if (error.message === 'Passwords do not match') {
        errorMessage = error.message;
      } 
      else if (error.response?.data) {
        const backendErrors = error.response.data;
        
        // Handle backend validation errors
        if (backendErrors.errors) {
          // Extract first error message
          const firstError = Object.values(backendErrors.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (backendErrors.message) {
          errorMessage = backendErrors.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const steps = [
    {
      title: 'Agency Info',
      component: Step1AgencyInfo,
      validate: Step1AgencyInfo.validate
    },
    {
      title: 'Admin Account',
      component: Step2AdminInfo,
      validate: Step2AdminInfo.validate
    },
    {
      title: 'Terms',
      component: Step3Terms,
      validate: Step3Terms.validate
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900">
            Register Your Tourism Agency
          </h1>
          <p className="text-gray-600 mt-2">
            Complete the following steps to join our platform
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-2">
          <MultiStepForm 
            steps={steps} 
            onSubmit={handleSubmit}
            initialData={{ 
              userType: 'agency_admin',
              agencyType: 'travel_agency' 
            }}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Already have an agency account?{' '}
            <a href="/agency/login" className="text-blue-600 font-medium hover:underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgencySignup;