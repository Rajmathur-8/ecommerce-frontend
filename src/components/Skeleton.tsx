import React from 'react';

// Shimmer effect CSS
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(to right, #f0f0f0 8%, #f5f5f5 18%, #f0f0f0 33%);
    background-size: 900px 100%;
  }
`;

// Banner Skeleton
export const BannerSkeleton = () => (
  <div 
    className="relative w-full bg-gray-200 animate-pulse"
    style={{
      aspectRatio: '1920 / 600',
      maxHeight: '600px'
    }}
  >
    <style>{shimmerStyle}</style>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
  </div>
);

// Category Button Skeleton
export const CategoryButtonSkeleton = () => (
  <div className="flex space-x-1 sm:space-x-2 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="flex-shrink-0 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shimmer"
        style={{ minWidth: '60px', maxWidth: '120px' }}
      >
        <div className="w-12 h-4 bg-gray-300 rounded"></div>
      </div>
    ))}
  </div>
);

// Product Card Skeleton - IMPROVED
export const ProductCardSkeleton = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <style>{shimmerStyle}</style>
      <div className="w-full h-48 shimmer bg-gray-200"></div>
      <div className="p-5 space-y-3">
        {/* Category tag skeleton */}
        <div className="w-16 h-6 shimmer bg-gray-200 rounded-full"></div>
        
        {/* Product name skeleton */}
        <div className="space-y-2">
          <div className="h-4 shimmer bg-gray-200 rounded"></div>
          <div className="h-4 shimmer bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-4 h-4 shimmer bg-gray-200 rounded-sm"></div>
          ))}
          <div className="h-4 shimmer bg-gray-200 rounded w-12 ml-2"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 shimmer bg-gray-200 rounded w-20"></div>
          <div className="h-6 shimmer bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// Special Offer Card Skeleton
export const SpecialOfferSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
    {[...Array(count)].map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Category Section Skeleton
export const CategorySectionSkeleton = () => (
  <div className="mb-12 sm:mb-16">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    <ProductGridSkeleton count={4} />
  </div>
);

// Loading Spinner
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

// Text Skeleton
export const TextSkeleton = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => (
  <div className={className}>
    {[...Array(lines)].map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded mb-2 ${index === lines - 1 ? '' : 'mb-2'}`}
        style={{ width: `${Math.random() * 40 + 60}%` }}
      ></div>
    ))}
  </div>
);

// Review Card Skeleton
export const ReviewCardSkeleton = () => (
  <div className="p-6 border-b border-gray-200 animate-pulse">
    {/* Review Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="w-4 h-4 bg-gray-200 rounded-sm"></div>
        ))}
      </div>
    </div>
    
    {/* Review Title */}
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
    
    {/* Review Comment */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Review Summary Skeleton
export const ReviewSummarySkeleton = () => (
  <div className="p-6 border-b border-gray-200 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Rating */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-5 h-5 bg-gray-200 rounded-sm"></div>
          ))}
        </div>
        <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 w-16">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2"></div>
            <div className="w-8 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Review Header Skeleton
export const ReviewHeaderSkeleton = () => (
  <div className="p-6 border-b border-gray-200 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-40"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// Review List Skeleton
export const ReviewListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="divide-y divide-gray-200">
    {[...Array(count)].map((_, index) => (
      <ReviewCardSkeleton key={index} />
    ))}
  </div>
);

