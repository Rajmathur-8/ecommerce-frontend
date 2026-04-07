'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Brand {
  name: string;
  logo: string;
  link: string;
}

export default function BrandShowcase() {
  const brands: Brand[] = [
    { name: 'Apple', logo: '/apple-icon.jpg', link: '/products?brand=apple' },
    { name: 'Samsung', logo: '/samsung-logo.jpg', link: '/products?brand=samsung' },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Premium Brands
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Shop from the world's most trusted technology brands with exclusive offers and authentic products
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.link}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-300 h-56 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100 group-hover:from-red-50 group-hover:to-red-100 transition-all duration-300" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
                  <div className="mb-4 flex items-center justify-center h-20 w-20 rounded-lg bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Image 
                      src={brand.logo} 
                      alt={brand.name} 
                      width={80} 
                      height={80}
                      className="object-contain w-16 h-16"
                      priority
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-900 text-center transition-colors duration-300">
                    {brand.name}
                  </h3>
                  <div className="mt-3 text-sm text-gray-500 group-hover:text-red-600 transition-colors">
                    Shop Now ?
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


