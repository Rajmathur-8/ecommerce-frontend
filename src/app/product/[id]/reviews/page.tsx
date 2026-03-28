'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageSquare, ChevronRight, Home } from 'lucide-react';
import { apiService } from '@/lib/api';
import { 
  ReviewHeaderSkeleton, 
  ReviewSummarySkeleton, 
  ReviewListSkeleton 
} from '@/components/Skeleton';

interface OrderReview {
  _id: string;
  user: {
    _id: string;
    displayName?: string;
    name?: string;
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
  images?: string[];
  videos?: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
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

export default function AllReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order reviews for this product
      const response = await apiService.rating.getProductOrderReviews(productId);
      
      if (response.success && response.data) {
        console.log('🔍 Reviews API Response:', response.data);
        console.log('🔍 Reviews count:', response.data.reviews?.length);
        console.log('🔍 ProductStats totalReviews:', response.data.productStats?.totalReviews);
        // Ensure the API data is shaped like OrderReview[]
        const reviewsData: OrderReview[] = (response.data.reviews ?? []).map((review: any) => {
          return {
            _id: review._id || '',
            user: {
              _id: review.userId || review.user?._id || '',
              displayName: review.userName || review.user?.name || review.user?.displayName || '',
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
            title: review.title,
            comment: review.review || review.comment || '',
            images: review.images || [],
            videos: review.videos || [],
            helpfulCount: review.helpfulCount || 0,
            createdAt: review.createdAt || new Date().toISOString(),
            updatedAt: review.updatedAt || review.createdAt || new Date().toISOString()
          } as OrderReview;
        });
        console.log('✅ Mapped reviews:', reviewsData);
        setReviews(reviewsData);
        setProductStats(response.data.productStats);
      } else {
        console.log('⚠️ No reviews data in response');
        setReviews([]);
        setProductStats(null);
      }
     } catch (err: unknown) {
        console.error('❌ Error fetching reviews:', err);
        setError((err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') ? err.message : "Failed to fetch reviews.");
        setReviews([]);
        setProductStats(null);
      } finally {
        setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const getRatingPercentage = (count: number) => {
    if (!productStats || productStats.totalReviews === 0) return 0;
    const safeCount = count || 0;
    return Math.round((safeCount / productStats.totalReviews) * 100);
  };

  const getProgressBarColor = (rating: number, count: number) => {
    if (count === 0) {
      return 'bg-gray-300';
    }
    
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

  // Fetch reviews when component mounts
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <ReviewHeaderSkeleton />
            <ReviewSummarySkeleton />
            <ReviewListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchReviews}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href="/" 
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              href="/products" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              href={`/product/${productId}`} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Product Details
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Reviews</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-gray-900">All Customer Reviews</h1>
              {productStats && productStats.totalReviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({productStats.totalReviews} reviews)
                </span>
              )}
            </div>
          </div>

          {/* Rating Summary */}
          {productStats && productStats.totalReviews > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {productStats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {renderStars(Math.round(productStats.averageRating))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {productStats.totalReviews} review{productStats.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
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
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {reviews.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">No Reviews Yet</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {(review.user.displayName || review.user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.user.displayName || review.user.email || 'Anonymous User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.ratings.overall)}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">{review.comment}</p>
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          {review.images.slice(0, 2).map((imageUrl: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Review photo ${index + 1}`}
                                className="w-full h-16 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                        {review.images.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{review.images.length - 2} more images
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