// Product Details Skeleton
export const ProductDetailsSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    {/* Breadcrumb Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Section Skeleton */}
          <div className="p-6 bg-gradient-to-br from-white/50 to-blue-50/50">
            <div className="space-y-4">
              {/* View Mode Toggle Skeleton */}
              <div className="flex justify-center">
                <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1">
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse ml-1"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse ml-1"></div>
                </div>
              </div>

              {/* Main Image Skeleton */}
              <div className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>

              {/* Thumbnail Images Skeleton */}
              <div className="flex space-x-2 overflow-x-auto">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info Section Skeleton */}
          <div className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Product Name Skeleton */}
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>

              {/* Rating Skeleton */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="w-4 h-4 bg-gray-200 rounded-sm animate-pulse"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>

              {/* Price Skeleton */}
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>

              {/* Variants Skeleton */}
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="grid grid-cols-1 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status Skeleton */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>

              {/* Quantity Skeleton */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-16 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex space-x-3">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Features Skeleton */}
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Payment Page Skeleton
export const PaymentPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header placeholder */}
    <div className="h-16 bg-white shadow-sm animate-pulse"></div>
    
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Payment Methods Section Skeleton */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Payment Header Skeleton */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Payment Method Cards Skeleton */}
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EMI Options Skeleton */}
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                              <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="h-5 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BNPL Options Skeleton */}
                <div className="mt-6 p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Form Skeleton */}
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-80 mb-4 animate-pulse"></div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-64 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {/* Summary Title Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              
              {/* Product Items Skeleton */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Fee Skeleton */}
              <div className="flex justify-between items-center py-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>

              {/* Promo Code Section Skeleton */}
              <div className="border-t pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="p-2 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-3 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount Skeleton */}
              <div className="border-t border-gray-300 pt-3 mb-4">
                <div className="flex justify-between mb-1">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              
              {/* Pay Button Skeleton */}
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// Address Page Skeleton
export const AddressPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header placeholder */}
    <div className="h-16 bg-white shadow-sm animate-pulse"></div>
    
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Addresses List Section Skeleton */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Address Header Skeleton */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Address Items Skeleton */}
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Name and Badges Skeleton */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>
                          
                          {/* Address Details Skeleton */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons Skeleton */}
                        <div className="flex items-center gap-2 ml-6">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Address Button Skeleton */}
                  <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {/* Summary Title Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              
              {/* Product Items Skeleton */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Total Amount Skeleton */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between mb-1">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 mt-6">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// Order Summary Skeleton
export const OrderSummarySkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Summary Title Skeleton */}
    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    
    {/* Savings Summary Skeleton */}
    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
    
    {/* Product Items Skeleton */}
    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
      <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Coupon Section Skeleton */}
    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
      <div className="flex space-x-2 mb-3">
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        {[...Array(2)].map((_, index) => (
          <div key={index} className="p-2 rounded-lg border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Total Amount Skeleton */}
    <div className="border-t border-gray-300 pt-3">
      <div className="flex justify-between mb-1">
        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    
    {/* Action Buttons Skeleton */}
    <div className="flex space-x-3 mt-6">
      <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

// Cart Page Skeleton
export const CartPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header placeholder */}
    <div className="h-16 bg-white shadow-sm animate-pulse"></div>
    
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Cart Header Skeleton */}
            <div className="p-6 border-b">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            
            {/* Cart Items Skeleton */}
            <div className="divide-y divide-gray-200">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-6 flex items-center space-x-6">
                  {/* Product Image Skeleton */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  
                  {/* Product Info Skeleton */}
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                    
                    {/* Price Skeleton */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                    
                    {/* Quantity Controls Skeleton */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Remove Button Skeleton */}
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Saved for Later Section Skeleton */}
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            {/* Summary Title Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            
            {/* Savings Summary Skeleton */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Coupon Section Skeleton */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="flex space-x-2 mb-3">
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Product Items Skeleton */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Total Amount Skeleton */}
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between mb-1">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            
            {/* Checkout Buttons Skeleton */}
            <div className="flex space-x-3 mt-6">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// Order Details Page Skeleton
export const OrderDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Skeleton */}
        <div className="md:col-span-8 space-y-6">
          {/* Product Details Card Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Address Card Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Payment Information Card Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="md:col-span-4 space-y-4">
          {/* Order Timeline Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="w-0.5 h-12 mt-2 bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Details Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Orders Page Skeleton
export const OrdersPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Orders List Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              {/* Order Header Skeleton */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>

              {/* Products Section Skeleton */}
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(2)].map((_, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);



