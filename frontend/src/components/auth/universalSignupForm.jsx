import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import PasswordInput from './PasswordInput';
import api from '../../utils/axiosConfig';

const UniversalSignupForm = ({ 
  role, 
  roleDescription, 
  themeColor, 
  customFields = [],
  fileUploadField = null  
}) => {
  // Initialize state with all fields
  const [formData, setFormData] = useState(() => {
    const initial = {
      email: '',
      password: '',
      confirmPassword: '',
    };
    customFields.forEach(field => {
      initial[field.name] = '';
    });
    return initial;
  });
  
  const [fileData, setFileData] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(''); 
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ document: 'File size too large (max 5MB)' });
        return;
      }
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors({ document: 'Invalid file type. Use PDF, JPEG or PNG' });
        return;
      }

      setFileData(file);
      setErrors(prev => ({ ...prev, document: '' }));
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    customFields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.pattern && formData[field.name]) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(formData[field.name])) {
          newErrors[field.name] = field.errorMessage || 'Invalid format';
        }
      }
    });
    
    if (fileUploadField?.required && !fileData) {
      newErrors.document = fileUploadField.errorMessage || 'Document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const payload = new FormData();
      
      // Append core fields
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      
      // Append custom fields (role-specific)
      customFields.forEach(field => {
        payload.append(field.name, formData[field.name]);
      });

      // 🚨 FIX: Use correct file field names based on role
      if (fileData) {
        if (role === 'agency') {
          payload.append('registration_document', fileData); // Agency expects this
        } else {
          payload.append('document', fileData); // Guides and others use 'document'
        }
      }

      // Endpoint mapping
      const endpointMap = {
        tourist: '/api/register/tourist/',
        guide: '/api/register/guide/',
        agency: '/api/register/agency/'
      };
      
      const endpoint = endpointMap[role];
      
      if (!endpoint) {
        throw new Error(`No endpoint for role: ${role}`);
      }

      console.log('Submitting to:', endpoint);
      console.log('Payload entries:');
      for (const [key, value] of payload.entries()) {
        console.log(key, value);
      }

      const response = await api.post(endpoint, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', response.data);
      
      setErrors({});
      if (role === 'tourist') {
        navigate(`/${role}/login`, {
          state: {
            success: `Registration successful! Please log in.`,
            email: formData.email
          }
        });
      } else {
        navigate(`/${role}/verification-pending`, { 
          state: { 
            message: `Your ${roleDescription} registration is pending approval`,
            email: formData.email
          } 
        });
      }
    } catch (error) {
      console.error('Full error:', error);
      
      // Enhanced error parsing with better role-specific messages
      if (error.response) {
        const { data } = error.response;
        
        // Handle field-specific errors
        if (data.errors) {
          const fieldErrors = {};
          for (const [key, value] of Object.entries(data.errors)) {
            if (Array.isArray(value)) {
              fieldErrors[key] = value.join(' ');
            } else {
              fieldErrors[key] = value;
            }
          }
          setErrors(fieldErrors);
        } 
        // Handle general errors with role-specific context
        else if (data.message) {
          setErrors({ general: data.message });
        } else if (data.error) {
          setErrors({ general: data.error });
        } else {
          setErrors({ general: `${roleDescription} registration failed. Please try again.` });
        }
      } else if (error.request) {
        setErrors({ general: 'No response from server. Check your connection.' });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if we should show file upload based on role
  const shouldShowFileUpload = fileUploadField && (role === 'agency' || role === 'guide');

  return (
    <div className={`max-w-md mx-auto p-8 rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700`}>
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full mb-4">
          <span className="text-4xl">{themeColor.icon}</span>
        </div>
        <h2 className="text-2xl font-bold">Create {roleDescription} Account</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Join our tourism platform</p>
      </div>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        
        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />
        
        {/* Role-Specific Fields */}
        {customFields.map(field => (
          <FormInput
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={handleChange}
            error={errors[field.name]}
            required={field.required}
            placeholder={field.placeholder}
            pattern={field.pattern}
            title={field.title}
            options={field.options}
          />
        ))}
        
        {/* File Upload Field - Only show for roles that need it */}
        {shouldShowFileUpload && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {fileUploadField.label} {fileUploadField.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, or PNG (MAX. 5MB)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
            
            {previewUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">Document Preview:</p>
                <img 
                  src={previewUrl} 
                  alt="Document preview" 
                  className="mt-1 max-h-40 rounded border"
                />
              </div>
            )}
            
            {fileData && !previewUrl && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Selected file: {fileData.name} ({(fileData.size / 1024).toFixed(1)}KB)
                </p>
              </div>
            )}
            
            {errors.document && (
              <p className="mt-1 text-sm text-red-600">{errors.document}</p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${themeColor.button} hover:${themeColor.buttonHover} transition-colors disabled:opacity-50`}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link 
            to={`/${role.replace('_', '-')}/login`} 
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UniversalSignupForm;