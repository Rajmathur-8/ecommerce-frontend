'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Package, X, Upload, DollarSign, Award, Truck, Box, Headphones } from 'lucide-react';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/api';
// import Header from '@/components/Header';
import { TextSkeleton } from '@/components/Skeleton';
import { formatCurrency } from '@/lib/config';

// Extend Window interface to include showToast
declare global {
  interface Window {
    showToast?: (message: string, type: string, duration?: number) => void;
  }
}

export default function OrderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const _searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<{
    _id: string;
    ratings?: {
      overall: number;
      valueForMoney: number;
      quality: number;
      delivery: number;
      packaging: number;
      customerService: number;
    };
    comment?: string;
    images?: string[];
  } | null>(null);
  const [hasRated, setHasRated] = useState(false);
  
  // Flipkart-style rating categories with 3 new ones
  const [ratings, setRatings] = useState({
    overall: 0,
    valueForMoney: 0,
    quality: 0,
    delivery: 0,
    packaging: 0,
    customerService: 0
  });
  
  const [comment, setComment] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!apiService.hasToken()) {
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Please login to write a review', 'error');
          } else {
            alert('Please login to write a review');
          }
          router.push('/auth/login');
          return;
        }
        
        // Fetch order details
        console.log('🔍 Review page - Fetching order:', orderId);
        console.log('🔍 Review page - User authenticated:', apiService.hasToken());
        const orderResponse = await apiService.payment.getOrder(orderId);
        console.log('🔍 Review page - Order response:', orderResponse);
        
        if (orderResponse.success && orderResponse.data?.order) {
          const orderData = orderResponse.data.order;
          
          // Check if order is delivered (only delivered orders can be reviewed)
          console.log('🔍 Review page - Order status:', orderData.orderStatus);
          if (orderData.orderStatus !== 'delivered') {
            console.log('🔍 Review page - Order not delivered, redirecting');
            if (typeof window !== 'undefined' && window.showToast) {
              window.showToast('You can only review delivered orders', 'error');
            } else {
              alert('You can only review delivered orders');
            }
            router.push(`/orders/${orderId}`);
            return;
          }
          
          setOrder(orderData);
          
          // Check if user has already rated this order
          console.log('🔍 Review page - Checking existing rating for order:', orderId);
          const ratingResponse = await apiService.rating.getOrderRating(orderId);
          console.log('🔍 Review page - Rating response:', ratingResponse);
          
          if (ratingResponse.success && ratingResponse.data) {
            setHasRated(ratingResponse.data.hasRated);
            if (ratingResponse.data.rating) {
              setExistingRating(ratingResponse.data.rating);
              setRatings(ratingResponse.data.rating?.ratings || { 
                overall: 0, 
                valueForMoney: 0, 
                quality: 0, 
                delivery: 0, 
                packaging: 0, 
                customerService: 0 
              });
              setComment(ratingResponse.data.rating.comment);
            }
          }
          
          // If user has already reviewed, redirect to order details
          if (ratingResponse.success && ratingResponse.data?.hasRated) {
            if (typeof window !== 'undefined' && window.showToast) {
              window.showToast('You have already reviewed this order', 'info');
            }
            router.push(`/orders/${orderId}`);
            return;
          }
        } else {
          console.log('🔍 Review page - Order not found:', {
            success: orderResponse.success,
            message: orderResponse.message,
            data: orderResponse.data
          });
          alert(`Order not found: ${orderResponse.message || 'Unknown error'}`);
          router.push('/orders');
        }
      } catch (error) {
        alert('Failed to load order details');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, router]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order || !comment.trim()) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Please add a review comment', 'warning');
      } else {
        alert('Please add a review comment');
      }
      return;
    }

    // Debug: Log current ratings
    console.log('🔍 Current ratings before submission:', ratings);
    
    if (ratings.overall === 0) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Please provide an overall rating by clicking on the stars in the "Overall Rating" section', 'warning');
      } else {
        alert('Please provide an overall rating by clicking on the stars in the "Overall Rating" section');
      }
      return;
    }

    try {
      setSubmitting(true);
      
      // Debug: Check token before submission
      console.log('🔍 Review submission - Token check:', apiService.hasToken());
      console.log('🔍 Review submission - Uploaded files:', uploadedFiles.length);
      
      let response;
      
      if (hasRated && existingRating) {
        // Update existing rating
        response = await apiService.rating.updateRating(existingRating?._id, {
          ratings,
          comment: comment.trim(),
          images: [], // For now, we'll implement file upload later
          videos: []
        });
      } else {
        // Create new rating
        if (uploadedFiles.length > 0) {
          // Use FormData for file upload
          const formData = new FormData();
          formData.append('ratings', JSON.stringify(ratings));
          formData.append('comment', comment.trim());
          
          // Debug: Log FormData contents
          console.log('🔍 FormData contents:');
          console.log('- ratings:', JSON.stringify(ratings));
          console.log('- comment:', comment.trim());
          console.log('- uploadedFiles count:', uploadedFiles.length);
          
          // Add uploaded images
          uploadedFiles.forEach((file, index) => {
            formData.append('images', file);
            console.log(`- image ${index + 1}:`, file.name, file.size, 'bytes');
          });
          
          response = await apiService.rating.createRatingWithFiles(orderId, formData);
        } else {
          // Use regular JSON request if no files
          const ratingData = {
            ratings,
            comment: comment.trim(),
            images: [],
            videos: []
          };
          
          // Debug: Log JSON request data
          console.log('🔍 JSON request data:', ratingData);
          
          response = await apiService.rating.createRating(orderId, ratingData);
        }
      }

      if (response.success) {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast(
            hasRated ? 'Review updated successfully!' : 'Thank you for your review! Your feedback helps other customers.',
            'success'
          );
        } else {
          alert(hasRated ? 'Review updated successfully!' : 'Thank you for your review! Your feedback helps other customers.');
        }
        router.push(`/orders/${orderId}`);
      } else {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast(response.message || 'Failed to submit review', 'error');
        } else {
          alert(response.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to submit review. Please try again.', 'error');
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: prev[category] === value ? 0 : value // Toggle: if same value, set to 0, otherwise set to new value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 3) {
      alert('You can upload maximum 3 files');
      return;
    }

    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };


  const renderStars = (rating: number, category: keyof typeof ratings) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => updateRating(category, star)}
        className={`p-1 rounded transition-colors ${
          star <= rating ? 'text-yellow-500' : 'text-gray-300'
        } hover:text-yellow-400`}
      >
        <Star className="w-6 h-6 fill-current" />
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <TextSkeleton lines={1} className="w-48 h-8 mb-2" />
                <TextSkeleton lines={1} className="w-32 h-4" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <TextSkeleton lines={1} className="w-40 h-6" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <TextSkeleton lines={1} className="w-48 h-4 mb-2" />
                  <TextSkeleton lines={1} className="w-32 h-3" />
                </div>
                <TextSkeleton lines={1} className="w-20 h-4" />
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <TextSkeleton lines={1} className="w-12 h-4" />
                  <TextSkeleton lines={1} className="w-20 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Review Form Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <TextSkeleton lines={1} className="w-32 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div key={starIndex} className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <TextSkeleton lines={1} className="w-full h-3" />
                </div>
              ))}
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <TextSkeleton lines={1} className="w-32 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div key={starIndex} className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <TextSkeleton lines={1} className="w-full h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {hasRated ? 'Edit Review' : 'Write a Review'}
              </h1>
              <p className="text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products in this Order
          </h2>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {typeof item.product === 'object' && item.product && 'productName' in item.product
                      ? (item.product as { productName: string }).productName 
                      : `Product ID: ${typeof item.product === 'object' && item.product && '_id' in item.product ? (item.product as { _id: string })._id || 'Unknown' : item.product}`}
                  </p>
                  <p className="text-sm text-gray-700">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - First 3 Ratings + Write Review */}
          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Overall Rating
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.overall, 'overall')}
              </div>
              <p className="text-sm text-gray-700 mt-2">Rate your overall experience with this product</p>
            </div>

            {/* Value for Money Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Value for Money
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.valueForMoney, 'valueForMoney')}
              </div>
              <p className="text-sm text-gray-700 mt-2">How satisfied are you with the price-quality ratio?</p>
            </div>

            {/* Quality Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Product Quality
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.quality, 'quality')}
              </div>
              <p className="text-sm text-gray-700 mt-2">How would you rate the quality of this product?</p>
            </div>

            {/* Written Review */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Write Your Review</h3>
              <p className="text-sm text-gray-700 mb-4">Share your experience with other customers</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience with this product. What did you like? What could be better?"
                rows={6}
                className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-800 mt-1">{comment.length}/1000 characters</p>
            </div>
          </div>

          {/* Right Column - Last 3 Ratings + Photos + Submit Button */}
          <div className="space-y-6">
            {/* Delivery Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-500" />
                Delivery Experience
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.delivery, 'delivery')}
              </div>
              <p className="text-sm text-gray-700 mt-2">How was your delivery experience?</p>
            </div>

            {/* Packaging Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-orange-500" />
                Packaging Quality
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.packaging, 'packaging')}
              </div>
              <p className="text-sm text-gray-700 mt-2">How well was the product packaged?</p>
            </div>

            {/* Customer Service Rating */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-teal-500" />
                Customer Service
              </h3>
              <div className="flex items-center gap-2">
                {renderStars(ratings.customerService, 'customerService')}
              </div>
              <p className="text-sm text-gray-700 mt-2">How satisfied are you with customer service?</p>
            </div>

            {/* Photo/Video Upload */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Photos/Videos</h3>
              <p className="text-sm text-gray-700 mb-4">Show others what you received</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {previewUrls.length < 3 && (
                    <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Upload</p>
                      </div>
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Upload up to 3 photos or videos</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Submitting...' : (hasRated ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 