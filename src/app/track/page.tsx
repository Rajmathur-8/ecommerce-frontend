'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';
import { TextSkeleton } from '@/components/Skeleton';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Search,
  ExternalLink,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface TrackingData {
  trackingNumber: string;
  status: string;
  statusDisplay: string;
  progressPercentage: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation?: string;
  timeline: Array<{
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  }>;
  partner: {
    name: string;
    displayName: string;
    trackingUrl: string;
  };
  order: {
    id: string;
    status: string;
    total: number;
  };
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.logistics.getTrackingDetails(trackingNumber.trim());
      
      if (response.success && response.data) {
        setTrackingData(response.data.tracking);
      } else {
        setError(response.message || 'Tracking number not found');
        setTrackingData(null);
      }
    } catch (err) {
      setError('Failed to track package. Please try again.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_placed': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-100';
      case 'picked_up': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'returned': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed': return <Package className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'in_transit': return <Truck className="w-5 h-5" />;
      case 'out_for_delivery': return <Package className="w-5 h-5" />;
      case 'picked_up': return <MapPin className="w-5 h-5" />;
      case 'failed': return <Package className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-left">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Track Your Package</h1>
            <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Tracking...' : 'Track Package'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Package Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {trackingData.trackingNumber}
                    </h2>
                    <p className="text-gray-600 text-sm">Order #{trackingData.order.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
                    {getStatusIcon(trackingData.status)}
                    <span className="ml-2">{trackingData.statusDisplay}</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
                  <span className="text-sm text-gray-500">{trackingData.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${trackingData.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated Delivery</p>
                    <p className="font-medium text-gray-900 text-sm">{formatDate(trackingData.estimatedDelivery)}</p>
                  </div>
                </div>
                
                {trackingData.actualDelivery && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivered On</p>
                      <p className="font-medium text-gray-900 text-sm">{formatDate(trackingData.actualDelivery)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping Partner</p>
                    <p className="font-medium text-gray-900 text-sm">{trackingData.partner.displayName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Delivery Timeline</h3>
              <div className="space-y-3">
                {trackingData.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        {index === 0 ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                      </div>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Tracking */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Track on Partner Website</h3>
                  <p className="text-gray-600 mt-1 text-sm">Get detailed updates from {trackingData.partner.displayName}</p>
                </div>
                <a
                  href={trackingData.partner.trackingUrl.replace('{tracking}', trackingData.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Track on {trackingData.partner.displayName}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!trackingData && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Your Package</h3>
            <p className="text-gray-500 text-sm">Enter your tracking number above to see delivery updates</p>
          </div>
        )}
      </div>
    </div>
  );
}
