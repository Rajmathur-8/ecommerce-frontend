'use client';

import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import CategoryCarousel from '@/components/CategoryCarousel';
import BannerCarousel from '@/components/BannerCarousel';
import BrandShowcase from '@/components/BrandShowcase';
import StatisticsSection from '@/components/StatisticsSection';
import { getApiUrl } from '@/lib/config';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {
  BannerSkeleton,
  SpecialOfferSkeleton,
  CategorySectionSkeleton
} from '@/components/Skeleton';

type Coupon = {
  _id: string;
  image?: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  validUntil?: string;
};

type CategoryProducts = {
  [categoryId: string]: any[];
};

export default function Home() {
  const { categories, loading: categoriesLoading } = useCategories();
  const router=useRouter()
  
  // Deduplicate categories like "Mobile" and "Mobiles" 
  const getDedupedCategories = () => {
    const seen = new Set<string>();
    const deduped: typeof categories = [];
    
    categories.forEach(category => {
      // Normalize by removing trailing 's' and converting to lowercase
      const normalized = category.name.toLowerCase().trim().replace(/s$/, '');
      
      if (!seen.has(normalized)) {
        seen.add(normalized);
        deduped.push(category);
      }
    });
    
    return deduped;
  };
  
  // Category products state
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts>({});
  const [categoryProductsLoading, setCategoryProductsLoading] = useState(true);
  
  // Banner carousel state
  const [banners, setBanners] = useState<{ 
    _id: string;
    image: string;
    link?: string;
    isPreOrder?: boolean;
    preOrderProductId?: string;
  }[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Pre-order modal state
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<typeof banners[0] | null>(null);
  const [preOrderFormData, setPreOrderFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    quantity: 1
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Special Offers (Coupons) state
  const [specialOffers, setSpecialOffers] = useState<Coupon[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  useEffect(() => {
    setBannersLoading(true);
    fetch(getApiUrl('/web/banners'))
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setBanners(data.data);
        }
      })
      .catch(error => {
        setBanners([]);
      })
      .finally(() => {
        setBannersLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(getApiUrl('/web/coupons?isActive=true&limit=6'))
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setSpecialOffers(data.data);
        } else {
          setSpecialOffers([]);
        }
      })
      .catch(() => setSpecialOffers([]))
      .finally(() => setOffersLoading(false));
  }, []);

  // Fetch products for each category
  useEffect(() => {
    if (categories.length === 0) {
      setCategoryProductsLoading(false);
      return;
    }

    setCategoryProductsLoading(true);
    const fetchCategoryProducts = async () => {
      try {
        const results: CategoryProducts = {};
        
        // Get deduped categories
        const deduped = getDedupedCategories();
        
        // Fetch products for each deduped category
        const promises = deduped.map(async (dedupedCategory) => {
          try {
            // Normalize the category name to find similar variations
            const normalized = dedupedCategory.name.toLowerCase().trim().replace(/s$/, '');
            
            // Find all categories that match this normalized name
            const matchingCategories = categories.filter(cat => {
              const catNormalized = cat.name.toLowerCase().trim().replace(/s$/, '');
              return catNormalized === normalized;
            });
            
            // Fetch products from all matching categories and combine them
            const allProducts: any[] = [];
            
            for (const matchingCat of matchingCategories) {
              try {
                const response = await fetch(
                  getApiUrl(`/web/products?category=${matchingCat._id}&limit=4`)
                );
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                  allProducts.push(...data.data);
                }
              } catch (error) {
                console.error(`Error fetching products for category ${matchingCat._id}:`, error);
              }
            }
            
            // Deduplicate products by ID and limit to 4
            const uniqueProducts = Array.from(
              new Map(allProducts.map(p => [p._id, p])).values()
            ).slice(0, 4);
            
            results[dedupedCategory._id] = uniqueProducts;
          } catch (error) {
            console.error(`Error processing category ${dedupedCategory._id}:`, error);
            results[dedupedCategory._id] = [];
          }
        });

        await Promise.all(promises);
        setCategoryProducts(results);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setCategoryProductsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categories]);

  const handleBannerClick = async (banner: typeof banners[0]) => {
    if (banner.isPreOrder && banner.preOrderProductId) {
      // Open modal directly
      setTimeout(() => {
        // Always show popup for all users (guest, Google login, email/password login)
        const storedUserData = localStorage.getItem('userData');
        
        // Pre-fill form if user data exists, but skip for guest users
        if (storedUserData) {
          try {
            const user = JSON.parse(storedUserData);
            // Check if user is a guest (email contains @guest.com or name starts with guest_)
            const isGuest = user.email?.includes('@guest.com') || user.name?.startsWith('guest_');
            
            if (isGuest) {
              // Don't pre-fill for guest users
              setPreOrderFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                quantity: 1
              });
            } else {
              // Pre-fill for regular users
              setPreOrderFormData({
                name: user.name || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: user.phone || '',
                address: '',
                quantity: 1
              });
            }
          } catch (e) {
            setPreOrderFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
              quantity: 1
            });
          }
        } else {
          setPreOrderFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            quantity: 1
          });
        }
        
        setSelectedBanner(banner);
        setShowPreOrderModal(true);
      }, 300);
    } else if (banner.link) {
      // Handle regular banner link
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank');
      } else {
        router.push(banner.link);
      }
    }
  };

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      phone: ''
    };
    let isValid = true;

    // Name validation
    if (!preOrderFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (preOrderFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!preOrderFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(preOrderFormData.email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (optional but if provided, must be 10 digits)
    if (preOrderFormData.phone.trim()) {
      const phoneDigits = preOrderFormData.phone.replace(/\D/g, ''); // Remove non-digits
      if (phoneDigits.length !== 10) {
        errors.phone = 'Phone number must be 10 digits';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePreOrderSubmit = async () => {
    if (!selectedBanner) return;
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (preOrderFormData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Show loading toast
      const loadingToast = toast.loading('Registering your pre-order...', {
        toastId: 'pre-order-loading'
      });
      
      const response = await fetch(getApiUrl('/web/orders/pre-order'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: selectedBanner.preOrderProductId,
          bannerId: selectedBanner._id,
          name: preOrderFormData.name,
          email: preOrderFormData.email,
          phone: preOrderFormData.phone || '',
          address: preOrderFormData.address || '',
          quantity: preOrderFormData.quantity
        })
      });
      
      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (data.success) {
        toast.success('Pre-order registered successfully! You will be notified via email and WhatsApp when the product becomes available.', {
          autoClose: 5000
        });
        setShowPreOrderModal(false);
        setPreOrderFormData({ name: '', email: '', phone: '', address: '', quantity: 1 });
        setFormErrors({ name: '', email: '', phone: '' });
        setSelectedBanner(null);
      } else {
        // Check if user is already registered
        if (data.message && data.message.toLowerCase().includes('already registered')) {
          setShowPreOrderModal(false);
          setPreOrderFormData({ name: '', email: '', phone: '', address: '', quantity: 1 });
          setFormErrors({ name: '', email: '', phone: '' });
          setSelectedBanner(null);
          toast.info('You have already registered for pre-order on this product', {
            autoClose: 4000
          });
        } else {
          toast.error(data.message || 'Failed to register pre-order. Please try again.', {
            autoClose: 4000
          });
        }
      }
    } catch (error) {
      // Dismiss loading toast if it exists
      toast.dismiss('pre-order-loading');
      toast.error('Failed to register pre-order. Please try again.', {
        autoClose: 4000
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to products page with category filter
    router.push(`/products?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Banner Carousel Section */}
        {bannersLoading ? (
          <BannerSkeleton />
        ) : (
          <BannerCarousel
            banners={banners}
            onBannerClick={handleBannerClick}
            autoSlideInterval={3000}
          />
        )}

        {/* Category Carousel Section */}
        <CategoryCarousel
          categories={getDedupedCategories()}
          onCategoryClick={handleCategoryClick}
          activeCategory={null}
          loading={categoriesLoading}
        />

        {/* Special Offers Section */}
        <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Offers</h2>
            </div>
            {offersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <SpecialOfferSkeleton key={index} />
                ))}
              </div>
            ) : specialOffers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No special offers available</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {specialOffers.slice(0, 3).map(offer => (
                    <div key={offer._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                      <img src={offer.image || '/no-image.png'} alt={offer.code} className="w-full h-40 object-cover rounded mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 ">{offer.code}</h3>
                      <p className="text-gray-600  mb-2">{offer.description}</p>
                      <div className="flex  gap-2 mb-2">
                        <span className="inline-block px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 font-semibold">
                          {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                        </span>
                      </div>
                      {offer.validUntil && (
                        <div className="text-xs text-gray-500">Valid until: {new Date(offer.validUntil).toLocaleDateString()}</div>
                      )}
                    </div>
                  ))}
                </div>
                {specialOffers.length > 3 && (
                  <div className="flex justify-center mt-6">
                    <a href="/special-offers" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">View More</a>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categoryProductsLoading ? (
              // Show skeleton for all categories while loading
              [...Array(3)].map((_, index) => (
                <CategorySectionSkeleton key={index} />
              ))
            ) : (
              categories.map((category) => {
                const products = categoryProducts[category._id] || [];
                return (
                  <div key={category._id} className="mb-12 sm:mb-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name}</h2>
                      {products.length > 0 && (
                        <a
                          href={`/products?category=${category._id}`}
                          className="inline-block px-4 sm:px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                        >
                          View All
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4">
                      {products.length > 0 ? (
                        products.map(product => (
                          <ProductCard
                            key={product._id}
                            id={product._id}
                            productName={product.productName}
                            price={product.price}
                            stock={product.stock}
                            discountPrice={product.discountPrice}
                            images={product.images}
                            category={product.category}
                            averageRating={product.averageRating}
                            totalReviews={product.totalReviews}
                            isPreOrder={product.isPreOrder}
                          />
                        ))
                      ) : (
                        <div className="col-span-1 sm:col-span-2 md:col-span-4 text-gray-400 text-center text-sm sm:text-base">No products found</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Brand Showcase Section */}
        <BrandShowcase />

        {/* Statistics Section */}
        <StatisticsSection />
      </main>

      {/* Pre-Order Modal */}
      {showPreOrderModal && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Pre-Order Registration</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter your details to register for pre-order. We'll notify you when the product becomes available.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preOrderFormData.name}
                  onChange={(e) => {
                    setPreOrderFormData({ ...preOrderFormData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Your name"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email / Mobile <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="email"
                      value={preOrderFormData.email}
                      onChange={(e) => {
                        setPreOrderFormData({ ...preOrderFormData, email: e.target.value });
                        if (formErrors.email) {
                          setFormErrors({ ...formErrors, email: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="your@email.com"
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={preOrderFormData.phone}
                      onChange={(e) => {
                        // Only allow digits
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        if (digitsOnly.length <= 10) {
                          setPreOrderFormData({ ...preOrderFormData, phone: digitsOnly });
                          if (formErrors.phone) {
                            setFormErrors({ ...formErrors, phone: '' });
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Phone is optional - for SMS and WhatsApp notifications (10 digits)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={preOrderFormData.address}
                  onChange={(e) => setPreOrderFormData({ ...preOrderFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your address (optional)"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (preOrderFormData.quantity > 1) {
                        setPreOrderFormData({ ...preOrderFormData, quantity: preOrderFormData.quantity - 1 });
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={preOrderFormData.quantity <= 1}
                  >
                    <span className="text-lg font-semibold">−</span>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={preOrderFormData.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setPreOrderFormData({ ...preOrderFormData, quantity: Math.max(1, value) });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreOrderFormData({ ...preOrderFormData, quantity: preOrderFormData.quantity + 1 });
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="text-lg font-semibold">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPreOrderModal(false);
                  setPreOrderFormData({ name: '', email: '', phone: '', address: '', quantity: 1 });
                  setFormErrors({ name: '', email: '', phone: '' });
                  setSelectedBanner(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreOrderSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Register Pre-Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
