'use client';

import { useAppContext } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { CartPageSkeleton } from '@/components/Skeleton';
import OrderSummary from '@/components/OrderSummary';
import { Shield, Check, Trash2, Heart, Plus, Minus, ShoppingCart, Eye, X, Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleFrequentlyBought, clearFrequentlyBoughtForItem, syncFrequentlyBoughtWithCart } from '@/store/cartSlice';
import { formatCurrency } from '@/lib/config';

// Extend Window interface to include showToast
declare global {
  interface Window {
    showToast?: (message: string, type: string, duration?: number) => void;
  }
}

// Define types for cart items
interface Warranty {
  _id: string;
  name: string;
  description: string;
  duration: number | string;
  price: number;
  coverage: string[];
  termsAndConditions?: string;
  image?: string;
}

interface CartItem {
  price: number;
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
    attributes?: Record<string, string | number>;
    [key: string]: unknown;
  };
  quantity: number;
  warranty?: Warranty | string | null;
}

interface Cart {
  cart: {
    items: CartItem[];
    savedForLater: CartItem[];
    itemCount: number;
    loading?: boolean;
  };
  items: CartItem[];
  savedForLater: CartItem[];
  itemCount: number;
  loading: boolean;
}

export default function CartPage() {
  const { auth, cart, wishlist } = useAppContext();
  const dispatch = useAppDispatch();
  const selectedFrequentlyBoughtRedux = useAppSelector(state => state.cart.selectedFrequentlyBought || {});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [rewardPointsRedeemed, setRewardPointsRedeemed] = useState(false);
  const [rewardPointsAmount, setRewardPointsAmount] = useState(0);
  const [productWarranties, setProductWarranties] = useState<{ [productId: string]: Warranty[] }>({});
  const [loadingWarranties, setLoadingWarranties] = useState<{ [productId: string]: boolean }>({});
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<{ [productId: string]: any[] }>({});
  const [addingFrequentlyBought, setAddingFrequentlyBought] = useState<{ [cartItemId: string]: boolean }>({});
  const [showWarrantyModal, setShowWarrantyModal] = useState<{ [productId: string]: boolean }>({});
    
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Convert Redux state (arrays) to Sets for easier use in component
  const selectedFrequentlyBought: { [cartItemId: string]: Set<string> } = {};
  if (selectedFrequentlyBoughtRedux && typeof selectedFrequentlyBoughtRedux === 'object') {
    Object.keys(selectedFrequentlyBoughtRedux).forEach(cartItemId => {
      selectedFrequentlyBought[cartItemId] = new Set(selectedFrequentlyBoughtRedux[cartItemId] || []);
    });
  }



  useEffect(() => {
    // Clear localStorage to remove old cart data with generated IDs
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persist:root');
      console.log('🧹 Cleared localStorage to remove old cart data');
    }
    
    if (auth.isAuthenticated) {
      console.log('🔄 Fetching cart data...');
      cart.fetchCart().then(() => {
        console.log('✅ Cart data fetched successfully');
        console.log('📦 Fetched cart:', cart);
      }).catch((error) => {
      });
    }
  }, [auth.isAuthenticated]);

  // Fetch warranties for products in cart
  useEffect(() => {
    const fetchWarranties = async () => {
      const cartItems = (cart as unknown as Cart)?.cart?.items || [];
      if (cartItems.length === 0) return;

      // Filter out items with null/undefined products
      const validItems = cartItems.filter((item: CartItem) => item && item.product && item.product._id);
      if (validItems.length === 0) return;

      const productIds = validItems.map((item: CartItem) => item.product._id);
      const uniqueProductIds = [...new Set(productIds)];

      if (uniqueProductIds.length === 0) return;

      try {
        const response = await apiService.warranty.getWarrantiesForProducts(uniqueProductIds);
        if (response.success && response.data) {
          setProductWarranties(response.data as { [productId: string]: Warranty[] });
        }
      } catch (error) {
        // Silently handle error - warranties are optional feature
      }
    };

    if (auth.isAuthenticated && (cart as unknown as Cart)?.cart?.items?.length > 0) {
      fetchWarranties();
    }
  }, [auth.isAuthenticated, (cart as unknown as Cart)?.cart?.items]);

  // Fetch frequently bought together products
  useEffect(() => {
    const fetchFrequentlyBought = async () => {
      const cartItems = (cart as unknown as Cart)?.cart?.items || [];
      if (cartItems.length === 0) return;

      // Filter out items with null/undefined products
      const validItems = cartItems.filter((item: CartItem) => item && item.product && item.product._id);
      if (validItems.length === 0) return;

      try {
        const productIds = validItems.map((item: CartItem) => item.product._id);
        const uniqueProductIds = [...new Set(productIds)];

        // Fetch full product details for each product to get frequentlyBoughtTogether
        const promises = uniqueProductIds.map(async (productId) => {
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
            frequentlyBoughtMap[productId] = products;
          }
        });
        
        setFrequentlyBoughtTogether(frequentlyBoughtMap);
      } catch (error) {
      }
    };

    if (auth.isAuthenticated && (cart as unknown as Cart)?.cart?.items?.length > 0) {
      fetchFrequentlyBought();
    }
  }, [auth.isAuthenticated, (cart as unknown as Cart)?.cart?.items]);

  // Track previous cart item IDs to only sync when items are actually removed
  const prevCartItemIdsRef = useRef<string>('');
  
  // Sync selectedFrequentlyBought with current cart items (remove selections for deleted items)
  // Only sync when cart items are actually removed, not on every change or initial load
  useEffect(() => {
    const cartItems = (cart as unknown as Cart)?.cart?.items || [];
    const currentCartItemIds = cartItems.map((item: CartItem) => item._id).sort().join(',');
    
    // Skip on initial load (when prevCartItemIdsRef is empty)
    if (prevCartItemIdsRef.current === '') {
      prevCartItemIdsRef.current = currentCartItemIds;
      return;
    }
    
    // Only sync if cart item IDs changed (items were added or removed)
    if (prevCartItemIdsRef.current !== currentCartItemIds) {
      const prevIds = new Set(prevCartItemIdsRef.current.split(',').filter(Boolean));
      const currentIds = new Set(currentCartItemIds.split(',').filter(Boolean));
      
      // Check if any items were removed (not just added)
      const hasRemovedItems = Array.from(prevIds).some(id => !currentIds.has(id));
      
      // Only sync if items were actually removed and we have selections
      if (hasRemovedItems && Object.keys(selectedFrequentlyBoughtRedux).length > 0) {
        dispatch(syncFrequentlyBoughtWithCart());
      }
      
      // Update ref for next comparison
      prevCartItemIdsRef.current = currentCartItemIds;
    }
  }, [(cart as unknown as Cart)?.cart?.items, dispatch]);

  // Handle warranty toggle
  const handleWarrantyToggle = async (productId: string, warrantyId: string | null) => {
    try {
      setLoadingWarranties(prev => ({ ...prev, [productId]: true }));
      await cart.updateCartItem(productId, undefined, warrantyId);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(warrantyId ? 'Extended warranty added' : 'Extended warranty removed', 'success');
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to update warranty', 'error');
      }
    } finally {
      setLoadingWarranties(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle checkbox toggle for frequently bought products
  const handleFrequentlyBoughtToggle = (cartItemId: string, productId: string) => {
    dispatch(toggleFrequentlyBought({ cartItemId, productId }));
  };

  // Handle adding selected frequently bought products to cart
  const handleAddSelectedFrequentlyBought = async (cartItemId: string) => {
    const selectedProducts = selectedFrequentlyBought[cartItemId];
    if (!selectedProducts || selectedProducts.size === 0) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Please select at least one product', 'warning');
      }
      return;
    }

    try {
      setAddingFrequentlyBought(prev => ({ ...prev, [cartItemId]: true }));
      
      // Add all selected products to cart
      const addPromises = Array.from(selectedProducts).map(productId => 
        cart.addToCart(productId, 1)
      );
      
      await Promise.all(addPromises);
      
      // Clear selections after successful add
      dispatch(clearFrequentlyBoughtForItem(cartItemId));
      
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(
          `${selectedProducts.size} product${selectedProducts.size > 1 ? 's' : ''} added to cart!`,
          'success'
        );
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to add products', 'error');
      }
    } finally {
      setAddingFrequentlyBought(prev => ({ ...prev, [cartItemId]: false }));
    }
  }; 


  const handleProceedToCheckout = async () => {
    try {
      console.log('🚀 Proceeding to checkout - syncing cart data...');
      
      // Get current cart items from Redux state
      const cartItems = (cart as unknown as Cart)?.cart?.items || [];
      console.log('📦 Full cart state:', cart);
      console.log('📦 Cart items to sync:', cartItems);
      
      // Filter out items with null/undefined products
      const validItems = cartItems.filter((item: CartItem) => item && item.product && item.product._id);
      
      console.log('📦 Cart items details:', validItems.map(item => ({ 
        productId: item.product._id, 
        name: item.product?.productName, 
        quantity: item.quantity
      })));
      
      // Sync each item's quantity with backend using product ID
      const syncPromises = validItems.map(async (item: CartItem) => {
        try {
          const productId = item.product._id; // Use product ID instead of item ID
          console.log(`🔄 Syncing product ${item.product.productName} (Product ID: ${productId}) quantity: ${item.quantity}`);
          await cart.updateCartItem(productId, item.quantity);
          console.log(`✅ Successfully synced product ${productId}`);
        } catch (error) {
          throw error; // Re-throw to stop the process if any item fails
        }
      });
      
      // Wait for all sync operations to complete
      await Promise.all(syncPromises);
      
      console.log('✅ All cart items synced successfully');
      
      // Redirect to checkout

      router.push('/checkout/address');
     
      
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to sync cart data. Please try again.', 'error');
      }
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    try {
      console.log('🔄 handleUpdateQuantity called with:', { itemId, quantity });
      console.log('📦 Current cart items:', (cart as unknown as Cart)?.cart?.items?.map((item: CartItem) => ({ id: item._id, name: item.product.productName, quantity: item.quantity })));
      
      // Validate quantity
      if (quantity < 1) {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Quantity cannot be less than 1', 'error');
        }
        return;
      }
      
      // Check maximum quantity limit (e.g., 99 items)
      if (quantity > 99) {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Maximum quantity limit is 99 items', 'warning');
        }
        return;
      }
      
      // Use local Redux to update quantity
      cart.updateQuantity(itemId, quantity);
      
    } catch (error) {
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('An error occurred while updating quantity', 'error');
      }
    }
  };

  // Handle delete button click - show popup
  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setShowDeletePopup(true);
  };

  // Handle delete from cart only
  const handleDeleteFromCart = () => {
    if (itemToDelete) {
      cart.removeItem(itemToDelete._id);
      setShowDeletePopup(false);
      setItemToDelete(null);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Item removed from cart', 'success');
      }
    }
  };

  // Load reward points redemption from localStorage
  const loadRewardPointsFromStorage = () => {
    if (typeof window !== 'undefined') {
      const savedRedeemed = localStorage.getItem('rewardPointsRedeemed');
      const savedAmount = localStorage.getItem('rewardPointsAmount');
      console.log('📦 Loading reward points from localStorage:', { savedRedeemed, savedAmount });
      if (savedRedeemed === 'true' && savedAmount) {
        const amount = parseFloat(savedAmount);
        if (!isNaN(amount) && amount > 0) {
          console.log('✅ Setting reward points state:', { redeemed: true, amount });
          setRewardPointsRedeemed(true);
          setRewardPointsAmount(amount);
          return;
        }
      }
      console.log('❌ No valid reward points found in localStorage');
      setRewardPointsRedeemed(false);
      setRewardPointsAmount(0);
    }
  };

  // Load reward points on mount and when pathname changes (user navigates back)
  useEffect(() => {
    loadRewardPointsFromStorage();
  }, [pathname]);

  // Also load when window gains focus (user comes back to tab/page)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, reloading reward points from localStorage');
      loadRewardPointsFromStorage();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible, reloading reward points from localStorage');
        loadRewardPointsFromStorage();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle reward points redemption
  const handleRewardPointsRedeem = (discountAmount: number) => {
    console.log('🎁 Reward points redeemed:', discountAmount);
    setRewardPointsRedeemed(true);
    setRewardPointsAmount(discountAmount);
    // Save to localStorage for persistence across pages
    if (typeof window !== 'undefined') {
      localStorage.setItem('rewardPointsRedeemed', 'true');
      localStorage.setItem('rewardPointsAmount', discountAmount.toString());
    }
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`${discountAmount} reward points redeemed successfully!`, 'success');
    }
  };

  const handleRewardPointsCancel = () => {
    console.log('❌ Reward points redemption cancelled');
    setRewardPointsRedeemed(false);
    setRewardPointsAmount(0);
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rewardPointsRedeemed');
      localStorage.removeItem('rewardPointsAmount');
    }
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('Reward points redemption cancelled', 'info');
    }
  };


  // Handle add to wishlist and delete from cart
  const handleAddToWishlistAndDelete = async () => {
    console.log('🔄 handleAddToWishlistAndDelete called');
    console.log('📦 itemToDelete:', itemToDelete);
    console.log('🔐 Auth status:', auth.isAuthenticated);
    console.log('💝 Wishlist object:', wishlist);
    
    if (itemToDelete) {
      try {
        console.log('💝 Adding to wishlist, product ID:', itemToDelete.product._id);
        console.log('💝 Product object:', itemToDelete.product);
        
        const result = await wishlist.addToWishlist(itemToDelete.product._id);
        console.log('✅ Wishlist result:', result);
        
        if (result) {
          cart.removeItem(itemToDelete._id);
          setShowDeletePopup(false);
          setItemToDelete(null);
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Item added to wishlist and removed from cart', 'success');
          }
        } else {
          // Check if it's already in wishlist
          const isAlreadyInWishlist = await wishlist.isInWishlist(itemToDelete.product._id);
          if (isAlreadyInWishlist) {
            if (typeof window !== 'undefined' && window.showToast) {
              window.showToast('Item is already in your wishlist', 'warning');
            }
            // Still remove from cart even if already in wishlist
            cart.removeItem(itemToDelete._id);
            setShowDeletePopup(false);
            setItemToDelete(null);
          } else {
            if (typeof window !== 'undefined' && window.showToast) {
              window.showToast('Failed to add to wishlist. Please try again.', 'error');
            }
          }
        }
      } catch (error) {
        console.log({
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name
        });
        
        // Check if it's already in wishlist error
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('already in wishlist') || errorMessage.includes('Product is already in wishlist')) {
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Item is already in your wishlist', 'warning');
          }
          // Still remove from cart even if already in wishlist
          cart.removeItem(itemToDelete._id);
          setShowDeletePopup(false);
          setItemToDelete(null);
        } else {
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast(`Failed to add to wishlist: ${errorMessage}`, 'error');
          }
        }
      }
    }
  };

  // Handle cancel popup
  const handleCancelPopup = () => {
    setShowDeletePopup(false);
    setItemToDelete(null);
  };

  const handleClearCart = async () => {
    console.log('🧹 Clear cart function called');
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await cart.clearCart();
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Cart cleared successfully!', 'success');
        }
      } catch (error) {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Failed to clear cart. Please try again.', 'error');
        }
      }
    }
  };

  // Use local Redux for save for later
  const handleSaveForLater = (itemId: string) => {
    if (confirm('Are you sure you want to save this item for later?')) {
      cart.saveItemForLater(itemId);
    }
  };

  // Use local Redux for move to cart
  const handleMoveToCart = (itemId: string) => {
    cart.moveItemToCart(itemId);
  };

  if (auth.loading || (cart.cart as Cart)?.loading) {
    return <CartPageSkeleton />;
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
            <a
              href="/auth/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || ((cart as unknown as Cart)?.cart?.items?.length === 0 && (cart as unknown as Cart)?.cart?.savedForLater?.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some products to your cart to get started.</p>
            <Link
              href="/"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {(() => {
                    const validItems = ((cart as unknown as Cart)?.cart?.items || [])
                      .filter((item: CartItem) => item && item.product && item.product._id);
                    const itemCount = validItems.length;
                    return (
                      <h2 className="text-xl font-semibold text-gray-900">Cart Items ({itemCount})</h2>
                    );
                  })()}
                </div>
                {(() => {
                  const validItems = ((cart as unknown as Cart)?.cart?.items || [])
                    .filter((item: CartItem) => item && item.product && item.product._id);
                  return validItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  );
                })()}
              </div>
              <div className="divide-y divide-gray-200">
                {(() => {
                  const validItems = ((cart as unknown as Cart)?.cart?.items || [])
                    .filter((item: CartItem) => item && item.product && item.product._id);
                  
                  if (validItems.length === 0) {
                    return (
                      <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg">Your cart is empty</p>
                        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium">
                          Continue Shopping
                        </Link>
                      </div>
                    );
                  }
                  
                  return validItems.map((item: CartItem, index: number) => {
                  return (
                    <div key={item._id || `cart-item-${index}`}>
                      {/* Main Cart Item */}
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <Link href={`/product/${item.product?._id || ''}`} className="flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0] || '/placeholder.svg'}
                        alt={item.product?.productName || 'Product'}
                              width={120}
                              height={120}
                              className="w-28 h-28 object-cover rounded-xl border border-gray-200 hover:border-indigo-300 transition-all"
                            />
                          </Link>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-4">
                      <div className="flex-1">
                                <Link href={`/product/${item.product?._id || ''}`}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                    {item.product?.productName || 'Product'}
                        </h3>
                                </Link>
                           
                            {/* Variant Attributes */}
                                {typeof item.variant === 'object' && item.variant !== null && !Array.isArray(item.variant) && Object.keys(item.variant).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                              {item.variant.attributes && typeof item.variant.attributes === 'object' ? (
                                Object.entries(item.variant.attributes).map(([, value], keyIndex) => (
                                        <span key={keyIndex} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    {typeof value === 'string' || typeof value === 'number' ? value : ''}
                                  </span>
                                ))
                              ) : (
                                Object.entries(item.variant)
                                  .filter(([key]) => key !== 'price' && key !== 'stock' && key !== 'discountPrice' && key !== 'variantName' && key !== 'attributes' && key !== 'sku')
                                  .map(([, value], attrIndex) => (
                                          <span key={attrIndex} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                      {typeof value === 'string' || typeof value === 'number' ? value : ''}
                                    </span>
                                  ))
                              )}
                          </div>
                        )}
                                
                                {/* Price */}
                                <div className="mt-3">
                          {(() => {
                            const variantPrice = item.variant && typeof item.variant === 'object' && 'price' in item.variant 
                              ? item.variant.price 
                              : item.product.price;
                            const variantDiscountPrice = item.variant && typeof item.variant === 'object' && 'discountPrice' in item.variant 
                              ? item.variant.discountPrice 
                              : item.product.discountPrice;
                            
                            const displayPrice = variantDiscountPrice || variantPrice;
                            const originalPrice = typeof variantPrice === 'number' ? variantPrice : undefined;
                            
                            if (
                              typeof variantDiscountPrice === 'number' &&
                              typeof originalPrice === 'number' &&
                              variantDiscountPrice < originalPrice
                            ) {
                              return (
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <span className="text-2xl font-bold text-indigo-600">{formatCurrency(Math.round(variantDiscountPrice))}</span>
                                          <span className="text-base text-gray-500 line-through">{formatCurrency(Math.round(originalPrice))}</span>
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    {Math.round(((originalPrice - variantDiscountPrice) / originalPrice) * 100)}% OFF
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                        <p className="text-2xl font-bold text-indigo-600">
                                  {formatCurrency(Math.round(displayPrice || 0))}
                                </p>
                              );
                            }
                          })()}
                                </div>
                              </div>
                              
                              {/* Quantity and Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                    className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <span className="px-6 py-2 text-center font-semibold text-gray-900 min-w-[4rem] border-x-2 border-gray-200">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                    className="p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => handleSaveForLater(item._id)}
                                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  <Heart className="w-4 h-4" />
                                  Save for Later
                                </button>
                              </div>
                        </div>
                        
                        {/* Extended Warranty Section */}
                        {item.product?._id && productWarranties[item.product._id] && productWarranties[item.product._id].length > 0 && (
                          <div className="mt-5 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-100">
                            <div className="flex items-center gap-2 mb-4">
                              <Shield className="w-5 h-5 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-900">Extended Warranty</span>
                            </div>
                            
                            <div className="space-y-3">
                              {productWarranties[item.product._id].slice(0, 3).map((warranty) => {
                                const isSelected = item.warranty && (
                                  typeof item.warranty === 'string' 
                                    ? item.warranty === warranty._id 
                                    : (item.warranty as Warranty)?._id === warranty._id
                                );
                                
                                return (
                                  <div
                                    key={warranty._id}
                                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-indigo-600 bg-indigo-100'
                                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                                    }`}
                                    onClick={() => {
                                      const warrantyId = isSelected ? null : warranty._id;
                                      handleWarrantyToggle(item.product._id, warrantyId);
                                    }}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="radio"
                                        id={`warranty-${item._id}-${warranty._id}`}
                                        name={`warranty-${item._id}`}
                                        checked={!!isSelected}
                                        onChange={() => {
                                          const warrantyId = isSelected ? null : warranty._id;
                                          handleWarrantyToggle(item.product._id, warrantyId);
                                        }}
                                        disabled={loadingWarranties[item.product._id]}
                                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div className="flex-1">
                                        <label 
                                          htmlFor={`warranty-${item._id}-${warranty._id}`}
                                          className="block cursor-pointer"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                              {warranty.name}
                                            </h4>
                                            <span className="text-base font-bold text-indigo-600">
                                              {formatCurrency(Math.round(warranty.price))}
                                            </span>
                                          </div>
                                          {warranty.description && (
                                            <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                              {warranty.description}
                                            </p>
                                          )}
                                          {warranty.duration && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                              <Clock className="w-3 h-3" />
                                              <span>{
                                                (() => {
                                                  const duration: number | string = warranty.duration;
                                                  if (typeof duration === 'number') {
                                                    return `${duration} months`;
                                                  } else if (typeof duration === 'string') {
                                                    const lowerDuration = duration.toLowerCase();
                                                    return lowerDuration.includes('month') 
                                                      ? duration 
                                                      : `${duration} months`;
                                                  } else {
                                                    return `${String(duration)} months`;
                                                  }
                                                })()
                                              }</span>
                                            </div>
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* View All Button */}
                              {productWarranties[item.product._id].length > 3 && (
                                <div className="flex justify-center pt-2">
                                  <button
                                    onClick={() => setShowWarrantyModal(prev => ({ ...prev, [item.product._id]: true }))}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View All ({productWarranties[item.product._id].length} warranties)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                          </div>
                      </div>
                      
                        {/* Frequently Bought Together Section */}
                        {(() => {
                          if (!item.product?._id) return null;
                          const relatedProducts = frequentlyBoughtTogether[item.product._id];
                          
                          if (!relatedProducts || relatedProducts.length === 0) {
                            return null;
                          }
                          
                          return (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                Frequently Bought Together
                              </h4>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {frequentlyBoughtTogether[item.product._id].slice(0, 3).map((relatedProduct: any, idx: number) => {
                                  // Skip if product data is completely missing
                                  if (!relatedProduct || !relatedProduct.productName) {
                                    return null;
                                  }
                                  
                                  // Get product ID - use _id for regular products, sku for manual products
                                  const productId = relatedProduct._id || relatedProduct.sku || `temp-${idx}`;
                                  // Use product._id as fallback if item._id is undefined (for backend cart items)
                                  const cartItemId = item._id || item.product?._id || `cart-${idx}`;
                                  const isSelected = selectedFrequentlyBought[cartItemId]?.has(productId) || false;
                                  return (
                                    <div 
                                      key={`freq-${cartItemId}-${productId}-${idx}`}
                                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all shadow-sm cursor-pointer ${
                                        isSelected 
                                          ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-400 shadow-md' 
                                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleFrequentlyBoughtToggle(cartItemId, productId);
                                      }}
                                    >
                                      {/* Checkbox */}
                                      <div 
                                        className="absolute top-3 right-3 z-10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleFrequentlyBoughtToggle(cartItemId, productId);
                                        }}
                                      >
                                        <div className={`w-6 h-6 rounded border-2 cursor-pointer flex items-center justify-center transition-all ${
                                          isSelected 
                                            ? 'bg-indigo-600 border-indigo-600' 
                                            : 'bg-white border-gray-300 hover:border-indigo-400'
                                        }`}>
                                          {isSelected && (
                                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                          )}
                                        </div>
                                      </div>

                                      {/* Product Info */}
                                      <div className="flex items-center gap-3 pr-8 flex-1">
                                        <Image
                                          src={relatedProduct.images?.[0] || '/placeholder.svg'}
                                          alt={relatedProduct.productName || 'Product'}
                                          width={64}
                                          height={64}
                                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {relatedProduct.productName}
                                          </p>
                                          <p className="text-base font-bold text-indigo-600 mt-1">
                                            {formatCurrency(Math.round(relatedProduct.discountPrice || relatedProduct.price || 0))}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>

            </div>

            {/* Saved for Later Items */}
            {(cart as unknown as Cart)?.cart?.savedForLater && (cart as unknown as Cart)?.cart?.savedForLater.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Saved for Later ({(cart as unknown as Cart)?.cart?.savedForLater.length})</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {(cart as unknown as Cart)?.cart?.savedForLater.map((item: CartItem) => (
                    <div key={item._id} className="p-6 flex items-center space-x-6">
                      <Image
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.productName}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link href={`/product/${item.product?._id || ''}`}>{item.product?.productName || 'Product'}</Link>
                        </h3>
                        {typeof item.variant === 'object' && item.variant !== null && !Array.isArray(item.variant) && Object.keys(item.variant).length > 0 && (
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.variant)
                              .filter(([key]) => key !== 'price' && key !== 'stock')
                              .map(([, value]) => typeof value === 'string' || typeof value === 'number' ? value : '')
                              .join(', ')}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {/* Original Price */}
                          {item.product.discountPrice && item.product.discountPrice < item.product.price && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(Math.round(item.product.price))}
                            </p>
                          )}
                          {/* Current Price */}
                          <p className="text-lg font-semibold text-indigo-600">
                            {formatCurrency(Math.round(item.price))}
                          </p>
                          {/* Discount Percentage */}
                          {item.product.discountPrice && item.product.discountPrice < item.product.price && (
                            <p className="text-sm text-green-600 font-medium">
                              {Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)}% OFF
                            </p>
                          )}
                          {/* Total for this item */}
                          <p className="text-sm text-gray-600">
                            Total: {formatCurrency(Math.round(item.price * item.quantity))}
                          </p>
                        </div>
                      </div>
                      
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleMoveToCart(item._id)}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => cart.removeFromSaved(item._id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Cart Summary */}
          <div className="lg:col-span-1 space-y-4">

            {/* Reward Points Redeemed Indicator */}
            {rewardPointsRedeemed && rewardPointsAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Reward Points Redeemed!
                    </p>
                    <p className="text-sm text-green-700">
                      You saved {formatCurrency(rewardPointsAmount)} using reward points
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <OrderSummary 
              showCouponSection={true}
              showProductItems={true}
              showCheckoutButtons={true}
              showRewardPoints={true}
              loading={(cart as unknown as Cart)?.loading}
              rewardPointsDiscount={rewardPointsAmount}
              rewardPointsRedeemed={rewardPointsRedeemed}
              onRewardPointsRedeem={handleRewardPointsRedeem}
              onRewardPointsCancel={handleRewardPointsCancel}
              selectedFrequentlyBought={selectedFrequentlyBought}
              frequentlyBoughtTogether={frequentlyBoughtTogether}
              customButtons={
                <div className="mt-6 flex space-x-3">
                  <Link 
                    href="/"
                    className="flex-1 text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                  >
                    Back
                  </Link>
                  <button
                    onClick={handleProceedToCheckout}
                    className="flex-1 text-center bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm text-sm cursor-pointer"
                  >
                    Proceed
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Popup */}
      {showDeletePopup && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Remove Item</h3>
              <button
                onClick={handleCancelPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src={itemToDelete.product.images[0] || '/placeholder.svg'}
                  alt={itemToDelete.product.productName}
                  width={80}
                  height={80}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">{itemToDelete.product.productName}</h4>
                  <p className="text-sm text-gray-500">Qty: {itemToDelete.quantity}</p>
                  <p className="text-sm font-medium text-indigo-600">
                                    {formatCurrency((itemToDelete.product.discountPrice || itemToDelete.product.price) * itemToDelete.quantity)}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 text-[20px] font-semibold mb-6">
                Add to wishlist or delete?
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToWishlistAndDelete}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save for Wishlist
                </button>
                
                <button
                  onClick={handleDeleteFromCart}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Extended Warranty Modal */}
      {Object.entries(showWarrantyModal).map(([productId, isOpen]) => {
        if (!isOpen || !productWarranties[productId] || productWarranties[productId].length === 0) return null;
        
        const warranties = productWarranties[productId];
        const cartItem = (cart as unknown as Cart)?.cart?.items?.find((item: CartItem) => item.product._id === productId);
        const selectedWarranty = cartItem?.warranty 
          ? (typeof cartItem.warranty === 'string' ? cartItem.warranty : (cartItem.warranty as Warranty)?._id)
          : null;
        
        return (
          <div key={productId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Extended Warranty Plans</h2>
                </div>
                <button
                  onClick={() => setShowWarrantyModal(prev => ({ ...prev, [productId]: false }))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {warranties.map((warranty) => {
                    const isSelected = selectedWarranty === warranty._id;
                    
                    return (
                      <div
                        key={warranty._id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => {
                          const warrantyId = isSelected ? null : warranty._id;
                          handleWarrantyToggle(productId, warrantyId);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="radio"
                              id={`warranty-modal-${productId}-${warranty._id}`}
                              name={`warranty-modal-${productId}`}
                              checked={isSelected}
                              onChange={() => {
                                const warrantyId = isSelected ? null : warranty._id;
                                handleWarrantyToggle(productId, warrantyId);
                              }}
                              className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`warranty-modal-${productId}-${warranty._id}`}
                                className="block cursor-pointer"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {warranty.name}
                                  </h3>
                                  <span className="text-xl font-bold text-indigo-600">
                                    {formatCurrency(Math.round(warranty.price))}
                                  </span>
                                </div>
                                {warranty.description && (
                                  <p className="text-sm text-gray-600 mb-2">{warranty.description}</p>
                                )}
                                {warranty.duration && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>Duration: {
                                      (() => {
                                        const duration: number | string = warranty.duration;
                                        if (typeof duration === 'number') {
                                          return `${duration} months`;
                                        } else if (typeof duration === 'string') {
                                          const lowerDuration = duration.toLowerCase();
                                          return lowerDuration.includes('month') 
                                            ? duration 
                                            : `${duration} months`;
                                        } else {
                                          return `${String(duration)} months`;
                                        }
                                      })()
                                    }</span>
                                  </div>
                                )}
                                {warranty.coverage && warranty.coverage.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-2">
                                      {warranty.coverage.slice(0, 3).map((item: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">
                                          {item}
                                        </span>
                                      ))}
                                      {warranty.coverage.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          +{warranty.coverage.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedWarranty && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Extended warranty will be added to your cart.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowWarrantyModal(prev => ({ ...prev, [productId]: false }))}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <Footer />
    </div>
  );
}