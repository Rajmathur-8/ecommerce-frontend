'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  _id: string;
  image: string;
  link?: string;
  isPreOrder?: boolean;
  preOrderProductId?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  onBannerClick: (banner: Banner) => void;
  autoSlideInterval?: number; // in milliseconds (default: 3000)
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  onBannerClick,
  autoSlideInterval = 3000
}) => {
  const [current, setCurrent] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoSliding || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isAutoSliding, banners.length, autoSlideInterval]);

  const handlePrevious = () => {
    setIsAutoSliding(false);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    // Resume auto-slide after 5 seconds of no interaction
    const resumeTimer = setTimeout(() => setIsAutoSliding(true), 5000);
    return () => clearTimeout(resumeTimer);
  };

  const handleNext = () => {
    setIsAutoSliding(false);
    setCurrent((prev) => (prev + 1) % banners.length);
    // Resume auto-slide after 5 seconds of no interaction
    const resumeTimer = setTimeout(() => setIsAutoSliding(true), 5000);
    return () => clearTimeout(resumeTimer);
  };

  const handleDotClick = (index: number) => {
    setIsAutoSliding(false);
    setCurrent(index);
    // Resume auto-slide after 5 seconds of no interaction
    const resumeTimer = setTimeout(() => setIsAutoSliding(true), 5000);
    return () => clearTimeout(resumeTimer);
  };

  const handleMouseEnter = () => {
    setIsAutoSliding(false);
  };

  const handleMouseLeave = () => {
    setIsAutoSliding(true);
  };

  if (banners.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <span className="text-gray-400">No banners available</span>
      </div>
    );
  }

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden bg-gray-100 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Carousel Container */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: '1920 / 600',
          maxHeight: '600px'
        }}
      >
        {/* Slide Image with Fade Transition */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            key={`banner-${current}`}
            src={banners[current].image}
            alt={`Banner ${current + 1}`}
            className="w-full h-full object-cover animate-fadeIn"
          />

          {/* Pre-order Button Overlay */}
          {banners[current].isPreOrder && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={() => onBannerClick(banners[current])}
                className="pointer-events-auto relative group transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {/* Layered Banner Effect */}
                <div className="relative">
                  {/* Black layer (back) */}
                  <div className="absolute -bottom-1 -right-1 w-full h-full bg-black rounded-sm transform rotate-1"></div>
                  {/* Orange layer (middle) */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-full h-full bg-orange-500 rounded-sm transform rotate-0.5"></div>
                  {/* Pink banner (front) */}
                  <div className="relative bg-gradient-to-r from-pink-500 to-fuchsia-600 px-10 py-4 rounded-sm shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-pink-300 rounded-t-sm"></div>
                    <span className="relative text-white font-bold text-xl tracking-wider">
                      PRE ORDER
                    </span>
                  </div>
                </div>
                {/* Geometric shapes decoration */}
                <div className="absolute -left-4 -top-2 w-3 h-3 bg-orange-500 transform rotate-45"></div>
                <div className="absolute -right-4 -top-2 w-2 h-2 bg-black transform rotate-45"></div>
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-pink-500"></div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-2 h-2 bg-orange-500 transform rotate-45"></div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-2 h-2 bg-black transform rotate-45"></div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 z-20 hover:bg-opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 z-20 hover:bg-opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === current
                  ? 'bg-white w-3 h-3 scale-125'
                  : 'bg-white bg-opacity-50 w-2 h-2 hover:bg-opacity-75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-slide Indicator */}
      {isAutoSliding && banners.length > 1 && (
        <div className="absolute bottom-2 right-4 flex items-center gap-1 text-white text-xs bg-black bg-opacity-40 px-2 py-1 rounded-full z-20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Auto playing</span>
        </div>
      )}

      {/* CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default BannerCarousel;


