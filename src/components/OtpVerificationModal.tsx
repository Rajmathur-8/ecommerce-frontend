'use client';

import React, { useState, useEffect } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { apiService } from '@/lib/api';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<boolean>;
  phoneNumber: string;
  onBack: () => void;
}

export default function OtpVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  phoneNumber, 
  onBack 
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendCooldown(60); // 60 seconds cooldown
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '').slice(0, 1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Calling onVerify with OTP:', otpString);
      const success = await onVerify(otpString);
      console.log('onVerify returned:', success);
      if (success) {
        console.log('OTP verification successful, parent will handle closing...');
        // Parent component will handle closing the modal
      } else {
        console.log('OTP verification failed, showing error...');
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      // Add +91 prefix if not already present
      const phoneWithCountryCode = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;
      
      const response = await apiService.auth.sendPhoneOtp(phoneWithCountryCode);
      if (response.success) {
        setResendCooldown(60);
        setError('');
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Debug: Log when modal should be open
  console.log('OtpVerificationModal render - isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Phone className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Verify Phone Number</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Enter Verification Code
            </h3>
            <p className="text-gray-600 text-sm">
              We&apos;ve sent a 6-digit code to
            </p>
            <p className="text-gray-900 font-medium">
              {phoneNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input - 6 separate boxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    maxLength={1}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="text-gray-700 hover:text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 
                 resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                 'Resend Code'}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
