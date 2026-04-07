'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BankOffer {
  id: number;
  bankName: string;
  logoUrl: string;
  offerTitle: string;
  discount: string;
  details: string;
  terms: string;
}

const bankOffers: BankOffer[] = [
  {
    id: 1,
    bankName: 'YES BANK',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Yes_Bank_Logo-01.png',
    offerTitle: 'Instant Discount Upto ?2,000 on YES Bank Credit Card EMI',
    discount: 'Upto Rs 2,000',
    details: 'on YES Bank Credit Card',
    terms: '*T&C apply',
  },
  {
    id: 2,
    bankName: 'BOB CARD',
    logoUrl: 'https://1000logos.net/wp-content/uploads/2021/06/Bank-of-Baroda-icon.png',
    offerTitle: 'Get 10% Instant Discount upto Rs.3,000 on BOB Card EMI',
    discount: 'Upto Rs 3,000',
    details: 'on BOB Card EMI',
    terms: '*T&C apply',
  },
  {
    id: 3,
    bankName: 'RBL BANK',
    logoUrl: 'https://digichefs.com/wp-content/uploads/2024/07/logorbl.jpeg',
    offerTitle: 'Get Instant Discount Upto ?4,000 on RBL Bank credit card EMI',
    discount: 'Upto Rs 4,000',
    details: 'on RBL Bank credit card EMI',
    terms: '*T&C apply',
  },
  {
    id: 4,
    bankName: 'HDFC BANK',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSquouX3qJzp6uZwleCOtTBppHfDKlN6vDHg&s',
    offerTitle: 'Get 7.5% Instant Discount Upto Rs.7500 on HDFC Bank Credit Card EMI',
    discount: 'Upto Rs 7,500',
    details: 'on HDFC Bank Credit Card EMI',
    terms: '*T&C apply',
  },
  {
    id: 5,
    bankName: 'HSBC',
    logoUrl: 'https://icons.veryicon.com/png/o/internet--web/payment-method/hsbc-bank-1.png',
    offerTitle: 'Get Upto ?12,000 Instant Discount on HSBC Bank Cards for EMI and Non-EMI',
    discount: 'Upto Rs 12,000',
    details: 'on HSBC Bank Cards for EMI and Non-EMI',
    terms: '*T&C apply',
  }
];

const BankOffersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bankOffers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, bankOffers.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bankOffers.length) % bankOffers.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bankOffers.length);
    setIsAutoPlaying(false);
  };

  const getVisibleOffers = () => {
    const itemsPerView = 4;
    const offers = [];
    for (let i = 0; i < itemsPerView; i++) {
      offers.push(bankOffers[(currentIndex + i) % bankOffers.length]);
    }
    return offers;
  };

  return (
    <section className="w-full bg-white py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bank Offers</h2>
            <p className="text-sm text-gray-600 mt-1">Exclusive discounts & cashback on credit card EMI</p>
          </div>
          <span className="text-xs font-semibold text-red-600 px-3 py-1 bg-red-50 rounded-full border border-red-200">
            Exclusive Deals
          </span>
        </div>

        <div
          className="relative group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-full p-2 shadow-md z-10 transition-all hover:shadow-lg hidden md:flex items-center justify-center"
            aria-label="Previous offers"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
          </button>

          {/* Carousel Container */}
          <div>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
              {getVisibleOffers().map((offer) => (
                <div
                  key={offer.id}
                  className="flex-shrink-0 w-full sm:w-80 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group cursor-pointer hover:-translate-y-1 duration-300"
                >
                  <div className="flex h-full">
                    {/* Bank Logo Section - Clean Design */}
                    <div className="w-24 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={offer.logoUrl}
                        alt={offer.bankName}
                        className="h-14 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Offer Content Section */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      {/* Discount Badge - Professional Style */}
                      <div className="mb-2">
                        <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded border border-red-200">
                          {offer.discount}
                        </span>
                      </div>

                      {/* Offer Title */}
                      <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                        {offer.offerTitle}
                      </p>

                      {/* Terms */}
                      <p className="text-xs text-gray-500 mt-3">
                        {offer.terms}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-full p-2 shadow-md z-10 transition-all hover:shadow-lg hidden md:flex items-center justify-center"
            aria-label="Next offers"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
          </button>
        </div>

        {/* Indicator Dots - Subtle */}
        <div className="flex justify-center gap-2 mt-3">
          {bankOffers.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'bg-red-600 w-2 h-2'
                  : 'bg-gray-300 w-1.5 h-1.5 hover:bg-gray-400'
              }`}
              aria-label={`Go to offer ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default BankOffersCarousel;

