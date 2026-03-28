import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  updateCartItemQuantity, 
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  saveForLater as saveForLaterAction,
  moveToCart as moveToCartAction,
  removeFromSaved as removeFromSavedAction,
  setCart,
  setLoading,
  setError,
  clearAllFrequentlyBought
} from '../store/cartSlice';
import { apiService } from '../lib/api';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    price: number;
    discountPrice?: number;
    images: string[];
    stock: number;
  };
  variant?: Record<string, unknown>;
  quantity: number;
  price: number;
}

interface CartData {
  items: CartItem[];
  savedForLater: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  discountAmount: number;
  loading: boolean;
  error: string | null;
  coupon?: {
    code: string;
    type: 'percentage' | 'fixed';
    discount: number;
  };
  selectedFrequentlyBought?: { [cartItemId: string]: string[] };
}

export const useReduxCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: { cart: unknown }) => state.cart);
  const currentSelectedFrequentlyBought = useAppSelector((state: { cart: { selectedFrequentlyBought?: { [cartItemId: string]: string[] } } }) => 
    state.cart.selectedFrequentlyBought || {}
  );
  
  
  
  // API operations (only when necessary)
  const fetchCart = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.getUserCart();
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Clear persisted cart data from localStorage
  const clearPersistedCart = useCallback(() => {
    try {
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root');
        console.log('🧹 Cleared persisted cart data from localStorage');
      }
    } catch (error) {
    }
  }, []);

  // Check if cart should be empty and clear if needed
  useEffect(() => {
    const cartData = (cart as any)?.cart || {};
    const items = cartData?.items || [];
    
    // If cart has items but they seem invalid (no product data), clear it
    if (Array.isArray(items) && items.length > 0) {
      const validItems = items.filter(item => item.product && item.product._id);
      if (validItems.length === 0) {
        console.log('🧹 Clearing invalid cart items');
        dispatch(clearCartAction());
      }
    }
  }, [cart, dispatch]);

  // API operations for syncing with backend
  const updateCartItem = useCallback(async (itemId: string, quantity?: number, warranty?: string | null) => {
    try {
      console.log('🔄 Syncing cart item with backend:', { itemId, quantity, warranty });
      const response = await apiService.cart.updateCartItem(itemId, quantity, warranty);
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
        console.log('✅ Cart item synced successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      dispatch(setError(errorMessage));
      throw err;
    }
  }, [dispatch]);

  // Local cart operations for quantity updates
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    console.log('🔄 Updating quantity locally for item:', itemId, 'to quantity:', quantity);
    dispatch(updateCartItemQuantity({ itemId, quantity }));
  }, [dispatch]);

  const removeItem = useCallback((itemId: string) => {
    console.log('🗑️ Removing item with ID:', itemId);
    dispatch(removeFromCartAction(itemId));
  }, [dispatch]);

  const saveItemForLater = useCallback((itemId: string) => {
    dispatch(saveForLaterAction(itemId));
  }, [dispatch]);

  const moveItemToCart = useCallback((itemId: string) => {
    dispatch(moveToCartAction(itemId));
  }, [dispatch]);

  const removeFromSaved = useCallback((itemId: string) => {
    dispatch(removeFromSavedAction(itemId));
  }, [dispatch]);

  const clearCartLocal = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);





  const addToCart = useCallback(async (productId: string, quantity: number, variant?: unknown) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.addToCart({ productId, quantity, variant });
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const clearCart = useCallback(async () => {
    try {
      console.log('🧹 Clear cart called - using API');
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.clearCart();
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Clear cart data and also clear frequently bought together selections, promo code, and gift voucher
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null,
          selectedFrequentlyBought: {}, // Explicitly clear frequently bought selections
          promoCode: undefined, // Clear promo code
          giftVoucher: undefined // Clear gift voucher
        } as any));
        // Also dispatch clearAllFrequentlyBought to ensure it's cleared
        dispatch(clearAllFrequentlyBought());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      console.log('🔄 Applying coupon:', code);
      const response = await apiService.cart.applyCoupon(code);
      console.log('📦 Coupon API response:', response);
      if (response.success && response.data) {
        console.log('✅ Coupon applied successfully');
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      } else {
        // Handle error response from API - backend sends specific messages like "Coupon has expired", "Invalid or expired coupon"
        const errorMessage = response.message || 'Invalid coupon code. Please try again.';
        dispatch(setError(errorMessage));
        // Throw error so it can be caught and shown in toast
        throw new Error(errorMessage);
      }
    } catch (err) {
      // Extract error message - backend sends specific messages
      const errorMessage = err instanceof Error ? err.message : 'Invalid coupon code. Please try again.';
      dispatch(setError(errorMessage));
      // Re-throw with user-friendly message (will be caught and shown in toast)
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const removeCoupon = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.removeCoupon();
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove coupon';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const applyPromoCode = useCallback(async (code: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      console.log('🔄 useReduxCart: Applying promo code:', code);
      const response = await apiService.cart.applyPromoCode(code);
      console.log('📦 useReduxCart: API Response:', response);
      if (response.success && response.data) {
        console.log('✅ useReduxCart: Promo code applied successfully');
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      } else {
        const errorMessage = response.message || 'Failed to apply promo code';
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply promo code';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const removePromoCode = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.removePromoCode();
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove promo code';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const applyGiftVoucher = useCallback(async (code: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.applyGiftVoucher(code);
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      } else {
        const errorMessage = response.message || 'Failed to apply gift voucher';
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply gift voucher';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const removeGiftVoucher = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.cart.removeGiftVoucher();
      if (response.success && response.data) {
        const cartData = {
          ...response.data.cart,
          loading: false
        };
        // Don't pass selectedFrequentlyBought - let reducer preserve it from state
        dispatch(setCart({
          ...cartData,
          loading: false,
          error: null
        } as any));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove gift voucher';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Sync local cart with server (for checkout or when needed) - DISABLED
  const syncCartWithServer = useCallback(async () => {
    // This function is disabled to prevent API calls during quantity updates
    // Cart will be synced only when actually needed (e.g., during checkout process)
    console.log('Cart sync disabled - using local state only');
    return Promise.resolve();
  }, []);



  return {
    cart,
    // Local operations (no API calls)
    updateQuantity,
    removeItem,
    saveItemForLater,
    moveItemToCart,
    removeFromSaved,
    clearCartLocal,
    // API operations
    fetchCart,
    updateCartItem,
    addToCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    applyPromoCode,
    removePromoCode,
    applyGiftVoucher,
    removeGiftVoucher,
    syncCartWithServer,
    // Utility functions
    clearPersistedCart,
  };
}; 
