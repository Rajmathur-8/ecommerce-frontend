'use client';

import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { apiService } from '@/lib/api';

interface ReferralCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean, referrerName?: string) => void;
  disabled?: boolean;
}

export default function ReferralCodeInput({ 
  value, 
  onChange, 
  onValidation, 
  disabled = false 
}: ReferralCodeInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [error, setError] = useState('');

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setIsValid(false);
      setReferrerName('');
      setError('');
      onValidation(false);
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await apiService.referral.validateReferralCode({ referralCode: code });
      
      if (response.success) {
        setIsValid(true);
        setReferrerName(response.data.referrerName);
        setError('');
        onValidation(true, response.data.referrerName);
      } else {
        setIsValid(false);
        setReferrerName('');
        setError('Invalid referral code');
        onValidation(false);
      }
    } catch (error) {
      setIsValid(false);
      setReferrerName('');
      setError('Invalid referral code');
      onValidation(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
    
    // Clear validation state when user starts typing
    if (newValue !== value) {
      setIsValid(false);
      setReferrerName('');
      setError('');
      onValidation(false);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      validateReferralCode(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Referral Code (Optional)
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="Enter referral code"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
            isValid 
              ? 'border-green-300 bg-green-50' 
              : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          maxLength={8}
        />
        
        {/* Validation Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          {!isValidating && isValid && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          {!isValidating && error && (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      </div>

      {/* Success Message */}
      {isValid && referrerName && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <Check className="h-4 w-4" />
          <span>Valid code! Referred by {referrerName}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Message */}
      {!value && !error && (
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Get 200 reward points on your first order when you use a valid referral code!
          </span>
        </div>
      )}
    </div>
  );
}



