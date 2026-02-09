import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Discover", path: "/browse" },
    { icon: Plus, label: "Sell", path: "/upload", elevated: true },
    { icon: MessageCircle, label: "Inbox", path: "/messages" },
    { icon: User, label: "Profile", path: user ? "/profile" : "/auth" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-end justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.elevated) {
            // 🔥 ELEVATED SELL BUTTON - Makes sellers feel powerful
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="sell-btn-elevated"
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="text-[10px] font-medium text-muted-foreground mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 px-3 touch-target relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;