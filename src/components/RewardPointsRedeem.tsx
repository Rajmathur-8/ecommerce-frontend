'use client';

import { useState, useEffect } from 'react';
import { Star, Gift, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '@/lib/api';

interface RewardPointsRedeemProps {
  onRedeem: (discountAmount: number) => void;
  onCancel: () => void;
  isRedeemed: boolean;
  redeemedAmount: number;
}

interface RewardPointsData {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  expiryDate: string;
  isActive: boolean;
}

export default function RewardPointsRedeem({ 
  onRedeem, 
  onCancel, 
  isRedeemed, 
  redeemedAmount 
}: RewardPointsRedeemProps) {
  const [rewardPoints, setRewardPoints] = useState<RewardPointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewardPoints();
  }, []);

  const fetchRewardPoints = async () => {
    try {
      setLoading(true);
      const response = await apiService.rewardPoints.getUserRewardPoints();
      
      if (response.success && response.data) {
        setRewardPoints(response.data);
      }
    } catch (error) {
      setError('Failed to load reward points');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!rewardPoints || pointsToRedeem <= 0 || pointsToRedeem > rewardPoints.points) {
      return;
    }

    try {
      setRedeeming(true);
      const response = await apiService.rewardPoints.redeemRewardPoints({
        pointsToRedeem: pointsToRedeem
      });

      if (response.success && response.data) {
        onRedeem(response.data.discountAmount);
        setRewardPoints(prev => prev ? {
          ...prev,
          points: response.data.remainingPoints,
          totalRedeemed: prev.totalRedeemed + response.data.pointsRedeemed
        } : null);
        setPointsToRedeem(0);
      } else {
        setError(response.message || 'Failed to redeem points');
      }
    } catch (error) {
      setError('Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Error</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={fetchRewardPoints}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!rewardPoints || rewardPoints.points === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">Reward Points</span>
        </div>
        <p className="text-gray-600 text-sm">No reward points available</p>
        <p className="text-gray-500 text-xs mt-1">
          Earn 1% reward points on every delivered order
        </p>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(rewardPoints.expiryDate);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-900">Reward Points</span>
        </div>
        <div className="text-sm text-gray-600">
          {rewardPoints.points} points
        </div>
      </div>

      {isRedeemed ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-green-700 text-sm font-medium">
              Points Redeemed
            </span>
            <span className="text-green-700 text-sm">
              -₹{redeemedAmount}
            </span>
          </div>
          <button 
            onClick={onCancel}
            className="text-green-600 hover:text-green-700 text-xs underline mt-1"
          >
            Cancel redemption
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            <span>Expires in {daysUntilExpiry} days</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={rewardPoints.points}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
              placeholder="Enter points to redeem"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || pointsToRedeem <= 0 || pointsToRedeem > rewardPoints.points}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {redeeming ? 'Redeeming...' : 'Redeem'}
            </button>
          </div>

          {pointsToRedeem > 0 && (
            <div className="text-sm text-gray-600">
              You&apos;ll get ₹{pointsToRedeem} discount
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Earned: {rewardPoints.totalEarned}</span>
          <span>Total Redeemed: {rewardPoints.totalRedeemed}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Earn 1% reward points on every delivered order
        </p>
      </div>
    </div>
  );
}
