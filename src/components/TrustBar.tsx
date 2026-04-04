'use client';

import { Truck, CheckCircle, Headphones, CreditCard } from 'lucide-react';

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="flex items-center justify-center md:justify-start">
            <Truck className="w-6 h-6 text-indigo-600 mr-3 shrink-0" />
            <div className="hidden md:block">
              <p className="font-semibold text-gray-900 text-sm">Free Delivery</p>
              <p className="text-xs text-gray-600">On all orders</p>
            </div>
            <p className="md:hidden text-sm font-semibold text-gray-900">Free Delivery</p>
          </div>
          
          <div className="flex items-center justify-center md:justify-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 shrink-0" />
            <div className="hidden md:block">
              <p className="font-semibold text-gray-900 text-sm">100% Authentic</p>
              <p className="text-xs text-gray-600">All products genuine</p>
            </div>
            <p className="md:hidden text-sm font-semibold text-gray-900">Authentic</p>
          </div>
          
          <div className="flex items-center justify-center md:justify-start">
            <Headphones className="w-6 h-6 text-blue-600 mr-3 shrink-0" />
            <div className="hidden md:block">
              <p className="font-semibold text-gray-900 text-sm">24/7 Support</p>
              <p className="text-xs text-gray-600">Dedicated helpline</p>
            </div>
            <p className="md:hidden text-sm font-semibold text-gray-900">24/7 Support</p>
          </div>
          
          <div className="flex items-center justify-center md:justify-start">
            <CreditCard className="w-6 h-6 text-purple-600 mr-3 shrink-0" />
            <div className="hidden md:block">
              <p className="font-semibold text-gray-900 text-sm">Easy EMI</p>
              <p className="text-xs text-gray-600">No cost EMI available</p>
            </div>
            <p className="md:hidden text-sm font-semibold text-gray-900">Easy EMI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
