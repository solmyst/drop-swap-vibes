import { Instagram, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ASSETS } from "@/lib/assets";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 pt-12 pb-24 md:pb-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={ASSETS.logo} alt="रीवस्त्र" className="w-8 h-8 rounded-lg" />
              <span className="font-display font-bold text-base">रीवस्त्र</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              India's social thrift marketplace. Discover, sell, and connect.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2">
              {[
                { to: "/browse", label: "Discover" },
                { to: "/store", label: "Store" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Sell</h4>
            <ul className="space-y-2">
              {[
                { to: "/upload", label: "List an Item" },
                { to: "/terms", label: "Guidelines" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display font-semibold text-sm mb-3">Stay updated</h4>
            <p className="text-xs text-muted-foreground mb-3">New drops & deals in your inbox.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="email@example.com" className="bg-background border-border text-sm h-9" />
              <Button size="sm" variant="default" className="h-9 px-3">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2025 रीवस्त्र. Sustainable fashion for all.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:revastraaa@gmail.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
