import { getApiBaseUrl } from '../utils/apiUrl';

const API_BASE_URL = getApiBaseUrl();

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentStatusResponse {
  status: string;
  amount: number;
  currency: string;
  order: any;
}

export const paymentAPI = {
  /**
   * Create a payment intent
   */
  createPaymentIntent: async (
    amount: number,
    currency: string = 'idr',
    customerEmail: string,
    customerName: string,
    orderId?: string,
    country?: string
  ): Promise<PaymentIntentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency,
        customerEmail,
        customerName,
        orderId,
        country,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  },

  /**
   * Confirm payment after Stripe processing
   */
  confirmPayment: async (paymentIntentId: string) => {
    const response = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm payment');
    }

    return response.json();
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentIntentId: string): Promise<PaymentStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/payment-status/${paymentIntentId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment status');
    }

    return response.json();
  },
};
