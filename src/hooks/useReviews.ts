import { useState, useEffect, useCallback } from 'react';
import { apiService, Review, ReviewsResponse, ProductStats } from '../lib/api';
import { useAppContext } from '../contexts/AppContext';

export const useReviews = (productId: string, params?: {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ReviewsResponse['pagination'] | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.getReviews(productId, params);
      if (response.success && response.data) {
        setReviews(response.data.reviews);
        setProductStats(response.data.productStats);
        setPagination(response.data.pagination || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      // Set empty state if reviews endpoint doesn't exist
      setReviews([]);
      setProductStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [productId, JSON.stringify(params)]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    productStats,
    loading,
    error,
    pagination,
    refetch: fetchReviews
  };
};

export const useMyReview = (productId: string) => {
  const { auth } = useAppContext();
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReview = useCallback(async () => {
    if (!productId || !auth.user?.id) {
      // Reset myReview if no user is logged in
      setMyReview(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.getMyReview(productId);
      if (response.success && response.data) {
        // Verify that the review belongs to the current user
        const currentUserId = auth.user?.id;
        const reviewUserId = response.data.user._id;
        
        console.log('Review ownership check:', {
          currentUserId,
          reviewUserId,
          matches: currentUserId === reviewUserId,
          reviewUser: response.data.user
        });
        
        if (currentUserId && reviewUserId && reviewUserId === currentUserId) {
          setMyReview(response.data);
        } else if (auth.user?.email && response.data.user.email === auth.user.email) {
          // Fallback: check by email if ID comparison fails
          console.log('Using email fallback for review ownership');
          setMyReview(response.data);
        } else {
          // Review doesn't belong to current user
          setMyReview(null);
        }
      } else {
        setMyReview(null);
      }
    } catch (err) {
      // If the API endpoint doesn't exist or fails, set myReview to null
      // This allows users to write reviews even if the backend doesn't support my-review endpoint
      setError(null); // Don't show error for missing endpoint
      setMyReview(null);
    } finally {
      setLoading(false);
    }
  }, [productId, auth.user?.id, auth.user?.email, auth.isAuthenticated]);

  useEffect(() => {
    fetchMyReview();
  }, [fetchMyReview]);

  // Reset myReview when user changes
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      setMyReview(null);
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  return {
    myReview,
    loading,
    error,
    refetch: fetchMyReview
  };
};

export const useReviewActions = (productId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReview = useCallback(async (reviewData: FormData) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.addReview(productId, reviewData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const updateReview = useCallback(async (reviewId: string, reviewData: FormData) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.updateReview(productId, reviewId, reviewData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const deleteReview = useCallback(async (reviewId: string) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.deleteReview(productId, reviewId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const markHelpful = useCallback(async (reviewId: string) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.markReviewHelpful(productId, reviewId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark review as helpful');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    markHelpful
  };
}; 