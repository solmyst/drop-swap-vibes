import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Copy, Check, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PassType, getPassDetails } from '@/components/PassCard';
import { generateUpiLink, validateUpiTransactionId, UPI_ID } from '@/lib/upiPayment';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  passType: PassType;
  userId: string;
  onPaymentComplete: (transactionId: string) => void;
  loading?: boolean;
}

const UpiPaymentModal = ({ 
  isOpen, 
  onClose, 
  passType, 
  userId, 
  onPaymentComplete, 
  loading 
}: UpiPaymentModalProps) => {
  const [step, setStep] = useState<'payment' | 'verification'>('payment');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  const passDetails = getPassDetails(passType);
  const upiLink = generateUpiLink(passDetails.price, passType, userId);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy UPI ID');
    }
  };

  const handlePayNow = () => {
    // Try to open UPI app
    window.open(upiLink, '_blank');
    setStep('verification');
  };

  const handleVerifyPayment = () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }

    if (!validateUpiTransactionId(transactionId)) {
      toast.error('Please enter a valid 12-digit transaction ID');
      return;
    }

    onPaymentComplete(transactionId.trim());
  };

  const handleClose = () => {
    setStep('payment');
    setTransactionId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl p-6 w-full max-w-md glass"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">UPI Payment</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Pass Details */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted mb-6">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${passDetails.color} flex items-center justify-center`}>
            <passDetails.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{passDetails.name}</h3>
            <p className="text-lg font-bold text-primary">₹{passDetails.price}</p>
          </div>
        </div>

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Pay via UPI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Pay Now" to open your UPI app with pre-filled payment details
              </p>
            </div>

            {/* UPI ID Display */}
            <div className="p-4 rounded-xl border bg-muted/50">
              <Label className="text-xs text-muted-foreground">Pay to UPI ID:</Label>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-sm">{UPI_ID}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUpiId}
                  className="h-8 px-2"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₹{passDetails.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Note:</span>
                <span>रीवस्त्र {passType.replace('_', ' ').toUpperCase()} Pass</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button 
              onClick={handlePayNow}
              className="w-full gap-2"
              variant="hero"
            >
              <Smartphone className="w-4 h-4" />
              Pay ₹{passDetails.price} via UPI
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This will open your UPI app (PhonePe, Paytm, GPay, etc.) with pre-filled payment details
            </p>
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Payment Verification</h3>
              <p className="text-sm text-muted-foreground">
                After completing the payment, enter your 12-digit transaction ID below
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="transactionId">UPI Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="e.g., 123456789012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                maxLength={12}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                You can find this in your UPI app's transaction history
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('payment')}
                className="flex-1"
              >
                Back to Payment
              </Button>
              <Button 
                onClick={handleVerifyPayment}
                disabled={loading || !transactionId.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Activate'
                )}
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Your pass will be activated immediately after verification. 
                Please ensure you've completed the payment before clicking verify.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UpiPaymentModal;