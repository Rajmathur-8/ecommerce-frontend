import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeliveryInfo {
  available: boolean;
  estimatedDate: string;
  codAvailable: boolean;
  checked: boolean;
}

interface DeliveryState {
  pincode: string;
  deliveryInfo: DeliveryInfo | null;
}

const initialState: DeliveryState = {
  pincode: '',
  deliveryInfo: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setPincode: (state, action: PayloadAction<string>) => {
      state.pincode = action.payload;
    },
    setDeliveryInfo: (state, action: PayloadAction<DeliveryInfo | null>) => {
      state.deliveryInfo = action.payload;
    },
    clearDeliveryInfo: (state) => {
      state.deliveryInfo = null;
    },
    clearAll: (state) => {
      state.pincode = '';
      state.deliveryInfo = null;
    },
  },
});

export const { setPincode, setDeliveryInfo, clearDeliveryInfo, clearAll } = deliverySlice.actions;
export default deliverySlice.reducer;

