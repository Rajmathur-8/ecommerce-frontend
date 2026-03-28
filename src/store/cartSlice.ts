import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    images: string[];
    price: number;
    discountPrice?: number;
    stock: number;
  };
  quantity: number;
  price: number;
  variant?: Record<string, unknown>;
}

export interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  discountAmount: number;
  coupon?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
  promoCode?: {
    code: string;
    discount: number;
    promoType?: 'percentage' | 'fixed' | 'free_shipping' | 'buy_one_get_one';
    type?: 'percentage' | 'fixed' | 'free_shipping' | 'buy_one_get_one';
  };
  giftVoucher?: {
    code: string;
    discount: number;
    voucherType?: 'percentage' | 'fixed' | 'free_shipping';
    type?: 'percentage' | 'fixed' | 'free_shipping';
  };
  loading: boolean;
  error: string | null;
  selectedFrequentlyBought: { [cartItemId: string]: string[] }; // Array of product IDs for each cart item
}

const initialState: CartState = {
  items: [],
  savedForLater: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  discountAmount: 0,
  loading: false,
  error: null,
  selectedFrequentlyBought: {},
};

const calculateCartTotals = (items: CartItem[], coupon?: CartState['coupon']) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.length; // Count unique products instead of total quantity
  
  let discountAmount = 0;
  let total = subtotal;
  
  if (coupon) {
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }
    total = Math.max(0, subtotal - discountAmount);
  }
  
  return { subtotal, itemCount, total, discountAmount };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Partial<CartState> & { items: CartItem[]; savedForLater: CartItem[]; itemCount: number; subtotal: number; total: number; discountAmount: number; loading: boolean; error: string | null }>) => {
      return { 
        ...state,
        ...action.payload,
        // Always preserve selectedFrequentlyBought, initialize if missing
        selectedFrequentlyBought: action.payload.selectedFrequentlyBought ?? state.selectedFrequentlyBought ?? {},
        promoCode: action.payload.promoCode !== undefined ? action.payload.promoCode : state.promoCode,
        giftVoucher: action.payload.giftVoucher !== undefined ? action.payload.giftVoucher : state.giftVoucher
      };
    },
    
    addToCart: (state, action: PayloadAction<{ product: { _id: string; productName: string; images: string[]; price: number; discountPrice?: number; stock: number }; quantity: number; variant?: Record<string, unknown> }>) => {
      const { product, quantity, variant } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        const price = (variant?.discountPrice as number) || (variant?.price as number) || product.discountPrice || product.price;
        state.items.push({
          _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID for local items
          product: {
            _id: product._id,
            productName: product.productName,
            images: product.images || [],
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
          },
          quantity,
          price,
          variant,
        });
      }
      
      const totals = calculateCartTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    
    updateCartItemQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      console.log('🔄 Updating cart item quantity:', { itemId, quantity });
      console.log('📦 Current cart items:', state.items.map(item => ({ id: item._id, name: item.product.productName, quantity: item.quantity })));
      
      const itemIndex = state.items.findIndex(item => item._id === itemId);
      console.log('🔍 Found item at index:', itemIndex);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          console.log('🗑️ Removing item due to quantity <= 0');
          state.items.splice(itemIndex, 1);
        } else {
          console.log('📝 Updating quantity from', state.items[itemIndex].quantity, 'to', quantity);
          state.items[itemIndex].quantity = quantity;
        }
        
        const totals = calculateCartTotals(state.items, state.coupon);
        Object.assign(state, totals);
        console.log('✅ Cart totals updated:', totals);
      } else {
      }
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      console.log('🔍 Removing item with ID:', itemId);
      console.log('📦 Before removal - Items count:', state.items.length);
      console.log('📦 Before removal - Item IDs:', state.items.map(item => item._id));
      console.log('📦 Before removal - Item details:', state.items.map(item => ({ id: item._id, name: item.product.productName, quantity: item.quantity })));
      
      const filteredItems = state.items.filter(item => item._id !== itemId);
      console.log('📦 Filtered items count:', filteredItems.length);
      console.log('📦 Filtered item IDs:', filteredItems.map(item => item._id));
      
      state.items = filteredItems;
      
      console.log('📦 After removal - Items count:', state.items.length);
      console.log('📦 After removal - Item IDs:', state.items.map(item => item._id));
      
      const totals = calculateCartTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    
    clearCart: (state) => {
      console.log('🧹 clearCart action dispatched');
      console.log('📦 Before clear - Items count:', state.items.length);
      state.items = [];
      state.savedForLater = [];
      state.itemCount = 0;
      state.subtotal = 0;
      state.total = 0;
      state.discountAmount = 0;
      state.coupon = undefined;
      state.promoCode = undefined;
      state.giftVoucher = undefined;
      // Clear frequently bought together selections when cart is cleared
      state.selectedFrequentlyBought = {};
      console.log('📦 After clear - Items count:', state.items.length);
      console.log('🧹 Cleared frequently bought together selections');
      console.log('🧹 Cleared coupon, promo code, and gift voucher');
    },
    
    saveForLater: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const itemIndex = state.items.findIndex(item => item._id === itemId);
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        state.savedForLater.push(item);
        state.items.splice(itemIndex, 1);
        
        const totals = calculateCartTotals(state.items, state.coupon);
        Object.assign(state, totals);
      }
    },
    
    moveToCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const itemIndex = state.savedForLater.findIndex(item => item._id === itemId);
      
      if (itemIndex >= 0) {
        const item = state.savedForLater[itemIndex];
        state.items.push(item);
        state.savedForLater.splice(itemIndex, 1);
        
        const totals = calculateCartTotals(state.items, state.coupon);
        Object.assign(state, totals);
      }
    },
    
    removeFromSaved: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.savedForLater = state.savedForLater.filter(item => item._id !== itemId);
    },
    
    applyCoupon: (state, action: PayloadAction<{ code: string; discount: number; type: 'percentage' | 'fixed' }>) => {
      state.coupon = action.payload;
      const totals = calculateCartTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    
    removeCoupon: (state) => {
      state.coupon = undefined;
      const totals = calculateCartTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    toggleFrequentlyBought: (state, action: PayloadAction<{ cartItemId: string; productId: string }>) => {
      const { cartItemId, productId } = action.payload;
      
      // Ensure selectedFrequentlyBought is initialized
      if (!state.selectedFrequentlyBought) {
        state.selectedFrequentlyBought = {};
      }
      
      // Initialize array for this cart item if it doesn't exist
      if (!state.selectedFrequentlyBought[cartItemId]) {
        state.selectedFrequentlyBought[cartItemId] = [];
      }
      
      const index = state.selectedFrequentlyBought[cartItemId].indexOf(productId);
      if (index > -1) {
        state.selectedFrequentlyBought[cartItemId].splice(index, 1);
      } else {
        state.selectedFrequentlyBought[cartItemId].push(productId);
      }
    },
    
    clearFrequentlyBoughtForItem: (state, action: PayloadAction<string>) => {
      const cartItemId = action.payload;
      // Ensure selectedFrequentlyBought is initialized
      if (!state.selectedFrequentlyBought) {
        state.selectedFrequentlyBought = {};
      }
      delete state.selectedFrequentlyBought[cartItemId];
    },
    
    clearAllFrequentlyBought: (state) => {
      state.selectedFrequentlyBought = {};
    },
    
    syncFrequentlyBoughtWithCart: (state) => {
      // Ensure selectedFrequentlyBought is initialized
      if (!state.selectedFrequentlyBought) {
        state.selectedFrequentlyBought = {};
        return;
      }
      
      // Remove selections for cart items that no longer exist
      // Only sync if we have items and selections
      if (state.items.length === 0 || Object.keys(state.selectedFrequentlyBought).length === 0) {
        return; // Don't modify state if there's nothing to sync
      }
      
      const cartItemIds = new Set(state.items.map(item => item._id));
      const newSelected: { [cartItemId: string]: string[] } = {};
      let hasChanges = false;
      
      Object.keys(state.selectedFrequentlyBought).forEach(cartItemId => {
        if (cartItemIds.has(cartItemId)) {
          newSelected[cartItemId] = state.selectedFrequentlyBought[cartItemId];
        } else {
          hasChanges = true; // Item was removed
        }
      });
      
      // Only update if there were actual changes
      if (hasChanges) {
        state.selectedFrequentlyBought = newSelected;
      }
    },
  },
});

export const {
  setCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  saveForLater,
  moveToCart,
  removeFromSaved,
  applyCoupon,
  removeCoupon,
  setLoading,
  setError,
  toggleFrequentlyBought,
  clearFrequentlyBoughtForItem,
  clearAllFrequentlyBought,
  syncFrequentlyBoughtWithCart,
} = cartSlice.actions;

export default cartSlice.reducer; 
