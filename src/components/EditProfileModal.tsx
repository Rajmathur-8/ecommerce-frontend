'use client';

import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import OtpVerificationModal from './OtpVerificationModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function EditProfileModal({ isOpen, onClose, onProfileUpdated }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [originalPhone, setOriginalPhone] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
      setOriginalPhone(user.phone || '');
      setShowOtpVerification(false);
      setError('');
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if phone number has changed and is not empty
    const phoneChanged = formData.phone && formData.phone !== originalPhone;
    console.log('Phone comparison:', {
      formDataPhone: formData.phone,
      originalPhone: originalPhone,
      phoneChanged: phoneChanged
    });
    
    if (phoneChanged) {
      // Send OTP first, then show verification
      setLoading(true);
      try {
        // Add +91 prefix if not already present
        const phoneWithCountryCode = formData.phone.startsWith('+91') 
          ? formData.phone 
          : `+91${formData.phone}`;
        
        const response = await apiService.auth.sendPhoneOtp(phoneWithCountryCode);
        console.log('OTP Response:', response);
        if (response.success) {
          console.log('Setting showOtpVerification to true');
          setShowOtpVerification(true);
        } else {
          setError(response.message || 'Failed to send OTP');
        }
      } catch (error) {
        setError('Failed to send OTP. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }


    // If no phone change, update profile directly
    setLoading(true);
    try {
      // Remove +91 prefix before saving to database
      const updatedFormData = {
        ...formData,
        phone: formData.phone ? formData.phone.replace(/^\+91/, '') : formData.phone
      };
      const response = await apiService.profile.updateUserProfile(updatedFormData);
      
      if (response.success) {
        // Update the user context
        if (updateProfile && response.data?.user) {
          updateProfile(response.data.user);
        }
        onProfileUpdated();
        onClose();
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string): Promise<boolean> => {
    try {
      // Add +91 prefix if not already present (same as in handleSubmit)
      const phoneWithCountryCode = formData.phone.startsWith('+91') 
        ? formData.phone 
        : `+91${formData.phone}`;
      
      // Verify OTP with the backend
      const verifyResponse = await apiService.auth.verifyPhoneOtp(phoneWithCountryCode, otp);
      console.log('OTP Verification Response:', verifyResponse);
      
      if (verifyResponse.success) {
        console.log('OTP verification successful, updating profile...');
        // OTP verified successfully, now update the profile with phone number without prefix
        const phoneWithoutPrefix = formData.phone.replace(/^\+91/, ''); // Remove +91 prefix
        const updatedFormData = {
          ...formData,
          phone: phoneWithoutPrefix
        };
        console.log('Updated form data:', updatedFormData);
        
        try {
          const response = await apiService.profile.updateUserProfile(updatedFormData);
          console.log('Profile Update Response:', response);
          
          if (response.success) {
            // Update the user context
            if (updateProfile && response.data?.user) {
              updateProfile(response.data.user);
            }
            onProfileUpdated();
            // Close the OTP modal and the edit profile modal
            setShowOtpVerification(false);
            onClose();
            return true;
          } else {
            // Profile update failed
            setError(response.message || 'Failed to update profile');
            return false; // Return false to keep modal open and show error
          }
        } catch (profileError) {
          setError('Failed to update profile. Please try again.');
          return false; // Return false to keep modal open and show error
        }
      } else {
        setError(verifyResponse.message || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
      return false;
    }
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
    setError('');
  };

  // Debug: Log the current state
  console.log('EditProfileModal render - showOtpVerification:', showOtpVerification);
  console.log('EditProfileModal render - isOpen:', isOpen);

  return (
    <>
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpVerification}
        onClose={() => setShowOtpVerification(false)}
        onVerify={handleOtpVerify}
        phoneNumber={formData.phone}
        onBack={handleBackFromOtp}
      />

      {/* Edit Profile Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <User className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">+91</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter phone number"
                    />
                  </div>
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
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}