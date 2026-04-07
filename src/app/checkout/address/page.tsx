'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

import AddAddressPopup from '@/components/AddAddressPopup';
import OrderSummary from '@/components/OrderSummary';
import DeliveryAvailabilityIndicator from '@/components/DeliveryAvailabilityIndicator';
import { Plus, MapPin, Check, Edit, Trash2 } from 'lucide-react';
import { Address } from '@/lib/api';
import { useAppContext } from '@/contexts/AppContext';
import { AddressPageSkeleton } from '@/components/Skeleton';
import { useDeliveryAvailability } from '@/hooks/useDeliveryAvailability';
import { useAppSelector } from '@/store/hooks';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddressPage() {
  const { cart } = useAppContext();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [, setSuccess] = useState<string | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [, setDebugInfo] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if coming from profile page
  const fromProfile = searchParams.get('from') === 'profile';
  
  // Check if cart has items
  const cartItems = (cart as any)?.cart?.items || [];
  const hasCartItems = cartItems.length > 0;
  
  // Show Order Summary only if NOT from profile AND cart has items
  const showOrderSummary = !fromProfile && hasCartItems;
  
  // Reward Points State (read from localStorage)
  const [rewardPointsRedeemed, setRewardPointsRedeemed] = useState(false);
  const [rewardPointsAmount, setRewardPointsAmount] = useState(0);
  
  // Load reward points redemption from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRedeemed = localStorage.getItem('rewardPointsRedeemed');
      const savedAmount = localStorage.getItem('rewardPointsAmount');
      if (savedRedeemed === 'true' && savedAmount) {
        setRewardPointsRedeemed(true);
        setRewardPointsAmount(parseFloat(savedAmount));
      }
    }
  }, []);
  
  // Get selected frequently bought together items from Redux
  const selectedFrequentlyBoughtRedux = useAppSelector(state => state.cart.selectedFrequentlyBought || {});
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<{ [productId: string]: any[] }>({});
  
  // Convert Redux state to Set format for OrderSummary
  const selectedFrequentlyBought: { [cartItemId: string]: Set<string> } = {};
  if (selectedFrequentlyBoughtRedux && typeof selectedFrequentlyBoughtRedux === 'object') {
    Object.keys(selectedFrequentlyBoughtRedux).forEach(cartItemId => {
      selectedFrequentlyBought[cartItemId] = new Set(selectedFrequentlyBoughtRedux[cartItemId] || []);
    });
  }
  
  // Delivery availability hook
  const {
    deliveryData,
    isLoading: isCheckingDelivery,
    error: deliveryError,
    checkDeliveryAvailability,
    clearDeliveryData: _clearDeliveryData,
  } = useDeliveryAvailability();

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
   
      
      const response = await apiService.address.getAddresses();
      console.log('🔍 Addresses response:', response);
      
      if (response.success && response.addresses && Array.isArray(response.addresses)) {
        console.log('✅ Found addresses:', response.addresses.length);
        setAddresses(response.addresses);
        const defaultAddress = response.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
        setSuccess(`Successfully loaded ${response.addresses.length} address(es)`);
      } else {
        console.log('❌ No addresses found or invalid response');
        setAddresses([]);
        setSuccess('No addresses found');
      }
    } catch (error) {
      setError('Failed to fetch addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Fetch frequently bought together products
  useEffect(() => {
    const fetchFrequentlyBought = async () => {
      const cartItems = (cart as any)?.cart?.items || [];
      if (cartItems.length === 0) return;

      // Filter out items with null/undefined products
      const validItems = cartItems.filter((item: any) => item && item.product && item.product._id);
      if (validItems.length === 0) return;

      try {
        const productIds: string[] = validItems
          .map((item: any) => {
            const productId = item.product?._id;
            return typeof productId === 'string' ? productId : null;
          })
          .filter((id: string | null): id is string => id !== null && typeof id === 'string');
        const uniqueProductIds: string[] = Array.from(new Set(productIds));

        // Fetch full product details for each product to get frequentlyBoughtTogether
        const promises = uniqueProductIds.map(async (productId: string) => {
          try {
            const response = await apiService.products.getById(productId);
            if (response.success && response.data) {
              const product = response.data as any;
              return { 
                productId, 
                products: product.frequentlyBoughtTogether?.slice(0, 3) || [] 
              };
            }
            return { productId, products: [] };
          } catch (error) {
            return { productId, products: [] };
          }
        });

        const results = await Promise.all(promises);
        
        const frequentlyBoughtMap: { [key: string]: any[] } = {};
        results.forEach(({ productId, products }) => {
          if (products && products.length > 0) {
            frequentlyBoughtMap[productId as string] = products;
          }
        });
        
        setFrequentlyBoughtTogether(frequentlyBoughtMap);
      } catch (error) {
        // Silently handle errors
      }
    };

    if ((cart as any)?.cart?.items?.length > 0) {
      fetchFrequentlyBought();
    }
  }, [(cart as any)?.cart?.items]);

  // Check delivery availability when default address is selected
  useEffect(() => {
    if (selectedAddress && addresses.length > 0) {
      const address = addresses.find(addr => addr._id === selectedAddress);
      if (address) {
        checkDeliveryAvailability(address.pincode);
      }
    }
  }, [selectedAddress, addresses, checkDeliveryAvailability]);

  const handleAddressAdded = () => {
    fetchAddresses(); // Refresh the addresses list
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddress(addressId);
    
    // Find the selected address to get pincode
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      // Check delivery availability for the selected address
      checkDeliveryAvailability(address.pincode);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedAddress) {
      // Check if delivery is available before proceeding
      if (deliveryData && !deliveryData.isAvailable) {
        alert('Delivery is not available to the selected address. Please choose a different address.');
        return;
      }
      
      // Navigate to payment page with selected address
      router.push(`/checkout/payment?address=${selectedAddress}`);
      // window.location.href = `/checkout/payment?address=${selectedAddress}`;
    } else {
      alert('Please select an address to continue.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await apiService.address.setDefaultAddress(addressId);
      if (response.success) {
        await fetchAddresses(); // Refresh addresses
      }
    } catch (err) {
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await apiService.address.deleteAddress(addressId);
        if (response.success) {
          await fetchAddresses(); // Refresh addresses
          if (selectedAddress === addressId) {
            setSelectedAddress(null);
          }
        }
      } catch (err) {
      }
    }
  };



  if (isLoading) {
    return <AddressPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showOrderSummary ? 'Select Delivery Address' : 'My Addresses'}
            </h1>
            <p className="text-gray-600">
              {showOrderSummary 
                ? "Choose where you'd like your order to be delivered"
                : "Manage your delivery addresses"
              }
            </p>
          </div>

          <div className={`grid grid-cols-1 ${showOrderSummary ? 'md:grid-cols-12' : 'md:grid-cols-6'} gap-8`}>
            {/* Addresses List - 6 columns on medium screens and above if not showing order summary, 8 columns if showing order summary */}
            <div className={showOrderSummary ? "md:col-span-8" : "md:col-span-6"}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Your Addresses
                  </h2>
                </div>
                
                <div className="p-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                      <p className="text-gray-600 mb-6">Add your first delivery address to continue</p>
                      <button
                        onClick={() => setShowAddPopup(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedAddress === address._id
                              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-indigo-300 bg-white'
                          }`}
                          onClick={() => handleAddressSelection(address._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-semibold text-gray-900 text-lg">{address.name}</h3>
                                {address.isDefault && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Default
                                  </span>
                                )}
                                {selectedAddress === address._id && (
                                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {address.mobile}
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                              
                              {/* Delivery Availability for this address - only show for selected address */}
                              {selectedAddress === address._id && (
                                <div className="mt-3">
                                  <DeliveryAvailabilityIndicator
                                    deliveryData={deliveryData}
                                    isLoading={isCheckingDelivery}
                                    error={deliveryError}
                                    pincode={address.pincode}
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-6">
                              {!address.isDefault && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefault(address._id);
                                  }}
                                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="Set as default"
                                >
                                  <MapPin className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit (you can implement edit functionality later)
                                }}
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                                title="Edit address"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address._id);
                                }}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setShowAddPopup(true)}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer"
                      >
                        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add New Address</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          

            {/* Order Summary - Only show if NOT from profile AND cart has items */}
            {showOrderSummary && (
              <div className="md:col-span-4">
                <OrderSummary 
                  showCouponSection={false}
                  showProductItems={true}
                  showCheckoutButtons={false}
                  loading={false}
                  rewardPointsDiscount={rewardPointsAmount}
                  rewardPointsRedeemed={rewardPointsRedeemed}
                  selectedFrequentlyBought={selectedFrequentlyBought}
                  frequentlyBoughtTogether={frequentlyBoughtTogether}
                  customButtons={
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.history.back()}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-sm cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleProceedToPayment}
                        disabled={!selectedAddress || (deliveryData && !deliveryData.isAvailable) || isCheckingDelivery}
                        className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      >
                        {isCheckingDelivery 
                          ? 'Checking Delivery...' 
                          : !selectedAddress 
                            ? 'Select Address' 
                            : (deliveryData && !deliveryData.isAvailable)
                              ? 'Delivery Not Available'
                              : 'Proceed to Payment'
                        }
                      </button>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Address Popup */}
      <AddAddressPopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onAddressAdded={handleAddressAdded}
      />
    </div>
  );
}