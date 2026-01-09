import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MessageCircle, Plus, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center"
            >
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </motion.div>
            <span className="font-display font-bold text-xl hidden sm:block">
              thrift<span className="text-gradient">ly</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/browse">
              <Button variant="ghost" className="gap-2">
                <Search className="w-4 h-4" />
                Browse
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="ghost" className="gap-2">
                <Heart className="w-4 h-4" />
                Wishlist
              </Button>
            </Link>
            <Link to="/messages">
              <Button variant="ghost" className="gap-2 relative">
                <MessageCircle className="w-4 h-4" />
                Messages
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground font-bold">
                  3
                </span>
              </Button>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/upload" className="hidden sm:block">
              <Button variant="neon" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Sell
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="glass" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link to="/browse" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Search className="w-5 h-5" />
                  Browse
                </Button>
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Heart className="w-5 h-5" />
                  Wishlist
                </Button>
              </Link>
              <Link to="/messages" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </Button>
              </Link>
              <Link to="/upload" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" className="w-full justify-start gap-3 mt-2">
                  <Plus className="w-5 h-5" />
                  Sell Your Clothes
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
