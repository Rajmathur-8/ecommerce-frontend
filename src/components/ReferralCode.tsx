'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Share2, X } from 'lucide-react';
import { apiService } from '@/lib/api';

interface ReferralCodeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralCode({ isOpen, onClose }: ReferralCodeProps) {
  const [referralCode, setReferralCode] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferred: 0,
    activeReferrals: 0,
    potentialEarnings: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchReferralData();
    }
  }, [isOpen]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      console.log('Fetching referral data...');
      const [codeResponse, statsResponse] = await Promise.all([
        apiService.referral.getUserReferralCode(),
        apiService.referral.getReferralStats()
      ]);

      console.log('Code response:', codeResponse);
      console.log('Stats response:', statsResponse);

      if (codeResponse.success && codeResponse.data) {
        console.log('Setting referral code:', codeResponse.data.referralCode);
        setReferralCode(codeResponse.data.referralCode);
        setUserName(codeResponse.data.userName);
      } else {
      }

      if (statsResponse.success && statsResponse.data) {
        setReferralStats(statsResponse.data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
    }
  };

  const shareReferralCode = async () => {
    const shareText = `Hey! Use my referral code ${referralCode} on Gupta Distributors and get 200 reward points on your first order! ??`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Referral Code',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
      }
    } else {
      // Fallback to copying
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Refer a Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              {/* Referral Code Skeleton */}
              <div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works Skeleton */}
              <div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="animate-pulse flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="animate-pulse flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="animate-pulse flex-1">
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Skeleton */}
              <div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Button Skeleton */}
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Referral Code Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Your Referral Code
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    {referralCode ? (
                      <>
                        <span className="text-2xl font-bold text-black tracking-wider">
                          {referralCode}
                        </span>
                                            <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                      </>
                    ) : (
                      <div className="flex-1 text-center">
                        <p className="text-gray-500">No referral code found</p>
                        <p className="text-sm text-gray-400">Please contact support</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  How it works
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <p className="text-gray-600">
                      Share your referral code with friends
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <p className="text-gray-600">
                      They sign up using your code
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <p className="text-gray-600">
                      They get 200 reward points on their first order
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Your Referrals
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {referralStats.totalReferred}
                    </div>
                    <div className="text-sm text-gray-600">Total Referred</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {referralStats.activeReferrals}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {referralStats.potentialEarnings}
                    </div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={shareReferralCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Share2 size={20} />
                Share Referral Code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


