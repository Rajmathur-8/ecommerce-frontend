'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  image?: string;
}

// Default product images for categories
const CATEGORY_PRODUCT_IMAGES: Record<string, string> = {
  'TV': 'https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa3-4748-9a64-c764a2179d76/https___cdn.shopify.com_s_files_1_0604_5298_2732_products_SSA_IMG_HERO_55_CU7700_2_1500x1500_crop_center.progressive.jpg?width=1500&height=1500&quality=96&crop=center',
  'Laptops': 'https://m.media-amazon.com/images/I/71jG+e7roXL._SY450_.jpg',
  'Mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Tablets': 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
};

interface CategoryCarouselProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  activeCategory: string | null;
  loading?: boolean;
}

export default function CategoryCarousel({ 
  categories, 
  onCategoryClick, 
  activeCategory, 
  loading = false 
}: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || categories.length <= 6) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(categories.length / 6));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, categories.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(categories.length / 6));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(categories.length / 6)) % Math.ceil(categories.length / 6));
  };

  const getVisibleCategories = () => {
    const startIndex = currentIndex * 6;
    return categories.slice(startIndex, startIndex + 6);
  };

  if (loading) {
    return (
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-12 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const visibleCategories = getVisibleCategories();
  const totalSlides = Math.ceil(categories.length / 6);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-left">Explore Category</h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all duration-200 hover:scale-110"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all duration-200 hover:scale-110"
                aria-label="Next categories"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
            {visibleCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryClick(category._id)}
                className={`group flex flex-col items-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative
                  ${activeCategory === category._id 
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-lg transform scale-105' 
                    : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50'
                  }`}
              >
                {/* Category Icon/Image */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 flex items-center justify-center transition-all duration-300 shadow-md overflow-hidden
                  ${activeCategory === category._id 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600'
                  }`}
                >
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : CATEGORY_PRODUCT_IMAGES[category.name] ? (
                    <img 
                      src={CATEGORY_PRODUCT_IMAGES[category.name]} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Category Name */}
                <span className={`text-sm md:text-base font-semibold text-center transition-colors duration-300
                  ${activeCategory === category._id 
                    ? 'text-indigo-800' 
                    : 'text-gray-800 group-hover:text-indigo-700'
                  }`}
                >
                  {category.name}
                </span>

                {/* Active Indicator */}
                {activeCategory === category._id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 hover:scale-125
                    ${currentIndex === index 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 w-8 shadow-md' 
                      : 'bg-gray-300 hover:bg-gray-400 w-3'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
