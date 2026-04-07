'use client';

import { useState, useEffect } from 'react';
import { Zap, CreditCard } from 'lucide-react';

interface OfferBannerProps {
  title?: string;
  showOffers?: boolean;
}

export default function OfferBanner({ title = "Limited Time Offers", showOffers = true }: OfferBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate time until next midnight
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 border-b-2 border-orange-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
          {/* Left Section - Title & Countdown */}
          <div className="flex items-center gap-3 bg-white bg-opacity-50 rounded-lg p-4 flex-1 md:flex-initial">
            <Zap className="w-7 h-7 text-orange-600 shrink-0 animate-pulse" />
            <div>
              <h3 className="font-bold text-gray-900 text-base md:text-lg">{title}</h3>
              <p className="text-sm text-orange-700 font-semibold">⏱️ {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</p>
            </div>
          </div>

          {/* Right Section - Bank Offers */}
          {showOffers && (
            <div className="flex flex-wrap gap-3 justify-center md:justify-end flex-1 md:flex-initial">
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-bold text-gray-900 text-sm">Upto ₹7,500</span>
                  <span className="text-red-600 text-xs font-semibold ml-1">HDFC EMI</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-bold text-gray-900 text-sm">5% Off</span>
                  <span className="text-green-600 text-xs font-semibold ml-1">Amex</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="font-bold text-gray-900 text-sm">Upto ₹12,000</span>
                  <span className="text-purple-600 text-xs font-semibold ml-1">HSBC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
