'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { 
  ReviewHeaderSkeleton, 
  ReviewSummarySkeleton, 
  ReviewListSkeleton 
} from './Skeleton';

interface OrderReviewDisplayProps {
  productId: string;
}

interface OrderReview {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  ratings: {
    overall: number;
    valueForMoney?: number;
    quality?: number;
    delivery?: number;
    packaging?: number;
    customerService?: number;
  };
  title?: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  createdAt: string;
}

interface ProductStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export default function OrderReviewDisplay({ productId }: OrderReviewDisplayProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order reviews for this product with pagination
      const response = await apiService.rating.getProductOrderReviews(productId, page, 10);
      
      if (response.success && response.data) {
        // Map ProductReview to OrderReview format
        const mappedReviews: OrderReview[] = response.data.reviews.map((review: any) => ({
          _id: review._id,
          user: {
            _id: review.userId || review.user?._id || '',
            name: review.userName || review.user?.name || '',
            email: review.user?.email || ''
          },
          ratings: {
            overall: review.rating || review.ratings?.overall || 0,
            valueForMoney: review.ratings?.valueForMoney,
            quality: review.ratings?.quality,
            delivery: review.ratings?.delivery,
            packaging: review.ratings?.packaging,
            customerService: review.ratings?.customerService
          },
          title: review.title || review.review?.split('.')[0],
          comment: review.review || review.comment || '',
          images: review.images || [],
          helpfulCount: review.helpfulCount || 0,
          createdAt: review.createdAt
        }));
        
        setReviews(mappedReviews);
        setProductStats(response.data.productStats);
        
        // Map pagination if it exists
        if (response.data.pagination) {
          const paginationData = response.data.pagination;
          const total = paginationData.total || 0;
          const limit = paginationData.limit || 10;
          const totalPages = (paginationData as any).pages || paginationData.totalPages || (total > 0 ? Math.ceil(total / limit) : 0);
          
          setPagination({
            page: paginationData.page || parseInt(page.toString()),
            limit: limit,
            total: total,
            pages: totalPages
          });
        } else {
          setPagination(null);
        }
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      setReviews([]);
      setProductStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [productId]);

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
    const safeCount = count || 0; // Handle undefined/null values
    const percentage = Math.round((safeCount / productStats.totalReviews) * 100);
    console.log(`🔍 getRatingPercentage: count=${count}, safeCount=${safeCount}, totalReviews=${productStats.totalReviews}, percentage=${percentage}%`);
    return percentage;
  };

  const getProgressBarColor = (rating: number, count: number) => {
    // If no one gave this rating, show gray
    if (count === 0) {
      return 'bg-gray-300';
    }
    
    // Color based on rating value
    switch (rating) {
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-red-500';
      case 3:
      case 4:
      case 5:
        return 'bg-green-700';
      default:
        return 'bg-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewAllReviews = () => {
    router.push(`/product/${productId}/reviews`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <ReviewHeaderSkeleton />
        <ReviewSummarySkeleton />
        <ReviewListSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Failed to load reviews</p>
          <button 
            onClick={(e) => {
              e.preventDefault();
              fetchReviews(1);
            }}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Don't show anything if no reviews exist
  if (!loading && (!productStats || !productStats.totalReviews || productStats.totalReviews === 0) && reviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
            {productStats && productStats.totalReviews > 0 && (
              <span className="text-sm text-gray-500">
                ({productStats.totalReviews} reviews)
              </span>
            )}
          </div>
          
          {/* View All Reviews Button - Show when more than 3 reviews */}
          {reviews.length > 0 && (
            <button 
              onClick={handleViewAllReviews}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm cursor-pointer"
            >
              View All Reviews
            </button>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      {productStats && productStats.totalReviews > 0 && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                // Map rating numbers to correct keys
                const ratingKeyMap = {
                  5: 'fiveStar',
                  4: 'fourStar', 
                  3: 'threeStar',
                  2: 'twoStar',
                  1: 'oneStar'
                } as const;
                const ratingKey = ratingKeyMap[rating as keyof typeof ratingKeyMap];
                  const count = productStats.ratingDistribution[ratingKey] || 0;
                const percentage = getRatingPercentage(count);
                console.log(`🔍 Rating ${rating}: key=${ratingKey}, count=${count}, totalReviews=${productStats.totalReviews}, percentage=${percentage}% (${count}/${productStats.totalReviews})`);
                console.log(`🔍 Full ratingDistribution:`, productStats.ratingDistribution);
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getProgressBarColor(rating, count)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    {count > 0 ? (
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">This product hasn&apos;t received any reviews yet. Be the first to share your experience!</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">Be the First to Review</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {reviews.slice(0, 3).map((review) => (
            <div key={review._id} className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {(review.user.name || review.user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.user.name || review.user.email || 'Anonymous User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.ratings.overall)}
                </div>
              </div>

              {/* Review Title */}
              {review.title && (
                <h3 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h3>
              )}

              {/* Review Comment */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Review Footer */}
            </div>
            ))}
            
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  fetchReviews(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={(e) => {
                    e.preventDefault();
                    fetchReviews(page);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  fetchReviews(currentPage + 1);
                }}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
} 