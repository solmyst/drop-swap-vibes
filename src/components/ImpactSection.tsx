import { motion } from "framer-motion";
import { Leaf, Recycle, Heart, Users } from "lucide-react";

const stats = [
  {
    icon: Leaf,
    value: "2.5M+",
    label: "Kg CO₂ Saved",
    color: "text-primary",
  },
  {
    icon: Recycle,
    value: "120K",
    label: "Items Recycled",
    color: "text-secondary",
  },
  {
    icon: Heart,
    value: "50K+",
    label: "Happy Thrifters",
    color: "text-accent",
  },
  {
    icon: Users,
    value: "10K",
    label: "Active Sellers",
    color: "text-coral",
  },
];

const ImpactSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-muted/30" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-4">
            <Leaf className="w-4 h-4 text-primary" />
            Sustainability First
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Fashion that <span className="text-gradient">doesn't cost</span> the earth
          </h2>
          <p className="text-muted-foreground">
            Every thrifted piece is a step towards sustainable fashion. Join our community in making a real difference.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="font-display font-bold text-3xl md:text-4xl mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
