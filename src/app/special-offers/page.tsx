"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/config";
import Link from "next/link";
import { TextSkeleton } from "@/components/Skeleton";

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<{ _id: string; code: string; description: string; image?: string; type: string; value: number; validUntil?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("/web/coupons?isActive=true"))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOffers(data.data);
        } else {
          setOffers([]);
        }
      })
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Special Offers</h1>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="w-full h-40 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="space-y-2">
                  <TextSkeleton className="h-6 w-3/4" />
                  <TextSkeleton className="h-4 w-full" />
                  <TextSkeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 mb-2">
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <TextSkeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No special offers available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <img src={offer.image || "/no-image.png"} alt={offer.code} className="w-full h-40 object-cover rounded mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 ">{offer.code}</h3>
                <p className="text-gray-600  mb-2">{offer.description}</p>
                <div className="flex  gap-2 mb-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 font-semibold">
                    {offer.type === "percentage" ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                  </span>
                </div>
                {offer.validUntil && (
                  <div className="text-xs text-gray-500">Valid until: {new Date(offer.validUntil).toLocaleDateString()}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 