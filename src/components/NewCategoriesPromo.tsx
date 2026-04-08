'use client';

import Link from 'next/link';
import Image from 'next/image';

interface NewCategoriesPromoProps {
  homeKitchenId?: string;
  wearablesId?: string;
}

export default function NewCategoriesPromo({ 
  homeKitchenId = '', 
  wearablesId = '' 
}: NewCategoriesPromoProps) {
  const categories = [
    {
      name: 'Home & Kitchen',
      image: 'https://numalis.com/wp-content/uploads/2023/10/Maxx-Studio-Shutterstock.jpg',
      id: homeKitchenId,
      description: 'Explore home appliances and kitchenware',
    },
    {
      name: 'Wearables',
      image: 'https://careevolution.com/wp-content/uploads/2023/09/Sense2c.png',
      id: wearablesId,
      description: 'Discover smartwatches and wearable tech',
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-4">
            NEW ARRIVALS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Discover New Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Shop our latest collection of premium products
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.name}
              href={category.id ? `/products?category=${category.id}` : '/products'}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                {/* Background Image */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-100 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="inline-flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
                    Shop Now
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Glowing border on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
