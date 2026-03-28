'use client';

import { useAppContext } from '@/contexts/AppContext';

import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ProductCardSkeleton } from '@/components/Skeleton';

export default function WishlistPage() {
  const { wishlist, auth } = useAppContext();
  
  // Filter out deleted products from wishlist
  const validWishlistItems = wishlist.wishlist.filter((item) => item.product && item.product._id);
  const validWishlistCount = validWishlistItems.length;

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-red-500" />
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">Please login to view your wishlist.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/"
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600">
                  {validWishlistCount} {validWishlistCount === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            
            {validWishlistCount > 0 && (
              <Link
                href="/products"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Continue Shopping
              </Link>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : wishlist.error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Wishlist</h3>
              <p className="text-gray-600 mb-4">{wishlist.error}</p>
              <button
                onClick={wishlist.fetchWishlist}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : validWishlistCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
              <p className="text-gray-600 mb-6">Start adding products to your wishlist to save them for later!</p>
              <Link
                href="/products"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {validWishlistItems.map((item) => (
                <ProductCard
                  key={item._id}
                  id={item.product._id}
                  productName={item.product.productName}
                  price={item.product.price}
                  discountPrice={item.product.discountPrice}
                  images={item.product.images}
                  stock={item.product.stock}
                  category={item.product.category}
                  averageRating={item.product.averageRating}
                  totalReviews={item.product.totalReviews}
                  isPreOrder={item.product.isPreOrder}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
