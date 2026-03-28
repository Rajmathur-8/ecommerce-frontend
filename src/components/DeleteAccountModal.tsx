'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmText') {
      setConfirmText(value);
    }
    if (error) setError('');
  };

  const validateForm = () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('=== DELETE ACCOUNT DEBUG ===');
    console.log('Password provided:', !!password);
    console.log('Confirm text:', confirmText);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('Calling delete account API...');
      const response = await apiService.profile.deleteUserAccount({
        password: password || undefined
      });
      
      console.log('Delete account response:', response);
      
      if (response.success) {
        console.log('Account deleted successfully, logging out...');
        // Logout user and redirect to home
        logout();
        router.push('/');
      } else {
        setError(response.message || 'Failed to delete account');
      }
    } catch (error) {
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Trash2 className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. All your data including orders, addresses, and preferences will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password (if user has one) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password (if you have one)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if you don&apos;t have a password</p>
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                id="confirmText"
                name="confirmText"
                value={confirmText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Type DELETE"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
