'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService, PaymentMethod } from '@/lib/api';
import { emiService } from '@/lib/emiService';

import OrderSummary from '@/components/OrderSummary';
import { CreditCard, Wallet, QrCode, Shield, Check, Lock, ArrowLeft, Gift, Percent, Banknote, Calendar, AlertCircle, Eye, EyeOff, Tag } from 'lucide-react';
import Link from 'next/link';
import { PaymentPageSkeleton } from '@/components/Skeleton';
import { useAppContext } from '@/contexts/AppContext';
import { useAppSelector } from '@/store/hooks';

import { Address } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/config';

// Define types for cart items
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
  price?: number;
}

interface Cart {
  items: CartItem[];
  discountAmount?: number;
  loading: boolean;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

interface RazorpayResponse {
  success: boolean;
  order?: RazorpayOrder;
}

interface SavedCard {
  id: string;
  cardNumber: string;
  cardType: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  lastUsed: string;
}

interface PaymentMethodDisplay {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
  totalAmount?: number;
  emiAvailable?: boolean;
  bnplAvailable?: boolean;
  codAvailable?: boolean;
  geoRestricted?: boolean;
  restrictedPincodes?: string[];
}

interface EMIPlan {
  id: string;
  bank: string;
  bankCode: string;
  cardType: 'credit' | 'debit';
  tenure: number;
  interest: number;
  emiAmount: number;
  totalAmount: number;
  processingFee: number;
  interestAmount: number;
  emiType: 'credit_card' | 'debit_card' | 'no_cost';
  eligibility: {
    minAmount: number;
    maxAmount: number;
    minCreditScore?: number;
    cardTypes: string[];
  };
  features: string[];
  terms: string[];
  partnerBanks?: string[];
}

interface BNPLOption {
  id: string;
  provider: string;
  name: string;
  description: string;
  creditLimit: number;
}

interface PromoCode {
  code: string;
  description: string;
  discount: number;
  minAmount: number;
  maxDiscount: number;
  validUntil: string;
}

interface GiftVoucher {
  code: string;
  value: number;
  validUntil: string;
}

interface BankOffer {
  id: string;
  bank: string;
  offer: string;
  discount: number;
  minAmount: number;
  maxDiscount: number;
  description: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get('address');
  const { cart: cartContext } = useAppContext();
  
  // Get selected frequently bought together items from Redux
  const selectedFrequentlyBoughtRedux = useAppSelector(state => state.cart.selectedFrequentlyBought || {});
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<{ [productId: string]: any[] }>({});
  
  // Store frequently bought together in a ref to preserve it during payment
  const frequentlyBoughtTogetherRef = useRef<{ [cartItemId: string]: string[] }>({});
  
  // Update ref whenever Redux state changes
  useEffect(() => {
    if (selectedFrequentlyBoughtRedux && typeof selectedFrequentlyBoughtRedux === 'object' && Object.keys(selectedFrequentlyBoughtRedux).length > 0) {
      frequentlyBoughtTogetherRef.current = selectedFrequentlyBoughtRedux;
      console.log('📦 Updated frequentlyBoughtTogetherRef:', frequentlyBoughtTogetherRef.current);
    }
  }, [selectedFrequentlyBoughtRedux]);
  
  // Convert Redux state to Set format for OrderSummary
  const selectedFrequentlyBought: { [cartItemId: string]: Set<string> } = {};
  if (selectedFrequentlyBoughtRedux && typeof selectedFrequentlyBoughtRedux === 'object') {
    Object.keys(selectedFrequentlyBoughtRedux).forEach(cartItemId => {
      selectedFrequentlyBought[cartItemId] = new Set(selectedFrequentlyBoughtRedux[cartItemId] || []);
    });
  }
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [cart, setCart] = useState<{ items: unknown[]; total: number; itemCount: number; subtotal: number } | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state variables
  const [showEMIOptions, setShowEMIOptions] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState<EMIPlan | null>(null);
  const [, setShowBNPLOptions] = useState(false);
  const [selectedBNPL, setSelectedBNPL] = useState<BNPLOption | null>(null);
  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);

  // Gift Voucher State
  const [giftVoucherCode, setGiftVoucherCode] = useState('');
  const [giftVoucherLoading, setGiftVoucherLoading] = useState(false);
  const [giftVoucherError, setGiftVoucherError] = useState('');
  const [appliedGiftVoucher, setAppliedGiftVoucher] = useState<GiftVoucher | null>(null);

  // Reward Points State (read from localStorage)
  const [rewardPointsDiscount, setRewardPointsDiscount] = useState(0);
  const [rewardPointsRedeemed, setRewardPointsRedeemed] = useState(false);
  
