import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Your wardrobe upgrade
            <br />
            <span className="text-gradient">starts here.</span>
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            List for free. Discover rare pieces. Connect with sellers directly. No fees, no friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/browse">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Explore Drops
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Start Selling
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
