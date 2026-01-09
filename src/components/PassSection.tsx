import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const passes = [
  {
    id: "weekly",
    name: "Weekly Pass",
    price: 49,
    period: "7 days",
    icon: Zap,
    color: "from-primary to-primary/60",
    features: [
      "Unlimited chats with sellers",
      "View seller contact details",
      "Priority support",
    ],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Pass",
    price: 149,
    period: "30 days",
    icon: Crown,
    color: "from-secondary to-accent",
    features: [
      "Everything in Weekly",
      "Early access to new drops",
      "Exclusive deals & discounts",
      "Negotiate prices freely",
    ],
    popular: true,
  },
  {
    id: "seller",
    name: "Seller Pro",
    price: 299,
    period: "30 days",
    icon: Rocket,
    color: "from-accent to-pastelPink",
    features: [
      "Unlimited listings",
      "Featured placement",
      "Analytics dashboard",
      "Verified seller badge",
      "Priority in search",
    ],
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
            Unlock Full Access
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Get your <span className="text-gradient">thrift pass</span>
          </h2>
          <p className="text-muted-foreground">
            Connect with sellers, unlock contact details, and score the best deals with our flexible passes.
          </p>
        </motion.div>

        {/* Pass Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {passes.map((pass, index) => {
            const Icon = pass.icon;
            return (
              <motion.div
                key={pass.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-3xl p-1 ${
                  pass.popular
                    ? "bg-gradient-to-b from-primary via-secondary to-accent"
                    : "bg-border"
                }`}
              >
                {pass.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="bg-card rounded-[1.4rem] p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pass.color} flex items-center justify-center mb-6`}
                  >
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Name & Price */}
                  <h3 className="font-display font-bold text-xl mb-1">
                    {pass.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-bold text-4xl">
                      ₹{pass.price}
                    </span>
                    <span className="text-muted-foreground">/ {pass.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mt-6 mb-8 flex-1">
                    {pass.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={pass.popular ? "hero" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    Get {pass.name}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PassSection;
