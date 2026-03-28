import { useState, useEffect, useCallback } from 'react';
import { apiService, Cart } from '../lib/api';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.getUserCart();
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number, variant?: unknown) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.addToCart({ productId, quantity, variant });
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.updateCartItem(itemId, quantity);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.removeFromCart(itemId);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.clearCart();
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.applyCoupon(code);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.removeCoupon();
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveForLater = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.saveForLater(itemId);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item for later');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveToCart = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.moveToCart(itemId);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromSaved = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.removeFromSaved(itemId);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from saved list');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, []); // Remove fetchCart dependency to prevent infinite loop

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    saveForLater,
    moveToCart,
    removeFromSaved,
    refetch: fetchCart
  };
};

export const useGuestCart = (guestId: string) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuestCart = useCallback(async () => {
    if (!guestId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.getGuestCart(guestId);
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guest cart');
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  const addToGuestCart = useCallback(async (productId: string, quantity: number, variant?: unknown) => {
    if (!guestId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.addToGuestCart({ guestId, productId, quantity, variant });
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to guest cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    fetchGuestCart();
  }, [fetchGuestCart]);

  return {
    cart,
    loading,
    error,
    addToGuestCart,
    refetch: fetchGuestCart
  };
};

export const useCartMerge = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeCart = useCallback(async (guestId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cart.mergeCart(guestId);
      if (response.success && response.data) {
        return response.data.cart;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    mergeCart
  };
}; 