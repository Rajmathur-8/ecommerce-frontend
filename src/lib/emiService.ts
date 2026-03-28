// EMI Service for genuine bank integration
export interface EMIPlan {
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



// Bank configurations are now handled by the backend

class EMIService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://e-commerce-backend-gw8o.onrender.com/api';
  }

  private async callBackendAPI<T = unknown>(endpoint: string, options: RequestInit = {}, skipAuth: boolean = false): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
    try {
      // Check if we're on the client side before accessing localStorage
      const token = typeof window !== 'undefined' && !skipAuth ? localStorage.getItem('authToken') : null;
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      });

      // Clone response for error handling (response body can only be read once)
      const responseClone = response.clone();
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }



  async getEMIPlans(amount: number, cardType: 'credit' | 'debit' = 'credit'): Promise<EMIPlan[]> {
    try {
      // Skip authentication for getting EMI plans (public endpoint)
      const response = await this.callBackendAPI<{ plans: EMIPlan[] }>(`/web/emi/plans?amount=${amount}&cardType=${cardType}`, {}, true);
      
      if (response.success && response.data?.plans) {
        return response.data.plans;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async validateEMIEligibility(
    bankCode: string, 
    amount: number, 
    cardNumber: string, 
    customerDetails: { name: string; email: string; phone: string }
  ): Promise<{ eligible: boolean; message: string; plan?: EMIPlan }> {
    try {
      const response = await this.callBackendAPI<{ eligible: boolean; message: string }>('/web/emi/validate', {
        method: 'POST',
        body: JSON.stringify({
          bankCode,
          amount,
          cardNumber,
          customerDetails
        })
      });
      
      if (response.success && response.data?.eligible) {
        const plan = await this.getEMIPlans(amount);
        const selectedPlan = plan.find(p => p.bankCode === bankCode);
        
        return {
          eligible: true,
          message: response.data.message || 'EMI eligible',
          plan: selectedPlan
        };
      } else {
        return {
          eligible: false,
          message: response.data?.message || 'EMI not eligible for this transaction'
        };
      }
    } catch (error) {
      return {
        eligible: false,
        message: 'Unable to verify EMI eligibility at this time'
      };
    }
  }

  async processEMIPayment(
    planId: string,
    amount: number,
    customerDetails: { name: string; email: string; phone: string },
    orderId: string
  ): Promise<{ success: boolean; razorpayOrderId?: string; message: string }> {
    try {
      const response = await this.callBackendAPI<{ razorpayOrderId: string; message: string }>('/web/emi/process', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          amount,
          customerDetails,
          orderId,
          cardDetails: {
            // Card details will be collected by Razorpay
            number: '',
            expiry: '',
            cvv: '',
            name: customerDetails.name
          }
        })
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          razorpayOrderId: response.data.razorpayOrderId,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.message || 'EMI payment processing failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Unable to process EMI payment at this time'
      };
    }
  }
}

export const emiService = new EMIService();
