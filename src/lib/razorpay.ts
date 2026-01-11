// Razorpay integration utilities
import { PassType } from '@/components/PassCard';

export interface PaymentOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    passType: PassType;
    userId: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890';
export const RAZORPAY_MODE = import.meta.env.VITE_RAZORPAY_MODE || 'test';

// Create Razorpay order
export const createRazorpayOrder = async (options: PaymentOptions) => {
  // Since we don't have a backend, we'll create a client-side order
  // In a production app with sensitive data, you should use a backend API
  
  // Generate a unique order ID
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  return {
    id: orderId,
    amount: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    status: 'created',
    notes: options.notes,
  };
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = (
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    notes: {
      passType: PassType;
      userId: string;
    };
  },
  passType: PassType,
  userEmail: string,
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: { error: string }) => void
) => {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'रीवस्त्र',
    description: `${passType.replace('_', ' ').toUpperCase()} Pass`,
    order_id: order.id,
    handler: onSuccess,
    prefill: {
      email: userEmail,
    },
    theme: {
      color: '#22C55E', // Primary color
    },
    modal: {
      ondismiss: () => {
        onFailure({ error: 'Payment cancelled by user' });
      },
    },
  };

  // Check if Razorpay is loaded
  if (typeof window !== 'undefined' && (window as { Razorpay?: new (options: unknown) => { open: () => void } }).Razorpay) {
    try {
      const rzp = new (window as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      onFailure({ error: 'Failed to initialize payment' });
    }
  } else {
    console.error('Razorpay SDK not loaded');
    onFailure({ error: 'Payment system not available. Please refresh and try again.' });
  }
};

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};