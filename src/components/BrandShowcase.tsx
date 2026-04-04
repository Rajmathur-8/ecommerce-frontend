'use client';

import Link from 'next/link';

interface Brand {
  name: string;
  logo: string;
  link: string;
}

export default function BrandShowcase() {
  const brands: Brand[] = [
    { name: 'Apple', logo: '🍎', link: '/products?brand=apple' },
    { name: 'Samsung', logo: '📱', link: '/products?brand=samsung' },
  ];

  return (
    <section className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Discover Leading Brands
          </h2>
          <p className="text-gray-600 text-sm">Explore a curated selection of premium brands</p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.link}
              className="group"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8 flex flex-col items-center justify-center h-40 hover:shadow-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 border-2 border-indigo-200 hover:border-indigo-400">
                <span className="text-6xl mb-3">{brand.logo}</span>
                <span className="text-sm md:text-base font-bold text-indigo-900 group-hover:text-indigo-700 text-center transition-colors">
                  {brand.name}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View More Section */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-4">Featuring premium brands trusted by millions</p>
          <Link
            href="/brands"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Shop All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
