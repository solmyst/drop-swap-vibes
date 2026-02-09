import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle warm gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">Discover rare finds</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="font-display text-[2.75rem] sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6"
          >
            Your closet's
            <br />
            <span className="text-gradient">next obsession.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Hunt unique pre-loved fashion. Flex your finds. 
            Join India's coolest thrift community.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/browse">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                Start Exploring
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                List for Free
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span>🔥 <strong className="text-foreground">1.2K+</strong> items listed</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>💬 <strong className="text-foreground">500+</strong> deals made</span>
            <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="hidden sm:inline">♻️ <strong className="text-foreground">Zero</strong> waste</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
