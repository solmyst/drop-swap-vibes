import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const buyerPasses = [
  {
    name: "Starter",
    price: 20,
    period: "30 days",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-400",
    features: ["Chat with 2 sellers", "Negotiate prices"],
    popular: false,
  },
  {
    name: "Basic",
    price: 50,
    period: "30 days",
    icon: Zap,
    color: "from-primary to-secondary",
    features: ["Chat with 4 sellers", "Early access to drops"],
    popular: true,
  },
  {
    name: "Pro",
    price: 100,
    period: "30 days",
    icon: Crown,
    color: "from-secondary to-accent",
    features: ["Unlimited chats", "View contact details"],
    popular: false,
  },
];

const sellerPasses = [
  {
    name: "Starter",
    price: 99,
    period: "30 days",
    icon: Package,
    color: "from-emerald-500 to-teal-400",
    features: ["10 product listings", "Basic analytics"],
    popular: false,
  },
  {
    name: "Basic",
    price: 199,
    period: "30 days",
    icon: Rocket,
    color: "from-accent to-coral",
    features: ["25 product listings", "Featured placement"],
    popular: true,
  },
  {
    name: "Pro",
    price: 299,
    period: "30 days",
    icon: Crown,
    color: "from-coral to-pastelPink",
    features: ["Unlimited listings", "Verified badge"],
    popular: false,
  },
];

const PassSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-4">
            <Zap className="w-4 h-4 text-primary" />
            Flexible Plans
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Get your <span className="text-gradient">thrift pass</span>
          </h2>
          <p className="text-muted-foreground">
            Start free with 2 chats & 3 listings. Upgrade when you're ready to grow!
          </p>
        </motion.div>

        {/* Buyer Passes */}
        <div className="mb-12">
          <h3 className="font-display text-xl font-bold text-center mb-6">🛍️ For Buyers</h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {buyerPasses.map((pass, index) => {
              const Icon = pass.icon;
              return (
                <motion.div
                  key={pass.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl p-1 ${
                    pass.popular
                      ? "bg-gradient-to-b from-primary via-secondary to-accent"
                      : "bg-border"
                  }`}
                >
                  {pass.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                      Popular
                    </Badge>
                  )}
                  <div className="bg-card rounded-[0.9rem] p-4 h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pass.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-display font-bold">{pass.name}</h4>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="font-display font-bold text-2xl">₹{pass.price}</span>
                      <span className="text-muted-foreground text-sm">/{pass.period}</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {pass.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Seller Passes */}
        <div className="mb-12">
          <h3 className="font-display text-xl font-bold text-center mb-6">📦 For Sellers</h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {sellerPasses.map((pass, index) => {
              const Icon = pass.icon;
              return (
                <motion.div
                  key={pass.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl p-1 ${
                    pass.popular
                      ? "bg-gradient-to-b from-primary via-secondary to-accent"
                      : "bg-border"
                  }`}
                >
                  {pass.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                      Popular
                    </Badge>
                  )}
                  <div className="bg-card rounded-[0.9rem] p-4 h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pass.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-display font-bold">{pass.name}</h4>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="font-display font-bold text-2xl">₹{pass.price}</span>
                      <span className="text-muted-foreground text-sm">/{pass.period}</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {pass.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/pricing">
            <Button variant="hero" size="lg">
              View All Plans
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PassSection;
