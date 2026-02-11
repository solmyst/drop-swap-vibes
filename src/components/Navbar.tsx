import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MessageCircle, Plus, Menu, X, User, LogOut, ShoppingBag, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { ASSETS } from "@/lib/assets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Top Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={ASSETS.logo} 
                alt="रीवस्त्र" 
                className="w-9 h-9 rounded-lg"
              />
              <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
                रीवस्त्र
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Compass className="w-4 h-4" />
                  Discover
                </Button>
              </Link>
              <Link to="/store">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Heart className="w-4 h-4" />
                  Saved
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground relative">
                  <MessageCircle className="w-4 h-4" />
                  Inbox
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/upload" className="hidden sm:block">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Sell
                </Button>
              </Link>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="cursor-pointer">
                        <Heart className="w-4 h-4 mr-2" />
                        Saved
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <MobileNavItem to="/" icon={Home} label="Home" active={location.pathname === '/'} />
          <MobileNavItem to="/browse" icon={Compass} label="Discover" active={location.pathname === '/browse'} />
          
          {/* Elevated Sell Button */}
          <Link to="/upload" className="relative -mt-5">
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow"
            >
              <Plus className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          </Link>
          
          <MobileNavItem to="/messages" icon={MessageCircle} label="Inbox" active={location.pathname === '/messages'} badge={unreadCount} />
          <MobileNavItem to={user ? "/profile" : "/auth"} icon={User} label={user ? "Profile" : "Sign In"} active={location.pathname === '/profile'} />
        </div>
      </div>
    </>
  );
};

const MobileNavItem = ({ to, icon: Icon, label, active, badge }: { to: string; icon: React.ElementType; label: string; active: boolean; badge?: number }) => (
  <Link to={to} className="flex flex-col items-center gap-0.5 min-w-[48px] relative">
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
    <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
      {label}
    </span>
    {badge && badge > 0 && (
      <span className="absolute -top-1 left-1/2 w-5 h-5 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground font-bold">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </Link>
);

export default Navbar;
