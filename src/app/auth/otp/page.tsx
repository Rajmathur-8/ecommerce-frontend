'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function OTPPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || '';
  const isEmail = identifier.includes('@');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    

    // TODO: Add OTP verification logic here
    try {
      // Call verifyOtp API
      const result = await apiService.auth.verifyOtp(identifier, otpString);
      if (result && result.success) {
        window.location.href = `/auth/otp/set-password?identifier=${encodeURIComponent(identifier)}`;
      } else {
        alert(result.message || 'OTP verification failed');
      }
    } catch {
      alert('OTP verification failed');
    }
    setLoading(false);
  };

  const handleResendOTP = () => {
    setCanResend(false);
    setResendTimer(30); // 30 seconds cooldown
    
    // TODO: Add resend OTP logic here
    console.log('Resending OTP...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg px-8 py-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
            Verify your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isEmail
              ? `We've sent a 6-digit verification code to your email`
              : `We've sent a 6-digit verification code to your phone number`}
          </p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter the 6-digit code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?{' '}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Resend
                  </button>
                ) : (
                  <span className="text-gray-400">
                    Resend in {resendTimer}s
                  </span>
                )}
              </p>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
            <div className="text-center">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 