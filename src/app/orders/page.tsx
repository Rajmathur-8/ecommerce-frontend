'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

import { Clock, Calendar, Package, Eye, X, CheckCircle, AlertCircle, Truck, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { OrdersPageSkeleton } from '@/components/Skeleton';
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
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discountAmount?: number;
  couponDiscount?: number;
  promoDiscount?: number;
  giftVoucherDiscount?: number;
  rewardPointsDiscount?: number;
  shippingCharges: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
  }>;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'old'>('upcoming');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(10);

  // Check if user came from successful payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const orderId = urlParams.get('orderId');
    
    if (paymentId || orderId) {
      setShowSuccessMessage(true);
      // Remove the query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, []);

  // Fetch orders with server-side pagination and filtering
  const fetchOrders = async (page: number, status: 'upcoming' | 'old') => {
    try {
      setLoading(true);
      const statusParam = status === 'upcoming' ? 'upcoming' : 'delivered';
      
      const response = await apiService.payment.getUserOrders({
        page,
        limit: ordersPerPage,
        status: statusParam
      });
      
      if (response.success && response.data) {
        const ordersData = response.data.orders || [];
        const paginationData = response.data.pagination || {};
        
        // Debug: Log frequently bought together data
        ordersData.forEach((order: Order, index: number) => {
          if (order.frequentlyBoughtTogether && order.frequentlyBoughtTogether.length > 0) {
            console.log(`Order ${index + 1} - Frequently Bought Together:`, order.frequentlyBoughtTogether);
          }
        });
        
        setOrders(ordersData);
        setTotalPages(paginationData.pages || 1);
        setTotalOrders(paginationData.total || 0);
        
        // Debug: Log order statuses
        const statusCounts = ordersData.reduce((acc: Record<string, number>, order: { orderStatus: string }) => {
          acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
          return acc;
        }, {});
        console.log('Order status counts:', statusCounts);
        console.log('Pagination data:', paginationData);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      }
    } catch (error) {
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when activeTab or currentPage changes
  useEffect(() => {
    fetchOrders(currentPage, activeTab);
  }, [activeTab, currentPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    // Replace "at" with comma
    return formattedDate.replace(' at ', ', ');
  };

  // Get the appropriate date based on order status
  const getStatusDate = (order: Order) => {
    if (order.statusHistory && order.statusHistory.length > 0) {
      // Find the timestamp for the current status
      const currentStatusEntry = order.statusHistory.find(
        entry => entry.status === order.orderStatus
      );
      if (currentStatusEntry) {
        return currentStatusEntry.timestamp;
      }
    }
    
    // Fallback to updatedAt for current status, createdAt for placed
    if (order.orderStatus === 'pending') {
      return order.createdAt;
    } else {
      return order.updatedAt;
    }
  };

  // Handle tab change and reset pagination
  const handleTabChange = (tab: 'upcoming' | 'old') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const response = await apiService.payment.cancelOrder(orderId);
      
      if (response.success && response.data?.order) {
        // Refresh the current page to get updated data
        fetchOrders(currentPage, activeTab);
        alert('Order cancelled successfully');
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      alert('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Calculate counts based on current tab
  const currentTabCount = totalOrders;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrdersPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your order has been placed successfully. You can track it here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('upcoming')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'upcoming'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upcoming Orders
                </button>
                <button
                  onClick={() => handleTabChange('old')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'old'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Delivered Orders
                </button>
              </nav>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'upcoming' 
                    ? 'You don\'t have any upcoming orders.' 
                    : 'You don\'t have any delivered orders.'}
                </p>
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((order, index) => (
                <div key={order._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-bold text-gray-900">
                          Order ID: {order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span className="ml-1 capitalize">{order.orderStatus}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items && order.items.length > 0 ? order.items.filter((item) => !item.isFrequentlyBoughtTogether).map((item, index) => {
                        // Calculate item total including warranty
                        const productPrice = item.price * item.quantity;
                        let warrantyPrice = 0;
                        if (item.warranty && typeof item.warranty === 'object' && item.warranty.price) {
                          warrantyPrice = item.warranty.price * item.quantity;
                        }
                        const itemTotal = productPrice + warrantyPrice;
                        
                        return (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <img
                              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                              src={item.product && typeof item.product === 'object' && item.product.images && item.product.images[0] 
                                ? item.product.images[0] 
                                : "/placeholder-product.svg"}
                              alt={item.product && typeof item.product === 'object' ? item.product.productName : 'Product'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {typeof item.product === 'string' 
                                ? `Product ID: ${item.product}` 
                                : (item.product && item.product.productName) || 'Product'}
                            </h4>
                            
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
                            
                            <p className="text-sm text-gray-500 mt-2">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            {item.warranty && typeof item.warranty === 'object' && item.warranty.name && (
                              <p className="text-sm text-indigo-600 font-medium mt-1">
                                Extended Warranty: {item.warranty.name} ({item.warranty.duration} months)
                              </p>
                            )}
                            <p className="text-sm font-bold text-gray-900 uppercase mt-1">
                              {order.paymentMethod}
                            </p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                              Order {order.orderStatus === 'pending' ? 'Placed' : 
                                     order.orderStatus === 'confirmed' ? 'Confirmed' :
                                     order.orderStatus === 'shipped' ? 'Shipped' :
                                     order.orderStatus === 'delivered' ? 'Delivered' :
                                     order.orderStatus === 'cancelled' ? 'Cancelled' : 'Placed'}: {formatDate(getStatusDate(order))}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xl font-bold text-gray-900">
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
                      }) : (
                        <div className="text-center py-4 text-gray-500">
                          No items found in this order
                        </div>
                      )}
                    </div>

                    {/* Frequently Bought Together Items */}
                    {order.frequentlyBoughtTogether && order.frequentlyBoughtTogether.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-indigo-700 mb-3">Frequently Bought Together:</h5>
                        <div className="space-y-2">
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
                              <div key={fbtIndex} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="flex-shrink-0">
                                  <img
                                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
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
                                <div className="flex-shrink-0 text-right">
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

                    {/* Order Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Subtotal: {formatCurrency(order.subtotal)}</p>
                          {/* Show frequently bought together total if exists */}
                          {order.frequentlyBoughtTogether && order.frequentlyBoughtTogether.length > 0 && (() => {
                            const fbtTotal = order.frequentlyBoughtTogether.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                            return (
                              <p className="text-sm text-indigo-600">Frequently Bought Together: +{formatCurrency(fbtTotal)}</p>
                            );
                          })()}

                          {order.discountAmount !== undefined && order.discountAmount > 0 && (
                            <p className="text-sm text-green-600">Discount: -{formatCurrency(order.discountAmount)}</p>
                          )}

                          {order.couponDiscount !== undefined && order.couponDiscount > 0 && (
                            <p className="text-sm text-green-600">Coupon Discount: -{formatCurrency(order.couponDiscount)}</p>
                          )}

                          {order.promoDiscount !== undefined && order.promoDiscount > 0 && (
                            <p className="text-sm text-green-600">Promo Discount: -{formatCurrency(order.promoDiscount)}</p>
                          )}

                          {order.giftVoucherDiscount !== undefined && order.giftVoucherDiscount > 0 && (
                            <p className="text-sm text-green-600">Gift Voucher Discount: -{formatCurrency(order.giftVoucherDiscount)}</p>
                          )}

                          {order.rewardPointsDiscount !== undefined && order.rewardPointsDiscount > 0 && (
                            <p className="text-sm text-green-600">Reward Points Discount: -{formatCurrency(order.rewardPointsDiscount)}</p>
                          )}

                          {order.shippingCharges !== undefined && order.shippingCharges > 0 && (
                            <p className="text-sm text-gray-600">Shipping: {formatCurrency(order.shippingCharges)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">Total: {formatCurrency(order.total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                      {order.orderStatus === 'pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      <Link
                        href={`/orders/${order._id}`}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>


          {/* Pagination */}
          {orders.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
                </span>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 