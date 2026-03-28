'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Link from 'next/link';
import { OrderSummarySkeleton } from './Skeleton';
import { apiService } from '@/lib/api';
import { Star, Gift, Clock, AlertCircle, Tag, Percent, X } from 'lucide-react';
import { formatCurrency } from '@/lib/config';

interface OrderSummaryProps {
  showCouponSection?: boolean;
  showProductItems?: boolean;
  showCheckoutButtons?: boolean;
  showRewardPoints?: boolean;
  customButtons?: React.ReactNode;
  className?: string;
  loading?: boolean;
  rewardPointsDiscount?: number;
  rewardPointsRedeemed?: boolean;
  onRewardPointsRedeem?: (discountAmount: number) => void;
  onRewardPointsCancel?: () => void;
  selectedFrequentlyBought?: { [cartItemId: string]: Set<string> };
  frequentlyBoughtTogether?: { [productId: string]: any[] };
}

interface RewardPoints {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  expiryDate: string;
  isActive: boolean;
}

interface Warranty {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  coverage: string[];
  termsAndConditions?: string;
  image?: string;
}

interface CartItem {
  price: number | undefined;
  _id: string;
  product: {
    _id: string;
    productName: string;
    price: number;
    discountPrice?: number;
    images: string[];
  };
  variant?: {
    price?: number;
    discountPrice?: number;
    [key: string]: unknown;
  };
  quantity: number;
  warranty?: Warranty | string | null;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  discountAmount?: number;
  loading: boolean;
}

