'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import ReferralCode from '@/components/ReferralCode';
import EditProfileModal from '@/components/EditProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { TextSkeleton } from '@/components/Skeleton';

import { User, Settings, Gift, ShoppingBag, Heart, MapPin, Shield, Calendar, Package, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import AddAddressPopup from '@/components/AddAddressPopup';
import { formatCurrency, formatNumber } from '@/lib/config';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferred: 0,
    activeReferrals: 0,
    potentialEarnings: 0
  });
  const [addresses, setAddresses] = useState<Array<{
    _id: string;
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    addressType?: string;
  }>>([]);
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [editingAddress, setEditingAddress] = useState<{
    _id: string;
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    addressType?: string;
  } | null>(null);
  const [profileData, setProfileData] = useState<{
    _id: string;
    name: string;
    email: string;
    mobile: string;
    profilePicture?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [warranties, setWarranties] = useState<Array<{
    warrantyId: string;
    warrantyName: string;
    warrantyDescription: string;
    duration: number;
    price: number;
    coverage: string[];
    productId: string;
    productName: string;
    productImage: string | null;
    orderId: string;
    orderNumber: string;
    purchaseDate: string;
    expiryDate: string;
    status: 'active' | 'expired';
    daysRemaining: number;
  }>>([]);
  const [warrantiesLoading, setWarrantiesLoading] = useState(false);
  const [rewardPoints, setRewardPoints] = useState({
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    expiryDate: null as Date | null
  });
  const [rewardPointsLoading, setRewardPointsLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Array<{
    _id: string;
    subject: string;
    message: string;
    status: string;
    adminResponse?: string;
    repliedAt?: string;
    createdAt: string;
  }>>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [userReviews, setUserReviews] = useState<Array<{
    _id: string;
    product: {
      _id: string;
      productName: string;
      images: string[];
    };
    ratings: {
      overall: number;
      valueForMoney?: number;
      quality?: number;
      delivery?: number;
      packaging?: number;
      customerService?: number;
    };
    title?: string;
    comment?: string;
    images?: string[];
    createdAt: string;
  }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!authLoading) {
      if (isAuthenticated) {
        const loadData = async () => {
          await Promise.all([fetchProfile(), fetchReferralStats(), fetchAddresses(), fetchWarranties(), fetchRewardPoints(), fetchEnquiries(), fetchUserReviews()]);
          setPageLoading(false);
        };
        loadData();
      } else {
        setPageLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      console.log('Fetching user profile...');
      const response = await apiService.profile.getUserProfile();
      console.log('Profile response:', response);
      if (response.success && response.data) {
        setProfileData({
          _id: response.data.user.id || '',
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          mobile: response.data.user.phone || '',
          profilePicture: undefined
        });
      }
    } catch (error) {
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.referral.getReferralStats();
      if (response.success && response.data) {
        setReferralStats(response.data);
      } else {
        // If API call failed, set default values to prevent errors
        console.warn('Failed to fetch referral stats:', response.message);
        setReferralStats({
          totalReferred: 0,
          activeReferrals: 0,
          potentialEarnings: 0
        });
      }
    } catch (error) {
      // Set default values on error to prevent UI issues
      setReferralStats({
        totalReferred: 0,
        activeReferrals: 0,
        potentialEarnings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await apiService.address.getAddresses();
      if (response.success && response.addresses) {
        setAddresses(response.addresses);
      }
    } catch (error) {
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleEditAddress = (address: typeof addresses[0]) => {
    setEditingAddress(address);
    setShowAddAddressPopup(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await apiService.address.deleteAddress(addressId);
      if (response.success) {
        // Refresh addresses list
        await fetchAddresses();
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Address deleted successfully', 'success');
        }
      } else {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast(response.message || 'Failed to delete address', 'error');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to delete address', 'error');
      }
    }
  };

  const handleAddressAdded = () => {
    setShowAddAddressPopup(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleCloseAddressPopup = () => {
    setShowAddAddressPopup(false);
    setEditingAddress(null);
  };

  const fetchWarranties = async () => {
    setWarrantiesLoading(true);
    try {
      const response = await apiService.warranty.getUserWarranties();
      if (response.success && response.data) {
        setWarranties(response.data);
      }
    } catch (error) {
    } finally {
      setWarrantiesLoading(false);
    }
  };

  const fetchRewardPoints = async () => {
    setRewardPointsLoading(true);
    try {
      const response = await apiService.rewardPoints.getUserRewardPoints();
      console.log('Reward Points Response:', response);
      if (response.success && response.data) {
        setRewardPoints({
          points: response.data.points || 0,
          totalEarned: response.data.totalEarned || 0,
          totalRedeemed: response.data.totalRedeemed || 0,
          expiryDate: response.data.expiryDate ? new Date(response.data.expiryDate) : null
        });
      } else {
        console.warn('Reward points fetch failed:', response.message);
        // Set default values if fetch fails
        setRewardPoints({
          points: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          expiryDate: null
        });
      }
    } catch (error) {
      console.error('Error fetching reward points:', error);
      // Set default values on error
      setRewardPoints({
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        expiryDate: null
      });
    } finally {
      setRewardPointsLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const { getApiUrl, getAuthHeaders } = await import('@/lib/config');
      const response = await fetch(getApiUrl('/web/enquiries/my-enquiries'), {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEnquiries(data.data);
        }
      }
    } catch (error) {
    } finally {
      setEnquiriesLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await apiService.rating.getUserRatings();
      if (response.success && response.data) {
        // Transform the API response to match the expected state structure
        const transformedReviews = (response.data.ratings || []).map((rating: any) => ({
          _id: rating._id,
          product: {
            _id: rating.product?._id || rating.productId || '',
            productName: rating.product?.productName || '',
            images: rating.product?.images || []
          },
          ratings: {
            overall: rating.ratings?.overall || 0,
            valueForMoney: rating.ratings?.valueForMoney,
            quality: rating.ratings?.quality,
            delivery: rating.ratings?.delivery,
            packaging: rating.ratings?.packaging,
            customerService: rating.ratings?.customerService
          },
          title: rating.title,
          comment: rating.comment || rating.review || '',
          images: rating.images || [],
          createdAt: rating.createdAt || new Date().toISOString()
        }));
        setUserReviews(transformedReviews);
      }
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt only after auth loading is complete and user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your profile</h2>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton loading while page data is loading
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Information Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="ml-4">
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </div>

                {/* Addresses Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2"></div>
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
                    </div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-32"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
                  </div>
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="space-y-6">
                {/* Referral Stats Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                  </div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded w-full mt-4"></div>
                </div>

                {/* Account Settings Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                  </div>
                </div>

                {/* Quick Actions Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">Your personal details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 text-gray-900">
                    {profileLoading ? (
                      <TextSkeleton className="h-4 w-32" />
                    ) : (
                      profileData?.name || 'Not provided'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1 text-gray-900">
                    {profileLoading ? (
                      <TextSkeleton className="h-4 w-48" />
                    ) : (
                      profileData?.email || user?.email || 'Not provided'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 text-gray-900">
                    {profileLoading ? (
                      <TextSkeleton className="h-4 w-32" />
                    ) : (
                      profileData?.mobile || 'Not provided'
                    )}
                  </div>
                </div>
              </div>

              {/* Show Edit button if full name or phone number is not provided */}
              {!profileData?.name || !profileData?.mobile ? (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setIsEditProfileOpen(true)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
                  >
                    Complete Your Profile
                  </button>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setIsEditProfileOpen(true)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/orders" 
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <ShoppingBag className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">My Orders</h3>
                    <p className="text-sm text-gray-600">View order history</p>
                  </div>
                </Link>
                
                <Link 
                  href="/wishlist" 
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Heart className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Wishlist</h3>
                    <p className="text-sm text-gray-600">Saved items</p>
                  </div>
                </Link>
                
                <Link 
                  href="/cart" 
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <ShoppingBag className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Shopping Cart</h3>
                    <p className="text-sm text-gray-600">View cart items</p>
                  </div>
                </Link>
                
                <button 
                  onClick={() => setIsReferralModalOpen(true)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors text-left cursor-pointer"
                >
                  <Gift className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Refer a Friend</h3>
                    <p className="text-sm text-gray-600">Earn reward points</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
                    <p className="text-gray-600">Manage your delivery addresses</p>
                  </div>
                </div>
                <Link 
                  href="/checkout/address?from=profile" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  Add New Address
                </Link>
              </div>
              
              {addressesLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-gray-900">{address.name}</span>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Default
                              </span>
                            )}
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {address.addressType}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{address.mobile}</p>
                          <p className="text-gray-600 text-sm">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-gray-600 text-sm">{address.country}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button 
                            onClick={() => handleEditAddress(address)}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No addresses saved yet</p>
                  <p className="text-sm">Add your first delivery address</p>
                </div>
              )}
            </div>

            {/* Extended Warranties Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Extended Warranties</h2>
                    <p className="text-gray-600">View your purchased warranty plans</p>
                  </div>
                </div>
              </div>
              
              {warrantiesLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : warranties.length > 0 ? (
                <div className="space-y-4">
                  {warranties.map((warranty, index) => (
                    <div key={`${warranty.orderId}-${warranty.warrantyId}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {warranty.productImage ? (
                          <div className="flex-shrink-0">
                            <img
                              src={warranty.productImage}
                              alt={warranty.productName}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Warranty Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{warranty.productName}</h3>
                              <p className="text-sm text-gray-600 mt-1">{warranty.warrantyName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              warranty.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {warranty.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          
                          {warranty.warrantyDescription && (
                            <p className="text-sm text-gray-600 mb-2">{warranty.warrantyDescription}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium text-gray-900">{warranty.duration} months</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(warranty.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Purchase Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(warranty.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  {warranty.status === 'active' ? 'Expires On' : 'Expired On'}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(warranty.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {warranty.status === 'active' && warranty.daysRemaining > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">{warranty.daysRemaining}</span> days remaining
                              </p>
                            </div>
                          )}
                          
                          {warranty.coverage && warranty.coverage.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Coverage:</p>
                              <div className="flex flex-wrap gap-2">
                                {warranty.coverage.map((item, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Link 
                              href={`/orders/${warranty.orderId}`}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              View Order #{warranty.orderNumber}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No extended warranties found</p>
                  <p className="text-sm">Purchase products with extended warranty to see them here</p>
                </div>
              )}
            </div>

            {/* My Reviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <svg className="w-6 h-6 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">My Reviews</h2>
                  <p className="text-gray-600">Reviews you&apos;ve written</p>
                </div>
              </div>
              
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : userReviews.length > 0 ? (
                <div className="space-y-4">
                  {userReviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {review.product?.images && review.product.images.length > 0 ? (
                          <div className="flex-shrink-0">
                            <img
                              src={review.product.images[0]}
                              alt={review.product.productName}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Review Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link 
                                href={`/product/${review.product?._id}`}
                                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                              >
                                {review.product?.productName || 'Product'}
                              </Link>
                              {review.title && (
                                <p className="text-sm text-gray-700 mt-1 font-medium">{review.title}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (review.ratings?.overall || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-3">{review.comment}</p>
                          )}
                          
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {review.images.slice(0, 3).map((image, idx) => (
                                <img
                                  key={idx}
                                  src={image}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-200"
                                />
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <p>No reviews yet</p>
                  <p className="text-sm">Review products you&apos;ve purchased</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Referral Stats</h3>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Referred</span>
                    <span className="font-semibold text-gray-900">{referralStats.totalReferred}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Referrals</span>
                    <span className="font-semibold text-gray-900">{referralStats.activeReferrals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Points Earned</span>
                    <span className="font-semibold text-gray-900">{referralStats.potentialEarnings}</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setIsReferralModalOpen(true)}
                className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
              >
                Refer a Friend
              </button>
            </div>

            {/* My Enquiries */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">My Enquiries</h3>
              </div>
              
              {enquiriesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading enquiries...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No enquiries yet</p>
                  <p className="text-sm text-gray-500 mt-2">Your enquiries and replies will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {enquiries.map((enquiry) => (
                    <div key={enquiry._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{enquiry.subject}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          enquiry.status === 'replied' 
                            ? 'bg-green-100 text-green-800' 
                            : enquiry.status === 'resolved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enquiry.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
                      </div>
                      
                      {enquiry.adminResponse && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-green-700">Admin Reply</span>
                            {enquiry.repliedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(enquiry.repliedAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{enquiry.adminResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                >
                  Change Password
                </button>
                <hr className="my-2" />
                <button 
                  onClick={() => setIsDeleteAccountOpen(true)}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Reward Points Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Reward Points</h3>
              </div>
              
              {rewardPointsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reward points...</p>
                </div>
              ) : (
                <>
                  <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(rewardPoints.points)}</div>
                    <div className="text-sm text-gray-600">Available Points</div>
                    {rewardPoints.expiryDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires: {rewardPoints.expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {!rewardPoints.expiryDate && rewardPoints.points > 0 && (
                      <div className="text-xs text-gray-500 mt-1">Expires in 6 months</div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earned</span>
                      <span className="font-medium">{formatNumber(rewardPoints.totalEarned)} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Redeemed</span>
                      <span className="font-medium">{formatNumber(rewardPoints.totalRedeemed)} points</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/cart" 
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center block"
                  >
                    Redeem Points
                  </Link>
                </>
              )}
            </div>


          </div>
        </div>
      </div>
      </div>

      {/* Modals */}
      <ReferralCode 
        isOpen={isReferralModalOpen} 
        onClose={() => setIsReferralModalOpen(false)} 
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={() => {
          // Refresh profile data
          fetchProfile();
        }}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
      <AddAddressPopup
        isOpen={showAddAddressPopup}
        onClose={handleCloseAddressPopup}
        onAddressAdded={handleAddressAdded}
        initialAddress={editingAddress}
      />
    </div>
  );
}
