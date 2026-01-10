import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap, CreditCard, Shield, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const passes = [
  {
    id: "weekly",
    name: "Weekly Pass",
    price: 99,
    period: "week",
    icon: Zap,
    color: "from-blue-500 to-cyan-400",
    features: [
      "Unlimited seller chats",
      "View seller phone numbers",
      "Negotiate prices",
      "Priority support",
    ],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Pass",
    price: 299,
    period: "month",
    icon: Crown,
    color: "from-primary to-secondary",
    features: [
      "Everything in Weekly",
      "Early access to new drops",
      "Exclusive discounts",
      "Featured buyer badge",
      "Save 25% vs weekly",
    ],
    popular: true,
  },
  {
    id: "seller_pro",
    name: "Seller Pro",
    price: 499,
    period: "month",
    icon: Sparkles,
    color: "from-accent to-coral",
    features: [
      "Unlimited listings",
      "Featured placement",
      "Analytics dashboard",
      "Verified seller badge",
      "Priority in search results",
      "Dedicated support",
    ],
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (passId: string, price: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setLoading(passId);
    
    // Simulate payment - in production, integrate with Razorpay/Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Pass activated! 🎉 Enjoy unlimited access.");
    setLoading(null);
    navigate('/browse');
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
              Simple Pricing
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Unlock the Full <span className="text-gradient">Thrift Experience</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get unlimited access to chat with sellers, negotiate prices, and score the best deals
            </p>
          </motion.div>

          {/* Passes Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {passes.map((pass, index) => (
              <motion.div
                key={pass.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass rounded-3xl p-6 ${
                  pass.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {pass.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pass.color} flex items-center justify-center mb-4`}>
                  <pass.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-display text-xl font-bold mb-2">{pass.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold">₹{pass.price}</span>
                  <span className="text-muted-foreground">/{pass.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {pass.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pass.popular ? "hero" : "outline"}
                  className="w-full gap-2"
                  onClick={() => handlePurchase(pass.id, pass.price)}
                  disabled={loading === pass.id}
                >
                  {loading === pass.id ? (
                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Get {pass.name}
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 text-center max-w-3xl mx-auto"
          >
            <h3 className="font-display text-xl font-bold mb-6">Trusted by 50,000+ thrifters</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">24/7 Support</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Money-back Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