export default function OrderSummary({
  showCouponSection = true,
  showProductItems = true,
  showCheckoutButtons = false,
  showRewardPoints = true,
  customButtons,
  className = '',
  loading = false,
  rewardPointsDiscount = 0,
  rewardPointsRedeemed = false,
  onRewardPointsRedeem,
  onRewardPointsCancel,
  selectedFrequentlyBought = {},
  frequentlyBoughtTogether = {}
}: OrderSummaryProps) {
  const { cart: cartContext } = useAppContext();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponCodeError, setCouponCodeError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [giftVoucherCode, setGiftVoucherCode] = useState('');
  const [isApplyingGiftVoucher, setIsApplyingGiftVoucher] = useState(false);
  const [giftVoucherError, setGiftVoucherError] = useState<string | null>(null);
  
  // Available Promo Codes, Gift Vouchers, and Bank Offers State
  const [availablePromoCodes, setAvailablePromoCodes] = useState<any[]>([]);
  const [availableGiftVouchers, setAvailableGiftVouchers] = useState<any[]>([]);
  const [availableBankOffers, setAvailableBankOffers] = useState<any[]>([]);
  const [showPromoCodeList, setShowPromoCodeList] = useState(false);
  const [showGiftVoucherList, setShowGiftVoucherList] = useState(false);
  const [showBankOffersList, setShowBankOffersList] = useState(false);
  
  // Reward Points State
  const [rewardPoints, setRewardPoints] = useState<RewardPoints | null>(null);
  const [rewardPointsLoading, setRewardPointsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState('');
  const [rewardPointsError, setRewardPointsError] = useState<string | null>(null);
  const [isRedeemed, setIsRedeemed] = useState(rewardPointsRedeemed);

  // Sync internal state with prop
  useEffect(() => {
    setIsRedeemed(rewardPointsRedeemed);
  }, [rewardPointsRedeemed]);

  // Fetch reward points on component mount
  useEffect(() => {
    if (showRewardPoints) {
      fetchRewardPoints();
    }
  }, [showRewardPoints]);

  // Fetch available promo codes, gift vouchers, and bank offers
  useEffect(() => {
    if (showCouponSection) {
      console.log('🔄 OrderSummary: Fetching promo codes, gift vouchers, and bank offers...');
      fetchAvailablePromoCodes();
      fetchAvailableGiftVouchers();
      fetchAvailableBankOffers();
    }
  }, [showCouponSection]);

  // Refetch bank offers when cart total changes
  useEffect(() => {
    if (showCouponSection) {
      fetchAvailableBankOffers();
    }
  }, [(cartContext as any)?.cart?.subtotal, (cartContext as any)?.cart?.total]);

  const fetchAvailablePromoCodes = async () => {
    try {
      console.log('🔄 Fetching promo codes...');
      const response = await apiService.promo.getActivePromoCodes();
      console.log('📦 Promo codes response:', response);
      if (response.success && response.data) {
        console.log('✅ Promo codes fetched:', response.data.length);
        setAvailablePromoCodes(response.data);
      } else {
        console.log('❌ Promo codes fetch failed:', response.message);
        setAvailablePromoCodes([]);
      }
    } catch (error) {
      setAvailablePromoCodes([]);
    }
  };

  const fetchAvailableGiftVouchers = async () => {
    try {
      console.log('🔄 Fetching gift vouchers...');
      const response = await apiService.giftVoucher.getActiveGiftVouchers();
      console.log('📦 Gift vouchers response:', response);
      if (response.success && response.data) {
        console.log('✅ Gift vouchers fetched:', response.data.length);
        setAvailableGiftVouchers(response.data);
      } else {
        console.log('❌ Gift vouchers fetch failed:', response.message);
        setAvailableGiftVouchers([]);
      }
    } catch (error) {
      setAvailableGiftVouchers([]);
    }
  };

  const fetchAvailableBankOffers = async () => {
    try {
      const cartTotal = (cartContext as any)?.cart?.subtotal || (cartContext as any)?.cart?.total || 0;
      const response = await apiService.bankOffer.getBankOffers(cartTotal);
      if (response.success && response.data) {
        setAvailableBankOffers(response.data);
      }
    } catch (error) {
    }
  };

  const fetchRewardPoints = async () => {
    try {
      setRewardPointsLoading(true);
      const response = await apiService.rewardPoints.getUserRewardPoints();
      
      if (response.success && response.data) {
        setRewardPoints(response.data);
        // Reset input when reward points are loaded
        setPointsToRedeem(0);
        setPointsToRedeemInput('');
      }
    } catch (error) {
      setRewardPointsError('Failed to load reward points');
    } finally {
      setRewardPointsLoading(false);
    }
  };

  const handleRewardPointsRedeem = async () => {
    if (!rewardPoints || pointsToRedeem <= 0 || pointsToRedeem > rewardPoints.points) {
      return;
    }

    try {
      setRedeeming(true);
      const response = await apiService.rewardPoints.redeemRewardPoints({
        pointsToRedeem: pointsToRedeem
      });

      if (response.success && response.data) {
        setIsRedeemed(true);
        if (onRewardPointsRedeem) {
          onRewardPointsRedeem(response.data.discountAmount);
        }
        setRewardPoints((prev: RewardPoints | null) => prev && response.data ? {
          ...prev,
          points: response.data.remainingPoints,
          totalRedeemed: prev.totalRedeemed + response.data.pointsRedeemed
        } : prev);
        setPointsToRedeem(0);
        setPointsToRedeemInput('');
        if (typeof window !== 'undefined' && window.showToast && response.data) {
          window.showToast(`${response.data.pointsRedeemed} reward points redeemed successfully!`, 'success');
        }
      } else {
        setRewardPointsError(response.message || 'Failed to redeem points');
      }
    } catch (error) {
      setRewardPointsError('Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const handleRewardPointsCancel = () => {
    setIsRedeemed(false);
    setPointsToRedeem(0);
    setPointsToRedeemInput('');
    if (onRewardPointsCancel) {
      onRewardPointsCancel();
    }
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('Reward points redemption cancelled', 'info');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsApplyingCoupon(true);
      setCouponCodeError(null);
      await cartContext.applyCoupon(couponCode);
      setCouponCode('');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Coupon applied successfully!', 'success');
      }
    } catch (error) {
      // Extract error message - backend sends specific messages like "Coupon has expired", "Invalid or expired coupon", etc.
      let errorMessage = 'Invalid coupon code. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Show error message below input field (red color)
      setCouponCodeError(errorMessage);
      // Also show toast message for error
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      console.log('🔄 Removing coupon...');
      await cartContext.removeCoupon();
      console.log('✅ Coupon removed successfully');
      // Force cart refresh to update UI
      if (cartContext.fetchCart) {
        await cartContext.fetchCart();
      }
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Coupon removed successfully!', 'success');
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to remove coupon. Please try again.', 'error');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      setIsApplyingPromo(true);
      setPromoCodeError(null);
      console.log('🔄 Applying promo code:', promoCode);
      await cartContext.applyPromoCode(promoCode);
      console.log('✅ Promo code applied successfully');
      setPromoCode('');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Promo code applied successfully!', 'success');
      }
    } catch (error) {
      console.log({
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      const errorMessage = error instanceof Error ? error.message : 'Invalid promo code. Please try again.';
      setPromoCodeError(errorMessage);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = async () => {
    try {
      setPromoCodeError(null);
      await cartContext.removePromoCode();
      // Force cart refresh to update UI
      if (cartContext.fetchCart) {
        await cartContext.fetchCart();
      }
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Promo code removed successfully!', 'success');
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to remove promo code. Please try again.', 'error');
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleApplyGiftVoucher = async () => {
    if (!giftVoucherCode.trim()) return;

    try {
      setIsApplyingGiftVoucher(true);
      setGiftVoucherError(null);
      await cartContext.applyGiftVoucher(giftVoucherCode);
      setGiftVoucherCode('');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Gift voucher applied successfully!', 'success');
      }
    } catch (error) {
      // Extract error message - backend sends specific messages like "Gift voucher has expired", "Invalid or expired gift voucher", etc.
      let errorMessage = 'Invalid gift voucher code. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Show error message below input field (red color)
      setGiftVoucherError(errorMessage);
      // Also show toast message for error
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setIsApplyingGiftVoucher(false);
    }
  };

  const handleRemoveGiftVoucher = async () => {
    try {
      setGiftVoucherError(null);
      await cartContext.removeGiftVoucher();
      // Force cart refresh to update UI
      if (cartContext.fetchCart) {
        await cartContext.fetchCart();
      }
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Gift voucher removed successfully!', 'success');
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to remove gift voucher. Please try again.', 'error');
      }
    } finally {
      setIsApplyingGiftVoucher(false);
    }
  };

  // Show skeleton if loading
  if (loading) {
    return <OrderSummarySkeleton />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
      
      
      {/* Coupon Section */}
      {showCouponSection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Apply Coupon</h3>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponCodeError(null);
              }}
              placeholder="Enter coupon code"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm text-black ${
                couponCodeError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm cursor-pointer"
            >
              {isApplyingCoupon ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {couponCodeError && (
            <div className="mb-3 text-sm text-red-600">
              {couponCodeError}
            </div>
          )}
          
          {(cartContext as any)?.cart?.coupon && 
           (cartContext as any)?.cart?.coupon?.code && 
           (cartContext as any)?.cart?.coupon?.discount !== undefined && 
           (cartContext as any)?.cart?.coupon?.discount !== null && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  {(cartContext as any)?.cart?.coupon.code} - {(cartContext as any)?.cart?.coupon.couponType === 'percentage' || (cartContext as any)?.cart?.coupon.type === 'percentage' ? `${(cartContext as any)?.cart?.coupon.discount}% OFF` : `₹${(cartContext as any)?.cart?.coupon.discount} OFF`}
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Promo Code Section */}
      {showCouponSection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">Promo Code</h3>
          </div>
          
          {showPromoCodeList && availablePromoCodes.length > 0 && (
            <div className="mb-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {availablePromoCodes.map((promo: any) => (
                <div
                  key={promo._id}
                  onClick={() => {
                    setPromoCode(promo.code);
                    setShowPromoCodeList(false);
                  }}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{promo.code}</span>
                      {promo.name && (
                        <p className="text-xs text-gray-600 mt-0.5">{promo.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-blue-600">
                        {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
                      </span>
                      {promo.minimumAmount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">Min. ₹{promo.minimumAmount}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-black ${
                promoCodeError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoCodeError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && promoCode.trim() && !isApplyingPromo) {
                  e.preventDefault();
                  handleApplyPromoCode();
                }
              }}
            />
            <button
              onClick={handleApplyPromoCode}
              disabled={!promoCode.trim() || isApplyingPromo}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm cursor-pointer"
            >
              {isApplyingPromo ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {promoCodeError && (
            <div className="mb-3 text-sm text-red-600">
              {promoCodeError}
            </div>
          )}
          
          {(cartContext as any)?.cart?.promoCode && 
           (cartContext as any)?.cart?.promoCode?.code && 
           (cartContext as any)?.cart?.promoCode?.discount !== undefined && 
           (cartContext as any)?.cart?.promoCode?.discount !== null && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Applied: {(cartContext as any)?.cart?.promoCode.code}</p>
                  <p className="text-xs text-blue-700">
                    {(cartContext as any)?.cart?.promoCode.promoType === 'percentage' || (cartContext as any)?.cart?.promoCode.type === 'percentage' 
                      ? `${(cartContext as any)?.cart?.promoCode.discount}% OFF` 
                      : `₹${(cartContext as any)?.cart?.promoCode.discount} OFF`}
                  </p>
                </div>
                <button
                  onClick={handleRemovePromoCode}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gift Voucher Section */}
      {showCouponSection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-900">Gift Voucher</h3>
          </div>
          
          {showGiftVoucherList && availableGiftVouchers.length > 0 && (
            <div className="mb-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {availableGiftVouchers.map((voucher: any) => (
                <div
                  key={voucher._id}
                  onClick={() => {
                    setGiftVoucherCode(voucher.code);
                    setShowGiftVoucherList(false);
                  }}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{voucher.code}</span>
                      {voucher.name && (
                        <p className="text-xs text-gray-600 mt-0.5">{voucher.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-purple-600">
                        {voucher.type === 'percentage' ? `${voucher.value}% OFF` : `₹${voucher.value} OFF`}
                      </span>
                      {voucher.minimumAmount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">Min. {formatCurrency(voucher.minimumAmount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter gift voucher code"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm text-black ${
                giftVoucherError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={giftVoucherCode}
              onChange={(e) => {
                setGiftVoucherCode(e.target.value.toUpperCase());
                setGiftVoucherError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && giftVoucherCode.trim() && !isApplyingGiftVoucher) {
                  e.preventDefault();
                  handleApplyGiftVoucher();
                }
              }}
            />
            <button
              onClick={handleApplyGiftVoucher}
              disabled={!giftVoucherCode.trim() || isApplyingGiftVoucher}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm cursor-pointer"
            >
              {isApplyingGiftVoucher ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {giftVoucherError && (
            <div className="mb-3 text-sm text-red-600">
              {giftVoucherError}
            </div>
          )}
          
          {(cartContext as any)?.cart?.giftVoucher && 
           (cartContext as any)?.cart?.giftVoucher?.code && 
           (cartContext as any)?.cart?.giftVoucher?.discount !== undefined && 
           (cartContext as any)?.cart?.giftVoucher?.discount !== null && (
            <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Applied: {(cartContext as any)?.cart?.giftVoucher.code}</p>
                  <p className="text-xs text-purple-700">
                    {(cartContext as any)?.cart?.giftVoucher.voucherType === 'percentage' || (cartContext as any)?.cart?.giftVoucher.type === 'percentage' 
                      ? `${(cartContext as any)?.cart?.giftVoucher.discount}% OFF` 
                      : `₹${(cartContext as any)?.cart?.giftVoucher.discount} OFF`}
                  </p>
                </div>
                <button
                  onClick={handleRemoveGiftVoucher}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bank Offers Section */}
      {showCouponSection && availableBankOffers.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-medium text-gray-900">Bank Offers</h3>
            </div>
            <span className="text-xs text-gray-500">{availableBankOffers.length} offers</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableBankOffers.slice(0, 4).map((offer: any) => (
              <div
                key={offer.id}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {offer.bank} {offer.discount}% OFF
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Reward Points Section */}
      {showRewardPoints && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Reward Points</h3>
          
          {rewardPointsLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ) : rewardPointsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-red-600 text-sm">{rewardPointsError}</p>
              <button 
                onClick={fetchRewardPoints}
                className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : !rewardPoints || rewardPoints.points === 0 ? (
            <div className="text-center py-4">
              <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No reward points available</p>
              <p className="text-gray-500 text-xs mt-1">
                Earn 1% reward points on every delivered order
              </p>
            </div>
          ) : isRedeemed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-sm font-medium">
                    Points Redeemed
                  </span>
                </div>
                <span className="text-green-700 text-sm font-bold">
                  -{formatCurrency(rewardPointsDiscount)}
                </span>
              </div>
              <button 
                onClick={handleRewardPointsCancel}
                className="text-green-600 hover:text-green-700 text-xs underline mt-1"
              >
                Cancel redemption
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Available Points</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {rewardPoints.points} points
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={rewardPoints.points}
                  value={pointsToRedeemInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for better UX
                    if (value === '') {
                      setPointsToRedeemInput('');
                      setPointsToRedeem(0);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setPointsToRedeemInput(value);
                        setPointsToRedeem(numValue);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    // Select all text when focused if value is 0
                    if (pointsToRedeem === 0 && pointsToRedeemInput === '0') {
                      e.target.select();
                    }
                  }}
                  onBlur={(e) => {
                    // If empty, set to 0
                    if (e.target.value === '') {
                      setPointsToRedeemInput('');
                      setPointsToRedeem(0);
                    } else {
                      const numValue = parseInt(e.target.value) || 0;
                      setPointsToRedeemInput(numValue.toString());
                      setPointsToRedeem(numValue);
                    }
                  }}
                  placeholder="Enter points to redeem"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                />
                <button
                  onClick={handleRewardPointsRedeem}
                  disabled={redeeming || pointsToRedeem <= 0 || pointsToRedeem > rewardPoints.points}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
                >
                  {redeeming ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </div>
                  ) : (
                    'Redeem'
                  )}
                </button>
              </div>

              {pointsToRedeem > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
                  You&apos;ll get {formatCurrency(pointsToRedeem)} discount
                </div>
              )}
            </div>
          )}
        </div>
      )}


      
      {/* Product Items Section */}
      {showProductItems && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">Product Items</h3>
          <div className="space-y-3">
            {(cartContext as any)?.cart?.items?.map((item: CartItem, index: number) => {
              const productName = item?.product?.productName || 'Product';
              
              // Get variant price if variant exists, otherwise use product price
              const variantPrice = item.variant && typeof item.variant === 'object' && 'price' in item.variant 
                ? item.variant.price 
                : item?.product?.price || 0;
              const variantDiscountPrice = item.variant && typeof item.variant === 'object' && 'discountPrice' in item.variant 
                ? item.variant.discountPrice 
                : item?.product?.discountPrice;
              
              const originalPrice = variantPrice || 0;
              const discountPrice = variantDiscountPrice || originalPrice;
              const quantity = item?.quantity || 1;
              const hasDiscount = variantDiscountPrice && variantDiscountPrice < originalPrice;
              
              return (
                <div key={item._id || index} className="flex justify-between items-start">
                  <div className="flex-1 pr-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {productName} {quantity > 1 && <span className="text-gray-500">× {quantity}</span>}
                    </div>
                    
                    {/* Variant Information */}
                    {typeof item.variant === 'object' && item.variant !== null && !Array.isArray(item.variant) && Object.keys(item.variant).length > 0 && (
                      <div className="mb-2">
                        
                 
                        {/* Variant Attributes */}
                        <div className="flex flex-wrap gap-1">
                          {/* Handle nested attributes object */}
                          {item.variant.attributes && typeof item.variant.attributes === 'object' ? (
                            Object.entries(item.variant.attributes).map(([key, value], attrIndex) => (
                              <span key={attrIndex} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {typeof value === 'string' || typeof value === 'number' ? value : ''}
                              </span>
                            ))
                          ) : (
                            /* Fallback: Handle direct attributes */
                            Object.entries(item.variant)
                              .filter(([key]) => key !== 'price' && key !== 'stock' && key !== 'discountPrice' && key !== 'variantName' && key !== 'attributes' && key !== 'sku')
                              .map(([key, value], attrIndex) => (
                                <span key={attrIndex} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  {typeof value === 'string' || typeof value === 'number' ? value : ''}
                                </span>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(discountPrice))}</span>
                          <span className="text-sm text-gray-500 line-through">{formatCurrency(Math.round(originalPrice))}</span>
                          <span className="text-xs text-green-600 font-medium">
                            {Math.round(((originalPrice - discountPrice) / originalPrice) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(originalPrice))}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(() => {
                        const productTotal = Math.round(discountPrice * quantity);
                        const warrantyPrice = item.warranty && typeof item.warranty === 'object' 
                          ? Math.round((item.warranty as Warranty).price * quantity) 
                          : 0;
                        return formatCurrency(productTotal + warrantyPrice);
                      })()}
                    </div>
                    {hasDiscount && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatCurrency(Math.round(originalPrice * quantity))}
                      </div>
                    )}
                    {item.warranty && typeof item.warranty === 'object' && (
                      <div className="text-xs text-indigo-600 mt-0.5">
                        + Warranty {formatCurrency(Math.round((item.warranty as Warranty).price * quantity))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Coupon Discount */}
      {(() => {
        const cart = (cartContext as any)?.cart;
        if (!cart?.coupon) return null;
        
        // Calculate coupon discount from coupon value and type
        const cartItems = cart?.items || [];
        let productTotal = 0;
        let warrantyTotal = 0;
        
        cartItems.forEach((item: CartItem) => {
          const variantPrice = item.variant && typeof item.variant === 'object' && 'price' in item.variant 
            ? item.variant.price 
            : item?.product?.price || 0;
          const variantDiscountPrice = item.variant && typeof item.variant === 'object' && 'discountPrice' in item.variant 
            ? item.variant.discountPrice 
            : item?.product?.discountPrice;
          // Prioritize discount price over original price for total calculation
          const rawItemPrice = variantDiscountPrice || item?.price || variantPrice || 0;
          const itemPrice = Math.round(rawItemPrice);
          const quantity = item?.quantity || 1;
          productTotal += (itemPrice * quantity);
          
          if (item.warranty && typeof item.warranty === 'object') {
            const warrantyPrice = Math.round((item.warranty as Warranty).price);
            warrantyTotal += (warrantyPrice * quantity);
          }
        });
        
        const subtotalForCoupon = productTotal + warrantyTotal;
        const coupon = cart.coupon;
        const couponType = coupon.couponType || coupon.type;
        let couponDiscount = 0;
        
        if (couponType === 'percentage') {
          couponDiscount = Math.round((subtotalForCoupon * coupon.discount) / 100);
        } else {
          couponDiscount = Math.round(coupon.discount);
        }
        
        if (couponDiscount > 0) {
          return (
            <div className="flex justify-between text-sm text-green-600 mb-3 py-2 border-b border-gray-100">
              <span>Coupon Discount</span>
              <span>-₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          );
        }
        return null;
      })()}

      {/* Promo Code Discount */}
      {(() => {
        const cart = (cartContext as any)?.cart;
        if (!cart?.promoCode || !cart?.promoCode?.discount) return null;
        
        const promoCodeDiscount = Math.round(cart.promoCode.discount);
        
        if (promoCodeDiscount > 0) {
          return (
            <div className="flex justify-between text-sm text-blue-600 mb-3 py-2 border-b border-gray-100">
              <span>Promo Code Discount</span>
              <span>-₹{promoCodeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          );
        }
        return null;
      })()}

      {/* Gift Voucher Discount */}
      {(() => {
        const cart = (cartContext as any)?.cart;
        if (!cart?.giftVoucher || !cart?.giftVoucher?.discount) return null;
        
        const giftVoucherDiscount = Math.round(cart.giftVoucher.discount);
        
        if (giftVoucherDiscount > 0) {
          return (
            <div className="flex justify-between text-sm text-purple-600 mb-3 py-2 border-b border-gray-100">
              <span>Gift Voucher Discount</span>
              <span>-₹{giftVoucherDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          );
        }
        return null;
      })()}

      {/* Reward Points Discount */}
      {rewardPointsDiscount > 0 && (
        <div className="flex justify-between items-center text-sm text-green-600 mb-3 py-2 border-b border-gray-100">
          <span>Reward Points Discount</span>
          <div className="flex items-center gap-2">
            <span>-₹{rewardPointsDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {onRewardPointsCancel && (
              <button
                onClick={handleRewardPointsCancel}
                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                title="Remove reward points discount"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Frequently Bought Together Total */}
      {(() => {
        let frequentlyBoughtTotal = 0;
        let itemCount = 0;
        const processedProducts = new Set<string>(); // Track processed products to avoid double counting
        
        Object.entries(selectedFrequentlyBought).forEach(([cartItemId, productIds]) => {
          // Convert Set to Array if needed
          const productIdsArray = productIds instanceof Set ? Array.from(productIds) : (Array.isArray(productIds) ? productIds : []);
          productIdsArray.forEach((productId) => {
            // Skip if already processed
            if (processedProducts.has(productId)) return;
            
            // Search through all frequently bought together arrays
            for (const [, products] of Object.entries(frequentlyBoughtTogether)) {
              const product = products.find((p: any) => {
                if (!p) return false;
                // Match by _id (string comparison)
                if (p._id && String(p._id) === String(productId)) return true;
                // Match by sku
                if (p.sku && String(p.sku) === String(productId)) return true;
                return false;
              });
              
              if (product) {
                const price = product.discountPrice || product.price || 0;
                frequentlyBoughtTotal += Math.round(price);
                itemCount++;
                processedProducts.add(productId); // Mark as processed
                break; // Found the product, no need to search in other arrays
              }
            }
          });
        });
        
        if (itemCount > 0 && frequentlyBoughtTotal > 0) {
          return (
            <div className="flex justify-between text-sm text-indigo-600 mb-3 py-2 border-b border-gray-100">
              <span>Frequently Bought Together ({itemCount} item{itemCount > 1 ? 's' : ''})</span>
              <span>+{formatCurrency(frequentlyBoughtTotal)}</span>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Total Amount */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total Amount</span>
          <span>₹{(() => {
            // Always calculate using discount prices (discountPrice if available, otherwise regular price)
            const cartItems = (cartContext as any)?.cart?.items || [];
            
            let productTotal = 0;
            let warrantyTotal = 0;
            
            // Calculate product and warranty totals separately for debugging
            cartItems.forEach((item: CartItem) => {
              // Use variant price if variant exists, otherwise use product price
              const variantPrice = item.variant && typeof item.variant === 'object' && 'price' in item.variant 
                ? item.variant.price 
                : item?.product?.price || 0;
              const variantDiscountPrice = item.variant && typeof item.variant === 'object' && 'discountPrice' in item.variant 
                ? item.variant.discountPrice 
                : item?.product?.discountPrice;
              
              // Prioritize discount price for total calculation
              // Use discount price first, then item price, then variant price
              const rawItemPrice = variantDiscountPrice || item?.price || variantPrice || 0;
              const itemPrice = Math.round(rawItemPrice);
              const quantity = item?.quantity || 1;
              
              // Product total
              productTotal += (itemPrice * quantity);
              
              // Warranty total
              if (item.warranty && typeof item.warranty === 'object') {
                const warrantyPrice = Math.round((item.warranty as Warranty).price);
                warrantyTotal += (warrantyPrice * quantity);
              }
            });
            
            // Calculate frequently bought together total
            let frequentlyBoughtTotal = 0;
            const processedProducts = new Set<string>(); // Track processed products to avoid double counting
            
            Object.entries(selectedFrequentlyBought).forEach(([cartItemId, productIds]) => {
              // Convert Set to Array if needed
              const productIdsArray = productIds instanceof Set ? Array.from(productIds) : (Array.isArray(productIds) ? productIds : []);
              productIdsArray.forEach((productId) => {
                // Skip if already processed
                if (processedProducts.has(productId)) return;
                
                // Search through all frequently bought together arrays
                for (const [, products] of Object.entries(frequentlyBoughtTogether)) {
                  const product = products.find((p: any) => {
                    if (!p) return false;
                    // Match by _id (string comparison)
                    if (p._id && String(p._id) === String(productId)) return true;
                    // Match by sku
                    if (p.sku && String(p.sku) === String(productId)) return true;
                    return false;
                  });
                  
                  if (product) {
                    const price = product.discountPrice || product.price || 0;
                    frequentlyBoughtTotal += Math.round(price);
                    processedProducts.add(productId); // Mark as processed
                    break; // Found the product, no need to search in other arrays
                  }
                }
              });
            });
            
            // Calculate discounts separately
            const cart = (cartContext as any)?.cart;
            
            // Calculate coupon discount from coupon value and type
            let couponDiscount = 0;
            if (cart?.coupon && cart?.coupon?.discount !== undefined) {
              const coupon = cart.coupon;
              const couponType = coupon.couponType || coupon.type;
              const subtotalForCoupon = productTotal + warrantyTotal;
              if (couponType === 'percentage') {
                couponDiscount = Math.round((subtotalForCoupon * coupon.discount) / 100);
              } else {
                couponDiscount = Math.round(coupon.discount);
              }
            }
            
            // Get promo code discount (already calculated amount)
            const promoCodeDiscount = cart?.promoCode?.discount 
              ? Math.round(cart.promoCode.discount) 
              : 0;
            
            // Get gift voucher discount (already calculated amount)
            const giftVoucherDiscount = cart?.giftVoucher?.discount 
              ? Math.round(cart.giftVoucher.discount) 
              : 0;
            
            const rewardDiscount = Math.round(rewardPointsDiscount);
            
            const subtotal = productTotal + warrantyTotal + frequentlyBoughtTotal;
            const finalTotal = Math.round(subtotal - couponDiscount - promoCodeDiscount - giftVoucherDiscount - rewardDiscount);
            
            return formatCurrency(Math.max(0, finalTotal));
          })()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
      </div>
      
      {/* Custom Buttons or Default Checkout Buttons */}

      {customButtons ? (
        <div className="mt-6">
          {customButtons}
        </div>
      ) : showCheckoutButtons ? (
        <div className="mt-6 flex space-x-3">
          <Link 
            href="/"
            className="flex-1 text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
          >
            Back
          </Link>
          <Link 
            href="/checkout/address"
            className="flex-1 text-center bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm text-sm cursor-pointer"
          >
            Proceed
          </Link>
        </div>
      ) : null}
    
    </div>
  );
}
