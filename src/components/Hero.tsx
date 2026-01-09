import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Leaf, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">The Gen-Z Thrift Revolution</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            Drip different.
            <br />
            <span className="text-gradient">Thrift smart.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Buy & sell pre-loved fashion with zero waste energy. 
            Join 50K+ thrift lovers finding their next favorite fit.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/browse">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Start Browsing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Sell Your Clothes
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { icon: TrendingUp, value: "50K+", label: "Active Users" },
              { icon: Leaf, value: "120K", label: "Items Saved" },
              { icon: Sparkles, value: "₹5L+", label: "Saved on Fashion" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-4"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-1/3 hidden lg:block"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/20 rotate-12" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-16 top-1/2 hidden lg:block"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm border border-secondary/20" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-1/4 bottom-1/4 hidden lg:block"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur-sm border border-accent/20 -rotate-12" />
      </motion.div>
    </section>
  );
};

export default Hero;
