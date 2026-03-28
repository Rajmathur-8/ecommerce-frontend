'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { DeliveryAvailabilityData } from '@/hooks/useDeliveryAvailability';

interface DeliveryAvailabilityIndicatorProps {
  deliveryData: DeliveryAvailabilityData | null;
  isLoading: boolean;
  error: string | null;
  pincode: string;
}

const DeliveryAvailabilityIndicator: React.FC<DeliveryAvailabilityIndicatorProps> = ({
  deliveryData,
  isLoading,
  error,
  pincode,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-600">Checking delivery for {pincode}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  if (!deliveryData || !deliveryData.isAvailable) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-600" />
          <div>
            <span className="text-sm font-medium text-red-900">Delivery Not Available</span>
            <p className="text-xs text-red-600 mt-1">
              Sorry, we don&apos;t deliver to pincode {pincode} at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Delivery Available</span>
            <span className="text-xs text-gray-500">to {pincode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAvailabilityIndicator;
