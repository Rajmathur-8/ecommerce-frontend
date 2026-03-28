import { useState, useEffect, useCallback } from 'react';
import { apiService, WishlistItem } from '@/lib/api';
import { useAuth } from './useAuth';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.wishlist.getWishlist();
      
      if (response.success && response.data) {
        setWishlist(response.data.wishlist);
      } else {
        setError(response.message || 'Failed to fetch wishlist');
      }
    } catch (err) {
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    console.log('=== ADD TO WISHLIST HOOK DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Is authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      setError('Please login to add items to wishlist');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Calling API service...');
      const response = await apiService.wishlist.addToWishlist(productId);
      console.log('API response:', response);
      
      if (response.success && response.data) {
        setWishlist(response.data.wishlist);
        return true;
      } else {
        setError(response.message || 'Failed to add to wishlist');
        return false;
      }
    } catch (err) {
      setError('Failed to add to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      setError('Please login to remove items from wishlist');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.wishlist.removeFromWishlist(productId);
      
      if (response.success && response.data) {
        setWishlist(response.data.wishlist);
        return true;
      } else {
        setError(response.message || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err) {
      setError('Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product && item.product._id === productId);
  }, [wishlist]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Get wishlist count (only count items with valid products)
  const wishlistCount = wishlist.filter(item => item.product && item.product._id).length;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize wishlist when authentication changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    error,
    wishlistCount,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    fetchWishlist,
    clearError
  };
};
