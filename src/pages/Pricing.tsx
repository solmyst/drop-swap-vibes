import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePassBenefits } from "@/hooks/usePassBenefits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PassCard, { PassType, getPassDetails } from "@/components/PassCard";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { canPurchasePass, isUpgrade } from "@/lib/passUtils";

const buyerPasses: PassType[] = ['buyer_starter', 'buyer_basic', 'buyer_pro'];
const sellerPasses: PassType[] = ['seller_starter', 'seller_basic', 'seller_pro'];

const Pricing = () => {
  const { user } = useAuth();
  const { benefits, refreshBenefits } = usePassBenefits();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    passType: PassType | null;
  }>({ isOpen: false, passType: null });

  const activatePass = async (passType: PassType, transactionId?: string) => {
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabase
      .from('user_passes')
      .insert({
        user_id: user.id,
        pass_type: passType,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        payment_id: transactionId,
      });

    if (error) throw error;
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!paymentModal.passType) return;
    
    setLoading(paymentModal.passType);
    
    try {
      // For now, just activate the pass directly
      // TODO: Add UPI transaction recording after running database migration
      await activatePass(paymentModal.passType, transactionId);
      
      const passDetails = getPassDetails(paymentModal.passType);
      const upgradeText = isUpgrade(benefits.currentPass, paymentModal.passType) ? ' (Upgraded!)' : '';
      toast.success(`🎉 ${passDetails.name} activated successfully!${upgradeText}`);
      
      // Close modal and refresh
      setPaymentModal({ isOpen: false, passType: null });
      await refreshBenefits();
      navigate('/browse');
    } catch (error) {
      console.error('Error activating pass:', error);
      toast.error('Failed to activate pass. Please contact support with your transaction ID: ' + transactionId);
    } finally {
      setLoading(null);
    }
  };

  const handlePurchase = async (passType: PassType) => {
    console.log('Purchase clicked for:', passType);
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user can purchase this pass
    const purchaseCheck = canPurchasePass(benefits.currentPass, passType);
    if (!purchaseCheck.canPurchase) {
      toast.error(purchaseCheck.reason || 'Cannot purchase this pass');
      return;
    }

    const passDetails = getPassDetails(passType);
    console.log('Pass details:', passDetails);
    
    // Handle free pass
    if (passDetails.price === 0) {
      setLoading(passType);
      try {
        await activatePass(passType);
        toast.success(`${passDetails.name} activated! 🎉`);
        await refreshBenefits();
        navigate('/browse');
      } catch (error) {
        console.error('Error activating free pass:', error);
        toast.error('Failed to activate pass. Please try again.');
      } finally {
        setLoading(null);
      }
      return;
    }

    // Handle paid passes - Open UPI payment modal
    setPaymentModal({ isOpen: true, passType });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Choose Your Plan
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Unlock the Full <span className="text-gradient">Thrift Experience</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start with 2 free chats & 3 free listings. Upgrade when you're ready to grow!
            </p>
          </motion.div>

          {/* Free Tier Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 max-w-2xl mx-auto mb-12 text-center"
          >
            <h3 className="font-display font-bold text-lg mb-2">🎉 Free for Everyone</h3>
            <p className="text-muted-foreground mb-4">
              Every user gets <strong>2 free chats</strong> with sellers and can list <strong>3 products</strong> for free.
              No credit card required!
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>2 Free Chats</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>3 Free Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Browse Everything</span>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="buyer" className="max-w-5xl mx-auto">
            <TabsList className="w-full justify-center bg-muted rounded-xl mb-8 p-1">
              <TabsTrigger value="buyer" className="flex-1 md:flex-none rounded-lg px-8">
                🛍️ Buyer Passes
              </TabsTrigger>
              <TabsTrigger value="seller" className="flex-1 md:flex-none rounded-lg px-8">
                📦 Seller Passes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buyer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-center text-muted-foreground mb-8">
                  Chat with more sellers, negotiate prices, and access exclusive deals
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {buyerPasses.map((passType, index) => (
                    <motion.div
                      key={passType}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PassCard
                        passType={passType}
                        isActive={benefits.currentPass === passType}
                        currentPass={benefits.currentPass}
                        onSelect={() => handlePurchase(passType)}
                        loading={loading === passType}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="seller">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-center text-muted-foreground mb-8">
                  List more products, get featured placement, and grow your thrift business
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {sellerPasses.map((passType, index) => (
                    <motion.div
                      key={passType}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PassCard
                        passType={passType}
                        isActive={benefits.currentPass === passType}
                        currentPass={benefits.currentPass}
                        onSelect={() => handlePurchase(passType)}
                        loading={loading === passType}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 text-center max-w-3xl mx-auto mt-16"
          >
            <h3 className="font-display text-xl font-bold mb-6">Why Choose रीवस्त्र?</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Secure UPI Payments</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">24/7 Support</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Instant Activation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* UPI Payment Modal */}
      {paymentModal.passType && (
        <UpiPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, passType: null })}
          passType={paymentModal.passType}
          userId={user?.id || ''}
          onPaymentComplete={handlePaymentComplete}
          loading={loading === paymentModal.passType}
        />
      )}
    </div>
  );
};

export default Pricing;