  // Load reward points redemption from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRedeemed = localStorage.getItem('rewardPointsRedeemed');
      const savedAmount = localStorage.getItem('rewardPointsAmount');
      if (savedRedeemed === 'true' && savedAmount) {
        setRewardPointsRedeemed(true);
        setRewardPointsDiscount(parseFloat(savedAmount));
      }
    }
  }, []);

  // Bank Offers State
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  const [selectedBankOffer, setSelectedBankOffer] = useState<BankOffer | null>(null);
  const [, setShowAllBankOffers] = useState(false);
  const [showBankOffersPopup, setShowBankOffersPopup] = useState(false);
  const [codAvailable, setCodAvailable] = useState(true);
  const [codRestrictionMessage, setCodRestrictionMessage] = useState('');
  
  // Promo Codes, Gift Vouchers, and Digital Wallets State
  const [availablePromoCodes, setAvailablePromoCodes] = useState<any[]>([]);
  const [availableGiftVouchers, setAvailableGiftVouchers] = useState<any[]>([]);
  const [availableDigitalWallets, setAvailableDigitalWallets] = useState<any[]>([]);
  const [showPromoCodeList, setShowPromoCodeList] = useState(false);
  const [showGiftVoucherList, setShowGiftVoucherList] = useState(false);

  // State for EMI plans
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);
  const [emiLoading, setEmiLoading] = useState(false);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cardBrand, setCardBrand] = useState<string>('');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showBankList, setShowBankList] = useState(false);

  // Digital Wallet State
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [, setShowWalletList] = useState(false);

  // Payment Form Popup State
  const [showPaymentFormPopup, setShowPaymentFormPopup] = useState(false);

  // Saved Card State
  const [savedCards, setSavedCards] = useState<Array<{
    id: string;
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cardType: 'credit' | 'debit';
    cardBrand: string;
    lastUsed: Date;
  }>>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('');
  const [showSavedCards, setShowSavedCards] = useState(false);

  // Credit Card Helper Functions
  const detectCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    if (/^35/.test(cleanNumber)) return 'jcb';
    if (/^62/.test(cleanNumber)) return 'unionpay';
    
    return '';
  };

  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\s/g, '');
    const cardBrand = detectCardBrand(cleanValue);
    
    if (cardBrand === 'amex') {
      // American Express: XXXX XXXXXX XXXXX
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      // Other cards: XXXX XXXX XXXX XXXX
      return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
  };

  const validateCardNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validateExpiry = (month: string, year: string): boolean => {
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  };

  const validateCvv = (cvv: string, cardBrand: string): boolean => {
    if (cardBrand === 'amex') {
      return cvv.length === 4;
    }
    return cvv.length === 3;
  };

  // Saved Card Functions
  const saveCard = () => {
    if (!isCardFormValid()) return;
    
    const newCard = {
      id: Date.now().toString(),
      cardNumber: cardNumber,
      cardHolderName: cardHolderName,
      expiryMonth: expiryMonth,
      expiryYear: expiryYear,
      cardType: cardType,
      cardBrand: cardBrand,
      lastUsed: new Date()
    };
    
    setSavedCards(prev => [newCard, ...prev]);
    
    // Save to localStorage
    const existingCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
    localStorage.setItem('savedCards', JSON.stringify([newCard, ...existingCards]));
  };

  const loadSavedCards = () => {
    const saved = localStorage.getItem('savedCards');
    if (saved) {
      const cards = JSON.parse(saved);
      setSavedCards(cards.map((card: SavedCard) => ({
        ...card,
        lastUsed: new Date(card.lastUsed)
      })));
    }
  };

  const selectSavedCard = (cardId: string) => {
    const card = savedCards.find(c => c.id === cardId);
    if (card) {
      setCardNumber(card.cardNumber);
      setCardHolderName(card.cardHolderName);
      setExpiryMonth(card.expiryMonth);
      setExpiryYear(card.expiryYear);
      setCardType(card.cardType);
      setCardBrand(card.cardBrand);
      setSelectedSavedCard(cardId);
      setShowSavedCards(false);
    }
  };

  const maskCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length <= 4) return cardNumber;
    return `**** **** **** ${cleanNumber.slice(-4)}`;
  };

  const isCardAlreadySaved = (): boolean => {
    return savedCards.some(card => 
      card.cardNumber === cardNumber &&
      card.cardHolderName === cardHolderName &&
      card.expiryMonth === expiryMonth &&
      card.expiryYear === expiryYear
    );
  };

  const isCardFormValid = (): boolean => {
    return (
      validateCardNumber(cardNumber) &&
      cardHolderName.trim().length > 0 &&
      validateExpiry(expiryMonth, expiryYear) &&
      validateCvv(cvv, cardBrand)
    );
  };

  // Promo Code Functions - using cartContext
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoCodeLoading(true);
    setPromoCodeError('');
    
    try {
      await cartContext.applyPromoCode(promoCode);
      setPromoCode('');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Promo code applied successfully!', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid promo code. Please try again.';
      setPromoCodeError(errorMessage);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setPromoCodeLoading(false);
    }
  };

  const handleRemovePromoCode = async () => {
    try {
      setPromoCodeError('');
      await cartContext.removePromoCode();
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Promo code removed successfully!', 'success');
      }
    } catch (error) {
      setPromoCodeError('Failed to remove promo code');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to remove promo code. Please try again.', 'error');
      }
    }
  };

  // Gift Voucher Functions - using cartContext
  const handleApplyGiftVoucher = async () => {
    if (!giftVoucherCode.trim()) return;
    
    setGiftVoucherLoading(true);
    setGiftVoucherError('');
    
    try {
      await cartContext.applyGiftVoucher(giftVoucherCode);
      setGiftVoucherCode('');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Gift voucher applied successfully!', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid gift voucher code. Please try again.';
      setGiftVoucherError(errorMessage);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setGiftVoucherLoading(false);
    }
  };

  const handleRemoveGiftVoucher = async () => {
    try {
      setGiftVoucherError('');
      await cartContext.removeGiftVoucher();
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Gift voucher removed successfully!', 'success');
      }
    } catch (error) {
      setGiftVoucherError('Failed to remove gift voucher');
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to remove gift voucher. Please try again.', 'error');
      }
    }
  };

  // Digital Wallet Options - will be fetched from API
  const digitalWallets = availableDigitalWallets.length > 0 
    ? availableDigitalWallets.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        color: wallet.color || '#4285F4',
        logoText: wallet.name.substring(0, 5),
        logoStyle: wallet.icon || wallet.id,
        razorpayCode: wallet.id,
        method: 'wallet',
        description: wallet.description || `Pay using ${wallet.name}`
      }))
    : [
        {
          id: 'googlepay',
          name: 'Google Pay',
          color: '#4285F4',
          logoText: 'GPay',
          logoStyle: 'googlepay',
          razorpayCode: 'googlepay',
          method: 'wallet',
          description: 'Pay using Google Pay UPI'
        },
        {
          id: 'phonepe',
          name: 'PhonePe',
          color: '#5F259F',
          logoText: 'PhonePe',
          logoStyle: 'phonepe',
          razorpayCode: 'phonepe',
          method: 'wallet',
          description: 'Pay using PhonePe UPI'
        },
        {
          id: 'paytm',
          name: 'Paytm',
          color: '#00BAF2',
          logoText: 'Paytm',
          logoStyle: 'paytm',
          razorpayCode: 'paytm',
          method: 'wallet',
          description: 'Pay using Paytm UPI'
        }
      ];

  // Net Banking Banks List with Razorpay Bank Codes
  const netBankingBanks = [
    { 
      id: 'hdfc', 
      name: 'HDFC Bank', 
      code: 'HDFC', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'HDFC',
      logoStyle: 'hdfc',
      razorpayCode: 'HDFC'
    },
    { 
      id: 'icici', 
      name: 'ICICI Bank', 
      code: 'ICIC', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'ICICI',
      logoStyle: 'icici',
      razorpayCode: 'ICIC'
    },
    { 
      id: 'sbi', 
      name: 'State Bank of India', 
      code: 'SBI', 
      logo: '🏦',
      color: '#1E3A8A',
      logoText: 'SBI',
      logoStyle: 'sbi',
      razorpayCode: 'SBIN'
    },
    { 
      id: 'axis', 
      name: 'Axis Bank', 
      code: 'AXIS', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'AXIS',
      logoStyle: 'axis',
      razorpayCode: 'AXIS'
    },
    { 
      id: 'kotak', 
      name: 'Kotak Mahindra Bank', 
      code: 'KOTK', 
      logo: '🏦',
      color: '#059669',
      logoText: 'KOTAK',
      logoStyle: 'kotak',
      razorpayCode: 'KKBK'
    },
    { 
      id: 'yes', 
      name: 'YES Bank', 
      code: 'YES', 
      logo: '🏦',
      color: '#7C3AED',
      logoText: 'YES',
      logoStyle: 'yes',
      razorpayCode: 'YESB'
    },
    { 
      id: 'pnb', 
      name: 'Punjab National Bank', 
      code: 'PNB', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'PNB',
      logoStyle: 'pnb',
      razorpayCode: 'PUNB'
    },
    { 
      id: 'canara', 
      name: 'Canara Bank', 
      code: 'CANR', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'CANARA',
      logoStyle: 'canara'
    },
    { 
      id: 'union', 
      name: 'Union Bank of India', 
      code: 'UNIO', 
      logo: '🏦',
      color: '#1E40AF',
      logoText: 'UNION',
      logoStyle: 'union'
    },
    { 
      id: 'bankofbaroda', 
      name: 'Bank of Baroda', 
      code: 'BOB', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'BOB',
      logoStyle: 'bob'
    },
    { 
      id: 'idbi', 
      name: 'IDBI Bank', 
      code: 'IDBI', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'IDBI',
      logoStyle: 'idbi'
    },
    { 
      id: 'indianbank', 
      name: 'Indian Bank', 
      code: 'INDB', 
      logo: '🏦',
      color: '#1E40AF',
      logoText: 'INDIAN',
      logoStyle: 'indianbank'
    },
    { 
      id: 'centralbank', 
      name: 'Central Bank of India', 
      code: 'CBI', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'CBI',
      logoStyle: 'centralbank'
    },
    { 
      id: 'iob', 
      name: 'Indian Overseas Bank', 
      code: 'IOB', 
      logo: '🏦',
      color: '#1E40AF',
      logoText: 'IOB',
      logoStyle: 'iob'
    },
    { 
      id: 'uco', 
      name: 'UCO Bank', 
      code: 'UCO', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'UCO',
      logoStyle: 'uco'
    },
    { 
      id: 'pandb', 
      name: 'Punjab & Sind Bank', 
      code: 'PSB', 
      logo: '🏦',
      color: '#DC2626',
      logoText: 'PSB',
      logoStyle: 'pandb'
    },
    { 
      id: 'federal', 
      name: 'Federal Bank', 
      code: 'FEDB', 
      logo: '🏦',
      color: '#059669',
      logoText: 'FEDERAL',
      logoStyle: 'federal'
    },
    { 
      id: 'karnataka', 
      name: 'Karnataka Bank', 
      code: 'KARB', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'KARNATAKA',
      logoStyle: 'karnataka'
    },
    { 
      id: 'southindian', 
      name: 'South Indian Bank', 
      code: 'SIB', 
      logo: '🏦',
      color: '#1E40AF',
      logoText: 'SIB',
      logoStyle: 'southindian'
    },
    { 
      id: 'tmb', 
      name: 'Tamilnad Mercantile Bank', 
      code: 'TMB', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'TMB',
      logoStyle: 'tmb'
    },
    { 
      id: 'dcb', 
      name: 'DCB Bank', 
      code: 'DCB', 
      logo: '🏦',
      color: '#059669',
      logoText: 'DCB',
      logoStyle: 'dcb'
    },
    { 
      id: 'rbl', 
      name: 'RBL Bank', 
      code: 'RBL', 
      logo: '🏦',
      color: '#7C3AED',
      logoText: 'RBL',
      logoStyle: 'rbl'
    },
    { 
      id: 'idfc', 
      name: 'IDFC First Bank', 
      code: 'IDFC', 
      logo: '🏦',
      color: '#059669',
      logoText: 'IDFC',
      logoStyle: 'idfc'
    },
    { 
      id: 'bandhan', 
      name: 'Bandhan Bank', 
      code: 'BAND', 
      logo: '🏦',
      color: '#7C3AED',
      logoText: 'BANDHAN',
      logoStyle: 'bandhan'
    },
    { 
      id: 'csb', 
      name: 'CSB Bank', 
      code: 'CSB', 
      logo: '🏦',
      color: '#1E40AF',
      logoText: 'CSB',
      logoStyle: 'csb'
    },
    { 
      id: 'au', 
      name: 'AU Small Finance Bank', 
      code: 'AU', 
      logo: '🏦',
      color: '#FF6B35',
      logoText: 'AU',
      logoStyle: 'au'
    },
    { 
      id: 'equitas', 
      name: 'Equitas Small Finance Bank', 
      code: 'EQTS', 
      logo: '🏦',
      color: '#059669',
      logoText: 'EQUITAS',
      logoStyle: 'equitas'
    },
    { 
      id: 'ujjivan', 
      name: 'Ujjivan Small Finance Bank', 
      code: 'UJJI', 
      logo: '🏦',
      color: '#7C3AED',
      logoText: 'UJJIVAN',
      logoStyle: 'ujjivan'
    }
  ];

  const isNetBankingValid = (): boolean => {
    return selectedBank.trim().length > 0;
  };

  const isDigitalWalletValid = (): boolean => {
    return selectedWallet.trim().length > 0;
  };

  // Bank Logo Renderer Function
  const renderBankLogo = (bank: { logoStyle: string; logoText: string; color: string }) => {
    const { logoStyle, logoText } = bank;
    
    switch (logoStyle) {
      case 'sbi':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">STATE BANK</div>
            <div className="text-[8px] leading-none text-white font-bold">OF INDIA</div>
          </div>
        );
      
      case 'hdfc':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">HDFC</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'icici':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">ICICI</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'axis':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">AXIS</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'kotak':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">KOTAK</div>
            <div className="text-[5px] leading-none text-white">MAHINDRA</div>
          </div>
        );
      
      case 'yes':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[9px] leading-none text-white font-bold">YES</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'pnb':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">PUNJAB</div>
            <div className="text-[6px] leading-none text-white">NATIONAL</div>
          </div>
        );
      
      case 'canara':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">CANARA</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'union':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">UNION</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'bob':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">BANK OF</div>
            <div className="text-[6px] leading-none text-white">BARODA</div>
          </div>
        );
      
      case 'idbi':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">IDBI</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'indianbank':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">INDIAN</div>
            <div className="text-[6px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'centralbank':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">CENTRAL</div>
            <div className="text-[6px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'iob':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">INDIAN</div>
            <div className="text-[6px] leading-none text-white">OVERSEAS</div>
          </div>
        );
      
      case 'uco':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">UCO</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'pandb':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">PUNJAB &</div>
            <div className="text-[5px] leading-none text-white">SIND BANK</div>
          </div>
        );
      
      case 'federal':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">FEDERAL</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'karnataka':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">KARNATAKA</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'southindian':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">SOUTH</div>
            <div className="text-[5px] leading-none text-white">INDIAN</div>
          </div>
        );
      
      case 'tmb':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">TAMILNAD</div>
            <div className="text-[5px] leading-none text-white">MERCANTILE</div>
          </div>
        );
      
      case 'dcb':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">DCB</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'rbl':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">RBL</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'idfc':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">IDFC</div>
            <div className="text-[5px] leading-none text-white">FIRST</div>
          </div>
        );
      
      case 'bandhan':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[6px] leading-none text-white font-bold">BANDHAN</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'csb':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">CSB</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'au':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">AU</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
      
      case 'equitas':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">EQUITAS</div>
            <div className="text-[5px] leading-none text-white">SFB</div>
          </div>
        );
      
      case 'ujjivan':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[5px] leading-none text-white font-bold">UJJIVAN</div>
            <div className="text-[5px] leading-none text-white">SFB</div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[7px] leading-none text-white font-bold">{logoText}</div>
            <div className="text-[5px] leading-none text-white">BANK</div>
          </div>
        );
    }
  };

  // Wallet Logo Renderer Function
  const renderWalletLogo = (wallet: { logoStyle: string; logoText: string; color: string }) => {
    const { logoStyle, logoText } = wallet;
    
    switch (logoStyle) {
      case 'googlepay':
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#4285F4"/>
              <path d="M7.5 8.5C7.5 7.67 8.17 7 9 7H15C15.83 7 16.5 7.67 16.5 8.5V15.5C16.5 16.33 15.83 17 15 17H9C8.17 17 7.5 16.33 7.5 15.5V8.5Z" fill="white"/>
              <path d="M9.5 9.5H14.5V10.5H9.5V9.5Z" fill="#4285F4"/>
              <path d="M9.5 11.5H14.5V12.5H9.5V11.5Z" fill="#4285F4"/>
              <path d="M9.5 13.5H12.5V14.5H9.5V13.5Z" fill="#4285F4"/>
              <circle cx="10.5" cy="10" r="0.5" fill="#4285F4"/>
            </svg>
          </div>
        );
      
      case 'phonepe':
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#5F259F"/>
              <path d="M6 8C6 7.45 6.45 7 7 7H17C17.55 7 18 7.45 18 8V16C18 16.55 17.55 17 17 17H7C6.45 17 6 16.55 6 16V8Z" fill="white"/>
              <path d="M8 9H16V10H8V9Z" fill="#5F259F"/>
              <path d="M8 11H16V12H8V11Z" fill="#5F259F"/>
              <path d="M8 13H14V14H8V13Z" fill="#5F259F"/>
              <circle cx="9" cy="9.5" r="0.5" fill="#5F259F"/>
              <path d="M15 9.5C15.28 9.5 15.5 9.72 15.5 10C15.5 10.28 15.28 10.5 15 10.5C14.72 10.5 14.5 10.28 14.5 10C14.5 9.72 14.72 9.5 15 9.5Z" fill="#5F259F"/>
            </svg>
          </div>
        );
      
      case 'paytm':
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#00BAF2"/>
              <path d="M7 8C7 7.45 7.45 7 8 7H16C16.55 7 17 7.45 17 8V16C17 16.55 16.55 17 16 17H8C7.45 17 7 16.55 7 16V8Z" fill="white"/>
              <path d="M9 9H15V10H9V9Z" fill="#00BAF2"/>
              <path d="M9 11H15V12H9V11Z" fill="#00BAF2"/>
              <path d="M9 13H13V14H9V13Z" fill="#00BAF2"/>
              <circle cx="10" cy="9.5" r="0.5" fill="#00BAF2"/>
              <path d="M14 9.5C14.28 9.5 14.5 9.72 14.5 10C14.5 10.28 14.28 10.5 14 10.5C13.72 10.5 13.5 10.28 13.5 10C13.5 9.72 13.72 9.5 14 9.5Z" fill="#00BAF2"/>
            </svg>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-[10px] leading-none font-bold text-white">{logoText}</div>
          </div>
        );
    }
  };

  // Fetch genuine EMI plans from bank APIs
  const fetchEMIPlans = async (amount: number) => {
    if (amount < 3000) {
      setEmiPlans([]);
      return; // Minimum amount for EMI
    }
    
    setEmiLoading(true);
    try {
      const plans = await emiService.getEMIPlans(amount);
      setEmiPlans(plans);
      console.log('📊 Fetched EMI plans:', plans);
    } catch (error) {
      console.error('❌ Error fetching EMI plans:', error);
      setEmiPlans([]);
    } finally {
      setEmiLoading(false);
    }
  };

  // Dynamic BNPL options based on cart amount
  const getBNPLOptions = (amount: number): BNPLOption[] => {
    const options: BNPLOption[] = [
      {
        id: 'lazypay',
        provider: 'LazyPay',
        name: 'LazyPay Credit',
        description: 'Pay in 15 days • No hidden charges • Instant credit',
        creditLimit: 10000
      },
      {
        id: 'simpl',
        provider: 'Simpl',
        name: 'Simpl Pay Later',
        description: 'Pay in 15 days • No cost EMI • Instant approval',
        creditLimit: 25000
      },
      {
        id: 'zestmoney',
        provider: 'ZestMoney',
        name: 'ZestMoney EMI',
        description: '0% EMI • No credit card required • Quick approval',
        creditLimit: 100000
      },
      {
        id: 'paytm_postpaid',
        provider: 'Paytm Postpaid',
        name: 'Paytm Postpaid',
        description: 'Pay later • No cost EMI • UPI integration',
        creditLimit: 50000
      },
      {
        id: 'amazon_pay_later',
        provider: 'Amazon Pay',
        name: 'Amazon Pay Later',
        description: 'Pay in 30 days • No cost EMI • Amazon rewards',
        creditLimit: 60000
      },
      {
        id: 'flipkart_pay_later',
        provider: 'Flipkart',
        name: 'Flipkart Pay Later',
        description: 'Pay in 15 days • No cost EMI • Flipkart rewards',
        creditLimit: 40000
      },
      {
        id: 'bajaj_finserv',
        provider: 'Bajaj Finserv',
        name: 'Bajaj Finserv EMI',
        description: '0% EMI • No cost processing • Instant approval',
        creditLimit: 150000
      },
      {
        id: 'hdfc_emi',
        provider: 'HDFC Bank',
        name: 'HDFC EMI Card',
        description: 'No cost EMI • Credit card not required • Quick approval',
        creditLimit: 200000
      }
    ];

    // Filter options based on cart amount and credit limit
    // For now, show all options regardless of amount for testing
    return options;
    // return options.filter(option => option.creditLimit >= amount);
  };

  // Get current BNPL options based on cart total
  const bnplOptions = getBNPLOptions(cart?.total || 0);
  
  // Debug: Log BNPL options
  console.log('BNPL Options:', bnplOptions);
  console.log('Cart Total:', cart?.total);
  console.log('Selected Payment Method:', selectedPaymentMethod);

  // Fetch bank offers from API
  const fetchBankOffers = async () => {
    try {
      const cartTotal = cart?.total || cart?.subtotal || 0;
      const response = await apiService.bankOffer.getBankOffers(cartTotal);
      if (response.success && response.data) {
        setBankOffers(response.data.map((offer: any) => ({
          id: offer.id,
          bank: offer.bank,
          offer: offer.offer,
          discount: offer.discount,
          minAmount: offer.minAmount,
          maxDiscount: offer.maxDiscount,
          description: offer.description
        })));
      } else {
        // Fallback to empty array if API fails
        setBankOffers([]);
      }
    } catch (error) {
      console.error('Error fetching bank offers:', error);
      setBankOffers([]);
    }
  };

  // Fetch promo codes from API
  const fetchPromoCodes = async () => {
    try {
      const response = await apiService.promo.getActivePromoCodes();
      if (response.success && response.data) {
        setAvailablePromoCodes(response.data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  // Fetch gift vouchers from API
  const fetchGiftVouchers = async () => {
    try {
      const response = await apiService.giftVoucher.getActiveGiftVouchers();
      if (response.success && response.data) {
        setAvailableGiftVouchers(response.data);
      }
    } catch (error) {
      console.error('Error fetching gift vouchers:', error);
    }
  };

  // Fetch digital wallets from API
  const fetchDigitalWallets = async () => {
    try {
      const response = await apiService.wallet.getDigitalWallets();
      if (response.success && response.data) {
        setAvailableDigitalWallets(response.data);
      }
    } catch (error) {
      console.error('Error fetching digital wallets:', error);
    }
  };

  // Use bankOffers state instead of hardcoded array
  const availableBankOffers = bankOffers;

  // Debug logging
  console.log('PaymentPage - paymentMethods:', paymentMethods);
  console.log('PaymentPage - selectedPaymentMethod:', selectedPaymentMethod);
  console.log('PaymentPage - cart:', cart);
  console.log('PaymentPage - emiPlans:', emiPlans);
  console.log('PaymentPage - bnplOptions:', bnplOptions);
  // Promo codes removed - replaced with real bank offers
  console.log('PaymentPage - availableBankOffers:', availableBankOffers);

  // Function to get icon for payment method
  const getPaymentMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      case 'qr-code':
        return <QrCode className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };
  
  // Force add BNPL method if not present
  if (paymentMethods.length > 0 && !paymentMethods.find(m => m.id === 'bnpl')) {
    console.log('BNPL method not found, adding it manually');
    const bnplMethod: PaymentMethodDisplay = {
      id: 'bnpl',
      name: 'Buy Now Pay Later',
      icon: getPaymentMethodIcon('credit-card'),
      description: 'Pay later with LazyPay, Simpl, ZestMoney and more',
      popular: true,

      totalAmount: cart?.total || 0,
      emiAvailable: false,
      bnplAvailable: true,
      codAvailable: false,
      geoRestricted: false
    };
    setPaymentMethods([...paymentMethods, bnplMethod]);
  }

  // Function to convert API payment methods to display format
  const convertPaymentMethods = (apiMethods: PaymentMethod[]): PaymentMethodDisplay[] => {
    return apiMethods.map(method => ({
      id: method._id,
      name: method.name,
      icon: getPaymentMethodIcon(method.icon),
      description: method.description,
      popular: method.isPopular,

      totalAmount: method.totalAmount,
      emiAvailable: method.name.toLowerCase().includes('credit') || method.name.toLowerCase().includes('debit'),
      bnplAvailable: true,
      codAvailable: method.name.toLowerCase().includes('cod') || method.name.toLowerCase().includes('cash'),
      geoRestricted: method.name.toLowerCase().includes('cod'),
      restrictedPincodes: ['400001', '400002', '400003'] // Mock restricted pincodes
    }));
  };

  // Check COD availability based on pincode
  const checkCODAvailability = (pincode: string) => {
    const restrictedPincodes = ['400001', '400002', '400003']; // Mock data
    if (restrictedPincodes.includes(pincode)) {
      setCodAvailable(false);
      setCodRestrictionMessage('COD not available for this pincode');
    } else {
      setCodAvailable(true);
      setCodRestrictionMessage('');
    }
  };

  // Promo code functionality removed - replaced with real bank offers

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!cart) return 0;
    
    let discount = 0;
    
    // Bank offer discount
    if (selectedBankOffer) {
      console.log('🏦 Bank Offer Debug:');
      console.log('  - Selected bank offer:', selectedBankOffer);
      console.log('  - Cart subtotal:', cart.subtotal);
      console.log('  - Cart total:', cart.total);
      console.log('  - Cart items:', cart.items);
      
      // Use subtotal for calculation, but ensure it's valid
      const subtotalForCalculation = cart.subtotal || cart.total || 0;
      const calculatedDiscount = Math.min((subtotalForCalculation * selectedBankOffer.discount) / 100, selectedBankOffer.maxDiscount);
      
      console.log('  - Subtotal for calculation:', subtotalForCalculation);
      console.log('  - Calculated discount:', calculatedDiscount);
      
      discount += calculatedDiscount;
    }
    
    console.log('🏦 Final bank offer discount:', discount);
    return discount;
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    if (!cart) return 0;
    
    console.log('💰 Payment Calculation Debug:');
    console.log('  - Cart object:', cart);
    console.log('  - Selected bank offer:', selectedBankOffer);
    console.log('  - Reward points discount:', rewardPointsDiscount);
    
    // Always calculate using discount prices (discountPrice if available, otherwise regular price)
    const cartItems = (cart?.items || []) as CartItem[];
    
    let productTotal = 0;
    let warrantyTotal = 0;
    
    // Calculate frequently bought together total from cart items (automatic, like warranty)
    let frequentlyBoughtTotal = 0;
    const processedFBTProducts = new Set<string>(); // Track processed products to avoid double counting
    
    cartItems.forEach((item: CartItem) => {
      // Use variant price if variant exists, otherwise use product price
      const variantPrice = item.variant && typeof item.variant === 'object' && 'price' in item.variant 
        ? item.variant.price 
        : item?.product?.price || 0;
      const variantDiscountPrice = item.variant && typeof item.variant === 'object' && 'discountPrice' in item.variant 
        ? item.variant.discountPrice 
        : item?.product?.discountPrice;
      
      // Prioritize discount price for total calculation (same as OrderSummary)
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
    
    // Only add user-selected frequently bought together items (no automatic addition)
    Object.entries(selectedFrequentlyBought).forEach(([cartItemId, productIds]) => {
      // Convert Set to Array if needed
      const productIdsArray = productIds instanceof Set ? Array.from(productIds) : (Array.isArray(productIds) ? productIds : []);
      productIdsArray.forEach((productId) => {
        // Skip if already processed in automatic calculation
        if (processedFBTProducts.has(productId.toString())) return;
        
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
            processedFBTProducts.add(productId.toString()); // Mark as processed
            break; // Found the product, no need to search in other arrays
          }
        }
      });
    });

    const totalWithDiscounts = productTotal + warrantyTotal + frequentlyBoughtTotal;

    // Get discounts separately from cart context
    const cartContextCart = (cartContext as any)?.cart;
    
    // Get promo code discount (already calculated amount)
    const promoCodeDiscount = cartContextCart?.promoCode?.discount 
      ? Math.round(cartContextCart.promoCode.discount) 
      : 0;
    
    // Get gift voucher discount (already calculated amount)
    const giftVoucherDiscount = cartContextCart?.giftVoucher?.discount 
      ? Math.round(cartContextCart.giftVoucher.discount) 
      : 0;
    
    // Calculate coupon discount separately from coupon value and type
    // cart.coupon.discount stores the coupon VALUE (percentage or fixed amount), not the calculated discount
    let couponDiscount = 0;
    if (cartContextCart?.coupon && cartContextCart?.coupon?.discount !== undefined) {
      const coupon = cartContextCart.coupon;
      const couponType = coupon.couponType || coupon.type;
      // Calculate discount from coupon value and type
      // For percentage coupons, use subtotal (product + warranty) without frequently bought together
      // For fixed amount, use the fixed value
      const subtotalForCoupon = productTotal + warrantyTotal;
      if (couponType === 'percentage') {
        couponDiscount = Math.round((subtotalForCoupon * coupon.discount) / 100);
      } else {
        // Fixed amount discount
        couponDiscount = Math.round(coupon.discount);
      }
    }
    
    // Apply additional discounts
    const bankOfferDiscount = Math.round(calculateDiscount());
    const rewardDiscount = Math.round(rewardPointsDiscount);
    
    console.log('💰 Payment Calculation Debug:');
    console.log('  - Product total:', productTotal);
    console.log('  - Warranty total:', warrantyTotal);
    console.log('  - Frequently bought together total:', frequentlyBoughtTotal);
    console.log('  - Total with discounts:', totalWithDiscounts);
    console.log('  - Coupon discount:', couponDiscount);
    console.log('  - Promo code discount:', promoCodeDiscount);
    console.log('  - Gift voucher discount:', giftVoucherDiscount);
    console.log('  - Bank offer discount:', bankOfferDiscount);
    console.log('  - Reward points discount:', rewardDiscount);
    console.log('  - Selected bank offer:', selectedBankOffer);
    
    // Return the final amount after applying all discounts (rounded)
    const finalTotal = Math.max(0, totalWithDiscounts - couponDiscount - promoCodeDiscount - giftVoucherDiscount - bankOfferDiscount - rewardDiscount);
    console.log('  - Final total (rounded):', Math.round(finalTotal));
    
    return Math.round(finalTotal);
  };

  // Recalculate EMI plans when discounts change
  useEffect(() => {
    if (cart) {
      const finalTotal = calculateFinalTotal();
      if (finalTotal > 0 && finalTotal !== cart.total) {
        fetchEMIPlans(finalTotal);
      }
    }
  }, [appliedPromoCode, appliedGiftVoucher, selectedBankOffer, rewardPointsDiscount, cart]);

  useEffect(() => {
    // Load saved cards on component mount
    loadSavedCards();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch address details
        if (addressId) {
          const addressResponse = await apiService.address.getAddresses();
          if (addressResponse.success && addressResponse.addresses) {
            const selectedAddress = addressResponse.addresses.find((addr: Address) => addr._id === addressId);
            if (selectedAddress) {
              setAddress(selectedAddress);
              checkCODAvailability(selectedAddress.pincode);
            }
          }
        }
        
        // Fetch cart data
        const cartResponse = await apiService.cart.getUserCart();
        if (cartResponse.success && cartResponse.data) {
          setCart(cartResponse.data.cart);
          // Fetch EMI plans after cart data is loaded with final total (after discounts)
          const cartTotal = cartResponse.data.cart.total || cartResponse.data.cart.subtotal || 0;
          await fetchEMIPlans(cartTotal);
        }

        // Fetch bank offers, promo codes, gift vouchers, and digital wallets
        await Promise.all([
          fetchBankOffers(),
          fetchPromoCodes(),
          fetchGiftVouchers(),
          fetchDigitalWallets()
        ]);

        // Fetch payment methods
        let paymentMethodsSet = false;
        try {
          const paymentMethodsResponse = await apiService.payment.getPaymentMethods();
          if (paymentMethodsResponse.success && paymentMethodsResponse.data?.paymentMethods) {
            const convertedMethods = convertPaymentMethods(paymentMethodsResponse.data.paymentMethods);
            setPaymentMethods(convertedMethods);
            paymentMethodsSet = true;

          }
        } catch (error) {
          console.log('Payment methods API not available, using fallback methods');
        }

        // If API failed or no methods returned, use fallback methods
        if (!paymentMethodsSet) {
          const subtotal = cart?.subtotal || 0;
          console.log('Setting fallback payment methods with subtotal:', subtotal);
          const fallbackMethods: PaymentMethodDisplay[] = [
            {
              id: 'razorpay',
              name: 'Credit/Debit Card',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay securely with credit cards, debit cards',
              popular: true,
              totalAmount: subtotal,
              emiAvailable: true,
              bnplAvailable: true,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'netbanking',
              name: 'Net Banking',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay using your bank\'s internet banking',
              popular: false,
              totalAmount: subtotal,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'wallet',
              name: 'Digital Wallets',
              icon: getPaymentMethodIcon('wallet'),
              description: 'Pay using Paytm, PhonePe, Google Pay, and other wallets',
              popular: false,
              totalAmount: subtotal,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'bnpl',
              name: 'Buy Now Pay Later',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay later with LazyPay, Simpl, ZestMoney and more',
              popular: true,
              totalAmount: subtotal,
              emiAvailable: false,
              bnplAvailable: true,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'emi',
              name: 'EMI Payment',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay in easy monthly installments with 0% interest',
              popular: true,
              totalAmount: subtotal,
              emiAvailable: true,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'cod',
              name: 'Cash on Delivery',
              icon: getPaymentMethodIcon('shield'),
              description: 'Pay with cash when you receive your order',
              popular: false,
              totalAmount: subtotal,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: true,
              geoRestricted: true,
              restrictedPincodes: ['400001', '400002', '400003']
            }
          ];
          setPaymentMethods(fallbackMethods);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Final fallback: ensure payment methods are always set
        if (paymentMethods.length === 0) {
          console.log('Final fallback: setting default payment methods');
          const defaultMethods: PaymentMethodDisplay[] = [
            {
              id: 'razorpay',
              name: 'Credit/Debit Card',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay securely with credit cards & debit cards',
              popular: true,
              totalAmount: 0,
              emiAvailable: true,
              bnplAvailable: true,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'netbanking',
              name: 'Net Banking',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay using your bank\'s internet banking',
              popular: false,
              totalAmount: 0,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'wallet',
              name: 'Digital Wallets',
              icon: getPaymentMethodIcon('wallet'),
              description: 'Pay using Paytm, PhonePe, Google Pay, and other wallets',
              popular: false,
              totalAmount: 0,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'bnpl',
              name: 'Buy Now Pay Later',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay later with LazyPay, Simpl, ZestMoney and more',
              popular: true,
              totalAmount: 0,
              emiAvailable: false,
              bnplAvailable: true,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'emi',
              name: 'EMI Payment',
              icon: getPaymentMethodIcon('credit-card'),
              description: 'Pay in easy monthly installments with 0% interest',
              popular: true,
              totalAmount: 0,
              emiAvailable: true,
              bnplAvailable: false,
              codAvailable: false,
              geoRestricted: false
            },
            {
              id: 'cod',
              name: 'Cash on Delivery',
              icon: getPaymentMethodIcon('shield'),
              description: 'Pay with cash when you receive your order',
              popular: false,
              totalAmount: 0,
              emiAvailable: false,
              bnplAvailable: false,
              codAvailable: true,
              geoRestricted: true,
              restrictedPincodes: ['400001', '400002', '400003']
            }
          ];
          setPaymentMethods(defaultMethods);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [addressId]);

  // Update payment methods when cart changes
  useEffect(() => {
    if (paymentMethods.length > 0 && cart) {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        totalAmount: cart.subtotal || 0
      }));
      setPaymentMethods(updatedMethods);
    }
  }, [cart, paymentMethods.length]);

  // Detect card brand when card number changes
  useEffect(() => {
    if (cardNumber) {
      const brand = detectCardBrand(cardNumber);
      setCardBrand(brand);
    } else {
      setCardBrand('');
    }
  }, [cardNumber]);

  // Fetch frequently bought together products
  useEffect(() => {
    console.log('🔄 fetchFrequentlyBought useEffect triggered');
    console.log('📦 Cart state:', cart ? { hasItems: !!cart.items, itemCount: cart.items?.length } : 'null');
    
    const fetchFrequentlyBought = async () => {
      console.log('🚀 fetchFrequentlyBought function started');
      
      if (!cart) {
        console.log('⚠️ No cart in payment page');
        return;
      }

      if (!cart.items || cart.items.length === 0) {
        console.log('⚠️ No cart items in payment page');
        return;
      }

      console.log('📦 Cart items count:', cart.items.length);
      console.log('📦 Cart items:', cart.items.map((item: any) => ({
        cartItemId: item._id,
        hasProduct: !!item.product,
        productId: item.product?._id,
        productName: item.product?.productName
      })));

      // Filter out items with null/undefined products
      const validItems = cart.items.filter((item: any) => {
        const isValid = item && item.product && item.product._id;
        if (!isValid) {
          console.log('⚠️ Invalid cart item:', item);
        }
        return isValid;
      });
      
      if (validItems.length === 0) {
        console.log('⚠️ No valid cart items in payment page');
        return;
      }

      console.log('✅ Valid items count:', validItems.length);
      console.log('📦 Fetching frequently bought together for', validItems.length, 'cart items');
      
      try {
        // First, check if cart items already have frequentlyBoughtTogether data (merged from backend)
        const frequentlyBoughtMap: { [key: string]: any[] } = {};
        
        validItems.forEach((item: any) => {
          const productId = item.product._id;
          const cartItemId = item._id;
          
          console.log(`📦 Processing Product ${productId} (Cart Item: ${cartItemId}):`, {
            productName: item.product.productName,
            hasProduct: !!item.product,
            productKeys: Object.keys(item.product || {})
          });
          
          // Merge frequentlyBoughtTogether and manualFrequentlyBoughtTogether
          const regularFBT = item.product.frequentlyBoughtTogether && Array.isArray(item.product.frequentlyBoughtTogether) 
            ? item.product.frequentlyBoughtTogether 
            : [];
          const manualFBT = item.product.manualFrequentlyBoughtTogether && Array.isArray(item.product.manualFrequentlyBoughtTogether) 
            ? item.product.manualFrequentlyBoughtTogether 
            : [];
          
          console.log(`📦 Product ${productId}:`, {
            hasRegularFBT: regularFBT.length > 0,
            regularFBTCount: regularFBT.length,
            hasManualFBT: manualFBT.length > 0,
            manualFBTCount: manualFBT.length,
            manualFBTProducts: manualFBT.map((p: any) => ({ name: p.productName, price: p.price, discountPrice: p.discountPrice }))
          });
          
          // Merge both arrays
          const mergedFBT = [...regularFBT, ...manualFBT];
          
          if (mergedFBT.length > 0) {
            frequentlyBoughtMap[productId] = mergedFBT.slice(0, 3);
            console.log(`✅ Merged ${regularFBT.length} regular + ${manualFBT.length} manual products for ${productId}`);
          } else {
            console.log(`⚠️ No frequently bought together data for product ${productId}`);
          }
        });
        
        // If we have data from cart, use it; otherwise fetch from API
        if (Object.keys(frequentlyBoughtMap).length > 0) {
          console.log('✅ Using frequentlyBoughtTogether data from cart items:', frequentlyBoughtMap);
          console.log('📦 FrequentlyBoughtMap keys:', Object.keys(frequentlyBoughtMap));
          Object.entries(frequentlyBoughtMap).forEach(([productId, products]) => {
            console.log(`   Product ${productId}: ${products.length} items`, products.map((p: any) => ({
              name: p.productName || p._id,
              price: p.price,
              discountPrice: p.discountPrice,
              sku: p.sku
            })));
          });
          setFrequentlyBoughtTogether(frequentlyBoughtMap);
        } else {
          console.log('⚠️ No frequentlyBoughtTogether data in cart, fetching from API...');
          // Fallback: Fetch from API if cart doesn't have the data
          const productIds = validItems.map((item: any) => item.product._id);
          const uniqueProductIds = [...new Set(productIds)];
          console.log('📦 Fetching from API for product IDs:', uniqueProductIds);

          const promises = uniqueProductIds.map(async (productId) => {
            try {
              const response = await apiService.products.getById(productId);
              if (response.success && response.data) {
                const product = response.data as any;
                // API response should have merged frequentlyBoughtTogether (including manual products)
                return { 
                  productId, 
                  products: product.frequentlyBoughtTogether?.slice(0, 3) || [] 
                };
              }
              return { productId, products: [] };
            } catch (error) {
              console.error(`❌ Error fetching product ${productId}:`, error);
              return { productId, products: [] };
            }
          });

          const results = await Promise.all(promises);
          
          results.forEach(({ productId, products }) => {
            if (products && products.length > 0) {
              frequentlyBoughtMap[productId] = products;
            }
          });
          
          console.log('✅ Fetched frequentlyBoughtTogether from API:', frequentlyBoughtMap);
          setFrequentlyBoughtTogether(frequentlyBoughtMap);
        }
      } catch (error) {
        console.error('❌ Error fetching frequently bought together:', error);
      }
    };

    // Simple logic: if cart exists and has items with product IDs, fetch the data
    if (cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
      // Check if at least one item has a product with _id
      const hasValidProduct = cart.items.some((item: any) => item?.product?._id);
      if (hasValidProduct) {
        console.log('✅ Cart has valid products, calling fetchFrequentlyBought');
        fetchFrequentlyBought();
      } else {
        console.log('⚠️ Cart items exist but no valid product IDs found');
      }
    } else {
      console.log('⚠️ Cart not ready yet or has no items');
    }
  }, [cart]);

  const handlePayment = async () => {
    console.log('🚀 Payment process started');
    console.log('Address:', address);
    console.log('Selected payment method:', selectedPaymentMethod);
    console.log('Payment methods:', paymentMethods);
    console.log('Address ID from URL:', addressId);
    
    if (!address) {
      alert('Please select a delivery address first.');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (!addressId) {
      alert('Address ID is missing. Please try again.');
      return;
    }

    // Check COD availability
    if (selectedPaymentMethod === 'cod' && !codAvailable) {
      alert('COD is not available for your delivery address.');
      return;
    }

    // Validate net banking selection
    if (selectedPaymentMethod === 'netbanking') {
      if (!isNetBankingValid()) {
        alert('Please select a bank to proceed.');
        return;
      }
    }

    try {
      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      if (!selectedMethod) {
        throw new Error('Selected payment method not found');
      }

      console.log('Selected method details:', selectedMethod);

      // Handle different payment methods
      if (selectedMethod.id === 'cod' || selectedMethod.name.toLowerCase().includes('cash') || selectedMethod.name.toLowerCase().includes('cod')) {
        // Handle Cash on Delivery - Direct order creation
        // Show processing state immediately
        setIsProcessing(true);
        
        console.log('💵 Processing COD payment');
        console.log('Creating order with data:', {
          addressId: addressId,
          paymentMethodId: selectedMethod.id
        });
        
        // Create order for COD
        console.log('📦 Creating COD order...');
        
        // Get frequently bought together from ref (preserved) or Redux state
        const frequentlyBoughtData = Object.keys(frequentlyBoughtTogetherRef.current).length > 0 
          ? frequentlyBoughtTogetherRef.current 
          : selectedFrequentlyBoughtRedux;
        
        console.log('📦 Frequently bought together data from Redux:', JSON.stringify(selectedFrequentlyBoughtRedux, null, 2));
        console.log('📦 Frequently bought together data from Ref:', JSON.stringify(frequentlyBoughtTogetherRef.current, null, 2));
        console.log('📦 Selected data to send:', JSON.stringify(frequentlyBoughtData, null, 2));
        console.log('📦 Cart items for mapping:', cart?.items?.map((item: any) => ({
          cartItemId: item._id,
          productId: item.product?._id,
          productName: item.product?.productName,
          hasManualFBT: !!item.product?.manualFrequentlyBoughtTogether,
          manualFBTSKUs: item.product?.manualFrequentlyBoughtTogether?.map((m: any) => m.sku) || []
        })));

        
        // Map cart item IDs from Redux to backend cart item IDs
        let mappedFrequentlyBought: { [cartItemId: string]: string[] } = {};
        const cartItems = (cart?.items || []) as any[];
        
        // Process frequentlyBoughtData - handle undefined keys for manual products
        const validFrequentlyBoughtData: { [key: string]: string[] } = {};
        console.log('🔄 Processing frequentlyBoughtData, keys:', Object.keys(frequentlyBoughtData || {}));
        console.log('🔄 Full frequentlyBoughtData:', JSON.stringify(frequentlyBoughtData, null, 2));
        
        if (frequentlyBoughtData && typeof frequentlyBoughtData === 'object') {
          Object.entries(frequentlyBoughtData).forEach(([key, value]) => {
            console.log(`🔄 Processing key: "${key}", value:`, value);
            
            // Handle undefined key - this happens when cart item _id is undefined (backend cart items don't have _id)
            // or when manual products are selected without proper cart item ID
            if ((key === 'undefined' || !key || key === 'null' || key === '' || key === 'undefined') && Array.isArray(value) && value.length > 0) {
              console.log(`🔍 Found undefined key with ${value.length} SKUs:`, value);
              
              // Find cart item that has manual frequently bought together items with matching SKUs
              let matchingCartItem = null;
              
              // First, try to find by matching SKUs in manualFrequentlyBoughtTogether
              for (const item of cartItems) {
                if (!item?.product) continue;
                const manualFBT = item.product.manualFrequentlyBoughtTogether || [];
                const manualSKUs = manualFBT.map((m: any) => m?.sku).filter(Boolean);
                console.log(`  Checking cart item ${item._id}, manual SKUs:`, manualSKUs);
                
                // Check if any of the selected SKUs match manual products in this cart item
                const hasMatch = value.some((selectedSKU: string) => 
                  manualSKUs.includes(selectedSKU)
                );
                
                if (hasMatch) {
                  matchingCartItem = item;
                  console.log(`  ✅ Found match for cart item ${item._id} with SKUs:`, value.filter((sku: string) => manualSKUs.includes(sku)));
                  break;
                }
              }
              
              // If no match found by SKU, use first cart item as fallback (since manual products are always for the main product)
              if (!matchingCartItem && cartItems.length > 0) {
                matchingCartItem = cartItems[0];
                console.log(`⚠️ No SKU match found, using first cart item as fallback: ${matchingCartItem._id}`);
              }
              
              if (matchingCartItem && matchingCartItem._id) {
                // Map undefined key to the actual cart item ID
                const cartItemId = matchingCartItem._id.toString();
                if (!validFrequentlyBoughtData[cartItemId]) {
                  validFrequentlyBoughtData[cartItemId] = [];
                }
                // Add SKUs (for manual products) to the array, avoiding duplicates
                const existingSKUs = new Set(validFrequentlyBoughtData[cartItemId]);
                value.forEach((sku: string) => {
                  if (sku && !existingSKUs.has(sku)) {
                    validFrequentlyBoughtData[cartItemId].push(sku);
                    existingSKUs.add(sku);
                  }
                });
                console.log(`✅ Mapped undefined key to cartItemId: ${cartItemId} with SKUs:`, validFrequentlyBoughtData[cartItemId]);
              } else {
                console.log(`❌ No cart items found to map undefined key`);
              }
            } else if (key && key !== 'undefined' && key !== 'null' && key !== '' && Array.isArray(value)) {
              validFrequentlyBoughtData[key] = value;
              console.log(`✅ Added valid key "${key}" with ${value.length} items`);
            } else {
              console.log(`⚠️ Skipping invalid key/value pair: key="${key}", value type:`, typeof value, 'isArray:', Array.isArray(value));
            }
          });
        } else {
          console.log('⚠️ frequentlyBoughtData is not a valid object:', frequentlyBoughtData);
        }
        
        console.log('📦 Valid frequently bought data after processing:', validFrequentlyBoughtData);
        
        if (Object.keys(validFrequentlyBoughtData).length > 0 && cartItems.length > 0) {
          // Create a map of product IDs to backend cart item IDs
          const productIdToBackendCartItemId: { [productId: string]: string } = {};
          cartItems.forEach((backendItem: any) => {
            if (backendItem?.product?._id && backendItem?._id) {
              productIdToBackendCartItemId[backendItem.product._id.toString()] = backendItem._id.toString();
            }
          });
          
          console.log('📦 Product ID to Cart Item ID mapping:', productIdToBackendCartItemId);
          console.log('📦 Valid frequently bought data after processing:', validFrequentlyBoughtData);
          
          // Map Redux cart item IDs to backend cart item IDs
          Object.entries(validFrequentlyBoughtData).forEach(([reduxCartItemId, productIds]) => {
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
              console.log(`⚠️ Skipping invalid productIds for cartItemId: ${reduxCartItemId}`);
              return;
            }
            
            console.log(`🔄 Mapping cartItemId: "${reduxCartItemId}" with ${productIds.length} items:`, productIds);
            console.log(`   Cart items structure:`, cartItems.map((item: any) => ({
              hasId: !!item._id,
              id: item._id,
              productId: item?.product?._id,
              productName: item?.product?.productName
            })));
            
            // Try to find matching backend cart item
            // First try: exact match by cart item ID (string comparison)
            const exactMatch = cartItems.find((item: any) => {
              const itemId = item?._id?.toString();
              const match = itemId && itemId === reduxCartItemId.toString();
              if (match) {
                console.log(`  ✅ Exact match found: ${itemId} === ${reduxCartItemId}`);
              }
              return match;
            });
            
            if (exactMatch && exactMatch._id) {
              const backendCartItemId = exactMatch._id.toString();
              mappedFrequentlyBought[backendCartItemId] = productIds;
              console.log(`✅ Mapped by exact cartItemId: ${reduxCartItemId} -> ${backendCartItemId} with products:`, productIds);
            } else {
              // Second try: match by product ID (if reduxCartItemId is actually a productId)
              // This is the most common case when cart items don't have _id
              const matchingItem = cartItems.find((item: any) => {
                const productId = item?.product?._id?.toString();
                const match = productId === reduxCartItemId.toString();
                if (match) {
                  console.log(`  ✅ Found cart item by productId: ${productId} === ${reduxCartItemId}`);
                }
                return match;
              });
              
              if (matchingItem) {
                // Backend cart items might not have _id (schema has _id: false)
                // Backend can match by product ID, so we can use product ID directly
                // But first try to use cart item _id if available
                if (matchingItem._id) {
                  const backendCartItemId = matchingItem._id.toString();
                  mappedFrequentlyBought[backendCartItemId] = productIds;
                  console.log(`✅ Mapped by productId to cart item _id: ${reduxCartItemId} -> ${backendCartItemId} with products:`, productIds);
                } else {
                  // Cart item doesn't have _id, use product ID directly
                  // Backend will match by product ID (see orderController.js line 232-235)
                  mappedFrequentlyBought[reduxCartItemId] = productIds;
                  console.log(`✅ Mapped by productId (no cart item _id): ${reduxCartItemId} with products:`, productIds);
                  console.log(`   Backend will match this by product ID since cart items don't have _id`);
                }
              } else {
                // Third try: check if reduxCartItemId is in productIdToBackendCartItemId map
                const productMatch = productIdToBackendCartItemId[reduxCartItemId];
                if (productMatch) {
                  mappedFrequentlyBought[productMatch] = productIds;
                  console.log(`✅ Mapped by productId map: ${reduxCartItemId} -> ${productMatch} with products:`, productIds);
                } else if (cartItems.length > 0) {
                  // Last resort: use product ID directly (backend will match by product ID)
                  // This works because backend can identify cart items by product ID when _id is not available
                  mappedFrequentlyBought[reduxCartItemId] = productIds;
                  console.log(`✅ Using productId directly as identifier: ${reduxCartItemId} with products:`, productIds);
                  console.log(`   Backend will match this by product ID (orderController.js handles this)`);
                } else {
                  console.log(`❌ Could not map cartItemId: ${reduxCartItemId}, skipping`);
                  console.log(`   Available cart item IDs:`, cartItems.map((item: any) => item?._id?.toString()));
                }
              }
            }
          });
        } else {
          console.log('⚠️ No valid frequently bought together data or cart items found. Backend will process automatic frequently bought together items.');
        }
        
        console.log('📦 Mapped frequently bought together data being sent:', JSON.stringify(mappedFrequentlyBought, null, 2));
        console.log('📦 Mapped data keys count:', Object.keys(mappedFrequentlyBought).length);
        
        // Prepare order data - only include frequentlyBoughtTogether if we have valid mapped data
        const orderData: any = {
          addressId: addressId,
          paymentMethodId: selectedMethod.id,
          rewardPointsDiscount: rewardPointsDiscount > 0 ? rewardPointsDiscount : undefined
        };
        
        // Only add frequentlyBoughtTogether if we have valid mapped data
        // Backend will automatically process manualFrequentlyBoughtTogether from product data even if this is empty
        if (Object.keys(mappedFrequentlyBought).length > 0) {
          orderData.frequentlyBoughtTogether = mappedFrequentlyBought;
          console.log('✅ Including user-selected frequently bought together items in order');
          console.log('📦 Order data with frequentlyBoughtTogether:', JSON.stringify(orderData, null, 2));
        } else {
          console.log('ℹ️ No user-selected frequently bought together items. Backend will process automatic items from product data.');
          console.log('📦 Order data without frequentlyBoughtTogether:', JSON.stringify(orderData, null, 2));
        }
        
        console.log('🚀 Sending order creation request...');
        
        try {
          const orderResponse = await apiService.payment.createOrder(orderData);

          if (orderResponse.success && orderResponse.data?.order) {
            // Redirect immediately to payment success page (don't wait for cart clearing)
            const orderId = orderResponse.data.order._id;
            const orderAmount = orderResponse.data.order.total;
            
            // Clear reward points redemption from localStorage after successful order
            if (typeof window !== 'undefined') {
              localStorage.removeItem('rewardPointsRedeemed');
              localStorage.removeItem('rewardPointsAmount');
            }
            
            // Clear the cart in background (don't wait for it)
            cartContext.clearCart().catch((error) => {
              console.error('❌ Error clearing cart:', error);
              // Don't fail the order if cart clearing fails
            });
            
            // Use window.location.replace for immediate redirect (faster than router.push)
            // This prevents the payment page from showing during redirect
            window.location.href = `/payment-success?orderId=${orderId}&amount=${orderAmount}`;
            return; // Exit early to prevent any further execution
          } else {
          console.error('❌ COD order creation failed:', orderResponse);
          console.error('Response details:', {
            success: orderResponse.success,
            message: orderResponse.message,
            data: orderResponse.data,
            errors: orderResponse.errors
          });
          
          // Refresh cart from backend when order creation fails to sync actual state
          console.log('🔄 COD order creation failed, refreshing cart from backend...');
          try {
            await cartContext.fetchCart();
            console.log('✅ Cart refreshed after COD order failure');
          } catch (refreshError) {
            console.error('❌ Error refreshing cart:', refreshError);
          }
          
            const errorMessage = orderResponse.message || 'Failed to create order. Please try again.';
            setIsProcessing(false);
            throw new Error(errorMessage);
          }
        } catch (error) {
          setIsProcessing(false);
          console.error('❌ Error creating COD order:', error);
          throw error;
        }
      } else {
        // All other payment methods go through Razorpay
        console.log('💳 Processing payment through Razorpay');
        const finalAmount = calculateFinalTotal();
        console.log('Final amount:', finalAmount);

        // Determine Razorpay method based on selected payment method
        let razorpayMethod = 'card'; // default
        let razorpayConfig = {};
        let paymentDescription = 'Payment';

        if (selectedMethod.id === 'razorpay' || selectedMethod.name.toLowerCase().includes('credit') || selectedMethod.name.toLowerCase().includes('debit')) {
          razorpayMethod = 'card';
          paymentDescription = `Payment via ${cardType} Card`;
          razorpayConfig = {
            display: {
              blocks: {
                banks: {
                  name: 'Pay using Card',
                  instruments: [
                    {
                      method: 'card',
                      issuers: ['VISA', 'MASTERCARD', 'AMEX', 'RUPAY']
                    }
                  ]
                }
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: false
              }
            }
          };
        } else if (selectedMethod.id === 'netbanking') {
          razorpayMethod = 'netbanking';
          paymentDescription = `Payment via ${netBankingBanks.find(b => b.id === selectedBank)?.name || 'Net Banking'}`;
          razorpayConfig = {
            display: {
              blocks: {
                banks: {
                  name: 'Pay using Net Banking',
                  instruments: [
                    {
                      method: 'netbanking',
                      banks: [netBankingBanks.find(b => b.id === selectedBank)?.razorpayCode || selectedBank]
                    }
                  ]
                }
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: false
              }
            }
          };
        } else if (selectedMethod.id === 'wallet') {
          razorpayMethod = 'wallet';
          const selectedWalletData = digitalWallets.find(w => w.id === selectedWallet);
          paymentDescription = `Payment via ${selectedWalletData?.name}`;
          razorpayConfig = {
            display: {
              blocks: {
                wallets: {
                  name: `Pay with ${selectedWalletData?.name}`,
                  instruments: [
                    {
                      method: selectedWalletData?.method || 'wallet',
                      wallets: [selectedWalletData?.razorpayCode || selectedWallet]
                    }
                  ]
                }
              },
              sequence: ['block.wallets'],
              preferences: {
                show_default_blocks: false
              }
            }
          };
        } else if (selectedMethod.id === 'emi') {
          razorpayMethod = 'card';
          paymentDescription = 'EMI Payment';
          razorpayConfig = {
            display: {
              blocks: {
                banks: {
                  name: 'Pay using EMI',
                  instruments: [
                    {
                      method: 'card',
                      issuers: ['HDFC', 'ICICI', 'SBI', 'AXIS']
                    }
                  ]
                }
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: false
              }
            }
          };
        } else if (selectedMethod.id === 'bnpl') {
          razorpayMethod = 'card';
          paymentDescription = `BNPL Payment - ${selectedBNPL?.provider}`;
          razorpayConfig = {
            display: {
              blocks: {
                banks: {
                  name: `Pay with ${selectedBNPL?.provider}`,
                  instruments: [
                    {
                      method: 'card',
                      issuers: ['HDFC', 'ICICI', 'SBI', 'AXIS']
                    }
                  ]
                }
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: false
              }
            }
          };
        }

        // Create Razorpay order
        console.log('📦 Creating Razorpay order...');
        const razorpayResponse = await apiService.payment.createRazorpayOrder({
          amount: finalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            payment_method: selectedMethod.name,
            payment_type: selectedMethod.id,
            customer_mobile: address.mobile,
            card_type: cardType || '',
            card_brand: cardBrand || '',
            bank_code: netBankingBanks.find(b => b.id === selectedBank)?.razorpayCode || '',
            wallet_type: digitalWallets.find(w => w.id === selectedWallet)?.razorpayCode || '',
            emi_plan: selectedEMI?.bank || '',
            bnpl_provider: selectedBNPL?.provider || ''
          }
        });
        console.log('Razorpay response:', razorpayResponse);

        if (razorpayResponse.success && razorpayResponse.data?.order) {
          const orderData = razorpayResponse.data.order;
          const options = {
            key: orderData?.key_id || 'rzp_test_1234567890',
            amount: finalAmount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            name: 'Gupta Distributors',
            description: paymentDescription,
            order_id: orderData.id,
            method: razorpayMethod,
            ...razorpayConfig,
            handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
              try {
                console.log('Payment successful, redirecting to verification page...');
                const orderData = razorpayResponse.data!.order;
                if (!orderData?.id) {
                  throw new Error('Razorpay order ID is missing.');
                }
                
                // Store frequently bought together items in sessionStorage before redirect
                if (selectedFrequentlyBoughtRedux && Object.keys(selectedFrequentlyBoughtRedux).length > 0) {
                  sessionStorage.setItem('frequentlyBoughtTogether', JSON.stringify(selectedFrequentlyBoughtRedux));
                  console.log('💾 Stored frequently bought together items in sessionStorage');
                }
                
                // Redirect directly to payment-success page with verification parameters
                // Verification will happen on that page
                // Note: Cart will be cleared after successful verification on payment-success page
                router.push(`/payment-success?razorpay_order_id=${orderData.id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}&addressId=${addressId!}`);
                // window.location.href = `/payment-success?razorpay_order_id=${orderData.id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}&addressId=${addressId!}`;
              } catch (error) {
                console.error('Payment handler error:', error);
                // Redirect to payment-success page with failed status
                router.push(`/payment-success?status=failed`);
              }
            },
            prefill: {
              name: address.name,
              email: 'customer@example.com',
              contact: address.mobile
            },
            notes: {
              payment_method: selectedMethod.name,
              payment_type: selectedMethod.id,
              order_type: 'ecommerce',
              customer_id: address.mobile
            },
            theme: {
              color: '#6366F1'
            },
            modal: {
              ondismiss: async function() {
                console.log('Payment modal closed');
                // Refresh cart from backend when payment modal is dismissed to sync actual state
                console.log('🔄 Payment modal dismissed, refreshing cart from backend...');
                try {
                  await cartContext.fetchCart();
                  console.log('✅ Cart refreshed after modal dismissal');
                } catch (refreshError) {
                  console.error('❌ Error refreshing cart:', refreshError);
                }
              }
            }
          };

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay(options);
            rzp.open();
          };
          document.head.appendChild(script);
        } else {
          console.error('❌ Razorpay order creation failed:', razorpayResponse);
          const errorMessage = razorpayResponse?.message || 'Failed to create payment order';
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Payment failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Refresh cart from backend when payment fails to sync actual state
      console.log('🔄 Payment failed, refreshing cart from backend...');
      try {
        await cartContext.fetchCart();
        console.log('✅ Cart refreshed after payment failure');
      } catch (refreshError) {
        console.error('❌ Error refreshing cart:', refreshError);
      }
      
      setIsProcessing(false);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const _generateOrderId = () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  if (loading) {
    return <PaymentPageSkeleton />;
  }

  // Error boundary for debugging
  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Cart Not Found</h2>
            <p className="text-black mb-4">Please add items to your cart first.</p>
            <Link href="/products" className="text-indigo-600 hover:text-indigo-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-200">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Order</h3>
                <p className="text-gray-600 text-center">Please wait while we place your order...</p>
              </div>
            </div>
          </div>
        )}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/checkout/address"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Address Selection
            </Link>
            <h1 className="text-3xl font-bold text-black mb-2">Payment</h1>
            <p className="text-black">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Payment Methods - 8 columns */}
            <div className="md:col-span-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    Choose Payment Method
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4"> 
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedPaymentMethod === method.id
                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                        } ${!codAvailable && method.id === 'cod' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (!codAvailable && method.id === 'cod') return;
                          setSelectedPaymentMethod(method.id);
                          // Don't show popup for COD payment method
                          if (method.id !== 'cod') {
                            setShowPaymentFormPopup(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              selectedPaymentMethod === method.id
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {method.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-black">{method.name}</h3>
                                {method.popular && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Popular
                                  </span>
                                )}
                               
                                {selectedPaymentMethod === method.id && (
                                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-black text-sm mt-1">{method.description}</p>
                              {!codAvailable && method.id === 'cod' && (
                                <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>{codRestrictionMessage}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* EMI Options */}
                  {selectedPaymentMethod && paymentMethods.find(m => m.id === selectedPaymentMethod)?.emiAvailable && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-black flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          EMI Options
                        </h3>
                        <button
                          onClick={() => setShowEMIOptions(!showEMIOptions)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {showEMIOptions ? 'Hide' : 'View'} EMI Plans
                        </button>
                      </div>
                      
                      {showEMIOptions && (
                        <div className="space-y-3">
                          {emiLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-black">Loading EMI plans...</p>
                            </div>
                          ) : emiPlans.length > 0 ? (
                            emiPlans.map((plan) => (
                              <div
                                key={plan.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedEMI?.id === plan.id
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                }`}
                                onClick={() => setSelectedEMI(selectedEMI?.id === plan.id ? null : plan)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-black">{plan.bank}</h4>
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {plan.bankCode}
                                      </span>
                                    </div>
                                    <p className="text-sm text-black mb-1">{plan.tenure} months EMI</p>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-green-600 font-medium">
                                        {plan.interest === 0 ? '0% Interest EMI' : `${plan.interest}% p.a.`}
                                      </span>

                                    </div>
                                    {plan.partnerBanks && (
                                      <div className="mt-2">
                                        <p className="text-xs text-black mb-1">Partner Banks:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {plan.partnerBanks.slice(0, 3).map((bank, index) => (
                                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                              {bank}
                                            </span>
                                          ))}
                                          {plan.partnerBanks.length > 3 && (
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                              +{plan.partnerBanks.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {plan.features && plan.features.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs text-black mb-1">Features:</p>
                                        <ul className="text-xs text-black space-y-1">
                                          {plan.features.slice(0, 2).map((feature, index) => (
                                            <li key={index} className="flex items-center gap-1">
                                              <Check className="w-3 h-3 text-green-500" />
                                              {feature}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-medium text-black text-lg">
                                      {formatCurrency(plan.emiAmount)}/month
                                    </p>
                                    <p className="text-sm text-black">
                                      Total: {formatCurrency(plan.totalAmount)}
                                    </p>
                                    {plan.interest > 0 && (
                                      <p className="text-xs text-orange-600">
                                        Interest: {formatCurrency(plan.totalAmount - (cart?.total || 0))}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-black">
                              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm font-medium mb-1">No EMI options available</p>
                              <p className="text-xs text-black">
                                Minimum amount for EMI is ₹3,000
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedEMI && (
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Selected EMI Plan</p>
                              <p className="text-xs text-blue-700">{selectedEMI.bank} - {selectedEMI.tenure} months</p>
                            </div>
                            <button
                              onClick={() => setSelectedEMI(null)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BNPL Options */}
                  {selectedPaymentMethod === 'bnpl' && (
                    <div className="mt-6 p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="mb-4">
                        <h3 className="font-semibold text-black flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-purple-600" />
                          Buy Now Pay Later
                        </h3>
                      </div>
                      
                      {!selectedBNPL ? (
                        <div className="space-y-3">
                          {bnplOptions.length > 0 ? (
                            bnplOptions.map((option) => (
                              <div
                                key={option.id}
                                className="p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-200 hover:border-purple-300 bg-white"
                                onClick={() => setSelectedBNPL(option)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-black">{option.name}</h4>
                                    <p className="text-sm text-black mt-1">{option.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Credit Limit: {formatCurrency(option.creditLimit)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-sm text-black">Provider</p>
                                    <p className="font-medium text-black">{option.provider}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-black">
                              No BNPL options available for this amount
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-purple-100 rounded-lg border border-purple-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-black">{selectedBNPL.name}</h4>
                              <p className="text-sm text-black mt-1">{selectedBNPL.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Credit Limit: {formatCurrency(selectedBNPL.creditLimit)}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-black">Provider: <span className="font-medium">{selectedBNPL.provider}</span></p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedBNPL(null);
                                setShowPaymentFormPopup(false);
                                setShowPaymentFormPopup(true);
                              }}
                              className="text-purple-600 hover:text-purple-700 text-sm ml-4"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                                                          {/* Digital Wallet Options */}
                  {selectedPaymentMethod === 'wallet' && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="mb-4">
                        <h3 className="font-semibold text-black flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-gray-600" />
                          Select Digital Wallet
                        </h3>
                            <p className="text-sm text-black mt-2">
                              Choose your preferred digital wallet for instant payment. You&apos;ll receive a payment notification on your selected wallet app.
                            </p>
                          </div>
                          
                          {!selectedWallet ? (
                            <div className="space-y-3">
                              {digitalWallets.map((wallet) => (
                                <div
                                  key={wallet.id}
                                  className="p-4 rounded-lg border-2 cursor-pointer transition-all border-gray-200 hover:border-gray-300 bg-white"
                                  onClick={() => setSelectedWallet(wallet.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="w-12 h-8 rounded flex items-center justify-center text-white font-bold"
                                        style={{ 
                                          backgroundColor: wallet.color
                                        }}
                                      >
                                        {renderWalletLogo(wallet)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-black">{wallet.name}</p>
                                        <p className="text-sm text-black">
                                          {wallet.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Instant
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-12 h-8 rounded flex items-center justify-center text-white font-bold"
                                    style={{ 
                                      backgroundColor: digitalWallets.find(w => w.id === selectedWallet)?.color
                                    }}
                                  >
                                    {renderWalletLogo(digitalWallets.find(w => w.id === selectedWallet) || { logoStyle: 'default', logoText: 'Wallet', color: '#6B7280' })}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-black">{digitalWallets.find(w => w.id === selectedWallet)?.name}</h4>
                                    <p className="text-sm text-black mt-1">{digitalWallets.find(w => w.id === selectedWallet)?.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Instant
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedWallet('');
                                    setShowPaymentFormPopup(false);
                                    setShowPaymentFormPopup(true);
                                  }}
                                  className="text-gray-600 hover:text-gray-700 text-sm ml-4 cursor-pointer"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                          )}
                    </div>
                  )}


                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-4">
              <OrderSummary 
                showCouponSection={true}
                showProductItems={true}
                showCheckoutButtons={false}
                loading={loading}
                rewardPointsDiscount={rewardPointsDiscount}
                rewardPointsRedeemed={rewardPointsRedeemed}
                selectedFrequentlyBought={selectedFrequentlyBought}
                frequentlyBoughtTogether={frequentlyBoughtTogether}
                customButtons={
                  <div className="space-y-4">

                    
                    {/* Discount Section */}
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between items-center py-2 text-sm">
                        <span className="text-green-600 font-medium">Discount</span>
                        <span className="text-green-600 font-medium">-{formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}

                    {/* Discount Summary Section - Only showing Bank Offer and Reward Points discounts */}
                    {(() => {
                      const bankOfferDiscount = Math.round(calculateDiscount());
                      const rewardDiscount = Math.round(rewardPointsDiscount);
                      
                      const hasAnyDiscount = bankOfferDiscount > 0 || rewardDiscount > 0;
                      
                      if (hasAnyDiscount) {
                        return (
                          <div className="border-t pt-4 mt-4">
                            <div className="space-y-2 mb-4">
                              {bankOfferDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Bank Offer Discount</span>
                                  <span>-{formatCurrency(bankOfferDiscount)}</span>
                                </div>
                              )}
                              
                              {rewardDiscount > 0 && (
                                <div className="flex justify-between text-sm text-yellow-600">
                                  <span>Reward Points Discount</span>
                                  <span>-{formatCurrency(rewardDiscount)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Pay Button */}
                    <button
                      onClick={handlePayment}
                      disabled={
                        isProcessing || 
                        !selectedPaymentMethod ||
                        (!codAvailable && selectedPaymentMethod === 'cod') ||
                        (selectedPaymentMethod === 'netbanking' && !isNetBankingValid()) ||
                        (selectedPaymentMethod === 'emi' && !selectedEMI) ||
                        (selectedPaymentMethod === 'bnpl' && !selectedBNPL) ||
                        (selectedPaymentMethod === 'wallet' && !isDigitalWalletValid())
                      }
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 shadow-sm mt-4 ${
                        isProcessing || 
                        !selectedPaymentMethod ||
                        (!codAvailable && selectedPaymentMethod === 'cod') ||
                        (selectedPaymentMethod === 'netbanking' && !isNetBankingValid()) ||
                        (selectedPaymentMethod === 'emi' && !selectedEMI) ||
                        (selectedPaymentMethod === 'bnpl' && !selectedBNPL) ||
                        (selectedPaymentMethod === 'wallet' && !isDigitalWalletValid())
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        }`}
                    >
                      {isProcessing 
                        ? 'Processing...' 
                        : `Pay ${formatCurrency(calculateFinalTotal())}`
                      }
                    </button>
                    


                    {/* Net Banking Validation Message */}
                    {selectedPaymentMethod === 'netbanking' && !isNetBankingValid() && (
                      <p className="text-red-500 text-sm text-center mt-2">
                        Please select a bank to proceed
                      </p>
                    )}

                    {/* EMI Validation Message */}
                    {selectedPaymentMethod === 'emi' && !selectedEMI && (
                      <p className="text-red-500 text-sm text-center mt-2">
                        Please select an EMI plan to proceed
                      </p>
                    )}

                    {/* BNPL Validation Message */}
                    {selectedPaymentMethod === 'bnpl' && !selectedBNPL && (
                      <p className="text-red-500 text-sm text-center mt-2">
                        Please select a BNPL provider to proceed
                      </p>
                    )}

                    {/* Digital Wallet Validation Message */}
                    {selectedPaymentMethod === 'wallet' && !isDigitalWalletValid() && (
                      <p className="text-red-500 text-sm text-center mt-2">
                        Please select a digital wallet to proceed
                      </p>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Payment Form Popup */}
      {showPaymentFormPopup && selectedPaymentMethod && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">
                  {(() => {
                    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
                    if (selectedMethod?.id === 'razorpay' || selectedMethod?.name.toLowerCase().includes('credit') || selectedMethod?.name.toLowerCase().includes('debit')) {
                      return 'Credit/Debit Card Details';
                    } else if (selectedMethod?.id === 'netbanking') {
                      return 'Net Banking Payment';
                    } else if (selectedMethod?.id === 'wallet') {
                      return 'Digital Wallet Payment';
                    } else if (selectedMethod?.id === 'emi') {
                      return 'EMI Payment';
                    } else if (selectedMethod?.id === 'bnpl') {
                      return 'Buy Now Pay Later';
                    } else if (selectedMethod?.id === 'cod') {
                      return 'Cash on Delivery';
                    }
                    return 'Payment Details';
                  })()}
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentFormPopup(false);
                    setSelectedPaymentMethod('');
                    // Clear form data
                    setCardNumber('');
                    setCardHolderName('');
                    setExpiryMonth('');
                    setExpiryYear('');
                    setCvv('');
                    setCardType('credit');
                    setCardBrand('');
                    setSelectedBank('');
                    setShowBankList(false);
                    setSelectedWallet('');
                    setShowWalletList(false);
                    setSelectedEMI(null);
                    setSelectedBNPL(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(() => {
                const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
                if (!selectedMethod) return null;

                // Credit/Debit Card Form
                if (selectedMethod.id === 'razorpay' || selectedMethod.name.toLowerCase().includes('razorpay') || selectedMethod.name.toLowerCase().includes('credit') || selectedMethod.name.toLowerCase().includes('debit') || selectedMethod.name.toLowerCase().includes('upi')) {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Enter your card details for secure payment. Your payment will be processed through Razorpay&apos;s secure payment gateway.
                      </p>
                      
                      {/* Saved Cards Section */}
                      {savedCards.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-black">Saved Cards</label>
                            <button
                              onClick={() => setShowSavedCards(!showSavedCards)}
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              {showSavedCards ? 'Hide' : 'Show'} Saved Cards
                            </button>
                          </div>
                          
                          {showSavedCards && (
                            <div className="space-y-2 mb-4">
                              {savedCards.map((card) => (
                                <div
                                  key={card.id}
                                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    selectedSavedCard === card.id
                                      ? 'border-indigo-500 bg-indigo-50'
                                      : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                  onClick={() => selectSavedCard(card.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600 uppercase">
                                          {card.cardBrand === 'visa' ? 'VISA' : 
                                           card.cardBrand === 'mastercard' ? 'MC' : 
                                           card.cardBrand === 'amex' ? 'AMEX' : 
                                           card.cardBrand === 'discover' ? 'DISC' : 
                                           card.cardBrand === 'jcb' ? 'JCB' : 
                                           card.cardBrand === 'unionpay' ? 'UP' : card.cardBrand}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-black text-sm">
                                          {maskCardNumber(card.cardNumber)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {card.cardHolderName} • Expires {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                      </div>
                                    </div>
                                    {selectedSavedCard === card.id && (
                                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* New Card Form - Only show if no saved card is selected */}
                      {!selectedSavedCard && (
                        <>
                      
                      {/* Card Type Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-black mb-3">Card Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="cardType"
                              value="credit"
                              checked={cardType === 'credit'}
                              onChange={(e) => setCardType(e.target.value as 'credit' | 'debit')}
                              className="mr-2 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-black">Credit Card</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="cardType"
                              value="debit"
                              checked={cardType === 'debit'}
                              onChange={(e) => setCardType(e.target.value as 'credit' | 'debit')}
                              className="mr-2 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-black">Debit Card</span>
                          </label>
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-black mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value);
                              setCardNumber(formatted);
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          {cardBrand && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600 uppercase">
                                  {cardBrand === 'visa' ? 'VISA' : 
                                   cardBrand === 'mastercard' ? 'MC' : 
                                   cardBrand === 'amex' ? 'AMEX' : 
                                   cardBrand === 'discover' ? 'DISC' : 
                                   cardBrand === 'jcb' ? 'JCB' : 
                                   cardBrand === 'unionpay' ? 'UP' : cardBrand}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {cardNumber && !validateCardNumber(cardNumber) && (
                          <p className="text-red-500 text-xs mt-1">Please enter a valid card number</p>
                        )}
                      </div>

                      {/* Card Holder Name */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-black mb-2">
                          Card Holder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                        />
                      </div>

                      {/* Expiry Date and CVV */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Expiry Date
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={expiryMonth}
                              onChange={(e) => setExpiryMonth(e.target.value)}
                              className="flex-1 px-3 text-black py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="">MM</option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <select
                              value={expiryYear}
                              onChange={(e) => setExpiryYear(e.target.value)}
                              className="flex-1 px-3 text-black py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="">YYYY</option>
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          {expiryMonth && expiryYear && !validateExpiry(expiryMonth, expiryYear) && (
                            <p className="text-red-500 text-xs mt-1">Please enter a valid expiry date</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            CVV
                          </label>
                          <div className="relative">
                            <input
                              type={showCvv ? "text" : "password"}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                              placeholder={cardBrand === 'amex' ? "1234" : "123"}
                              maxLength={cardBrand === 'amex' ? 4 : 3}
                              className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCvv(!showCvv)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {cvv && !validateCvv(cvv, cardBrand) && (
                            <p className="text-red-500 text-xs mt-1">
                              CVV must be {cardBrand === 'amex' ? '4' : '3'} digits
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Save Card Option */}
                      {isCardFormValid() && !isCardAlreadySaved() && (
                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              className="mr-2 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-black">Save this card for future payments</span>
                          </label>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                            // Clear form data
                            setCardNumber('');
                            setCardHolderName('');
                            setExpiryMonth('');
                            setExpiryYear('');
                            setCvv('');
                            setCardType('credit');
                            setCardBrand('');
                            setSelectedSavedCard('');
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (isCardFormValid()) {
                              // Auto-save card if form is valid and not already saved
                              if (!isCardAlreadySaved()) {
                                saveCard();
                              }
                              setShowPaymentFormPopup(false);
                            }
                          }}
                          disabled={!isCardFormValid()}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                            isCardFormValid()
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                        </>
                      )}

                      {/* CVV Only Section for Saved Cards */}
                      {selectedSavedCard && (
                        <div>
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600 uppercase">
                                  {savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'visa' ? 'VISA' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'mastercard' ? 'MC' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'amex' ? 'AMEX' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'discover' ? 'DISC' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'jcb' ? 'JCB' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'unionpay' ? 'UP' : 
                                   savedCards.find(c => c.id === selectedSavedCard)?.cardBrand}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-black text-sm">
                                  {maskCardNumber(savedCards.find(c => c.id === selectedSavedCard)?.cardNumber || '')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {savedCards.find(c => c.id === selectedSavedCard)?.cardHolderName} • Expires {savedCards.find(c => c.id === selectedSavedCard)?.expiryMonth}/{savedCards.find(c => c.id === selectedSavedCard)?.expiryYear}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSavedCard('');
                                setCvv('');
                              }}
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              Use different card
                            </button>
                          </div>

                          {/* CVV Input */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-black mb-2">
                              CVV
                            </label>
                            <div className="relative">
                              <input
                                type={showCvv ? "text" : "password"}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder={savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'amex' ? "1234" : "123"}
                                maxLength={savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'amex' ? 4 : 3}
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {cvv && !validateCvv(cvv, savedCards.find(c => c.id === selectedSavedCard)?.cardBrand || '') && (
                              <p className="text-red-500 text-xs mt-1">
                                CVV must be {savedCards.find(c => c.id === selectedSavedCard)?.cardBrand === 'amex' ? '4' : '3'} digits
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setShowPaymentFormPopup(false);
                                setSelectedPaymentMethod('');
                                setSelectedSavedCard('');
                                setCvv('');
                              }}
                              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (validateCvv(cvv, savedCards.find(c => c.id === selectedSavedCard)?.cardBrand || '')) {
                                  setShowPaymentFormPopup(false);
                                }
                              }}
                              disabled={!validateCvv(cvv, savedCards.find(c => c.id === selectedSavedCard)?.cardBrand || '')}
                              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                validateCvv(cvv, savedCards.find(c => c.id === selectedSavedCard)?.cardBrand || '')
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  : 'bg-gray-400 cursor-not-allowed text-white'
                              }`}
                            >
                              Continue
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Net Banking Form
                if (selectedMethod.id === 'netbanking') {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Choose your bank for secure net banking payment. You&apos;ll be redirected to your bank&apos;s official net banking page for payment.
                      </p>
                      
                      {/* Bank Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-black mb-3">
                          Select Your Bank
                        </label>
                        
                        {!selectedBank ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {netBankingBanks.slice(0, 12).map((bank) => (
                                <div
                                  key={bank.id}
                                  onClick={() => setSelectedBank(bank.id)}
                                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
                                >
                                  <div 
                                    className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${
                                      bank.logoStyle === 'sbi' ? 'bg-gradient-to-r from-blue-900 to-blue-700' : ''
                                    }`}
                                    style={{ 
                                      backgroundColor: bank.logoStyle === 'sbi' ? 'transparent' : bank.color 
                                    }}
                                  >
                                    {renderBankLogo(bank)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-black text-sm">{bank.name}</p>
                                    <p className="text-xs text-black">{bank.code}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {!showBankList && (
                              <button
                                onClick={() => setShowBankList(true)}
                                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
                              >
                                View All Banks ({netBankingBanks.length - 12} more)
                              </button>
                            )}
                            
                            {showBankList && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {netBankingBanks.slice(12).map((bank) => (
                                    <div
                                      key={bank.id}
                                      onClick={() => setSelectedBank(bank.id)}
                                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
                                    >
                                      <div 
                                        className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${
                                          bank.logoStyle === 'sbi' ? 'bg-gradient-to-r from-blue-900 to-blue-700' : ''
                                        }`}
                                        style={{ 
                                          backgroundColor: bank.logoStyle === 'sbi' ? 'transparent' : bank.color 
                                        }}
                                      >
                                        {renderBankLogo(bank)}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-black text-sm">{bank.name}</p>
                                        <p className="text-xs text-black">{bank.code}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setShowBankList(false)}
                                  className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  Show Less
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${
                                    netBankingBanks.find(b => b.id === selectedBank)?.logoStyle === 'sbi' ? 'bg-gradient-to-r from-blue-900 to-blue-700' : ''
                                  }`}
                                  style={{ 
                                    backgroundColor: netBankingBanks.find(b => b.id === selectedBank)?.logoStyle === 'sbi' 
                                      ? 'transparent' 
                                      : (netBankingBanks.find(b => b.id === selectedBank)?.color || '#6B7280')
                                  }}
                                >
                                  {renderBankLogo(netBankingBanks.find(b => b.id === selectedBank) || { logoStyle: 'default', logoText: 'Bank', color: '#6B7280' })}
                                </div>
                                <div>
                                  <p className="font-medium text-black">
                                    {netBankingBanks.find(b => b.id === selectedBank)?.name}
                                  </p>
                                  <p className="text-sm text-black">
                                    {netBankingBanks.find(b => b.id === selectedBank)?.code}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedBank('')}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Change Bank
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                            setSelectedBank('');
                            setShowBankList(false);
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (isNetBankingValid()) {
                              setShowPaymentFormPopup(false);
                            }
                          }}
                          disabled={!isNetBankingValid()}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                            isNetBankingValid()
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                }

                // Digital Wallet Form
                if (selectedMethod.id === 'wallet') {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Choose your preferred digital wallet for instant payment. You&apos;ll receive a payment notification on your selected wallet app.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        {digitalWallets.map((wallet) => (
                          <div
                            key={wallet.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedWallet === wallet.id
                                ? 'border-green-500 bg-green-100'
                                : 'border-gray-200 hover:border-green-300 bg-white'
                            }`}
                            onClick={() => setSelectedWallet(selectedWallet === wallet.id ? '' : wallet.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold ${
                                    selectedWallet === wallet.id ? 'ring-2 ring-green-500' : ''
                                  }`}
                                  style={{ 
                                    backgroundColor: wallet.color
                                  }}
                                >
                                  {renderWalletLogo(wallet)}
                                </div>
                                <div>
                                  <p className="font-medium text-black">{wallet.name}</p>
                                  <p className="text-sm text-black">
                                    {wallet.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Instant
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {selectedWallet === wallet.id && (
                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                            setSelectedWallet('');
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (isDigitalWalletValid()) {
                              setShowPaymentFormPopup(false);
                            }
                          }}
                          disabled={!isDigitalWalletValid()}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                            isDigitalWalletValid()
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                }

                // EMI Form
                if (selectedMethod.id === 'emi') {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Choose an EMI plan to pay in easy monthly installments with 0% interest.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        {emiLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-black">Loading EMI plans...</p>
                          </div>
                        ) : emiPlans.length > 0 ? (
                          emiPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedEMI?.id === plan.id
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-200 hover:border-blue-300 bg-white'
                              }`}
                              onClick={() => setSelectedEMI(selectedEMI?.id === plan.id ? null : plan)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-black">{plan.bank}</h4>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {plan.bankCode}
                                    </span>
                                  </div>
                                  <p className="text-sm text-black mb-1">{plan.tenure} months EMI</p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-green-600 font-medium">
                                      {plan.interest === 0 ? '0% Interest EMI' : `${plan.interest}% p.a.`}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-medium text-black text-lg">
                                    {formatCurrency(plan.emiAmount)}/month
                                  </p>
                                  <p className="text-sm text-black">
                                    Total: {formatCurrency(plan.totalAmount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-black">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium mb-1">No EMI options available</p>
                            <p className="text-xs text-black">
                              Minimum amount for EMI is ₹3,000
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                            setSelectedEMI(null);
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedEMI) {
                              setShowPaymentFormPopup(false);
                            }
                          }}
                          disabled={!selectedEMI}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                            selectedEMI
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                }

                // BNPL Form
                if (selectedMethod.id === 'bnpl') {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Choose a BNPL provider to pay later with flexible options.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        {bnplOptions.length > 0 ? (
                          bnplOptions.map((option) => (
                            <div
                              key={option.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedBNPL?.id === option.id
                                  ? 'border-purple-500 bg-purple-100'
                                  : 'border-gray-200 hover:border-purple-300 bg-white'
                              }`}
                              onClick={() => setSelectedBNPL(selectedBNPL?.id === option.id ? null : option)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-black">{option.name}</h4>
                                  <p className="text-sm text-black mt-1">{option.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Credit Limit: {formatCurrency(option.creditLimit)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-sm text-black">Provider</p>
                                  <p className="font-medium text-black">{option.provider}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-black">
                            No BNPL options available for this amount
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                            setSelectedBNPL(null);
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedBNPL) {
                              setShowPaymentFormPopup(false);
                            }
                          }}
                          disabled={!selectedBNPL}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                            selectedBNPL
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                }

                // COD Form
                if (selectedMethod.id === 'cod') {
                  return (
                    <div>
                      <p className="text-sm text-black mb-6">
                        Pay with cash when you receive your order. No additional charges.
                      </p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Shield className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Cash on Delivery</p>
                            <p className="text-sm text-green-700">Pay when you receive your order</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                            setSelectedPaymentMethod('');
                          }}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowPaymentFormPopup(false);
                          }}
                          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Bank Offers Popup */}
      {showBankOffersPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  All Bank Offers
                </h2>
                <button
                  onClick={() => setShowBankOffersPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-black mb-6">
                Select your bank to get instant discounts on your payment. Offers are automatically applied when you pay with the selected bank&apos;s card.
              </p>
              
              <div className="space-y-3">
                {availableBankOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBankOffer?.id === offer.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => {
                      setSelectedBankOffer(selectedBankOffer?.id === offer.id ? null : offer);
                      setShowBankOffersPopup(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-black text-sm">{offer.bank}</p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                            {offer.discount}% OFF
                          </span>
                          {offer.discount >= 8 && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black">{offer.description}</p>
                        <p className="text-xs text-black mt-1">
                          Min. order: {formatCurrency(offer.minAmount)} | Max. discount: {formatCurrency(offer.maxDiscount)}
                        </p>
                      </div>
                      {selectedBankOffer?.id === offer.id && (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center ml-2">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowBankOffersPopup(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 