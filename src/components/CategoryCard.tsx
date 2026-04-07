'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description?: string;
}

export default function CategoryCard({ id, name, image, productCount, description }: CategoryCardProps) {
  return (
    <Link href={`/category/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Category Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
          
          {/* Product Count Badge */}
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {productCount} products
          </div>
        </div>

        {/* Category Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Explore Button */}
          <div className="mt-3 flex items-center text-red-600 font-medium text-sm group-hover:text-red-700 transition-colors">
            Explore
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
} 

