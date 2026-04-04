'use client';

import { Users, MapPin, Package } from 'lucide-react';

export default function StatisticsSection() {
  const stats = [
    {
      icon: Users,
      figure: '10M+',
      label: 'Happy Customers',
      sublabel: 'Trusted by millions'
    },
    {
      icon: MapPin,
      figure: '1000+',
      label: 'Cities Covered',
      sublabel: 'Delivering nationwide'
    },
    {
      icon: Package,
      figure: '500K+',
      label: 'Products',
      sublabel: 'Wide selection'
    }
  ];

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center text-white"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 rounded-full p-4">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.figure}
                </h3>
                <p className="text-lg font-semibold mb-1">{stat.label}</p>
                <p className="text-sm text-indigo-100">{stat.sublabel}</p>
              </div>
            );
          })}
        </div>

        {/* Trust Message */}
        <div className="mt-12 text-center border-t border-white/20 pt-8">
          <p className="text-white text-lg font-medium">
            Your Reliable Partner for Premium Electronics & Appliances
          </p>
          <p className="text-indigo-100 text-sm mt-2">
            Transparent pricing • Best quality • Fast delivery • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
}
