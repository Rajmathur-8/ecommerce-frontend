'use client';

declare global {
  interface Window {
    showToast?: (message: string, type: string, duration?: number) => void;
  }
}

import { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Home, Map, Hash, Building, Globe } from 'lucide-react';
import { apiService, AddressFormData } from '@/lib/api';
import { useAppContext } from '@/contexts/AppContext';
import GoogleMapAddress from './GoogleMapAddress';

interface AddAddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressAdded: () => void;
  initialAddress?: {
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
  } | null;
}

export default function AddAddressPopup({ isOpen, onClose, onAddressAdded, initialAddress }: AddAddressPopupProps) {
  const { auth } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddressFormData>({
    name: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (initialAddress) {
      setFormData({
        name: initialAddress.name || '',
        mobile: initialAddress.mobile || '',
        addressLine1: initialAddress.addressLine1 || '',
        addressLine2: initialAddress.addressLine2 || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        pincode: initialAddress.pincode || '',
        country: initialAddress.country || 'India',
        addressType: initialAddress.addressType || 'Home',
        isDefault: initialAddress.isDefault || false,
      });
    } else {
      // Reset form when adding new address
      setFormData({
        name: '',
        mobile: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'Home',
        isDefault: false,
      });
    }
  }, [initialAddress, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for mobile number validation
    if (name === 'mobile') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: limitedValue
      }));
      
      // Validate mobile number
      if (limitedValue.length > 0 && limitedValue.length !== 10) {
        setMobileError('Mobile number must be exactly 10 digits');
      } else {
        setMobileError(null);
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleMapAddressSelect = (addressData: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }) => {
    console.log('📍 Address data received in AddAddressPopup:', addressData);
    
    // Automatically fill all address fields
    setFormData(prev => ({
      ...prev,
      addressLine1: addressData.addressLine1 || prev.addressLine1,
      city: addressData.city || prev.city,
      state: addressData.state || prev.state,
      pincode: addressData.pincode || prev.pincode
    }));
    
    // Show success message
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('Address automatically filled! ✅', 'success', 2000);
    }
    
    console.log('✅ Form data updated with address:', {
      addressLine1: addressData.addressLine1,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode
    });
    
    // Don't close the map automatically - let user verify the location
    // setShowMap(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setMobileError(null);

    // Validate mobile number before submission
    if (formData.mobile.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      setIsLoading(false);
      return;
    }

    try {
      console.log('=== ADDRESS SUBMISSION DEBUG ===');
      console.log('Submitting address data:', formData);
      console.log('Token from localStorage:', localStorage.getItem('authToken') ? localStorage.getItem('authToken')?.substring(0, 20) + '...' : 'No token in localStorage');
      console.log('API Service has token:', apiService.hasToken());
      
      // Check if user is authenticated
      if (!auth.isAuthenticated) {
        setError('You are not authenticated. Please login first.');
        return;
      }
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      console.log('User is authenticated:', auth.isAuthenticated);
      console.log('User data:', auth.user);
      
      // Decode JWT token to see what's in it
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT Token payload:', payload);
        }
      } catch (error) {
      }
      
      console.log('Authentication successful, proceeding with address creation...');
      
      console.log('Submitting address data:', formData);
      
      let response;
      if (initialAddress && initialAddress._id) {
        // Update existing address
        response = await apiService.address.updateAddress(initialAddress._id, formData);
        console.log('Address update API response:', response);
        if (response.success) {
          setSuccess('Address updated successfully!');
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Address updated successfully!', 'success', 3000);
          }
        }
      } else {
        // Create new address
        response = await apiService.address.addAddress(formData);
        console.log('Address API response:', response);
        if (response.success && response.address) {
          setSuccess('Address added successfully!');
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Address added successfully!', 'success', 3000);
          }
        }
      }
      
      if (response && response.success) {
        
        setFormData({
          name: '',
          mobile: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          addressType: 'Home',
          isDefault: false,
        });
        setMobileError(null);
        
        // Close popup after 1 second
        setTimeout(() => {
          onAddressAdded();
          onClose();
        }, 1000);
      } else {
        setError('Failed to add address. Please try again.');
      }
    } catch {
      setError('An error occurred while adding the address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        mobile: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'Home',
        isDefault: false,
      });
      setError(null);
      setSuccess(null);
      setMobileError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              required
              disabled={isLoading}
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Phone className="w-4 h-4" />
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter your 10-digit mobile number"
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black ${
                mobileError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {mobileError && (
              <p className="text-sm text-red-600 mt-1">{mobileError}</p>
            )}
            {!mobileError && formData.mobile.length > 0 && formData.mobile.length < 10 && (
              <p className="text-sm text-gray-500 mt-1">
                {formData.mobile.length}/10 digits
              </p>
            )}
          </div>

          {/* Address Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Home className="w-4 h-4" />
                Address *
              </label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {showMap ? 'Hide Map' : 'Use Map'}
              </button>
            </div>
            
            {showMap && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <GoogleMapAddress onAddressSelect={handleMapAddressSelect} />
              </div>
            )}
            
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="House/Flat number, Street name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              required
              disabled={isLoading}
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Home className="w-4 h-4" />
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              disabled={isLoading}
            />
          </div>

          {/* City and State Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Building className="w-4 h-4" />
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                required
                disabled={isLoading}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Map className="w-4 h-4" />
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Hash className="w-4 h-4" />
              Pincode *
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter pincode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              required
              disabled={isLoading}
            />
          </div>

          {/* Address Type Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Home className="w-4 h-4" />
              Address Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Home</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === 'Work'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Work</span>
              </label>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              id="isDefault"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={isLoading}
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {initialAddress ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                initialAddress ? 'Update Address' : 'Add Address'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 