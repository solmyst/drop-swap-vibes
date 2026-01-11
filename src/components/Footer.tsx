import { motion } from "framer-motion";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ASSETS } from "@/lib/assets";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img 
                  src={ASSETS.logo} 
                  alt="रीवस्त्र Logo" 
                  className="w-10 h-10"
                />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-gradient">रीवस्त्र</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The marketplace for pre-loved fashion. Drip different, shop sustainable.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Youtube, href: "#", label: "YouTube" }
              ].map(({ Icon, href, label }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse All
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-display font-semibold mb-4">Sell</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/upload"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Start Selling
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Seller Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing Tips
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Seller Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display font-semibold mb-4">Stay in the loop</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about hot drops & exclusive deals.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-muted border-0"
              />
              <Button variant="default" size="icon">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 रीवस्त्र. Made with 💚 for sustainable fashion.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:revastraaa@gmail.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
