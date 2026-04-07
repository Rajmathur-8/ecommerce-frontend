'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  productName: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: any[];
  category: string;
  averageRating?: number;
  totalReviews?: number;
  isPreOrder?: boolean;
}

interface ThemedDealSectionProps {
  title: string;
  description?: string;
  products: Product[];
  categoryTags?: string[];
  onViewAll?: () => void;
  categoryId?: string;
  backgroundColor?: 'white' | 'light' | 'gradient';
  loading?: boolean;
}

const ThemedDealSection: React.FC<ThemedDealSectionProps> = ({
  title,
  description,
  products,
  categoryTags = [],
  onViewAll,
  categoryId,
  backgroundColor = 'white',
  loading = false
}) => {
  const bgClasses = {
    white: 'bg-white',
    light: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  };

  if (loading) {
    return (
      <section className={`py-6 ${bgClasses[backgroundColor]}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 ${bgClasses[backgroundColor]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
              {description && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {description}
                </p>
              )}
            </div>
            {(onViewAll || categoryId) && (
              <Link
                href={categoryId ? `/products?category=${categoryId}` : '#'}
                onClick={(e) => {
                  if (onViewAll && !categoryId) {
                    e.preventDefault();
                    onViewAll();
                  }
                }}
                className="inline-flex items-center px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 hover:!text-black transition-colors whitespace-nowrap"
              >
                View All
              </Link>
            )}
          </div>

          {/* Category Tags */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              productName={product.productName}
              price={product.price}
              discountPrice={product.discountPrice}
              stock={product.stock}
              images={product.images}
              category={product.category}
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
              isPreOrder={product.isPreOrder}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mt-6 pt-6 border-t border-gray-200" />
      </div>
    </section>
  );
};

export default ThemedDealSection;


