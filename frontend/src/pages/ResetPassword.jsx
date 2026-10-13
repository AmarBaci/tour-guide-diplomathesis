import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PasswordInput from '../components/auth/PasswordInput';
import api from '../utils/axiosConfig';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please use the link sent to your email.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/password/reset/confirm/', {
        token,
        password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/select-account'), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Reset failed. The token may have expired or already been used.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-center dark:text-white">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Password Updated!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your password has been changed successfully. Redirecting to
          login&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Set New Password</h2>

      {!token && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg">
          No reset token found in the URL. Please use the link sent to your
          email.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          name="new_password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm new password"
          name="confirm_password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Updating\u2026' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        <Link to="/select-account" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}