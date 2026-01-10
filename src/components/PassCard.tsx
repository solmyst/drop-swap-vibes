import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Sparkles, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PassType = 'free' | 'buyer_starter' | 'buyer_basic' | 'buyer_pro' | 'seller_starter' | 'seller_basic' | 'seller_pro';

interface PassCardProps {
  passType: PassType;
  isActive?: boolean;
  onSelect?: () => void;
  loading?: boolean;
  compact?: boolean;
}

const passDetails: Record<PassType, {
  name: string;
  price: number;
  period: string;
  icon: any;
  color: string;
  features: string[];
  popular: boolean;
  category: 'buyer' | 'seller' | 'free';
}> = {
  free: {
    name: "Free Tier",
    price: 0,
    period: "forever",
    icon: Sparkles,
    color: "from-muted to-muted-foreground/50",
    features: [
      "2 free chats with sellers",
      "3 free product listings",
      "Browse all items",
    ],
    popular: false,
    category: 'free',
  },
  buyer_starter: {
    name: "Buyer Starter",
    price: 20,
    period: "30 days",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-400",
    features: [
      "Chat with 2 sellers",
      "Negotiate prices",
      "Priority support",
    ],
    popular: false,
    category: 'buyer',
  },
  buyer_basic: {
    name: "Buyer Basic",
    price: 50,
    period: "30 days",
    icon: Zap,
    color: "from-primary to-secondary",
    features: [
      "Chat with 4 sellers",
      "Negotiate prices",
      "Priority support",
      "Early access to new drops",
    ],
    popular: true,
    category: 'buyer',
  },
  buyer_pro: {
    name: "Buyer Pro",
    price: 100,
    period: "30 days",
    icon: Crown,
    color: "from-secondary to-accent",
    features: [
      "Unlimited seller chats",
      "View seller contact details",
      "Negotiate prices freely",
      "Priority support",
      "Early access to new drops",
      "Exclusive discounts",
    ],
    popular: false,
    category: 'buyer',
  },
  seller_starter: {
    name: "Seller Starter",
    price: 99,
    period: "30 days",
    icon: Package,
    color: "from-emerald-500 to-teal-400",
    features: [
      "Up to 10 product listings",
      "Unlimited buyer chats",
      "Basic analytics",
    ],
    popular: false,
    category: 'seller',
  },
  seller_basic: {
    name: "Seller Basic",
    price: 199,
    period: "30 days",
    icon: Rocket,
    color: "from-accent to-coral",
    features: [
      "Up to 25 product listings",
      "Unlimited buyer chats",
      "Featured placement",
      "Analytics dashboard",
    ],
    popular: true,
    category: 'seller',
  },
  seller_pro: {
    name: "Seller Pro",
    price: 299,
    period: "30 days",
    icon: Sparkles,
    color: "from-coral to-pastelPink",
    features: [
      "Unlimited listings",
      "Unlimited buyer chats",
      "Featured placement",
      "Full analytics dashboard",
      "Verified seller badge",
      "Priority in search results",
    ],
    popular: false,
    category: 'seller',
  },
};

export const getPassDetails = (passType: PassType) => passDetails[passType];

const PassCard = ({ passType, isActive, onSelect, loading, compact }: PassCardProps) => {
  const pass = passDetails[passType];
  const Icon = pass.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pass.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{pass.name}</span>
            {isActive && <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">₹{pass.price}/{pass.period}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`relative glass rounded-3xl p-6 ${pass.popular ? 'ring-2 ring-primary' : ''} ${isActive ? 'ring-2 ring-green-500' : ''}`}
    >
      {pass.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-green-500 text-white">Current Plan</Badge>
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pass.color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
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

      {onSelect && (
        <Button
          variant={pass.popular ? "hero" : "outline"}
          className="w-full gap-2"
          onClick={onSelect}
          disabled={loading || isActive}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : isActive ? (
            "Current Plan"
          ) : (
            `Get ${pass.name}`
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default PassCard;
