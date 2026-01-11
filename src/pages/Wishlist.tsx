import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: { 
    name: string; 
    avatar: string; 
    verified: boolean;
  };
  condition: string;
  size: string;
  category: string;
}

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      setLoading(true);

      const { data: wishlist, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          listing:listings(
            id,
            title,
            price,
            images,
            condition,
            size,
            category,
            seller_id
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        setLoading(false);
        return;
      }

      // Fetch seller profiles for each listing
      const items = await Promise.all(
        (wishlist || [])
          .filter(w => w.listing)
          .map(async (w) => {
            const listing = w.listing as {
              id: string;
              title: string;
              price: number;
              images: string[];
              condition: string;
              size: string;
              category: string;
              seller_id: string;
            };
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url, is_verified')
              .eq('user_id', listing.seller_id)
              .maybeSingle();

            return {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              image: listing.images?.[0] || '/placeholder.svg',
              seller: {
                name: profile?.username || 'User',
                avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller_id}`,
                verified: profile?.is_verified || false,
              },
              condition: listing.condition,
              size: listing.size,
              category: listing.category,
            };
          })
      );

      setWishlistItems(items);
      setLoading(false);
    };

    fetchWishlist();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Your <span className="text-gradient">Wishlist</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              {wishlistItems.length} items saved for later
            </p>
          </motion.div>

          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start exploring and save your favorite thrift finds! They'll appear here for easy access.
              </p>
              <Link to="/browse">
                <Button variant="hero" size="lg" className="gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Start Browsing
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
