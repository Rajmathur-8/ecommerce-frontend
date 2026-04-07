'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface FeaturedCategoriesGridProps {
  categories: Category[];
  onCategoryClick?: (categoryId: string) => void;
  loading?: boolean;
}

// Default product images for categories
const CATEGORY_PRODUCT_IMAGES: Record<string, string> = {
  'TV': 'https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa3-4748-9a64-c764a2179d76/https___cdn.shopify.com_s_files_1_0604_5298_2732_products_SSA_IMG_HERO_55_CU7700_2_1500x1500_crop_center.progressive.jpg?width=1500&height=1500&quality=96&crop=center',
  'Laptops': 'https://m.media-amazon.com/images/I/71jG+e7roXL._SY450_.jpg',
  'Mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Mobiles': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Tablets': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnvuj23Sj_yqZmWnw8hMmnLdjxoQiNQQHuCw&s=compress&cs=tinysrgb&w=400',
  'Air Conditioner': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop',
  'Washing Machine': 'https://images.unsplash.com/photo-1584622281867-8f270c1c2e7f?w=500&h=500&fit=crop',
  'Refrigerator': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&h=500&fit=crop',
};

const FeaturedCategoriesGrid: React.FC<FeaturedCategoriesGridProps> = ({ 
  categories, 
  onCategoryClick, 
  loading = false 
}) => {
  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-48 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Get top 4 categories
  const featured = categories.slice(0, 4);

  if (featured.length === 0) {
    return null;
  }

  const getImageUrl = (category: Category): string => {
    // First check if category has its own image
    if (category.image) {
      return category.image;
    }
    // Then check the predefined images by exact name
    if (CATEGORY_PRODUCT_IMAGES[category.name]) {
      return CATEGORY_PRODUCT_IMAGES[category.name];
    }
    // Fallback: return a placeholder
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop';
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Explore Category</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((category) => (
            <button
              key={category._id}
              onClick={() => onCategoryClick?.(category._id)}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-48 sm:h-52"
            >
              {/* Category Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={getImageUrl(category)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop';
                  }}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Category Name */}
              <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <h3 className="text-white text-lg sm:text-xl font-semibold text-center px-2">
                  {category.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategoriesGrid;


