'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';

interface Category {
  _id: string;
  name: string;
  image?: string;
  categoryImage?: string;
  photo?: string;
}

// Default product images for categories
const CATEGORY_PRODUCT_IMAGES: Record<string, string> = {
  'TV': 'https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa3-4748-9a64-c764a2179d76/https___cdn.shopify.com_s_files_1_0604_5298_2732_products_SSA_IMG_HERO_55_CU7700_2_1500x1500_crop_center.progressive.jpg?width=1500&height=1500&quality=96&crop=center',
  'Televisions': 'https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa3-4748-9a64-c764a2179d76/https___cdn.shopify.com_s_files_1_0604_5298_2732_products_SSA_IMG_HERO_55_CU7700_2_1500x1500_crop_center.progressive.jpg?width=1500&height=1500&quality=96&crop=center',
  'Laptops': 'https://m.media-amazon.com/images/I/71jG+e7roXL._SY450_.jpg',
  'Mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Mobiles': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Tablets': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnvuj23Sj_yqZmWnw8hMmnLdjxoQiNQQHuCw&sauto=compress&cs=tinysrgb&w=400',
};

export default function CategoryNavBar() {
  const { categories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };

  const getImageUrl = (category: Category): string | null => {
    // Try API image first
    const apiImage = category.image || category.categoryImage || category.photo;
    if (apiImage) return apiImage;
    
    // Fall back to hardcoded images
    return CATEGORY_PRODUCT_IMAGES[category.name] || null;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide"
        >
          {categories.map((category: Category) => {
            const imageUrl = getImageUrl(category);
            const hasImageError = imageErrors.has(category._id);

            return (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="flex-shrink-0 flex items-center gap-2 sm:gap-3 group transition-all hover:scale-105 px-2 py-1"
              >
                {/* Category Image - Compact */}
                <div className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-md overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                  {imageUrl && !hasImageError ? (
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(category._id)}
                    />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m8 4v10l8-4v-10L12 11m0 0L4 7" />
                    </svg>
                  )}
                </div>
                
                {/* Category Name - Inline */}
                <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap group-hover:text-red-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
