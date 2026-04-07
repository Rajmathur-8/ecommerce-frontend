'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Star, MessageSquare, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/config';

interface Order {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      productName: string;
      price: number;
      images: string[];
    } | string;
    quantity: number;
    price: number;
    variant?: string;
    warranty?: {
      _id: string;
      name: string;
      price: number;
      duration: number;
    } | string | null;
    isFrequentlyBoughtTogether?: boolean;
  }>;
  address: {
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  couponDiscount?: number;
  promoCode?: string | null;
  promoDiscount?: number;
  giftVoucherCode?: string | null;
  giftVoucherDiscount?: number;
  rewardPointsDiscount?: number;
  shippingCharges: number;
  codCharges?: number;
  total: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  frequentlyBoughtTogether?: Array<{
    cartItemId: string;
    product?: {
      _id: string;
      productName: string;
      images: string[];
      price: number;
    } | string | null;
    manualProduct?: {
      productName: string;
      images: string[];
      price: number;
      discountPrice?: number;
      sku?: string;
      isManual: boolean;
    };
    quantity: number;
    price: number;
  }>;
}
// import Header from '@/components/Header';
import { OrderDetailsSkeleton } from '@/components/Skeleton';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState<{
    ratings?: {
      overall: number;
      valueForMoney: number;
      quality: number;
      delivery: number;
      packaging: number;
      customerService: number;
    };
    comment?: string;
    images?: string[];
  } | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Order details page - Fetching order:', orderId);
        console.log('🔍 Order details page - User authenticated:', apiService.hasToken());
        const response = await apiService.payment.getOrder(orderId);
        console.log('🔍 Order details page - Order response:', response);
        
        if (response.success && response.data?.order) {
          const orderData = response.data.order as Order;
          console.log('🔍 Order data received:', {
            subtotal: orderData.subtotal,
            total: orderData.total,
            rewardPointsDiscount: orderData.rewardPointsDiscount,
            couponDiscount: orderData.couponDiscount,
            promoDiscount: orderData.promoDiscount,
            giftVoucherDiscount: orderData.giftVoucherDiscount,
            discountAmount: orderData.discountAmount
          });
          setOrder(orderData);
          
          // Check if order has been reviewed
          try {
            const ratingResponse = await apiService.rating.getOrderRating(orderId);
            if (ratingResponse.success && ratingResponse.data) {
              console.log('🔍 Order details page - Rating response:', ratingResponse);
              setHasRated(ratingResponse.data.hasRated);
              setExistingRating(ratingResponse.data.rating);
            }
          } catch {
            console.log('No existing rating found for this order');
          }
        } else {
          setError('Order not found');
        }
      } catch (error) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-red-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const _getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const formattedDate = new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    // Replace "at" with comma
    return formattedDate.replace(' at ', ', ');
  };

  // Get status date based on order status and timestamps
  const getStatusDate = (status: string) => {
    if (!order) return null;
    
    switch (status) {
      case 'placed':
        return order.createdAt;
      case 'confirmed':
        // If order is confirmed or beyond, use updatedAt
        // In real implementation, you might want to store confirmedAt timestamp
        return ['confirmed', 'shipped', 'delivered'].includes(order.orderStatus) 
          ? order.updatedAt 
          : null;
      case 'shipped':
        // If order is shipped or delivered, use updatedAt
        return ['shipped', 'delivered'].includes(order.orderStatus) 
          ? order.updatedAt 
          : null;
      case 'delivered':
        // If order is delivered, use deliveredAt or updatedAt
        return order.orderStatus === 'delivered' 
          ? (order.deliveredAt || order.updatedAt)
          : null;
      default:
        return null;
    }
  };


  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await apiService.payment.cancelOrder(order._id);
      
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
        alert('Order cancelled successfully');
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      alert('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderDetailsSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-800" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-sm text-gray-600">Order #{order._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-2 flex items-center gap-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                <span className="ml-1 capitalize">{order.orderStatus}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="md:col-span-8">
            {/* Single Card with Product Details + Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Product Details Section */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.filter((item) => !item.isFrequentlyBoughtTogether).map((item, index) => {
                    // Calculate item total including warranty
                    const productPrice = item.price * item.quantity;
                    let warrantyPrice = 0;
                    if (item.warranty && typeof item.warranty === 'object' && item.warranty.price) {
                      warrantyPrice = item.warranty.price * item.quantity;
                    }
                    const itemTotal = productPrice + warrantyPrice;
                    
                    return (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          className="w-full h-full object-cover"
                          src={typeof item.product === 'object' && item.product.images && item.product.images[0] 
                            ? item.product.images[0] 
                            : "/placeholder-product.svg"}
                          alt={typeof item.product === 'object' ? item.product.productName : 'Product'}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {typeof item.product === 'string' 
                            ? `Product ID: ${item.product}` 
                            : item.product.productName || 'Product'}
                        </h3>
                        
                        {/* Variant Attributes */}
                        {item.variant && (() => {
                          try {
                            const variantData = typeof item.variant === 'string' ? JSON.parse(item.variant) : item.variant;
                            if (variantData && typeof variantData === 'object' && !Array.isArray(variantData)) {
                              // Get all attributes from variantData.attributes if exists, otherwise from variantData itself
                              const attributes = variantData.attributes || variantData;
                              
                              return (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {Object.entries(attributes)
                                    .filter(([key, value]) => 
                                      key !== 'price' && 
                                      key !== 'stock' && 
                                      key !== 'discountPrice' && 
                                      key !== 'variantName' && 
                                      key !== 'attributes' && 
                                      key !== 'sku' &&
                                      (typeof value === 'string' || typeof value === 'number') &&
                                      value !== '' &&
                                      value !== null &&
                                      value !== undefined
                                    )
                                    .map(([, value], attrIndex) => (
                                      <span key={attrIndex} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                        {String(value)}
                                      </span>
                                    ))}
                                </div>
                              );
                            }
                          } catch (error) {
                            // If parsing fails, don't show variant
                          }
                          return null;
                        })()}
                        
                        <p className="text-sm text-gray-600 mt-2">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                        {item.warranty && typeof item.warranty === 'object' && item.warranty.name && (
                          <p className="text-sm text-indigo-600 font-medium mt-1">
                            Extended Warranty: {item.warranty.name} ({item.warranty.duration} months) - {formatCurrency(item.warranty.price)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(itemTotal)}
                        </p>
                        {warrantyPrice > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            (Product: {formatCurrency(productPrice)} + Warranty: {formatCurrency(warrantyPrice)})
                          </p>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
                
                {/* Frequently Bought Together Items */}
                {order.frequentlyBoughtTogether && order.frequentlyBoughtTogether.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-4">Frequently Bought Together:</h3>
                    <div className="space-y-3">
                      {order.frequentlyBoughtTogether.map((fbtItem, fbtIndex) => {
                        // Check if it's a manual product or regular product
                        const isManualProduct = fbtItem.manualProduct && fbtItem.manualProduct.productName;
                        const productImage = isManualProduct 
                          ? (fbtItem.manualProduct?.images && fbtItem.manualProduct.images[0] ? fbtItem.manualProduct.images[0] : "/placeholder-product.svg")
                          : (fbtItem.product && typeof fbtItem.product === 'object' && fbtItem.product.images && fbtItem.product.images[0]
                              ? fbtItem.product.images[0]
                              : "/placeholder-product.svg");
                        const productName = isManualProduct
                          ? fbtItem.manualProduct?.productName
                          : (typeof fbtItem.product === 'string'
                              ? `Product ID: ${fbtItem.product}`
                              : (fbtItem.product && fbtItem.product.productName) || 'Product');
                        
                        return (
                          <div key={fbtIndex} className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                className="w-full h-full object-cover"
                                src={productImage}
                                alt={productName}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {productName}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">Quantity: {fbtItem.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-bold text-indigo-600">
                                {formatCurrency(fbtItem.quantity * fbtItem.price)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Border Line */}
              <div className="border-b border-gray-200"></div>

              {/* Delivery Address Section */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{order.address.name}</p>
                  <p className="text-gray-600">{order.address.mobile}</p>
                  <p className="text-gray-600">{order.address.addressLine1}</p>
                  {order.address.addressLine2 && (
                    <p className="text-gray-600">{order.address.addressLine2}</p>
                  )}
                  <p className="text-gray-600">
                    {order.address.city}, {order.address.state} {order.address.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {order.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay Order ID</span>
                      <span className="font-mono text-sm text-gray-900">{order.razorpayOrderId}</span>
                    </div>
                  )}
                  {order.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay Payment ID</span>
                      <span className="font-mono text-sm text-gray-900">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Section for Delivered Orders */}
            {order.orderStatus === 'delivered' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Your Review</h2>
                </div>
                <div className="px-6 py-6">
                  {hasRated && existingRating ? (
                    // Show existing rating with product image
                    <div>
                      
                      {/* Product Image and Rating */}
                      <div className="flex items-center gap-4 mb-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {order.items[0] && typeof order.items[0].product === 'object' && order.items[0].product.images && order.items[0].product.images.length > 0 ? (
                            <img
                              src={order.items[0].product.images[0]}
                              alt={order.items[0].product.productName}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Name and Rating */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {order.items[0] && typeof order.items[0].product === 'object' 
                              ? order.items[0].product.productName 
                              : 'Product'}
                          </h3>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= (existingRating.ratings?.overall || 0)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-lg font-semibold text-gray-700">
                              {existingRating.ratings?.overall || 0}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Review Comment */}
                      {existingRating.comment && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-gray-700 text-center italic">
                            &ldquo;{existingRating.comment}&rdquo;
                          </p>
                        </div>
                      )}
                      
                      {/* Review Images */}
                      {(() => {
                        console.log('🔍 existingRating object:', existingRating);
                        console.log('🔍 existingRating.images:', existingRating.images);
                        console.log('🔍 existingRating.images length:', existingRating.images?.length);
                        return null;
                      })()}
                      {existingRating.images && existingRating.images.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Photos:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {existingRating.images.map((imageUrl: string, index: number) => {
                              console.log(`🔍 Rendering image ${index + 1}:`, imageUrl);
                              return (
                                  <div key={index} className="relative">
                                    <img
                                      src={imageUrl}
                                      alt={`Review photo ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 text-center">
                        Thank you for your feedback!
                      </p>
                    </div>
                  ) : (
                    // Show review prompt
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How was your Experience?</h3>
                      <p className="text-gray-600 mb-6">
                        We&apos;d love to hear about your shopping experience with us!
                      </p>
                      <button 
                        onClick={() => {
                          console.log('🔍 Review button clicked');
                          console.log('- Order ID:', order._id);
                          console.log('- Order Status:', order.orderStatus);
                          console.log('- User authenticated:', apiService.hasToken());
                          router.push(`/orders/${order._id}/review`);
                        }}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Write a Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-4 space-y-4">
            {/* Order Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Order Timeline</h2>
              </div>
              
              <div className="p-4">
                <div className="relative">
                  {/* Vertical Stepper */}
                  <div className="space-y-0">
                    {/* Step 1: Order Placed */}
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-500">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        {/* Connecting Line */}
                        <div className={`w-0.5 h-12 mt-2 ${
                          order.orderStatus === 'cancelled' && !['confirmed', 'shipped', 'delivered'].includes(order.orderStatus)
                            ? 'bg-red-500'
                            : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="text-sm font-bold text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {/* Step 2: Order Confirmed - Show cancelled if cancelled after placed but before confirmed */}
                    {order.orderStatus === 'cancelled' ? (
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-500">
                            <X className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-sm font-bold text-gray-900">Order Cancelled</p>
                          <p className="text-xs text-gray-600 mt-1">Your order has been cancelled</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            ['confirmed', 'shipped', 'delivered'].includes(order.orderStatus)
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-gray-300'
                          }`}>
                            {['confirmed', 'shipped', 'delivered'].includes(order.orderStatus) ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          {/* Connecting Line */}
                          <div className={`w-0.5 h-12 mt-2 ${
                            ['confirmed', 'shipped', 'delivered'].includes(order.orderStatus)
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-sm font-bold text-gray-900">Order Confirmed</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {['confirmed', 'shipped', 'delivered'].includes(order.orderStatus)
                              ? (() => {
                                  const confirmedDate = getStatusDate('confirmed');
                                  return confirmedDate ? formatDate(confirmedDate) : 'Your order has been confirmed';
                                })()
                              : 'Waiting for confirmation'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Shipped - Only show if not cancelled */}
                    {order.orderStatus !== 'cancelled' && (
                      <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          ['shipped', 'delivered'].includes(order.orderStatus)
                            ? 'bg-purple-500 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          {['shipped', 'delivered'].includes(order.orderStatus) ? (
                            <Truck className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {/* Connecting Line */}
                        <div className={`w-0.5 h-12 mt-2 ${
                          ['shipped', 'delivered'].includes(order.orderStatus)
                            ? 'bg-purple-500'
                            : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="text-sm font-bold text-gray-900">Shipped</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {['shipped', 'delivered'].includes(order.orderStatus)
                            ? (() => {
                                const shippedDate = getStatusDate('shipped');
                                return shippedDate ? formatDate(shippedDate) : 'Your order is on the way';
                              })()
                            : 'Waiting to be shipped'}
                        </p>
                      </div>
                    </div>
                    )}

                    {/* Step 4: Delivered - Only show if not cancelled */}
                    {order.orderStatus !== 'cancelled' && (
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          {order.orderStatus === 'delivered' ? (
                            <Package className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Delivered</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {order.orderStatus === 'delivered'
                            ? (() => {
                                const deliveredDate = getStatusDate('delivered');
                                return deliveredDate ? formatDate(deliveredDate) : 'Your order has been delivered';
                              })()
                            : 'Waiting for delivery'}
                        </p>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Price Details</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {/* Product Prices */}
                  {order.items.filter((item) => !item.isFrequentlyBoughtTogether).map((item, index) => {
                    const productPrice = item.price * item.quantity;
                    let warrantyPrice = 0;
                    if (item.warranty && typeof item.warranty === 'object' && item.warranty.price) {
                      warrantyPrice = item.warranty.price * item.quantity;
                    }
                    const itemTotal = productPrice + warrantyPrice;
                    
                    return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {typeof item.product === 'object' ? item.product.productName : 'Product'} (Qty: {item.quantity})
                        </span>
                        <span className="text-gray-600"> {formatCurrency(productPrice)}</span>
                      </div>
                      {warrantyPrice > 0 && (
                        <div className="flex justify-between text-xs text-indigo-600 ml-2">
                          <span>Extended Warranty</span>
                          <span> {formatCurrency(warrantyPrice)}</span>
                        </div>
                      )}
                      {warrantyPrice > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 ml-2">
                          <span>Price per item</span>
                          <span> {formatCurrency(item.price)}</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  
                  {/* Frequently Bought Together Items */}
                  {order.frequentlyBoughtTogether && order.frequentlyBoughtTogether.length > 0 && (
                    <>
                      {order.frequentlyBoughtTogether.map((fbtItem, fbtIndex) => (
                        <div key={`fbt-${fbtIndex}`} className="flex justify-between text-sm py-1">
                          <span className="text-indigo-700 font-medium">
                            {fbtItem.manualProduct?.productName 
                              ? `${fbtItem.manualProduct.productName} (Qty: ${fbtItem.quantity})`
                              : (typeof fbtItem.product === 'object' && fbtItem.product?.productName 
                                ? `${fbtItem.product.productName} (Qty: ${fbtItem.quantity})` 
                                : `Product (Qty: ${fbtItem.quantity})`)}
                          </span>
                          <span className="text-gray-900 font-semibold">{formatCurrency(fbtItem.quantity * fbtItem.price)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-600"> {formatCurrency(order.subtotal)}</span>
                    </div>
                  </div>
                  
                  {/* Discount Breakdown */}
                  {order.couponDiscount !== undefined && order.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon ({order.couponCode})</span>
                      <span className="text-green-600">-{formatCurrency(order.couponDiscount)}</span>
                    </div>
                  )}
                  
                  {order.promoDiscount !== undefined && order.promoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Promo Code ({order.promoCode})</span>
                      <span className="text-green-600">-{formatCurrency(order.promoDiscount)}</span>
                    </div>
                  )}
                  
                  {order.giftVoucherDiscount !== undefined && order.giftVoucherDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gift Voucher ({order.giftVoucherCode})</span>
                      <span className="text-green-600">-{formatCurrency(order.giftVoucherDiscount)}</span>
                    </div>
                  )}
                  
                  {order.rewardPointsDiscount !== undefined && order.rewardPointsDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reward Points Discount</span>
                      <span className="text-green-600">-{formatCurrency(order.rewardPointsDiscount)}</span>
                    </div>
                  )}
                  
                  {/* Total Discount (if individual discounts not available, show combined) */}
                 
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800">Total</span>
                      <span className="text-gray-800"> {formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex gap-3">
                {order.orderStatus === 'pending' && (
                  <button 
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-700 bg-white rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                <button 
                  onClick={() => router.push('/products')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 