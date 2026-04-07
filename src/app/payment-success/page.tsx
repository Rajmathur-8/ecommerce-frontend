'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ShoppingBag, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl, getAuthHeaders } from '@/lib/config';
import { useAppContext } from '@/contexts/AppContext';
import { useAppSelector } from '@/store/hooks';

type VerificationStatus = 'verifying' | 'success' | 'failed';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart: cartContext } = useAppContext();
  
  // Get selected frequently bought together items from Redux (if still available)
  const selectedFrequentlyBoughtRedux = useAppSelector(state => state.cart.selectedFrequentlyBought || {});
  const [orderId, setOrderId] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState<string>('');
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [showAnimation, setShowAnimation] = useState(false);

  const [loading, setLoading] = useState(true);
  const hasVerified = useRef(false);
  
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const orderAmount = searchParams.get('amount');
    const razorpayOrderId = searchParams.get('razorpay_order_id');
    const razorpayPaymentId = searchParams.get('razorpay_payment_id');
    const razorpaySignature = searchParams.get('razorpay_signature');
    const addressId = searchParams.get('addressId');
  
    // Handle COD orders - if orderId is present, show success directly
    if (orderId && orderAmount && !hasVerified.current) {
      hasVerified.current = true;
      setStatus('success');
      setOrderId(orderId);
      setOrderAmount(orderAmount);
      setLoading(false);
      setTimeout(() => setShowAnimation(true), 50);
      return;
    }
  
    // Handle Razorpay payment verification
    if (
      razorpayOrderId &&
      razorpayPaymentId &&
      razorpaySignature &&
      addressId &&
      !hasVerified.current
    ) {
      hasVerified.current = true; // prevent second call
      verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        addressId
      );
      return;
    }
  
    // If missing params and not COD → fail
    if (!hasVerified.current && !orderId) {
      setStatus("failed");
      setTimeout(() => setShowAnimation(true), 50);
    }
  }, []);
  

  const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, addressId: string) => {
    try {
      setStatus('verifying');
      console.log('🔍 Verifying payment...');
      
      // Get frequently bought together items from sessionStorage or Redux
      let frequentlyBoughtTogether = selectedFrequentlyBoughtRedux;
      try {
        const stored = sessionStorage.getItem('frequentlyBoughtTogether');
        if (stored) {
          frequentlyBoughtTogether = JSON.parse(stored);
          console.log('💾 Retrieved frequently bought together items from sessionStorage');
          console.log('📦 Frequently bought together data:', JSON.stringify(frequentlyBoughtTogether, null, 2));
          // Clear from sessionStorage after use
          sessionStorage.removeItem('frequentlyBoughtTogether');
        } else {
          console.log('📦 Using frequently bought together from Redux:', JSON.stringify(frequentlyBoughtTogether, null, 2));
        }
      } catch (error) {
        console.error('Error reading from sessionStorage:', error);
      }
      
      console.log('📦 Sending frequently bought together to backend:', JSON.stringify(frequentlyBoughtTogether, null, 2));
      
      const response = await fetch(getApiUrl('/web/razorpay/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          addressId: addressId,
          frequentlyBoughtTogether: frequentlyBoughtTogether
        })
      });

      const data = await response.json();
      console.log('Payment verification response:', data);
      
      if (data.success && data.data?.order) {
        setStatus('success');
        setOrderId(data.data.order._id);
        setOrderAmount(Math.round(data.data.order.total).toString());
        console.log('✅ Payment verified successfully');
        
        // Clear cart after successful verification
        cartContext.clearCart().then(() => {
          console.log('✅ Cart cleared successfully after order creation');
        }).catch((error) => {
        });
      } else {
        setStatus('failed');
        // Refresh cart from backend when payment fails to sync actual state
        console.log('🔄 Payment failed, refreshing cart from backend...');
        try {
          await cartContext.fetchCart();
          console.log('✅ Cart refreshed after payment failure');
        } catch (error) {
          console.error('❌ Error refreshing cart:', error);
        }
      }
    } catch (error) {
      setStatus('failed');
      // Refresh cart from backend when payment fails to sync actual state
      console.log('🔄 Payment verification error, refreshing cart from backend...');
      try {
        await cartContext.fetchCart();
        console.log('✅ Cart refreshed after payment error');
      } catch (refreshError) {
        console.error('❌ Error refreshing cart:', refreshError);
      }
    } finally {
      setTimeout(() => {
        setShowAnimation(true);
      }, 50);
    }
  };

  // Skeleton/Loading State (Verifying)
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center px-4">
          {/* Loading Skeleton */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6">
              <Loader2 className="w-32 h-32 text-indigo-600 animate-spin mx-auto" />
            </div>
          </div>
          
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center px-4">
          {/* Success Animation */}
          <div className="mb-8">
            <div className={`w-32 h-32 mx-auto mb-6 transition-all duration-500 ease-out ${
              showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}>
              <div className="relative w-full h-full">
                {/* Animated Circle */}
                <div className={`absolute inset-0 rounded-full border-4 border-green-200 transition-all duration-500 ease-out ${
                  showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}></div>
                
                {/* Animated Check Mark */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 delay-200 ease-out ${
                  showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}>
                  <CheckCircle className="w-20 h-20 text-green-600" />
                </div>
                
                {/* Pulse Effect */}
                <div className={`absolute inset-0 rounded-full bg-green-100 animate-ping transition-all duration-500 delay-300 ${
                  showAnimation ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className={`mb-8 transition-all duration-500 delay-100 ease-out ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Thank you for your purchase
            </p>
            {orderId && (
              <p className="text-gray-500 text-sm">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>
            )}
            {orderAmount && (
              <p className="text-gray-500 text-sm">
                Amount: <span className="font-medium">₹{parseInt(orderAmount).toLocaleString('en-IN')}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-4 transition-all duration-500 delay-200 ease-out ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={() => router.push('/orders')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              My Orders
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>

          {/* Additional Info */}
          {/* <div className={`mt-8 p-4 bg-gray-100 rounded-lg transition-all duration-500 delay-300 ease-out ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-sm text-gray-600">
              You will receive an email confirmation shortly with order details and tracking information.
            </p>
          </div> */}
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center px-4">
        {/* Failed Animation */}
        <div className="mb-8">
          <div className={`w-32 h-32 mx-auto mb-6 transition-all duration-500 ease-out ${
            showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <div className="relative w-full h-full">
              {/* Animated Circle */}
              <div className={`absolute inset-0 rounded-full border-4 border-red-200 transition-all duration-500 ease-out ${
                showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}></div>
              
              {/* Animated X Mark */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 delay-200 ease-out ${
                showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <XCircle className="w-20 h-20 text-red-600" />
              </div>
              
              {/* Pulse Effect */}
              <div className={`absolute inset-0 rounded-full bg-red-100 animate-ping transition-all duration-500 delay-300 ${
                showAnimation ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Failed Message */}
        <div className={`mb-8 transition-all duration-500 delay-100 ease-out ${
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Transaction Failed
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Payment verification failed
          </p>
          <p className="text-gray-500 text-sm">
            Please try again or contact support if the issue persists.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-4 transition-all duration-500 delay-200 ease-out ${
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <Link
            href="/checkout/payment"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
