'use client';

import { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
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
  'TV': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop&q=80',
  'Laptop': 'https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=400&h=300&fit=crop&q=80',
  'Mobile': 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=300&fit=crop&q=80',
  'Tablet': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80',
  'Wearables': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&q=80',
  'Refrigerator': 'https://images.unsplash.com/photo-1630459065645-549fe5a56db4?w=400&h=300&fit=crop&q=80',
  'Washing Machine': 'https://images.unsplash.com/photo-1585314293845-4db3b9d0c6e9?w=400&h=300&fit=crop&q=80',
  'Oven': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=300&fit=crop&q=80',
  'Water Purifier': 'https://stg-images.samsung.com/is/image/samsung/assets/global/hq/ha/home-appliances/faq-water-purifier/2025-faq-water-purifier-og.jpg',
  'Air Conditioner': 'https://i-media.vyaparify.com/vcards/blogs/98193/Benefits_of_AC.jpg',
};

/**
 * Looks up an image URL for a category name with:
 * 1. Direct match
 * 2. Case-insensitive match
 * 3. Plural/singular normalization (e.g. "Laptops" → "Laptop", "Mobiles" → "Mobile")
 */
const getImageForCategory = (categoryName: string): string | null => {
  // 1. Direct match
  if (CATEGORY_PRODUCT_IMAGES[categoryName]) {
    return CATEGORY_PRODUCT_IMAGES[categoryName];
  }

  const lower = categoryName.toLowerCase().trim();

  // 2. Case-insensitive + plural/singular normalization
  const key = Object.keys(CATEGORY_PRODUCT_IMAGES).find((k) => {
    const kLower = k.toLowerCase();
    return (
      kLower === lower ||
      kLower === lower.replace(/s$/, '') || // "Laptops" → "Laptop"
      kLower + 's' === lower                // "Laptop"  → "Laptops"
    );
  });

  return key ? CATEGORY_PRODUCT_IMAGES[key] : null;
};

export default function CategoryNavBar() {
  const { categories: allCategories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // ─── FIX: Deduplicate categories by name (case-insensitive) ───────────────
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return allCategories.filter((category) => {
      const key = category.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allCategories]);
  // ──────────────────────────────────────────────────────────────────────────

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  const getImageUrl = (category: Category): string | null => {
    // Always prefer hardcoded images (case-insensitive + plural normalization)
    const hardcodedImage = getImageForCategory(category.name);
    if (hardcodedImage) return hardcodedImage;

    // Fall back to API image if no hardcoded image
    const apiImage = category.image || category.categoryImage || category.photo;
    return apiImage || null;
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
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m8 4v10l8-4v-10L12 11m0 0L4 7"
                      />
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