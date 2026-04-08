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
  'TV': 'https://images.samsung.com/is/image/samsung/p6pim/in/ua32h4550fuxxl/gallery/in-hd-h4500-548529-ua32h4550fuxxl-546541641?$Q90_1248_936_F_PNG$',
  'Laptop': 'https://m.media-amazon.com/images/I/71jG+e7roXL._SY450_.jpg',
  'Mobile': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Tablet': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnvuj23Sj_yqZmWnw8hMmnLdjxoQiNQQHuCw&s=compress&cs=tinysrgb&w=400',
  'Home & Kitchen': 'https://blog.hignellrentals.com/hubfs/Imported_Blog_Media/Untitled%20design%20(1).png',
  'Wearables': 'https://images.unsplash.com/photo-1575125069494-6a0c5819d340?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2VhcmFibGVzfGVufDB8fDB8fHww',
  'Refrigerator': 'https://images.unsplash.com/photo-1630459065645-549fe5a56db4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVmcmlnZXJhdG9yfGVufDB8fDB8fHww',
  'Washing Machine': 'https://media-ik.croma.com/prod/https://media.tatacroma.com/Croma%20Assets/Large%20Appliances/Washers%20and%20Dryers/Images/308169_nhjiel.png',
  'Air Conditioner': 'https://i-media.vyaparify.com/vcards/blogs/98193/Benefits_of_AC.jpg',
  'Oven': 'https://images.samsung.com/is/image/samsung/p6pim/in/mc28a5025qb-tl/gallery/in-mc28a5025-convection-microwave--28-l-425064-mc28a5025qb-tl-534518480?$Q90_1248_936_F_PNG$',
  'Water Purifier': 'https://stg-images.samsung.com/is/image/samsung/assets/global/hq/ha/home-appliances/faq-water-purifier/2025-faq-water-purifier-og.jpg',
};

/**
 * Normalizes a category name for comparison:
 * - Lowercases + trims whitespace
 * - Strips trailing "s" to unify singular/plural
 *   (Laptops → laptop, Mobiles → mobile, Tablets → tablet)
 */
const normalizeName = (name: string): string =>
  name.toLowerCase().trim().replace(/s$/, '');

/**
 * Looks up an image URL for a category name with:
 * 1. Direct match
 * 2. Normalized match (handles case + plural/singular in one step)
 */
const getImageForCategory = (categoryName: string): string | null => {
  // 1. Direct match
  if (CATEGORY_PRODUCT_IMAGES[categoryName]) {
    return CATEGORY_PRODUCT_IMAGES[categoryName];
  }

  // 2. Normalize-based match (handles case + plural/singular)
  const normalizedInput = normalizeName(categoryName);
  const key = Object.keys(CATEGORY_PRODUCT_IMAGES).find(
    (k) => normalizeName(k) === normalizedInput
  );

  return key ? CATEGORY_PRODUCT_IMAGES[key] : null;
};

export default function CategoryNavBar() {
  const { categories: allCategories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Deduplicate by normalized name — collapses Laptop/Laptops, Mobile/Mobiles, Tablet/Tablets
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return allCategories.filter((category) => {
      const key = normalizeName(category.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allCategories]);

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  const getImageUrl = (category: Category): string | null => {
    // Always prefer hardcoded images (with plural/singular normalization)
    const hardcodedImage = getImageForCategory(category.name);
    if (hardcodedImage) return hardcodedImage;

    // Fall back to API image if no hardcoded image available
    return category.image || category.categoryImage || category.photo || null;
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