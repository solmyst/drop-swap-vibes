// UPI Payment utilities
import { PassType } from '@/components/PassCard';

export interface UpiPaymentOptions {
  amount: number;
  passType: PassType;
  userId: string;
}

// Your UPI ID - replace with your actual UPI ID
export const UPI_ID = import.meta.env.VITE_UPI_ID || 'yourname@paytm'; // Replace with your actual UPI ID (e.g., yourname@paytm, yourname@phonepe, etc.)

// Generate UPI deep link
export const generateUpiLink = (amount: number, passType: PassType, userId: string): string => {
  const transactionNote = `रविस्त्र ${passType.replace('_', ' ').toUpperCase()} Pass`;
  const transactionRef = `TH_${passType}_${userId.slice(0, 8)}_${Date.now()}`;
  
  // UPI deep link format
  const upiParams = new URLSearchParams({
    pa: UPI_ID, // Payee address (your UPI ID)
    pn: 'रविस्त्र', // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: transactionNote, // Transaction note
    tr: transactionRef, // Transaction reference
  });

  return `upi://pay?${upiParams.toString()}`;
};

// Validate UPI transaction ID format
export const validateUpiTransactionId = (transactionId: string): boolean => {
  // Basic validation - UPI transaction IDs are typically 12 digits
  const upiRegex = /^[0-9]{12}$/;
  return upiRegex.test(transactionId.replace(/\s/g, ''));
};

// Generate QR code data for UPI payment
export const generateUpiQrData = (amount: number, passType: PassType, userId: string): string => {
  return generateUpiLink(amount, passType, userId);
};