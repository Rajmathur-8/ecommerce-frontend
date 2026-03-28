import { useState, useEffect } from 'react';
import { apiService, PaymentMethod } from '@/lib/api';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.payment.getPaymentMethods();
      
      if (response.success && response.data?.paymentMethods) {
        // Sort by order and filter active methods
        const sortedMethods = response.data.paymentMethods
          .filter((method: PaymentMethod) => method.isActive)
          .sort((a: PaymentMethod, b: PaymentMethod) => a.order - b.order);
        
        setPaymentMethods(sortedMethods);
      } else {
        setError(response.message || 'Failed to fetch payment methods');
      }
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const getPaymentMethodById = (id: string) => {
    return paymentMethods.find(method => method._id === id);
  };

  const getPopularPaymentMethods = () => {
    return paymentMethods.filter(method => method.isPopular);
  };

  const getPaymentMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return '💳';
      case 'shield':
        return '🛡️';
      case 'wallet':
        return '👛';
      case 'qr-code':
        return '📱';
      default:
        return '💳';
    }
  };

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    getPaymentMethodById,
    getPopularPaymentMethods,
    getPaymentMethodIcon,
  };
}; 