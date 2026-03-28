'use client';

import { useState, useEffect } from 'react';
import { Star, Filter, MessageSquare, Plus } from 'lucide-react';
import { useReviews, useMyReview, useReviewActions } from '@/hooks/useReviews';
import { useAppContext } from '@/contexts/AppContext';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import { useRouter } from 'next/navigation';
interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { auth } = useAppContext();
  const router=useRouter()
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rating: undefined as number | undefined,
    sort: 'newest' as const
  });

  const { reviews, productStats, loading, error, pagination, refetch } = useReviews(productId, filters);
  const { myReview, loading: myReviewLoading } = useMyReview(productId);
  const { addReview, updateReview, deleteReview, markHelpful, loading: actionLoading } = useReviewActions(productId);

  // Reset form states when user changes
  useEffect(() => {
    setShowReviewForm(false);
    setEditingReview(false);
  }, [auth.user?.id]);

  const handleAddReview = async (formData: FormData) => {
    try {
      await addReview(formData);
      setShowReviewForm(false);
      refetch();
    } catch (error) {
      (window as { showToast?: (message: string, type: string) => void }).showToast?.('Failed to add review. Please try again.', 'error');
    }
  };

  const handleUpdateReview = async (formData: FormData) => {
    if (!myReview) return;
    
    try {
      await updateReview(myReview._id, formData);
      setEditingReview(false);
      refetch();
    } catch (error) {
      (window as { showToast?: (message: string, type: string) => void }).showToast?.('Failed to update review. Please try again.', 'error');
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await deleteReview(myReview._id);
      refetch();
    } catch (error) {
      (window as { showToast?: (message: string, type: string) => void }).showToast?.('Failed to delete review. Please try again.', 'error');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful(reviewId);
      refetch();
    } catch (error) {
    }
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const getRatingPercentage = (count: number) => {
    if (!productStats || productStats.totalReviews === 0) return 0;
    return Math.round((count / productStats.totalReviews) * 100);
  };

  if (loading && !productStats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          onSubmit={handleAddReview}
          onCancel={() => setShowReviewForm(false)}
          loading={actionLoading}
        />
      )}

      {editingReview && myReview && (
        <ReviewForm
          existingReview={myReview}
          onSubmit={handleUpdateReview}
          onCancel={() => setEditingReview(false)}
          loading={actionLoading}
        />
      )}

              {/* Review Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
            </div>
            
            {auth.isAuthenticated ? (
              !myReview && !showReviewForm && !myReviewLoading && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              )
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Login to Write a Review</span>
              </button>
            )}
          </div>

          {/* Always show a prominent review button */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Share Your Experience</h4>
              <p className="text-blue-700 mb-4">Help other customers by writing a review</p>
              {auth.isAuthenticated ? (
                !myReview && !showReviewForm && !myReviewLoading ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Write a Review
                  </button>
                ) : myReview ? (
                  <div className="text-green-600 font-medium">✓ You&apos;ve already reviewed this product</div>
                ) : myReviewLoading ? (
                  <div className="text-gray-600 font-medium">Checking your review...</div>
                ) : (
                  <div className="text-blue-600 font-medium">Review form is open</div>
                )
              ) : (
                <button
                    onClick={() => router.push('/auth/login')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Login to Write a Review
                </button>
              )}
              

            </div>
          </div>

        {/* Review Stats */}
        {productStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(productStats.averageRating)}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {productStats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                Based on {productStats.totalReviews} review{productStats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = productStats.ratingDistribution[`${rating}Star` as keyof typeof productStats.ratingDistribution];
                const percentage = getRatingPercentage(count);
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {pagination && (
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
            <p className="text-gray-600 mb-4">Be the first to review this product!</p>
            {auth.isAuthenticated ? (
              !myReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write the First Review
                </button>
              )
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Write the First Review
              </button>
            )}
          </div>
        )}

        {reviews.map(review => (
          <ReviewCard
            key={review._id}
            review={review}
                         onEdit={review.user._id === auth.user?.id ? () => setEditingReview(true) : undefined}
             onDelete={review.user._id === auth.user?.id ? handleDeleteReview : undefined}
             onMarkHelpful={() => handleMarkHelpful(review._id)}
             isOwnReview={review.user._id === auth.user?.id}
          />
        ))}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 