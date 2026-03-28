import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';

export interface DeliveryAvailabilityData {
  isAvailable: boolean;
  message?: string;
  estimatedDelivery?: string;
  shippingRate?: number;
}

export interface UseDeliveryAvailabilityReturn {
  deliveryData: DeliveryAvailabilityData | null;
  isLoading: boolean;
  error: string | null;
  checkDeliveryAvailability: (pincode: string) => Promise<void>;
  clearDeliveryData: () => void;
}

export const useDeliveryAvailability = (): UseDeliveryAvailabilityReturn => {
  const [deliveryData, setDeliveryData] = useState<DeliveryAvailabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDeliveryAvailability = useCallback(async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.logistics.checkDeliveryAvailability(pincode);
      
      if (response.success && response.data) {
        setDeliveryData(response.data);
      } else {
        setError(response.message || 'Failed to check delivery availability');
        setDeliveryData(null);
      }
    } catch (err) {
      setError('Failed to check delivery availability. Please try again.');
      setDeliveryData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDeliveryData = useCallback(() => {
    setDeliveryData(null);
    setError(null);
  }, []);

  return {
    deliveryData,
    isLoading,
    error,
    checkDeliveryAvailability,
    clearDeliveryData,
  };
};
